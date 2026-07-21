---
layout: post
title: "ASP.NET WebAPI 101: Minimal APIs, Controllers, and the Endpoint Pipeline"
description: "A beginner-to-mid introduction to ASP.NET WebAPI, taught from the framework's own source: how routing selects endpoints, how model binding populates parameters, how authentication/authorization filters compose, and the lifetime traps that break APIs."
date: 2026-08-22 09:00:00 +0530
categories: aspnet-webapi
order: 0
tags: [aspnet-webapi, fundamentals, api, dotnet]
---

**TL;DR:** ASP.NET Core WebAPI pushes every HTTP request through a middleware pipeline, then routing selects an endpoint (minimal API or controller), model binding maps request data to method parameters, and filters run before/after the handler. The framework source lives in `dotnet/aspnetcore` — the same repo as Kestrel, middleware, and the Generic Host. The bugs that bite beginners are almost never business logic; they are middleware ordering, filter lifetime capture, and incorrect model binding attributes.

## 1. What ASP.NET WebAPI is

ASP.NET WebAPI is the HTTP API layer of ASP.NET Core. It provides two endpoint models — **minimal APIs** (`app.MapGet()`) and **controllers** (`[ApiController]` classes) — both built on the same middleware pipeline, routing engine, and DI container that the rest of ASP.NET Core uses. The code lives in [`dotnet/aspnetcore`](https://github.com/dotnet/aspnetcore).

The mental model: a request arrives at Kestrel → middleware chain processes it (logging, auth, CORS) → routing matches the URL to an endpoint → model binding fills parameters → filters run → the handler executes → the response walks back out.

## 2. A real example: a minimal API with CRUD and validation

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseInMemoryDatabase("Items"));

var app = builder.Build();

app.UseExceptionHandler();          // catch unhandled exceptions -> ProblemDetails
app.UseAuthentication();           // validate JWT bearer tokens
app.UseAuthorization();            // check [Authorize] policies

// GET /items — returns all items
app.MapGet("/items", async (AppDbContext db) =>
    await db.Items.ToListAsync());

// GET /items/{id} — returns one item or 404
app.MapGet("/items/{id}", async (int id, AppDbContext db) =>
    await db.Items.FindAsync(id) is Item item
    ? Results.Ok(item)
    : Results.NotFound());

// POST /items — validates and creates
app.MapPost("/items", async (Item item, AppDbContext db) =>
{
    db.Items.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/items/{item.Id}", item);
});

app.Run();
```

## 3. Routing: how the URL becomes a handler

Routing in ASP.NET Core is a middleware (`app.UseRouting()`) that matches the incoming request against a table of `RouteEndpoint` objects built at startup. Each endpoint stores the route pattern, HTTP method, and a `RequestDelegate` that the pipeline invokes.

**Minimal APIs** register endpoints at startup via `MapGet`, `MapPost`, etc. The route pattern supports parameters (`{id}`), constraints (`{id:int}`), and defaults.

**Controllers** use `[Route]` and `[HttpGet]` attributes. The framework discovers them by scanning for classes that inherit from `ControllerBase`.

Both models produce the same `RouteEndpoint` type internally — they are just different registration syntaxes for the same routing table.

## 4. Model binding: how request data becomes .NET types

Model binding is the middleware that reads the raw HTTP request (body, query string, route params, headers) and maps it to method parameters. The source is determined by convention:

- `[FromBody]` — reads JSON/XML from the request body using `System.Text.Json`
- `[FromQuery]` — reads from the query string
- `[FromRoute]` — reads from route parameters
- `[FromHeader]` — reads from HTTP headers
- `[FromForm]` — reads from form data

Model binding runs before the handler and produces a `ModelStateDictionary` with any validation errors. When paired with `[ApiController]`, invalid models automatically return a `400 Bad Request` with a `ProblemDetails` response, saving you from writing the validation boilerplate manually.

## 5. Filters: the extensible middleware for endpoints only

Filters are the endpoint-specific analogue of middleware — they run *after* routing but *before* the handler, scoped to one endpoint or controller. ASP.NET Core provides five filter types:

- **Authorization filters** — run first; short-circuit on failure (401/403)
- **Resource filters** — wrap the entire model binding + handler execution
- **Action filters** — run before/after the handler
- **Exception filters** — catch unhandled exceptions from the handler
- **Result filters** — run before/after the response is written

Filters support dependency injection and can be registered globally, per-controller, or per-action.

## 6. Disposing the `DbContext` and other lifetime traps

The most common WebAPI bug is a captured or misconfigured DI lifetime. A `DbContext` is registered as `Scoped` by default, meaning it is created once per request and disposed when the request ends. If you inject it into a Singleton filter, it becomes a *captive dependency* — the singleton holds the scoped instance forever, leaking data between requests.

The fix: always inject `IServiceScopeFactory` into singletons that need a scoped service, and create a new scope per operation.

```csharp
// WRONG: captured DbContext
public class MySingletonFilter : IActionFilter
{
    public MySingletonFilter(AppDbContext db) { ... } // captive!
}

// RIGHT: create scope on demand
public class MySingletonFilter : IActionFilter
{
    private readonly IServiceScopeFactory _scopeFactory;
    public MySingletonFilter(IServiceScopeFactory scopeFactory) { ... }
    public void OnActionExecuting(ActionExecutingContext context)
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    }
}
```

## Review checklist

- [ ] Routing resolves the URL to a `RouteEndpoint` via the middleware pipeline's routing step
- [ ] Model binding sources (`[FromBody]`, `[FromQuery]`, etc.) determine how parameters are populated
- [ ] Filters compose around each endpoint in authorization → resource → action → exception → result order
- [ ] Captive dependencies in singleton filters are the most common WebAPI lifetime bug

## Source

- `dotnet/aspnetcore` — the actual ASP.NET Core framework source: [github.com/dotnet/aspnetcore](https://github.com/dotnet/aspnetcore)
