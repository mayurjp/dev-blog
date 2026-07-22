---
layout: post
title: "ASP.NET WebAPI: Why Does the Authorized Endpoint Return 401 When the Token Is Valid?"
description: "A scenario-based debugging walkthrough: a JWT-protected WebAPI endpoint rejects every request with 401 even though the same token works against the identity server's introspection endpoint. The root cause is misordered middleware — authentication runs before the JWT bearer handler has been registered. Trace the fix through middleware order, Minimal API vs controller divergence, and capture the pipeline with IStartupFilter."
date: 2026-08-23 09:00:00 +0530
categories: aspnet-webapi
order: 91
tags: [aspnet-webapi, troubleshooting, debugging, authentication, jwt, middleware]
---

## The symptom

> "Every request to `/api/orders` returns 401 Unauthorized. The JWT token is valid — I verified it against the identity server. Other endpoints in the same app work fine."

The endpoint:

```csharp
[Authorize]
[ApiController]
[Route("api/orders")]
public class OrdersController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get() { ... }
}
```

The JWT token decodes correctly, the signature is valid, the expiration is in the future, and the audience matches.

## Reproduce

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = "https://identity.example.com";
        options.Audience = "my-api";
        options.TokenValidationParameters.ValidateIssuer = true;
        options.TokenValidationParameters.ValidateAudience = true;
        options.TokenValidationParameters.ValidateLifetime = true;
    });

var app = builder.Build();

app.UseRouting();        // middleware A
app.UseAuthentication(); // middleware B
app.UseAuthorization();  // middleware C
app.MapControllers();    // middleware D  << controller registered HERE
app.Run();
```

```bash
curl -H "Authorization: Bearer eyJhbGciOiJSUzI1Ni..." http://localhost:5000/api/orders
# => 401 Unauthorized
```

## The root cause

### 1. `MapControllers` is after `UseAuthentication`

Notice the order in `Program.cs`:

```
UseRouting → UseAuthentication → UseAuthorization → MapControllers
```

`MapControllers` is the middleware that routes to controller actions. But the JWT bearer handler — the component that validates the token and sets `HttpContext.User` — only runs when an endpoint's metadata requires authentication. It inspects the endpoint metadata **at the point where the middleware runs**.

The problem: when `UseAuthentication` executes, the routing middleware has not yet matched the request to the `OrdersController` endpoint. The middleware pipeline walks through each registered middleware in sequence:

1. `UseRouting` — matches the URL but does NOT set the matched endpoint on `HttpContext` until the pipeline unwinds
2. `UseAuthentication` — checks `HttpContext` for the current endpoint; the endpoint is not yet final
3. `UseAuthorization` — same problem; no endpoint metadata to check
4. `MapControllers` — actually dispatches the request to the controller

By the time the request reaches the controller action with the `[Authorize]` attribute, `UseAuthentication` and `UseAuthorization` have already passed without doing anything useful. The framework then processes the `[Authorize]` attribute and finds no principal — so it returns 401.

### 2. Minimal APIs vs controllers

Notice that the user said *other endpoints work fine*. That is because minimal APIs register endpoints directly in the pipeline:

```csharp
app.MapGet("/ping", () => "OK").RequireAuthorization();
```

A minimal API with `.RequireAuthorization()` registers the endpoint metadata *at the point of calling `MapGet`*, which happens before `app.Run()`. The `UseAuthentication` middleware can see the endpoint metadata because it is already registered in the `EndpointDataSource`.

Minimal API endpoints are available from the moment `app.Build()` completes. Controller endpoints are discovered and registered by `MapControllers()`, which runs **inside the request pipeline** — so they are not visible to earlier middleware.

### 3. Confirm with endpoint metadata inspection

Add temporary logging to see what endpoint is detected:

```csharp
app.Use(async (context, next) =>
{
    var endpoint = context.GetEndpoint();
    Console.WriteLine($"Endpoint: {endpoint?.DisplayName ?? "null"}");
    Console.WriteLine($"Has [Authorize]: {endpoint?.Metadata.GetMetadata<IAuthorizeData>() != null}");
    await next();
});
```

At the point right before `UseAuthentication`, you will see `Endpoint: null` for controller routes and `Endpoint: HTTP: GET /ping` for minimal API routes.

## The fix

Move `app.MapControllers()` before `UseAuthentication`:

```csharp
var app = builder.Build();

app.UseRouting();
app.MapControllers();        // ← register controller endpoints HERE
app.UseAuthentication();     // ← Authentication middleware can now see controller endpoints
app.UseAuthorization();

app.Run();
```

Now when `UseAuthentication` runs, the `EndpointDataSource` already contains all controller routes. The JWT bearer handler sees the `[Authorize]` metadata on the matched endpoint, validates the token, sets `HttpContext.User`, and the authorization middleware then checks the user's claims against the policy.

## Deeper checks for production

1. **Always register endpoints before UseAuthentication/UseAuthorization** — the two-line rule: `UseRouting()` → endpoint registration (`MapControllers`, `MapGet`, `MapHealthChecks`) → `UseAuthentication()` → `UseAuthorization()`.

2. **Use `IStartupFilter` to verify pipeline order** — add a startup filter that logs the middleware order:
```csharp
public class PipelineDebugFilter : IStartupFilter
{
    public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next)
    {
        return app =>
        {
            app.Use(async (context, next) =>
            {
                var endpoint = context.GetEndpoint();
                Console.WriteLine($"[{DateTime.UtcNow:O}] {context.Request.Method} {context.Request.Path} -> {endpoint?.DisplayName ?? "no endpoint"}");
                await next();
            });
            next(app);
        };
    }
}
```

3. **Add `builder.Services.AddAuthorization()`** — even if you are using the default policies, calling `AddAuthorization()` explicitly registers the authorization services. In some versions, skipping it causes `UseAuthorization` to silently succeed without checking anything.

4. **Check JWT bearer events** — add logging to the bearer handler's events to see *why* the token was rejected:
```csharp
options.Events = new JwtBearerEvents
{
    OnAuthenticationFailed = context =>
    {
        Console.WriteLine($"JWT auth failed: {context.Exception.Message}");
        return Task.CompletedTask;
    },
    OnChallenge = context =>
    {
        Console.WriteLine($"JWT challenge: {context.Error}, {context.ErrorDescription}");
        return Task.CompletedTask;
    }
};
```

## Prevention checklist

- [ ] Endpoints (MapControllers, MapGet, etc.) are always registered before `UseAuthentication`/`UseAuthorization`
- [ ] `AddAuthentication` and `AddAuthorization` are called during service registration
- [ ] JWT bearer events include logging for `OnAuthenticationFailed` and `OnChallenge`
- [ ] The middleware pipeline is logged at startup to verify order
- [ ] Controllers and minimal APIs are tested against the same authentication setup

## Source

- `dotnet/aspnetcore` — middleware pipeline and endpoint routing: [github.com/dotnet/aspnetcore](https://github.com/dotnet/aspnetcore)
- Auth middleware source: `dotnet/aspnetcore/src/Security/Authentication`




