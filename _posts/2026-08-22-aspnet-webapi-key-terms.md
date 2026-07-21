---
layout: post
title: "ASP.NET WebAPI Key Terms: Routing, Model Binding, and the Endpoint Vocabulary"
description: "A standalone glossary of ASP.NET WebAPI terms used across this blog's API posts — routing, model binding, filters, versioning, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: aspnet-webapi
order: 99
tags: [aspnet-webapi, glossary, api, dotnet]
---

**TL;DR:** This is the vocabulary reference for every ASP.NET WebAPI post on this blog — read it once, then skip back here whenever a term like *RouteEndpoint*, *FluentValidation*, or *OpenAPI* shows up.

> **In plain English (30 sec):** Code you already write — Map, function, API call, just bigger.

## Endpoint Pipeline

### RouteEndpoint
A `RouteEndpoint` is the internal object that pairs a URL pattern + HTTP method with a `RequestDelegate` (the handler code that runs when a request matches). Both minimal APIs and controllers produce `RouteEndpoint` objects that live in an `EndpointDataSource`. The routing middleware matches the incoming request against these endpoints and invokes the matched one.

### EndpointDataSource
`EndpointDataSource` is the collection that holds all registered endpoints. In a minimal API app, `MapGet`/`MapPost` add endpoints to the data source at startup. In a controller-based app, the `ControllerActionDescriptor` provider builds endpoints from `[Route]` and HTTP-method attributes. The routing middleware calls `GetEndpoints()` on the data source at each request to find a match.

### Conventional routing
Conventional routing uses `MapControllerRoute()` to define a single route template (e.g. `{controller}/{action}/{id?}`) that matches many controllers by convention. The framework infers the controller and action names from the URL segments. It is less explicit than attribute routing and is rarely used in modern WebAPI apps.

### Attribute routing
Attribute routing uses `[Route("api/items")]` on the controller and `[HttpGet("{id}")]` on each action to declare routes inline. Every controller-based WebAPI app in production uses attribute routing; conventional routing is a legacy MVC pattern that modern projects typically avoid.

## Model Binding

### Model binding
Model binding is the middleware step that reads the raw HTTP request — the JSON body, query string, route values, headers, or form data — and maps them into the method parameters of the matched endpoint. Each parameter's binding source is determined by an attribute (`[FromBody]`, `[FromQuery]`, `[FromRoute]`, `[FromHeader]`, `[FromForm]`) or by convention (complex types default to `[FromBody]`, simple types default to `[FromRoute]` + `[FromQuery]`).

### [FromBody]
`[FromBody]` tells the model binder to read the parameter's value from the HTTP request body using the configured input formatter (default: `System.Text.Json`). It is used for POST/PUT/PATCH requests where the client sends a JSON (or XML) payload. Only one parameter per action can be marked `[FromBody]`; the body is a single stream that can be read once.

### [ApiController]
`[ApiController]` is a combined attribute that applies several WebAPI-specific conventions to a controller class: automatic HTTP 400 responses for invalid `ModelState`, `[FromBody]` inference for complex parameters, `[FromQuery]` inference for simple parameters, and `ProblemDetails` error formatting. It eliminates boilerplate validation checks from every action.

### ModelState
`ModelState` is a dictionary maintained by the model binder that tracks whether each parameter bound successfully. It contains the bound value (if binding succeeded) plus any validation errors from `[Required]`, `[Range]`, `StringLength`, and other `DataAnnotation` attributes. With `[ApiController]`, an invalid `ModelState` automatically returns a 400 with `ProblemDetails`.

## Filters

### Authorization filter
Authorization filters implement `IAuthorizationFilter` or `IAsyncAuthorizationFilter` and run first in the filter pipeline. They check whether the request is authorized (JWT validity, role membership, policy requirements) and short-circuit the pipeline with 401 or 403 if not. The `[Authorize]` attribute is an authorization filter.

### Action filter
Action filters implement `IActionFilter` or `IAsyncActionFilter` and wrap around the handler execution. They can read or modify the action arguments before the handler runs, and inspect or modify the result afterward. Common uses: logging, validation, caching, and transaction wrapping.

### Exception filter
Exception filters implement `IExceptionFilter` or `IAsyncExceptionFilter` and run only when the handler throws an unhandled exception. They can log the error, transform it into an appropriate HTTP response (usually `ProblemDetails`), or let it propagate. The `ExceptionHandlerMiddleware` is the middleware-level equivalent.

## API Patterns

### ProblemDetails
`ProblemDetails` is the standard RFC 7807 error response format that ASP.NET Core uses for API errors. It contains a `type` URI, `title`, `status` code, `detail`, `instance`, and optional extension members. The `ProblemDetails` middleware automatically converts unhandled exceptions and model validation failures into this format when `[ApiController]` is enabled.

### API versioning
API versioning is the practice of making breaking changes under a new version label while keeping old versions running. ASP.NET Core supports four strategies: URL path versioning (`/api/v1/items`), query string versioning (`/api/items?api-version=1`), header versioning (`X-API-Version: 1`), and content negotiation (`Accept: application/vnd.myapp.v1+json`). The `aspnet-api-versioning` package manages the routing and discovery for all four.

### OpenAPI / Swagger
OpenAPI (formerly Swagger) is a specification for describing HTTP APIs in a machine-readable YAML/JSON document. Swashbuckle and NSwag are the two main .NET libraries that inspect the app's endpoints at startup and generate the OpenAPI document automatically. The generated document can be used by Swagger UI for interactive testing, by code generators for client SDKs, and by API gateways for schema validation.

### FluentValidation
`FluentValidation` is a popular .NET library for building strongly-typed validation rules using a fluent API, as an alternative to `DataAnnotations`. Rules are defined in separate validator classes and can be composed, inherited, and tested independently. It integrates with ASP.NET Core via `AddFluentValidation()` which replaces the default `DataAnnotations` validator with the FluentValidation pipeline.

## Source

- `dotnet/aspnetcore` — the actual ASP.NET Core framework source: [github.com/dotnet/aspnetcore](https://github.com/dotnet/aspnetcore)
- `domaindrivendev/Swashbuckle.AspNetCore` — Swagger/SwaggerUI integration: [github.com/domaindrivendev/Swashbuckle.AspNetCore](https://github.com/domaindrivendev/Swashbuckle.AspNetCore)
- `dotnet/aspnet-api-versioning` — API versioning library: [github.com/dotnet/aspnet-api-versioning](https://github.com/dotnet/aspnet-api-versioning)




