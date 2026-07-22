---
layout: post
title: "API Design Key Terms: REST, gRPC, and the Contract Vocabulary Behind Every Post"
description: "A standalone glossary of API-design terms used across this blog's API posts — idempotency, pagination, versioning, HATEOAS, OpenAPI, gRPC, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: api-design
order: 99
tags: [api-design, glossary, rest, grpc, openapi]
---

**TL;DR:** This is the shared vocabulary for every API-design post on this blog — read it once, then skip back here whenever a term like *idempotency*, *cursor pagination*, or *contract testing* shows up. Each entry is a standalone, mechanism-level definition you can read in any order.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


## REST fundamentals

### REST
REST is an architectural style where the client and server exchange representations of **resources** over HTTP using a uniform interface of methods (GET, POST, PUT, DELETE, PATCH). It is not a protocol: the constraints (statelessness, cacheability, a uniform interface, and a layered system) are what make a service "RESTful," not the mere use of JSON over HTTP. Roy Fielding's dissertation defines these constraints; the OpenAPI Specification describes how to document a concrete REST API built on top of them.

### Resource
A resource is the named, addressable thing an API exposes — an order, a user, an invoice — identified by a URI such as `/orders/42`. Its state is transferred as a representation (usually JSON) rather than as behavior, so the client manipulates the resource through HTTP verbs instead of calling remote procedures. A resource is a conceptual mapping to a set of entities, not a row in a database, which is why one resource can be backed by many tables.

### Collection
A collection is a resource that represents a set of child resources, usually addressed as a plural noun such as `/orders`, where `POST /orders` creates a member and `GET /orders` lists them. Members live under the collection at `/orders/{id}`, giving every item a stable, hierarchical address. Collections are the primary surface for listing, filtering, and pagination.

### Safe method
A safe method (GET, HEAD, OPTIONS) is defined by the HTTP spec as not expected to change server state, which lets clients, caches, and crawlers call it freely without side effects. This is a semantic contract, not an enforcement: a GET that increments a counter violates the contract even if the server accepts it. Safe methods are the basis for why GET is cacheable and retryable by intermediaries. PATCH is **neither safe nor idempotent** by the HTTP spec — it changes server state and applying the same PATCH twice can produce different results — though it can be made idempotent in practice by using strategies like conditional (If-Match) headers or patch-document replay.

### Idempotency
An idempotent operation produces the same resulting server state no matter how many times it is applied with the same input — PUT, DELETE, and GET are idempotent by HTTP definition, while POST is not. This matters because networks drop packets: a client that retries an idempotent request cannot corrupt state, but a retried POST can create a duplicate order. APIs make POST safe to retry by accepting a client-supplied idempotency key that the server dedupes.

## Contracts & specs

### OpenAPI / Swagger
OpenAPI (currently 3.1, maintained by the OpenAPI Initiative at OAI/OpenAPI-Specification) is a machine-readable JSON or YAML description of an HTTP API's paths, parameters, request/response schemas, auth, and status codes. "Swagger" is the older name for the 2.0 spec and its tooling; OpenAPI 3.x is the successor format. Because it is machine-readable, the same document drives server stubs, client SDKs, mock servers, and automated contract tests.

### Schema
A schema is the formal description of a resource's shape — its fields, types, optionality, and constraints — expressed in JSON Schema inside an OpenAPI document. Schemas let tooling validate a request body before it reaches business logic and generate typed clients, turning "the payload looks like this" into an enforceable contract. A change to a schema is the most common source of a breaking change, which is why schemas are versioned alongside the API.

### HATEOAS
HATEOAS (Hypermedia As The Engine Of Application State) is the REST constraint that a response should embed links describing the next available actions, so the client discovers flows from the server rather than hardcoding URIs. A returned order might include `links: { "pay": "/orders/42/pay", "cancel": "/orders/42/cancel" }`, letting the API change those paths without breaking clients. It is the least-followed REST constraint in practice because clients usually prefer stable, documented endpoints over runtime discovery.

### Content negotiation
Content negotiation is how client and server pick a representation format using the `Accept` and `Content-Type` headers, so the same URI can serve JSON, XML, or a vendor-specific media type. A client sending `Accept: application/vnd.myapi.v2+json` tells the server which representation contract it expects. This is the mechanism that lets versioning ride on media types instead of on the URL path.

### CORS (Cross-Origin Resource Sharing)
CORS is a browser security mechanism that blocks a web page at `https://app.example.com` from reading a response from `https://api.example.com` unless the API server explicitly allows it. The server must respond with `Access-Control-Allow-Origin` (and related) headers; for non-simple requests the browser fires a preflight `OPTIONS` request to check permissions before sending the real request. Misconfigured CORS is the most common reason an API works in `curl` but fails in the browser.

### Status codes
HTTP status codes are the standardized, machine-readable outcome of a request — 2xx success, 3xx redirect, 4xx client error, 5xx server error — that clients and intermediaries branch on. Using `201 Created` for a successful POST, `202 Accepted` for async work, and `409 Conflict` for a duplicate lets generic middleware handle caching, retries, and error display without parsing the body. Misusing `200 OK` for every response hides failures from caches and clients and defeats the uniform interface.

### Problem details (RFC 7807)
RFC 7807 defines a standard `application/problem+json` media type for error responses, carrying `type`, `title`, `status`, `detail`, and `instance` fields so errors are structured instead of free-text. A client can branch on the `type` URI (e.g. `/errors/out-of-stock`) rather than string-matching a message. It replaces the ad-hoc `{ "error": "..." }` shape with a contract both sides understand.

### Contract testing
Contract testing verifies that a provider and a consumer agree on the request/response shape without running the full system — the consumer publishes the expectations it sends and receives, and the provider is checked against them in isolation. Tools like Pact record these interactions and fail the build when either side drifts. It catches breaking changes earlier and cheaper than end-to-end tests, which is why it pairs naturally with an OpenAPI document as the source of truth.

### JWT (JSON Web Token)
A JWT is a compact, URL-safe token composed of three Base64-encoded segments — header, payload, and signature — used to carry identity and authorization claims between parties. The API server can verify the token's signature locally without calling an auth service, making authentication stateless and horizontally scalable. Common claims include `sub` (subject/user ID), `exp` (expiry), and `iss` (issuer), and the token is passed in the `Authorization: Bearer <token>` header.

### Backward compatibility
Backward compatibility means existing clients keep working when the server changes — adding an optional field is safe, but removing or renaming a field, tightening a type, or changing a status code breaks consumers. The rule of thumb is "additive is safe, subtractive is breaking." Tracking compatibility against the published OpenAPI schema is how teams ship changes without coordinated client rollouts.

## Versioning & lifecycle

### Versioning (URL / header / media-type)
API versioning is how you ship incompatible changes side by side: URL versioning puts `v1`/`v2` in the path (`/v2/orders`), header versioning uses a custom request header, and media-type versioning encodes it in the `Accept` header (`application/vnd.api.v2+json`). URL versioning is the most visible and easiest to debug; media-type versioning is the most REST-pure but harder for clients and browser testing. The goal in every style is to let old clients keep calling the old contract while new clients opt into the new one.

### Deprecation
Deprecation is the managed retirement of an endpoint, field, or version — the server marks it as going away (often via a `Deprecation` response header and a `Sunset` header naming the cutoff date) while still serving it for a grace period. Clients get a clear, machine-readable signal to migrate instead of a sudden 404. A documented deprecation policy with a minimum notice window is what keeps versioning from becoming a surprise for consumers.

## Reliability & correctness

### API Gateway
An API gateway is a single entry point in front of a set of backend services that handles cross-cutting concerns — routing, authentication, rate limiting, TLS termination, and request/response transformation — so individual services don't have to. It decouples clients from internal service topology, letting you split or merge backends without changing the public contract. Popular implementations include Kong (Nginx-based, plugin-driven), Envoy (CNCF, L4/L7 proxy), and cloud-managed options like Google Cloud Endpoints and AWS API Gateway.

### Pagination (offset / cursor)
Pagination splits a large collection response into pages so the server does not return millions of rows at once. Offset pagination uses `?offset=20&limit=10` and is simple but drifts when items are inserted or deleted during traversal, and it gets slow on deep offsets because the database still scans skipped rows. Cursor pagination uses an opaque `?cursor=<token>` anchored to the last item's sort key, so it is stable under inserts and stays fast at any depth, at the cost of not supporting random page jumps.

### Filtering / sorting
Filtering lets the client narrow a collection with query parameters such as `?status=shipped&created_after=2026-01-01`, pushing selection work to the server instead of returning everything and filtering client-side. Sorting uses a parameter like `?sort=-created_at,status` to order results, where the leading `-` conventionally means descending. Both keep payloads small and offload the expensive comparison/join work to the database the server already owns.

### Rate limiting
Rate limiting caps how many requests a client may make in a window (e.g. 1000 per hour) and rejects the rest with `429 Too Many Requests`, protecting the server from overload and one client from starving others. The server usually returns `RateLimit-*` headers or a `Retry-After` value telling the client when to come back. It is a fairness and availability control, distinct from throttling, which shapes speed rather than hard-capping count.

### Rate limiting strategies
Fixed window counting is simplest (reset the counter every hour) but allows a burst of double the limit at the window boundary. Sliding window (rolling) smooths the boundary problem by counting requests in the rolling past N seconds. Token bucket allows controlled bursts by filling tokens at a steady rate and spending one per request, while leaky bucket smooths traffic into a strict constant-rate output queue. Each strategy trades implementation complexity for fairness; token bucket is the most common in API gateways.

### Throttling
Throttling smooths request throughput by delaying or shedding load when the system is hot, rather than rejecting outright — a server might queue or slow responses to stay within a sustainable operations-per-second budget. Where rate limiting is a hard count-based wall, throttling is a pressure valve that degrades gracefully. Both are usually enforced at an API gateway in front of the service.

### Circuit breaker
A circuit breaker wraps an outbound call and trips "open" after a threshold of failures, failing fast for a cooldown period instead of hammering a downstream that is already struggling. After the cooldown it lets a trial request through ("half-open") to see if the dependency recovered. It prevents a slow or dead dependency from exhausting all of the caller's threads and cascading the outage across services.

### Webhook
A webhook is a reverse API: instead of the client polling, the server pushes an event to a callback URL the client registered in advance, usually as an HTTP POST with a signed JSON payload. It replaces long-polling and polling loops with an event-driven notification, so the client reacts the moment an order ships. The client must verify the signature and acknowledge quickly (often with `2xx`) or the server will retry.

### Long-polling
Long-polling is a workaround for push before webhooks or streaming existed: the client makes a request that the server holds open until an event occurs or a timeout elapses, then the client immediately re-issues it. It gives near-real-time updates over plain HTTP without holding many open connections like raw polling would, but it is heavier and less efficient than webhooks or gRPC streaming. It is mostly a legacy pattern now, kept for clients that cannot receive inbound connections.

## gRPC & RPC

### gRPC
gRPC is a high-performance RPC framework from grpc/grpc that uses HTTP/2 for transport and Protocol Buffers for wire encoding, generating typed client and server stubs from a single `.proto` file. It supports unary calls plus server, client, and bidirectional streaming over one multiplexed connection, with built-in deadlines, cancellation, and auth metadata. Because the contract is the `.proto`, the API is strongly typed and language-neutral by construction.

### Protobuf
Protocol Buffers (protobuf) is a binary serialization format where messages are defined in a `.proto` schema with typed fields and numbered tags; the compiler generates code that encodes them into compact, fast binary on the wire. Field numbers (not names) identify fields, so adding an optional field with a new number is backward compatible while reusing a number with a different type is not. Field numbers 1–15 use only 1 byte of wire encoding versus 2 bytes for numbers 16–2047, so frequently used fields should be assigned low numbers to minimize payload size. This is what makes gRPC payloads smaller and faster to parse than JSON.

### Unary / streaming RPC
A unary RPC is the classic request-then-response call (`rpc GetOrder(OrderId) returns (Order)`), one message in and one out. Streaming variants let the server send a stream back (`returns (stream Order)`), the client send a stream in, or both directions at once, all over a single HTTP/2 stream — ideal for live feeds like order-status updates. The four patterns (unary, server-streaming, client-streaming, bidi) are declared directly in the `.proto` and generated into the stub.

## Closing reference

Keep this glossary open alongside the API-design series: the terms here — idempotency, cursor pagination, OpenAPI schemas, gRPC streaming, contract testing — recur in every post, and the [API Design 101]({{ '/api-design/api-design-101/' | relative_url }}) foundations post puts them to work on a concrete orders API.




