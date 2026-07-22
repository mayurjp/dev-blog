---
layout: post
title: "REST Maturity Model: reaching Richardson Level 3 with HATEOAS-driven navigation"
description: "How Strapi's OpenAPI assembler exposes a Level 2 REST surface, and what it takes to cross into Level 3 HATEOAS where the client discovers actions from responses."
date: 2026-08-10 09:00:00 +0530
categories: api-design
order: 1
tags: [api-design, rest, hateoas, openapi, strapi]
---

**TL;DR:** How do you know how "RESTful" an API really is? Most production APIs top out at Richardson Level 2 — resource-oriented URLs plus HTTP verbs — and only reach Level 3 (HATEOAS) when the server tells the client which actions are legal next.

**Real repo:** [strapi/strapi](https://github.com/strapi/strapi) — its `packages/core/openapi` package assembles an OpenAPI 3.1 document by walking the registered route table and emitting path/operation objects.

## 1. The Engineering Problem

The Richardson Maturity Model measures RESTfulness on four rungs:

- **Level 0** — a single endpoint, one verb (usually POST), everything in the body (RPC/SOAP style).
- **Level 1** — resources are addressed by URI (`/articles/42`), but still one verb.
- **Level 2** — proper use of HTTP verbs and status codes (`GET`, `POST`, `404`, `201`).
- **Level 3** — HATEOAS: the response embeds *links* describing what the client can do next.

The gap between Level 2 and Level 3 is where most teams stall. A Level 2 API still forces the client to hard-code URI templates and know the workflow. The server owns the data but not the *navigation*, so clients break the moment a path or rule changes.

## 2. The Technical Solution

Strapi sits firmly at Level 2: each content-type gets a resource URI and the standard CRUD verbs, and the OpenAPI assembler documents them automatically. The assembler iterates the route registry and builds `pathItem` operations from the Zod request schemas.

```mermaid
flowchart LR
  A[Route Registry] --> B[DocumentAssemblerFactory]
  B --> C[Path Assembler]
  C --> D[Operation Assembler]
  D --> E[Parameters Assembler]
  E --> F[OpenAPI 3.1 Document]
  F --> G[Swagger UI]
  classDef code fill:#2d6cdf,stroke:#1b3a8f,color:#fff;
  classDef doc fill:#16a34a,stroke:#0f7a37,color:#fff;
  classDef ui fill:#a855f7,stroke:#6b21a8,color:#fff;
  class A,B,C,D,E code;
  class F doc;
  class G ui;
```

Core truths:

- Level 2 buys you cacheability, statelessness, and self-describing errors — the 80% that matters.
- HATEOAS (Level 3) moves *state-transition logic* from client to server via embedded `links`.
- Auto-generated OpenAPI is the practical ceiling for most teams; HATEOAS requires deliberate domain modeling.

## 3. The clean example

Strapi derives each operation's parameters straight from the route's request schema — no manual spec writing:

```ts
// packages/core/openapi/src/assemblers/document/path/path-item/operation/parameters.ts
private _getPathParameters(route: Core.Route): PathParameterObject[] {
  const { params } = route.request ?? {};
  if (!params) return [];

  const pathParams: PathParameterObject[] = [];
  for (const [name, zodSchema] of Object.entries(params)) {
    const required = !zodSchema.isOptional();
    const schema = zodToOpenAPI(zodSchema) as any;
    pathParams.push({ name, in: 'path', required, schema });
  }
  return pathParams;
}
```

A Level 3 response adds navigation the client can follow without prior knowledge:

```json
{
  "id": 42,
  "title": "REST Levels",
  "links": {
    "self":   { "href": "/articles/42" },
    "publish":{ "href": "/articles/42/publish", "method": "POST" },
    "author": { "href": "/articles/42/author" }
  }
}
```

## 4. Production reality

Strapi's OpenAPI assembler shows how a Level 2 surface is generated from route metadata. The operation assembler turns Zod schemas into typed parameters:

```ts
// packages/core/openapi/src/assemblers/document/path/path-item/operation/parameters.ts
export class OperationParametersAssembler implements Assembler.Operation {
  assemble(context: OperationContext, route: Core.Route): void {
    debug('assembling parameters for %o %o...', route.method, route.path);
    const pathParameters = this._getPathParameters(route);   // /articles/:id
    const queryParameters = this._getQueryParameters(route); // ?populate=&pagination[page]
    const parameters = [...pathParameters, ...queryParameters];
    context.output.data.parameters = parameters;
  }
  // nested query objects are flattened to bracket notation, e.g. pagination[page]
}
```

> Multi-path callout: the same assembler feeds `GET /articles`, `POST /articles`, `GET /articles/:id` — each becomes an OpenAPI operation under the `/articles` path item.

What this teaches: Strapi documents resources, verbs, and query params — the Level 2 contract — but does not emit `_links` in entity responses, so it never crosses into Level 3 automatically.

**Stale fact (API Design):** most "REST" APIs are Richardson Level 2, not Level 3/HATEOAS. HATEOAS is academically pure but rarely shipped because clients prefer stable, documented URLs over server-driven discovery.

## 5. Review checklist

- Do your resources have stable URIs and correct verbs/status codes (Level 2)?
- Is your contract machine-readable (OpenAPI) and generated from code?
- Have you modeled *state transitions* as links if you claim Level 3?
- Are query params documented as real schema, not free-form strings?

## 6. FAQ

**Q: Is HATEOAS worth implementing?** Only if clients genuinely need server-driven workflows; otherwise Level 2 + OpenAPI is the pragmatic target.

**Q: Does OpenAPI imply HATEOAS?** No. OpenAPI documents the static contract; HATEOAS is runtime link discovery inside responses.

**Q: What's the fastest way to reach Level 2?** Generate OpenAPI from your route schemas (as Strapi does) instead of hand-writing it.

**Q: Can Level 0 be acceptable?** Yes for internal RPC-style services, but don't call them REST.

**Q: How does Strapi handle nested query params?** It flattens object schemas into bracket notation like `pagination[page]`.

## Source

- **Concept:** Richardson Maturity Model / HATEOAS
- **Domain:** api-design
- **Repo:** strapi/strapi → [packages/core/openapi/src/assemblers/document/path/path-item/operation/parameters.ts](https://github.com/strapi/strapi/blob/main/packages/core/openapi/src/assemblers/document/path/path-item/operation/parameters.ts) — turns route Zod schemas into OpenAPI path/query parameters.




