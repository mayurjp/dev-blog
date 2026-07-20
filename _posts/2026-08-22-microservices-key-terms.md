---
layout: post
title: "Microservices Key Terms: Bounded Context, Saga, and the Distributed-Systems Vocabulary Behind Every Post"
description: "A standalone glossary of the microservices terms used across this blog's decomposition, communication, data-consistency, resilience, and deployment posts — bounded context, saga, outbox, circuit breaker, service mesh, CQRS, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: microservices
order: 99
tags: [microservices, glossary, architecture]
---

**TL;DR:** This is the reference page for the microservices vocabulary used throughout this blog's architecture posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

The posts in this domain assume you already know what a bounded context or a saga is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Decomposition

### Bounded context
A bounded context (from Domain-Driven Design) is an explicit boundary around a model in which a term has exactly one meaning — "Product" in Catalog means something different from "Product" in Ordering. Each context exclusively owns its data and talks to others only through explicit contracts (APIs or events), never a shared database; a shared schema is the absence of a boundary, not one.

- Deep dive: [Service Decomposition & Bounded Contexts]({{ '/microservices/service-decomposition-and-bounded-contexts/' | relative_url }})

### Service decomposition (and the distributed monolith)
Decomposition means splitting a system along business capabilities so each service owns its data and exposes explicit contracts, rather than splitting by table or technical layer. Fail this — services still sharing one database or reaching into each other's tables — and you get a distributed monolith: all the coupling of a monolith plus network latency and partial failure.

- Deep dive: [Service Decomposition & Bounded Contexts]({{ '/microservices/service-decomposition-and-bounded-contexts/' | relative_url }})

### Strangler fig
The Strangler Fig pattern puts a routing facade (a reverse proxy/gateway) in front of the whole system and migrates one capability at a time by repointing a single route from the legacy implementation to the new one. The system stays fully functional at every intermediate stage, and reverting one migrated capability means repointing one route back, not a full rollback.

- Deep dive: [Strangler Fig: Incremental Monolith Migration]({{ '/microservices/strangler-fig-incremental-monolith-migration/' | relative_url }})

### Anti-corruption layer (ACL)
An anti-corruption layer is a translation boundary your own code owns, sitting between your domain and an external system, so every caller depends only on your own types while the ACL alone absorbs and normalizes the external system's actual shape. It is more than a pass-through interface — the defining work is translation at a real boundary, where your own invariants get enforced against a system that doesn't share them.

- Deep dive: [Anti-Corruption Layer]({{ '/microservices/anti-corruption-layer/' | relative_url }})

## Communication

### API gateway
An API gateway is a single edge process that owns routing, path rewriting, and cross-cutting policy (auth, CORS, rate limiting) so clients see one stable surface instead of the internal service topology. Its job is traffic shaping, not business logic; routes match on path/host/query and clusters name backend destinations.

- Deep dive: [API Gateway]({{ '/microservices/api-gateway/' | relative_url }})

### Backend for Frontend (BFF)
A Backend-for-Frontend is a gateway scoped to one client type — mobile, web, or third-party — shaped exactly for that client's needs, so a mobile client doesn't accept the web app's response shapes or round-trip counts. Unlike a shared API gateway that serves every consumer identically, a BFF is deliberately client-specific.

- Deep dive: [Backend-for-Frontend (BFF) & Aggregator]({{ '/microservices/bff-and-aggregator-patterns/' | relative_url }})

### Aggregator pattern
An aggregator is a service (frequently the BFF itself) that fans out to multiple backend services in a single handler, merges the results, and returns one response, so the client makes one call instead of composing data itself. It also centralizes cross-service validation and deduplication that neither backend could perform alone.

- Deep dive: [BFF & Aggregator Patterns]({{ '/microservices/bff-and-aggregator-patterns/' | relative_url }})

### Service discovery
Service discovery replaces hardcoded addresses with a registry that turns discovery into a heartbeat protocol: instances register on startup and re-announce on an interval, and callers query the registry for the current instance list instead of reading a static config. Client-side discovery (Eureka + load-balancing client) puts the list and balancing in the caller; platform-native discovery (Kubernetes Service + DNS) puts both in the platform.

- Deep dive: [Service Discovery]({{ '/microservices/service-discovery/' | relative_url }})

### gRPC
gRPC is a contract-first RPC framework where a `.proto` IDL is compiled into typed client/server stubs in every language, so a field rename becomes a compile error rather than a runtime surprise. It rides HTTP/2 (multiplexed, binary) and supports unary, client-streaming, server-streaming, and bidirectional streaming shapes declared directly in the contract.

- Deep dive: [gRPC Streaming Modes]({{ '/microservices/grpc-streaming-modes/' | relative_url }}) — and [Inter-Service Communication: REST vs gRPC]({{ '/microservices/inter-service-communication-rest-and-grpc/' | relative_url }})

### Sidecar & ambassador
A sidecar is a container sharing a Pod's network namespace and lifecycle with the main app container (localhost calls between them), and at scale it's auto-injected by a mutating webhook so no team hand-adds it. An ambassador is the same co-location narrowed to one external dependency — e.g. a Cloud SQL proxy translating IAM auth and mTLS the app never implements.

- Deep dive: [Sidecar & Ambassador Patterns]({{ '/microservices/sidecar-and-ambassador-patterns/' | relative_url }})

### Service mesh
A service mesh injects a sidecar proxy (Envoy, via Istio) into every Pod that transparently intercepts all traffic, so mesh-wide config — not application code — controls mTLS, retries, and weighted routing. Policy lives in two CRDs: a DestinationRule defines subsets and connection policy; a VirtualService defines routing rules and fault injection.

- Deep dive: [Service Mesh]({{ '/microservices/service-mesh-sidecar-proxies-and-envoy/' | relative_url }})

### Token propagation (cross-service auth)
Token relay forwards the same OAuth2/OIDC access token the frontend obtained at login as a Bearer header on every downstream call, so each service validates it independently against the shared identity provider without re-authenticating the user. The token is relayed verbatim, not re-issued, which is what makes stateless, per-request validation scale without a shared session store.

- Deep dive: [Cross-Service Auth: Token Propagation]({{ '/microservices/cross-service-auth-jwt-oauth-token-propagation/' | relative_url }})

## Data & consistency

### Event-driven communication / message broker
A message broker inserts a persistent buffer between publisher and consumers: the publisher sends an event to an exchange and the broker fans it out to each subscriber's own durable queue, so a slow or offline consumer never blocks the publisher. Delivery is at-least-once — achieved by acknowledging only after successful processing — and routing keys (not a shared queue) let multiple services react to the same event independently.

- Deep dive: [Event-Driven Communication & Message Brokers]({{ '/microservices/event-driven-communication-message-brokers/' | relative_url }})

### Saga
A saga is a sequence of local transactions that coordinates a multi-step business process across services without a distributed transaction. Each step's service reacts to the previous step's event or command and publishes/triggers the next; the reliability of each link depends on the outbox pattern guaranteeing the local write and its notification both fire.

- Deep dive: [Saga & Outbox]({{ '/microservices/saga-outbox-pattern-atomic-db-write-and-publish/' | relative_url }})

### Transactional outbox
The transactional outbox writes the event to an outbox table in the same local database transaction as the business data, then a separate relay reads unpublished rows and publishes them afterward. The relay can crash between publishing and marking a row published — the row stays retriable, so the pattern trades "might publish twice" for "will never silently lose an event," which is the correct trade because duplicates are cheap for idempotent consumers.

- Deep dive: [Transactional Outbox (Saga & Outbox)]({{ '/microservices/saga-outbox-pattern-atomic-db-write-and-publish/' | relative_url }})

### Choreography vs orchestration
Choreography has each service react to the previous event and publish its own next one, with no central coordinator — the flow exists only as the sum of independent reactions. Orchestration has one saga/state machine explicitly track process state and issue each step as a command, waiting for a reply; the distinguishing factor is who decides what happens next, not the transport.

- Deep dive: [Choreography vs Orchestration]({{ '/microservices/choreography-vs-orchestration-saga-coordination/' | relative_url }})

### CQRS
CQRS (Command Query Responsibility Segregation) splits write and read paths into separate models: writes go through a rich domain model enforcing invariants via methods, while reads bypass the domain and project directly into flat, purpose-shaped view models. This form is against a single synchronous database — CQRS is fundamentally about separating models, not about accepting eventual consistency or a separate read store.

- Deep dive: [CQRS]({{ '/microservices/cqrs-separating-read-and-write-models/' | relative_url }})

### Data contracts & schema registry
A schema registry owns the canonical schema per topic, assigns each a global ID, and rejects incompatible schema changes at registration time, so a producer's field rename can't silently break consumers. When a break is necessary, a registered migration rule transforms old records into the new shape on read, letting producer and consumer teams deploy independently.

- Deep dive: [Data Contracts & Schema Evolution]({{ '/microservices/data-contracts-and-schema-evolution/' | relative_url }})

### Idempotency
Idempotency is the property that processing the same message or request multiple times yields the same result as processing it once, which lets a system safely tolerate the at-least-once delivery that brokers and the outbox pattern produce. Consumers implement it with deduplication keys or by making a handler's effect naturally repeatable, so a duplicate publish is cheap rather than corrupting state.

- Deep dive: [Idempotency in the Saga & Outbox pattern]({{ '/microservices/saga-outbox-pattern-atomic-db-write-and-publish/' | relative_url }})

## Resilience

### Circuit breaker
A circuit breaker stops sending requests to a dependency after enough consecutive failures, failing fast for a while and periodically testing recovery. It's actually two mechanisms: connection/request limiting is proactive (refuse before overload), and outlier detection is reactive (eject an endpoint after a run of failures); in a mesh these run as infrastructure config in the sidecar, not library code.

- Deep dive: [Circuit Breakers & Resilience]({{ '/microservices/circuit-breakers-and-resilience/' | relative_url }})

### Bulkhead
A bulkhead caps concurrent occupancy — how many calls can be in flight against a dependency at once — using a fixed-size pool, so a slow dependency can't exhaust the caller's threads or connections and take down unrelated requests. It's implemented with two counters: one for operations actually running and a second for how many callers may wait in line; exceeding the first means wait, exceeding the second means reject immediately.

- Deep dive: [Bulkheads]({{ '/microservices/rate-limiting-and-bulkheads/' | relative_url }})

### Rate limiting
Rate limiting caps throughput over time — how often requests are allowed — commonly via a token bucket that refills at a fixed rate, with each request consuming a token and an empty bucket queueing (bounded) or rejecting. It defends against a single client or noisy tenant overwhelming an endpoint, which is a different failure mode than the concurrency cap a bulkhead provides.

- Deep dive: [Rate Limiting & Bulkheads]({{ '/microservices/rate-limiting-and-bulkheads/' | relative_url }})

### Load shedding
Load shedding is a per-request admission decision made before the request consumes any downstream capacity: if outstanding requests meet the current limit, the request is rejected fast (e.g. a 503) rather than allowed to queue and time out slowly. It is the enforcement half of adaptive concurrency — a computed limit that isn't enforced is just a statistic.

- Deep dive: [Load Shedding & Adaptive Concurrency]({{ '/microservices/advanced-resilience-patterns-load-shedding-adaptive-concurrency/' | relative_url }})

### Adaptive concurrency
Adaptive concurrency replaces a fixed concurrency cap with a limit derived continuously from measured request latency (Envoy's gradient algorithm): the limit rises when the backend is fast and falls automatically when latency creeps up, clamped to stay smooth. A static limit is either too low most of the time or too high exactly when the backend is already struggling.

- Deep dive: [Advanced Resilience Patterns]({{ '/microservices/advanced-resilience-patterns-load-shedding-adaptive-concurrency/' | relative_url }})

### Retry storm & retry budget
Unconditional retry amplifies an outage: N clients each retrying turns one unit of load into far more against an already-overloaded backend. The fix is a cluster-wide retry budget — a shared resource limit on total in-flight retries across every caller — checked in addition to each request's own retry count, so aggregate retry volume is capped even when every individual request still has retries left.

- Deep dive: [Retry Storms & Adaptive Resilience]({{ '/microservices/advanced-resilience-patterns-load-shedding-adaptive-concurrency/' | relative_url }})

### Distributed tracing & observability
Distributed tracing assigns a trace ID at the edge and propagates it (with a per-hop span ID) through every call in-band as a header or gRPC metadata, so a collector reassembles all spans into one call graph with per-span timing. Propagation can be application-level (OpenTelemetry SDK) or infrastructure-level (mesh sidecar), and sampling is an operational decision because tracing every request has real cost.

- Deep dive: [Distributed Tracing & Observability]({{ '/microservices/distributed-tracing-and-observability/' | relative_url }})

## Deployment / topology

### Canary & blue-green deployment
Canary ramps a percentage of traffic through explicit weighted steps with pause/promote gates, while blue-green runs two full environments and cuts over via a Service selector switch. Both give traffic control and explicit promotion gates that a plain Kubernetes rolling update lacks, and blue-green rollback is instantaneous because it's just a selector change.

- Deep dive: [Deployment Strategies: Canary & Blue-Green]({{ '/microservices/deployment-strategies-canary-bluegreen/' | relative_url }})

### Externalized configuration
Externalized configuration moves settings out of the build entirely — a dedicated config server serves values keyed by application name and profile from git or another store, and services fetch them at startup. Changing a timeout or flag becomes a config-repo commit, not an application redeploy, and shared settings layer underneath per-service overrides.

- Deep dive: [Externalized Configuration]({{ '/microservices/externalized-configuration/' | relative_url }})

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.
