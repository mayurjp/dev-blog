---
layout: page
title: "API Design Interview Questions: 35 Real-World Q&A from Production Manifests"
description: "35 interview-ready API Design questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/api-design/
---

Bite-sized, standalone interview questions and answers for API Design. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">35</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: REST fundamentals & resources (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is API design, really? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
API design is the work of defining the *contract* between a client and a server: the named things you can act on, the operations allowed on each, the request/response shapes, the errors, and the rules for change. Get the contract right and clients and servers can ship on independent schedules; get it wrong and every server change breaks someone. It is not "pick a framework" — the design questions are the same whether you serve JSON over HTTP or binary over HTTP/2.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is a resource in REST, and why is it not a database row? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A resource is the named, addressable thing an API exposes — an order, a user, an invoice — identified by a URI such as `/orders/42`, whose state is transferred as a representation (usually JSON) rather than as behavior. A resource is a conceptual mapping to a set of entities, not a row in a database, which is exactly why one resource can be backed by many tables. The client manipulates the resource through HTTP verbs instead of calling remote procedures.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a collection resource and how are its members addressed? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A collection is a resource representing a set of child resources, usually a plural noun such as `/orders`, where `POST /orders` creates a member and `GET /orders` lists them. Members live under the collection at `/orders/{id}`, giving every item a stable, hierarchical address. Collections are the primary surface for listing, filtering, and pagination.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] What is a safe method, and why does GET being "safe" enable caching and retries? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A safe method (GET, HEAD, OPTIONS) is defined by the HTTP spec as not expected to change server state, which lets clients, caches, and crawlers call it freely without side effects. This is a semantic contract, not an enforcement: a GET that increments a counter violates the contract even if the server accepts it. Because safe methods carry no side effects, intermediaries can cache and retry them without risk.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] When would you model an API as resources with a uniform interface rather than as operations? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
For external, browser-facing, or partner APIs, REST with resources under collections and a small uniform verb set (POST/GET/DELETE) is the pragmatic default because of universal tooling and debuggability. You reach for operation-oriented gRPC when you need typed, high-throughput internal calls where streaming and performance matter (Google's API Design Guide recommends gRPC internally, REST externally). Many systems expose gRPC internally and a REST/OpenAPI gateway externally.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Idempotency, pagination & safe retries (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What does "idempotent" mean in HTTP, and which verbs are idempotent? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An idempotent operation produces the same resulting server state no matter how many times it is applied with the same input. PUT, DELETE, and GET are idempotent by HTTP definition, while POST is not. This matters because networks drop packets: retrying an idempotent request cannot corrupt state, but a retried POST can create a duplicate order.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] What happens when a client retries `POST /v1/orders` after a timeout without an idempotency key? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Networks drop requests, so a client that retries after a timeout can end up creating two orders — a second order, a second charge, a second shipment. Without an idempotency key or an idempotent method, the server has no way to recognize the replay as the same logical request. This is the single most common correctness bug in payment and order APIs, and it only appears under real network failure, never in happy-path tests.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does an idempotency key make a non-idempotent POST safe to retry? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The client sends a client-supplied `Idempotency-Key` (a UUID) in a header alongside the POST. The server stores the key with the result, so a replay with the same key returns the original `201 Created` response instead of making a second order. This is the mechanism that makes an otherwise non-idempotent method safe to retry.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] Why is offset pagination poor for deep or mutating collections? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Deep offset pagination (`?offset=10000`) forces the database to scan and discard ten thousand rows, and the window drifts if rows are inserted or deleted mid-walk. It also gets slow on deep offsets because the database still scans all the skipped rows. The result is both wasted work and unstable pages under concurrent inserts.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] When would you choose cursor pagination over offset pagination? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You reach for cursors for any collection that grows and is traversed over time — order histories, activity feeds, audit logs — where inserts during a walk would otherwise shift an offset window and where deep offsets would force full scans. Offset pagination is acceptable only for small, static, or randomly-pageable result sets. Cursor pagination keeps the database doing an index seek instead of a growing scan.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: The OpenAPI contract & contract testing (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is OpenAPI, and what does "Swagger" mean in relation to it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
OpenAPI (currently 3.1, maintained by the OpenAPI Initiative at OAI/OpenAPI-Specification) is a machine-readable JSON or YAML description of an HTTP API's paths, parameters, request/response schemas, auth, and status codes. "Swagger" is the older name for the 2.0 spec and its tooling; OpenAPI 3.x is the successor format. Because it is machine-readable, one document drives stubs, SDKs, mocks, and contract tests.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a schema in an OpenAPI document, and why is it the common source of breaking changes? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A schema is the formal description of a resource's shape — its fields, types, optionality, and constraints — expressed in JSON Schema inside an OpenAPI document. Schemas let tooling validate a request body before it reaches business logic and generate typed clients, turning "the payload looks like this" into an enforceable contract. A change to a schema is the most common source of a breaking change, which is why schemas are versioned alongside the API.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] What is contract testing, and how does it pair with an OpenAPI doc? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Contract testing verifies that a provider and consumer agree on the request/response shape without running the full system — the consumer publishes the expectations it sends and receives, and the provider is checked against them in isolation. Tools like Pact record these interactions and fail the build when either side drifts. It catches breaking changes earlier and cheaper than end-to-end tests, which is why it pairs naturally with an OpenAPI document as the source of truth.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] What is HATEOAS, and why is it the least-followed REST constraint? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
HATEOAS (Hypermedia As The Engine Of Application State) is the REST constraint that a response should embed links describing the next available actions, so the client discovers flows from the server rather than hardcoding URIs. A returned order might include `links: { "pay": "/orders/42/pay", "cancel": "/orders/42/cancel" }`, letting the API change those paths without breaking clients. It is the least-followed constraint in practice because clients usually prefer stable, documented endpoints over runtime discovery.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: REST vs gRPC — the architectural fork (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] How does REST differ from gRPC at the modeling level? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
REST models *things* you act on with a small uniform set of verbs (resources under `/v1/orders` with POST/GET/DELETE); gRPC models *operations* you call directly (a `OrderService` with `CreateOrder`/`GetOrder`). That difference drives everything else: REST's contract is the URL space plus an OpenAPI doc, while gRPC's contract *is* the `.proto`. Google's API Design Guide frames both as valid choices depending on the audience.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What transport and payload differences exist between REST and gRPC? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
REST usually rides HTTP/1.1 with JSON, while gRPC rides HTTP/2 with Protocol Buffers — smaller, faster, and multiplexed, with deadlines and cancellation as first-class. gRPC's binary payloads parse faster than JSON and stream over one HTTP/2 connection. REST wins on human-debuggability and universal client support since any HTTP tool works.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does gRPC handle pagination and streaming compared to REST? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
In gRPC, an RPC like `ListOrders` can return `stream Order` — the server pushes pages over one HTTP/2 stream, which is the gRPC-native answer to pagination and long-polling. REST has no built-in streaming, so it bolts on SSE, websockets, or webhooks instead. Streaming (server, client, bidirectional) is declared directly in the `.proto` and generated into the stub.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] What is protobuf, and why are gRPC payloads smaller than JSON? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Protocol Buffers is a binary serialization format where messages are defined in a `.proto` schema with typed fields and numbered tags; the compiler generates code that encodes them into compact, fast binary on the wire. Field numbers (not names) identify fields, so adding an optional field with a new number is backward compatible while reusing a number with a different type is not. This is what makes gRPC payloads smaller and faster to parse than JSON.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] When would you expose gRPC internally and a REST facade externally? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
For internal service-to-service calls where performance, streaming, and typed stubs matter, gRPC shines; for external, browser-facing, or partner APIs, REST with OpenAPI is the pragmatic default because of universal tooling and debuggability. Google's API Design Guide recommends exactly this split, and many systems do both — gRPC internally, a REST/OpenAPI gateway in front for external clients.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Expert] How do unary and streaming RPCs differ, and where are they declared? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A unary RPC is the classic request-then-response call (e.g. `rpc GetOrder(OrderId) returns (Order)`), one message in and one out. Streaming variants let the server send a stream back (`returns (stream Order)`), the client send a stream in, or both directions at once — all over a single HTTP/2 stream, ideal for live feeds like order-status updates. The four patterns (unary, server-streaming, client-streaming, bidi) are declared directly in the `.proto` and generated into the stub.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: Versioning, deprecation & lifecycle (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What are the three common API versioning styles, and what's the tradeoff? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
URL versioning puts `v1`/`v2` in the path (`/v2/orders`), header versioning uses a custom request header, and media-type versioning encodes it in the `Accept` header (`application/vnd.api.v2+json`). URL versioning is the most visible and easiest to debug; media-type versioning is the most REST-pure but harder for clients and browser testing. The goal in every style is to let old clients keep calling the old contract while new clients opt into the new one.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] Why might you put the version in the URL rather than a header? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You can version via header or media type (media-type versioning is the most REST-pure), but URL versioning wins on simplicity and debuggability — you can see and share the version in the path, and browser/dev-tools testing just works. Pick one and apply it consistently; the post's FAQ frames URL versioning as the pragmatic default for those reasons.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a deprecation policy, and what headers signal it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Deprecation is the managed retirement of an endpoint, field, or version — the server marks it as going away (often via a `Deprecation` response header and a `Sunset` header naming the cutoff date) while still serving it for a grace period. Clients get a clear, machine-readable signal to migrate instead of a sudden 404. A documented deprecation policy with a minimum notice window is what keeps versioning from becoming a surprise for consumers.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Tradeoff] What are the downsides of version sprawl, and how is it avoided? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Versioning in the URL (`/v1`, `/v2`, `/v3`...) is easy to start and hard to end: every version is code you must keep running, testing, and securing forever. Without a deprecation policy a `Sunset` header and a notice window, versions pile up. The discipline is: version only on a real breaking change, deprecate aggressively, and delete old versions on a schedule.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Breaking changes, over/under-fetching & other reliability traps (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What kinds of edits are breaking changes even if they look harmless? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Removing a JSON field, renaming it, tightening a type from `string` to `integer`, or changing a `200` to a `201` all break clients coded against the old shape. Because the OpenAPI schema *is* the contract, a change there should be reviewed as a compatibility decision, not a free edit. The safe move is additive-only on a live version and a new version for anything subtractive.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] What is over-fetching, and how does it waste the contract? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A "get customer" endpoint that returns the full order history for every profile view is over-fetching — the client downloads megabytes it ignores. Good design lets the client ask for the shape it needs (field selection or a GraphQL-style projection) or at least scopes collections sensibly. Watching the payload shape is one of the core design disciplines to avoid this waste.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is under-fetching / the N+1 problem, and why is it called an explosion? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An endpoint that returns only an ID, forcing the client to call `GET /order` per item, is under-fetching — the infamous N+1 call explosion, where one list view triggers one plus N follow-up requests. It hammers the server and slows the client compared to returning the needed data in the first call. Good design scopes collections and supports server-side filtering/sorting to avoid it.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] What status codes should a well-designed REST API use, and why avoid 200 for everything? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
HTTP status codes are the standardized, machine-readable outcome of a request — `201 Created` for a successful POST, `202 Accepted` for async work, `409 Conflict` for a duplicate, and so on — that clients and intermediaries branch on. Using `200 OK` for every response hides failures from caches and clients and defeats the uniform interface. Generic middleware can then handle caching, retries, and error display without parsing the body.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Expert] How does RFC 7807 (problem+json) improve error handling over ad-hoc error shapes? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
RFC 7807 defines a standard `application/problem+json` media type for error responses, carrying `type`, `title`, `status`, `detail`, and `instance` fields so errors are structured instead of free-text. A client can branch on the `type` URI (e.g. `/errors/out-of-stock`) rather than string-matching a message. It replaces the ad-hoc `{ "error": "..." }` shape with a contract both sides understand.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] What is a webhook, and how does it differ from long-polling? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A webhook is a reverse API: instead of the client polling, the server pushes an event to a callback URL the client registered in advance, usually an HTTP POST with a signed JSON payload — so the client reacts the moment an order ships. Long-polling is the older workaround where the client makes a request the server holds open until an event or timeout, then immediately re-issues it; it is heavier and less efficient than webhooks or gRPC streaming, kept only for clients that cannot receive inbound connections. The client must verify the webhook signature and acknowledge quickly (often with `2xx`) or the server will retry.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: Auth, errors & real-time (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] What is the difference between PATCH and PUT? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
PUT replaces the entire resource — you must send every field, and missing optional fields become null. PATCH applies a partial update, typically a list of changes like `[{ "op": "replace", "path": "/email", "value": "new@example.com" }]`. PUT is idempotent (sending it twice has the same effect); PATCH is idempotent only if you design it that way (e.g., using `If-Match` to prevent lost updates). Interviewers test whether you know PATCH is not automatically idempotent by the HTTP spec.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] How do you handle real-time notifications in an API? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Three common approaches: Webhooks (server pushes to a client URL — best for server-to-server), Server-Sent Events (one-way stream over HTTP — best for browser dashboards), and gRPC bidirectional streaming (full duplex — best for low-latency internal services). Webhooks require signature verification and retry handling; SSE requires a persistent HTTP connection but is simpler than WebSockets; gRPC streaming gives the lowest latency but needs HTTP/2. The right choice depends on who is consuming (browser vs server) and latency requirements.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] How does a circuit breaker protect an API from cascading failures? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A circuit breaker wraps calls to a downstream dependency and tracks failure rates. When failures exceed a threshold, the circuit "opens" and immediately rejects requests (or returns a fallback) without calling the dependency, preventing timeout pile-ups. After a cooldown period, it enters a "half-open" state and lets a probe request through; if it succeeds, the circuit closes again. This prevents one slow dependency from exhausting the caller's thread pool and cascading to other dependencies.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] When would you choose cursor pagination over offset pagination? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Offset pagination (`?page=3&size=20`) is simple and lets clients jump to arbitrary pages, but it becomes slow on large datasets because the database must scan and discard the first N rows. Cursor pagination (`?cursor=abc123&size=20`) uses a stable sort column (usually the primary key or timestamp) to resume from where the last page ended — O(1) regardless of depth. Choose cursor when you have large, frequently-updated datasets (feeds, timelines); choose offset when you need page-number jumping (admin dashboards, search results).

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Expert] How do you handle versioning when you need to make a breaking change? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Breaking changes (removing a field, changing a type) require a new API version. Strategies: URL versioning (`/v2/orders`) is the most explicit and cache-friendly; header versioning (`Accept: application/vnd.api.v2+json`) keeps URLs clean but is harder to test in a browser. Regardless of strategy, the old version must remain available for a deprecation window (typically 6-12 months), with a `Sunset` header and migration guide. Dark launches (routing a percentage of traffic to the new version before full release) help catch issues before they affect all clients.

<p class="qa-link">[Full post →]({{ '/api-design/api-design-101/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 35 across API Design

[Back to Q&A Index]({{ '/qa/' | relative_url }})

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

  /* Accordion: click question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
    h3.setAttribute('aria-expanded', h3.parentElement.classList.contains('open'));
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
