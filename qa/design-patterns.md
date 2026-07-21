---
layout: page
title: "Design Patterns Interview Questions: 73 Real-World Q&A from Production Manifests"
description: "73 interview-ready Design Patterns questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/design-patterns/
---

Bite-sized, standalone interview questions and answers for Design Patterns. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">73</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: Strategy pattern (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What problem does the Strategy pattern solve that an enum + switch statement doesn't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An enum + switch at the call site couples every caller to every possible behavior — adding a new strategy means editing code you don't own. Strategy puts each algorithm behind a common interface so the caller depends only on the abstraction, and new behaviors are added by creating a new class, not editing any caller.

<p class="qa-link">[Full post →]({{ '/design-patterns/strategy-pattern-pluggable-behavior/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Polly's `ResilienceStrategy` abstract differ from a typical textbook Strategy interface? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Polly's contract is a single method (`ExecuteCore`) operating on an opaque `Func` callback — the strategy has no idea what it's retrying or timing out (HTTP, database, gRPC). This makes one strategy reusable across every kind of call in a codebase, whereas a textbook interface often leaks domain-specific parameters.

<p class="qa-link">[Full post →]({{ '/design-patterns/strategy-pattern-pluggable-behavior/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `ShouldHandle` in Polly's retry strategy take a delegate rather than a hardcoded exception type? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ShouldHandle` is injected separately from the retry loop mechanism — this is a second, smaller instance of Strategy-within-Strategy. The mechanism (retry N times) is decoupled from the policy (which outcomes count as failures), so the same retry loop can be configured with different failure-detection logic per call site.

<p class="qa-link">[Full post →]({{ '/design-patterns/strategy-pattern-pluggable-behavior/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if the context class in a Strategy pattern contains an `if (strategy is RetryStrategy)` check? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You've reintroduced the switch statement one layer deeper — the context is no longer strategy-agnostic, and adding a new strategy now requires editing the context. The pattern's entire value (open for extension, closed for modification) is defeated.

<p class="qa-link">[Full post →]({{ '/design-patterns/strategy-pattern-pluggable-behavior/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's a common gotcha when designing the Strategy interface in a resilience library? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Making the interface too broad — if `ExecuteCore` had parameters specific to retries (attempt count, delay) or specific to timeouts (duration), strategies would need to know about each other's concerns. The contract must be genuinely minimal (one method, opaque callback) or the strategies become coupled.

<p class="qa-link">[Full post →]({{ '/design-patterns/strategy-pattern-pluggable-behavior/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When would you choose Strategy over simply subclassing the context class? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When behaviors need to be swapped at runtime, composed in different combinations, or shared across unrelated call sites. Subclassing bakes behavior into the class hierarchy at compile time; Strategy lets you inject different algorithms per instance, or even per call, without inheritance.

<p class="qa-link">[Full post →]({{ '/design-patterns/strategy-pattern-pluggable-behavior/' | relative_url }})</p>
  </div>
</div>

## Topic: Factory Method & Abstract Factory (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `IDbContextFactory<T>` hide that a `new DbContext(options)` call never could? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A factory call can internally pool/recycle instances, use cached constructor delegates, or wrap construction with additional setup — the caller just receives a `T` either way. A direct `new` always allocates a fresh instance, making that choice impossible to change without editing every call site.

<p class="qa-link">[Full post →]({{ '/design-patterns/factory-method-and-abstract-factory/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does EF Core's `PooledDbContextFactory` make `Dispose()` mean something different? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When you dispose a pooled `DbContext`, the `DbContextLease` wrapper returns the instance to the pool instead of destroying it. The caller's `using` statement looks identical to the non-pooled case, but "dispose" now means "return for reuse" rather than "deallocate" — entirely because of which factory implementation was injected.

<p class="qa-link">[Full post →]({{ '/design-patterns/factory-method-and-abstract-factory/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What tradeoff does a pooled factory introduce compared to a plain factory? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Pooled factories require that `DbContext` instances are stateless enough to be safely recycled — any leaked state from a previous request contaminates the next one. The pool also adds memory pressure from retained instances, and disposal semantics change (callers must actually dispose to return instances, not just abandon them).

<p class="qa-link">[Full post →]({{ '/design-patterns/factory-method-and-abstract-factory/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does even EF Core's "plain" `DbContextFactory` use a cached delegate instead of `new TContext(...)` directly? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Compiling and caching a constructor-invoking delegate once is significantly faster than reflection-based instantiation on every call. Even the non-pooled implementation has its own internal factory indirection for performance — the public contract is the same, but the mechanism underneath still avoids repeated reflection overhead.

<p class="qa-link">[Full post →]({{ '/design-patterns/factory-method-and-abstract-factory/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does switching from a plain factory to a pooled factory work in a real EF Core app? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a DI configuration change only — swap `services.AddDbContextFactory<T>()` for `services.AddPooledDbContextFactory<T>()`. Every line of application code calling `factory.CreateDbContext()` continues working unmodified, because the caller depends on `IDbContextFactory<T>`, not on the concrete factory type.

<p class="qa-link">[Full post →]({{ '/design-patterns/factory-method-and-abstract-factory/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the relationship between Factory Method and Abstract Factory in modern practice? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Classic GoF Abstract Factory used deep inheritance hierarchies with many concrete product subclasses. In modern practice, the pattern shows up as a single generic interface with a small number of interchangeable implementations selected via DI — the underlying principle (depend on abstraction, not constructor) survived, but the heavyweight class-hierarchy machinery mostly didn't.

<p class="qa-link">[Full post →]({{ '/design-patterns/factory-method-and-abstract-factory/' | relative_url }})</p>
  </div>
</div>

## Topic: Singleton (and why it's often an anti-pattern) (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is a "captive dependency" and why does it cause silent data corruption? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A captive dependency occurs when a singleton service captures a scoped service (like a `DbContext`) in its constructor — that scoped instance lives forever instead of being recreated per request. Under concurrent load, unrelated requests share and mutate the same `DbContext`, its change tracker accumulates entities without bound, and data silently corrupts.

<p class="qa-link">[Full post →]({{ '/design-patterns/singleton-anti-pattern-and-di-lifetime-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does ASP.NET Core's DI container detect captive dependencies? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The `CallSiteValidator` walks a singleton's entire transitive dependency tree at validation time (not just direct constructor parameters). If it finds a scoped service anywhere in that tree, it throws `ScopedInSingletonException` at startup — catching the bug before any request is served, rather than letting it manifest under concurrent load in production.

<p class="qa-link">[Full post →]({{ '/design-patterns/singleton-anti-pattern-and-di-lifetime-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if a scoped service is deeply nested in a singleton's dependency tree (not a direct parameter)? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The validator still catches it — `VisitConstructor` and `VisitIEnumerable` recurse through `VisitCallSite` on every parameter and element, propagating "did I find a scoped service in my subtree" back up to the caller. The check is transitive, not shallow.

<p class="qa-link">[Full post →]({{ '/design-patterns/singleton-anti-pattern-and-di-lifetime-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When is a Singleton lifetime actually appropriate in a DI-based system? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
For genuinely stateless or thread-safe shared resources — a connection pool, a cache client, a configuration reader. Never for request-specific state or anything that holds per-unit-of-work data like a `DbContext`.

<p class="qa-link">[Full post →]({{ '/design-patterns/singleton-anti-pattern-and-di-lifetime-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the CallSiteValidator cache its results per `callSite.Cache.Key`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A large application's DI graph can be deep and shared across many registrations. Re-walking the same dependency subtree from scratch on every validation call would make startup validation itself a real performance cost — the `ConcurrentDictionary` avoids redundant tree walks.

<p class="qa-link">[Full post →]({{ '/design-patterns/singleton-anti-pattern-and-di-lifetime-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with the CallSiteValidator's `argument.Singleton` threading mechanism? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`argument.Singleton` is only set inside `VisitRootCache` and threaded down via mutable `CallSiteValidatorState`. A scoped service resolved from a Scoped or Transient consumer triggers no exception — the validator correctly distinguishes "scoped service exists somewhere" (fine) from "scoped service exists inside a singleton's subtree" (the bug) by tracking which lifetime context it's currently inside.

<p class="qa-link">[Full post →]({{ '/design-patterns/singleton-anti-pattern-and-di-lifetime-validation/' | relative_url }})</p>
  </div>
</div>

## Topic: Observer pattern (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What problem does copy-on-Write solve for the Observer pattern that a lock around the notification path doesn't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Locking the notification path serializes all publishing under contention — a real throughput bottleneck for high-frequency events. Copy-on-write makes the publish path completely lock-free (a single `Volatile.Read`), at the cost of slightly more expensive subscribe/unsubscribe (building a new array), which is the less frequent operation.

<p class="qa-link">[Full post →]({{ '/design-patterns/observer-pattern-lock-free-subjects/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Rx.NET's `Subject<T>` handle an observer subscribing after the stream has already terminated? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It immediately replays the terminal notification — `OnError` or `OnCompleted` — to the new observer instead of silently accepting a subscription that will never fire. The subscribe method checks if the current array reference equals the `Terminated` sentinel and dispatches the final signal right away.

<p class="qa-link">[Full post →]({{ '/design-patterns/observer-pattern-lock-free-subjects/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Rx.NET use two separate sentinel arrays (`Terminated` and `Disposed`) instead of sharing one empty array? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The code checks which specific sentinel it's looking at via reference identity (`== Terminated` vs `== Disposed`), not by content. `OnNext` checks against `Disposed` and throws; `Subscribe` checks against `Terminated` and replays the terminal signal — the same-length array means two entirely different behaviors depending on *which object* it is.

<p class="qa-link">[Full post →]({{ '/design-patterns/observer-pattern-lock-free-subjects/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if two threads subscribe concurrently — does one observer get lost? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No — the `Interlocked.CompareExchange` retry loop handles this. Each thread reads the current array, builds a new one with its observer added, and tries to swap. If another thread's swap won the race, the first thread retries from scratch with the updated array. Every subscriber eventually appears.

<p class="qa-link">[Full post →]({{ '/design-patterns/observer-pattern-lock-free-subjects/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is the `Interlocked.CompareExchange` retry loop intentionally unbounded? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Under contention, a thread might lose the race multiple times, but each retry is cheap (build a small array, try again). The alternative — a lock — would mean threads *blocking* rather than retrying, which is strictly worse for a hot notification path under real concurrent load.

<p class="qa-link">[Full post →]({{ '/design-patterns/observer-pattern-lock-free-subjects/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the common mistake when implementing Observer in a concurrent system? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Using a mutable `List<Observer>` without synchronization. This either throws "collection was modified" during iteration (if a subscribe/unsubscribe happens mid-notify) or requires a lock around every publish, serializing all notification under contention. Production reactive libraries use lock-free copy-on-write instead.

<p class="qa-link">[Full post →]({{ '/design-patterns/observer-pattern-lock-free-subjects/' | relative_url }})</p>
  </div>
</div>

## Topic: Decorator pattern (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does nesting order change behavior when composing a retry with a circuit breaker in Polly? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Retry wrapping a circuit breaker means the breaker's state is re-evaluated on every retry attempt — a retry can be short-circuited mid-sequence if the breaker trips partway through. Circuit breaker wrapping a retry means the breaker sees the whole retry sequence as one opaque unit, counting the entire sequence as a single success or failure.

<p class="qa-link">[Full post →]({{ '/design-patterns/decorator-pattern-policy-wrapping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the mechanism that makes policy composition work in Polly's `WrapAsync`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`outerPolicy.ExecuteAsync` calls a lambda that calls `innerPolicy.ExecuteAsync(func)`. The outer policy never sees the original function — only a wrapped version that routes through the inner policy first. Each layer is genuinely blind to what's further inside it, only aware of "the thing I was asked to execute."

<p class="qa-link">[Full post →]({{ '/design-patterns/decorator-pattern-policy-wrapping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Polly need four separate `WrapAsync` overloads instead of one generic "wrap anything in anything" method? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The public interface (`IAsyncPolicy`) and internal concrete class (`AsyncPolicy`) are deliberately separate. The overload set covers every combination of generic/non-generic outer and inner policy, keeping the composed result's type correct through the type system rather than relying on loosely-typed "wrap anything."

<p class="qa-link">[Full post →]({{ '/design-patterns/decorator-pattern-policy-wrapping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does modern Decorator differ from the textbook GoF class-wrapping version? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Classic Decorator uses object instances sharing an inheritance hierarchy. Modern Polly-style Decorator composes functions/delegates (`Func<Context, CancellationToken, Task<TResult>>`) rather than objects — the underlying principle (wrap, add behavior, delegate to the wrapped thing) is identical, but delegate composition replaced class inheritance as the mechanism.

<p class="qa-link">[Full post →]({{ '/design-patterns/decorator-pattern-policy-wrapping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When would you use Decorator instead of Strategy for cross-cutting concerns? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Decorator wraps behavior *around* a call (adding logging, retries, timeouts as layers), while Strategy *replaces* the algorithm entirely (swapping retry for circuit breaker). Use Decorator when you want to add orthogonal concerns without changing the core behavior; use Strategy when the behavior itself needs to be interchangeable.

<p class="qa-link">[Full post →]({{ '/design-patterns/decorator-pattern-policy-wrapping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's a common mistake when reordering decorators? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming order doesn't matter because the same policies are applied. In reality, retry-outside-timeout means each retry attempt gets its own timeout window; timeout-outside-retry means the entire retry sequence shares one timeout, potentially cutting off retries partway through. Same code, genuinely different resilience behavior.

<p class="qa-link">[Full post →]({{ '/design-patterns/decorator-pattern-policy-wrapping/' | relative_url }})</p>
  </div>
</div>

## Topic: Adapter pattern (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Django's `BaseDatabaseOperations` qualify as an Adapter rather than a Facade? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An Adapter reconciles genuinely incompatible interfaces into a common shape — MySQL, Postgres, SQLite, and Oracle really do disagree on quoting rules, auto-increment retrieval, and identifier handling. A Facade simplifies complexity behind a new interface without necessarily resolving pre-existing incompatibilities. Django's backends resolve real dialect disagreements.

<p class="qa-link">[Full post →]({{ '/design-patterns/adapter-pattern-database-backends/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does Oracle's `quote_name` adapter do that makes it more than a simple character swap? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Oracle forces identifiers uppercase, truncates to `max_name_length()`, and applies quoting — reflecting Oracle's genuinely different, historically case-insensitive-by-default and length-limited identifier rules. This is the real test of a proper Adapter: reconciling an actually different set of underlying rules into the same call signature.

<p class="qa-link">[Full post →]({{ '/design-patterns/adapter-pattern-database-backends/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does every concrete `quote_name` in Django check if the name is already quoted before re-wrapping? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Query-building code composes SQL fragments from multiple sources and could plausibly call `quote_name` on an already-quoted value. Each adapter defensively handles this idempotency case instead of silently producing doubly-quoted, broken SQL.

<p class="qa-link">[Full post →]({{ '/design-patterns/adapter-pattern-database-backends/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `BaseDatabaseOperations.quote_name` raise `NotImplementedError` instead of providing a default? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Quoting rules are so backend-specific that there's no safe generic default — every concrete backend is *required* to supply its own. Forgetting to implement it fails loudly at first use rather than silently producing SQL that happens to work only on whichever database was tested against.

<p class="qa-link">[Full post →]({{ '/design-patterns/adapter-pattern-database-backends/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if a new Django backend is added but forgets to implement `quote_name`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It hits `NotImplementedError` at the first query that needs identifier quoting — a loud, immediate failure at runtime. This is a deliberate design choice: a silent default would produce SQL that looks correct but breaks on a different database, which is much harder to diagnose.

<p class="qa-link">[Full post →]({{ '/design-patterns/adapter-pattern-database-backends/' | relative_url }})</p>
  </div>
</div>

## Topic: Command pattern (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is the Command pattern in Redis valuable beyond its classic undo/redo use case? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Redis doesn't use commands for undo/redo — it uses them to decouple generic request-handling infrastructure (parsing, timing, replication logging, ACL checks) from 200+ individual command implementations. The generic mechanics are written once around `c->cmd->proc(c)`, and adding command number 201 doesn't touch any of that infrastructure.

<p class="qa-link">[Full post →]({{ '/design-patterns/command-pattern-redis-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What role does the `redisCommand` struct play beyond holding a function pointer? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a self-describing unit — `acl_categories`, `key_specs`, and `flags` are metadata the generic dispatch machinery reads to make decisions (is this client allowed? which keys does it touch for cluster routing?) *before* ever calling `proc`. The command-as-object is introspectable without executing it.

<p class="qa-link">[Full post →]({{ '/design-patterns/command-pattern-redis-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Redis wrap `CLIENT_EXECUTING_COMMAND` flag-setting around the single dispatch line? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Tracking "is a command currently executing" (needed for client-side caching notifications) is written once, around `c->cmd->proc(c)`, and automatically correct for every current and future command. Without this pattern, every new command implementation would need to remember to add this bookkeeping.

<p class="qa-link">[Full post →]({{ '/design-patterns/command-pattern-redis-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with using a giant if/else dispatch instead of the Command pattern? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Every cross-cutting concern (timing, logging, replication, ACL tracking) has to be re-threaded through each branch by hand. Adding a new command means editing the central dispatch code every time, coupling infrastructure to individual command implementations.

<p class="qa-link">[Full post →]({{ '/design-patterns/command-pattern-redis-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When does the Command pattern become overkill versus a simple strategy dispatch? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When you don't need the command to carry metadata, be queued, logged, or introspected before execution — if the only goal is swapping behavior, Strategy is lighter. Command's value emerges when the request object itself needs to be treated as a first-class entity (queued, persisted, replayed, or inspected by infrastructure).

<p class="qa-link">[Full post →]({{ '/design-patterns/command-pattern-redis-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Redis's command table differ from a switch-based dispatch in terms of extensibility? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A switch statement requires editing the central dispatcher for every new command. Redis's `commandTable[]` array lets new commands be added by appending a struct entry — the generic dispatch path (`c->cmd->proc(c)`) is unchanged, following open/closed principle.

<p class="qa-link">[Full post →]({{ '/design-patterns/command-pattern-redis-dispatch/' | relative_url }})</p>
  </div>
</div>

## Topic: Builder pattern (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does every EF Core builder method return `this` instead of void? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Returning the same builder instance enables fluent chaining (`.UseModel(...).UseLoggerFactory(...)`), making a complex configuration read as one coherent statement. Underneath, each call actually swaps in a brand-new immutable configuration extension — the builder reference stays constant while the data it holds is rebuilt.

<p class="qa-link">[Full post →]({{ '/design-patterns/builder-pattern-fluent-immutable-options/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What problem does the immutable-extension-swap inside EF Core's builder solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
If the configuration data were a mutable shared object handed out to multiple consumers (several `DbContext` instances from one cached options set), one code path's configuration change would silently affect every other consumer. Immutable extensions prevent this — each consumer gets a snapshot that can't be mutated by another.

<p class="qa-link">[Full post →]({{ '/design-patterns/builder-pattern-fluent-immutable-options/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `WithOption` in `DbContextOptionsBuilder` handle the very first configuration call? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`Options.FindExtension<CoreOptionsExtension>() ?? new CoreOptionsExtension()` uses null-coalescing — if no extension exists yet, one is created fresh. This lets `UseModel(...)` work correctly whether it's the first call in the chain or the fifth.

<p class="qa-link">[Full post →]({{ '/design-patterns/builder-pattern-fluent-immutable-options/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Where does the actual immutable-update logic live — on the builder or on the extension? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
On the extension itself — `CoreOptionsExtension` has its own `With*` methods that return new instances of itself. The builder's role is purely orchestration: call the right `With*`, swap it in, return `this`. The data object owns its own immutability protocol.

<p class="qa-link">[Full post →]({{ '/design-patterns/builder-pattern-fluent-immutable-options/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is the fluent builder pattern superior to a constructor with dozens of optional parameters? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Positional optional arguments are unreadable and easy to mix up (does the 7th parameter mean logger or connection string?). Individual setter calls don't guarantee required steps happened. A fluent builder reads as one coherent configuration statement while letting each method enforce its own validation.

<p class="qa-link">[Full post →]({{ '/design-patterns/builder-pattern-fluent-immutable-options/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's a common mistake when implementing fluent builders? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Returning `new Builder()` from each method instead of `this` — this breaks the chain because each call operates on a different builder instance with different accumulated state. The entire fluent pattern depends on all methods returning the same builder reference so each call mutates the same builder.

<p class="qa-link">[Full post →]({{ '/design-patterns/builder-pattern-fluent-immutable-options/' | relative_url }})</p>
  </div>
</div>

## Topic: Dependency Injection (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a DI container decide which constructor to call when a class has three constructors? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It sorts constructors by parameter count (most first), then tries each in order, picking the first whose parameters are all resolvable. If a shorter constructor is also resolvable, its parameters must be a strict subset of the winner's — otherwise it's treated as a genuine ambiguity error.

<p class="qa-link">[Full post →]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when two constructors require genuinely different, non-overlapping sets of resolvable services? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The container throws an ambiguity error rather than guessing. Two constructors requiring different services that aren't subsets of each other represent a real design ambiguity — the developer must resolve it, not the container.

<p class="qa-link">[Full post →]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the circular dependency detection turn a stack overflow into a readable error? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`CallSiteChain` tracks which services are currently being resolved, in order, as the container recursively walks constructor dependencies. Before resolving service X, it checks whether X is already in the chain — if so, it throws with the exact resolution path (`A -> B -> C -> A`) built from insertion-ordered tracking.

<p class="qa-link">[Full post →]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `CallSiteChain` use `_callSiteChain.Count` at insertion time instead of dictionary iteration order? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Dictionaries don't guarantee insertion order. The chain explicitly tracks *when* each service entered resolution via `ChainItemInfo(_callSiteChain.Count, ...)` so the error message reconstructs the resolution path in the order it actually happened.

<p class="qa-link">[Full post →]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `CallSiteChain` have both `Add` and `Remove` methods? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The chain reflects only what's *currently* on the resolution stack — a service successfully resolved gets removed, so resolving the same service again later (as a separate, independent request) doesn't falsely trigger the circular-dependency check.

<p class="qa-link">[Full post →]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's a common mistake that triggers an ambiguous-constructor exception? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Adding a new optional dependency to a constructor that was previously the only resolvable one, when another shorter constructor already exists and is also resolvable. The container now sees two resolvable constructors with non-subset parameter sets — the fix is either removing the ambiguity or using a factory delegate.

<p class="qa-link">[Full post →]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }})</p>
  </div>
</div>

## Topic: Repository pattern (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does eShop wrap EF Core's `DbSet<T>` in an `IOrderRepository` layer? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because `DbSet<T>` doesn't encode how a specific aggregate needs to be loaded correctly. A naive `FindAsync` returns an `Order` with `OrderItems` unloaded — a technically-successful query that hands back an incomplete aggregate. `IOrderRepository.GetAsync` centralizes the eager-loading rule in exactly one place.

<p class="qa-link">[Full post →]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Where does `IOrderRepository` live and why does that placement matter? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It lives in the `Ordering.Domain` project, not `Ordering.Infrastructure`. This is physical enforcement of dependency direction — the domain project has zero reference to EF Core; only the infrastructure project references both the domain interface and EF Core, keeping business logic technology-agnostic.

<p class="qa-link">[Full post →]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the Repository pattern pair with Unit of Work in eShop? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`OrderRepository` stages changes via `Add`/`Update`, but nothing commits until something calls `UnitOfWork.SaveEntitiesAsync()` (which is `_context`). Multiple repository operations participate in one atomic transaction rather than each method committing independently.

<p class="qa-link">[Full post →]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the one line in `OrderRepository.GetAsync` that justifies the repository's existence? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`_context.Entry(order).Collection(i => i.OrderItems).LoadAsync()` — this single line encodes "an Order isn't really loaded unless its items are too," applied automatically every time. Without the repository, every caller would need to independently remember to add this eager-loading call.

<p class="qa-link">[Full post →]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When is the Repository pattern *not* worth adding? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
For trivial single-table CRUD where a generic query API already does the entire job. Whether a repository earns its keep depends on what the aggregate actually needs (complex loading rules, technology decoupling for testing) — it's not an automatic best practice for every entity.

<p class="qa-link">[Full post →]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's a common gotcha when a developer adds a Repository on top of EF Core? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating it as purely a technology-abstraction layer and duplicating `DbSet<T>`'s full query surface through it. The value isn't hiding EF Core — it's centralizing aggregate-shaped loading rules and keeping the domain layer ORM-free. A repository that just delegates every LINQ call adds indirection without encoding domain knowledge.

<p class="qa-link">[Full post →]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }})</p>
  </div>
</div>

## Topic: Circuit Breaker (code-level pattern) (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Polly's circuit breaker have a 4th state (Isolated) that most textbooks skip? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Isolated is a manually-triggered open state distinct from automatic trips — an operator can deliberately force a dependency offline during maintenance without waiting for the failure threshold. It throws `IsolatedCircuitException` instead of `BrokenCircuitException`, so monitoring can distinguish deliberate action from real incidents.

<p class="qa-link">[Full post →]({{ '/design-patterns/circuit-breaker-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to an in-flight call's result when the circuit transitions from Closed to Open mid-flight? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The implementation deliberately takes no action — a success result arriving after the circuit tripped Open is ignored, not double-counted or used to incorrectly close the circuit. Only time passing (the break duration elapsing) governs the Open-to-HalfOpen transition, not stale in-flight results.

<p class="qa-link">[Full post →]({{ '/design-patterns/circuit-breaker-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `HalfOpen` avoid immediately re-overwhelming a recovering dependency? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`PermitHalfOpenCircuitTest_NeedsLock()` gates the transition and `_halfOpenAttempts` is explicitly tracked — the implementation permits a bounded number of test probes, not a full flood. This prevents a just-recovering dependency from being hit with the entire traffic volume immediately.

<p class="qa-link">[Full post →]({{ '/design-patterns/circuit-breaker-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is the "should break" decision delegated to a separate `_behavior` object rather than hardcoded in the state machine? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The threshold algorithm (failure-rate-over-a-sampling-window vs consecutive-failure-count) is pluggable and decoupled from state-transition logic. The state machine doesn't know *which* threshold algorithm decided to break — it only reacts to the boolean `shouldBreak` result.

<p class="qa-link">[Full post →]({{ '/design-patterns/circuit-breaker-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the practical difference between Open and Isolated states in error-handling code? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A spike in `BrokenCircuitException` is a real incident signal (automatic failure detection tripped the circuit). A spike in `IsolatedCircuitException` reflects a known, deliberate maintenance action. Error-handling and alerting code needs to distinguish these to avoid paging someone for a planned outage.

<p class="qa-link">[Full post →]({{ '/design-patterns/circuit-breaker-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When would you manually Isolate a circuit instead of waiting for it to trip automatically? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
During planned maintenance, before a known deployment that will make a dependency unavailable, or in response to a known incident where automatic detection hasn't tripped yet but you want to stop traffic immediately. It's an operator override for situations where the failure threshold would take too long to trip.

<p class="qa-link">[Full post →]({{ '/design-patterns/circuit-breaker-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the common mistake when implementing a circuit breaker? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating it as a simple boolean (on/off) instead of a state machine. Without HalfOpen, the circuit either blocks traffic forever or resumes full traffic immediately — there's no cautious recovery testing. Without Isolated, operators have no way to deliberately force a dependency offline without waiting for failure detection.

<p class="qa-link">[Full post →]({{ '/design-patterns/circuit-breaker-state-machine/' | relative_url }})</p>
  </div>
</div>

## Topic: Chain of Responsibility (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does ASP.NET Core build its middleware pipeline backwards instead of forwards? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Building backwards means each middleware wraps "everything registered after it" as a single `RequestDelegate` closure. The last-registered middleware wraps the terminal handler first, then each preceding one wraps the previous result — making the first-registered middleware the outermost layer at runtime, even though the build loop iterated in reverse.

<p class="qa-link">[Full post →]({{ '/design-patterns/chain-of-responsibility-middleware-pipeline/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does the terminal `RequestDelegate` in ASP.NET Core's pipeline do when a request reaches it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It checks whether an endpoint was matched but never executed — if so, it throws `InvalidOperationException` instead of silently returning 404. A request reaching the pipeline's end with a routed endpoint still unhandled means someone forgot to register endpoint-execution middleware, and this defensive check catches that configuration mistake.

<p class="qa-link">[Full post →]({{ '/design-patterns/chain-of-responsibility-middleware-pipeline/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why are registration and construction deliberately separate phases in ASP.NET Core's middleware pipeline? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`Use()` only appends to a list — all real chain-construction complexity is deferred to `Build()`, called once later. This lets middleware registration be composable across `Startup`/`Program.cs` conditionals and extension methods from different packages before the final chain is assembled.

<p class="qa-link">[Full post →]({{ '/design-patterns/chain-of-responsibility-middleware-pipeline/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `_components[c](app)` make the `next` parameter mean "the rest of the pipeline"? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each factory function receives "everything built so far" (`app`) as its argument and returns a *new* `RequestDelegate` that closes over it. The `next` parameter isn't a global reference to a pipeline object — it's a specific closure captured at build time, one link at a time.

<p class="qa-link">[Full post →]({{ '/design-patterns/chain-of-responsibility-middleware-pipeline/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to execution order when you use conditional branching (`MapWhen`, `UseWhen`) in the pipeline? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each conditional builds its own sub-chain the same reverse-way, creating nested closures. Understanding the reverse-build mechanism — not just memorizing "first registered, first run" — is what explains the resulting execution order once conditional branching enters the picture.

<p class="qa-link">[Full post →]({{ '/design-patterns/chain-of-responsibility-middleware-pipeline/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the common mistake when debugging middleware execution order? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming registration order directly maps to execution order. The registration list is the input to a reverse-build process that *produces* the execution order as an emergent property of nested closures. Once `Map`, `MapWhen`, or `UseWhen` create sub-chains, the actual execution path can diverge from the registration order.

<p class="qa-link">[Full post →]({{ '/design-patterns/chain-of-responsibility-middleware-pipeline/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When would you use Chain of Responsibility instead of Decorator for composing behaviors? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Chain of Responsibility passes work along to the next handler and lets each decide whether to handle or forward — each handler is independent and doesn't know about others. Decorator wraps behavior *around* a core operation, where each layer explicitly calls the wrapped thing. Use CoR when handlers are peers (auth, CORS, routing); use Decorator when you're layering cross-cutting concerns around a single operation.

<p class="qa-link">[Full post →]({{ '/design-patterns/chain-of-responsibility-middleware-pipeline/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 73 across Design Patterns

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What problem does the Strategy pattern solve that an enum + switch statement doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An enum + switch at the call site couples every caller to every possible behavior — adding a new strategy means editing code you don't own. Strategy puts each algorithm behind a common interface so the caller depends only on the abstraction, and new behaviors are added by creating a new class, not editing any caller."
      }
    },
    {
      "@type": "Question",
      "name": "How does Polly's `ResilienceStrategy` abstract differ from a typical textbook Strategy interface?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Polly's contract is a single method (`ExecuteCore`) operating on an opaque `Func` callback — the strategy has no idea what it's retrying or timing out (HTTP, database, gRPC). This makes one strategy reusable across every kind of call in a codebase, whereas a textbook interface often leaks domain-specific parameters."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `ShouldHandle` in Polly's retry strategy take a delegate rather than a hardcoded exception type?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ShouldHandle` is injected separately from the retry loop mechanism — this is a second, smaller instance of Strategy-within-Strategy. The mechanism (retry N times) is decoupled from the policy (which outcomes count as failures), so the same retry loop can be configured with different failure-detection logic per call site."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if the context class in a Strategy pattern contains an `if (strategy is RetryStrategy)` check?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You've reintroduced the switch statement one layer deeper — the context is no longer strategy-agnostic, and adding a new strategy now requires editing the context. The pattern's entire value (open for extension, closed for modification) is defeated."
      }
    },
    {
      "@type": "Question",
      "name": "What's a common gotcha when designing the Strategy interface in a resilience library?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Making the interface too broad — if `ExecuteCore` had parameters specific to retries (attempt count, delay) or specific to timeouts (duration), strategies would need to know about each other's concerns. The contract must be genuinely minimal (one method, opaque callback) or the strategies become coupled."
      }
    },
    {
      "@type": "Question",
      "name": "When would you choose Strategy over simply subclassing the context class?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When behaviors need to be swapped at runtime, composed in different combinations, or shared across unrelated call sites. Subclassing bakes behavior into the class hierarchy at compile time; Strategy lets you inject different algorithms per instance, or even per call, without inheritance."
      }
    },
    {
      "@type": "Question",
      "name": "What does `IDbContextFactory<T>` hide that a `new DbContext(options)` call never could?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A factory call can internally pool/recycle instances, use cached constructor delegates, or wrap construction with additional setup — the caller just receives a `T` either way. A direct `new` always allocates a fresh instance, making that choice impossible to change without editing every call site."
      }
    },
    {
      "@type": "Question",
      "name": "How does EF Core's `PooledDbContextFactory` make `Dispose()` mean something different?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you dispose a pooled `DbContext`, the `DbContextLease` wrapper returns the instance to the pool instead of destroying it. The caller's `using` statement looks identical to the non-pooled case, but \"dispose\" now means \"return for reuse\" rather than \"deallocate\" — entirely because of which factory implementation was injected."
      }
    },
    {
      "@type": "Question",
      "name": "What tradeoff does a pooled factory introduce compared to a plain factory?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pooled factories require that `DbContext` instances are stateless enough to be safely recycled — any leaked state from a previous request contaminates the next one. The pool also adds memory pressure from retained instances, and disposal semantics change (callers must actually dispose to return instances, not just abandon them)."
      }
    },
    {
      "@type": "Question",
      "name": "Why does even EF Core's \"plain\" `DbContextFactory` use a cached delegate instead of `new TContext(...)` directly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compiling and caching a constructor-invoking delegate once is significantly faster than reflection-based instantiation on every call. Even the non-pooled implementation has its own internal factory indirection for performance — the public contract is the same, but the mechanism underneath still avoids repeated reflection overhead."
      }
    },
    {
      "@type": "Question",
      "name": "How does switching from a plain factory to a pooled factory work in a real EF Core app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's a DI configuration change only — swap `services.AddDbContextFactory<T>()` for `services.AddPooledDbContextFactory<T>()`. Every line of application code calling `factory.CreateDbContext()` continues working unmodified, because the caller depends on `IDbContextFactory<T>`, not on the concrete factory type."
      }
    },
    {
      "@type": "Question",
      "name": "What's the relationship between Factory Method and Abstract Factory in modern practice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Classic GoF Abstract Factory used deep inheritance hierarchies with many concrete product subclasses. In modern practice, the pattern shows up as a single generic interface with a small number of interchangeable implementations selected via DI — the underlying principle (depend on abstraction, not constructor) survived, but the heavyweight class-hierarchy machinery mostly didn't."
      }
    },
    {
      "@type": "Question",
      "name": "What is a \"captive dependency\" and why does it cause silent data corruption?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A captive dependency occurs when a singleton service captures a scoped service (like a `DbContext`) in its constructor — that scoped instance lives forever instead of being recreated per request. Under concurrent load, unrelated requests share and mutate the same `DbContext`, its change tracker accumulates entities without bound, and data silently corrupts."
      }
    },
    {
      "@type": "Question",
      "name": "How does ASP.NET Core's DI container detect captive dependencies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The `CallSiteValidator` walks a singleton's entire transitive dependency tree at validation time (not just direct constructor parameters). If it finds a scoped service anywhere in that tree, it throws `ScopedInSingletonException` at startup — catching the bug before any request is served, rather than letting it manifest under concurrent load in production."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a scoped service is deeply nested in a singleton's dependency tree (not a direct parameter)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The validator still catches it — `VisitConstructor` and `VisitIEnumerable` recurse through `VisitCallSite` on every parameter and element, propagating \"did I find a scoped service in my subtree\" back up to the caller. The check is transitive, not shallow."
      }
    },
    {
      "@type": "Question",
      "name": "When is a Singleton lifetime actually appropriate in a DI-based system?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For genuinely stateless or thread-safe shared resources — a connection pool, a cache client, a configuration reader. Never for request-specific state or anything that holds per-unit-of-work data like a `DbContext`."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the CallSiteValidator cache its results per `callSite.Cache.Key`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A large application's DI graph can be deep and shared across many registrations. Re-walking the same dependency subtree from scratch on every validation call would make startup validation itself a real performance cost — the `ConcurrentDictionary` avoids redundant tree walks."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with the CallSiteValidator's `argument.Singleton` threading mechanism?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`argument.Singleton` is only set inside `VisitRootCache` and threaded down via mutable `CallSiteValidatorState`. A scoped service resolved from a Scoped or Transient consumer triggers no exception — the validator correctly distinguishes \"scoped service exists somewhere\" (fine) from \"scoped service exists inside a singleton's subtree\" (the bug) by tracking which lifetime context it's currently inside."
      }
    },
    {
      "@type": "Question",
      "name": "What problem does copy-on-Write solve for the Observer pattern that a lock around the notification path doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Locking the notification path serializes all publishing under contention — a real throughput bottleneck for high-frequency events. Copy-on-write makes the publish path completely lock-free (a single `Volatile.Read`), at the cost of slightly more expensive subscribe/unsubscribe (building a new array), which is the less frequent operation."
      }
    },
    {
      "@type": "Question",
      "name": "How does Rx.NET's `Subject<T>` handle an observer subscribing after the stream has already terminated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It immediately replays the terminal notification — `OnError` or `OnCompleted` — to the new observer instead of silently accepting a subscription that will never fire. The subscribe method checks if the current array reference equals the `Terminated` sentinel and dispatches the final signal right away."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Rx.NET use two separate sentinel arrays (`Terminated` and `Disposed`) instead of sharing one empty array?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The code checks which specific sentinel it's looking at via reference identity (`== Terminated` vs `== Disposed`), not by content. `OnNext` checks against `Disposed` and throws; `Subscribe` checks against `Terminated` and replays the terminal signal — the same-length array means two entirely different behaviors depending on *which object* it is."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if two threads subscribe concurrently — does one observer get lost?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — the `Interlocked.CompareExchange` retry loop handles this. Each thread reads the current array, builds a new one with its observer added, and tries to swap. If another thread's swap won the race, the first thread retries from scratch with the updated array. Every subscriber eventually appears."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the `Interlocked.CompareExchange` retry loop intentionally unbounded?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Under contention, a thread might lose the race multiple times, but each retry is cheap (build a small array, try again). The alternative — a lock — would mean threads *blocking* rather than retrying, which is strictly worse for a hot notification path under real concurrent load."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when implementing Observer in a concurrent system?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Using a mutable `List<Observer>` without synchronization. This either throws \"collection was modified\" during iteration (if a subscribe/unsubscribe happens mid-notify) or requires a lock around every publish, serializing all notification under contention. Production reactive libraries use lock-free copy-on-write instead."
      }
    },
    {
      "@type": "Question",
      "name": "How does nesting order change behavior when composing a retry with a circuit breaker in Polly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Retry wrapping a circuit breaker means the breaker's state is re-evaluated on every retry attempt — a retry can be short-circuited mid-sequence if the breaker trips partway through. Circuit breaker wrapping a retry means the breaker sees the whole retry sequence as one opaque unit, counting the entire sequence as a single success or failure."
      }
    },
    {
      "@type": "Question",
      "name": "What's the mechanism that makes policy composition work in Polly's `WrapAsync`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`outerPolicy.ExecuteAsync` calls a lambda that calls `innerPolicy.ExecuteAsync(func)`. The outer policy never sees the original function — only a wrapped version that routes through the inner policy first. Each layer is genuinely blind to what's further inside it, only aware of \"the thing I was asked to execute.\""
      }
    },
    {
      "@type": "Question",
      "name": "Why does Polly need four separate `WrapAsync` overloads instead of one generic \"wrap anything in anything\" method?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The public interface (`IAsyncPolicy`) and internal concrete class (`AsyncPolicy`) are deliberately separate. The overload set covers every combination of generic/non-generic outer and inner policy, keeping the composed result's type correct through the type system rather than relying on loosely-typed \"wrap anything.\""
      }
    },
    {
      "@type": "Question",
      "name": "How does modern Decorator differ from the textbook GoF class-wrapping version?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Classic Decorator uses object instances sharing an inheritance hierarchy. Modern Polly-style Decorator composes functions/delegates (`Func<Context, CancellationToken, Task<TResult>>`) rather than objects — the underlying principle (wrap, add behavior, delegate to the wrapped thing) is identical, but delegate composition replaced class inheritance as the mechanism."
      }
    },
    {
      "@type": "Question",
      "name": "When would you use Decorator instead of Strategy for cross-cutting concerns?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Decorator wraps behavior *around* a call (adding logging, retries, timeouts as layers), while Strategy *replaces* the algorithm entirely (swapping retry for circuit breaker). Use Decorator when you want to add orthogonal concerns without changing the core behavior; use Strategy when the behavior itself needs to be interchangeable."
      }
    },
    {
      "@type": "Question",
      "name": "What's a common mistake when reordering decorators?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Assuming order doesn't matter because the same policies are applied. In reality, retry-outside-timeout means each retry attempt gets its own timeout window; timeout-outside-retry means the entire retry sequence shares one timeout, potentially cutting off retries partway through. Same code, genuinely different resilience behavior."
      }
    },
    {
      "@type": "Question",
      "name": "How does Django's `BaseDatabaseOperations` qualify as an Adapter rather than a Facade?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An Adapter reconciles genuinely incompatible interfaces into a common shape — MySQL, Postgres, SQLite, and Oracle really do disagree on quoting rules, auto-increment retrieval, and identifier handling. A Facade simplifies complexity behind a new interface without necessarily resolving pre-existing incompatibilities. Django's backends resolve real dialect disagreements."
      }
    },
    {
      "@type": "Question",
      "name": "What does Oracle's `quote_name` adapter do that makes it more than a simple character swap?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Oracle forces identifiers uppercase, truncates to `max_name_length()`, and applies quoting — reflecting Oracle's genuinely different, historically case-insensitive-by-default and length-limited identifier rules. This is the real test of a proper Adapter: reconciling an actually different set of underlying rules into the same call signature."
      }
    },
    {
      "@type": "Question",
      "name": "Why does every concrete `quote_name` in Django check if the name is already quoted before re-wrapping?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Query-building code composes SQL fragments from multiple sources and could plausibly call `quote_name` on an already-quoted value. Each adapter defensively handles this idempotency case instead of silently producing doubly-quoted, broken SQL."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `BaseDatabaseOperations.quote_name` raise `NotImplementedError` instead of providing a default?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Quoting rules are so backend-specific that there's no safe generic default — every concrete backend is *required* to supply its own. Forgetting to implement it fails loudly at first use rather than silently producing SQL that happens to work only on whichever database was tested against."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a new Django backend is added but forgets to implement `quote_name`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It hits `NotImplementedError` at the first query that needs identifier quoting — a loud, immediate failure at runtime. This is a deliberate design choice: a silent default would produce SQL that looks correct but breaks on a different database, which is much harder to diagnose."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the Command pattern in Redis valuable beyond its classic undo/redo use case?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Redis doesn't use commands for undo/redo — it uses them to decouple generic request-handling infrastructure (parsing, timing, replication logging, ACL checks) from 200+ individual command implementations. The generic mechanics are written once around `c->cmd->proc(c)`, and adding command number 201 doesn't touch any of that infrastructure."
      }
    },
    {
      "@type": "Question",
      "name": "What role does the `redisCommand` struct play beyond holding a function pointer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's a self-describing unit — `acl_categories`, `key_specs`, and `flags` are metadata the generic dispatch machinery reads to make decisions (is this client allowed? which keys does it touch for cluster routing?) *before* ever calling `proc`. The command-as-object is introspectable without executing it."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Redis wrap `CLIENT_EXECUTING_COMMAND` flag-setting around the single dispatch line?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Tracking \"is a command currently executing\" (needed for client-side caching notifications) is written once, around `c->cmd->proc(c)`, and automatically correct for every current and future command. Without this pattern, every new command implementation would need to remember to add this bookkeeping."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with using a giant if/else dispatch instead of the Command pattern?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every cross-cutting concern (timing, logging, replication, ACL tracking) has to be re-threaded through each branch by hand. Adding a new command means editing the central dispatch code every time, coupling infrastructure to individual command implementations."
      }
    },
    {
      "@type": "Question",
      "name": "When does the Command pattern become overkill versus a simple strategy dispatch?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you don't need the command to carry metadata, be queued, logged, or introspected before execution — if the only goal is swapping behavior, Strategy is lighter. Command's value emerges when the request object itself needs to be treated as a first-class entity (queued, persisted, replayed, or inspected by infrastructure)."
      }
    },
    {
      "@type": "Question",
      "name": "How does Redis's command table differ from a switch-based dispatch in terms of extensibility?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A switch statement requires editing the central dispatcher for every new command. Redis's `commandTable[]` array lets new commands be added by appending a struct entry — the generic dispatch path (`c->cmd->proc(c)`) is unchanged, following open/closed principle."
      }
    },
    {
      "@type": "Question",
      "name": "Why does every EF Core builder method return `this` instead of void?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Returning the same builder instance enables fluent chaining (`.UseModel(...).UseLoggerFactory(...)`), making a complex configuration read as one coherent statement. Underneath, each call actually swaps in a brand-new immutable configuration extension — the builder reference stays constant while the data it holds is rebuilt."
      }
    },
    {
      "@type": "Question",
      "name": "What problem does the immutable-extension-swap inside EF Core's builder solve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If the configuration data were a mutable shared object handed out to multiple consumers (several `DbContext` instances from one cached options set), one code path's configuration change would silently affect every other consumer. Immutable extensions prevent this — each consumer gets a snapshot that can't be mutated by another."
      }
    },
    {
      "@type": "Question",
      "name": "How does `WithOption` in `DbContextOptionsBuilder` handle the very first configuration call?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`Options.FindExtension<CoreOptionsExtension>() ?? new CoreOptionsExtension()` uses null-coalescing — if no extension exists yet, one is created fresh. This lets `UseModel(...)` work correctly whether it's the first call in the chain or the fifth."
      }
    },
    {
      "@type": "Question",
      "name": "Where does the actual immutable-update logic live — on the builder or on the extension?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "On the extension itself — `CoreOptionsExtension` has its own `With*` methods that return new instances of itself. The builder's role is purely orchestration: call the right `With*`, swap it in, return `this`. The data object owns its own immutability protocol."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the fluent builder pattern superior to a constructor with dozens of optional parameters?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Positional optional arguments are unreadable and easy to mix up (does the 7th parameter mean logger or connection string?). Individual setter calls don't guarantee required steps happened. A fluent builder reads as one coherent configuration statement while letting each method enforce its own validation."
      }
    },
    {
      "@type": "Question",
      "name": "What's a common mistake when implementing fluent builders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Returning `new Builder()` from each method instead of `this` — this breaks the chain because each call operates on a different builder instance with different accumulated state. The entire fluent pattern depends on all methods returning the same builder reference so each call mutates the same builder."
      }
    },
    {
      "@type": "Question",
      "name": "How does a DI container decide which constructor to call when a class has three constructors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It sorts constructors by parameter count (most first), then tries each in order, picking the first whose parameters are all resolvable. If a shorter constructor is also resolvable, its parameters must be a strict subset of the winner's — otherwise it's treated as a genuine ambiguity error."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when two constructors require genuinely different, non-overlapping sets of resolvable services?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The container throws an ambiguity error rather than guessing. Two constructors requiring different services that aren't subsets of each other represent a real design ambiguity — the developer must resolve it, not the container."
      }
    },
    {
      "@type": "Question",
      "name": "How does the circular dependency detection turn a stack overflow into a readable error?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`CallSiteChain` tracks which services are currently being resolved, in order, as the container recursively walks constructor dependencies. Before resolving service X, it checks whether X is already in the chain — if so, it throws with the exact resolution path (`A -> B -> C -> A`) built from insertion-ordered tracking."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `CallSiteChain` use `_callSiteChain.Count` at insertion time instead of dictionary iteration order?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Dictionaries don't guarantee insertion order. The chain explicitly tracks *when* each service entered resolution via `ChainItemInfo(_callSiteChain.Count, ...)` so the error message reconstructs the resolution path in the order it actually happened."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `CallSiteChain` have both `Add` and `Remove` methods?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The chain reflects only what's *currently* on the resolution stack — a service successfully resolved gets removed, so resolving the same service again later (as a separate, independent request) doesn't falsely trigger the circular-dependency check."
      }
    },
    {
      "@type": "Question",
      "name": "What's a common mistake that triggers an ambiguous-constructor exception?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Adding a new optional dependency to a constructor that was previously the only resolvable one, when another shorter constructor already exists and is also resolvable. The container now sees two resolvable constructors with non-subset parameter sets — the fix is either removing the ambiguity or using a factory delegate."
      }
    },
    {
      "@type": "Question",
      "name": "Why does eShop wrap EF Core's `DbSet<T>` in an `IOrderRepository` layer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because `DbSet<T>` doesn't encode how a specific aggregate needs to be loaded correctly. A naive `FindAsync` returns an `Order` with `OrderItems` unloaded — a technically-successful query that hands back an incomplete aggregate. `IOrderRepository.GetAsync` centralizes the eager-loading rule in exactly one place."
      }
    },
    {
      "@type": "Question",
      "name": "Where does `IOrderRepository` live and why does that placement matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It lives in the `Ordering.Domain` project, not `Ordering.Infrastructure`. This is physical enforcement of dependency direction — the domain project has zero reference to EF Core; only the infrastructure project references both the domain interface and EF Core, keeping business logic technology-agnostic."
      }
    },
    {
      "@type": "Question",
      "name": "How does the Repository pattern pair with Unit of Work in eShop?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`OrderRepository` stages changes via `Add`/`Update`, but nothing commits until something calls `UnitOfWork.SaveEntitiesAsync()` (which is `_context`). Multiple repository operations participate in one atomic transaction rather than each method committing independently."
      }
    },
    {
      "@type": "Question",
      "name": "What is the one line in `OrderRepository.GetAsync` that justifies the repository's existence?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`_context.Entry(order).Collection(i => i.OrderItems).LoadAsync()` — this single line encodes \"an Order isn't really loaded unless its items are too,\" applied automatically every time. Without the repository, every caller would need to independently remember to add this eager-loading call."
      }
    },
    {
      "@type": "Question",
      "name": "When is the Repository pattern *not* worth adding?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For trivial single-table CRUD where a generic query API already does the entire job. Whether a repository earns its keep depends on what the aggregate actually needs (complex loading rules, technology decoupling for testing) — it's not an automatic best practice for every entity."
      }
    },
    {
      "@type": "Question",
      "name": "What's a common gotcha when a developer adds a Repository on top of EF Core?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Treating it as purely a technology-abstraction layer and duplicating `DbSet<T>`'s full query surface through it. The value isn't hiding EF Core — it's centralizing aggregate-shaped loading rules and keeping the domain layer ORM-free. A repository that just delegates every LINQ call adds indirection without encoding domain knowledge."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Polly's circuit breaker have a 4th state (Isolated) that most textbooks skip?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Isolated is a manually-triggered open state distinct from automatic trips — an operator can deliberately force a dependency offline during maintenance without waiting for the failure threshold. It throws `IsolatedCircuitException` instead of `BrokenCircuitException`, so monitoring can distinguish deliberate action from real incidents."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to an in-flight call's result when the circuit transitions from Closed to Open mid-flight?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The implementation deliberately takes no action — a success result arriving after the circuit tripped Open is ignored, not double-counted or used to incorrectly close the circuit. Only time passing (the break duration elapsing) governs the Open-to-HalfOpen transition, not stale in-flight results."
      }
    },
    {
      "@type": "Question",
      "name": "How does `HalfOpen` avoid immediately re-overwhelming a recovering dependency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`PermitHalfOpenCircuitTest_NeedsLock()` gates the transition and `_halfOpenAttempts` is explicitly tracked — the implementation permits a bounded number of test probes, not a full flood. This prevents a just-recovering dependency from being hit with the entire traffic volume immediately."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the \"should break\" decision delegated to a separate `_behavior` object rather than hardcoded in the state machine?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The threshold algorithm (failure-rate-over-a-sampling-window vs consecutive-failure-count) is pluggable and decoupled from state-transition logic. The state machine doesn't know *which* threshold algorithm decided to break — it only reacts to the boolean `shouldBreak` result."
      }
    },
    {
      "@type": "Question",
      "name": "What's the practical difference between Open and Isolated states in error-handling code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A spike in `BrokenCircuitException` is a real incident signal (automatic failure detection tripped the circuit). A spike in `IsolatedCircuitException` reflects a known, deliberate maintenance action. Error-handling and alerting code needs to distinguish these to avoid paging someone for a planned outage."
      }
    },
    {
      "@type": "Question",
      "name": "When would you manually Isolate a circuit instead of waiting for it to trip automatically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "During planned maintenance, before a known deployment that will make a dependency unavailable, or in response to a known incident where automatic detection hasn't tripped yet but you want to stop traffic immediately. It's an operator override for situations where the failure threshold would take too long to trip."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when implementing a circuit breaker?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Treating it as a simple boolean (on/off) instead of a state machine. Without HalfOpen, the circuit either blocks traffic forever or resumes full traffic immediately — there's no cautious recovery testing. Without Isolated, operators have no way to deliberately force a dependency offline without waiting for failure detection."
      }
    },
    {
      "@type": "Question",
      "name": "Why does ASP.NET Core build its middleware pipeline backwards instead of forwards?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Building backwards means each middleware wraps \"everything registered after it\" as a single `RequestDelegate` closure. The last-registered middleware wraps the terminal handler first, then each preceding one wraps the previous result — making the first-registered middleware the outermost layer at runtime, even though the build loop iterated in reverse."
      }
    },
    {
      "@type": "Question",
      "name": "What does the terminal `RequestDelegate` in ASP.NET Core's pipeline do when a request reaches it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It checks whether an endpoint was matched but never executed — if so, it throws `InvalidOperationException` instead of silently returning 404. A request reaching the pipeline's end with a routed endpoint still unhandled means someone forgot to register endpoint-execution middleware, and this defensive check catches that configuration mistake."
      }
    },
    {
      "@type": "Question",
      "name": "Why are registration and construction deliberately separate phases in ASP.NET Core's middleware pipeline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`Use()` only appends to a list — all real chain-construction complexity is deferred to `Build()`, called once later. This lets middleware registration be composable across `Startup`/`Program.cs` conditionals and extension methods from different packages before the final chain is assembled."
      }
    },
    {
      "@type": "Question",
      "name": "How does `_components[c](app)` make the `next` parameter mean \"the rest of the pipeline\"?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each factory function receives \"everything built so far\" (`app`) as its argument and returns a *new* `RequestDelegate` that closes over it. The `next` parameter isn't a global reference to a pipeline object — it's a specific closure captured at build time, one link at a time."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to execution order when you use conditional branching (`MapWhen`, `UseWhen`) in the pipeline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each conditional builds its own sub-chain the same reverse-way, creating nested closures. Understanding the reverse-build mechanism — not just memorizing \"first registered, first run\" — is what explains the resulting execution order once conditional branching enters the picture."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when debugging middleware execution order?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Assuming registration order directly maps to execution order. The registration list is the input to a reverse-build process that *produces* the execution order as an emergent property of nested closures. Once `Map`, `MapWhen`, or `UseWhen` create sub-chains, the actual execution path can diverge from the registration order."
      }
    },
    {
      "@type": "Question",
      "name": "When would you use Chain of Responsibility instead of Decorator for composing behaviors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Chain of Responsibility passes work along to the next handler and lets each decide whether to handle or forward — each handler is independent and doesn't know about others. Decorator wraps behavior *around* a core operation, where each layer explicitly calls the wrapped thing. Use CoR when handlers are peers (auth, CORS, routing); use Decorator when you're layering cross-cutting concerns around a single operation."
      }
    }
  ]
}
</script>

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

  /* Accordion: click or keypress on question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
    h3.setAttribute('aria-expanded', h3.parentElement.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    e.preventDefault();
    h3.click();
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
