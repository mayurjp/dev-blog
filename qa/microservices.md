---
layout: page
title: "Microservices — Q&A Bank"
permalink: /qa/microservices/
---

Bite-sized questions and answers from Microservices blog posts. Read 5-10 per sitting. Each answer is 2-4 sentences max and links back to the full post for deeper understanding.

## Topic: Service Decomposition & Bounded Contexts (Order 1)

### Q: What is a bounded context and why does splitting by table or technical layer fail?
A bounded context is an explicit boundary where a business term (like "Product") has exactly one unambiguous meaning. Inside a Catalog context, "Product" means name, description, and images; inside an Ordering context, "Product" is just a `productId` and the price captured at purchase time. Splitting by table or technical layer fails because it moves coupling onto the network without removing it â€— two services sharing a database can still `JOIN` across each other's tables, so every deploy still requires coordination, and network latency is added on top.

### Q: How does eShop enforce bounded context boundaries at the infrastructure level?
eShop creates a separate logical Postgres database per bounded context â€— `catalogdb`, `identitydb`, `orderingdb`, `webhooksdb` â€— on the same physical server. The boundary is enforced by connection string access control: each service references only its own database. `basket-api` references Redis instead, proving bounded contexts don't require agreeing on storage technology, only on not touching each other's storage. `OrderProcessor` shares `orderingdb` with `ordering-api` because they are the *same* context split across two processes.

### Q: What is the difference between domain events and integration events?
Domain events (in `DomainEventHandlers/`) are context-internal and never leave the process. Integration events (in `IntegrationEvents/`) are the translated, minimal contracts crossing a bounded context boundary via the event bus. Publishing your internal domain model verbatim as an integration event just moves the shared-schema problem onto the event bus. The folder structure enforces this distinction in code rather than relying on documentation.

### Q: Why is a shared database the opposite of a bounded context boundary?
If two services can `JOIN` across each other's tables, they are functionally one context wearing two process hats. Schema changes still ripple everywhere, deploys still require coordination, and the network hops are pure overhead with no actual decoupling. The bounded context boundary is an access-control boundary first â€— "which service is allowed to open this connection string" â€— not just a logical separation.

### Q: When is a process boundary NOT a bounded context boundary?
`OrderProcessor` in eShop is a background worker that shares `orderingdb` with `ordering-api` â€— a separate process but the *same* bounded context, split for operational reasons. A bounded context boundary is defined by where a business concept changes meaning, not by where a process boundary exists.

### Q: What common decomposition mistake does eShop disprove?
The misconception that decomposition means "one service per database table" or "one service per REST resource." `identity-api` fronts one database, `basket-api` fronts none (Redis), and `order-processor` shares `orderingdb` with `ordering-api`. The correct unit is a business capability where a concept genuinely means something different.

→ Post: `_posts/2025-07-26-service-decomposition-and-bounded-contexts.md`

## Topic: Inter-Service Communication â€— REST/gRPC (Order 2)

### Q: Why does a polyglot system need protocol-per-boundary rather than one protocol everywhere?
REST/JSON stays at the network edge because browsers need human-readable payloads without generated code. gRPC takes over internally because the `.proto` file is a compiler-checked contract â€— a field rename becomes a compile error, not a runtime failure â€— and HTTP/2 multiplexes many calls over one TCP connection. The decision is per-boundary, not system-wide.

### Q: What problem does the `.proto` IDL solve that hand-written JSON contracts cannot?
A field rename becomes a compile error in every dependent service, not a runtime surprise. Protobuf uses field numbers (not just names), so adding optional fields is backward-compatible by construction. With JSON, each service's shape is whatever the last person typed, and mismatches between a Go caller and Python callee fail silently in production.

### Q: How does gRPC deadline propagation differ from hand-rolled REST timeouts?
gRPC automatically forwards a context's deadline to the callee as wire metadata. When `getAd` sets `context.WithTimeout(ctx, time.Millisecond*100)`, that 100ms propagates through every hop without manually passing timeout headers. With REST, each service independently reads a custom header, and if any hop forgets to propagate it, downstream services have no idea the deadline exists.

### Q: Why does microservices-demo use `insecure.NewCredentials()` â€— isn't that insecure?
It deliberately skips TLS at the application layer because the app runs inside Istio, where the sidecar proxy handles mTLS. The app talks plaintext to `localhost`, the sidecar encrypts the hop to the next sidecar, and the receiving sidecar delivers plaintext to the destination. Encryption is an infrastructure concern here, not application code.

### Q: How does the `Money` protobuf message prevent cross-language currency bugs?
`Money` is defined as a dedicated message with `currency_code`, `units`, and `nanos` â€— never a bare float. This forces every language to represent currency identically, defined once in the shared `.proto` file. Without it, each language independently decides how to represent a dollar amount in its float type, producing silent bugs until a real transaction goes wrong.

### Q: What does `grpc.StatsHandler(otelgrpc.NewServerHandler())` accomplish in checkoutservice?
It hooks OpenTelemetry into every RPC automatically at the transport level. All six downstream calls in `PlaceOrder` are traced without a single line of tracing code inside `PlaceOrder` itself â€— the stats handler intercepts every inbound and outbound RPC and writes span data, making the fan-out debuggable.

→ Post: `_posts/2025-08-03-inter-service-communication-rest-and-grpc.md`

## Topic: Service Discovery (Order 3)

### Q: Why does PetClinic use `server.port: 0` and what makes this impossible without service discovery?
`server.port: 0` asks the OS for a random free port on every boot, so multiple instances can share a host without port collisions. This makes hardcoding an address structurally impossible â€— there is no fixed address. Service discovery solves this: each instance registers with a unique ID and callers query the registry at request time.

### Q: What is the difference between client-side and platform-side service discovery?
Client-side (Eureka + load-balancing client) puts the instance list and balancing in the caller's process. Platform-native (Kubernetes Services + CoreDNS) puts both in the platform â€— the caller resolves a stable DNS name and kube-proxy handles balancing. Eureka earns its cost mainly when you're not on Kubernetes.

### Q: Why does PetClinic set `prefer-ip-address: true`?
The config comment explains directly: hostname resolution breaks in Docker/Windows dev setups. Eureka defaults to registering by hostname, but in container environments hostname resolution may not work. `prefer-ip-address: true` overrides this to register by IP, which is routable in Docker networking.

### Q: How does a registry handle an instance that crashes without deregistering?
The registry is a heartbeat contract. Instances re-announce on an interval. If an instance crashes, its heartbeat stops and the registry evicts it after a timeout. Discovery is a liveness protocol â€— it actively tracks which instances are alive, not a passive lookup table.

### Q: Why must the registry itself be reachable at a fixed address?
The registry is the one service that can't discover itself via discovery â€— it's the root of trust. If its address changed and nothing could find it, no service could discover anything. This is why Eureka runs on port 8761 and configs point at it explicitly.

### Q: Where does PetClinic's Eureka client configuration actually live?
It's fetched at boot from a separate git repository via Spring Cloud Config, not from each service's own resources. Discovery configuration is itself externalized â€— which registry to talk to can change without rebuilding the service. This follows the twelve-factor principle of separating config from code.

→ Post: `_posts/2025-08-09-service-discovery.md`

## Topic: API Gateway (Order 4)

### Q: Why does eShop have both a `mobile-bff` and `MapForwarder` in WebApp instead of one shared gateway?
A single shared gateway serving different client shapes becomes the change-coordination bottleneck decomposition was meant to avoid. `mobile-bff` is a full YARP router with clusters and transforms; `WebApp`'s `MapForwarder` is a single-line forward for one route. Production systems match the tool to the route, not force every route through the heaviest mechanism.

### Q: What does `WithMatchRouteQueryParameter` do that path-only routing cannot?
It branches on an API-version query parameter, so `v1` and `v2` clients hit the same path prefix but reach version-appropriate backends. Path-only routing requires separate URL prefixes per version, coupling the public contract to the backend's versioning strategy.

### Q: What would break without `WithTransformPathRemovePrefix("/catalog-api")`?
The public path is `/catalog-api/api/catalog/items/{id}` but the backend only sees `/api/catalog/items/{id}`. Without the transform, the backend receives an unrecognized path and returns 404. The decoupling lets the gateway remap the public surface independently of backend route changes.

### Q: Why should a gateway do traffic shaping, not business logic?
A gateway matches on path, host, and query; names backend clusters; rewrites requests. The moment business logic enters the gateway, it becomes a bottleneck for feature changes and concentrates domain knowledge instead of distributing it to services that own it.

### Q: How does `AddCluster(catalogApi)` with an Aspire project reference differ from a hardcoded hostname?
The gateway resolves targets through the same service-discovery mechanism as every other client â€— no hardcoded addresses, no special case. If a service IP changes, the gateway follows the same resolution with no manual config update.

### Q: When is a BFF preferable to a single shared API gateway?
When different clients have fundamentally different needs â€— a mobile client on a metered connection needs fewer round trips, a browser SPA can afford parallel fetches. A single shared gateway forced to serve both either over-complicates or under-serves.

→ Post: `_posts/2025-08-15-api-gateway.md`

## Topic: Externalized Configuration (Order 5)

### Q: Why shouldn't configuration be compiled into the artifact alongside the code?
Configuration and code have different lifecycles. Code changes on a release cadence with review and testing; configuration often needs to change faster â€— a timeout tuned during an incident, a flag flipped mid-day â€— without waiting on a full build pipeline. Baking config into the artifact means every config change requires a rebuild, a new image, and a new deploy.

### Q: How does Spring Cloud Config separate shared settings from per-service settings?
A shared `application.yml` carries settings genuinely identical across all services (tracing sample rate, actuator exposure, Eureka defaults) â€— one file edit changes them for eight services. Per-service files (like `customers-service.yml`) override only what differs. Profiles (`docker`, `default`) select environment-specific values from the same file, so one artifact runs differently depending on which profile is active at boot.

### Q: What problem does `spring.cloud.config.allow-override: true` solve?
Without an explicit precedence rule, "does a local property or the remote config win" becomes an ambiguity that turns into a debugging session the first time someone sets a System property to test locally. This config declares that local overrides are allowed but the remote config's `override-none: true` means local properties take precedence only when explicitly set.

### Q: Why does the config server support both git and a native filesystem backend?
The `native.searchLocations` setting lets the same config server serve from git in production and from a local filesystem in development. Externalized config doesn't mandate git specifically, only that config isn't compiled into the artifact. This pluggability means teams can start simple and adopt git-backed config later.

### Q: What happens when the config server is unreachable at service startup?
The `optional:configserver:` prefix in the client's `spring.config.import` makes the config server non-blocking â€— if unreachable, the service falls back to its local `application.yml`. Without the `optional:` prefix, a missing config server would prevent the service from starting at all, creating a hard startup dependency.

→ Post: `_posts/2025-08-21-externalized-configuration.md`

## Topic: Circuit Breakers & Resilience (Order 6)

### Q: What are the two distinct mechanisms conflated under "circuit breaking"?
Connection/request limiting is *proactive* â€— it refuses requests before you overload the callee (e.g., `maxConnections: 50`). Outlier detection is *reactive* â€— it ejects an endpoint only after it has shown a run of failures (e.g., `consecutive5xxErrors: 5`). Proactive limiting prevents overloading; reactive ejection removes already-failing nodes. Both are needed; they defend against different failure phases.

### Q: Why is circuit breaking better implemented as infrastructure than as a library in polyglot systems?
A library-based breaker (Hystrix, resilience4j) must be implemented and kept consistent in every language the company uses. An Istio `DestinationRule` is a Kubernetes custom resource applied once, mesh-wide, regardless of whether the service is Go, Java, Python, or C#. The sidecar proxy intercepts all outbound calls uniformly without any application code change.

### Q: What does `maxEjectionPercent: 50` prevent and why does Istio's demo set it to 100?
`maxEjectionPercent: 50` prevents a bad outlier-detection config from accidentally ejecting *every* instance, turning a partial failure into a total outage. Istio's demo deliberately sets it to 100 to make the failure total and the lesson unambiguous â€— it's a teaching value, not a production value.

### Q: How does an ejected endpoint return to the pool â€— is it permanent?
Ejection is temporary. After `baseEjectionTime` (e.g., 30s), the endpoint returns to the pool â€— this is the mesh equivalent of a circuit breaker's "half-open" state. The next request to that endpoint is a real probe, not a guaranteed pass. If it fails again, ejection restarts.

### Q: Why does `bookinfo`'s DestinationRule ship with subsets but no `trafficPolicy`?
Version-based routing (subsets for canary/traffic-splitting) and resilience policy (`trafficPolicy`) are separate concerns riding the same CRD. They aren't a package deal â€— production configs frequently need one without the other.

### Q: What replaced Netflix Hystrix and why is the shift more fundamental than a library swap?
Resilience4j replaced Hystrix for in-application work. But the more consequential shift for polyglot systems is moving this logic out of application code entirely into service-mesh infrastructure config, applied uniformly regardless of language. The answer to "which library" became "no library at all."

→ Post: `_posts/2025-08-27-circuit-breakers-and-resilience.md`

## Topic: Distributed Tracing & Observability (Order 7)

### Q: What makes a trace "distributed" â€— what is the actual propagation mechanism?
The trace ID and per-hop span ID travel *with* the request, in-band, as an HTTP header or gRPC metadata. The app (or sidecar) reads the incoming trace context, creates a child span, and writes the updated context onto outbound calls. A collector later reassembles all spans sharing a trace ID into one call graph. Propagation is the mechanism; without it, you just have independent per-service logs.

### Q: What is the difference between application-level and infrastructure-level trace propagation?
Application-level (OpenTelemetry SDK) reads/writes trace context into headers â€— the app must be instrumented, but it works regardless of infrastructure. Infrastructure-level (Istio sidecar) reads/writes trace headers automatically via iptables â€— no app code involved, but it only covers traffic passing through the mesh.

### Q: What happens if one service in a mesh doesn't set `otel.SetTextMapPropagator`?
Its spans silently stop linking to the rest of the trace. There is no error, no log, just a broken trace graph with orphaned spans. The propagation contract must be consistent across every service in the call chain.

### Q: Why does Istio's own sample ship `randomSamplingPercentage: 0` by default?
Tracing stays off until someone explicitly opts in. Combined with the separate `extensionProviders` mesh-config step, activating mesh tracing is a deliberate two-step process â€— register the provider, then opt a `Telemetry` resource into it. This prevents accidental tracing from generating unexpected costs.

### Q: Why is `otelgrpc.NewServerHandler()` on the gRPC server and `NewClientHandler()` on the client significant?
These are stats-handler hooks the gRPC library calls on every RPC automatically â€— not manual header-copying. That's why `PlaceOrder`'s six downstream calls all appear as children of one trace without a single line of propagation code inside `PlaceOrder` itself.

### Q: What practical difference does per-span timing make versus just span nesting?
Span nesting alone doesn't tell you which of six calls is the bottleneck. A real trace shows that `shipping.GetQuote` took 220ms of a 340ms request (65%) â€— an on-call engineer knows exactly which downstream call to investigate first, rather than guessing based on span tree shape.

→ Post: `_posts/2025-09-02-distributed-tracing-and-observability.md`

## Topic: Event-Driven Communication (Order 8)

### Q: What is a `direct` exchange in RabbitMQ and how does it achieve pub-sub?
A `direct` exchange routes messages to *every* queue bound to a matching routing key â€— fan-out, not competing consumers. Two services can both react to the exact same event independently because each has its own durable queue bound to the same routing key. This is publish-subscribe, not a single work queue.

### Q: Why does the publisher use `DeliveryMode: 2` and manual `BasicAck`?
`DeliveryMode: 2` makes the message persistent, surviving a broker restart. Manual `BasicAck` (with `autoAck: false`) means the consumer only acknowledges after successful processing â€— if it crashes mid-processing, the unacked message stays in the queue and gets redelivered. Together, this achieves at-least-once delivery.

### Q: What bug does `eventName = @event.GetType().Name` as routing key introduce?
The .NET type name IS the routing key, kept in lockstep by construction. But renaming the C# record class silently changes the routing key. Subscribers bound under the old routing key stop receiving events with no error â€— a footgun a hardcoded string example would never surface.

### Q: What limitation does the consumer code's own comment admit?
After catching a processing exception, the consumer still calls `BasicAck` â€— the message is gone. Without a dead-letter exchange (DLX), a poison message that always throw silently vanishes after one failed attempt: logged, but gone. The reference architecture is honest about this corner it cut.

### Q: Why does `IEventBus` exist as an interface in eShopOnContainers?
A sibling `EventBusServiceBus` folder implements the same interface against Azure Service Bus. Swapping brokers is a dependency-injection registration change, not application code rewrite. The interface exists for broker portability.

### Q: What is the difference between the retry wrapping the publish and a consumer's own retry?
The publish retry handles *broker connectivity* failures (`BrokerUnreachableException`, `SocketException`) with exponential backoff. A consumer's handler retry handles *processing* failures. Two different failure domains, two different strategies â€— easy to conflate.

→ Post: `_posts/2025-10-16-event-driven-communication-message-brokers.md`

## Topic: Saga & Outbox (Order 9)

### Q: What is the dual-write problem and why can't retries fix it?
Saving to the database and publishing an event are two operations against two systems with no shared transaction. If the process crashes after commit but before publish, the order exists and nothing else ever finds out. Retrying doesn't help because the two systems genuinely have no shared notion of atomicity.

### Q: How does the transactional outbox make DB write and event publish atomic?
The business transaction also writes a row to an outbox table in the same local ACID transaction â€— one database, trivially atomic. A separate relay reads unpublished rows and publishes them after commit. The relay can crash between publishing and marking a row published, and that's fine â€— the row stays retriable and a future run republishes it.

### Q: Why does the outbox use a three-state field instead of a boolean?
`InProgress` marks "a previous relay attempt started publishing and we don't know if it succeeded" â€— a state a simple `published: bool` can't represent. Three states make the relay safe to retry without ambiguity and provide diagnostic information when debugging a crash mid-relay.

### Q: How does `TransactionBehaviour` as a MediatR pipeline behavior eliminate boilerplate?
Every command handler automatically gets wrapped in begin-transaction, handle, commit, and relay without any handler knowing the outbox pattern exists. The handler calls `AddAndSaveEventAsync` and trusts the pipeline. This eliminates duplicating transaction/relay code across every command handler.

### Q: Why does the outbox pattern tolerate "might publish twice"?
A duplicate event is cheap to handle (consumers should be idempotent) while a lost event is a real, undetectable inconsistency. The pattern trades at-least-once delivery with possible duplicates for never silently losing an event â€— the correct trade because idempotent consumers are a solvable problem.

### Q: Why is two-phase commit (XA) not the real-world answer?
Production RabbitMQ/Kafka deployments essentially never support XA end-to-end, and even where a broker does, a blocked transaction coordinator can freeze the whole system. The outbox-plus-relay is the industry-standard replacement because it needs no cross-system coordinator at all.

→ Post: `_posts/2025-10-18-saga-outbox-pattern-atomic-db-write-and-publish.md`

## Topic: Service Mesh (Order 10)

### Q: How does Istio achieve mTLS without any application code change?
`iptables` rules at Pod startup intercept all traffic, redirecting it through the Envoy sidecar. The app sends plaintext to `localhost`; the sidecar performs mTLS with the destination's sidecar using mesh-issued, auto-rotated certificates. The receiving sidecar delivers plaintext to the destination app. Neither app ever runs TLS negotiation.

### Q: What is the difference between a `DestinationRule` and a `VirtualService`?
A `DestinationRule` defines named subsets plus connection policy (load-balancing, TLS). A `VirtualService` defines routing rules â€— which subset gets what traffic, fault injection, retries. They are separate concerns: one says "what subsets exist and how to connect," the other says "which subset handles which traffic."

### Q: How does Istio's fault injection differ from actually breaking a service?
The sidecar fabricates the failure (HTTP 555 at 100%) before the request reaches the app. HTTP 555 is a mesh-specific status meaning "this failure was injected by the mesh, not a real backend error," distinguishable in logs and traces from a genuine outage.

### Q: What does `failurePolicy: Fail` on the sidecar-injection webhook mean?
If the injection webhook is unreachable, the Pod CREATE is *rejected* â€— no Pod is scheduled without a sidecar. The alternative (`Ignore`) would let un-meshed Pods through, creating a security gap. This is a deliberate availability tradeoff.

### Q: Why does the Cloud SQL proxy use `restartPolicy: Always` on an `initContainer`?
This is Kubernetes' native sidecar mechanism â€— init containers with `restartPolicy: Always` start before the main app and keep running for the Pod's lifetime. It guarantees the proxy is up before the app starts, closing a startup race that plain second-container setups hit.

→ Post: `_posts/2025-10-20-service-mesh-sidecar-proxies-and-envoy.md`

## Topic: Cross-Service Auth â€— JWT/OAuth Propagation (Order 11)

### Q: What is token relay and why not re-authenticate the user per service?
Token relay forwards the same OAuth2 access token the frontend obtained at login as a Bearer header on every downstream call. Each service validates it independently (checking signature and issuer) without calling back synchronously. Re-authenticating per service breaks single sign-on and terrible UX.

### Q: Why does eShop set `ValidateAudience = false` despite defining per-service audiences?
Audience claims restrict a token to one service, preventing cross-service replay. But eShop deliberately relaxes this for a single trusted internal network â€— any token from its Identity provider works for any API. This is a reasonable simplification that needs revisiting before trusted across uncontrolled boundaries.

### Q: What is the difference between token relay and token exchange (RFC 8693)?
Relay forwards the original token verbatim. Token exchange trades it for a new, narrowly-scoped token per downstream call, so a leaked token isn't valid against other services. Relay is simpler; exchange reduces blast radius. A real architectural tradeoff.

### Q: How does `.AddAuthToken()` as a shared extension method prevent a consistency problem?
Every outgoing client registration calls `.AddAuthToken()` â€— one shared building block, not convention. Without it, each service independently implements "attach the bearer token," and the first one that forgets creates a silent authorization gap that only appears in production.

### Q: What does `DelegatingHandler` do on each outgoing call?
It reads the current user's `access_token` from the encrypted auth cookie and attaches it as `Authorization: Bearer` on every outgoing HTTP or gRPC call. The token is relayed verbatim â€— the frontend never generates or signs anything itself.

→ Post: `_posts/2025-10-22-cross-service-auth-jwt-oauth-token-propagation.md`

## Topic: Deployment Strategies â€— Canary/Blue-Green (Order 12)

### Q: What limitation of Kubernetes Deployments makes canary/blue-green impossible without a controller?
`maxSurge`/`maxUnavailable` only controls Pod replacement pace, never traffic percentage. Once replacement starts, the new version receives traffic proportional to its Pod count, with no pause gate, no automated analysis, and no instant rollback without fighting the in-progress rollout.

### Q: What does `setWeight: 20` in an Argo Rollouts canary actually control?
Roughly 20% of *requests* (not just Pods) reach the canary, enforced by the traffic-shaping backend (mesh, ingress controller, or replica-ratio). This is fundamentally different from "20% of Pods" in a Deployment.

### Q: How does blue-green rollback differ from canary rollback?
Blue-green rollback is instantaneous: the old ReplicaSet never scales down, so reverting means repointing the selector â€— no redeployment. Canary rollback requires scaling down the canary and re-routing through the mesh, which takes effect over the mesh's propagation delay.

### Q: What is the purpose of `previewService` in blue-green?
Without it, the new version is deployed and isolated but nobody can reach it to verify correctness. `previewService` makes the new version inspectable via a preview URL before promotion â€— the difference between "isolated" and "isolated AND verifiable."

### Q: Why is the first `pause: {}` without a `duration` in the canary example?
It pauses indefinitely until a human runs `kubectl argo rollouts promote`. Later steps auto-resume after timers. This is a real hybrid: the first, most risky exposure requires an explicit human gate; later, de-risked steps ramp automatically.

### Q: Can careful `maxSurge`/`maxUnavailable` tuning give you canary deployments?
No. Those fields only control Pod replacement pace, never traffic percentage, and have no pause/promote/analysis gate. Canary is a genuinely different deployment shape requiring a different controller (Argo Rollouts, Flagger, or mesh traffic-splitting).

→ Post: `_posts/2025-10-24-deployment-strategies-canary-bluegreen.md`

## Topic: Rate Limiting & Bulkheads (Order 13)

### Q: Why are rate limiting and bulkheads two different mechanisms for two different failure modes?
Rate limiting (token bucket) caps throughput over time â€— defending against a noisy client. Bulkheads cap concurrent occupancy â€— defending against a slow downstream draining the calling service's thread pool. A service within its rate budget can still be brought down by a slow dependency blocking all threads.

### Q: How does Polly's bulkhead implement two separate semaphores?
One semaphore tracks actually running operations (the concurrency cap). A second tracks how many callers can wait in line. The queue check is non-blocking (`TimeSpan.Zero`): if the queue is full, reject immediately. Exceeding the run semaphore means "wait in queue"; exceeding the queue semaphore means "reject right now."

### Q: What is the difference between `QueueProcessingOrder.OldestFirst` and `NewestFirst`?
Oldest-first is fairness-oriented (first come, first served). Newest-first favors latency for the most recent caller at the cost of starving older requests. ASP.NET Core's sample uses OldestFirst for per-endpoint limiters (fairness) and NewestFirst for the global backstop (latency under total load).

### Q: Why does ASP.NET Core pair a per-endpoint token bucket with a global concurrency limiter?
The per-endpoint bucket caps throughput for abuse prevention. The global concurrency limiter is a backstop against total resource exhaustion across the entire app. They address different scopes: individual endpoint abuse vs. whole-service thread-pool exhaustion.

### Q: Why can't you substitute one mechanism for the other?
A concurrency cap alone doesn't stop fast request bursts from overwhelming a cheap endpoint. A rate cap alone doesn't prevent slow responses from filling all threads. They defend against orthogonal failure modes â€— frequency vs. duration.

→ Post: `_posts/2025-10-26-rate-limiting-and-bulkheads.md`

## Topic: CQRS (Order 14)

### Q: What is CQRS and why doesn't it require a separate read database?
CQRS splits writes (rich domain model with invariants) from reads (flat, purpose-shaped DTOs with no business logic). Against a single synchronously-consistent database, both paths hit the same `DbContext`. The read side bypasses the aggregate entirely with raw LINQ projections. This is CQRS as model separation, not infrastructure â€— the more common production shape.

### Q: Why is `order.AddOrderItem()` significant compared to a public setter?
`AddOrderItem()` enforces invariants through a business method â€— the aggregate is the single source of truth. A public `OrderItems` setter lets any caller mutate directly, bypassing invariant enforcement. The read side has no such constraints because reads don't protect anything.

### Q: How does `OrderQueries.GetOrdersFromUserAsync` differ from calling through the Order aggregate?
It queries the EF Core `DbSet` directly and projects into DTOs via LINQ, never touching the `Order` domain type. It computes `Total` inline as a database-translatable expression rather than calling the aggregate's `GetTotal()` method â€— the read side is free to duplicate calculations as SQL expressions.

### Q: What common over-engineering mistake does this example avoid?
Reaching for a fully separate read database with async event projection when a same-database model split already solves the problem. The query side reads the exact same rows with zero staleness. Event-sourced CQRS is an optional escalation, not a requirement.

### Q: Why does CQRS against a single database still have value?
It enforces model separation: writes go through invariants, reads get purpose-shaped projections. Without the split, you either water down the write model (losing invariant enforcement) or every read pays the cost of loading a rich domain object it has no use for.

→ Post: `_posts/2025-10-28-cqrs-separating-read-and-write-models.md`

## Topic: Strangler Fig (Order 15)

### Q: How does the Strangler Fig keep a system functional during migration?
A facade (reverse proxy) sits in front of the whole system. Every request goes through its route table. One capability at a time gets rebuilt; when ready, exactly one route is repointed. Nothing else changes. Each route independently points at exactly one working implementation â€— no "half-migrated" state.

### Q: What makes reverting a single migration step trivial?
Reverting means repointing one route back to the legacy cluster â€— not rolling back a deployment or restoring a database. The blast radius of a bad migration step is exactly the one route that changed. The old implementation stays deployed throughout.

### Q: What is the difference between Strangler Fig routing and data migration?
Strangler Fig is fundamentally a *routing* pattern â€— a reverse proxy's route table is the complete facade. Migrating the *data* underneath is a separate concern, handled with dual-writes or change-data-capture. It's an addition on top, not a requirement.

### Q: How does version-based query-parameter matching support gradual migration?
`api-version: "1.0"` routes to legacy, `api-version: "2.0"` routes to new â€— old and new clients hit different backends for the same endpoint. This is finer-grained than path-level cutover, migrating server-side while old clients continue working against legacy.

### Q: Does Strangler Fig only apply to monolith-to-microservices migrations?
No â€— it applies to monolith-to-monolith, framework swaps, or replacing a single subsystem. Its defining property is the incremental, revertible, route-at-a-time cutover, independent of what architecture sits on either side.

→ Post: `_posts/2025-10-30-strangler-fig-incremental-monolith-migration.md`

## Topic: Sidecar & Ambassador Patterns (Order 16)

### Q: What makes sidecar injection viable at scale versus hand-adding the container?
Istio's `MutatingWebhookConfiguration` intercepts every Pod CREATE and adds `istio-proxy` automatically. The Deployment author never writes the container block. A pattern requiring every team to correctly hand-copy YAML would fail the consistency goal it exists for.

### Q: What is the difference between a mesh sidecar and an ambassador?
A mesh sidecar handles *all* traffic for the Pod. An ambassador is scoped to *one specific external dependency*, translating its protocol and auth. Same structural pattern at different scopes.

### Q: How does the Cloud SQL Auth Proxy work as an ambassador?
The app connects to `127.0.0.1:5432` like local Postgres. The ambassador handles IAM-based authentication, mTLS to Cloud SQL, and certificate rotation. The app has zero knowledge of IAM, certificates, or Cloud SQL's real protocol.

### Q: What does `failurePolicy: Fail` on the sidecar-injection webhook mean?
If the webhook is unreachable, Pod CREATE is rejected â€— no Pod without a sidecar. The alternative (`Ignore`) lets un-meshed Pods through, creating a security gap.

### Q: Why does the Cloud SQL proxy use `initContainer` with `restartPolicy: Always`?
Kubernetes' native sidecar mechanism: starts before the main app, keeps running for the Pod's lifetime. Guarantees the proxy is accepting connections before the app starts, closing a startup race.

→ Post: `_posts/2025-11-01-sidecar-and-ambassador-patterns.md`

## Topic: Anti-Corruption Layer (Order 17)

### Q: What makes an ACL more than just "program against an interface"?
A pass-through wrapper with no translation isn't an ACL â€— your domain is still shaped by the vendor's model. The defining job is *translation at a real boundary*. `CatalogAI` truncates every provider's output to 384 dimensions regardless of native length. That normalization is what makes it a genuine ACL.

### Q: How does `ICatalogAI` enforce the "only one file knows the external type" rule?
`ICatalogAI` speaks only eShop's own types. The sole `CatalogAI` implementation references the vendor SDK. Grepping the codebase for the external type should find it in exactly one file. No caller references vendor types directly.

### Q: Why does `IsEnabled` belong on the ACL interface?
`GetEmbeddingAsync` returns `null` cleanly when unconfigured, rather than every call site needing its own "is AI on" branch. The ACL absorbs availability as part of its contract, centralizing a cross-cutting concern.

### Q: What would happen without the ACL when swapping providers?
Every call site referencing the vendor SDK type, its response shape, and native dimension count would need to change. With the ACL, only the `CatalogAI` implementation changes â€— a single-file swap.

### Q: Why is the 384-dimension truncation the real work, not boilerplate?
Different providers natively produce different vector lengths. The database schema has a fixed column type. The ACL normalizes to the schema's expectation so swapping providers never requires a schema migration.

→ Post: `_posts/2025-11-03-anti-corruption-layer.md`

## Topic: Choreography vs Orchestration (Order 18)

### Q: What is the fundamental difference between choreography and orchestration?
In choreography, each service reacts to an event and publishes its own next event â€— the flow exists only as the sum of independent reactions. In orchestration, one coordinator explicitly tracks state and issues each step as a command. The distinguishing factor is *who decides what happens next*, not the transport.

### Q: Why is choreography hard to debug despite having no coordination failure point?
Adding a new participant needs zero changes to existing services. But the process logic is scattered across every service's event handlers. "Why didn't this order ship?" means tracing across every participating service's codebase â€— there is no single place showing the whole flow.

### Q: How does `InstanceState(x => x.CurrentState)` make saga correlation work?
Incoming events are matched to the correct in-flight saga instance by correlation ID. `CurrentState` makes "we're still waiting for `CallConnected`" a real, persisted fact between messages â€— not something rebuilt from scratch on each event.

### Q: What does it mean that events outside a `During` block are "ignored by construction"?
Only events listed under the current state's `During` block are valid transitions. Unlisted events are silently dropped. Invalid transitions are unreachable by design, eliminating state-corruption bugs.

### Q: Why is the idea that "orchestration means synchronous" wrong?
MassTransit sagas are driven entirely by messages over the same broker. The coordinator is another message consumer with persisted state, not a synchronous RPC hub. The distinction is centralized state tracking vs. distributed stateless reactions.

→ Post: `_posts/2025-11-05-choreography-vs-orchestration-saga-coordination.md`

## Topic: BFF & Aggregator Patterns (Order 19)

### Q: What is the difference between a BFF and a generic API gateway?
A shared API Gateway is client-agnostic, serving every consumer identically. A BFF is client-*specific*, one per frontend type. A mobile BFF and web BFF can shape the same data completely differently.

### Q: How does the BFF/Aggregator reduce round trips for mobile clients?
One call to the BFF; it fans out to Catalog.API and Basket.API internally, merges results, returns one response. The mobile client never sees two responses and never needs to know Catalog.API exists.

### Q: What cross-service validation does the aggregator enable?
The BFF validates across both Catalog.API and Basket.API data *before* committing â€— returning `BadRequest` for a non-existent catalog item. Neither service individually could perform this cross-service check.

### Q: Where does product deduplication happen and why?
Inside the aggregator via `GroupBy(x => x.ProductId).Sum(i => i.Quantity)`. If a mobile UI submits the same product twice, the BFF collapses it. This logic would need to be duplicated in every client otherwise.

### Q: When is GraphQL a better aggregation choice than a BFF?
GraphQL provides one flexible API surface; BFF provides per-client-optimized surfaces. BFF is preferable when different clients need fundamentally different response shapes â€— mobile needs fewer fields than a web SPA.

→ Post: `_posts/2025-11-07-bff-and-aggregator-patterns.md`

## Topic: gRPC Streaming Modes (Order 20)

### Q: What are the four gRPC streaming modes and where is each appropriate?
Unary is request/response (CRUD). Client streaming uploads chunks as produced, one final response (file upload). Server streaming returns a large or slow result set (live feed). Bidirectional streaming supports ongoing, independent conversation where either side sends at any time (chat, real-time sync).

### Q: Why does bidirectional streaming require the server to read and write concurrently?
Client and server streams are genuinely independent â€— the server can write to the response stream from another client's message while reading from the current client. Sequential lockstep would block forwarding while waiting for the current sender.

### Q: What does `requestStream.ReadAllAsync()` achieve in client streaming?
It reads every incoming message, signals completion, then produces one final reply. No response until the entire client stream is exhausted â€— strict relay ensuring the complete dataset before computing the result.

### Q: Why does `SayHellos` write to `responseStream` inside the same loop reading from upstream?
Each message is forwarded the moment it arrives â€— a streaming pipeline, not a batch response. The client starts receiving results before the server finishes producing all of them.

### Q: What limitation makes bidirectional streaming unreliable from browsers without proxies?
Browsers can't speak native gRPC. gRPC-Web only reliably supports unary and server-streaming. Full bidi requires a proxy (Envoy) to translate between browser HTTP limitations and gRPC framing.

### Q: What happens when a chat client disconnects from `ChatterService`?
`_subscribers.Remove(responseStream)` cleans up on disconnect. Without it, a dead stream stays in the set, causing `WriteAsync` to throw and potentially breaking iteration over other subscribers.

→ Post: `_posts/2025-11-09-grpc-streaming-modes.md`
---

**Last updated:** July 2026 | **Total Q&A:** 110 across Microservices

[Back to Q&A Index]({{ '/qa/' | relative_url }}) • [All Microservices posts]({{ '/microservices/' | relative_url }})
