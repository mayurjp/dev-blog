---
layout: post
title: "API Versioning Strategies: choosing URL path, header, or query-param versioning"
description: "A comparison of the three dominant API versioning mechanisms, with guidance on when each survives contact with real clients and proxies."
date: 2026-08-12 09:00:00 +0530
categories: api-design
order: 2
tags: [api-design, versioning, rest, api-governance]
---

**TL;DR:** Which versioning scheme should an API use? URL path versioning (`/v1/...`) is the most interoperable and cache-friendly, while header and query-param versioning keep URLs clean but complicate caching and observability.

**Real repo:** [dotnet/aspnetcore](https://github.com/dotnet/aspnetcore) — its API versioning middleware supports `UrlSegmentApiVersionReader`, `HeaderApiVersionReader`, and `QueryStringApiVersionReader`, making all three schemes first-class.

## 1. The Engineering Problem

Breaking changes are inevitable: a field becomes required, a response shape changes, a resource is split. Without versioning, every deploy risks breaking clients. The question is *where* the version lives:

- **URL path** — `GET /v1/articles`
- **Header** — `Accept: application/vnd.acme.v1+json` or `api-version: 1`
- **Query param** — `GET /articles?api-version=1`

Each moves the version to a different layer of the request, with different consequences for caches, logs, and client ergonomics.

## 2. The Technical Solution

The three readers in ASP.NET Core's versioning middleware show the trade-offs concretely:

```mermaid
sequenceDiagram
  participant C as Client
  participant M as Versioning Middleware
  participant R as Router
  C->>M: GET /v1/articles  (or header / ?api-version=1)
  M->>M: Read version from path / header / query
  M->>R: Bind to controller matching apiVersion
  R->>C: 200 + v1 payload
  Note over C,R: same route handler, different version set
  classDef path fill:#2d6cdf,stroke:#1b3a8f,color:#fff;
  classDef head fill:#16a34a,stroke:#0f7a37,color:#fff;
  classDef query fill:#a855f7,stroke:#6b21a8,color:#fff;
  class C path;
  class M head;
  class R query;
```

Core truths:

- Path versioning is visible in logs, CDN configs, and caches — easiest to reason about operationally.
- Header versioning keeps URLs stable but hides the version from intermediaries and bookmarks.
- Query-param versioning is the weakest: many caches ignore query strings inconsistently and it pollutes every link.

## 3. The clean example

Declaring the same version via three readers (ASP.NET Core style):

```csharp
// UrlSegment (path) is the most common in practice
services.AddApiVersioning(o => {
    o.ApiVersionReader = new UrlSegmentApiVersionReader();   // /v1/...
    // o.ApiVersionReader = new HeaderApiVersionReader("api-version");
    // o.ApiVersionReader = new QueryStringApiVersionReader("api-version");
});

[ApiController]
[Route("v{version:apiVersion}/articles")]
public class ArticlesV1Controller : ControllerBase { /* ... */ }
```

On the client, the three shapes look like:

```
GET /v1/articles                      # path
GET /articles      Header: api-version: 1   # header
GET /articles?api-version=1           # query
```

## 4. Production reality

The middleware model proves the version is *metadata about routing*, independent of where it is carried. All three resolve to the same `(route, version)` tuple before dispatch.

```
// conceptual: every reader normalizes to a single ApiVersion value
UrlSegmentApiVersionReader   -> reads {version} from path segment
HeaderApiVersionReader       -> reads "api-version" HTTP header
QueryStringApiVersionReader  -> reads ?api-version= from query
// router then selects the controller bound to that apiVersion
```

What this teaches: versioning is a *routing concern*, not a business-logic concern. Pick the reader that your caches and gateways can see.

**Stale fact (API Design):** URL-path versioning is most common in practice despite header purism. Purists argue headers are "more RESTful," but path versioning wins on debuggability and CDN compatibility.

## 5. Review checklist

- Is the version visible to your CDN/cache layer (path > header > query)?
- Can you run two versions side-by-side without code forks?
- Do error responses include the supported versions?
- Have you documented the deprecation/retirement policy?

## 6. FAQ

**Q: Should I version the URL or the media type?** URL path is simpler and more observable; media-type versioning is elegant but harder to debug.

**Q: Is query-param versioning ever recommended?** Rarely — only for quick experiments; it complicates caching.

**Q: How long should a version live?** Until usage hits zero in telemetry; deprecate explicitly with `Sunset` headers.

**Q: Can I mix schemes?** Yes, middleware can accept multiple readers, but one canonical scheme should be documented.

**Q: Does versioning apply to GraphQL?** No — GraphQL evolves the schema in place via deprecation, not versions.

## Source

- **Concept:** API versioning (path / header / query)
- **Domain:** api-design
- **Repo:** dotnet/aspnetcore → [src/Mvc/Mvc.Core](https://github.com/dotnet/aspnetcore/tree/main/src/Mvc/Mvc.Core) — ApiVersioning middleware with UrlSegment/Header/QueryString readers.




