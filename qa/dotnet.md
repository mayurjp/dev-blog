---
layout: page
title: ".NET — Q&A Bank"
permalink: /qa/dotnet/
---

Bite-sized questions and answers from .NET blog posts. Read 5-10 per sitting. Each answer is 2-4 sentences max and links back to the full post for deeper understanding.

## Topic: Minimal APIs & the Middleware Pipeline (Order 1)

### Q: What does `ApplicationBuilder.Build()` actually do when composing middleware?
It folds the `_components` list from last-to-first into one nested `RequestDelegate`. The last `app.Use(...)` call becomes the innermost function (closest to the terminal 404 delegate), and the first becomes the outermost — the first thing that runs on the way in and the last on the way out. There is no list being iterated at request time.
→ Post: `_posts/2026-06-09-minimal-apis-middleware-pipeline-nested-delegates.md`

### Q: How does an `app.MapGet(...)` endpoint differ from middleware registered via `app.Use(...)`?
`MapGet` adds a `RouteEndpoint` to a separate `EndpointDataSource`, not to `_components`. It only runs if routing middleware (itself part of the `Use`-based pipeline) matches the request. Endpoint handlers are not part of the middleware chain and cannot intercept requests that never reach routing.
→ Post: `_posts/2026-06-09-minimal-apis-middleware-pipeline-nested-delegates.md`

### Q: What happens if a middleware never calls `next(context)`?
The entire rest of the pipeline — including all downstream middleware and the endpoint — is short-circuited silently. The client receives no error, no exception, and no response unless the middleware explicitly writes one. This is a common source of "endpoint never reached" bugs.
→ Post: `_posts/2026-06-09-minimal-apis-middleware-pipeline-nested-delegates.md`

### Q: Does calling `app.UseAuthentication()` twice create one or two auth layers?
Two. `Use()` has no deduplication — each call appends another entry to `_components`, and `Build()` wraps each as its own nested layer. The second authentication middleware runs against the same `HttpContext`, producing redundant work and potential side effects.
→ Post: `_posts/2026-06-09-minimal-apis-middleware-pipeline-nested-delegates.md`

### Q: When does `ApplicationBuilder.Build()` execute in a Minimal API app?
It runs when the host starts processing requests, via `WebApplication.BuildRequestDelegate()`, after all `app.Use(...)` and `app.Map...(...)` calls in `Program.cs` have executed. The pipeline shape is fixed the moment `Build()` runs — nothing about the per-request path re-orders middleware.
→ Post: `_posts/2026-06-09-minimal-apis-middleware-pipeline-nested-delegates.md`

### Q: Why does the default terminal delegate distinguish "matched endpoint with null delegate" from "no match"?
Those are different failure modes with different fixes. A matched-but-uninvoked endpoint means routing found it but the pipeline never called it (typically a missing `UseEndpoints` wiring), while no match at all is a normal 404. Collapsing them would hide a wiring bug behind an ordinary response.
→ Post: `_posts/2026-06-09-minimal-apis-middleware-pipeline-nested-delegates.md`

## Topic: Dependency Injection Container Internals (Order 2)

### Q: What is a captive dependency and why does it produce silent data corruption?
A captive dependency is a scoped service captured by a singleton through constructor injection. The singleton holds the scoped instance for its entire lifetime, so every request that should get a fresh instance silently reuses a stale one — producing cross-request data leakage that never throws by default.
→ Post: `_posts/2026-06-27-dotnet-di-container-captive-dependency-validation.md`

### Q: How does `CallSiteValidator` detect a captive dependency?
It walks each service's `ServiceCallSite` tree at resolution time, tracking whether a scoped node appears while inside a singleton subtree. When a scoped service is found inside a singleton's tree, it throws `InvalidOperationException` naming both services. The walk is memoized per `Cache.Key` so shared subtrees aren't re-walked.
→ Post: `_posts/2026-06-27-dotnet-di-container-captive-dependency-validation.md`

### Q: Why is `IServiceScopeFactory` explicitly exempted from the captive-dependency check?
Injecting a scope *factory* into a singleton is the sanctioned pattern for consuming scoped services on demand — the singleton creates short-lived scopes via `CreateScope()` instead of capturing a single scoped instance. The validator permits this escape hatch while still catching direct constructor capture.
→ Post: `_posts/2026-06-27-dotnet-di-container-captive-dependency-validation.md`

### Q: What is the difference between `ValidateScopes` and `ValidateOnBuild`?
`ValidateScopes` checks services only when they are actually resolved at runtime — a captive dependency in a rarely-used singleton could go undetected until that code path executes. `ValidateOnBuild` eagerly validates every registered service at `BuildServiceProvider()` time, closing that gap.
→ Post: `_posts/2026-06-27-dotnet-di-container-captive-dependency-validation.md`

### Q: Can a transient service be a captive dependency in a singleton?
No. A transient service is constructed fresh on every injection, so the singleton always gets a new instance at construction time. There's no cross-request state sharing. `CallSiteValidator` only flags scoped services because only scoped services carry the "should be fresh per scope" guarantee a singleton violates.
→ Post: `_posts/2026-06-27-dotnet-di-container-captive-dependency-validation.md`

### Q: What happens if a factory-registered singleton resolves a scoped dependency inside the factory delegate?
The `CallSiteValidator` tree-walk is built around constructor-injection call-site analysis. A factory delegate (`AddSingleton<T>(sp => ...)`) that manually resolves a scoped service from the passed `IServiceProvider` bypasses this analysis and can reintroduce the same captive-dependency bug without detection.
→ Post: `_posts/2026-06-27-dotnet-di-container-captive-dependency-validation.md`

## Topic: Configuration & the Options Pattern (Order 3)

### Q: Does `IOptionsMonitor<T>` poll `appsettings.json` on a timer?
No. It subscribes once to `IConfiguration`'s reload token via `ChangeToken.OnChange`. The token is push-based — a provider's file-system watcher fires it when a real change is detected. The monitor never polls anything itself.
→ Post: `_posts/2026-07-11-dotnet-options-pattern-ioptionsmonitor-live-reload.md`

### Q: How do the three Options interfaces differ in reload behavior?
`IOptions<T>` is bound once at startup, cached forever — no reload. `IOptionsSnapshot<T>` recomputes once per scope (e.g., per HTTP request). `IOptionsMonitor<T>` is long-lived and reload-aware, safe to inject into singletons, with `CurrentValue` reflecting the latest value and `OnChange` firing on updates.
→ Post: `_posts/2026-07-11-dotnet-options-pattern-ioptionsmonitor-live-reload.md`

### Q: What happens inside `OptionsMonitor` when the reload token fires?
`InvokeChanged` first evicts the stale cached value via `_cache.TryRemove(name)`, then calls `Get(name)` which re-binds through the factory. The new value isn't computed until something actually reads `CurrentValue` after the token fired, keeping the reaction cheap.
→ Post: `_posts/2026-07-11-dotnet-options-pattern-ioptionsmonitor-live-reload.md`

### Q: Why is `ChangeToken.OnChange` necessary instead of a raw subscription?
`IChangeToken`s in .NET are single-fire — they don't keep notifying after one firing. `ChangeToken.OnChange` automatically re-registers a fresh token after each firing, which is why `OptionsMonitor` relies on one `RegisterSource` call at construction instead of manual re-subscription after every change.
→ Post: `_posts/2026-07-11-dotnet-options-pattern-ioptionsmonitor-live-reload.md`

### Q: Does editing an environment variable trigger `IOptionsMonitor` to reload?
Typically no. The default environment-variable provider reads values once at process start and has no live change-detection mechanism. Only providers with file-system watchers (like the JSON provider) fire reload tokens. The monitor works identically regardless of provider, but only if the provider itself fires.
→ Post: `_posts/2026-07-11-dotnet-options-pattern-ioptionsmonitor-live-reload.md`

### Q: What is the practical cost of `OnChange` listeners not being disposed?
Long-running apps that register `OnChange` listeners repeatedly without disposing old ones accumulate a growing, never-cleaned subscriber list. Each firing invokes all registered callbacks, including stale ones. `OnChange` returns an `IDisposable` specifically so listeners can unsubscribe.
→ Post: `_posts/2026-07-11-dotnet-options-pattern-ioptionsmonitor-live-reload.md`

## Topic: async/await & the Task-based Asynchronous Pattern (Order 4)

### Q: Does `async/await` create a new thread?
No. The compiler rewrites the method into a state machine that runs synchronously on the caller's thread up to the first `await` on an incomplete task. At that point the thread is released back to the pool. When the awaited operation completes, a thread pool thread resumes via `MoveNext()` — no thread is dedicated to waiting.
→ Post: `_posts/2026-07-25-dotnet-async-await-compiler-generated-state-machine.md`

### Q: What happens to local variables across `await` points?
The compiler hoists every variable live across an `await` into fields on the state machine struct. If the state machine is boxed (because an `await` suspended), those fields live on the heap for the operation's duration — this is the core allocation cost of async methods beyond the `Task` itself.
→ Post: `_posts/2026-07-25-dotnet-async-await-compiler-generated-state-machine.md`

### Q: When does the compiler-generated state machine get boxed to the heap?
Only when an `await` actually suspends. `Start()` runs `MoveNext()` while the struct is still on the stack. If every `await` hits an already-complete task, no boxing occurs and the method runs entirely synchronously with zero heap allocations beyond the result object.
→ Post: `_posts/2026-07-25-dotnet-async-await-compiler-generated-state-machine.md`

### Q: Why does `AsyncTaskMethodBuilder.SetResult` have a fast path?
If nobody has accessed the returned `Task` yet, `SetResult` assigns a static cached pre-completed task (`Task.s_cachedCompleted`) instead of allocating a new one. This eliminates the `Task` allocation entirely when the async method completes synchronously and the caller hasn't awaited it.
→ Post: `_posts/2026-07-25-dotnet-async-await-compiler-generated-state-machine.md`

### Q: What is the difference between `AwaitOnCompleted` and `AwaitUnsafeOnCompleted`?
`AwaitOnCompleted` captures and flows the current `ExecutionContext`. `AwaitUnsafeOnCompleted` skips `ExecutionContext.Capture()` entirely, used for awaiters that implement `ICriticalNotifyCompletion` and handle context flow themselves — avoiding redundant capture overhead.
→ Post: `_posts/2026-07-25-dotnet-async-await-compiler-generated-state-machine.md`

### Q: How does the runtime ensure exactly one thread sees a `Task` transition from Running to RanToCompletion?
It uses `AtomicStateUpdate` with `Interlocked.CompareExchange` — a compare-and-swap loop on the volatile `m_stateFlags` int. This is not a `lock`; it's a lock-free CAS that guarantees exactly one thread observes each state transition.
→ Post: `_posts/2026-07-25-dotnet-async-await-compiler-generated-state-machine.md`

### Q: Why is `async void` dangerous?
`async void` doesn't return a `Task`, so exceptions can't be captured by a builder. An unhandled exception in `async void` crashes the process immediately. It should only be used for event handlers that require the `void` return type.
→ Post: `_posts/2026-07-25-dotnet-async-await-compiler-generated-state-machine.md`

## Topic: The .NET Garbage Collector (Order 5)

### Q: How does generational collection reduce GC pause times?
The heap is divided into gen0 (new objects), gen1 (survived one GC), and gen2 (long-lived). Gen0 collections scan only the small ephemeral segment (typically ~256 KB), reclaiming the vast majority of garbage in microseconds without touching long-lived objects in gen2.
→ Post: `_posts/2026-07-25-dotnet-garbage-collector-generational-collection.md`

### Q: What happens when gen0 collection doesn't free enough memory?
The GC escalates. A gen1 collection runs (which also collects gen0). If that's still insufficient, a gen2 collection runs — scanning the entire heap including LOH. The allocation state machine walks through `trigger_ephemeral_gc` → `trigger_2nd_ephemeral_gc` as it escalates.
→ Post: `_posts/2026-07-25-dotnet-garbage-collector-generational-collection.md`

### Q: How do gen0, gen1, and gen2 relate physically in memory?
All three share the same Small Object Heap (SOH) segment chain — they are logical divisions within contiguous heap segments, not separate memory regions. The GC places marker objects (min-size unused arrays) at boundaries within the same `heap_segment` to separate generations.
→ Post: `_posts/2026-07-25-dotnet-garbage-collector-generational-collection.md`

### Q: Why are large objects (≥ 85 KB) treated separately on the LOH?
Compacting large objects is expensive — copying large memory blocks and updating all references costs orders of magnitude more than moving small objects. The LOH avoids compaction by default and is only collected during gen2 collections, where the cost is amortized against the full-heap scan.
→ Post: `_posts/2026-07-25-dotnet-garbage-collector-generational-collection.md`

### Q: What role do card tables play during ephemeral GC?
Card tables enable cross-generational references without scanning the whole heap. When a gen2 object references a gen0 object, the JIT write barrier sets a "card" byte marking that region. During ephemeral collections, the GC only examines cards to find old-to-young references.
→ Post: `_posts/2026-07-25-dotnet-garbage-collector-generational-collection.md`

### Q: How does Server GC differ from Workstation GC?
Workstation GC uses a single heap with one GC thread, optimized for low-latency desktop apps. Server GC creates one heap per logical processor, each with its own GC thread and allocation contexts, enabling parallel collection and eliminating allocation contention — the default for ASP.NET.
→ Post: `_posts/2026-07-25-dotnet-garbage-collector-generational-collection.md`

### Q: Why does the GC use dynamic budget smoothing instead of fixed generation budgets?
Without smoothing, a single high-survival gen0 collection could wildly inflate the budget, causing the next collection to scan a much larger region. Exponential smoothing in the `dynamic_data_table` prevents oscillation and keeps collection costs predictable.
→ Post: `_posts/2026-07-25-dotnet-garbage-collector-generational-collection.md`

## Topic: Just-In-Time Compilation & Tiered Compilation (Order 6)

### Q: Why does .NET re-compile a method it already has machine code for?
The first JIT pass (Tier0) trades code quality for startup speed — no inlining, no loop optimizations. Once call counting confirms a method is hot (30+ calls after startup), the runtime re-JITs it on a background thread with full Tier1 optimizations. The slow code runs for milliseconds; the optimized code runs for the process lifetime.
→ Post: `_posts/2026-07-25-dotnet-tiered-jit-compilation.md`

### Q: What prevents background Tier1 compilation from competing with startup?
A startup delay (default 100ms) resets every time a Tier0 method is compiled. Only after 100ms with no Tier0 compilation does call counting begin. The background thread sleeps for this delay, ensuring it doesn't steal CPU from the foreground during startup.
→ Post: `_posts/2026-07-25-dotnet-tiered-jit-compilation.md`

### Q: How does Tier1 code activation work without stopping the world?
`ActivateCodeVersion` atomically swaps the method's precode (indirection trampoline) to point at new Tier1 native code. Any thread currently executing old Tier0 code finishes naturally; only future calls enter Tier1. This is a lock-free hot-swap, not a stop-the-world replacement.
→ Post: `_posts/2026-07-25-dotnet-tiered-jit-compilation.md`

### Q: What is On-Stack Replacement (OSR) in tiered compilation?
OSR lets the runtime replace code *inside a currently executing method*. If a Tier0 loop runs for a long time, OSR can swap in Tier1 code for the active frame without waiting for the method to return and be called again — preventing infinite loops from permanently running unoptimized code.
→ Post: `_posts/2026-07-25-dotnet-tiered-jit-compilation.md`

### Q: How can you force a method to skip Tier0 entirely?
Apply `[MethodImpl(MethodImplOptions.AggressiveOptimization)]`. This tells the runtime the method is eligible for Tier1 from the first call, skipping the call-counting phase entirely. Useful for methods known to be hot.
→ Post: `_posts/2026-07-25-dotnet-tiered-jit-compilation.md`

### Q: Does tiered compilation apply to ReadyToRun (precompiled) assemblies?
Yes. R2R code is treated as Tier0. If the runtime detects the method is hot, it re-JITs from IL with full optimizations, which can produce faster code because the JIT sees exact loaded dependencies and CPU features at runtime.
→ Post: `_posts/2026-07-25-dotnet-tiered-jit-compilation.md`

## Topic: EF Core Change Tracking & SaveChanges (Order 7)

### Q: How does EF Core decide whether to emit INSERT, UPDATE, or DELETE?
It snapshots every property value when an entity is first tracked. Before `SaveChanges`, `DetectChanges` diffs the live object against the snapshot. The entity's state machine (`Added` → INSERT, `Modified` → UPDATE, `Deleted` → DELETE) is the sole determinant of which SQL command gets generated.
→ Post: `_posts/2026-07-25-ef-core-change-tracker-savechanges-snapshot.md`

### Q: When is the change-tracking snapshot captured?
At query materialization time — the moment the SQL reader populates each property via `StartTrackingFromQuery`. The snapshot reflects the database's exact state at query execution, not whatever state the entity might have been in if previously tracked and detached.
→ Post: `_posts/2026-07-25-ef-core-change-tracker-savechanges-snapshot.md`

### Q: Why does `dbContext.Update(entity)` always generate an UPDATE even if nothing changed?
`Update` sets the entity state to `Modified`, which *guarantees* an UPDATE regardless of whether any property actually changed. The UPDATE will SET every column to its current value. Use `Attach` + selective property marking for only-changed-columns UPDATE.
→ Post: `_posts/2026-07-25-ef-core-change-tracker-savechanges-snapshot.md`

### Q: What is the most common source of "entity not updating" bugs in Web APIs?
Passing a deserialized entity to `Update()` on a fresh context without first loading the existing entity to populate the snapshot. The fresh context has no baseline to diff against, so it treats the entity as newly added or generates a blanket UPDATE with incorrect WHERE clauses.
→ Post: `_posts/2026-07-25-ef-core-change-tracker-savechanges-snapshot.md`

### Q: When does `AcceptAllChanges` run relative to the database commit?
Only *after* the provider reports success. If the provider throws, entities remain in their pre-save state and the change tracker is consistent with what actually hit the database. State transitions happen on success, not before.
→ Post: `_posts/2026-07-25-ef-core-change-tracker-savechanges-snapshot.md`

### Q: How does EF Core handle concurrency token mismatches on UPDATE?
For `Modified` entities, the UPDATE's WHERE clause includes the original value of any `IsConcurrencyToken` property from the snapshot. A row-version mismatch produces `DbUpdateConcurrencyException` — the row was modified by another process between load and save.
→ Post: `_posts/2026-07-25-ef-core-change-tracker-savechanges-snapshot.md`

## Topic: Background Services & Hosted Lifetimes (Order 8)

### Q: Does `BackgroundService.StartAsync` block until `ExecuteAsync` finishes?
No. `StartAsync` wraps `ExecuteAsync` in a `Task.Run`, stores the task, and returns `Task.CompletedTask`. The host considers the service "started" before your background loop has done a single iteration, moves on to start the next service, and fires `ApplicationStarted`.
→ Post: `_posts/2026-07-25-aspnet-core-backgroundservice-hosted-lifetime.md`

### Q: What happens when a `BackgroundService.ExecuteAsync` throws an unhandled exception?
The task transitions to `Faulted` state silently. The host only discovers the fault when `TryExecuteBackgroundServiceAsync` awaits the stored task. With the default `BackgroundServiceExceptionBehavior.StopHost`, this calls `StopApplication()` and shuts down the entire process.
→ Post: `_posts/2026-07-25-aspnet-core-backgroundservice-hosted-lifetime.md`

### Q: How does the host shut down a `BackgroundService` that ignores cancellation?
`StopAsync` cancels the CTS and awaits the task with `ShutdownTimeout` (default 30 seconds), using `Task.WhenAny` against the stop token. If the task doesn't complete within that window, `StopAsync` returns and the host proceeds with disposal.
→ Post: `_posts/2026-07-25-aspnet-core-backgroundservice-hosted-lifetime.md`

### Q: What is the two-phase startup contract for `BackgroundService`?
Phase one: the host calls `StartAsync`, considers the service "started," and proceeds. Phase two: the host monitors the stored `ExecuteTask` as a fire-and-forget watchdog. These phases are deliberately decoupled — the host has no idea whether your background work has made progress, faulted, or is still initializing.
→ Post: `_posts/2026-07-25-aspnet-core-backgroundservice-hosted-lifetime.md`

### Q: Why does shutdown wait on monitor tasks even after `StopAsync` completes?
The `StopAsync` continuation and the monitor task (`TryExecuteBackgroundServiceAsync`) race. The host uses `Task.WhenAll` on `_backgroundServiceTasks` to ensure exceptions from the monitor task are always observed, even if `StopAsync`'s continuation ran first — preventing silent non-zero exit codes.
→ Post: `_posts/2026-07-25-aspnet-core-backgroundservice-hosted-lifetime.md`

### Q: What happens if you register a singleton without `AddHostedService`?
The host never calls `StartAsync` or `StopAsync` on it. The instance lives as a plain singleton with no lifecycle management — it won't be started, stopped, or disposed as part of the host lifecycle. `AddHostedService<T>()` internally does both `AddSingleton<T>()` and the hosted-service registration.
→ Post: `_posts/2026-07-25-aspnet-core-backgroundservice-hosted-lifetime.md`

## Topic: gRPC on .NET (Order 9)

### Q: Why does a single `GrpcChannel` open only one HTTP/2 connection by default?
The HTTP/2 spec recommends a single connection per origin. `SocketsHttpHandler` follows this — but service-to-service communication with hundreds of concurrent streams violates the assumption behind that recommendation, causing silent queueing when streams exceed `SETTINGS_MAX_CONCURRENT_STREAMS`.
→ Post: `_posts/2026-07-25-grpc-dotnet-http2-connection-pool.md`

### Q: What happens when concurrent streams exceed the single connection's limit?
`SocketsHttpHandler` queues new streams behind existing ones. There is no error, no exception, and no log entry. Requests simply wait — the only symptom is rising latency and eventual deadline expiration.
→ Post: `_posts/2026-07-25-grpc-dotnet-http2-connection-pool.md`

### Q: How does `EnableMultipleHttp2Connections` fix the queueing problem?
It tells the connection pool to open a second HTTP/2 connection when the first hits its concurrent-stream ceiling. The pool then load-balances new streams across available connections. There's no hard cap — as many connections are created as needed.
→ Post: `_posts/2026-07-25-grpc-dotnet-http2-connection-pool.md`

### Q: Why does `GrpcChannel` use `HttpMessageInvoker` instead of `HttpClient`?
`HttpMessageInvoker` skips `HttpClient`'s client-side features — automatic redirects, cookie handling — that gRPC doesn't use, gaining measurable performance in tight call loops. The channel only needs the raw HTTP/2 transport.
→ Post: `_posts/2026-07-25-grpc-dotnet-http2-connection-pool.md`

### Q: What is the consequence of not setting `PooledConnectionLifetime`?
The default is infinite — connections never close, so DNS changes are never picked up. If a server's IP changes (e.g., during Kubernetes pod rotation), the channel keeps sending traffic to the old IP until the process restarts.
→ Post: `_posts/2026-07-25-grpc-dotnet-http2-connection-pool.md`

### Q: Why does `GrpcChannel` use reflection-based handler detection?
`HasHttpHandlerType` checks the handler's full type name string because `DelegatingHandler` chains can wrap the real handler several layers deep. Runtime type checks would fail because the outermost handler is always a `DelegatingHandler`, not the `SocketsHttpHandler` buried inside.
→ Post: `_posts/2026-07-25-grpc-dotnet-http2-connection-pool.md`

## Topic: SignalR (Order 10)

### Q: Why does the Aspire Dashboard use SignalR instead of HTTP long-polling?
Telemetry is server-initiated and push-based, but HTTP request-response is pull-based. SignalR gives every browser a persistent, bidirectional WebSocket connection where the server can write at any time — eliminating the latency and connection overhead of re-requesting after each update.
→ Post: `_posts/2026-07-25-signalr-aspire-dashboard-websocket-telemetry.md`

### Q: What are the two independent failure modes in the Aspire Dashboard's SignalR circuit?
The Blazor circuit (WebSocket to the browser) — when it drops, the entire UI freezes and Blazor auto-reconnects. And the resource service (gRPC from dashboard to Aspire resource service) — when it drops, the UI stays interactive but no new telemetry arrives. They require different remediation.
→ Post: `_posts/2026-07-25-signalr-aspire-dashboard-websocket-telemetry.md`

### Q: Why is prerendering disabled in the Aspire Dashboard?
With prerendering enabled, Blazor renders HTML without a circuit, then hydrates client-side — during which telemetry subscriptions fire but have nowhere to push updates. By disabling prerendering, the browser shows a loading state until the circuit is live, and every subscription is active from the first render.
→ Post: `_posts/2026-07-25-signalr-aspire-dashboard-websocket-telemetry.md`

### Q: Why does the dashboard use `Virtualize` with `OverscanCount="100"` for data grids?
A busy service emits hundreds of spans per second — rendering all into the DOM would freeze the browser. `Virtualize` only renders visible rows plus the overscan buffer, keeping DOM node count constant regardless of total trace count. The overscan prevents visible blank rows during fast scrolling.
→ Post: `_posts/2026-07-25-signalr-aspire-dashboard-websocket-telemetry.md`

### Q: Can two browser tabs share the same Blazor circuit?
No. Each tab opens its own SignalR connection and its own Blazor circuit. The backend maintains separate subscription state per circuit, meaning opening three tabs triples the gRPC subscription load — a scaling concern in shared environments.
→ Post: `_posts/2026-07-25-signalr-aspire-dashboard-websocket-telemetry.md`

### Q: What happens to in-memory component state when the Blazor circuit is rejected on reconnect?
`app-reconnect.js` calls `location.reload()`, reinitializing everything from scratch. Components re-subscribe to telemetry streams on `OnInitializedAsync`, so the user sees a brief empty state before data repopulates — the circuit was garbage-collected during a long disconnect.
→ Post: `_posts/2026-07-25-signalr-aspire-dashboard-websocket-telemetry.md`

## Topic: Span<T>, Memory<T> & Low-Allocation APIs (Order 11)

### Q: Why is `Span<T>` restricted to the stack?
It's a `readonly ref struct` containing a `ref T` pointer and an `int` length — no object header, no vtable, no GC tracking. The CLR enforces that it can never be boxed, stored in a class field, or escaped beyond the current stack frame, which is what makes slicing zero-allocation.
→ Post: `_posts/2026-07-25-dotnet-span-memory-low-allocation.md`

### Q: What is the practical difference between `Span<T>` and `Memory<T>`?
`Span<T>` is stack-only and cannot cross `await` boundaries. `Memory<T>` is heap-safe — it can be stored in class fields, passed to async methods, and used across `await` boundaries. Use `Span<T>` for synchronous hot-path slicing; use `Memory<T>` when you need to hand a buffer to code that might store or suspend on it.
→ Post: `_posts/2026-07-25-dotnet-span-memory-low-allocation.md`

### Q: Why does `ArrayPool<T>.Shared.Return` use `AsSpan(0, lengthToClear).Clear()` internally?
It zeros only the portion of the array that was actually written, not the entire buffer. This is a `Span<T>` consumer inside the pool itself, keeping the clearing path allocation-free while avoiding unnecessary work on unwritten regions.
→ Post: `_posts/2026-07-25-dotnet-span-memory-low-allocation.md`

### Q: What happens if you return a rented buffer to `ArrayPool` while a `Span<T>` derived from it is still alive?
The span becomes a dangling reference. The pool may hand the same array to another caller, and any access through the old span reads or writes the new caller's data — silent data corruption, not a crash.
→ Post: `_posts/2026-07-25-dotnet-span-memory-low-allocation.md`

### Q: Why does `Span<T>.Slice` use `(uint)` casts in its bounds checks?
Casting `int` to `uint` turns a signed range check into an unsigned one. On 64-bit JITs, two 32-bit unsigned values compare in a single 64-bit comparison, eliminating a branch — a micro-optimization that matters when `Slice` is called millions of times per second.
→ Post: `_posts/2026-07-25-dotnet-span-memory-low-allocation.md`

### Q: Can `Span<T>` wrap reference types like `Span<string>`?
No. At construction, the runtime checks `typeof(T).IsValueType` and throws `ArrayTypeMismatchException` for reference types. This prevents the span from creating a view over a covariant array that could allow type-safety violations.
→ Post: `_posts/2026-07-25-dotnet-span-memory-low-allocation.md`

## Topic: System.Threading.Channels (Order 12)

### Q: How does a bounded channel apply backpressure without blocking a thread?
When the deque is full, `WriteAsync` enqueues a `BlockedWriteAsyncOperation<T>` on a linked list and returns an incomplete `ValueTask` — the producer's thread is freed. When the consumer dequeues an item, it walks the blocked-writer list and completes exactly one writer via `TrySetResult`, moving the item directly into the deque.
→ Post: `_posts/2026-07-25-dotnet-channels-bounded-backpressure.md`

### Q: Why can't an unbounded channel ever apply backpressure?
`UnboundedChannel<T>` uses `ConcurrentQueue<T>` with no capacity check. `TryWrite` always enqueues and returns `true`. `WaitToWriteAsync` always returns `true`. There is no mechanism to suspend a producer — the queue grows until GC pressure or OOM.
→ Post: `_posts/2026-07-25-dotnet-channels-bounded-backpressure.md`

### Q: What is the difference between `BoundedChannelFullMode.Wait` and `DropOldest`?
`Wait` suspends the producer until space opens — true backpressure where every item matters. `DropOldest` evicts the oldest buffered item to make room for the new one — for status/telemetry where only the latest state matters and intermediate values are meaningless.
→ Post: `_posts/2026-07-25-dotnet-channels-bounded-backpressure.md`

### Q: Why does `BoundedChannel` use `Deque<T>` instead of `Queue<T>`?
`DropOldest` needs head dequeue and `DropNewest` needs tail dequeue — `Queue<T>` only supports head dequeue. `Deque<T>` provides O(1) `EnqueueTail`, `DequeueHead`, and `DequeueTail`, covering all four full-buffer modes.
→ Post: `_posts/2026-07-25-dotnet-channels-bounded-backpressure.md`

### Q: What does capacity 0 create in `Channel.CreateBounded`?
A `RendezvousChannel<T>` — synchronous handoff with zero buffer. The producer suspends until the consumer is ready to receive the item directly. Useful for request-response patterns where intermediate buffering would add latency without benefit.
→ Post: `_posts/2026-07-25-dotnet-channels-bounded-backpressure.md`

### Q: What is the difference between `TryWrite` and `WriteAsync` on a bounded channel?
`TryWrite` is synchronous — returns `false` immediately when full, never suspends. `WriteAsync` suspends the producer's async task when the buffer is full (in `Wait` mode), freeing the thread. Use `WriteAsync` for backpressure; `TryWrite` for fire-and-forget where loss is acceptable.
→ Post: `_posts/2026-07-25-dotnet-channels-bounded-backpressure.md`

## Topic: Native AOT & Trimming (Order 13)

### Q: Why does `System.Text.Json` break under Native AOT without source generation?
`DefaultJsonTypeInfoResolver` uses `Type.GetProperties()`, `Type.GetConstructor()`, and `Activator.CreateInstance()` at runtime — all invisible to the trimmer. The trimmer strips that metadata at publish time, producing a binary that looks correct but throws `MissingMethodException` or `JsonException` at runtime.
→ Post: `_posts/2026-07-25-dotnet-native-aot-trimming-reflection.md`

### Q: What does the `[JsonSerializable]` attribute actually do?
It tells the source generator to emit a `GetTypeInfo(Type)` override with a compile-time switch mapping types to pre-built `JsonTypeInfo<T>` instances — all property delegates, constructor calls, and converter wiring baked in as static IL. No reflection, no `Activator`, trim-safe.
→ Post: `_posts/2026-07-25-dotnet-native-aot-trimming-reflection.md`

### Q: Why doesn't `[Serializable]` fix JSON serialization under trimming?
`[Serializable]` controls binary formatter behavior and has zero effect on `System.Text.Json`. There is no BCL attribute that says "keep all reflection metadata for this type for JSON purposes" — you need source generation via `[JsonSerializable]` entirely.
→ Post: `_posts/2026-07-25-dotnet-native-aot-trimming-reflection.md`

### Q: Why is this the worst class of trimming bug?
The trimmer does not crash at publish time. It produces a binary that looks correct but throws at runtime when a type's metadata has been removed. No compile-time warning, no publish-time error — just a production incident. With `EnableTrimAnalyzer` you get IL2026 warnings, but without it the binary ships broken.
→ Post: `_posts/2026-07-25-dotnet-native-aot-trimming-reflection.md`

### Q: What happens if a serialized type is not listed in `[JsonSerializable]`?
`GetTypeInfo` returns `null` for that type, and serialization throws. Every type in the serialization graph — dictionary keys, collection elements, polymorphic subtypes, custom converters — must be explicitly listed.
→ Post: `_posts/2026-07-25-dotnet-native-aot-trimming-reflection.md`

### Q: Why are `[RequiresUnreferencedCode]` and `[RequiresDynamicCode]` on `DefaultJsonTypeInfoResolver`?
These attributes signal to the trimmer that the call site is unsafe. The trimmer uses them to emit warnings (IL2026, IL3050) at compile time, telling developers to switch to source generation for trimmed or AOT-compiled apps.
→ Post: `_posts/2026-07-25-dotnet-native-aot-trimming-reflection.md`

## Topic: Source Generators (Order 14)

### Q: Why does the incremental generator pipeline cache syntax trees instead of the Compilation?
A Compilation is a monolithic snapshot — any single file change invalidates everything. Syntax trees are individually immutable, individually diffable by reference equality (O(1)), and individually cheap to compare. Caching at that granularity skips re-running transform nodes when only one file changed out of thousands.
→ Post: `_posts/2026-07-25-roslyn-source-generators-incremental-caching.md`

### Q: What role does `CompilationCache` play in the incremental pipeline?
It preserves the `Compilation` reference when post-init trees and pre-compilation contributions are structurally identical. By returning the same reference, every generator's `CompilationProvider`-derived downstream nodes see a cached reference and short-circuit without re-execution.
→ Post: `_posts/2026-07-25-roslyn-source-generators-incremental-caching.md`

### Q: How does `SyntaxStore` know when to skip re-evaluating a syntax tree?
It checks `_compilation == _previous._compilation` (reference equality) as its first fast path. When the Compilation reference is the same, all syntax input tables carry forward without touching any tree. When different, only trees with new or changed references re-trigger their transform nodes.
→ Post: `_posts/2026-07-25-roslyn-source-generators-incremental-caching.md`

### Q: Why can't you just cache the Compilation and compare it structurally?
Structural comparison of two Compilations would require comparing every tree, every option, every reference — roughly as expensive as re-running the generator. Syntax trees are the right boundary because reference equality (`object.ReferenceEquals`) is O(1) and tells you instantly whether that tree changed.
→ Post: `_posts/2026-07-25-roslyn-source-generators-incremental-caching.md`

### Q: What happens when a generator registers a `CompilationProvider` as its pipeline root?
Its downstream node re-runs whenever the Compilation reference changes — which is every build where any file changed. The generator is still incremental at the pipeline level, but there's nothing to increment over. The recommendation is to use `SyntaxProvider` with targeted predicates to narrow input.
→ Post: `_posts/2026-07-25-roslyn-source-generators-incremental-caching.md`

### Q: Why does `SyntaxStore` disable the Compilation fast path when step tracking is enabled?
Step recording traces are not persisted between runs, so the infrastructure cannot safely short-circuit when tracking is active — it needs steps to actually run (or be explicitly cached by node logic) to produce accurate diagnostic data.
→ Post: `_posts/2026-07-25-roslyn-source-generators-incremental-caching.md`

## Topic: Testing .NET Apps with xUnit (Order 15)

### Q: Why does `[Theory]` with `[MemberData]` run the test multiple times while `[Fact]` runs it once?
`FactDiscoverer.Discover()` returns a single `XunitTestCase`. `TheoryDiscoverer.Discover()` calls `GetData()` at discovery time, iterates every row, and emits one `XunitTestCase` per row. The attribute is inert — the discoverer does the looping, not the attribute.
→ Post: `_posts/2026-07-25-xunit-theory-memberdata-fact-multiple-runs.md`

### Q: What happens when `[MemberData]` returns data rows with non-serializable types?
The discoverer falls back to a single `XunitDelayEnumeratedTheoryTestCase` that defers data fetching to runtime. The runner sees one test case instead of many, but at runtime the test case itself enumerates and runs per-row. The output looks identical; the infrastructure is different.
→ Post: `_posts/2026-07-25-xunit-theory-memberdata-fact-multiple-runs.md`

### Q: What does `[Fact]` do when applied to a method with parameters?
`FactDiscoverer` actively rejects it — returning an `ExecutionErrorTestCase` with the message "Did you mean to use [Theory]?" This is a hard failure at discovery time, not a silent misconfiguration. Generic `[Fact]` methods get the same treatment.
→ Post: `_posts/2026-07-25-xunit-theory-memberdata-fact-multiple-runs.md`

### Q: When is `[MemberData]`'s static data method invoked?
Once at discovery time, before any tests run. `GetData()` returns all rows as a single `IEnumerable`, and the discoverer iterates it. Your static property or method is invoked once, not once per row or once per test run.
→ Post: `_posts/2026-07-25-xunit-theory-memberdata-fact-multiple-runs.md`

### Q: What is `SupportsDiscoveryEnumeration()` and when does it matter?
If a custom data attribute returns `false`, `TheoryDiscoverer` bails out to a single delay-enumerated test case instead of N pre-enumerated ones. Custom attributes that depend on runtime state (database queries, environment variables) use this to defer enumeration to execution time.
→ Post: `_posts/2026-07-25-xunit-theory-memberdata-fact-multiple-runs.md`

### Q: What is the difference between `[InlineData]` and `[MemberData]`?
`[InlineData]` only supports compile-time constant values baked into the attribute. `[MemberData]` can call arbitrary static methods, return complex objects, or pull from external sources — anything producing `IEnumerable<object[]>`.
→ Post: `_posts/2026-07-25-xunit-theory-memberdata-fact-multiple-runs.md`
---

**Last updated:** July 2026 | **Total Q&A:** 92 across .NET

[Back to Q&A Index]({{ '/qa/' | relative_url }}) • [All .NET posts]({{ '/dotnet/' | relative_url }})
