---
layout: page
title: "Design Patterns — Q&A Bank"
permalink: /qa/design-patterns/
---

Bite-sized questions and answers from Design Patterns blog posts. Read 5-10 per sitting. Each answer is 2-4 sentences max and links back to the full post for deeper understanding.

## Topic: Strategy pattern (Order 1)

### Q: What problem does the Strategy pattern solve that an enum + switch statement doesn't?
An enum + switch at the call site couples every caller to every possible behavior — adding a new strategy means editing code you don't own. Strategy puts each algorithm behind a common interface so the caller depends only on the abstraction, and new behaviors are added by creating a new class, not editing any caller.
→ Post: `_posts/2025-09-12-strategy-pattern-pluggable-behavior.md`

### Q: How does Polly's `ResilienceStrategy` abstract differ from a typical textbook Strategy interface?
Polly's contract is a single method (`ExecuteCore`) operating on an opaque `Func` callback — the strategy has no idea what it's retrying or timing out (HTTP, database, gRPC). This makes one strategy reusable across every kind of call in a codebase, whereas a textbook interface often leaks domain-specific parameters.
→ Post: `_posts/2025-09-12-strategy-pattern-pluggable-behavior.md`

### Q: Why does `ShouldHandle` in Polly's retry strategy take a delegate rather than a hardcoded exception type?
`ShouldHandle` is injected separately from the retry loop mechanism — this is a second, smaller instance of Strategy-within-Strategy. The mechanism (retry N times) is decoupled from the policy (which outcomes count as failures), so the same retry loop can be configured with different failure-detection logic per call site.
→ Post: `_posts/2025-09-12-strategy-pattern-pluggable-behavior.md`

### Q: What happens if the context class in a Strategy pattern contains an `if (strategy is RetryStrategy)` check?
You've reintroduced the switch statement one layer deeper — the context is no longer strategy-agnostic, and adding a new strategy now requires editing the context. The pattern's entire value (open for extension, closed for modification) is defeated.
→ Post: `_posts/2025-09-12-strategy-pattern-pluggable-behavior.md`

### Q: What's a common gotcha when designing the Strategy interface in a resilience library?
Making the interface too broad — if `ExecuteCore` had parameters specific to retries (attempt count, delay) or specific to timeouts (duration), strategies would need to know about each other's concerns. The contract must be genuinely minimal (one method, opaque callback) or the strategies become coupled.
→ Post: `_posts/2025-09-12-strategy-pattern-pluggable-behavior.md`

### Q: When would you choose Strategy over simply subclassing the context class?
When behaviors need to be swapped at runtime, composed in different combinations, or shared across unrelated call sites. Subclassing bakes behavior into the class hierarchy at compile time; Strategy lets you inject different algorithms per instance, or even per call, without inheritance.
→ Post: `_posts/2025-09-12-strategy-pattern-pluggable-behavior.md`

## Topic: Factory Method & Abstract Factory (Order 2)

### Q: What does `IDbContextFactory<T>` hide that a `new DbContext(options)` call never could?
A factory call can internally pool/recycle instances, use cached constructor delegates, or wrap construction with additional setup — the caller just receives a `T` either way. A direct `new` always allocates a fresh instance, making that choice impossible to change without editing every call site.
→ Post: `_posts/2025-12-25-factory-method-and-abstract-factory.md`

### Q: How does EF Core's `PooledDbContextFactory` make `Dispose()` mean something different?
When you dispose a pooled `DbContext`, the `DbContextLease` wrapper returns the instance to the pool instead of destroying it. The caller's `using` statement looks identical to the non-pooled case, but "dispose" now means "return for reuse" rather than "deallocate" — entirely because of which factory implementation was injected.
→ Post: `_posts/2025-12-25-factory-method-and-abstract-factory.md`

### Q: What tradeoff does a pooled factory introduce compared to a plain factory?
Pooled factories require that `DbContext` instances are stateless enough to be safely recycled — any leaked state from a previous request contaminates the next one. The pool also adds memory pressure from retained instances, and disposal semantics change (callers must actually dispose to return instances, not just abandon them).
→ Post: `_posts/2025-12-25-factory-method-and-abstract-factory.md`

### Q: Why does even EF Core's "plain" `DbContextFactory` use a cached delegate instead of `new TContext(...)` directly?
Compiling and caching a constructor-invoking delegate once is significantly faster than reflection-based instantiation on every call. Even the non-pooled implementation has its own internal factory indirection for performance — the public contract is the same, but the mechanism underneath still avoids repeated reflection overhead.
→ Post: `_posts/2025-12-25-factory-method-and-abstract-factory.md`

### Q: How does switching from a plain factory to a pooled factory work in a real EF Core app?
It's a DI configuration change only — swap `services.AddDbContextFactory<T>()` for `services.AddPooledDbContextFactory<T>()`. Every line of application code calling `factory.CreateDbContext()` continues working unmodified, because the caller depends on `IDbContextFactory<T>`, not on the concrete factory type.
→ Post: `_posts/2025-12-25-factory-method-and-abstract-factory.md`

### Q: What's the relationship between Factory Method and Abstract Factory in modern practice?
Classic GoF Abstract Factory used deep inheritance hierarchies with many concrete product subclasses. In modern practice, the pattern shows up as a single generic interface with a small number of interchangeable implementations selected via DI — the underlying principle (depend on abstraction, not constructor) survived, but the heavyweight class-hierarchy machinery mostly didn't.
→ Post: `_posts/2025-12-25-factory-method-and-abstract-factory.md`

## Topic: Singleton (and why it's often an anti-pattern) (Order 3)

### Q: What is a "captive dependency" and why does it cause silent data corruption?
A captive dependency occurs when a singleton service captures a scoped service (like a `DbContext`) in its constructor — that scoped instance lives forever instead of being recreated per request. Under concurrent load, unrelated requests share and mutate the same `DbContext`, its change tracker accumulates entities without bound, and data silently corrupts.
→ Post: `_posts/2025-12-27-singleton-anti-pattern-and-di-lifetime-validation.md`

### Q: How does ASP.NET Core's DI container detect captive dependencies?
The `CallSiteValidator` walks a singleton's entire transitive dependency tree at validation time (not just direct constructor parameters). If it finds a scoped service anywhere in that tree, it throws `ScopedInSingletonException` at startup — catching the bug before any request is served, rather than letting it manifest under concurrent load in production.
→ Post: `_posts/2025-12-27-singleton-anti-pattern-and-di-lifetime-validation.md`

### Q: What happens if a scoped service is deeply nested in a singleton's dependency tree (not a direct parameter)?
The validator still catches it — `VisitConstructor` and `VisitIEnumerable` recurse through `VisitCallSite` on every parameter and element, propagating "did I find a scoped service in my subtree" back up to the caller. The check is transitive, not shallow.
→ Post: `_posts/2025-12-27-singleton-anti-pattern-and-di-lifetime-validation.md`

### Q: When is a Singleton lifetime actually appropriate in a DI-based system?
For genuinely stateless or thread-safe shared resources — a connection pool, a cache client, a configuration reader. Never for request-specific state or anything that holds per-unit-of-work data like a `DbContext`.
→ Post: `_posts/2025-12-27-singleton-anti-pattern-and-di-lifetime-validation.md`

### Q: Why does the CallSiteValidator cache its results per `callSite.Cache.Key`?
A large application's DI graph can be deep and shared across many registrations. Re-walking the same dependency subtree from scratch on every validation call would make startup validation itself a real performance cost — the `ConcurrentDictionary` avoids redundant tree walks.
→ Post: `_posts/2025-12-27-singleton-anti-pattern-and-di-lifetime-validation.md`

### Q: What's the gotcha with the CallSiteValidator's `argument.Singleton` threading mechanism?
`argument.Singleton` is only set inside `VisitRootCache` and threaded down via mutable `CallSiteValidatorState`. A scoped service resolved from a Scoped or Transient consumer triggers no exception — the validator correctly distinguishes "scoped service exists somewhere" (fine) from "scoped service exists inside a singleton's subtree" (the bug) by tracking which lifetime context it's currently inside.
→ Post: `_posts/2025-12-27-singleton-anti-pattern-and-di-lifetime-validation.md`

## Topic: Observer pattern (Order 4)

### Q: What problem does copy-on-Write solve for the Observer pattern that a lock around the notification path doesn't?
Locking the notification path serializes all publishing under contention — a real throughput bottleneck for high-frequency events. Copy-on-write makes the publish path completely lock-free (a single `Volatile.Read`), at the cost of slightly more expensive subscribe/unsubscribe (building a new array), which is the less frequent operation.
→ Post: `_posts/2025-12-29-observer-pattern-lock-free-subjects.md`

### Q: How does Rx.NET's `Subject<T>` handle an observer subscribing after the stream has already terminated?
It immediately replays the terminal notification — `OnError` or `OnCompleted` — to the new observer instead of silently accepting a subscription that will never fire. The subscribe method checks if the current array reference equals the `Terminated` sentinel and dispatches the final signal right away.
→ Post: `_posts/2025-12-29-observer-pattern-lock-free-subjects.md`

### Q: Why does Rx.NET use two separate sentinel arrays (`Terminated` and `Disposed`) instead of sharing one empty array?
The code checks which specific sentinel it's looking at via reference identity (`== Terminated` vs `== Disposed`), not by content. `OnNext` checks against `Disposed` and throws; `Subscribe` checks against `Terminated` and replays the terminal signal — the same-length array means two entirely different behaviors depending on *which object* it is.
→ Post: `_posts/2025-12-29-observer-pattern-lock-free-subjects.md`

### Q: What happens if two threads subscribe concurrently — does one observer get lost?
No — the `Interlocked.CompareExchange` retry loop handles this. Each thread reads the current array, builds a new one with its observer added, and tries to swap. If another thread's swap won the race, the first thread retries from scratch with the updated array. Every subscriber eventually appears.
→ Post: `_posts/2025-12-29-observer-pattern-lock-free-subjects.md`

### Q: Why is the `Interlocked.CompareExchange` retry loop intentionally unbounded?
Under contention, a thread might lose the race multiple times, but each retry is cheap (build a small array, try again). The alternative — a lock — would mean threads *blocking* rather than retrying, which is strictly worse for a hot notification path under real concurrent load.
→ Post: `_posts/2025-12-29-observer-pattern-lock-free-subjects.md`

### Q: What's the common mistake when implementing Observer in a concurrent system?
Using a mutable `List<Observer>` without synchronization. This either throws "collection was modified" during iteration (if a subscribe/unsubscribe happens mid-notify) or requires a lock around every publish, serializing all notification under contention. Production reactive libraries use lock-free copy-on-write instead.
→ Post: `_posts/2025-12-29-observer-pattern-lock-free-subjects.md`

## Topic: Decorator pattern (Order 5)

### Q: How does nesting order change behavior when composing a retry with a circuit breaker in Polly?
Retry wrapping a circuit breaker means the breaker's state is re-evaluated on every retry attempt — a retry can be short-circuited mid-sequence if the breaker trips partway through. Circuit breaker wrapping a retry means the breaker sees the whole retry sequence as one opaque unit, counting the entire sequence as a single success or failure.
→ Post: `_posts/2025-12-31-decorator-pattern-policy-wrapping.md`

### Q: What's the mechanism that makes policy composition work in Polly's `WrapAsync`?
`outerPolicy.ExecuteAsync` calls a lambda that calls `innerPolicy.ExecuteAsync(func)`. The outer policy never sees the original function — only a wrapped version that routes through the inner policy first. Each layer is genuinely blind to what's further inside it, only aware of "the thing I was asked to execute."
→ Post: `_posts/2025-12-31-decorator-pattern-policy-wrapping.md`

### Q: Why does Polly need four separate `WrapAsync` overloads instead of one generic "wrap anything in anything" method?
The public interface (`IAsyncPolicy`) and internal concrete class (`AsyncPolicy`) are deliberately separate. The overload set covers every combination of generic/non-generic outer and inner policy, keeping the composed result's type correct through the type system rather than relying on loosely-typed "wrap anything."
→ Post: `_posts/2025-12-31-decorator-pattern-policy-wrapping.md`

### Q: How does modern Decorator differ from the textbook GoF class-wrapping version?
Classic Decorator uses object instances sharing an inheritance hierarchy. Modern Polly-style Decorator composes functions/delegates (`Func<Context, CancellationToken, Task<TResult>>`) rather than objects — the underlying principle (wrap, add behavior, delegate to the wrapped thing) is identical, but delegate composition replaced class inheritance as the mechanism.
→ Post: `_posts/2025-12-31-decorator-pattern-policy-wrapping.md`

### Q: When would you use Decorator instead of Strategy for cross-cutting concerns?
Decorator wraps behavior *around* a call (adding logging, retries, timeouts as layers), while Strategy *replaces* the algorithm entirely (swapping retry for circuit breaker). Use Decorator when you want to add orthogonal concerns without changing the core behavior; use Strategy when the behavior itself needs to be interchangeable.
→ Post: `_posts/2025-12-31-decorator-pattern-policy-wrapping.md`

### Q: What's a common mistake when reordering decorators?
Assuming order doesn't matter because the same policies are applied. In reality, retry-outside-timeout means each retry attempt gets its own timeout window; timeout-outside-retry means the entire retry sequence shares one timeout, potentially cutting off retries partway through. Same code, genuinely different resilience behavior.
→ Post: `_posts/2025-12-31-decorator-pattern-policy-wrapping.md`

## Topic: Adapter pattern (Order 6)

### Q: How does Django's `BaseDatabaseOperations` qualify as an Adapter rather than a Facade?
An Adapter reconciles genuinely incompatible interfaces into a common shape — MySQL, Postgres, SQLite, and Oracle really do disagree on quoting rules, auto-increment retrieval, and identifier handling. A Facade simplifies complexity behind a new interface without necessarily resolving pre-existing incompatibilities. Django's backends resolve real dialect disagreements.
→ Post: `_posts/2026-01-02-adapter-pattern-database-backends.md`

### Q: What does Oracle's `quote_name` adapter do that makes it more than a simple character swap?
Oracle forces identifiers uppercase, truncates to `max_name_length()`, and applies quoting — reflecting Oracle's genuinely different, historically case-insensitive-by-default and length-limited identifier rules. This is the real test of a proper Adapter: reconciling an actually different set of underlying rules into the same call signature.
→ Post: `_posts/2026-01-02-adapter-pattern-database-backends.md`

### Q: Why does every concrete `quote_name` in Django check if the name is already quoted before re-wrapping?
Query-building code composes SQL fragments from multiple sources and could plausibly call `quote_name` on an already-quoted value. Each adapter defensively handles this idempotency case instead of silently producing doubly-quoted, broken SQL.
→ Post: `_posts/2026-01-02-adapter-pattern-database-backends.md`

### Q: Why does `BaseDatabaseOperations.quote_name` raise `NotImplementedError` instead of providing a default?
Quoting rules are so backend-specific that there's no safe generic default — every concrete backend is *required* to supply its own. Forgetting to implement it fails loudly at first use rather than silently producing SQL that happens to work only on whichever database was tested against.
→ Post: `_posts/2026-01-02-adapter-pattern-database-backends.md`

### Q: What happens if a new Django backend is added but forgets to implement `quote_name`?
It hits `NotImplementedError` at the first query that needs identifier quoting — a loud, immediate failure at runtime. This is a deliberate design choice: a silent default would produce SQL that looks correct but breaks on a different database, which is much harder to diagnose.
→ Post: `_posts/2026-01-02-adapter-pattern-database-backends.md`

## Topic: Command pattern (Order 7)

### Q: Why is the Command pattern in Redis valuable beyond its classic undo/redo use case?
Redis doesn't use commands for undo/redo — it uses them to decouple generic request-handling infrastructure (parsing, timing, replication logging, ACL checks) from 200+ individual command implementations. The generic mechanics are written once around `c->cmd->proc(c)`, and adding command number 201 doesn't touch any of that infrastructure.
→ Post: `_posts/2026-01-04-command-pattern-redis-dispatch.md`

### Q: What role does the `redisCommand` struct play beyond holding a function pointer?
It's a self-describing unit — `acl_categories`, `key_specs`, and `flags` are metadata the generic dispatch machinery reads to make decisions (is this client allowed? which keys does it touch for cluster routing?) *before* ever calling `proc`. The command-as-object is introspectable without executing it.
→ Post: `_posts/2026-01-04-command-pattern-redis-dispatch.md`

### Q: Why does Redis wrap `CLIENT_EXECUTING_COMMAND` flag-setting around the single dispatch line?
Tracking "is a command currently executing" (needed for client-side caching notifications) is written once, around `c->cmd->proc(c)`, and automatically correct for every current and future command. Without this pattern, every new command implementation would need to remember to add this bookkeeping.
→ Post: `_posts/2026-01-04-command-pattern-redis-dispatch.md`

### Q: What's the gotcha with using a giant if/else dispatch instead of the Command pattern?
Every cross-cutting concern (timing, logging, replication, ACL tracking) has to be re-threaded through each branch by hand. Adding a new command means editing the central dispatch code every time, coupling infrastructure to individual command implementations.
→ Post: `_posts/2026-01-04-command-pattern-redis-dispatch.md`

### Q: When does the Command pattern become overkill versus a simple strategy dispatch?
When you don't need the command to carry metadata, be queued, logged, or introspected before execution — if the only goal is swapping behavior, Strategy is lighter. Command's value emerges when the request object itself needs to be treated as a first-class entity (queued, persisted, replayed, or inspected by infrastructure).
→ Post: `_posts/2026-01-04-command-pattern-redis-dispatch.md`

### Q: How does Redis's command table differ from a switch-based dispatch in terms of extensibility?
A switch statement requires editing the central dispatcher for every new command. Redis's `commandTable[]` array lets new commands be added by appending a struct entry — the generic dispatch path (`c->cmd->proc(c)`) is unchanged, following open/closed principle.
→ Post: `_posts/2026-01-04-command-pattern-redis-dispatch.md`

## Topic: Builder pattern (Order 8)

### Q: Why does every EF Core builder method return `this` instead of void?
Returning the same builder instance enables fluent chaining (`.UseModel(...).UseLoggerFactory(...)`), making a complex configuration read as one coherent statement. Underneath, each call actually swaps in a brand-new immutable configuration extension — the builder reference stays constant while the data it holds is rebuilt.
→ Post: `_posts/2026-01-06-builder-pattern-fluent-immutable-options.md`

### Q: What problem does the immutable-extension-swap inside EF Core's builder solve?
If the configuration data were a mutable shared object handed out to multiple consumers (several `DbContext` instances from one cached options set), one code path's configuration change would silently affect every other consumer. Immutable extensions prevent this — each consumer gets a snapshot that can't be mutated by another.
→ Post: `_posts/2026-01-06-builder-pattern-fluent-immutable-options.md`

### Q: How does `WithOption` in `DbContextOptionsBuilder` handle the very first configuration call?
`Options.FindExtension<CoreOptionsExtension>() ?? new CoreOptionsExtension()` uses null-coalescing — if no extension exists yet, one is created fresh. This lets `UseModel(...)` work correctly whether it's the first call in the chain or the fifth.
→ Post: `_posts/2026-01-06-builder-pattern-fluent-immutable-options.md`

### Q: Where does the actual immutable-update logic live — on the builder or on the extension?
On the extension itself — `CoreOptionsExtension` has its own `With*` methods that return new instances of itself. The builder's role is purely orchestration: call the right `With*`, swap it in, return `this`. The data object owns its own immutability protocol.
→ Post: `_posts/2026-01-06-builder-pattern-fluent-immutable-options.md`

### Q: Why is the fluent builder pattern superior to a constructor with dozens of optional parameters?
Positional optional arguments are unreadable and easy to mix up (does the 7th parameter mean logger or connection string?). Individual setter calls don't guarantee required steps happened. A fluent builder reads as one coherent configuration statement while letting each method enforce its own validation.
→ Post: `_posts/2026-01-06-builder-pattern-fluent-immutable-options.md`

### Q: What's a common mistake when implementing fluent builders?
Returning `new Builder()` from each method instead of `this` — this breaks the chain because each call operates on a different builder instance with different accumulated state. The entire fluent pattern depends on all methods returning the same builder reference so each call mutates the same builder.
→ Post: `_posts/2026-01-06-builder-pattern-fluent-immutable-options.md`

## Topic: Dependency Injection (Order 9)

### Q: How does a DI container decide which constructor to call when a class has three constructors?
It sorts constructors by parameter count (most first), then tries each in order, picking the first whose parameters are all resolvable. If a shorter constructor is also resolvable, its parameters must be a strict subset of the winner's — otherwise it's treated as a genuine ambiguity error.
→ Post: `_posts/2026-01-08-dependency-injection-constructor-selection-and-cycles.md`

### Q: What happens when two constructors require genuinely different, non-overlapping sets of resolvable services?
The container throws an ambiguity error rather than guessing. Two constructors requiring different services that aren't subsets of each other represent a real design ambiguity — the developer must resolve it, not the container.
→ Post: `_posts/2026-01-08-dependency-injection-constructor-selection-and-cycles.md`

### Q: How does the circular dependency detection turn a stack overflow into a readable error?
`CallSiteChain` tracks which services are currently being resolved, in order, as the container recursively walks constructor dependencies. Before resolving service X, it checks whether X is already in the chain — if so, it throws with the exact resolution path (`A -> B -> C -> A`) built from insertion-ordered tracking.
→ Post: `_posts/2026-01-08-dependency-injection-constructor-selection-and-cycles.md`

### Q: Why does `CallSiteChain` use `_callSiteChain.Count` at insertion time instead of dictionary iteration order?
Dictionaries don't guarantee insertion order. The chain explicitly tracks *when* each service entered resolution via `ChainItemInfo(_callSiteChain.Count, ...)` so the error message reconstructs the resolution path in the order it actually happened.
→ Post: `_posts/2026-01-08-dependency-injection-constructor-selection-and-cycles.md`

### Q: Why does `CallSiteChain` have both `Add` and `Remove` methods?
The chain reflects only what's *currently* on the resolution stack — a service successfully resolved gets removed, so resolving the same service again later (as a separate, independent request) doesn't falsely trigger the circular-dependency check.
→ Post: `_posts/2026-01-08-dependency-injection-constructor-selection-and-cycles.md`

### Q: What's a common mistake that triggers an ambiguous-constructor exception?
Adding a new optional dependency to a constructor that was previously the only resolvable one, when another shorter constructor already exists and is also resolvable. The container now sees two resolvable constructors with non-subset parameter sets — the fix is either removing the ambiguity or using a factory delegate.
→ Post: `_posts/2026-01-08-dependency-injection-constructor-selection-and-cycles.md`

## Topic: Repository pattern (Order 10)

### Q: Why does eShop wrap EF Core's `DbSet<T>` in an `IOrderRepository` layer?
Because `DbSet<T>` doesn't encode how a specific aggregate needs to be loaded correctly. A naive `FindAsync` returns an `Order` with `OrderItems` unloaded — a technically-successful query that hands back an incomplete aggregate. `IOrderRepository.GetAsync` centralizes the eager-loading rule in exactly one place.
→ Post: `_posts/2026-01-10-repository-pattern-aggregate-loading.md`

### Q: Where does `IOrderRepository` live and why does that placement matter?
It lives in the `Ordering.Domain` project, not `Ordering.Infrastructure`. This is physical enforcement of dependency direction — the domain project has zero reference to EF Core; only the infrastructure project references both the domain interface and EF Core, keeping business logic technology-agnostic.
→ Post: `_posts/2026-01-10-repository-pattern-aggregate-loading.md`

### Q: How does the Repository pattern pair with Unit of Work in eShop?
`OrderRepository` stages changes via `Add`/`Update`, but nothing commits until something calls `UnitOfWork.SaveEntitiesAsync()` (which is `_context`). Multiple repository operations participate in one atomic transaction rather than each method committing independently.
→ Post: `_posts/2026-01-10-repository-pattern-aggregate-loading.md`

### Q: What is the one line in `OrderRepository.GetAsync` that justifies the repository's existence?
`_context.Entry(order).Collection(i => i.OrderItems).LoadAsync()` — this single line encodes "an Order isn't really loaded unless its items are too," applied automatically every time. Without the repository, every caller would need to independently remember to add this eager-loading call.
→ Post: `_posts/2026-01-10-repository-pattern-aggregate-loading.md`

### Q: When is the Repository pattern *not* worth adding?
For trivial single-table CRUD where a generic query API already does the entire job. Whether a repository earns its keep depends on what the aggregate actually needs (complex loading rules, technology decoupling for testing) — it's not an automatic best practice for every entity.
→ Post: `_posts/2026-01-10-repository-pattern-aggregate-loading.md`

### Q: What's a common gotcha when a developer adds a Repository on top of EF Core?
Treating it as purely a technology-abstraction layer and duplicating `DbSet<T>`'s full query surface through it. The value isn't hiding EF Core — it's centralizing aggregate-shaped loading rules and keeping the domain layer ORM-free. A repository that just delegates every LINQ call adds indirection without encoding domain knowledge.
→ Post: `_posts/2026-01-10-repository-pattern-aggregate-loading.md`

## Topic: Circuit Breaker (code-level pattern) (Order 11)

### Q: Why does Polly's circuit breaker have a 4th state (Isolated) that most textbooks skip?
Isolated is a manually-triggered open state distinct from automatic trips — an operator can deliberately force a dependency offline during maintenance without waiting for the failure threshold. It throws `IsolatedCircuitException` instead of `BrokenCircuitException`, so monitoring can distinguish deliberate action from real incidents.
→ Post: `_posts/2026-01-12-circuit-breaker-state-machine.md`

### Q: What happens to an in-flight call's result when the circuit transitions from Closed to Open mid-flight?
The implementation deliberately takes no action — a success result arriving after the circuit tripped Open is ignored, not double-counted or used to incorrectly close the circuit. Only time passing (the break duration elapsing) governs the Open-to-HalfOpen transition, not stale in-flight results.
→ Post: `_posts/2026-01-12-circuit-breaker-state-machine.md`

### Q: How does `HalfOpen` avoid immediately re-overwhelming a recovering dependency?
`PermitHalfOpenCircuitTest_NeedsLock()` gates the transition and `_halfOpenAttempts` is explicitly tracked — the implementation permits a bounded number of test probes, not a full flood. This prevents a just-recovering dependency from being hit with the entire traffic volume immediately.
→ Post: `_posts/2026-01-12-circuit-breaker-state-machine.md`

### Q: Why is the "should break" decision delegated to a separate `_behavior` object rather than hardcoded in the state machine?
The threshold algorithm (failure-rate-over-a-sampling-window vs consecutive-failure-count) is pluggable and decoupled from state-transition logic. The state machine doesn't know *which* threshold algorithm decided to break — it only reacts to the boolean `shouldBreak` result.
→ Post: `_posts/2026-01-12-circuit-breaker-state-machine.md`

### Q: What's the practical difference between Open and Isolated states in error-handling code?
A spike in `BrokenCircuitException` is a real incident signal (automatic failure detection tripped the circuit). A spike in `IsolatedCircuitException` reflects a known, deliberate maintenance action. Error-handling and alerting code needs to distinguish these to avoid paging someone for a planned outage.
→ Post: `_posts/2026-01-12-circuit-breaker-state-machine.md`

### Q: When would you manually Isolate a circuit instead of waiting for it to trip automatically?
During planned maintenance, before a known deployment that will make a dependency unavailable, or in response to a known incident where automatic detection hasn't tripped yet but you want to stop traffic immediately. It's an operator override for situations where the failure threshold would take too long to trip.
→ Post: `_posts/2026-01-12-circuit-breaker-state-machine.md`

### Q: What's the common mistake when implementing a circuit breaker?
Treating it as a simple boolean (on/off) instead of a state machine. Without HalfOpen, the circuit either blocks traffic forever or resumes full traffic immediately — there's no cautious recovery testing. Without Isolated, operators have no way to deliberately force a dependency offline without waiting for failure detection.
→ Post: `_posts/2026-01-12-circuit-breaker-state-machine.md`

## Topic: Chain of Responsibility (Order 12)

### Q: Why does ASP.NET Core build its middleware pipeline backwards instead of forwards?
Building backwards means each middleware wraps "everything registered after it" as a single `RequestDelegate` closure. The last-registered middleware wraps the terminal handler first, then each preceding one wraps the previous result — making the first-registered middleware the outermost layer at runtime, even though the build loop iterated in reverse.
→ Post: `_posts/2026-01-14-chain-of-responsibility-middleware-pipeline.md`

### Q: What does the terminal `RequestDelegate` in ASP.NET Core's pipeline do when a request reaches it?
It checks whether an endpoint was matched but never executed — if so, it throws `InvalidOperationException` instead of silently returning 404. A request reaching the pipeline's end with a routed endpoint still unhandled means someone forgot to register endpoint-execution middleware, and this defensive check catches that configuration mistake.
→ Post: `_posts/2026-01-14-chain-of-responsibility-middleware-pipeline.md`

### Q: Why are registration and construction deliberately separate phases in ASP.NET Core's middleware pipeline?
`Use()` only appends to a list — all real chain-construction complexity is deferred to `Build()`, called once later. This lets middleware registration be composable across `Startup`/`Program.cs` conditionals and extension methods from different packages before the final chain is assembled.
→ Post: `_posts/2026-01-14-chain-of-responsibility-middleware-pipeline.md`

### Q: How does `_components[c](app)` make the `next` parameter mean "the rest of the pipeline"?
Each factory function receives "everything built so far" (`app`) as its argument and returns a *new* `RequestDelegate` that closes over it. The `next` parameter isn't a global reference to a pipeline object — it's a specific closure captured at build time, one link at a time.
→ Post: `_posts/2026-01-14-chain-of-responsibility-middleware-pipeline.md`

### Q: What happens to execution order when you use conditional branching (`MapWhen`, `UseWhen`) in the pipeline?
Each conditional builds its own sub-chain the same reverse-way, creating nested closures. Understanding the reverse-build mechanism — not just memorizing "first registered, first run" — is what explains the resulting execution order once conditional branching enters the picture.
→ Post: `_posts/2026-01-14-chain-of-responsibility-middleware-pipeline.md`

### Q: What's the common mistake when debugging middleware execution order?
Assuming registration order directly maps to execution order. The registration list is the input to a reverse-build process that *produces* the execution order as an emergent property of nested closures. Once `Map`, `MapWhen`, or `UseWhen` create sub-chains, the actual execution path can diverge from the registration order.
→ Post: `_posts/2026-01-14-chain-of-responsibility-middleware-pipeline.md`

### Q: When would you use Chain of Responsibility instead of Decorator for composing behaviors?
Chain of Responsibility passes work along to the next handler and lets each decide whether to handle or forward — each handler is independent and doesn't know about others. Decorator wraps behavior *around* a core operation, where each layer explicitly calls the wrapped thing. Use CoR when handlers are peers (auth, CORS, routing); use Decorator when you're layering cross-cutting concerns around a single operation.
→ Post: `_posts/2026-01-14-chain-of-responsibility-middleware-pipeline.md`
---

**Last updated:** July 2026 | **Total Q&A:** 73 across Design Patterns

[Back to Q&A Index](/qa/) • [All Design Patterns posts](/design-patterns/)
