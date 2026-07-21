---
layout: page
title: ".NET Interview Questions: 92 Real-World Q&A from Production Manifests"
description: "92 interview-ready .NET questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/dotnet/
---

Bite-sized, standalone interview questions and answers for .NET. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">92</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: Minimal APIs & the Middleware Pipeline (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `ApplicationBuilder.Build()` actually do when composing middleware? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It folds the `_components` list from last-to-first into one nested `RequestDelegate`. The last `app.Use(...)` call becomes the innermost function (closest to the terminal 404 delegate), and the first becomes the outermost — the first thing that runs on the way in and the last on the way out. There is no list being iterated at request time.

<p class="qa-link">[Full post →]({{ '/dotnet/minimal-apis-middleware-pipeline-nested-delegates/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does an `app.MapGet(...)` endpoint differ from middleware registered via `app.Use(...)`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`MapGet` adds a `RouteEndpoint` to a separate `EndpointDataSource`, not to `_components`. It only runs if routing middleware (itself part of the `Use`-based pipeline) matches the request. Endpoint handlers are not part of the middleware chain and cannot intercept requests that never reach routing.

<p class="qa-link">[Full post →]({{ '/dotnet/minimal-apis-middleware-pipeline-nested-delegates/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if a middleware never calls `next(context)`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The entire rest of the pipeline — including all downstream middleware and the endpoint — is short-circuited silently. The client receives no error, no exception, and no response unless the middleware explicitly writes one. This is a common source of "endpoint never reached" bugs.

<p class="qa-link">[Full post →]({{ '/dotnet/minimal-apis-middleware-pipeline-nested-delegates/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does calling `app.UseAuthentication()` twice create one or two auth layers? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Two. `Use()` has no deduplication — each call appends another entry to `_components`, and `Build()` wraps each as its own nested layer. The second authentication middleware runs against the same `HttpContext`, producing redundant work and potential side effects.

<p class="qa-link">[Full post →]({{ '/dotnet/minimal-apis-middleware-pipeline-nested-delegates/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When does `ApplicationBuilder.Build()` execute in a Minimal API app? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It runs when the host starts processing requests, via `WebApplication.BuildRequestDelegate()`, after all `app.Use(...)` and `app.Map...(...)` calls in `Program.cs` have executed. The pipeline shape is fixed the moment `Build()` runs — nothing about the per-request path re-orders middleware.

<p class="qa-link">[Full post →]({{ '/dotnet/minimal-apis-middleware-pipeline-nested-delegates/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the default terminal delegate distinguish "matched endpoint with null delegate" from "no match"? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Those are different failure modes with different fixes. A matched-but-uninvoked endpoint means routing found it but the pipeline never called it (typically a missing `UseEndpoints` wiring), while no match at all is a normal 404. Collapsing them would hide a wiring bug behind an ordinary response.

<p class="qa-link">[Full post →]({{ '/dotnet/minimal-apis-middleware-pipeline-nested-delegates/' | relative_url }})</p>
  </div>
</div>

## Topic: Dependency Injection Container Internals (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is a captive dependency and why does it produce silent data corruption? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A captive dependency is a scoped service captured by a singleton through constructor injection. The singleton holds the scoped instance for its entire lifetime, so every request that should get a fresh instance silently reuses a stale one — producing cross-request data leakage that never throws by default.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-di-container-captive-dependency-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `CallSiteValidator` detect a captive dependency? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It walks each service's `ServiceCallSite` tree at resolution time, tracking whether a scoped node appears while inside a singleton subtree. When a scoped service is found inside a singleton's tree, it throws `InvalidOperationException` naming both services. The walk is memoized per `Cache.Key` so shared subtrees aren't re-walked.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-di-container-captive-dependency-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is `IServiceScopeFactory` explicitly exempted from the captive-dependency check? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Injecting a scope *factory* into a singleton is the sanctioned pattern for consuming scoped services on demand — the singleton creates short-lived scopes via `CreateScope()` instead of capturing a single scoped instance. The validator permits this escape hatch while still catching direct constructor capture.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-di-container-captive-dependency-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between `ValidateScopes` and `ValidateOnBuild`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ValidateScopes` checks services only when they are actually resolved at runtime — a captive dependency in a rarely-used singleton could go undetected until that code path executes. `ValidateOnBuild` eagerly validates every registered service at `BuildServiceProvider()` time, closing that gap.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-di-container-captive-dependency-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can a transient service be a captive dependency in a singleton? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. A transient service is constructed fresh on every injection, so the singleton always gets a new instance at construction time. There's no cross-request state sharing. `CallSiteValidator` only flags scoped services because only scoped services carry the "should be fresh per scope" guarantee a singleton violates.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-di-container-captive-dependency-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if a factory-registered singleton resolves a scoped dependency inside the factory delegate? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The `CallSiteValidator` tree-walk is built around constructor-injection call-site analysis. A factory delegate (`AddSingleton<T>(sp => ...)`) that manually resolves a scoped service from the passed `IServiceProvider` bypasses this analysis and can reintroduce the same captive-dependency bug without detection.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-di-container-captive-dependency-validation/' | relative_url }})</p>
  </div>
</div>

## Topic: Configuration & the Options Pattern (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does `IOptionsMonitor<T>` poll `appsettings.json` on a timer? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. It subscribes once to `IConfiguration`'s reload token via `ChangeToken.OnChange`. The token is push-based — a provider's file-system watcher fires it when a real change is detected. The monitor never polls anything itself.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-options-pattern-ioptionsmonitor-live-reload/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do the three Options interfaces differ in reload behavior? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`IOptions<T>` is bound once at startup, cached forever — no reload. `IOptionsSnapshot<T>` recomputes once per scope (e.g., per HTTP request). `IOptionsMonitor<T>` is long-lived and reload-aware, safe to inject into singletons, with `CurrentValue` reflecting the latest value and `OnChange` firing on updates.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-options-pattern-ioptionsmonitor-live-reload/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens inside `OptionsMonitor` when the reload token fires? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`InvokeChanged` first evicts the stale cached value via `_cache.TryRemove(name)`, then calls `Get(name)` which re-binds through the factory. The new value isn't computed until something actually reads `CurrentValue` after the token fired, keeping the reaction cheap.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-options-pattern-ioptionsmonitor-live-reload/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is `ChangeToken.OnChange` necessary instead of a raw subscription? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`IChangeToken`s in .NET are single-fire — they don't keep notifying after one firing. `ChangeToken.OnChange` automatically re-registers a fresh token after each firing, which is why `OptionsMonitor` relies on one `RegisterSource` call at construction instead of manual re-subscription after every change.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-options-pattern-ioptionsmonitor-live-reload/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does editing an environment variable trigger `IOptionsMonitor` to reload? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Typically no. The default environment-variable provider reads values once at process start and has no live change-detection mechanism. Only providers with file-system watchers (like the JSON provider) fire reload tokens. The monitor works identically regardless of provider, but only if the provider itself fires.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-options-pattern-ioptionsmonitor-live-reload/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the practical cost of `OnChange` listeners not being disposed? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Long-running apps that register `OnChange` listeners repeatedly without disposing old ones accumulate a growing, never-cleaned subscriber list. Each firing invokes all registered callbacks, including stale ones. `OnChange` returns an `IDisposable` specifically so listeners can unsubscribe.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-options-pattern-ioptionsmonitor-live-reload/' | relative_url }})</p>
  </div>
</div>

## Topic: async/await & the Task-based Asynchronous Pattern (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does `async/await` create a new thread? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. The compiler rewrites the method into a state machine that runs synchronously on the caller's thread up to the first `await` on an incomplete task. At that point the thread is released back to the pool. When the awaited operation completes, a thread pool thread resumes via `MoveNext()` — no thread is dedicated to waiting.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-async-await-compiler-generated-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to local variables across `await` points? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The compiler hoists every variable live across an `await` into fields on the state machine struct. If the state machine is boxed (because an `await` suspended), those fields live on the heap for the operation's duration — this is the core allocation cost of async methods beyond the `Task` itself.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-async-await-compiler-generated-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When does the compiler-generated state machine get boxed to the heap? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Only when an `await` actually suspends. `Start()` runs `MoveNext()` while the struct is still on the stack. If every `await` hits an already-complete task, no boxing occurs and the method runs entirely synchronously with zero heap allocations beyond the result object.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-async-await-compiler-generated-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `AsyncTaskMethodBuilder.SetResult` have a fast path? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
If nobody has accessed the returned `Task` yet, `SetResult` assigns a static cached pre-completed task (`Task.s_cachedCompleted`) instead of allocating a new one. This eliminates the `Task` allocation entirely when the async method completes synchronously and the caller hasn't awaited it.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-async-await-compiler-generated-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between `AwaitOnCompleted` and `AwaitUnsafeOnCompleted`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`AwaitOnCompleted` captures and flows the current `ExecutionContext`. `AwaitUnsafeOnCompleted` skips `ExecutionContext.Capture()` entirely, used for awaiters that implement `ICriticalNotifyCompletion` and handle context flow themselves — avoiding redundant capture overhead.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-async-await-compiler-generated-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the runtime ensure exactly one thread sees a `Task` transition from Running to RanToCompletion? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It uses `AtomicStateUpdate` with `Interlocked.CompareExchange` — a compare-and-swap loop on the volatile `m_stateFlags` int. This is not a `lock`; it's a lock-free CAS that guarantees exactly one thread observes each state transition.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-async-await-compiler-generated-state-machine/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is `async void` dangerous? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`async void` doesn't return a `Task`, so exceptions can't be captured by a builder. An unhandled exception in `async void` crashes the process immediately. It should only be used for event handlers that require the `void` return type.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-async-await-compiler-generated-state-machine/' | relative_url }})</p>
  </div>
</div>

## Topic: The .NET Garbage Collector (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does generational collection reduce GC pause times? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The heap is divided into gen0 (new objects), gen1 (survived one GC), and gen2 (long-lived). Gen0 collections scan only the small ephemeral segment (typically ~256 KB), reclaiming the vast majority of garbage in microseconds without touching long-lived objects in gen2.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-garbage-collector-generational-collection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when gen0 collection doesn't free enough memory? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The GC escalates. A gen1 collection runs (which also collects gen0). If that's still insufficient, a gen2 collection runs — scanning the entire heap including LOH. The allocation state machine walks through `trigger_ephemeral_gc` → `trigger_2nd_ephemeral_gc` as it escalates.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-garbage-collector-generational-collection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do gen0, gen1, and gen2 relate physically in memory? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
All three share the same Small Object Heap (SOH) segment chain — they are logical divisions within contiguous heap segments, not separate memory regions. The GC places marker objects (min-size unused arrays) at boundaries within the same `heap_segment` to separate generations.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-garbage-collector-generational-collection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why are large objects (≥ 85 KB) treated separately on the LOH? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Compacting large objects is expensive — copying large memory blocks and updating all references costs orders of magnitude more than moving small objects. The LOH avoids compaction by default and is only collected during gen2 collections, where the cost is amortized against the full-heap scan.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-garbage-collector-generational-collection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What role do card tables play during ephemeral GC? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Card tables enable cross-generational references without scanning the whole heap. When a gen2 object references a gen0 object, the JIT write barrier sets a "card" byte marking that region. During ephemeral collections, the GC only examines cards to find old-to-young references.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-garbage-collector-generational-collection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Server GC differ from Workstation GC? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Workstation GC uses a single heap with one GC thread, optimized for low-latency desktop apps. Server GC creates one heap per logical processor, each with its own GC thread and allocation contexts, enabling parallel collection and eliminating allocation contention — the default for ASP.NET.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-garbage-collector-generational-collection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the GC use dynamic budget smoothing instead of fixed generation budgets? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Without smoothing, a single high-survival gen0 collection could wildly inflate the budget, causing the next collection to scan a much larger region. Exponential smoothing in the `dynamic_data_table` prevents oscillation and keeps collection costs predictable.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-garbage-collector-generational-collection/' | relative_url }})</p>
  </div>
</div>

## Topic: Just-In-Time Compilation & Tiered Compilation (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does .NET re-compile a method it already has machine code for? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The first JIT pass (Tier0) trades code quality for startup speed — no inlining, no loop optimizations. Once call counting confirms a method is hot (30+ calls after startup), the runtime re-JITs it on a background thread with full Tier1 optimizations. The slow code runs for milliseconds; the optimized code runs for the process lifetime.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-tiered-jit-compilation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What prevents background Tier1 compilation from competing with startup? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A startup delay (default 100ms) resets every time a Tier0 method is compiled. Only after 100ms with no Tier0 compilation does call counting begin. The background thread sleeps for this delay, ensuring it doesn't steal CPU from the foreground during startup.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-tiered-jit-compilation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Tier1 code activation work without stopping the world? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ActivateCodeVersion` atomically swaps the method's precode (indirection trampoline) to point at new Tier1 native code. Any thread currently executing old Tier0 code finishes naturally; only future calls enter Tier1. This is a lock-free hot-swap, not a stop-the-world replacement.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-tiered-jit-compilation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is On-Stack Replacement (OSR) in tiered compilation? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
OSR lets the runtime replace code *inside a currently executing method*. If a Tier0 loop runs for a long time, OSR can swap in Tier1 code for the active frame without waiting for the method to return and be called again — preventing infinite loops from permanently running unoptimized code.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-tiered-jit-compilation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How can you force a method to skip Tier0 entirely? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Apply `[MethodImpl(MethodImplOptions.AggressiveOptimization)]`. This tells the runtime the method is eligible for Tier1 from the first call, skipping the call-counting phase entirely. Useful for methods known to be hot.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-tiered-jit-compilation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does tiered compilation apply to ReadyToRun (precompiled) assemblies? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Yes. R2R code is treated as Tier0. If the runtime detects the method is hot, it re-JITs from IL with full optimizations, which can produce faster code because the JIT sees exact loaded dependencies and CPU features at runtime.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-tiered-jit-compilation/' | relative_url }})</p>
  </div>
</div>

## Topic: EF Core Change Tracking & SaveChanges (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does EF Core decide whether to emit INSERT, UPDATE, or DELETE? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It snapshots every property value when an entity is first tracked. Before `SaveChanges`, `DetectChanges` diffs the live object against the snapshot. The entity's state machine (`Added` → INSERT, `Modified` → UPDATE, `Deleted` → DELETE) is the sole determinant of which SQL command gets generated.

<p class="qa-link">[Full post →]({{ '/dotnet/ef-core-change-tracker-savechanges-snapshot/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When is the change-tracking snapshot captured? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
At query materialization time — the moment the SQL reader populates each property via `StartTrackingFromQuery`. The snapshot reflects the database's exact state at query execution, not whatever state the entity might have been in if previously tracked and detached.

<p class="qa-link">[Full post →]({{ '/dotnet/ef-core-change-tracker-savechanges-snapshot/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `dbContext.Update(entity)` always generate an UPDATE even if nothing changed? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`Update` sets the entity state to `Modified`, which *guarantees* an UPDATE regardless of whether any property actually changed. The UPDATE will SET every column to its current value. Use `Attach` + selective property marking for only-changed-columns UPDATE.

<p class="qa-link">[Full post →]({{ '/dotnet/ef-core-change-tracker-savechanges-snapshot/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the most common source of "entity not updating" bugs in Web APIs? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Passing a deserialized entity to `Update()` on a fresh context without first loading the existing entity to populate the snapshot. The fresh context has no baseline to diff against, so it treats the entity as newly added or generates a blanket UPDATE with incorrect WHERE clauses.

<p class="qa-link">[Full post →]({{ '/dotnet/ef-core-change-tracker-savechanges-snapshot/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When does `AcceptAllChanges` run relative to the database commit? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Only *after* the provider reports success. If the provider throws, entities remain in their pre-save state and the change tracker is consistent with what actually hit the database. State transitions happen on success, not before.

<p class="qa-link">[Full post →]({{ '/dotnet/ef-core-change-tracker-savechanges-snapshot/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does EF Core handle concurrency token mismatches on UPDATE? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
For `Modified` entities, the UPDATE's WHERE clause includes the original value of any `IsConcurrencyToken` property from the snapshot. A row-version mismatch produces `DbUpdateConcurrencyException` — the row was modified by another process between load and save.

<p class="qa-link">[Full post →]({{ '/dotnet/ef-core-change-tracker-savechanges-snapshot/' | relative_url }})</p>
  </div>
</div>

## Topic: Background Services & Hosted Lifetimes (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does `BackgroundService.StartAsync` block until `ExecuteAsync` finishes? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. `StartAsync` wraps `ExecuteAsync` in a `Task.Run`, stores the task, and returns `Task.CompletedTask`. The host considers the service "started" before your background loop has done a single iteration, moves on to start the next service, and fires `ApplicationStarted`.

<p class="qa-link">[Full post →]({{ '/dotnet/aspnet-core-backgroundservice-hosted-lifetime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when a `BackgroundService.ExecuteAsync` throws an unhandled exception? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The task transitions to `Faulted` state silently. The host only discovers the fault when `TryExecuteBackgroundServiceAsync` awaits the stored task. With the default `BackgroundServiceExceptionBehavior.StopHost`, this calls `StopApplication()` and shuts down the entire process.

<p class="qa-link">[Full post →]({{ '/dotnet/aspnet-core-backgroundservice-hosted-lifetime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the host shut down a `BackgroundService` that ignores cancellation? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`StopAsync` cancels the CTS and awaits the task with `ShutdownTimeout` (default 30 seconds), using `Task.WhenAny` against the stop token. If the task doesn't complete within that window, `StopAsync` returns and the host proceeds with disposal.

<p class="qa-link">[Full post →]({{ '/dotnet/aspnet-core-backgroundservice-hosted-lifetime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the two-phase startup contract for `BackgroundService`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Phase one: the host calls `StartAsync`, considers the service "started," and proceeds. Phase two: the host monitors the stored `ExecuteTask` as a fire-and-forget watchdog. These phases are deliberately decoupled — the host has no idea whether your background work has made progress, faulted, or is still initializing.

<p class="qa-link">[Full post →]({{ '/dotnet/aspnet-core-backgroundservice-hosted-lifetime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does shutdown wait on monitor tasks even after `StopAsync` completes? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The `StopAsync` continuation and the monitor task (`TryExecuteBackgroundServiceAsync`) race. The host uses `Task.WhenAll` on `_backgroundServiceTasks` to ensure exceptions from the monitor task are always observed, even if `StopAsync`'s continuation ran first — preventing silent non-zero exit codes.

<p class="qa-link">[Full post →]({{ '/dotnet/aspnet-core-backgroundservice-hosted-lifetime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if you register a singleton without `AddHostedService`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The host never calls `StartAsync` or `StopAsync` on it. The instance lives as a plain singleton with no lifecycle management — it won't be started, stopped, or disposed as part of the host lifecycle. `AddHostedService<T>()` internally does both `AddSingleton<T>()` and the hosted-service registration.

<p class="qa-link">[Full post →]({{ '/dotnet/aspnet-core-backgroundservice-hosted-lifetime/' | relative_url }})</p>
  </div>
</div>

## Topic: gRPC on .NET (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does a single `GrpcChannel` open only one HTTP/2 connection by default? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The HTTP/2 spec recommends a single connection per origin. `SocketsHttpHandler` follows this — but service-to-service communication with hundreds of concurrent streams violates the assumption behind that recommendation, causing silent queueing when streams exceed `SETTINGS_MAX_CONCURRENT_STREAMS`.

<p class="qa-link">[Full post →]({{ '/dotnet/grpc-dotnet-http2-connection-pool/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when concurrent streams exceed the single connection's limit? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`SocketsHttpHandler` queues new streams behind existing ones. There is no error, no exception, and no log entry. Requests simply wait — the only symptom is rising latency and eventual deadline expiration.

<p class="qa-link">[Full post →]({{ '/dotnet/grpc-dotnet-http2-connection-pool/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `EnableMultipleHttp2Connections` fix the queueing problem? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It tells the connection pool to open a second HTTP/2 connection when the first hits its concurrent-stream ceiling. The pool then load-balances new streams across available connections. There's no hard cap — as many connections are created as needed.

<p class="qa-link">[Full post →]({{ '/dotnet/grpc-dotnet-http2-connection-pool/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `GrpcChannel` use `HttpMessageInvoker` instead of `HttpClient`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`HttpMessageInvoker` skips `HttpClient`'s client-side features — automatic redirects, cookie handling — that gRPC doesn't use, gaining measurable performance in tight call loops. The channel only needs the raw HTTP/2 transport.

<p class="qa-link">[Full post →]({{ '/dotnet/grpc-dotnet-http2-connection-pool/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the consequence of not setting `PooledConnectionLifetime`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The default is infinite — connections never close, so DNS changes are never picked up. If a server's IP changes (e.g., during Kubernetes pod rotation), the channel keeps sending traffic to the old IP until the process restarts.

<p class="qa-link">[Full post →]({{ '/dotnet/grpc-dotnet-http2-connection-pool/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `GrpcChannel` use reflection-based handler detection? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`HasHttpHandlerType` checks the handler's full type name string because `DelegatingHandler` chains can wrap the real handler several layers deep. Runtime type checks would fail because the outermost handler is always a `DelegatingHandler`, not the `SocketsHttpHandler` buried inside.

<p class="qa-link">[Full post →]({{ '/dotnet/grpc-dotnet-http2-connection-pool/' | relative_url }})</p>
  </div>
</div>

## Topic: SignalR (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the Aspire Dashboard use SignalR instead of HTTP long-polling? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Telemetry is server-initiated and push-based, but HTTP request-response is pull-based. SignalR gives every browser a persistent, bidirectional WebSocket connection where the server can write at any time — eliminating the latency and connection overhead of re-requesting after each update.

<p class="qa-link">[Full post →]({{ '/dotnet/signalr-aspire-dashboard-websocket-telemetry/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What are the two independent failure modes in the Aspire Dashboard's SignalR circuit? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The Blazor circuit (WebSocket to the browser) — when it drops, the entire UI freezes and Blazor auto-reconnects. And the resource service (gRPC from dashboard to Aspire resource service) — when it drops, the UI stays interactive but no new telemetry arrives. They require different remediation.

<p class="qa-link">[Full post →]({{ '/dotnet/signalr-aspire-dashboard-websocket-telemetry/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is prerendering disabled in the Aspire Dashboard? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
With prerendering enabled, Blazor renders HTML without a circuit, then hydrates client-side — during which telemetry subscriptions fire but have nowhere to push updates. By disabling prerendering, the browser shows a loading state until the circuit is live, and every subscription is active from the first render.

<p class="qa-link">[Full post →]({{ '/dotnet/signalr-aspire-dashboard-websocket-telemetry/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the dashboard use `Virtualize` with `OverscanCount="100"` for data grids? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A busy service emits hundreds of spans per second — rendering all into the DOM would freeze the browser. `Virtualize` only renders visible rows plus the overscan buffer, keeping DOM node count constant regardless of total trace count. The overscan prevents visible blank rows during fast scrolling.

<p class="qa-link">[Full post →]({{ '/dotnet/signalr-aspire-dashboard-websocket-telemetry/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can two browser tabs share the same Blazor circuit? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. Each tab opens its own SignalR connection and its own Blazor circuit. The backend maintains separate subscription state per circuit, meaning opening three tabs triples the gRPC subscription load — a scaling concern in shared environments.

<p class="qa-link">[Full post →]({{ '/dotnet/signalr-aspire-dashboard-websocket-telemetry/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to in-memory component state when the Blazor circuit is rejected on reconnect? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`app-reconnect.js` calls `location.reload()`, reinitializing everything from scratch. Components re-subscribe to telemetry streams on `OnInitializedAsync`, so the user sees a brief empty state before data repopulates — the circuit was garbage-collected during a long disconnect.

<p class="qa-link">[Full post →]({{ '/dotnet/signalr-aspire-dashboard-websocket-telemetry/' | relative_url }})</p>
  </div>
</div>

## Topic: Span<T>, Memory<T> & Low-Allocation APIs (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is `Span<T>` restricted to the stack? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a `readonly ref struct` containing a `ref T` pointer and an `int` length — no object header, no vtable, no GC tracking. The CLR enforces that it can never be boxed, stored in a class field, or escaped beyond the current stack frame, which is what makes slicing zero-allocation.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-span-memory-low-allocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the practical difference between `Span<T>` and `Memory<T>`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`Span<T>` is stack-only and cannot cross `await` boundaries. `Memory<T>` is heap-safe — it can be stored in class fields, passed to async methods, and used across `await` boundaries. Use `Span<T>` for synchronous hot-path slicing; use `Memory<T>` when you need to hand a buffer to code that might store or suspend on it.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-span-memory-low-allocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `ArrayPool<T>.Shared.Return` use `AsSpan(0, lengthToClear).Clear()` internally? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It zeros only the portion of the array that was actually written, not the entire buffer. This is a `Span<T>` consumer inside the pool itself, keeping the clearing path allocation-free while avoiding unnecessary work on unwritten regions.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-span-memory-low-allocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if you return a rented buffer to `ArrayPool` while a `Span<T>` derived from it is still alive? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The span becomes a dangling reference. The pool may hand the same array to another caller, and any access through the old span reads or writes the new caller's data — silent data corruption, not a crash.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-span-memory-low-allocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `Span<T>.Slice` use `(uint)` casts in its bounds checks? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Casting `int` to `uint` turns a signed range check into an unsigned one. On 64-bit JITs, two 32-bit unsigned values compare in a single 64-bit comparison, eliminating a branch — a micro-optimization that matters when `Slice` is called millions of times per second.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-span-memory-low-allocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can `Span<T>` wrap reference types like `Span<string>`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. At construction, the runtime checks `typeof(T).IsValueType` and throws `ArrayTypeMismatchException` for reference types. This prevents the span from creating a view over a covariant array that could allow type-safety violations.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-span-memory-low-allocation/' | relative_url }})</p>
  </div>
</div>

## Topic: System.Threading.Channels (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a bounded channel apply backpressure without blocking a thread? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When the deque is full, `WriteAsync` enqueues a `BlockedWriteAsyncOperation<T>` on a linked list and returns an incomplete `ValueTask` — the producer's thread is freed. When the consumer dequeues an item, it walks the blocked-writer list and completes exactly one writer via `TrySetResult`, moving the item directly into the deque.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-channels-bounded-backpressure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why can't an unbounded channel ever apply backpressure? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`UnboundedChannel<T>` uses `ConcurrentQueue<T>` with no capacity check. `TryWrite` always enqueues and returns `true`. `WaitToWriteAsync` always returns `true`. There is no mechanism to suspend a producer — the queue grows until GC pressure or OOM.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-channels-bounded-backpressure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between `BoundedChannelFullMode.Wait` and `DropOldest`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`Wait` suspends the producer until space opens — true backpressure where every item matters. `DropOldest` evicts the oldest buffered item to make room for the new one — for status/telemetry where only the latest state matters and intermediate values are meaningless.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-channels-bounded-backpressure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `BoundedChannel` use `Deque<T>` instead of `Queue<T>`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`DropOldest` needs head dequeue and `DropNewest` needs tail dequeue — `Queue<T>` only supports head dequeue. `Deque<T>` provides O(1) `EnqueueTail`, `DequeueHead`, and `DequeueTail`, covering all four full-buffer modes.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-channels-bounded-backpressure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does capacity 0 create in `Channel.CreateBounded`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A `RendezvousChannel<T>` — synchronous handoff with zero buffer. The producer suspends until the consumer is ready to receive the item directly. Useful for request-response patterns where intermediate buffering would add latency without benefit.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-channels-bounded-backpressure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between `TryWrite` and `WriteAsync` on a bounded channel? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`TryWrite` is synchronous — returns `false` immediately when full, never suspends. `WriteAsync` suspends the producer's async task when the buffer is full (in `Wait` mode), freeing the thread. Use `WriteAsync` for backpressure; `TryWrite` for fire-and-forget where loss is acceptable.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-channels-bounded-backpressure/' | relative_url }})</p>
  </div>
</div>

## Topic: Native AOT & Trimming (Order 13)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `System.Text.Json` break under Native AOT without source generation? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`DefaultJsonTypeInfoResolver` uses `Type.GetProperties()`, `Type.GetConstructor()`, and `Activator.CreateInstance()` at runtime — all invisible to the trimmer. The trimmer strips that metadata at publish time, producing a binary that looks correct but throws `MissingMethodException` or `JsonException` at runtime.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-native-aot-trimming-reflection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does the `[JsonSerializable]` attribute actually do? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It tells the source generator to emit a `GetTypeInfo(Type)` override with a compile-time switch mapping types to pre-built `JsonTypeInfo<T>` instances — all property delegates, constructor calls, and converter wiring baked in as static IL. No reflection, no `Activator`, trim-safe.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-native-aot-trimming-reflection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why doesn't `[Serializable]` fix JSON serialization under trimming? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`[Serializable]` controls binary formatter behavior and has zero effect on `System.Text.Json`. There is no BCL attribute that says "keep all reflection metadata for this type for JSON purposes" — you need source generation via `[JsonSerializable]` entirely.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-native-aot-trimming-reflection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is this the worst class of trimming bug? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The trimmer does not crash at publish time. It produces a binary that looks correct but throws at runtime when a type's metadata has been removed. No compile-time warning, no publish-time error — just a production incident. With `EnableTrimAnalyzer` you get IL2026 warnings, but without it the binary ships broken.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-native-aot-trimming-reflection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if a serialized type is not listed in `[JsonSerializable]`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`GetTypeInfo` returns `null` for that type, and serialization throws. Every type in the serialization graph — dictionary keys, collection elements, polymorphic subtypes, custom converters — must be explicitly listed.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-native-aot-trimming-reflection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why are `[RequiresUnreferencedCode]` and `[RequiresDynamicCode]` on `DefaultJsonTypeInfoResolver`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
These attributes signal to the trimmer that the call site is unsafe. The trimmer uses them to emit warnings (IL2026, IL3050) at compile time, telling developers to switch to source generation for trimmed or AOT-compiled apps.

<p class="qa-link">[Full post →]({{ '/dotnet/dotnet-native-aot-trimming-reflection/' | relative_url }})</p>
  </div>
</div>

## Topic: Source Generators (Order 14)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the incremental generator pipeline cache syntax trees instead of the Compilation? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A Compilation is a monolithic snapshot — any single file change invalidates everything. Syntax trees are individually immutable, individually diffable by reference equality (O(1)), and individually cheap to compare. Caching at that granularity skips re-running transform nodes when only one file changed out of thousands.

<p class="qa-link">[Full post →]({{ '/dotnet/roslyn-source-generators-incremental-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What role does `CompilationCache` play in the incremental pipeline? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It preserves the `Compilation` reference when post-init trees and pre-compilation contributions are structurally identical. By returning the same reference, every generator's `CompilationProvider`-derived downstream nodes see a cached reference and short-circuit without re-execution.

<p class="qa-link">[Full post →]({{ '/dotnet/roslyn-source-generators-incremental-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `SyntaxStore` know when to skip re-evaluating a syntax tree? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It checks `_compilation == _previous._compilation` (reference equality) as its first fast path. When the Compilation reference is the same, all syntax input tables carry forward without touching any tree. When different, only trees with new or changed references re-trigger their transform nodes.

<p class="qa-link">[Full post →]({{ '/dotnet/roslyn-source-generators-incremental-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why can't you just cache the Compilation and compare it structurally? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Structural comparison of two Compilations would require comparing every tree, every option, every reference — roughly as expensive as re-running the generator. Syntax trees are the right boundary because reference equality (`object.ReferenceEquals`) is O(1) and tells you instantly whether that tree changed.

<p class="qa-link">[Full post →]({{ '/dotnet/roslyn-source-generators-incremental-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when a generator registers a `CompilationProvider` as its pipeline root? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Its downstream node re-runs whenever the Compilation reference changes — which is every build where any file changed. The generator is still incremental at the pipeline level, but there's nothing to increment over. The recommendation is to use `SyntaxProvider` with targeted predicates to narrow input.

<p class="qa-link">[Full post →]({{ '/dotnet/roslyn-source-generators-incremental-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `SyntaxStore` disable the Compilation fast path when step tracking is enabled? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Step recording traces are not persisted between runs, so the infrastructure cannot safely short-circuit when tracking is active — it needs steps to actually run (or be explicitly cached by node logic) to produce accurate diagnostic data.

<p class="qa-link">[Full post →]({{ '/dotnet/roslyn-source-generators-incremental-caching/' | relative_url }})</p>
  </div>
</div>

## Topic: Testing .NET Apps with xUnit (Order 15)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `[Theory]` with `[MemberData]` run the test multiple times while `[Fact]` runs it once? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`FactDiscoverer.Discover()` returns a single `XunitTestCase`. `TheoryDiscoverer.Discover()` calls `GetData()` at discovery time, iterates every row, and emits one `XunitTestCase` per row. The attribute is inert — the discoverer does the looping, not the attribute.

<p class="qa-link">[Full post →]({{ '/dotnet/xunit-theory-memberdata-fact-multiple-runs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when `[MemberData]` returns data rows with non-serializable types? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The discoverer falls back to a single `XunitDelayEnumeratedTheoryTestCase` that defers data fetching to runtime. The runner sees one test case instead of many, but at runtime the test case itself enumerates and runs per-row. The output looks identical; the infrastructure is different.

<p class="qa-link">[Full post →]({{ '/dotnet/xunit-theory-memberdata-fact-multiple-runs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `[Fact]` do when applied to a method with parameters? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`FactDiscoverer` actively rejects it — returning an `ExecutionErrorTestCase` with the message "Did you mean to use [Theory]?" This is a hard failure at discovery time, not a silent misconfiguration. Generic `[Fact]` methods get the same treatment.

<p class="qa-link">[Full post →]({{ '/dotnet/xunit-theory-memberdata-fact-multiple-runs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When is `[MemberData]`'s static data method invoked? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Once at discovery time, before any tests run. `GetData()` returns all rows as a single `IEnumerable`, and the discoverer iterates it. Your static property or method is invoked once, not once per row or once per test run.

<p class="qa-link">[Full post →]({{ '/dotnet/xunit-theory-memberdata-fact-multiple-runs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is `SupportsDiscoveryEnumeration()` and when does it matter? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
If a custom data attribute returns `false`, `TheoryDiscoverer` bails out to a single delay-enumerated test case instead of N pre-enumerated ones. Custom attributes that depend on runtime state (database queries, environment variables) use this to defer enumeration to execution time.

<p class="qa-link">[Full post →]({{ '/dotnet/xunit-theory-memberdata-fact-multiple-runs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between `[InlineData]` and `[MemberData]`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`[InlineData]` only supports compile-time constant values baked into the attribute. `[MemberData]` can call arbitrary static methods, return complex objects, or pull from external sources — anything producing `IEnumerable<object[]>`.

<p class="qa-link">[Full post →]({{ '/dotnet/xunit-theory-memberdata-fact-multiple-runs/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 92 across .NET

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does `ApplicationBuilder.Build()` actually do when composing middleware?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It folds the `_components` list from last-to-first into one nested `RequestDelegate`. The last `app.Use(...)` call becomes the innermost function (closest to the terminal 404 delegate), and the first becomes the outermost — the first thing that runs on the way in and the last on the way out. There is no list being iterated at request time."
      }
    },
    {
      "@type": "Question",
      "name": "How does an `app.MapGet(...)` endpoint differ from middleware registered via `app.Use(...)`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`MapGet` adds a `RouteEndpoint` to a separate `EndpointDataSource`, not to `_components`. It only runs if routing middleware (itself part of the `Use`-based pipeline) matches the request. Endpoint handlers are not part of the middleware chain and cannot intercept requests that never reach routing."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a middleware never calls `next(context)`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The entire rest of the pipeline — including all downstream middleware and the endpoint — is short-circuited silently. The client receives no error, no exception, and no response unless the middleware explicitly writes one. This is a common source of \"endpoint never reached\" bugs."
      }
    },
    {
      "@type": "Question",
      "name": "Does calling `app.UseAuthentication()` twice create one or two auth layers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Two. `Use()` has no deduplication — each call appends another entry to `_components`, and `Build()` wraps each as its own nested layer. The second authentication middleware runs against the same `HttpContext`, producing redundant work and potential side effects."
      }
    },
    {
      "@type": "Question",
      "name": "When does `ApplicationBuilder.Build()` execute in a Minimal API app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It runs when the host starts processing requests, via `WebApplication.BuildRequestDelegate()`, after all `app.Use(...)` and `app.Map...(...)` calls in `Program.cs` have executed. The pipeline shape is fixed the moment `Build()` runs — nothing about the per-request path re-orders middleware."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the default terminal delegate distinguish \"matched endpoint with null delegate\" from \"no match\"?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Those are different failure modes with different fixes. A matched-but-uninvoked endpoint means routing found it but the pipeline never called it (typically a missing `UseEndpoints` wiring), while no match at all is a normal 404. Collapsing them would hide a wiring bug behind an ordinary response."
      }
    },
    {
      "@type": "Question",
      "name": "What is a captive dependency and why does it produce silent data corruption?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A captive dependency is a scoped service captured by a singleton through constructor injection. The singleton holds the scoped instance for its entire lifetime, so every request that should get a fresh instance silently reuses a stale one — producing cross-request data leakage that never throws by default."
      }
    },
    {
      "@type": "Question",
      "name": "How does `CallSiteValidator` detect a captive dependency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It walks each service's `ServiceCallSite` tree at resolution time, tracking whether a scoped node appears while inside a singleton subtree. When a scoped service is found inside a singleton's tree, it throws `InvalidOperationException` naming both services. The walk is memoized per `Cache.Key` so shared subtrees aren't re-walked."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `IServiceScopeFactory` explicitly exempted from the captive-dependency check?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Injecting a scope *factory* into a singleton is the sanctioned pattern for consuming scoped services on demand — the singleton creates short-lived scopes via `CreateScope()` instead of capturing a single scoped instance. The validator permits this escape hatch while still catching direct constructor capture."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between `ValidateScopes` and `ValidateOnBuild`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ValidateScopes` checks services only when they are actually resolved at runtime — a captive dependency in a rarely-used singleton could go undetected until that code path executes. `ValidateOnBuild` eagerly validates every registered service at `BuildServiceProvider()` time, closing that gap."
      }
    },
    {
      "@type": "Question",
      "name": "Can a transient service be a captive dependency in a singleton?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. A transient service is constructed fresh on every injection, so the singleton always gets a new instance at construction time. There's no cross-request state sharing. `CallSiteValidator` only flags scoped services because only scoped services carry the \"should be fresh per scope\" guarantee a singleton violates."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a factory-registered singleton resolves a scoped dependency inside the factory delegate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The `CallSiteValidator` tree-walk is built around constructor-injection call-site analysis. A factory delegate (`AddSingleton<T>(sp => ...)`) that manually resolves a scoped service from the passed `IServiceProvider` bypasses this analysis and can reintroduce the same captive-dependency bug without detection."
      }
    },
    {
      "@type": "Question",
      "name": "Does `IOptionsMonitor<T>` poll `appsettings.json` on a timer?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. It subscribes once to `IConfiguration`'s reload token via `ChangeToken.OnChange`. The token is push-based — a provider's file-system watcher fires it when a real change is detected. The monitor never polls anything itself."
      }
    },
    {
      "@type": "Question",
      "name": "How do the three Options interfaces differ in reload behavior?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`IOptions<T>` is bound once at startup, cached forever — no reload. `IOptionsSnapshot<T>` recomputes once per scope (e.g., per HTTP request). `IOptionsMonitor<T>` is long-lived and reload-aware, safe to inject into singletons, with `CurrentValue` reflecting the latest value and `OnChange` firing on updates."
      }
    },
    {
      "@type": "Question",
      "name": "What happens inside `OptionsMonitor` when the reload token fires?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`InvokeChanged` first evicts the stale cached value via `_cache.TryRemove(name)`, then calls `Get(name)` which re-binds through the factory. The new value isn't computed until something actually reads `CurrentValue` after the token fired, keeping the reaction cheap."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `ChangeToken.OnChange` necessary instead of a raw subscription?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`IChangeToken`s in .NET are single-fire — they don't keep notifying after one firing. `ChangeToken.OnChange` automatically re-registers a fresh token after each firing, which is why `OptionsMonitor` relies on one `RegisterSource` call at construction instead of manual re-subscription after every change."
      }
    },
    {
      "@type": "Question",
      "name": "Does editing an environment variable trigger `IOptionsMonitor` to reload?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Typically no. The default environment-variable provider reads values once at process start and has no live change-detection mechanism. Only providers with file-system watchers (like the JSON provider) fire reload tokens. The monitor works identically regardless of provider, but only if the provider itself fires."
      }
    },
    {
      "@type": "Question",
      "name": "What is the practical cost of `OnChange` listeners not being disposed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Long-running apps that register `OnChange` listeners repeatedly without disposing old ones accumulate a growing, never-cleaned subscriber list. Each firing invokes all registered callbacks, including stale ones. `OnChange` returns an `IDisposable` specifically so listeners can unsubscribe."
      }
    },
    {
      "@type": "Question",
      "name": "Does `async/await` create a new thread?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The compiler rewrites the method into a state machine that runs synchronously on the caller's thread up to the first `await` on an incomplete task. At that point the thread is released back to the pool. When the awaited operation completes, a thread pool thread resumes via `MoveNext()` — no thread is dedicated to waiting."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to local variables across `await` points?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The compiler hoists every variable live across an `await` into fields on the state machine struct. If the state machine is boxed (because an `await` suspended), those fields live on the heap for the operation's duration — this is the core allocation cost of async methods beyond the `Task` itself."
      }
    },
    {
      "@type": "Question",
      "name": "When does the compiler-generated state machine get boxed to the heap?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Only when an `await` actually suspends. `Start()` runs `MoveNext()` while the struct is still on the stack. If every `await` hits an already-complete task, no boxing occurs and the method runs entirely synchronously with zero heap allocations beyond the result object."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `AsyncTaskMethodBuilder.SetResult` have a fast path?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If nobody has accessed the returned `Task` yet, `SetResult` assigns a static cached pre-completed task (`Task.s_cachedCompleted`) instead of allocating a new one. This eliminates the `Task` allocation entirely when the async method completes synchronously and the caller hasn't awaited it."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between `AwaitOnCompleted` and `AwaitUnsafeOnCompleted`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`AwaitOnCompleted` captures and flows the current `ExecutionContext`. `AwaitUnsafeOnCompleted` skips `ExecutionContext.Capture()` entirely, used for awaiters that implement `ICriticalNotifyCompletion` and handle context flow themselves — avoiding redundant capture overhead."
      }
    },
    {
      "@type": "Question",
      "name": "How does the runtime ensure exactly one thread sees a `Task` transition from Running to RanToCompletion?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It uses `AtomicStateUpdate` with `Interlocked.CompareExchange` — a compare-and-swap loop on the volatile `m_stateFlags` int. This is not a `lock`; it's a lock-free CAS that guarantees exactly one thread observes each state transition."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `async void` dangerous?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`async void` doesn't return a `Task`, so exceptions can't be captured by a builder. An unhandled exception in `async void` crashes the process immediately. It should only be used for event handlers that require the `void` return type."
      }
    },
    {
      "@type": "Question",
      "name": "How does generational collection reduce GC pause times?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The heap is divided into gen0 (new objects), gen1 (survived one GC), and gen2 (long-lived). Gen0 collections scan only the small ephemeral segment (typically ~256 KB), reclaiming the vast majority of garbage in microseconds without touching long-lived objects in gen2."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when gen0 collection doesn't free enough memory?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The GC escalates. A gen1 collection runs (which also collects gen0). If that's still insufficient, a gen2 collection runs — scanning the entire heap including LOH. The allocation state machine walks through `trigger_ephemeral_gc` → `trigger_2nd_ephemeral_gc` as it escalates."
      }
    },
    {
      "@type": "Question",
      "name": "How do gen0, gen1, and gen2 relate physically in memory?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All three share the same Small Object Heap (SOH) segment chain — they are logical divisions within contiguous heap segments, not separate memory regions. The GC places marker objects (min-size unused arrays) at boundaries within the same `heap_segment` to separate generations."
      }
    },
    {
      "@type": "Question",
      "name": "Why are large objects (≥ 85 KB) treated separately on the LOH?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compacting large objects is expensive — copying large memory blocks and updating all references costs orders of magnitude more than moving small objects. The LOH avoids compaction by default and is only collected during gen2 collections, where the cost is amortized against the full-heap scan."
      }
    },
    {
      "@type": "Question",
      "name": "What role do card tables play during ephemeral GC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Card tables enable cross-generational references without scanning the whole heap. When a gen2 object references a gen0 object, the JIT write barrier sets a \"card\" byte marking that region. During ephemeral collections, the GC only examines cards to find old-to-young references."
      }
    },
    {
      "@type": "Question",
      "name": "How does Server GC differ from Workstation GC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Workstation GC uses a single heap with one GC thread, optimized for low-latency desktop apps. Server GC creates one heap per logical processor, each with its own GC thread and allocation contexts, enabling parallel collection and eliminating allocation contention — the default for ASP.NET."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the GC use dynamic budget smoothing instead of fixed generation budgets?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Without smoothing, a single high-survival gen0 collection could wildly inflate the budget, causing the next collection to scan a much larger region. Exponential smoothing in the `dynamic_data_table` prevents oscillation and keeps collection costs predictable."
      }
    },
    {
      "@type": "Question",
      "name": "Why does .NET re-compile a method it already has machine code for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The first JIT pass (Tier0) trades code quality for startup speed — no inlining, no loop optimizations. Once call counting confirms a method is hot (30+ calls after startup), the runtime re-JITs it on a background thread with full Tier1 optimizations. The slow code runs for milliseconds; the optimized code runs for the process lifetime."
      }
    },
    {
      "@type": "Question",
      "name": "What prevents background Tier1 compilation from competing with startup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A startup delay (default 100ms) resets every time a Tier0 method is compiled. Only after 100ms with no Tier0 compilation does call counting begin. The background thread sleeps for this delay, ensuring it doesn't steal CPU from the foreground during startup."
      }
    },
    {
      "@type": "Question",
      "name": "How does Tier1 code activation work without stopping the world?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ActivateCodeVersion` atomically swaps the method's precode (indirection trampoline) to point at new Tier1 native code. Any thread currently executing old Tier0 code finishes naturally; only future calls enter Tier1. This is a lock-free hot-swap, not a stop-the-world replacement."
      }
    },
    {
      "@type": "Question",
      "name": "What is On-Stack Replacement (OSR) in tiered compilation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OSR lets the runtime replace code *inside a currently executing method*. If a Tier0 loop runs for a long time, OSR can swap in Tier1 code for the active frame without waiting for the method to return and be called again — preventing infinite loops from permanently running unoptimized code."
      }
    },
    {
      "@type": "Question",
      "name": "How can you force a method to skip Tier0 entirely?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Apply `[MethodImpl(MethodImplOptions.AggressiveOptimization)]`. This tells the runtime the method is eligible for Tier1 from the first call, skipping the call-counting phase entirely. Useful for methods known to be hot."
      }
    },
    {
      "@type": "Question",
      "name": "Does tiered compilation apply to ReadyToRun (precompiled) assemblies?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. R2R code is treated as Tier0. If the runtime detects the method is hot, it re-JITs from IL with full optimizations, which can produce faster code because the JIT sees exact loaded dependencies and CPU features at runtime."
      }
    },
    {
      "@type": "Question",
      "name": "How does EF Core decide whether to emit INSERT, UPDATE, or DELETE?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It snapshots every property value when an entity is first tracked. Before `SaveChanges`, `DetectChanges` diffs the live object against the snapshot. The entity's state machine (`Added` → INSERT, `Modified` → UPDATE, `Deleted` → DELETE) is the sole determinant of which SQL command gets generated."
      }
    },
    {
      "@type": "Question",
      "name": "When is the change-tracking snapshot captured?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "At query materialization time — the moment the SQL reader populates each property via `StartTrackingFromQuery`. The snapshot reflects the database's exact state at query execution, not whatever state the entity might have been in if previously tracked and detached."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `dbContext.Update(entity)` always generate an UPDATE even if nothing changed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`Update` sets the entity state to `Modified`, which *guarantees* an UPDATE regardless of whether any property actually changed. The UPDATE will SET every column to its current value. Use `Attach` + selective property marking for only-changed-columns UPDATE."
      }
    },
    {
      "@type": "Question",
      "name": "What is the most common source of \"entity not updating\" bugs in Web APIs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Passing a deserialized entity to `Update()` on a fresh context without first loading the existing entity to populate the snapshot. The fresh context has no baseline to diff against, so it treats the entity as newly added or generates a blanket UPDATE with incorrect WHERE clauses."
      }
    },
    {
      "@type": "Question",
      "name": "When does `AcceptAllChanges` run relative to the database commit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Only *after* the provider reports success. If the provider throws, entities remain in their pre-save state and the change tracker is consistent with what actually hit the database. State transitions happen on success, not before."
      }
    },
    {
      "@type": "Question",
      "name": "How does EF Core handle concurrency token mismatches on UPDATE?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For `Modified` entities, the UPDATE's WHERE clause includes the original value of any `IsConcurrencyToken` property from the snapshot. A row-version mismatch produces `DbUpdateConcurrencyException` — the row was modified by another process between load and save."
      }
    },
    {
      "@type": "Question",
      "name": "Does `BackgroundService.StartAsync` block until `ExecuteAsync` finishes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. `StartAsync` wraps `ExecuteAsync` in a `Task.Run`, stores the task, and returns `Task.CompletedTask`. The host considers the service \"started\" before your background loop has done a single iteration, moves on to start the next service, and fires `ApplicationStarted`."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when a `BackgroundService.ExecuteAsync` throws an unhandled exception?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The task transitions to `Faulted` state silently. The host only discovers the fault when `TryExecuteBackgroundServiceAsync` awaits the stored task. With the default `BackgroundServiceExceptionBehavior.StopHost`, this calls `StopApplication()` and shuts down the entire process."
      }
    },
    {
      "@type": "Question",
      "name": "How does the host shut down a `BackgroundService` that ignores cancellation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`StopAsync` cancels the CTS and awaits the task with `ShutdownTimeout` (default 30 seconds), using `Task.WhenAny` against the stop token. If the task doesn't complete within that window, `StopAsync` returns and the host proceeds with disposal."
      }
    },
    {
      "@type": "Question",
      "name": "What is the two-phase startup contract for `BackgroundService`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Phase one: the host calls `StartAsync`, considers the service \"started,\" and proceeds. Phase two: the host monitors the stored `ExecuteTask` as a fire-and-forget watchdog. These phases are deliberately decoupled — the host has no idea whether your background work has made progress, faulted, or is still initializing."
      }
    },
    {
      "@type": "Question",
      "name": "Why does shutdown wait on monitor tasks even after `StopAsync` completes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The `StopAsync` continuation and the monitor task (`TryExecuteBackgroundServiceAsync`) race. The host uses `Task.WhenAll` on `_backgroundServiceTasks` to ensure exceptions from the monitor task are always observed, even if `StopAsync`'s continuation ran first — preventing silent non-zero exit codes."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you register a singleton without `AddHostedService`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The host never calls `StartAsync` or `StopAsync` on it. The instance lives as a plain singleton with no lifecycle management — it won't be started, stopped, or disposed as part of the host lifecycle. `AddHostedService<T>()` internally does both `AddSingleton<T>()` and the hosted-service registration."
      }
    },
    {
      "@type": "Question",
      "name": "Why does a single `GrpcChannel` open only one HTTP/2 connection by default?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The HTTP/2 spec recommends a single connection per origin. `SocketsHttpHandler` follows this — but service-to-service communication with hundreds of concurrent streams violates the assumption behind that recommendation, causing silent queueing when streams exceed `SETTINGS_MAX_CONCURRENT_STREAMS`."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when concurrent streams exceed the single connection's limit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`SocketsHttpHandler` queues new streams behind existing ones. There is no error, no exception, and no log entry. Requests simply wait — the only symptom is rising latency and eventual deadline expiration."
      }
    },
    {
      "@type": "Question",
      "name": "How does `EnableMultipleHttp2Connections` fix the queueing problem?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It tells the connection pool to open a second HTTP/2 connection when the first hits its concurrent-stream ceiling. The pool then load-balances new streams across available connections. There's no hard cap — as many connections are created as needed."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `GrpcChannel` use `HttpMessageInvoker` instead of `HttpClient`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`HttpMessageInvoker` skips `HttpClient`'s client-side features — automatic redirects, cookie handling — that gRPC doesn't use, gaining measurable performance in tight call loops. The channel only needs the raw HTTP/2 transport."
      }
    },
    {
      "@type": "Question",
      "name": "What is the consequence of not setting `PooledConnectionLifetime`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The default is infinite — connections never close, so DNS changes are never picked up. If a server's IP changes (e.g., during Kubernetes pod rotation), the channel keeps sending traffic to the old IP until the process restarts."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `GrpcChannel` use reflection-based handler detection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`HasHttpHandlerType` checks the handler's full type name string because `DelegatingHandler` chains can wrap the real handler several layers deep. Runtime type checks would fail because the outermost handler is always a `DelegatingHandler`, not the `SocketsHttpHandler` buried inside."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the Aspire Dashboard use SignalR instead of HTTP long-polling?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Telemetry is server-initiated and push-based, but HTTP request-response is pull-based. SignalR gives every browser a persistent, bidirectional WebSocket connection where the server can write at any time — eliminating the latency and connection overhead of re-requesting after each update."
      }
    },
    {
      "@type": "Question",
      "name": "What are the two independent failure modes in the Aspire Dashboard's SignalR circuit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Blazor circuit (WebSocket to the browser) — when it drops, the entire UI freezes and Blazor auto-reconnects. And the resource service (gRPC from dashboard to Aspire resource service) — when it drops, the UI stays interactive but no new telemetry arrives. They require different remediation."
      }
    },
    {
      "@type": "Question",
      "name": "Why is prerendering disabled in the Aspire Dashboard?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "With prerendering enabled, Blazor renders HTML without a circuit, then hydrates client-side — during which telemetry subscriptions fire but have nowhere to push updates. By disabling prerendering, the browser shows a loading state until the circuit is live, and every subscription is active from the first render."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the dashboard use `Virtualize` with `OverscanCount=\"100\"` for data grids?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A busy service emits hundreds of spans per second — rendering all into the DOM would freeze the browser. `Virtualize` only renders visible rows plus the overscan buffer, keeping DOM node count constant regardless of total trace count. The overscan prevents visible blank rows during fast scrolling."
      }
    },
    {
      "@type": "Question",
      "name": "Can two browser tabs share the same Blazor circuit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Each tab opens its own SignalR connection and its own Blazor circuit. The backend maintains separate subscription state per circuit, meaning opening three tabs triples the gRPC subscription load — a scaling concern in shared environments."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to in-memory component state when the Blazor circuit is rejected on reconnect?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`app-reconnect.js` calls `location.reload()`, reinitializing everything from scratch. Components re-subscribe to telemetry streams on `OnInitializedAsync`, so the user sees a brief empty state before data repopulates — the circuit was garbage-collected during a long disconnect."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `Span<T>` restricted to the stack?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's a `readonly ref struct` containing a `ref T` pointer and an `int` length — no object header, no vtable, no GC tracking. The CLR enforces that it can never be boxed, stored in a class field, or escaped beyond the current stack frame, which is what makes slicing zero-allocation."
      }
    },
    {
      "@type": "Question",
      "name": "What is the practical difference between `Span<T>` and `Memory<T>`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`Span<T>` is stack-only and cannot cross `await` boundaries. `Memory<T>` is heap-safe — it can be stored in class fields, passed to async methods, and used across `await` boundaries. Use `Span<T>` for synchronous hot-path slicing; use `Memory<T>` when you need to hand a buffer to code that might store or suspend on it."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `ArrayPool<T>.Shared.Return` use `AsSpan(0, lengthToClear).Clear()` internally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It zeros only the portion of the array that was actually written, not the entire buffer. This is a `Span<T>` consumer inside the pool itself, keeping the clearing path allocation-free while avoiding unnecessary work on unwritten regions."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you return a rented buffer to `ArrayPool` while a `Span<T>` derived from it is still alive?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The span becomes a dangling reference. The pool may hand the same array to another caller, and any access through the old span reads or writes the new caller's data — silent data corruption, not a crash."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `Span<T>.Slice` use `(uint)` casts in its bounds checks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Casting `int` to `uint` turns a signed range check into an unsigned one. On 64-bit JITs, two 32-bit unsigned values compare in a single 64-bit comparison, eliminating a branch — a micro-optimization that matters when `Slice` is called millions of times per second."
      }
    },
    {
      "@type": "Question",
      "name": "Can `Span<T>` wrap reference types like `Span<string>`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. At construction, the runtime checks `typeof(T).IsValueType` and throws `ArrayTypeMismatchException` for reference types. This prevents the span from creating a view over a covariant array that could allow type-safety violations."
      }
    },
    {
      "@type": "Question",
      "name": "How does a bounded channel apply backpressure without blocking a thread?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When the deque is full, `WriteAsync` enqueues a `BlockedWriteAsyncOperation<T>` on a linked list and returns an incomplete `ValueTask` — the producer's thread is freed. When the consumer dequeues an item, it walks the blocked-writer list and completes exactly one writer via `TrySetResult`, moving the item directly into the deque."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't an unbounded channel ever apply backpressure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`UnboundedChannel<T>` uses `ConcurrentQueue<T>` with no capacity check. `TryWrite` always enqueues and returns `true`. `WaitToWriteAsync` always returns `true`. There is no mechanism to suspend a producer — the queue grows until GC pressure or OOM."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between `BoundedChannelFullMode.Wait` and `DropOldest`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`Wait` suspends the producer until space opens — true backpressure where every item matters. `DropOldest` evicts the oldest buffered item to make room for the new one — for status/telemetry where only the latest state matters and intermediate values are meaningless."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `BoundedChannel` use `Deque<T>` instead of `Queue<T>`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`DropOldest` needs head dequeue and `DropNewest` needs tail dequeue — `Queue<T>` only supports head dequeue. `Deque<T>` provides O(1) `EnqueueTail`, `DequeueHead`, and `DequeueTail`, covering all four full-buffer modes."
      }
    },
    {
      "@type": "Question",
      "name": "What does capacity 0 create in `Channel.CreateBounded`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A `RendezvousChannel<T>` — synchronous handoff with zero buffer. The producer suspends until the consumer is ready to receive the item directly. Useful for request-response patterns where intermediate buffering would add latency without benefit."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between `TryWrite` and `WriteAsync` on a bounded channel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`TryWrite` is synchronous — returns `false` immediately when full, never suspends. `WriteAsync` suspends the producer's async task when the buffer is full (in `Wait` mode), freeing the thread. Use `WriteAsync` for backpressure; `TryWrite` for fire-and-forget where loss is acceptable."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `System.Text.Json` break under Native AOT without source generation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`DefaultJsonTypeInfoResolver` uses `Type.GetProperties()`, `Type.GetConstructor()`, and `Activator.CreateInstance()` at runtime — all invisible to the trimmer. The trimmer strips that metadata at publish time, producing a binary that looks correct but throws `MissingMethodException` or `JsonException` at runtime."
      }
    },
    {
      "@type": "Question",
      "name": "What does the `[JsonSerializable]` attribute actually do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It tells the source generator to emit a `GetTypeInfo(Type)` override with a compile-time switch mapping types to pre-built `JsonTypeInfo<T>` instances — all property delegates, constructor calls, and converter wiring baked in as static IL. No reflection, no `Activator`, trim-safe."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't `[Serializable]` fix JSON serialization under trimming?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`[Serializable]` controls binary formatter behavior and has zero effect on `System.Text.Json`. There is no BCL attribute that says \"keep all reflection metadata for this type for JSON purposes\" — you need source generation via `[JsonSerializable]` entirely."
      }
    },
    {
      "@type": "Question",
      "name": "Why is this the worst class of trimming bug?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The trimmer does not crash at publish time. It produces a binary that looks correct but throws at runtime when a type's metadata has been removed. No compile-time warning, no publish-time error — just a production incident. With `EnableTrimAnalyzer` you get IL2026 warnings, but without it the binary ships broken."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a serialized type is not listed in `[JsonSerializable]`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`GetTypeInfo` returns `null` for that type, and serialization throws. Every type in the serialization graph — dictionary keys, collection elements, polymorphic subtypes, custom converters — must be explicitly listed."
      }
    },
    {
      "@type": "Question",
      "name": "Why are `[RequiresUnreferencedCode]` and `[RequiresDynamicCode]` on `DefaultJsonTypeInfoResolver`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "These attributes signal to the trimmer that the call site is unsafe. The trimmer uses them to emit warnings (IL2026, IL3050) at compile time, telling developers to switch to source generation for trimmed or AOT-compiled apps."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the incremental generator pipeline cache syntax trees instead of the Compilation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Compilation is a monolithic snapshot — any single file change invalidates everything. Syntax trees are individually immutable, individually diffable by reference equality (O(1)), and individually cheap to compare. Caching at that granularity skips re-running transform nodes when only one file changed out of thousands."
      }
    },
    {
      "@type": "Question",
      "name": "What role does `CompilationCache` play in the incremental pipeline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It preserves the `Compilation` reference when post-init trees and pre-compilation contributions are structurally identical. By returning the same reference, every generator's `CompilationProvider`-derived downstream nodes see a cached reference and short-circuit without re-execution."
      }
    },
    {
      "@type": "Question",
      "name": "How does `SyntaxStore` know when to skip re-evaluating a syntax tree?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It checks `_compilation == _previous._compilation` (reference equality) as its first fast path. When the Compilation reference is the same, all syntax input tables carry forward without touching any tree. When different, only trees with new or changed references re-trigger their transform nodes."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't you just cache the Compilation and compare it structurally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Structural comparison of two Compilations would require comparing every tree, every option, every reference — roughly as expensive as re-running the generator. Syntax trees are the right boundary because reference equality (`object.ReferenceEquals`) is O(1) and tells you instantly whether that tree changed."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when a generator registers a `CompilationProvider` as its pipeline root?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Its downstream node re-runs whenever the Compilation reference changes — which is every build where any file changed. The generator is still incremental at the pipeline level, but there's nothing to increment over. The recommendation is to use `SyntaxProvider` with targeted predicates to narrow input."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `SyntaxStore` disable the Compilation fast path when step tracking is enabled?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Step recording traces are not persisted between runs, so the infrastructure cannot safely short-circuit when tracking is active — it needs steps to actually run (or be explicitly cached by node logic) to produce accurate diagnostic data."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `[Theory]` with `[MemberData]` run the test multiple times while `[Fact]` runs it once?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`FactDiscoverer.Discover()` returns a single `XunitTestCase`. `TheoryDiscoverer.Discover()` calls `GetData()` at discovery time, iterates every row, and emits one `XunitTestCase` per row. The attribute is inert — the discoverer does the looping, not the attribute."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when `[MemberData]` returns data rows with non-serializable types?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The discoverer falls back to a single `XunitDelayEnumeratedTheoryTestCase` that defers data fetching to runtime. The runner sees one test case instead of many, but at runtime the test case itself enumerates and runs per-row. The output looks identical; the infrastructure is different."
      }
    },
    {
      "@type": "Question",
      "name": "What does `[Fact]` do when applied to a method with parameters?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`FactDiscoverer` actively rejects it — returning an `ExecutionErrorTestCase` with the message \"Did you mean to use [Theory]?\" This is a hard failure at discovery time, not a silent misconfiguration. Generic `[Fact]` methods get the same treatment."
      }
    },
    {
      "@type": "Question",
      "name": "When is `[MemberData]`'s static data method invoked?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Once at discovery time, before any tests run. `GetData()` returns all rows as a single `IEnumerable`, and the discoverer iterates it. Your static property or method is invoked once, not once per row or once per test run."
      }
    },
    {
      "@type": "Question",
      "name": "What is `SupportsDiscoveryEnumeration()` and when does it matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If a custom data attribute returns `false`, `TheoryDiscoverer` bails out to a single delay-enumerated test case instead of N pre-enumerated ones. Custom attributes that depend on runtime state (database queries, environment variables) use this to defer enumeration to execution time."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between `[InlineData]` and `[MemberData]`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`[InlineData]` only supports compile-time constant values baked into the attribute. `[MemberData]` can call arbitrary static methods, return complex objects, or pull from external sources — anything producing `IEnumerable<object[]>`."
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
