---
layout: page
title: "Aspnet Webapi Interview Questions: 25 Real-World Q&A from Production Manifests"
description: "25 interview-ready Aspnet Webapi questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/aspnet-webapi/
---

Bite-sized, standalone interview questions and answers for Aspnet Webapi. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">25</span></strong> questions shown. Filter by keyword or difficulty below.</p>

<div class="qa-toolbar" id="qa-toolbar">
  <input type="text" id="qa-search" placeholder="Filter questions by keyword…" aria-label="Filter questions" />
  <button type="button" id="qa-expand-all" class="qa-expand-btn">Expand all</button>
  <div class="qa-diff-buttons" id="qa-diff-buttons">
    <button type="button" data-diff="all" class="active">All</button>
    <button type="button" data-diff="Beginner">Beginner</button>
    <button type="button" data-diff="Intermediate">Intermediate</button>
    <button type="button" data-diff="Expert">Expert</button>
  </div>
</div>

## Topic: ASP.NET WebAPI Fundamentals (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the structural difference between Minimal APIs and Controller-based APIs in ASP.NET Core? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Minimal APIs register endpoints directly as lambda delegates using `MapGet`, `MapPost`, etc., with no controller class, no method-level attributes, and no implicit model-binding conventions — every binding parameter, filter, and metadata is declared explicitly on the handler delegate. Controller-based APIs use attributed controller classes with `[ApiController]`, `[Route]`, and `[HttpGet]` on methods, relying on convention-based model binding, automatic 400 responses, and filter pipeline integration via `ControllerBase`. Minimal APIs produce simpler startup code but sacrifice structured organization, per-action filter granularity, and the `ControllerBase` helper surface.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `WebApplication.CreateBuilder(args)` differ from the older `WebHost.CreateDefaultBuilder<Startup>()` pattern? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`CreateBuilder` returns a `WebApplicationBuilder` that merges the host-building and app-building phases into a single object — there is no separate `Startup` class, no `ConfigureServices`/`Configure` split, and the service collection is exposed directly on `builder.Services` while middleware is registered on the `WebApplication` returned by `builder.Build()`. The older pattern separated these concerns into two method groups on a `Startup` class, which made the pipeline's shape harder to trace. Both ultimately produce the same `IHost`/`IApplicationBuilder` infrastructure under the hood.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When would you choose Controllers over Minimal APIs despite the extra boilerplate? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Controllers are the better choice when you need per-action filters (e.g., `[ValidateAntiForgeryToken]` on selected endpoints only), centralized exception filtering via `[TypeFilter]` or `[ServiceFilter]`, or when your action methods share significant common logic through inheritance or `ControllerBase` helpers. Minimal APIs require per-handler middleware or custom `IEndpointFilter` implementations to replicate these patterns, which becomes cumbersome beyond ~10 endpoints.
  </div>
</div>

## Topic: Middleware & Routing (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does endpoint routing resolve which middleware runs before the endpoint handler? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`UseRouting()` places a middleware component that matches the incoming request against `RouteEndpoint` entries registered in `EndpointDataSource`, writing the match result into `HttpContext.Features` as an `IEndpointFeature`. Downstream middleware (authorization, CORS, response caching) read `HttpContext.GetEndpoint()` to make decisions, and `UseEndpoints()` dispatches to the matched endpoint's `RequestDelegate`. Middleware placed before `UseRouting()` runs for every request unconditionally; middleware after it can branch based on which endpoint was matched.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What determines the execution order of multiple middleware components? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Order is determined solely by the sequence of `app.Use(...)` calls in `Program.cs` — the first registered middleware runs on the way in and the last on the way out after `next()` returns. There is no auto-ordering or priority system; middleware like `UseAuthentication()` must appear before `UseAuthorization()` because the auth middleware populates `HttpContext.User` that the authorization middleware then checks. The `Build()` method creates a nested `RequestDelegate` chain from last-registered (innermost) to first-registered (outermost).
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `app.UseStaticFiles()` do in terms of the middleware pipeline? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It adds a terminal middleware that short-circuits the pipeline when the request path matches a physical file under `wwwroot`. If a file is found, it writes the file content directly to the response and never calls `next`, so downstream middleware (including endpoint routing) never runs. If no file matches, `UseStaticFiles` calls `next` and the request continues normally. This is why static files should be placed early in the pipeline — before routing — to avoid unnecessary processing for static asset requests.
  </div>
</div>

## Topic: Model Binding & Validation (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `[FromBody]` differ from `[FromQuery]` in binding behavior? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`[FromBody]` reads the request body using an `IInputFormatter` selected by content-type negotiation — typically `SystemTextJsonInputFormatter` for JSON — deserializing the entire stream into the parameter type. `[FromQuery]` binds individual query string parameters by name using the model-binding system's value providers, which only handle simple types and collections; complex types require `[FromQuery]` on a model class. `[FromBody]` can only bind one parameter per action because it consumes the request stream.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does FluentValidation integrate with ASP.NET Core's validation pipeline? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
FluentValidation provides an `IValidator<T>` interface whose `Validate()` method returns a `ValidationResult` with `Errors`. The `FluentValidation.AspNetCore` package registers an automatic validation filter that runs after model binding but before the action executes — it calls the registered `IValidator<T>` for the action parameter type and, on failure, short-circuits with a 400 response containing the validation errors in `ProblemDetails` format. This replaces the `[Required]`/`[StringLength]` data-annotation approach with a fluent, testable API.
  </div>
</div>

## Topic: Dependency Injection (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does scoped lifetime work per HTTP request in ASP.NET Core? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The DI container creates one `IServiceScope` per HTTP request, managed by `HttpContext.RequestServices` as the scoped service provider. When a scoped service (e.g., `AddScoped<IDbContext, AppDbContext>()`) is resolved, a new instance is created within that scope and disposed when the scope is disposed at request end. Singleton services resolve once and live for the application lifetime; transient services resolve every time they are requested, even within the same scope.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the DI container resolve open generics at runtime? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`AddScoped(typeof(IRepository<>), typeof(Repository<>))` registers an open generic — the container defers construction until resolution time, when it closes the generic with the requested type argument. When `IRepository<Customer>` is injected, the container calls `typeof(Repository<>).MakeGenericType(typeof(Customer))` to produce `Repository<Customer>`, then resolves its constructor dependencies (which themselves may be open generics). This avoids registering each closed generic individually.
  </div>
</div>

## Topic: Authentication & Authorization (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does JWT Bearer authentication validate incoming tokens without calling an external service? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`AddJwtBearer()` configures a handler that reads the `Authorization: Bearer <token>` header, parses the JWT, and validates it locally using the `TokenValidationParameters` — signature verification via the issuer's JWKS endpoint (cached for `AutomaticRefreshInterval`), issuer/audience matching, lifetime checks (`exp`, `nbf`), and signing key rotation. No outbound call is made on every request because the public keys are fetched once and cached. The handler populates `HttpContext.User` with a `ClaimsPrincipal` if validation succeeds.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does policy-based authorization differ from role-based checks? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Policy-based authorization decouples the authorization logic from the role name — a policy (e.g., `"RequireAdmin"`) is defined in `Program.cs` with `AddPolicy("RequireAdmin", p => p.RequireRole("Admin").RequireClaim("tenant"))` and applied via `[Authorize(Policy = "RequireAdmin")]`. The policy evaluates one or more `IAuthorizationRequirement` instances via registered `IAuthorizationHandler` classes, which examine claims, roles, or any external state. Role-based checks (`[Authorize(Roles = "Admin")]`) are a special case of policy that only checks the role claim.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the purpose of `IClaimsTransformation` in the auth pipeline? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`IClaimsTransformation` runs after authentication but before authorization, allowing you to augment, normalize, or translate the `ClaimsPrincipal` before policies are evaluated. A common use case is translating a database-stored role lookup into additional claims — the transformation receives the current principal and returns a new principal with added claims. It runs once per request because authentication middleware calls it via `AuthenticationService`.
  </div>
</div>

## Topic: Versioning (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do URL path versioning and header versioning differ in implementation? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
URL path versioning embeds the version in the route (e.g., `/api/v1/orders`) — ASP.NET API Versioning maps the version segment using `[ApiVersion("1.0")]` on the controller and a route template `"api/v{version:apiVersion}/[controller]"`. Header versioning keeps a single URL and reads the version from a custom header (e.g., `X-API-Version: 1.0`) via `IRequestReader`; the reader extracts the version and selects the matching controller/action internally. URL versioning is visible and cache-friendly; header versioning keeps URLs stable but requires client cooperation.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does content negotiation versioning work with `IApiVersionSelector`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The client includes the API version in the `Accept` header as a custom media type parameter (`application/json;v=1.0`). ASP.NET API Versioning's `MediaTypeApiVersionReader` parses this and selects the matching controller version. If multiple versions match (e.g., a controller exists for both v1.0 and v2.0), the `IApiVersionSelector` implementation (`DefaultApiVersionSelector` picks the lowest, `LowestImplementedApiVersionSelector` picks the highest, or custom) determines which controller handles the request.
  </div>
</div>

## Topic: OpenAPI/Swagger (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Swashbuckle generate an OpenAPI document from ASP.NET Core endpoints? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`AddSwaggerGen()` registers an `ISwaggerProvider` that reflects on registered controllers/endpoints using `ApiDescriptionGroupCollectionProvider` — the same provider the runtime uses for endpoint discovery. For each action, it extracts the route template, HTTP method, parameters, and return type, then walks XML comments (if `IncludeXmlComments` is configured) for `/// <summary>` and `/// <param>` descriptions. The result is serialized as an OpenAPI 3.0 JSON document at `/swagger/v1/swagger.json`.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does NSwag server-side code generation differ from client-side codegen? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
NSwag can generate both — server-side: it reads an OpenAPI document and produces ASP.NET Core controller stubs with `[Route]`, `[HttpPost]`, and parameter binding attributes, saving manual mapping of API contracts to code. Client-side: it reads the same document and generates a typed C# HTTP client (or TypeScript, etc.) that wraps `HttpClient` calls with serialization, error handling, and cancellation token support. The server generation is typically run at build time as a `dotnet swagger tocode` command; client generation runs from a `nswag.json` config file.
  </div>
</div>

## Topic: Error Handling (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `UseExceptionHandler()` differ from `UseDeveloperExceptionPage()`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`UseDeveloperExceptionPage()` is a diagnostic middleware that captures detailed exception information — stack traces, query strings, cookies, headers — and renders an HTML page for local debugging. It must be placed early in the pipeline to catch exceptions from all downstream middleware. `UseExceptionHandler("/error")` is a production middleware that, on exception, re-executes the pipeline against a specified error endpoint path, allowing a controller action or Minimal API handler to return a consistent `ProblemDetails` JSON response instead of an HTML error page.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `ProblemDetails` represent API errors in ASP.NET Core? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ProblemDetails` is a standardized response body defined by RFC 7807 — it carries `type` (a URI identifying the error type), `title`, `status`, `detail`, and `instance` fields. `AddProblemDetails()` registers middleware that catches unhandled exceptions and maps them to `ProblemDetails` with a 500 status, logging the full exception while returning only the safe detail. Controllers can return `ValidationProblemDetails` (inherits `ProblemDetails` with `Errors` dictionary) for 422 responses automatically via `[ApiController]` when model binding fails.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What advantage does middleware-based error handling have over `IExceptionFilter`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Middleware-based error handling wraps the entire downstream pipeline, including endpoint routing, model binding, and action filters — it catches exceptions that occur before the filter pipeline even starts (e.g., a routing exception or a model-binding failure). `IExceptionFilter` only runs within the controller/action filter context and cannot catch exceptions from middleware registered before the filter pipeline. Middleware-based handling is the only way to guarantee every exception across the full request life cycle produces a consistent response.
  </div>
</div>

## Topic: Performance (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does output caching differ from response caching in ASP.NET Core? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Output caching (`[OutputCache]`) stores the fully-rendered HTTP response in-memory on the server and serves it directly from middleware, bypassing the entire controller/endpoint execution — it is server-side and configurable per endpoint with vary-by-query, vary-by-header, and sliding expiration. Response caching (`[ResponseCache]`) sets standard `Cache-Control`, `Expires`, and `Vary` headers instructing downstream caches (browser, CDN, reverse proxy) to cache the response; the server still executes every request. Output caching reduces server load; response caching reduces network round trips.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `System.Text.Json` minimize allocations in high-throughput serialization? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`System.Text.Json` operates directly on `ReadOnlySpan<byte>` / `Span<byte>` via `Utf8JsonWriter` and `Utf8JsonReader`, avoiding string allocation overhead. Source generation (`JsonSerializerContext`) pre-generates serialization code at compile time, eliminating runtime reflection. Pooling `ArrayBufferWriter<byte>` through `ArrayPool<byte>.Shared` avoids per-request buffer allocations.
  </div>
</div>

## Topic: Testing (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `WebApplicationFactory<T>` enable integration testing of the full pipeline? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`WebApplicationFactory<T>` creates an in-memory `TestServer` that hosts the full ASP.NET Core pipeline — middleware, routing, model binding, filters, and endpoint execution — using the same `Program` class as production. Tests call `factory.CreateClient()` to get an `HttpClient` pointed at this test server and issue real HTTP requests, receiving real HTTP responses. The factory allows overriding services (e.g., replacing EF Core with an in-memory provider) via `ConfigureWebHost()`, so the test exercises the real pipeline with controlled dependencies.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do you isolate integration tests when using EF Core with `WebApplicationFactory`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Override the DI registration in `ConfigureWebHost(IWebHostBuilder builder)` by calling `builder.ConfigureServices(services => { services.RemoveDbContext<AppDbContext>(); services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("TestDb")); })`. Each test creates a new factory (or resets the in-memory database via `EnsureDeleted`/`EnsureCreated`) to guarantee test isolation. The in-memory provider behaves like a real database for query and save operations but does not enforce relational constraints like foreign keys.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do you mock `HttpContext` for testing Minimal API handler logic? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
For handlers that access `HttpContext` through `IHttpContextAccessor`, mock the accessor: `mock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext())`. For handlers that receive `HttpContext` as a parameter (Minimal API delegates), create a `DefaultHttpContext` with the desired request/response properties and pass it directly. This avoids instantiating the full server pipeline for unit-level handler tests.
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 25 across Aspnet Webapi

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the structural difference between Minimal APIs and Controller-based APIs in ASP.NET Core?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Minimal APIs register endpoints directly as lambda delegates using `MapGet`, `MapPost`, etc., with no controller class, no method-level attributes, and no implicit model-binding conventions — every binding parameter, filter, and metadata is declared explicitly on the handler delegate. Controller-based APIs use attributed controller classes with `[ApiController]`, `[Route]`, and `[HttpGet]` on methods, relying on convention-based model binding, automatic 400 responses, and filter pipeline integration via `ControllerBase`. Minimal APIs produce simpler startup code but sacrifice structured organization, per-action filter granularity, and the `ControllerBase` helper surface."
      }
    },
    {
      "@type": "Question",
      "name": "How does `WebApplication.CreateBuilder(args)` differ from the older `WebHost.CreateDefaultBuilder<Startup>()` pattern?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`CreateBuilder` returns a `WebApplicationBuilder` that merges the host-building and app-building phases into a single object — there is no separate `Startup` class, no `ConfigureServices`/`Configure` split, and the service collection is exposed directly on `builder.Services` while middleware is registered on the `WebApplication` returned by `builder.Build()`. The older pattern separated these concerns into two method groups on a `Startup` class, which made the pipeline's shape harder to trace. Both ultimately produce the same `IHost`/`IApplicationBuilder` infrastructure under the hood."
      }
    },
    {
      "@type": "Question",
      "name": "When would you choose Controllers over Minimal APIs despite the extra boilerplate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Controllers are the better choice when you need per-action filters (e.g., `[ValidateAntiForgeryToken]` on selected endpoints only), centralized exception filtering via `[TypeFilter]` or `[ServiceFilter]`, or when your action methods share significant common logic through inheritance or `ControllerBase` helpers. Minimal APIs require per-handler middleware or custom `IEndpointFilter` implementations to replicate these patterns, which becomes cumbersome beyond ~10 endpoints."
      }
    },
    {
      "@type": "Question",
      "name": "How does endpoint routing resolve which middleware runs before the endpoint handler?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`UseRouting()` places a middleware component that matches the incoming request against `RouteEndpoint` entries registered in `EndpointDataSource`, writing the match result into `HttpContext.Features` as an `IEndpointFeature`. Downstream middleware (authorization, CORS, response caching) read `HttpContext.GetEndpoint()` to make decisions, and `UseEndpoints()` dispatches to the matched endpoint's `RequestDelegate`. Middleware placed before `UseRouting()` runs for every request unconditionally; middleware after it can branch based on which endpoint was matched."
      }
    },
    {
      "@type": "Question",
      "name": "What determines the execution order of multiple middleware components?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Order is determined solely by the sequence of `app.Use(...)` calls in `Program.cs` — the first registered middleware runs on the way in and the last on the way out after `next()` returns. There is no auto-ordering or priority system; middleware like `UseAuthentication()` must appear before `UseAuthorization()` because the auth middleware populates `HttpContext.User` that the authorization middleware then checks. The `Build()` method creates a nested `RequestDelegate` chain from last-registered (innermost) to first-registered (outermost)."
      }
    },
    {
      "@type": "Question",
      "name": "What does `app.UseStaticFiles()` do in terms of the middleware pipeline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It adds a terminal middleware that short-circuits the pipeline when the request path matches a physical file under `wwwroot`. If a file is found, it writes the file content directly to the response and never calls `next`, so downstream middleware (including endpoint routing) never runs. If no file matches, `UseStaticFiles` calls `next` and the request continues normally. This is why static files should be placed early in the pipeline — before routing — to avoid unnecessary processing for static asset requests."
      }
    },
    {
      "@type": "Question",
      "name": "How does `[FromBody]` differ from `[FromQuery]` in binding behavior?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`[FromBody]` reads the request body using an `IInputFormatter` selected by content-type negotiation — typically `SystemTextJsonInputFormatter` for JSON — deserializing the entire stream into the parameter type. `[FromQuery]` binds individual query string parameters by name using the model-binding system's value providers, which only handle simple types and collections; complex types require `[FromQuery]` on a model class. `[FromBody]` can only bind one parameter per action because it consumes the request stream."
      }
    },
    {
      "@type": "Question",
      "name": "How does FluentValidation integrate with ASP.NET Core's validation pipeline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FluentValidation provides an `IValidator<T>` interface whose `Validate()` method returns a `ValidationResult` with `Errors`. The `FluentValidation.AspNetCore` package registers an automatic validation filter that runs after model binding but before the action executes — it calls the registered `IValidator<T>` for the action parameter type and, on failure, short-circuits with a 400 response containing the validation errors in `ProblemDetails` format. This replaces the `[Required]`/`[StringLength]` data-annotation approach with a fluent, testable API."
      }
    },
    {
      "@type": "Question",
      "name": "How does scoped lifetime work per HTTP request in ASP.NET Core?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DI container creates one `IServiceScope` per HTTP request, managed by `HttpContext.RequestServices` as the scoped service provider. When a scoped service (e.g., `AddScoped<IDbContext, AppDbContext>()`) is resolved, a new instance is created within that scope and disposed when the scope is disposed at request end. Singleton services resolve once and live for the application lifetime; transient services resolve every time they are requested, even within the same scope."
      }
    },
    {
      "@type": "Question",
      "name": "How does the DI container resolve open generics at runtime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`AddScoped(typeof(IRepository<>), typeof(Repository<>))` registers an open generic — the container defers construction until resolution time, when it closes the generic with the requested type argument. When `IRepository<Customer>` is injected, the container calls `typeof(Repository<>).MakeGenericType(typeof(Customer))` to produce `Repository<Customer>`, then resolves its constructor dependencies (which themselves may be open generics). This avoids registering each closed generic individually."
      }
    },
    {
      "@type": "Question",
      "name": "How does JWT Bearer authentication validate incoming tokens without calling an external service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`AddJwtBearer()` configures a handler that reads the `Authorization: Bearer <token>` header, parses the JWT, and validates it locally using the `TokenValidationParameters` — signature verification via the issuer's JWKS endpoint (cached for `AutomaticRefreshInterval`), issuer/audience matching, lifetime checks (`exp`, `nbf`), and signing key rotation. No outbound call is made on every request because the public keys are fetched once and cached. The handler populates `HttpContext.User` with a `ClaimsPrincipal` if validation succeeds."
      }
    },
    {
      "@type": "Question",
      "name": "How does policy-based authorization differ from role-based checks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Policy-based authorization decouples the authorization logic from the role name — a policy (e.g., `\"RequireAdmin\"`) is defined in `Program.cs` with `AddPolicy(\"RequireAdmin\", p => p.RequireRole(\"Admin\").RequireClaim(\"tenant\"))` and applied via `[Authorize(Policy = \"RequireAdmin\")]`. The policy evaluates one or more `IAuthorizationRequirement` instances via registered `IAuthorizationHandler` classes, which examine claims, roles, or any external state. Role-based checks (`[Authorize(Roles = \"Admin\")]`) are a special case of policy that only checks the role claim."
      }
    },
    {
      "@type": "Question",
      "name": "What is the purpose of `IClaimsTransformation` in the auth pipeline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`IClaimsTransformation` runs after authentication but before authorization, allowing you to augment, normalize, or translate the `ClaimsPrincipal` before policies are evaluated. A common use case is translating a database-stored role lookup into additional claims — the transformation receives the current principal and returns a new principal with added claims. It runs once per request because authentication middleware calls it via `AuthenticationService`."
      }
    },
    {
      "@type": "Question",
      "name": "How do URL path versioning and header versioning differ in implementation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "URL path versioning embeds the version in the route (e.g., `/api/v1/orders`) — ASP.NET API Versioning maps the version segment using `[ApiVersion(\"1.0\")]` on the controller and a route template `\"api/v{version:apiVersion}/[controller]\"`. Header versioning keeps a single URL and reads the version from a custom header (e.g., `X-API-Version: 1.0`) via `IRequestReader`; the reader extracts the version and selects the matching controller/action internally. URL versioning is visible and cache-friendly; header versioning keeps URLs stable but requires client cooperation."
      }
    },
    {
      "@type": "Question",
      "name": "How does content negotiation versioning work with `IApiVersionSelector`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The client includes the API version in the `Accept` header as a custom media type parameter (`application/json;v=1.0`). ASP.NET API Versioning's `MediaTypeApiVersionReader` parses this and selects the matching controller version. If multiple versions match (e.g., a controller exists for both v1.0 and v2.0), the `IApiVersionSelector` implementation (`DefaultApiVersionSelector` picks the lowest, `LowestImplementedApiVersionSelector` picks the highest, or custom) determines which controller handles the request."
      }
    },
    {
      "@type": "Question",
      "name": "How does Swashbuckle generate an OpenAPI document from ASP.NET Core endpoints?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`AddSwaggerGen()` registers an `ISwaggerProvider` that reflects on registered controllers/endpoints using `ApiDescriptionGroupCollectionProvider` — the same provider the runtime uses for endpoint discovery. For each action, it extracts the route template, HTTP method, parameters, and return type, then walks XML comments (if `IncludeXmlComments` is configured) for `/// <summary>` and `/// <param>` descriptions. The result is serialized as an OpenAPI 3.0 JSON document at `/swagger/v1/swagger.json`."
      }
    },
    {
      "@type": "Question",
      "name": "How does NSwag server-side code generation differ from client-side codegen?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "NSwag can generate both — server-side: it reads an OpenAPI document and produces ASP.NET Core controller stubs with `[Route]`, `[HttpPost]`, and parameter binding attributes, saving manual mapping of API contracts to code. Client-side: it reads the same document and generates a typed C# HTTP client (or TypeScript, etc.) that wraps `HttpClient` calls with serialization, error handling, and cancellation token support. The server generation is typically run at build time as a `dotnet swagger tocode` command; client generation runs from a `nswag.json` config file."
      }
    },
    {
      "@type": "Question",
      "name": "How does `UseExceptionHandler()` differ from `UseDeveloperExceptionPage()`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`UseDeveloperExceptionPage()` is a diagnostic middleware that captures detailed exception information — stack traces, query strings, cookies, headers — and renders an HTML page for local debugging. It must be placed early in the pipeline to catch exceptions from all downstream middleware. `UseExceptionHandler(\"/error\")` is a production middleware that, on exception, re-executes the pipeline against a specified error endpoint path, allowing a controller action or Minimal API handler to return a consistent `ProblemDetails` JSON response instead of an HTML error page."
      }
    },
    {
      "@type": "Question",
      "name": "How does `ProblemDetails` represent API errors in ASP.NET Core?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ProblemDetails` is a standardized response body defined by RFC 7807 — it carries `type` (a URI identifying the error type), `title`, `status`, `detail`, and `instance` fields. `AddProblemDetails()` registers middleware that catches unhandled exceptions and maps them to `ProblemDetails` with a 500 status, logging the full exception while returning only the safe detail. Controllers can return `ValidationProblemDetails` (inherits `ProblemDetails` with `Errors` dictionary) for 422 responses automatically via `[ApiController]` when model binding fails."
      }
    },
    {
      "@type": "Question",
      "name": "What advantage does middleware-based error handling have over `IExceptionFilter`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Middleware-based error handling wraps the entire downstream pipeline, including endpoint routing, model binding, and action filters — it catches exceptions that occur before the filter pipeline even starts (e.g., a routing exception or a model-binding failure). `IExceptionFilter` only runs within the controller/action filter context and cannot catch exceptions from middleware registered before the filter pipeline. Middleware-based handling is the only way to guarantee every exception across the full request life cycle produces a consistent response."
      }
    },
    {
      "@type": "Question",
      "name": "How does output caching differ from response caching in ASP.NET Core?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Output caching (`[OutputCache]`) stores the fully-rendered HTTP response in-memory on the server and serves it directly from middleware, bypassing the entire controller/endpoint execution — it is server-side and configurable per endpoint with vary-by-query, vary-by-header, and sliding expiration. Response caching (`[ResponseCache]`) sets standard `Cache-Control`, `Expires`, and `Vary` headers instructing downstream caches (browser, CDN, reverse proxy) to cache the response; the server still executes every request. Output caching reduces server load; response caching reduces network round trips."
      }
    },
    {
      "@type": "Question",
      "name": "How does `System.Text.Json` minimize allocations in high-throughput serialization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`System.Text.Json` operates directly on `ReadOnlySpan<byte>` / `Span<byte>` via `Utf8JsonWriter` and `Utf8JsonReader`, avoiding string allocation overhead. Source generation (`JsonSerializerContext`) pre-generates serialization code at compile time, eliminating runtime reflection. Pooling `ArrayBufferWriter<byte>` through `ArrayPool<byte>.Shared` avoids per-request buffer allocations."
      }
    },
    {
      "@type": "Question",
      "name": "How does `WebApplicationFactory<T>` enable integration testing of the full pipeline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`WebApplicationFactory<T>` creates an in-memory `TestServer` that hosts the full ASP.NET Core pipeline — middleware, routing, model binding, filters, and endpoint execution — using the same `Program` class as production. Tests call `factory.CreateClient()` to get an `HttpClient` pointed at this test server and issue real HTTP requests, receiving real HTTP responses. The factory allows overriding services (e.g., replacing EF Core with an in-memory provider) via `ConfigureWebHost()`, so the test exercises the real pipeline with controlled dependencies."
      }
    },
    {
      "@type": "Question",
      "name": "How do you isolate integration tests when using EF Core with `WebApplicationFactory`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Override the DI registration in `ConfigureWebHost(IWebHostBuilder builder)` by calling `builder.ConfigureServices(services => { services.RemoveDbContext<AppDbContext>(); services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase(\"TestDb\")); })`. Each test creates a new factory (or resets the in-memory database via `EnsureDeleted`/`EnsureCreated`) to guarantee test isolation. The in-memory provider behaves like a real database for query and save operations but does not enforce relational constraints like foreign keys."
      }
    },
    {
      "@type": "Question",
      "name": "How do you mock `HttpContext` for testing Minimal API handler logic?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For handlers that access `HttpContext` through `IHttpContextAccessor`, mock the accessor: `mock.Setup(x => x.HttpContext).Returns(new DefaultHttpContext())`. For handlers that receive `HttpContext` as a parameter (Minimal API delegates), create a `DefaultHttpContext` with the desired request/response properties and pass it directly. This avoids instantiating the full server pipeline for unit-level handler tests."
      }
    }
  ]
}
</script>

<script>
(function () {
  var search = document.getElementById('qa-search');
  var buttons = document.getElementById('qa-diff-buttons');
  if (!search || !buttons) return;
  var activeDiff = 'all';
  function normalize(s){ return (s||'').toLowerCase(); }
  function apply() {
    var q = normalize(search.value).trim();
    var items = document.querySelectorAll('.qa-item');
    var shown = 0;
    items.forEach(function (item) {
      var txt = normalize(item.textContent);
      var diff = item.getAttribute('data-diff') || 'Intermediate';
      var okText = q === '' || txt.indexOf(q) !== -1;
      var okDiff = activeDiff === 'all' || diff === activeDiff;
      var visible = okText && okDiff;
      item.style.display = visible ? '' : 'none';
      if (visible) shown++;
    });
    var count = document.getElementById('qa-shown');
    if (count) count.textContent = shown;
  }
  search.addEventListener('input', apply);
  buttons.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    activeDiff = btn.getAttribute('data-diff');
    buttons.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    apply();
  });

  /* Accordion: click or keypress on question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
    h3.setAttribute('aria-expanded', h3.parentElement.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    e.preventDefault();
    h3.click();
  });

  /* Expand all / collapse all */
  var expandBtn = document.getElementById('qa-expand-all');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var items = document.querySelectorAll('.qa-item');
      var allOpen = Array.prototype.every.call(items, function(i){ return i.classList.contains('open'); });
      items.forEach(function (item) {
        var q = item.querySelector('.qa-q');
        if (allOpen) {
          item.classList.remove('open');
          if (q) q.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          if (q) q.setAttribute('aria-expanded', 'true');
        }
      });
      expandBtn.textContent = allOpen ? 'Expand all' : 'Collapse all';
    });
  }

  apply();
})();
</script>
