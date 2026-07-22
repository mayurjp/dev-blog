---
layout: post
title: "System Design: Low-Level API Design for a Multi-Tenant SaaS Platform"
description: "A scenario-based system design post covering the low-level API design of a multi-tenant SaaS platform built with ASP.NET Core WebAPI. Topics covered: tenant isolation strategies, API versioning, rate limiting, request validation with FluentValidation, structured error responses with ProblemDetails, and middleware for tenant resolution and audit logging."
date: 2026-08-25 09:00:00 +0530
categories: aspnet-webapi
order: 4
tags: [aspnet-webapi, system-design, api-design, multi-tenant, saas]
---

## The problem

Design the API surface for a multi-tenant SaaS platform where:
- Each tenant (company) sees only its own data
- Tenants are identified by a subdomain (e.g. `acme.myapp.com`)
- The API must support versioning (v1, v2) during the migration period
- Rate limits differ by tenant plan (Free: 100 req/hr, Pro: 10,000 req/hr)
- All errors return structured RFC 7807 ProblemDetails responses
- Every API call is audit-logged with tenant ID, user ID, action, and timestamp

## 1. Tenant resolution middleware

The first middleware in the pipeline extracts the tenant ID from the host header:

```csharp
public class TenantResolutionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ITenantStore _tenantStore;

    public TenantResolutionMiddleware(RequestDelegate next, ITenantStore tenantStore)
    {
        _next = next;
        _tenantStore = tenantStore;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var host = context.Request.Host.Host;          // "acme.myapp.com"
        var subdomain = host.Split('.')[0];             // "acme"
        
        var tenant = await _tenantStore.GetBySubdomainAsync(subdomain);
        if (tenant == null)
        {
            context.Response.StatusCode = 404;
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Tenant Not Found",
                Detail = $"No tenant found for host '{host}'.",
                Status = 404,
                Type = "https://errors.myapp.com/tenant-not-found"
            });
            return;
        }

        context.Items["TenantId"] = tenant.Id;
        context.Items["TenantPlan"] = tenant.Plan;      // "Free" | "Pro" | "Enterprise"

        await _next(context);
    }
}

// Registration in Program.cs
app.UseMiddleware<TenantResolutionMiddleware>();
```

## 2. API versioning strategy

Use URL-path versioning (`/api/v1/orders`, `/api/v2/orders`) — the most explicit and cache-friendly approach.

```csharp
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(2, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ReportApiVersions = true;  // Returns api-supported-versions header
});

// v1 controller (legacy)
[ApiController]
[Route("api/v{version:apiVersion}/orders")]
[ApiVersion("1.0")]
[ApiExplorerSettings(GroupName = "v1")]
public class OrdersV1Controller : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        // Legacy response shape — flat fields, no pagination metadata
        var order = await _orderService.GetOrderV1Async(TenantId, id);
        return Ok(order);
    }
}

// v2 controller (current)
[ApiController]
[Route("api/v{version:apiVersion}/orders")]
[ApiVersion("2.0")]
[ApiExplorerSettings(GroupName = "v2")]
public class OrdersV2Controller : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<IActionResult> Get(Guid id)  // v2 uses GUIDs, not ints
    {
        var order = await _orderService.GetOrderV2Async(TenantId, id);
        return Ok(new OrderResponseV2
        {
            Id = order.Id,
            Items = order.Items,
            Total = order.Total,
            Pagination = new PaginationMeta { ... }
        });
    }
}
```

## 3. Rate limiting per tenant plan

```csharp
public class TenantRateLimitMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ICache _cache;

    private static readonly Dictionary<string, RateLimitConfig> PlanLimits = new()
    {
        ["Free"] = new RateLimitConfig(PerHour: 100),
        ["Pro"] = new RateLimitConfig(PerHour: 10_000),
        ["Enterprise"] = new RateLimitConfig(PerHour: 100_000),
    };

    public async Task InvokeAsync(HttpContext context)
    {
        var tenantId = context.Items["TenantId"] as string;
        var tenantPlan = context.Items["TenantPlan"] as string;
        var limitConfig = PlanLimits.GetValueOrDefault(tenantPlan);

        if (limitConfig == null) { await _next(context); return; }

        var key = $"ratelimit:{tenantId}:{DateTime.UtcNow:yyyy-MM-dd-HH}";
        var currentCount = await _cache.IncrementAsync(key, 1);
        await _cache.SetExpirationAsync(key, TimeSpan.FromHours(1));

        context.Response.Headers["X-RateLimit-Limit"] = limitConfig.PerHour.ToString();
        context.Response.Headers["X-RateLimit-Remaining"] = (limitConfig.PerHour - currentCount).ToString();

        if (currentCount > limitConfig.PerHour)
        {
            context.Response.StatusCode = 429;
            context.Response.Headers["Retry-After"] = "3600";
            await context.Response.WriteAsJsonAsync(new ProblemDetails
            {
                Title = "Rate Limit Exceeded",
                Detail = $"Tenant '{tenantId}' has exceeded {limitConfig.PerHour} requests per hour.",
                Status = 429,
                Type = "https://errors.myapp.com/rate-limit-exceeded"
            });
            return;
        }

        await _next(context);
    }
}
```

## 4. Request validation with FluentValidation

```csharp
// Request DTO
public record CreateOrderRequest(
    Guid CustomerId,
    List<OrderItemRequest> Items,
    string? Notes
);

public record OrderItemRequest(string Sku, int Quantity, decimal UnitPrice);

// Validator
public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.CustomerId).NotEmpty();
        RuleFor(x => x.Items).NotEmpty().WithMessage("At least one item is required.");
        RuleForEach(x => x.Items).ChildRules(item =>
        {
            item.RuleFor(x => x.Sku).NotEmpty().MaximumLength(50);
            item.RuleFor(x => x.Quantity).InclusiveBetween(1, 100);
            item.RuleFor(x => x.UnitPrice).GreaterThan(0);
        });
        RuleFor(x => x.Notes).MaximumLength(500);
    }
}

// Action filter that runs validation automatically
public class ValidateRequestFilter : IActionFilter
{
    public void OnActionExecuting(ActionExecutingContext context)
    {
        var descriptor = context.ActionDescriptor;
        var parameters = descriptor.Parameters;

        foreach (var parameter in parameters)
        {
            var value = context.ActionArguments[parameter.Name];
            if (value == null) continue;

            var validatorType = typeof(IValidator<>).MakeGenericType(parameter.ParameterType);
            var validator = context.HttpContext.RequestServices.GetService(validatorType) as IValidator;
            if (validator == null) continue;

            var validationResult = validator.Validate(new ValidationContext<object>(value));
            if (!validationResult.IsValid)
            {
                var errors = validationResult.Errors
                    .GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

                context.Result = new BadRequestObjectResult(new ValidationProblemDetails(errors)
                {
                    Title = "Validation Failed",
                    Status = 400,
                    Type = "https://errors.myapp.com/validation-error"
                });
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext context) { }
}

// Registration
builder.Services.AddValidatorsFromAssemblyContaining<CreateOrderRequestValidator>();
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateRequestFilter>();
});
```

## 5. Structured error responses with ProblemDetails

```csharp
// Global exception handler
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken ct)
    {
        _logger.LogError(exception, "Unhandled exception for {Path}", context.Request.Path);

        var problem = new ProblemDetails
        {
            Title = "Internal Server Error",
            Detail = "An unexpected error occurred. Contact support if this persists.",
            Status = 500,
            Type = "https://errors.myapp.com/internal-error",
            Instance = context.Request.Path,
            Extensions = { ["traceId"] = context.TraceIdentifier }
        };

        context.Response.StatusCode = 500;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(problem, ct);

        return true;
    }
}

// Registration
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
```

## 6. Audit logging middleware

```csharp
public class AuditLogMiddleware
{
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context)
    {
        var tenantId = context.Items["TenantId"]?.ToString();
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var method = context.Request.Method;
        var path = context.Request.Path;
        var timestamp = DateTime.UtcNow;

        // Capture the request body for POST/PUT/PATCH
        string? requestBody = null;
        if (HttpMethods.IsPost(method) || HttpMethods.IsPut(method) || HttpMethods.IsPatch(method))
        {
            context.Request.EnableBuffering();
            using var reader = new StreamReader(context.Request.Body, leaveOpen: true);
            requestBody = await reader.ReadToEndAsync();
            context.Request.Body.Position = 0;
        }

        // Replace the response body stream to capture the response
        var originalStream = context.Response.Body;
        using var captureStream = new MemoryStream();
        context.Response.Body = captureStream;

        await _next(context);

        // Read the captured response
        context.Response.Body.Position = 0;
        string? responseBody = await new StreamReader(captureStream).ReadToEndAsync();
        context.Response.Body.Position = 0;
        await captureStream.CopyToAsync(originalStream);
        context.Response.Body = originalStream;

        // Write the audit log (async fire-and-forget to not block the response)
        var auditEntry = new AuditEntry
        {
            TenantId = tenantId,
            UserId = userId,
            Method = method,
            Path = path,
            StatusCode = context.Response.StatusCode,
            RequestBody = requestBody,
            ResponseBody = responseBody,
            Timestamp = timestamp
        };

        _ = Task.Run(() => _auditStore.WriteAsync(auditEntry));
    }
}
```

## Review checklist

- [ ] Tenant resolution runs before every other middleware — no request proceeds without a tenant identity
- [ ] API versioning is explicit in the URL path; old versions are deprecated with clear sunset headers
- [ ] Rate limits are enforced per tenant plan with proper `X-RateLimit-*` and `Retry-After` headers
- [ ] FluentValidation runs via an action filter, producing `ValidationProblemDetails` on failure
- [ ] All unhandled exceptions produce RFC 7807 `ProblemDetails` responses with a trace ID
- [ ] Audit logs capture tenant ID, user ID, action, request body, response body, and timestamp
- [ ] Response body capture does not block the response — audit writes are fire-and-forget

## Source

- ASP.NET Core ProblemDetails: [learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors#problem-details](https://learn.microsoft.com/en-us/aspnet/core/web-api/handle-errors#problem-details)
- FluentValidation: [docs.fluentvalidation.net](https://docs.fluentvalidation.net/)
- RFC 7807 Problem Details: [tools.ietf.org/html/rfc7807](https://tools.ietf.org/html/rfc7807)




