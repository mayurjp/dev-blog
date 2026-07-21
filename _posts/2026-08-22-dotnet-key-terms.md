---
layout: post
title: ".NET Key Terms: the CLR, DI, and the Runtime Vocabulary Behind Every Post"
description: "A standalone glossary of .NET terms used across this blog's runtime-internals posts — the CLR, the DI container, the middleware pipeline, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: dotnet
order: 99
tags: [dotnet, glossary, clr, aspnetcore]
---

**TL;DR:** This is the vocabulary reference for every .NET post on this blog — read it once, then skip back here whenever a term like *JIT*, *Scoped*, or *Generic Host* shows up. The terms are grouped by theme and each stands alone, so you can land on any post in the series without first reading the others.

> **In plain English (30 sec):** Code you already write — Map, function, API call, just bigger.

## Runtime

### CLR (Common Language Runtime)
The CLR is the execution engine that ships with every .NET distribution and is responsible for loading assemblies, compiling IL to native machine code, allocating managed memory, and running the garbage collector and thread pool. It is the layer that turns a portable `.dll` into something the OS actually executes, and it owns the safety guarantees (type checks, bounds checks, memory safety) that managed code relies on. Everything in this blog's runtime posts ultimately happens *inside* the CLR.

### Managed code
Managed code is any code compiled to IL and executed by the CLR, as opposed to native code that talks to the OS directly. The "managed" part means memory and lifetime are handled by the runtime — the GC reclaims objects, the CLR tracks references, and you cannot freely read arbitrary memory. This is why a `NullReferenceException` is recoverable but a native access violation usually is not.

### GC (Garbage Collection)
The GC is a generational, compacting collector built into the CLR that automatically reclaims heap memory for objects no longer reachable from roots (stack locals, static fields, CPU registers). It organizes the heap into Gen 0, Gen 1, and Gen 2 (plus a separate large-object heap) so that short-lived allocations are collected cheaply and rarely-promoted objects never trigger a full expensive sweep. A collection pauses running threads (more so on Gen 2 / full GC), which is the mechanism behind most "GC pause" performance stories.

### JIT (Just-In-Time compiler)
The JIT is the CLR component that translates IL methods into native CPU instructions the first time each method is invoked, caching the result so subsequent calls skip recompilation. It can specialize code to the actual CPU it runs on (e.g. AVX2 instructions) and inline aggressively based on runtime profile data. The trade-off is startup cost: every method pays a compile tax once, which is exactly what AOT removes.

### IL (Intermediate Language)
IL (also called CIL or MSIL) is the stack-based, CPU-agnostic bytecode that C#/F#/VB compilers emit instead of native machine code. The same IL runs on Windows, Linux, and macOS because the JIT produces the platform-specific instructions at runtime. It is what makes a `.dll` portable across operating systems and chip architectures.

### AOT (Ahead-Of-Time compilation)
AOT compiles IL to native machine code at build/publish time using the cross-platform `crossgen2`/`ReadyToRun` and native-AOT toolchains, so the app ships as a self-contained binary that needs no JIT warm-up. Native AOT produces a much smaller deployment with instant startup and no GC-pause-from-JIT, at the cost of losing runtime specialization and some reflection-based features. It is the mechanism behind .NET's "build a tiny fast container" story.

## ASP.NET Core

### ASP.NET Core
ASP.NET Core is the cross-platform web framework built on the shared .NET runtime that handles HTTP requests through a pipeline of middleware and a host that owns the server and DI container. Unlike the old .NET Framework ASP.NET, it is fully open source in `dotnet/aspnetcore`, runs on Linux and macOS, and is unified with the rest of .NET. It is the framework every web post on this blog is written against.

### Middleware
Middleware is a delegate in the request pipeline — a function that takes an `HttpContext` and a `next` delegate and decides whether to handle the request, modify it, or pass it downstream. Middleware are composed in the order they are registered, forming a nested "Russian doll" where the response unwinds back through the same chain. A custom middleware is just `app.Use(async (context, next) => { ... await next(); ... })`.

### Request pipeline
The request pipeline is the ordered sequence of middleware that an incoming HTTP request flows through, from the server (Kestrel) up to the terminal handler (a minimal API or controller) and back out as a response. Each middleware sees the request on the way in and the response on the way out, which is why ordering — authentication before authorization, exception handling on the outside — is load-bearing. The pipeline is built once at startup from the registered middleware and then reused for every request.

### Kestrel
Kestrel is the cross-platform, event-driven web server built into ASP.NET Core that terminates HTTP/HTTPS connections and feeds requests into the middleware pipeline. It is based on `libuv` historically and now on the managed `Socket`/`System.IO.Pipelines` stack, and it is what actually listens on the port in production. In a reverse-proxy setup (nginx, YARP) Kestrel sits behind the proxy rather than facing the internet directly.

### Minimal API
A minimal API is the lightweight routing style introduced in .NET 6 where endpoints are declared directly with `app.MapGet(...)` / `app.MapPost(...)` lambdas instead of going through controllers and action-result types. The route handler is compiled into the same pipeline as middleware, so there is almost no framework overhead between the request and your code. It is the modern default for small services and the example style used throughout this blog.

### Controller
A controller is a class decorated with `[ApiController]` whose public methods (actions) are mapped to routes by the MVC framework, returning `IActionResult` or `ActionResult<T>` that the framework serializes. It adds model binding, validation, and content negotiation on top of what a minimal API gives you for free. Controllers are the older, more structured style and still the right choice for large REST surfaces with shared filters and conventions.

### Razor
Razor is the ASP.NET Core view engine that mixes C# with HTML using `@` directives to render server-side pages, compiled into the app at build time. `@page` turns a `.cshtml` file into a Razor Page (a self-contained page-with-handler model), while `@model` binds a view to a view-model class. It is the server-rendering half of ASP.NET Core, distinct from the JSON API half.

## Dependency injection

### Dependency injection (DI)
DI is the pattern of supplying a class's dependencies from outside rather than having it construct them, and ASP.NET Core ships a built-in container that resolves and injects those dependencies by type. The framework uses constructor injection: a service declares what it needs in its constructor and the container builds the object graph. This is how every controller, minimal-API handler, and hosted service receives its collaborators.

### Service lifetime (Singleton / Scoped / Transient)
A service lifetime tells the container how often to create a new instance: `Singleton` is created once per root container and shared for the app's life, `Scoped` is created once per request (or per scope), and `Transient` is created fresh on every resolve. The lifetime is registered with `AddSingleton` / `AddScoped` / `AddTransient` and is the single most common source of bugs when mismatched. A `Scoped` service resolved from a `Singleton` is captured for the app's lifetime and effectively becomes a memory leak and a cross-request data bug.

### IServiceCollection
`IServiceCollection` is the bag of service-registration descriptors that you populate in `Program.cs` (or `Startup.ConfigureServices`) with calls like `services.AddScoped<IMyService, MyService>()`. It is just a list of `ServiceDescriptor` entries; the real container is built from it by calling `BuildServiceProvider()`. Almost every framework feature (`AddDbContext`, `AddControllers`, `AddHealthChecks`) is an extension method that adds registrations to this collection.

### IServiceProvider
`IServiceProvider` is the built, queryable container produced from an `IServiceCollection` via `BuildServiceProvider()`, exposing `GetService<T>()` / `GetRequiredService<T>()` to resolve instances. Each request gets its own *scope* provider (an `IServiceScope`) so that `Scoped` services are isolated per request. Calling `GetRequiredService` throws if the type is not registered, whereas `GetService` returns `null`, which is the usual cause of "object reference not set" surprises.

### Host
The Host is the long-running object that owns the app's configuration, logging, DI container, and lifetime, and starts/stops the services registered with it. In ASP.NET Core the host also owns Kestrel and the middleware pipeline; for worker/console apps it owns the `IHostedService` implementations. It is the thing `builder.Build().Run()` actually starts.

### Generic Host
The Generic Host (`Host.CreateBuilder` / `WebApplication.CreateBuilder`) is the unified hosting model introduced in .NET 6 that gives web apps and worker services the same configuration, logging, and DI primitives. Before it, web apps used `WebHost` and background services used a separate `Host` — the Generic Host merged them so a single `WebApplication` is both a web host and a service host. This is why `Program.cs` today looks the same whether you serve HTTP or run a timer in the background.

## Data & hosting

### EF Core (Entity Framework Core)
EF Core is the ORM in `dotnet/efcore` that maps CLR entity classes to database tables and translates LINQ queries into SQL at runtime. It builds a model from your entity types and `DbContext` configuration, then emits parameterized SQL so the database does the heavy lifting. It is the data-access layer used in most ASP.NET Core posts here.

### DbContext
`DbContext` is EF Core's unit-of-work and connection-to-the-database object that holds the entity sets (`DbSet<T>`) and the change tracker. You typically register it as `Scoped` so each request gets one context with one database connection and one identity map. Disposing it (which the scope does automatically) flushes tracked changes and returns the connection to the pool.

### Change tracking
Change tracking is EF Core's mechanism of keeping a snapshot of every loaded entity so it can detect which properties were modified and emit the minimal `UPDATE` statement on `SaveChangesAsync()`. It is driven by the `DbContext`'s `ChangeTracker` and is why you can mutate an entity and persist it without writing SQL. It costs memory and CPU per tracked entity, so high-throughput paths often use `AsNoTracking()` to opt out.

### LINQ (Language-Integrated Query)
LINQ is the C# language feature (and a set of `IEnumerable`/`IQueryable` extension methods) for expressing queries over collections or remote data sources with the same syntax. Against an in-memory `IEnumerable` it runs as delegates; against an `IQueryable` (like a `DbSet`) the provider translates the expression tree into SQL. The same `Where`/`Select`/`GroupBy` shape therefore means very different things depending on the source.

### async/await
`async`/`await` is the C# syntax that turns asynchronous, callback-based code into linear-looking code by compiler-generated state machines that yield the thread at each `await`. On the CLR, `await` returns the thread to the pool while the I/O completes, so a web server can serve other requests instead of blocking on a database call. It is the mechanism that lets a small thread pool handle thousands of concurrent requests.

### Task
A `Task` is the CLR's promise of a future result or completion, produced by async methods and awaited by `await`, scheduled onto the thread pool by the `TaskScheduler`. `Task<T>` carries a return value; `Task` (non-generic) signals completion only. The `SynchronizationContext` (replaced in ASP.NET Core by a thread-pool-based context) decides which thread continues the awaited continuation.

### Cancellation token
A `CancellationToken` is a cooperative signal (from a `CancellationTokenSource`) that tells a long-running async operation to stop early, typically because the HTTP client disconnected or a timeout fired. ASP.NET Core threads a `HttpContext.RequestAborted` token through the pipeline so your handler can abandon a slow database call when the caller is gone. Checking `token.IsCancellationRequested` or passing the token to `SaveChangesAsync(token)` is what makes a service responsive under load instead of piling up doomed work.

### Configuration
Configuration in ASP.NET Core is a layered provider system (`IConfiguration`) that merges JSON files, environment variables, command-line args, and secret stores in a defined order of precedence. It is built by the host before the DI container, so `IOptions<T>` / `IConfiguration` can be injected anywhere. The layering is why an environment variable overrides `appsettings.json` without changing code.

### Logging
Logging is the framework's `ILogger<T>` abstraction fed by the host's configured providers (console, debug, EventSource, Seq, etc.), emitting structured events with named properties rather than formatted strings. In ASP.NET Core it is registered automatically and injected by generic type, so `ILogger<MyService>` tags every line with the source class. Structured logging is what makes the logs queryable instead of just printable.

### Health checks
Health checks are endpoints (usually `/health`) backed by `IHealthCheck` implementations that report the app's dependency status — database reachable, downstream API responding, disk space OK. Registered via `AddHealthChecks()` and exposed with `MapHealthChecks`, they are what an orchestrator (Kubernetes, a load balancer) polls to decide whether to route traffic or restart the pod. A failing check is how a broken dependency takes a service out of rotation before it serves errors.

Keep this page bookmarked — every other .NET post links a term back to one of the definitions above, and the 101 post walks through how these pieces actually fit together at request time.




