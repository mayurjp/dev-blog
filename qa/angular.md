---
layout: page
title: "Angular Interview Questions: 92 Real-World Q&A from Production Manifests"
description: "92 interview-ready Angular questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/angular/
---

Bite-sized, standalone interview questions and answers for Angular. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

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

## Topic: Angular bootstrap & the Ivy compiler (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does bootstrapApplication() actually build before mounting the root component? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It builds a root `EnvironmentInjector` directly from the `providers` array via `EnvironmentNgModuleRefAdapter` — no `NgModule` is ever instantiated. The injector is handed to `bootstrap()`, which runs inside `NgZone.run()`, waits for `ApplicationInitStatus` to resolve app initializers, then calls `ApplicationRef.bootstrap(RootComponent)`. The whole injector tree exists before a single Ivy instruction runs.

<p class="qa-link">[Full post →]({{ '/angular/angular-bootstrap-sequence-ivy-render-functions/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Ivy compile a component's template differently from a virtual-DOM framework? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Ivy compiles each template into a plain JavaScript function containing `ɵɵelementStart`/`ɵɵproperty`/`ɵɵadvance` instruction calls that read and write real DOM nodes directly via an `LView` array. There is no virtual DOM built or diffed — the same compiled function runs on every change-detection pass, with `rf & 1` (creation) instructions running once and `rf & 2` (update) instructions running every tick.

<p class="qa-link">[Full post →]({{ '/angular/angular-bootstrap-sequence-ivy-render-functions/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if bootstrapApplication() rejects — where does the error surface? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`internalCreateApplication` wraps the bootstrap in a `try/catch` that converts synchronous errors into a rejected Promise. If no `.catch()` is attached to the `bootstrapApplication()` call, the rejection is silent — there is no console output or global error handler that catches it. The `.catch()` on the returned Promise is the only surface for bootstrap failures.

<p class="qa-link">[Full post →]({{ '/angular/angular-bootstrap-sequence-ivy-render-functions/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the role of `decls` and `vars` on a ComponentDef? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`decls` counts nodes, local refs, and pipes to size the creation section of the `LView` array. `vars` counts bindings to size the update-pass section. Both are plain integers passed to `ɵɵdefineComponent` at build time — they pre-allocate the `LView` slots before the template function ever runs, not describe the component for tooling.

<p class="qa-link">[Full post →]({{ '/angular/angular-bootstrap-sequence-ivy-render-functions/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does the same template function execute twice per change-detection pass? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The compiled `Template(rf, ctx)` function has two branches gated on the `rf` bitmask — `rf & 1` runs creation instructions exactly once per `LView`, `rf & 2` runs update instructions every subsequent tick. Both branches live in the same function body; the first call populates `LView` slots, every later call re-evaluates bindings through `ɵɵadvance()` + `ɵɵproperty()`.

<p class="qa-link">[Full post →]({{ '/angular/angular-bootstrap-sequence-ivy-render-functions/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when assuming how Angular's first render differs from later updates? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Developers assume the first render uses a special "mount" code path. In reality, `ApplicationRef._loadComponent()` calls `this.tick()`, which runs the exact same `tick() → synchronize() → synchronizeOnce()` loop as every subsequent update — creation instructions gate on `rf & 1`, update instructions on `rf & 2`, within the same template function. There is no separate mount path.

<p class="qa-link">[Full post →]({{ '/angular/angular-bootstrap-sequence-ivy-render-functions/' | relative_url }})</p>
  </div>
</div>

## Topic: Components & templates (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does `standalone: true` actually change in a component compared to the old default? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Nothing — standalone is the compiler's default. An `@Component` with no `standalone` field is already standalone. The old default required `standalone: false` plus NgModule declaration/export/import. The `standalone: true` flag is redundant in current Angular; removing it entirely from a codebase is the correct normalization.

<p class="qa-link">[Full post →]({{ '/angular/angular-components-standalone-default-host-bindings/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the `host` object's key syntax dispatch to different binding types? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The compiler reads the key's punctuation, not a separate `type` field: a bare key `'class'` is a static DOM attribute, `[key]` is a property binding re-evaluated on every change-detection pass, `(key)` is an event binding, and `[attr.key]` or `[class.foo]` scopes a property binding to one specific attribute or class. This is resolved entirely at compile time from the string syntax.

<p class="qa-link">[Full post →]({{ '/angular/angular-components-standalone-default-host-bindings/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you explicitly use `standalone: false` in current Angular? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When a component must live inside an `NgModule` for a legacy integration — for example, a third-party library that still expects module declarations, or a shared module boundary enforced by an older build system. In all other cases, `standalone: false` is leftover code from pre-standalone Angular.

<p class="qa-link">[Full post →]({{ '/angular/angular-components-standalone-default-host-bindings/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the mistake of writing `[class]` as a bare key in a host object instead of `[class.foo]`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A bare `'class'` is a static attribute set once at element creation, never re-evaluated. A property binding `[class]` or `[class.foo]` is re-evaluated on every change-detection tick. Using the wrong syntax means a class toggle either never updates (bare key) or updates on every pass even when unnecessary (full `[class]` instead of scoped `[class.foo]`).

<p class="qa-link">[Full post →]({{ '/angular/angular-components-standalone-default-host-bindings/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `[attr.disabled]` differ from `[disabled]` on a native `<button>` host binding? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`[disabled]` sets the DOM property, which usually works for native buttons but doesn't give precise control over attribute presence. `[attr.disabled]` with a method that returns `null` or a string explicitly adds or removes the `disabled=""` attribute, which native form-control semantics and accessibility tools depend on more reliably than the property alone.

<p class="qa-link">[Full post →]({{ '/angular/angular-components-standalone-default-host-bindings/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Can a standalone component's `imports` array include `NgModule`s, or only other standalone components? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Both. A standalone component can import other standalone components/directives/pipes and existing `NgModule`s — this is the intended migration path, allowing incremental adoption where new standalone components coexist with not-yet-migrated `NgModule`-declared libraries.

<p class="qa-link">[Full post →]({{ '/angular/angular-components-standalone-default-host-bindings/' | relative_url }})</p>
  </div>
</div>

## Topic: Change detection: Zone.js vs zoneless (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Zone.js-based change detection check the entire component tree? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Zone.js monkey-patches global async APIs and fires `onMicrotaskEmpty` when its patched microtask queue drains. That signal carries no information about *which* component's state changed — only that some async callback somewhere finished. Angular's only correct response to "something happened, no idea what" is `ViewTreeGlobal`, which triggers `applicationRef._tick()` on the full tree.

<p class="qa-link">[Full post →]({{ '/angular/angular-change-detection-zonejs-vs-zoneless/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does the `NotificationSource` enum do in zoneless change detection? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It tells the zoneless scheduler *why* `notify()` was called — `MarkForCheck`, `Listener`, `RootEffect`, `DeferBlockStateUpdate`, etc. Each source maps to a specific dirty flag (`ViewTreeCheck`, `ViewTreeTraversal`, `RootEffects`) rather than a single undifferentiated `ViewTreeGlobal`. This lets the scheduler skip categories of work that don't apply, which Zone.js cannot do.

<p class="qa-link">[Full post →]({{ '/angular/angular-change-detection-zonejs-vs-zoneless/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the practical difference between `ViewTreeGlobal` and `ViewTreeCheck`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ViewTreeGlobal` is Zone.js's "no information" flag — it checks everything unconditionally. `ViewTreeCheck` is zoneless's "something in a view changed" flag — still broad, but it allows other flags like `RootEffects` to be handled independently without a full tree traversal. The precision is at the category level, not per-component.

<p class="qa-link">[Full post →]({{ '/angular/angular-change-detection-zonejs-vs-zoneless/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does zoneless special-case `Listener` notifications when zoneless is disabled? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Under Zone.js, event listeners already run inside the Angular zone and automatically trigger `onMicrotaskEmpty`-driven checks. A `Listener`-sourced `notify()` in that mode would be redundant, causing double-triggered checks. The special case exists for incremental migration between the two models.

<p class="qa-link">[Full post →]({{ '/angular/angular-change-detection-zonejs-vs-zoneless/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When migrating a component from Zone.js to zoneless, what's the risk if state changes happen outside signals or `markForCheck()`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Zoneless has no monkey-patched global fallback to catch unnotified changes. If a third-party library mutates state directly — outside signals, outside `markForCheck()` — the zoneless scheduler will never be notified, and the component will show stale data. Zone.js incidentally catches these mutations because it patches all async APIs.

<p class="qa-link">[Full post →]({{ '/angular/angular-change-detection-zonejs-vs-zoneless/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is `useMicrotaskScheduler` vs `scheduleCallbackWithRafRace` and why does it matter? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The zoneless scheduler chooses between scheduling a tick via microtask (runs sooner, before the next paint) or racing against `requestAnimationFrame` (aligns with the browser's render timing). Microtask scheduling gives a more synchronous-feeling update; rAF-racing can reduce redundant work when multiple notifications arrive before the actual paint. The choice depends on internal scheduler state, not a fixed constant.

<p class="qa-link">[Full post →]({{ '/angular/angular-change-detection-zonejs-vs-zoneless/' | relative_url }})</p>
  </div>
</div>

## Topic: Signals as the reactive primitive (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does a `computed()` discover its dependencies without an explicit list? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Every signal read goes through `producerAccessed`, which checks whether there's an active consumer (`activeConsumer` global variable — a `computed()` recomputing or an `effect()` running). If there is, the read itself records a link between that signal and the consumer. No array, no manual registration — the function body's own execution is the dependency declaration.

<p class="qa-link">[Full post →]({{ '/angular/angular-signals-automatic-dependency-tracking/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when you write to a signal — does it eagerly recompute downstream computed values? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. `signalSetFn` updates the value and calls `producerNotifyConsumers`, which walks the linked list of dependents and marks each one `dirty = true`. Nothing gets recomputed at this point. A dirty `computed()` only re-runs its function the next time something reads it — this is a lazy-pull model, not eager-push.

<p class="qa-link">[Full post →]({{ '/angular/angular-signals-automatic-dependency-tracking/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Can a `computed()`'s dependency set change between recomputations, and is that a bug? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's by design. If a computed's function body conditionally reads different signals on different runs, the dependency set is re-derived fresh each time via `producerAccessed` calls during execution. A signal that wasn't read on the current run won't have a link, so it won't trigger recomputation — which is correct behavior, not a missed dependency.

<p class="qa-link">[Full post →]({{ '/angular/angular-signals-automatic-dependency-tracking/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why doesn't writing `count.set(5)` when the signal already holds `5` trigger any notifications? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`signalSetFn` checks `node.equal(node.value, newValue)` before proceeding. The default equality function (`Object.is`-style) returns `true` for identical values, so the entire notification cascade is skipped. Writing the same value is a genuine no-op, not a wasted-but-harmless notification.

<p class="qa-link">[Full post →]({{ '/angular/angular-signals-automatic-dependency-tracking/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the tradeoff of automatic dependency tracking vs explicit dependency arrays? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Automatic tracking eliminates the "forgot to declare a dependency" bug class entirely — but any signal read during a computed's execution, even one that was "incidental" (e.g., inside a debug `console.log`), becomes a real dependency. There is no way to exclude a read from tracking without an explicit escape hatch (`untracked()`).

<p class="qa-link">[Full post →]({{ '/angular/angular-signals-automatic-dependency-tracking/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `consumerMarkDirty` handle a chain of `computed → computed → computed`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`consumerMarkDirty` sets `node.dirty = true` and then recursively calls `producerNotifyConsumers(node)` — propagating dirtiness to the next downstream consumer. This means a single source signal write cascades dirty flags through the entire chain without any intermediate computed needing to eagerly recompute, which is what makes the lazy-pull model work across deep chains.

<p class="qa-link">[Full post →]({{ '/angular/angular-signals-automatic-dependency-tracking/' | relative_url }})</p>
  </div>
</div>

## Topic: Dependency injection: the hierarchical injector tree (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What are the three layers of Angular's injector hierarchy and what order does token lookup follow? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Element injector (node injector, backed by a bloom filter) → Environment injector → Platform injector. Lookup starts at the current element's node injector, checks embedded view injectors first if present, then walks parent node injectors upward via bloom-filter pre-checks, and only falls through to the Environment/Platform injector if nothing matches in the element chain.

<p class="qa-link">[Full post →]({{ '/angular/angular-di-hierarchical-injector-tree/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does the 256-bit bloom filter on each node injector actually do? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each node injector stores 8 × 32-bit integers = 256 bits. When a directive is registered, its unique ID is hashed into one bit. During lookup, `bloomHasToken` tests whether that bit is set *before* doing a linear scan of providers — an O(1) pre-filter that avoids the expensive `searchTokensOnInjector` walk when the token provably isn't on that injector.

<p class="qa-link">[Full post →]({{ '/angular/angular-di-hierarchical-injector-tree/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the gotcha when a component provides a token that the root also provides? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The component's element injector silently shadows the root provider for all descendants. `ChildComponent` calling `inject(SomeToken)` resolves to the component-level override, not the root-level one, because the node injector walk finds it first. The root provider is never reached — no error, no warning, just a different instance than expected.

<p class="qa-link">[Full post →]({{ '/angular/angular-di-hierarchical-injector-tree/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the difference between `providers` and `viewProviders` on a component? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`providers` are visible to the component itself and all its child directives. `viewProviders` are visible *only* to the component — child directives cannot see them. The `includeViewProviders` flag is set to `true` only while Angular instantiates the component itself, then flipped off so subsequent child DI lookups skip `viewProviders`.

<p class="qa-link">[Full post →]({{ '/angular/angular-di-hierarchical-injector-tree/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `@SkipSelf` change the injector lookup starting point? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`@SkipSelf` skips the current node's injector and begins at the parent element. Without it, lookup starts locally. With it, Angular immediately walks to the parent injector, which is how you explicitly override a parent-provided token from a child — the child requests `@SkipSelf` so its own local provider doesn't shadow the parent's.

<p class="qa-link">[Full post →]({{ '/angular/angular-di-hierarchical-injector-tree/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `inject()` throw if called in `ngOnInit` instead of the constructor? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`inject()` only works inside injection contexts — constructor, field initializer, factory function. `ngOnInit` is a lifecycle callback, not an injection context. The `MISSING_INJECTION_CONTEXT` error is thrown because the DI resolution machinery requires the component's `LView` and `TNode` to be on the call stack, which only happens during construction.

<p class="qa-link">[Full post →]({{ '/angular/angular-di-hierarchical-injector-tree/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does the `NodeInjectorFactory.resolving` flag prevent? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Cyclic dependencies. When a factory is already being resolved (`resolving === true`) and is hit again during the same resolution chain, Angular throws `cyclicDependencyError` instead of entering an infinite loop of mutual injection.

<p class="qa-link">[Full post →]({{ '/angular/angular-di-hierarchical-injector-tree/' | relative_url }})</p>
  </div>
</div>

## Topic: RxJS integration & the async pipe (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the `async` pipe guarantee unsubscription without `ngOnDestroy` boilerplate? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Angular registers a teardown with `DestroyRef.onDestroy()` when `async` pipe first subscribes. When the component is destroyed, `DestroyRef` fires and calls `subscription.unsubscribe()`. If the Observable completes before destruction, the subscription is also released. Either path prevents a memory leak.

<p class="qa-link">[Full post →]({{ '/angular/angular-rxjs-async-pipe-auto-unsubscribe/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens inside `switchMap` when the source emits a new value while an inner Observable is still in-flight? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`switchMap` calls `innerSubscriber.unsubscribe()` on the previous inner subscription *before* subscribing to the new inner Observable. For `HttpClient`, this triggers XHR's `abort()` through the RxJS teardown chain, cancelling the in-flight network request. At most one inner Observable is active at any time.

<p class="qa-link">[Full post →]({{ '/angular/angular-rxjs-async-pipe-auto-unsubscribe/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `async` pipe call `markForCheck()` on every emission? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Without it, an `OnPush` component would never re-render — Angular would not detect the state change because `OnPush` only checks when inputs change, `markForCheck()` is called, or an event handler fires. The `async` pipe's `markForCheck()` ensures the change detector runs on the next cycle after each emission.

<p class="qa-link">[Full post →]({{ '/angular/angular-rxjs-async-pipe-auto-unsubscribe/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when manually subscribing to an Observable in a component? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Forgetting to call `subscription.unsubscribe()` in `ngOnDestroy`. The subscription keeps the component's closure scope alive, the HTTP request keeps the connection open, and the change detector may fire into a destroyed view — producing `ExpressionChangedAfterItHasBeenCheckedError`. The `async` pipe eliminates this entire failure mode.

<p class="qa-link">[Full post →]({{ '/angular/angular-rxjs-async-pipe-auto-unsubscribe/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `finalize` know which teardown path triggered it — complete, error, or manual unsubscribe? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It doesn't need to distinguish — `subscriber.add(callback)` registers the callback for all three teardown paths identically. Whether the Observable completes, errors, or `unsubscribe()` is called explicitly (by `async` pipe's `DestroyRef`, by `switchMap`'s inner cancellation, or manually), the registered `finalize` callback fires.

<p class="qa-link">[Full post →]({{ '/angular/angular-rxjs-async-pipe-auto-unsubscribe/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why do signals threaten to make the `async` pipe obsolete? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Signals eliminate the need for Observable subscription management in templates entirely — a signal value is read synchronously in the template, and Angular's reactivity system handles dependency tracking and cleanup automatically. The RxJS interop layer (`toSignal`, `toObservable`) still requires careful subscription management, but the long-term direction is signal-native data flow.

<p class="qa-link">[Full post →]({{ '/angular/angular-rxjs-async-pipe-auto-unsubscribe/' | relative_url }})</p>
  </div>
</div>

## Topic: Routing & lazy loading (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `loadComponent` in Angular Router reduce initial bundle size? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Angular Router calls `loadComponent` via dynamic `import()`, which tells the bundler (esbuild/Webpack/Vite) to emit a separate JavaScript chunk per route. The chunk is fetched only when the user navigates to that route — code for features the user never visits is never downloaded.

<p class="qa-link">[Full post →]({{ '/angular/angular-router-lazy-loaded-bundles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What caching mechanism prevents `import()` from being called twice for the same lazy route? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`RouterConfigLoader` maintains a `WeakMap<Route, Promise>` cache per route (`componentLoaders` and `childrenLoaders`). After the first navigation loads a route's component, subsequent visits reuse `_loadedComponent` / `_loadedRoutes` without re-fetching the network chunk. The `WeakMap` is keyed on the `Route` object, so the cache is garbage-collected if the route config is removed.

<p class="qa-link">[Full post →]({{ '/angular/angular-router-lazy-loaded-bundles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When do `canActivate` guards execute relative to the chunk being fetched? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Guards execute against the *static* route config *before* the chunk is fetched. If the guard denies access, the dynamic `import()` for that route's component never fires — the user never downloads code they're not authorized to see.

<p class="qa-link">[Full post →]({{ '/angular/angular-router-lazy-loaded-bundles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the difference between `loadChildren` and `loadComponent`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`loadChildren` loads an entire sub-route tree (an array of `Routes`), while `loadComponent` loads a single component for that specific route. Both use `import()` under the hood and both create separate chunks, but `loadChildren` also creates a new `EnvironmentInjector` for the child route tree.

<p class="qa-link">[Full post →]({{ '/angular/angular-router-lazy-loaded-bundles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What problem does `PreloadAllModules` solve and what's the tradeoff? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It fetches lazy chunks after the initial bundle loads while the browser is idle, so subsequent navigation is instant. The tradeoff is bandwidth — every lazy chunk is downloaded whether the user navigates there or not, trading upfront data cost for zero-latency navigation later.

<p class="qa-link">[Full post →]({{ '/angular/angular-router-lazy-loaded-bundles/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why would two lazy routes importing each other's guards cause a problem? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It creates a circular chunk graph — the bundler can't resolve the dependency cleanly, resulting in duplicated guard code in both chunks or build errors. The fix is to refactor guards into a shared core module that both lazy routes import independently.

<p class="qa-link">[Full post →]({{ '/angular/angular-router-lazy-loaded-bundles/' | relative_url }})</p>
  </div>
</div>

## Topic: Forms: Reactive Forms vs Signal Forms (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does AbstractControl store reactive state internally in current Angular? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It stores `status`, `pristine`, and `touched` as Angular signals (`signal<FormControlStatus>`, `signal(true)`, `signal(false)`), then exposes them through getter properties and `computed()` read-only signals (`_status`, `_pristine`, `_touched`). The signal reads and writes are wrapped in `untracked()` so external consumers don't accidentally create reactive subscriptions.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-forms-reactive-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What single function is the entry point for both sync and async validation across all form APIs? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`updateValueAndValidity()`. It calls `_runValidator()` synchronously first, then conditionally starts `_runAsyncValidator()` if the status is `VALID` or `PENDING`. Whether the form is wired via `formControl`, `formControlName`, or a future signal-based directive, this is the same code path.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-forms-reactive-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why are form control signals wrapped in `untracked()` reads and writes? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Form controls are updated from multiple sources simultaneously — user input, programmatic `setValue`, async validators completing. Using `untracked()` prevents the framework from creating unintended reactive subscriptions when a parent control reads child status during `updateValueAndValidity()` propagation. Without it, parent-child status reads would create spurious signal dependencies.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-forms-reactive-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When do `valueChanges` and `statusChanges` Observables fire relative to signal updates? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
After the signals are updated, not before. `statusReactive.set(newStatus)` runs first (via the private setter wrapped in `untracked()`), then `_events.next(StatusChangeEvent)` fires, then `valueChanges.emit()` fires. A signal-aware template reads the latest value synchronously; a traditional template gets it on the next change detection cycle.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-forms-reactive-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `setUpValidators()` merge validators from template directives and programmatic calls? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It calls `mergeValidators()`, which concatenates validators from two sources: model-level validators set via `control.setValidators(...)` and directive-level validators from template attributes (`required`, `minlength`). This function is called identically for reactive and template-driven paths — the validator layer is model-level, not directive-level.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-forms-reactive-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Can you read `control.status` as a reactive dependency in a component's `computed()`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Not directly. Angular wraps signal reads in `untracked()` to prevent accidental subscription tracking. You can read `control.status` imperatively (it returns the current value) or subscribe to `control.statusChanges` as an Observable — but using it inside a `computed()` will not create a reactive dependency.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-forms-reactive-validation/' | relative_url }})</p>
  </div>
</div>

## Topic: Content projection & control flow (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `@if` compile differently from the old `*ngIf`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`@if` compiles into `ConditionalCreate` + `Conditional` IR operations that become `conditionalCreate` and `conditional` runtime instructions. There is no `<ng-template>` element, no `TemplateRef`, and no `ViewContainerRef.createEmbeddedView()` call chain. The compiler allocates a slot for the conditional block and manages the view at that slot index internally.

<p class="qa-link">[Full post →]({{ '/angular/angular-control-flow-viewcontainerref-embed/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does the `generateConditionalExpressions` compiler phase do for `@if/@else if/@else`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It flattens the chain of conditions into a single slot-index ternary expression stored in `op.processed`: `slot = cond ? branch0Slot : (cond2 ? branch1Slot : defaultSlot)`. The runtime `conditional()` instruction evaluates this ternary to determine which embedded view slot to render — or `-1` for no match.

<p class="qa-link">[Full post →]({{ '/angular/angular-control-flow-viewcontainerref-embed/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why doesn't `@if` create a comment node like `*ngIf` did? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`@if` uses slot-based embedded view infrastructure where the compiler knows the exact slot position at build time. The runtime allocates a slot for the conditional block and manages the view at that index — no placeholder comment node is needed because there's no `TemplateRef` lookup or `createEmbeddedView` indirection.

<p class="qa-link">[Full post →]({{ '/angular/angular-control-flow-viewcontainerref-embed/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What compiler phase converts IR ops into concrete runtime instructions like `conditionalCreate`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The `reify` phase (`reify.ts`). It replaces each IR op (`ConditionalCreate`, `RepeaterCreate`, `Conditional`, `Repeater`) with a concrete instruction call (`ng.conditionalCreate()`, `ng.repeaterCreate()`, `ng.conditional()`, `ng.repeater()`), each of which manages embedded views through `ViewContainerRef` infrastructure.

<p class="qa-link">[Full post →]({{ '/angular/angular-control-flow-viewcontainerref-embed/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `@for` handle the empty collection case? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The `RepeaterCreate` IR op carries an optional `emptyView` xref. When the collection is empty at runtime, the `repeater` instruction creates the empty embedded view instead of the main repeater view — replacing the implicit `*ngFor` template behavior with an explicit `@empty` block.

<p class="qa-link">[Full post →]({{ '/angular/angular-control-flow-viewcontainerref-embed/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the performance advantage of `@if`/`@for` over `*ngIf`/`*ngFor`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Fewer intermediate objects (`TemplateRef`, `ViewContainerRef.createEmbeddedView()` call chain), no extra `<ng-template>` DOM node, and direct slot-index-based view management. The compiler produces smaller bundle size and the runtime has less change-detection overhead per conditional/repeater evaluation.

<p class="qa-link">[Full post →]({{ '/angular/angular-control-flow-viewcontainerref-embed/' | relative_url }})</p>
  </div>
</div>

## Topic: HttpClient & functional interceptors (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `HttpInterceptorFn` replace the class-based `HttpInterceptor` pattern? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a plain function `(req, next) => Observable<HttpEvent>` registered via `withInterceptors()` in `provideHttpClient()` instead of the `HTTP_INTERCEPTORS` multi-provider token. The function runs inside `runInInjectionContext` so `inject()` works directly in the function body — no class, no `@Injectable` decorator, no constructor injection needed.

<p class="qa-link">[Full post →]({{ '/angular/angular-functional-interceptors-httptinterceptorfn/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `HttpInterceptorHandler` deduplicate interceptors with `new Set(...)`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because `HTTP_INTERCEPTOR_FNS` and `HTTP_ROOT_INTERCEPTOR_FNS` can both contain the same functional interceptor if it was registered in both an `EnvironmentInjector` and the root injector. Without the `Set` deduplication, the same interceptor would run twice per request — a real bug, not a hypothetical.

<p class="qa-link">[Full post →]({{ '/angular/angular-functional-interceptors-httptinterceptorfn/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What determines the execution order of interceptors in `withInterceptors([a, b, c])`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`reduceRight` wraps them right-to-left, producing a chain conceptually shaped as `c(b(a(backend)))`. Execution is left-to-right: `a` runs first on the outgoing request and last on the incoming response. The rightmost interceptor in the array is closest to the backend.

<p class="qa-link">[Full post →]({{ '/angular/angular-functional-interceptors-httptinterceptorfn/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `untracked()` used when executing the interceptor chain? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`HttpClient` uses Angular signals internally for application stability tracking. Without `untracked()`, the chain execution (including the backend HTTP call) would be tracked as a dependency by any `effect()` or `computed()` active when the request was dispatched, creating an accidental reactive dependency between unrelated application state and an HTTP request.

<p class="qa-link">[Full post →]({{ '/angular/angular-functional-interceptors-httptinterceptorfn/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the consequence of an interceptor mutating `HttpRequest` directly instead of cloning it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`HttpRequest` is immutable — mutating it directly is a bug that silently corrupts the request for every downstream interceptor. Every modification must go through `req.clone({headers: ...})` to produce a new immutable request object.

<p class="qa-link">[Full post →]({{ '/angular/angular-functional-interceptors-httptinterceptorfn/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the legacy class-based interceptor adapter work in the same pipeline as functional interceptors? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`legacyInterceptorFnFactory` injects all `HTTP_INTERCEPTORS`, builds a `ChainedInterceptorFn` linked list via `adaptLegacyInterceptorToChain`, and wraps the result as a single `HttpInterceptorFn`. The adapter reshapes the calling convention from `intercept(req, handler)` to the chain shape, but doesn't need `runInInjectionContext` because class interceptors already resolved dependencies through constructor injection.

<p class="qa-link">[Full post →]({{ '/angular/angular-functional-interceptors-httptinterceptorfn/' | relative_url }})</p>
  </div>
</div>

## Topic: Server-side rendering & hydration (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does non-destructive hydration do differently from destructive hydration? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Instead of destroying the server-rendered DOM and re-creating it from scratch, Angular walks the live DOM tree, claims each node via `ngh` attribute annotations, and wires up event listeners, change detection, and component instances in-place. No DOM is mutated — existing nodes are claimed, not replaced.

<p class="qa-link">[Full post →]({{ '/angular/angular-ssr-hydration-non-destructive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the `ngh` attribute and how does `TransferState` use it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
During SSR, Angular annotates every component host element with an `ngh` attribute containing a numeric index. That index is a slot into the `__nghData__` array serialized inside `TransferState` as a `<script id="ng-state">` tag. Each slot holds a `SerializedView` describing the component's view structure: root node count, disconnected nodes, embedded view sizes.

<p class="qa-link">[Full post →]({{ '/angular/angular-ssr-hydration-non-destructive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if a CDN strips comment nodes from the server HTML? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`verifySsrContentsIntegrity()` scans `<body>` for the `<!--nghm-->` comment marker. If it's missing (stripped by CDN optimization), Angular throws `RuntimeErrorCode.MISSING_SSR_CONTENT_INTEGRITY_MARKER` and refuses to hydrate — because the `ngh` annotations it depends on may also have been stripped, making safe node claiming impossible.

<p class="qa-link">[Full post →]({{ '/angular/angular-ssr-hydration-non-destructive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What are the `enableLocateOrCreate*` function swaps and why are they tree-shakable? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When `provideClientHydration()` is called, `enableHydrationRuntimeSupport()` swaps the default "create" code paths (`document.createElement()`, `document.createTextNode()`) with "locate existing DOM node" implementations that walk the live DOM. If hydration is never enabled, all these functions are eliminated from the production bundle — this is the tree-shaking boundary.

<p class="qa-link">[Full post →]({{ '/angular/angular-ssr-hydration-non-destructive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does incremental hydration interact with `@defer` blocks? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Incremental hydration serializes defer block metadata into `__nghDeferData__` and wires `jsaction` attributes on host elements. Each `@defer` block's hydration is deferred until its trigger fires (viewport, interaction, idle, timer) — the block's DOM is not claimed until then, managed by the `DEHYDRATED_BLOCK_REGISTRY`.

<p class="qa-link">[Full post →]({{ '/angular/angular-ssr-hydration-non-destructive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is the `ngh` attribute removed after hydration? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's scaffolding — only meaningful during the hydration pass. After the `DehydratedView` is extracted and stored on the `LView`, the attribute serves no purpose and would be noise in the browser's DOM inspector. Stripping it keeps the live DOM clean.

<p class="qa-link">[Full post →]({{ '/angular/angular-ssr-hydration-non-destructive/' | relative_url }})</p>
  </div>
</div>

## Topic: The Angular CLI & build pipeline (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `ng build` get from a CLI command to the actual bundler? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The CLI reads `angular.json` to resolve the builder string (e.g., `@angular/build:application`), maps it to the `buildApplication()` function, feeds it your options, and lets the builder handle everything. The builder normalizes options, sets up esbuild bundler contexts, runs the Angular AOT compiler, and orchestrates the full build pipeline — you never touch webpack or esbuild directly.

<p class="qa-link">[Full post →]({{ '/angular/angular-cli-builders-webpack-config/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does `normalizeOptions()` do to your `angular.json` values? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It transforms raw options into a fully resolved internal form: relative paths become absolute (resolved against workspace root), `optimization: true` expands to `{ scripts: true, styles: { minify: true, inlineCritical: true }, fonts: { inline: true } }`, missing `outputPath` defaults to `dist/<projectName>`, and the `aot` flag controls AOT vs JIT mode (defaulting to `true`).

<p class="qa-link">[Full post →]({{ '/angular/angular-cli-builders-webpack-config/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `executeBuild()` create separate `BundlerContext` instances for TypeScript, global styles, and component styles? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each context can be independently invalidated and re-bundled during incremental rebuilds in watch mode. On the first build, fresh contexts are created; on rebuilds, they're reused and only changed files are re-bundled. The `SourceFileCache` persists TypeScript analysis across rebuilds to avoid redundant type-checking.

<p class="qa-link">[Full post →]({{ '/angular/angular-cli-builders-webpack-config/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When does chunk optimization via Rollup/Rolldown actually run? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Only when `optimizationOptions.scripts` is enabled and the number of lazy chunks exceeds a configured threshold (`optimizeChunksThreshold`). Small projects skip the optimization pass entirely — it's gated behind the lazy chunk count, not applied unconditionally.

<p class="qa-link">[Full post →]({{ '/angular/angular-cli-builders-webpack-config/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when you change the underlying bundler (webpack → esbuild) — do you need to update `angular.json`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. The builder is a higher-level abstraction that encapsulates the entire build tool plus Angular-specific compilation steps. Changing the underlying tool only requires changing the builder package — `angular.json`'s `builder` field stays the same. This is the entire point of the Architect builder system.

<p class="qa-link">[Full post →]({{ '/angular/angular-cli-builders-webpack-config/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `assertCompatibleAngularVersion()` run before anything else in the builder? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The builder is tightly coupled to the Angular compiler version. Running a builder from Angular v19 against a v17 project (or vice versa) would produce silent compilation errors or incorrect output. The version check is a hard guard against mismatched toolchain versions.

<p class="qa-link">[Full post →]({{ '/angular/angular-cli-builders-webpack-config/' | relative_url }})</p>
  </div>
</div>

## Topic: Testing Angular apps (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does TestBed need a PlatformRef instead of just a DOM container? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The platform provides the root injector that supplies `NgZone`, `ApplicationRef`, `Compiler`, and all core Angular singletons. Without a `PlatformRef`, the test module has no parent injector, `TestBedCompiler.finalize()` has nothing to parent the test module under, and every `inject()` call for core services fails. TestBed is a full Angular bootstrap, miniaturized for a single test.

<p class="qa-link">[Full post →]({{ '/angular/angular-testbed-platform-ref-component-tests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `initTestEnvironment()` throw on a second call instead of resetting? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The platform is a shared singleton that persists for the entire test session. Resetting it between tests would destroy `NgZone` and `ApplicationRef`, which are expensive to recreate and structurally identical across tests. Only the test module's declarations and providers need per-test isolation, which `resetTestingModule()` handles.

<p class="qa-link">[Full post →]({{ '/angular/angular-testbed-platform-ref-component-tests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the difference between `initTestEnvironment()` and `configureTestingModule()`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`initTestEnvironment()` is called once per suite and sets up the platform — it's the one-time bootstrap. `configureTestingModule()` is called per-test and configures declarations, imports, and providers for that test's dynamic test module. You can call `configureTestingModule` multiple times; `initTestEnvironment` only once.

<p class="qa-link">[Full post →]({{ '/angular/angular-testbed-platform-ref-component-tests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `TestBedCompiler.finalize()` create the DI hierarchy for tests? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It creates an `NgModuleRef` with `this.platform.injector` as the parent injector. This makes the test module a child of the platform injector, so every `ComponentFactory.create()` call inside `createComponent()` resolves `NgZone`, `ApplicationRef`, and `ChangeDetectorRef` from the same injector tree a production app uses.

<p class="qa-link">[Full post →]({{ '/angular/angular-testbed-platform-ref-component-tests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the mistake of assuming TestBed is a DOM mounting utility? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
TestBed is not a DOM container — `ComponentFactory.create()` does the real work, not DOM manipulation. The DOM element is inserted by `TestComponentRenderer`, but the *DI parent* for the component is `this.testModuleRef`. The DOM insertion is incidental; the injector hierarchy is load-bearing for component instantiation to succeed.

<p class="qa-link">[Full post →]({{ '/angular/angular-testbed-platform-ref-component-tests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `resetTestingModule()` not destroy `NgZone` and `ApplicationRef`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because they're singletons provided by the platform, not by the test module. `resetTestingModule()` tears down only the test module's declarations and providers. The platform persists across tests, so `NgZone` and `ApplicationRef` are reused — this is why fixture teardown destroys components but doesn't recreate the zone.

<p class="qa-link">[Full post →]({{ '/angular/angular-testbed-platform-ref-component-tests/' | relative_url }})</p>
  </div>
</div>

## Topic: State management patterns (Order 13)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `computed()` defer recomputation while `effect()` runs eagerly on creation? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Computed values derive state — they produce nothing until someone reads the result, so computing eagerly wastes cycles on values nobody reads. Effects produce side effects — their entire purpose is to *do* something, so deferring them would mean missing the initial trigger they were registered to observe. Both use the same reactive graph, but the scheduling hook differs.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-state-computed-lazy-effect-eager/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the `UNSET` sentinel and why isn't `null` used instead? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`UNSET` is `Symbol('UNSET')` so that `null`, `undefined`, and `0` are all valid computed values — a computed that legitimately returns `null` won't be mistaken for "never computed." The `UNSET`/`COMPUTING`/`ERRORED` triple of sentinels is the state machine governing a computed's lifecycle, each triggering different behavior in `producerMustRecompute`.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-state-computed-lazy-effect-eager/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the single point of divergence between computed and effect scheduling? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`consumerMarkedDirty`. `ComputedNode` inherits the default implementation from `REACTIVE_NODE` (which does nothing — just sets `dirty = true`). `VIEW_EFFECT_NODE` and `ROOT_EFFECT_NODE` override it to immediately schedule re-execution via the `ChangeDetectionScheduler`. Same graph, same dirty propagation, opposite consequences.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-state-computed-lazy-effect-eager/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the epoch-based short-circuit in `producerUpdateValueVersion` make computed genuinely lazy? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
If `dirty` is `false` and `lastCleanEpoch === epoch`, the function returns immediately without recomputing. Even if `dirty` is `true`, `consumerPollProducersForChange` walks the dependency list and only recomputes if a version mismatch is found. A computed that was verified clean in the current epoch can skip recomputation entirely, preventing unnecessary re-polling of producer versions in a stable graph.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-state-computed-lazy-effect-eager/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Can you force a `computed()` to be eager by wrapping it in an `effect()`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Yes — `effect(() => { this.derived() });` reads the computed every time the effect runs, which forces the computed to recompute because reading the computed calls `producerUpdateValueVersion`. This is a deliberate pattern for computed values that need to always be current, though a computed with side effects is itself a design smell.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-state-computed-lazy-effect-eager/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the risk of a deep `computed → computed → computed` chain for performance? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`consumerMarkDirty` recurses through the whole chain on every source signal write. A single write can trigger many `consumerMarkDirty` calls for a deep chain. While no recomputation happens until read, the dirty-flag propagation itself has a cost that scales with chain depth and branching factor.

<p class="qa-link">[Full post →]({{ '/angular/angular-signal-state-computed-lazy-effect-eager/' | relative_url }})</p>
  </div>
</div>

## Topic: Performance: OnPush, track, and @defer (Order 14)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `@defer` create chunks differently from route-level lazy loading? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Route-level lazy loading splits an entire component (and its template) into a separate chunk when the router navigates. `@defer` splits a **sub-tree** of an already-loaded component's template into a separate chunk, loaded when a trigger fires within the same page. The bundling mechanism is identical (dynamic `import()`), but the granularity and trigger are different.

<p class="qa-link">[Full post →]({{ '/angular/angular-defer-chunk-loading-performance/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why doesn't `@defer` need an HTTP round-trip to discover the chunk URL? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The chunk path is statically determined at build time. The compiler's `resolveDeferDepsFns` phase generates a `dependencyResolverFn` containing literal `import('./chunk-XYZ.js')` calls with paths baked in by the bundler. There is no runtime negotiation, no manifest lookup — the browser fetches a file whose path was determined during `ng build`.

<p class="qa-link">[Full post →]({{ '/angular/angular-defer-chunk-loading-performance/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What compiler phase generates the `dependencyResolverFn` and how does deduplication work? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The `resolveDeferDepsFns` phase generates the resolver function. It calls `getSharedFunctionReference()` to ensure that if two `@defer` blocks in the same component share identical dependencies, they get a single shared resolver function — and the bundler produces one chunk, not two.

<p class="qa-link">[Full post →]({{ '/angular/angular-defer-chunk-loading-performance/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `@defer` respect `OnPush` change detection? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The trigger calls `triggerDeferBlock()`, which notifies the scheduler via `NotificationSource.DeferBlockStateUpdate` — a typed notification that sets a specific dirty flag, not a Zone.js blanket notification. The parent `OnPush` component is only marked dirty when its own inputs or signal state change, not when the defer block transitions states.

<p class="qa-link">[Full post →]({{ '/angular/angular-defer-chunk-loading-performance/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if a `@defer` block's dynamic import fails at runtime? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The runtime catches the error and transitions the defer block to the `Error` state. If an `@error` block is defined, it is rendered. If not, the block stays in the `Loading` state with no visible content. The `LDeferBlockDetails` array stores cleanup functions that are invoked on error to clean up partial state.

<p class="qa-link">[Full post →]({{ '/angular/angular-defer-chunk-loading-performance/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the difference between `dependencyResolverFn` in `TDeferBlockDetails` vs `LDeferBlockDetails`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`TDeferBlockDetails` is static — one per template, shared across all instances. `LDeferBlockDetails` is per-render instance. The resolver is stored in `TDeferBlockDetails` so the bundler splits it once, and every defer block using the same dependencies shares the same chunk reference.

<p class="qa-link">[Full post →]({{ '/angular/angular-defer-chunk-loading-performance/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `@loading (minimum 500ms)` work at the compiler/runtime level? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The compiler's `configureDeferInstructions` phase emits a `[loadingMinimumTime, loadingAfterTime]` const array into the constants table. The runtime reads this config and uses `ɵɵdeferEnableTimerScheduling` to freeze the block in the loading state for at least the specified duration, even if the chunk loads faster. The timer scheduling is tree-shakable because the compiler only emits the reference when these parameters are present.

<p class="qa-link">[Full post →]({{ '/angular/angular-defer-chunk-loading-performance/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 92 across Angular

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What does bootstrapApplication() actually build before mounting the root component?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It builds a root `EnvironmentInjector` directly from the `providers` array via `EnvironmentNgModuleRefAdapter` — no `NgModule` is ever instantiated. The injector is handed to `bootstrap()`, which runs inside `NgZone.run()`, waits for `ApplicationInitStatus` to resolve app initializers, then calls `ApplicationRef.bootstrap(RootComponent)`. The whole injector tree exists before a single Ivy instruction runs."
      }
    },
    {
      "@type": "Question",
      "name": "How does Ivy compile a component's template differently from a virtual-DOM framework?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Ivy compiles each template into a plain JavaScript function containing `ɵɵelementStart`/`ɵɵproperty`/`ɵɵadvance` instruction calls that read and write real DOM nodes directly via an `LView` array. There is no virtual DOM built or diffed — the same compiled function runs on every change-detection pass, with `rf & 1` (creation) instructions running once and `rf & 2` (update) instructions running every tick."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if bootstrapApplication() rejects — where does the error surface?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`internalCreateApplication` wraps the bootstrap in a `try/catch` that converts synchronous errors into a rejected Promise. If no `.catch()` is attached to the `bootstrapApplication()` call, the rejection is silent — there is no console output or global error handler that catches it. The `.catch()` on the returned Promise is the only surface for bootstrap failures."
      }
    },
    {
      "@type": "Question",
      "name": "What is the role of `decls` and `vars` on a ComponentDef?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`decls` counts nodes, local refs, and pipes to size the creation section of the `LView` array. `vars` counts bindings to size the update-pass section. Both are plain integers passed to `ɵɵdefineComponent` at build time — they pre-allocate the `LView` slots before the template function ever runs, not describe the component for tooling."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the same template function execute twice per change-detection pass?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The compiled `Template(rf, ctx)` function has two branches gated on the `rf` bitmask — `rf & 1` runs creation instructions exactly once per `LView`, `rf & 2` runs update instructions every subsequent tick. Both branches live in the same function body; the first call populates `LView` slots, every later call re-evaluates bindings through `ɵɵadvance()` + `ɵɵproperty()`."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when assuming how Angular's first render differs from later updates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Developers assume the first render uses a special \"mount\" code path. In reality, `ApplicationRef._loadComponent()` calls `this.tick()`, which runs the exact same `tick() → synchronize() → synchronizeOnce()` loop as every subsequent update — creation instructions gate on `rf & 1`, update instructions on `rf & 2`, within the same template function. There is no separate mount path."
      }
    },
    {
      "@type": "Question",
      "name": "What does `standalone: true` actually change in a component compared to the old default?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nothing — standalone is the compiler's default. An `@Component` with no `standalone` field is already standalone. The old default required `standalone: false` plus NgModule declaration/export/import. The `standalone: true` flag is redundant in current Angular; removing it entirely from a codebase is the correct normalization."
      }
    },
    {
      "@type": "Question",
      "name": "How does the `host` object's key syntax dispatch to different binding types?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The compiler reads the key's punctuation, not a separate `type` field: a bare key `'class'` is a static DOM attribute, `[key]` is a property binding re-evaluated on every change-detection pass, `(key)` is an event binding, and `[attr.key]` or `[class.foo]` scopes a property binding to one specific attribute or class. This is resolved entirely at compile time from the string syntax."
      }
    },
    {
      "@type": "Question",
      "name": "When would you explicitly use `standalone: false` in current Angular?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When a component must live inside an `NgModule` for a legacy integration — for example, a third-party library that still expects module declarations, or a shared module boundary enforced by an older build system. In all other cases, `standalone: false` is leftover code from pre-standalone Angular."
      }
    },
    {
      "@type": "Question",
      "name": "What's the mistake of writing `[class]` as a bare key in a host object instead of `[class.foo]`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A bare `'class'` is a static attribute set once at element creation, never re-evaluated. A property binding `[class]` or `[class.foo]` is re-evaluated on every change-detection tick. Using the wrong syntax means a class toggle either never updates (bare key) or updates on every pass even when unnecessary (full `[class]` instead of scoped `[class.foo]`)."
      }
    },
    {
      "@type": "Question",
      "name": "How does `[attr.disabled]` differ from `[disabled]` on a native `<button>` host binding?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`[disabled]` sets the DOM property, which usually works for native buttons but doesn't give precise control over attribute presence. `[attr.disabled]` with a method that returns `null` or a string explicitly adds or removes the `disabled=\"\"` attribute, which native form-control semantics and accessibility tools depend on more reliably than the property alone."
      }
    },
    {
      "@type": "Question",
      "name": "Can a standalone component's `imports` array include `NgModule`s, or only other standalone components?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both. A standalone component can import other standalone components/directives/pipes and existing `NgModule`s — this is the intended migration path, allowing incremental adoption where new standalone components coexist with not-yet-migrated `NgModule`-declared libraries."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Zone.js-based change detection check the entire component tree?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Zone.js monkey-patches global async APIs and fires `onMicrotaskEmpty` when its patched microtask queue drains. That signal carries no information about *which* component's state changed — only that some async callback somewhere finished. Angular's only correct response to \"something happened, no idea what\" is `ViewTreeGlobal`, which triggers `applicationRef._tick()` on the full tree."
      }
    },
    {
      "@type": "Question",
      "name": "What does the `NotificationSource` enum do in zoneless change detection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It tells the zoneless scheduler *why* `notify()` was called — `MarkForCheck`, `Listener`, `RootEffect`, `DeferBlockStateUpdate`, etc. Each source maps to a specific dirty flag (`ViewTreeCheck`, `ViewTreeTraversal`, `RootEffects`) rather than a single undifferentiated `ViewTreeGlobal`. This lets the scheduler skip categories of work that don't apply, which Zone.js cannot do."
      }
    },
    {
      "@type": "Question",
      "name": "What's the practical difference between `ViewTreeGlobal` and `ViewTreeCheck`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ViewTreeGlobal` is Zone.js's \"no information\" flag — it checks everything unconditionally. `ViewTreeCheck` is zoneless's \"something in a view changed\" flag — still broad, but it allows other flags like `RootEffects` to be handled independently without a full tree traversal. The precision is at the category level, not per-component."
      }
    },
    {
      "@type": "Question",
      "name": "Why does zoneless special-case `Listener` notifications when zoneless is disabled?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Under Zone.js, event listeners already run inside the Angular zone and automatically trigger `onMicrotaskEmpty`-driven checks. A `Listener`-sourced `notify()` in that mode would be redundant, causing double-triggered checks. The special case exists for incremental migration between the two models."
      }
    },
    {
      "@type": "Question",
      "name": "When migrating a component from Zone.js to zoneless, what's the risk if state changes happen outside signals or `markForCheck()`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Zoneless has no monkey-patched global fallback to catch unnotified changes. If a third-party library mutates state directly — outside signals, outside `markForCheck()` — the zoneless scheduler will never be notified, and the component will show stale data. Zone.js incidentally catches these mutations because it patches all async APIs."
      }
    },
    {
      "@type": "Question",
      "name": "What is `useMicrotaskScheduler` vs `scheduleCallbackWithRafRace` and why does it matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The zoneless scheduler chooses between scheduling a tick via microtask (runs sooner, before the next paint) or racing against `requestAnimationFrame` (aligns with the browser's render timing). Microtask scheduling gives a more synchronous-feeling update; rAF-racing can reduce redundant work when multiple notifications arrive before the actual paint. The choice depends on internal scheduler state, not a fixed constant."
      }
    },
    {
      "@type": "Question",
      "name": "How does a `computed()` discover its dependencies without an explicit list?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every signal read goes through `producerAccessed`, which checks whether there's an active consumer (`activeConsumer` global variable — a `computed()` recomputing or an `effect()` running). If there is, the read itself records a link between that signal and the consumer. No array, no manual registration — the function body's own execution is the dependency declaration."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when you write to a signal — does it eagerly recompute downstream computed values?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. `signalSetFn` updates the value and calls `producerNotifyConsumers`, which walks the linked list of dependents and marks each one `dirty = true`. Nothing gets recomputed at this point. A dirty `computed()` only re-runs its function the next time something reads it — this is a lazy-pull model, not eager-push."
      }
    },
    {
      "@type": "Question",
      "name": "Can a `computed()`'s dependency set change between recomputations, and is that a bug?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's by design. If a computed's function body conditionally reads different signals on different runs, the dependency set is re-derived fresh each time via `producerAccessed` calls during execution. A signal that wasn't read on the current run won't have a link, so it won't trigger recomputation — which is correct behavior, not a missed dependency."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't writing `count.set(5)` when the signal already holds `5` trigger any notifications?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`signalSetFn` checks `node.equal(node.value, newValue)` before proceeding. The default equality function (`Object.is`-style) returns `true` for identical values, so the entire notification cascade is skipped. Writing the same value is a genuine no-op, not a wasted-but-harmless notification."
      }
    },
    {
      "@type": "Question",
      "name": "What's the tradeoff of automatic dependency tracking vs explicit dependency arrays?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Automatic tracking eliminates the \"forgot to declare a dependency\" bug class entirely — but any signal read during a computed's execution, even one that was \"incidental\" (e.g., inside a debug `console.log`), becomes a real dependency. There is no way to exclude a read from tracking without an explicit escape hatch (`untracked()`)."
      }
    },
    {
      "@type": "Question",
      "name": "How does `consumerMarkDirty` handle a chain of `computed → computed → computed`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`consumerMarkDirty` sets `node.dirty = true` and then recursively calls `producerNotifyConsumers(node)` — propagating dirtiness to the next downstream consumer. This means a single source signal write cascades dirty flags through the entire chain without any intermediate computed needing to eagerly recompute, which is what makes the lazy-pull model work across deep chains."
      }
    },
    {
      "@type": "Question",
      "name": "What are the three layers of Angular's injector hierarchy and what order does token lookup follow?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Element injector (node injector, backed by a bloom filter) → Environment injector → Platform injector. Lookup starts at the current element's node injector, checks embedded view injectors first if present, then walks parent node injectors upward via bloom-filter pre-checks, and only falls through to the Environment/Platform injector if nothing matches in the element chain."
      }
    },
    {
      "@type": "Question",
      "name": "What does the 256-bit bloom filter on each node injector actually do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each node injector stores 8 × 32-bit integers = 256 bits. When a directive is registered, its unique ID is hashed into one bit. During lookup, `bloomHasToken` tests whether that bit is set *before* doing a linear scan of providers — an O(1) pre-filter that avoids the expensive `searchTokensOnInjector` walk when the token provably isn't on that injector."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha when a component provides a token that the root also provides?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The component's element injector silently shadows the root provider for all descendants. `ChildComponent` calling `inject(SomeToken)` resolves to the component-level override, not the root-level one, because the node injector walk finds it first. The root provider is never reached — no error, no warning, just a different instance than expected."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between `providers` and `viewProviders` on a component?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`providers` are visible to the component itself and all its child directives. `viewProviders` are visible *only* to the component — child directives cannot see them. The `includeViewProviders` flag is set to `true` only while Angular instantiates the component itself, then flipped off so subsequent child DI lookups skip `viewProviders`."
      }
    },
    {
      "@type": "Question",
      "name": "How does `@SkipSelf` change the injector lookup starting point?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`@SkipSelf` skips the current node's injector and begins at the parent element. Without it, lookup starts locally. With it, Angular immediately walks to the parent injector, which is how you explicitly override a parent-provided token from a child — the child requests `@SkipSelf` so its own local provider doesn't shadow the parent's."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `inject()` throw if called in `ngOnInit` instead of the constructor?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`inject()` only works inside injection contexts — constructor, field initializer, factory function. `ngOnInit` is a lifecycle callback, not an injection context. The `MISSING_INJECTION_CONTEXT` error is thrown because the DI resolution machinery requires the component's `LView` and `TNode` to be on the call stack, which only happens during construction."
      }
    },
    {
      "@type": "Question",
      "name": "What does the `NodeInjectorFactory.resolving` flag prevent?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cyclic dependencies. When a factory is already being resolved (`resolving === true`) and is hit again during the same resolution chain, Angular throws `cyclicDependencyError` instead of entering an infinite loop of mutual injection."
      }
    },
    {
      "@type": "Question",
      "name": "How does the `async` pipe guarantee unsubscription without `ngOnDestroy` boilerplate?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Angular registers a teardown with `DestroyRef.onDestroy()` when `async` pipe first subscribes. When the component is destroyed, `DestroyRef` fires and calls `subscription.unsubscribe()`. If the Observable completes before destruction, the subscription is also released. Either path prevents a memory leak."
      }
    },
    {
      "@type": "Question",
      "name": "What happens inside `switchMap` when the source emits a new value while an inner Observable is still in-flight?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`switchMap` calls `innerSubscriber.unsubscribe()` on the previous inner subscription *before* subscribing to the new inner Observable. For `HttpClient`, this triggers XHR's `abort()` through the RxJS teardown chain, cancelling the in-flight network request. At most one inner Observable is active at any time."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `async` pipe call `markForCheck()` on every emission?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Without it, an `OnPush` component would never re-render — Angular would not detect the state change because `OnPush` only checks when inputs change, `markForCheck()` is called, or an event handler fires. The `async` pipe's `markForCheck()` ensures the change detector runs on the next cycle after each emission."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when manually subscribing to an Observable in a component?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Forgetting to call `subscription.unsubscribe()` in `ngOnDestroy`. The subscription keeps the component's closure scope alive, the HTTP request keeps the connection open, and the change detector may fire into a destroyed view — producing `ExpressionChangedAfterItHasBeenCheckedError`. The `async` pipe eliminates this entire failure mode."
      }
    },
    {
      "@type": "Question",
      "name": "How does `finalize` know which teardown path triggered it — complete, error, or manual unsubscribe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It doesn't need to distinguish — `subscriber.add(callback)` registers the callback for all three teardown paths identically. Whether the Observable completes, errors, or `unsubscribe()` is called explicitly (by `async` pipe's `DestroyRef`, by `switchMap`'s inner cancellation, or manually), the registered `finalize` callback fires."
      }
    },
    {
      "@type": "Question",
      "name": "Why do signals threaten to make the `async` pipe obsolete?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Signals eliminate the need for Observable subscription management in templates entirely — a signal value is read synchronously in the template, and Angular's reactivity system handles dependency tracking and cleanup automatically. The RxJS interop layer (`toSignal`, `toObservable`) still requires careful subscription management, but the long-term direction is signal-native data flow."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `loadComponent` in Angular Router reduce initial bundle size?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Angular Router calls `loadComponent` via dynamic `import()`, which tells the bundler (esbuild/Webpack/Vite) to emit a separate JavaScript chunk per route. The chunk is fetched only when the user navigates to that route — code for features the user never visits is never downloaded."
      }
    },
    {
      "@type": "Question",
      "name": "What caching mechanism prevents `import()` from being called twice for the same lazy route?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`RouterConfigLoader` maintains a `WeakMap<Route, Promise>` cache per route (`componentLoaders` and `childrenLoaders`). After the first navigation loads a route's component, subsequent visits reuse `_loadedComponent` / `_loadedRoutes` without re-fetching the network chunk. The `WeakMap` is keyed on the `Route` object, so the cache is garbage-collected if the route config is removed."
      }
    },
    {
      "@type": "Question",
      "name": "When do `canActivate` guards execute relative to the chunk being fetched?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Guards execute against the *static* route config *before* the chunk is fetched. If the guard denies access, the dynamic `import()` for that route's component never fires — the user never downloads code they're not authorized to see."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between `loadChildren` and `loadComponent`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`loadChildren` loads an entire sub-route tree (an array of `Routes`), while `loadComponent` loads a single component for that specific route. Both use `import()` under the hood and both create separate chunks, but `loadChildren` also creates a new `EnvironmentInjector` for the child route tree."
      }
    },
    {
      "@type": "Question",
      "name": "What problem does `PreloadAllModules` solve and what's the tradeoff?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It fetches lazy chunks after the initial bundle loads while the browser is idle, so subsequent navigation is instant. The tradeoff is bandwidth — every lazy chunk is downloaded whether the user navigates there or not, trading upfront data cost for zero-latency navigation later."
      }
    },
    {
      "@type": "Question",
      "name": "Why would two lazy routes importing each other's guards cause a problem?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It creates a circular chunk graph — the bundler can't resolve the dependency cleanly, resulting in duplicated guard code in both chunks or build errors. The fix is to refactor guards into a shared core module that both lazy routes import independently."
      }
    },
    {
      "@type": "Question",
      "name": "How does AbstractControl store reactive state internally in current Angular?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It stores `status`, `pristine`, and `touched` as Angular signals (`signal<FormControlStatus>`, `signal(true)`, `signal(false)`), then exposes them through getter properties and `computed()` read-only signals (`_status`, `_pristine`, `_touched`). The signal reads and writes are wrapped in `untracked()` so external consumers don't accidentally create reactive subscriptions."
      }
    },
    {
      "@type": "Question",
      "name": "What single function is the entry point for both sync and async validation across all form APIs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`updateValueAndValidity()`. It calls `_runValidator()` synchronously first, then conditionally starts `_runAsyncValidator()` if the status is `VALID` or `PENDING`. Whether the form is wired via `formControl`, `formControlName`, or a future signal-based directive, this is the same code path."
      }
    },
    {
      "@type": "Question",
      "name": "Why are form control signals wrapped in `untracked()` reads and writes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Form controls are updated from multiple sources simultaneously — user input, programmatic `setValue`, async validators completing. Using `untracked()` prevents the framework from creating unintended reactive subscriptions when a parent control reads child status during `updateValueAndValidity()` propagation. Without it, parent-child status reads would create spurious signal dependencies."
      }
    },
    {
      "@type": "Question",
      "name": "When do `valueChanges` and `statusChanges` Observables fire relative to signal updates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "After the signals are updated, not before. `statusReactive.set(newStatus)` runs first (via the private setter wrapped in `untracked()`), then `_events.next(StatusChangeEvent)` fires, then `valueChanges.emit()` fires. A signal-aware template reads the latest value synchronously; a traditional template gets it on the next change detection cycle."
      }
    },
    {
      "@type": "Question",
      "name": "How does `setUpValidators()` merge validators from template directives and programmatic calls?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It calls `mergeValidators()`, which concatenates validators from two sources: model-level validators set via `control.setValidators(...)` and directive-level validators from template attributes (`required`, `minlength`). This function is called identically for reactive and template-driven paths — the validator layer is model-level, not directive-level."
      }
    },
    {
      "@type": "Question",
      "name": "Can you read `control.status` as a reactive dependency in a component's `computed()`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Not directly. Angular wraps signal reads in `untracked()` to prevent accidental subscription tracking. You can read `control.status` imperatively (it returns the current value) or subscribe to `control.statusChanges` as an Observable — but using it inside a `computed()` will not create a reactive dependency."
      }
    },
    {
      "@type": "Question",
      "name": "How does `@if` compile differently from the old `*ngIf`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`@if` compiles into `ConditionalCreate` + `Conditional` IR operations that become `conditionalCreate` and `conditional` runtime instructions. There is no `<ng-template>` element, no `TemplateRef`, and no `ViewContainerRef.createEmbeddedView()` call chain. The compiler allocates a slot for the conditional block and manages the view at that slot index internally."
      }
    },
    {
      "@type": "Question",
      "name": "What does the `generateConditionalExpressions` compiler phase do for `@if/@else if/@else`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It flattens the chain of conditions into a single slot-index ternary expression stored in `op.processed`: `slot = cond ? branch0Slot : (cond2 ? branch1Slot : defaultSlot)`. The runtime `conditional()` instruction evaluates this ternary to determine which embedded view slot to render — or `-1` for no match."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't `@if` create a comment node like `*ngIf` did?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`@if` uses slot-based embedded view infrastructure where the compiler knows the exact slot position at build time. The runtime allocates a slot for the conditional block and manages the view at that index — no placeholder comment node is needed because there's no `TemplateRef` lookup or `createEmbeddedView` indirection."
      }
    },
    {
      "@type": "Question",
      "name": "What compiler phase converts IR ops into concrete runtime instructions like `conditionalCreate`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The `reify` phase (`reify.ts`). It replaces each IR op (`ConditionalCreate`, `RepeaterCreate`, `Conditional`, `Repeater`) with a concrete instruction call (`ng.conditionalCreate()`, `ng.repeaterCreate()`, `ng.conditional()`, `ng.repeater()`), each of which manages embedded views through `ViewContainerRef` infrastructure."
      }
    },
    {
      "@type": "Question",
      "name": "How does `@for` handle the empty collection case?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The `RepeaterCreate` IR op carries an optional `emptyView` xref. When the collection is empty at runtime, the `repeater` instruction creates the empty embedded view instead of the main repeater view — replacing the implicit `*ngFor` template behavior with an explicit `@empty` block."
      }
    },
    {
      "@type": "Question",
      "name": "What's the performance advantage of `@if`/`@for` over `*ngIf`/`*ngFor`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fewer intermediate objects (`TemplateRef`, `ViewContainerRef.createEmbeddedView()` call chain), no extra `<ng-template>` DOM node, and direct slot-index-based view management. The compiler produces smaller bundle size and the runtime has less change-detection overhead per conditional/repeater evaluation."
      }
    },
    {
      "@type": "Question",
      "name": "How does `HttpInterceptorFn` replace the class-based `HttpInterceptor` pattern?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's a plain function `(req, next) => Observable<HttpEvent>` registered via `withInterceptors()` in `provideHttpClient()` instead of the `HTTP_INTERCEPTORS` multi-provider token. The function runs inside `runInInjectionContext` so `inject()` works directly in the function body — no class, no `@Injectable` decorator, no constructor injection needed."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `HttpInterceptorHandler` deduplicate interceptors with `new Set(...)`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because `HTTP_INTERCEPTOR_FNS` and `HTTP_ROOT_INTERCEPTOR_FNS` can both contain the same functional interceptor if it was registered in both an `EnvironmentInjector` and the root injector. Without the `Set` deduplication, the same interceptor would run twice per request — a real bug, not a hypothetical."
      }
    },
    {
      "@type": "Question",
      "name": "What determines the execution order of interceptors in `withInterceptors([a, b, c])`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`reduceRight` wraps them right-to-left, producing a chain conceptually shaped as `c(b(a(backend)))`. Execution is left-to-right: `a` runs first on the outgoing request and last on the incoming response. The rightmost interceptor in the array is closest to the backend."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `untracked()` used when executing the interceptor chain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`HttpClient` uses Angular signals internally for application stability tracking. Without `untracked()`, the chain execution (including the backend HTTP call) would be tracked as a dependency by any `effect()` or `computed()` active when the request was dispatched, creating an accidental reactive dependency between unrelated application state and an HTTP request."
      }
    },
    {
      "@type": "Question",
      "name": "What's the consequence of an interceptor mutating `HttpRequest` directly instead of cloning it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`HttpRequest` is immutable — mutating it directly is a bug that silently corrupts the request for every downstream interceptor. Every modification must go through `req.clone({headers: ...})` to produce a new immutable request object."
      }
    },
    {
      "@type": "Question",
      "name": "How does the legacy class-based interceptor adapter work in the same pipeline as functional interceptors?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`legacyInterceptorFnFactory` injects all `HTTP_INTERCEPTORS`, builds a `ChainedInterceptorFn` linked list via `adaptLegacyInterceptorToChain`, and wraps the result as a single `HttpInterceptorFn`. The adapter reshapes the calling convention from `intercept(req, handler)` to the chain shape, but doesn't need `runInInjectionContext` because class interceptors already resolved dependencies through constructor injection."
      }
    },
    {
      "@type": "Question",
      "name": "What does non-destructive hydration do differently from destructive hydration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Instead of destroying the server-rendered DOM and re-creating it from scratch, Angular walks the live DOM tree, claims each node via `ngh` attribute annotations, and wires up event listeners, change detection, and component instances in-place. No DOM is mutated — existing nodes are claimed, not replaced."
      }
    },
    {
      "@type": "Question",
      "name": "What is the `ngh` attribute and how does `TransferState` use it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "During SSR, Angular annotates every component host element with an `ngh` attribute containing a numeric index. That index is a slot into the `__nghData__` array serialized inside `TransferState` as a `<script id=\"ng-state\">` tag. Each slot holds a `SerializedView` describing the component's view structure: root node count, disconnected nodes, embedded view sizes."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a CDN strips comment nodes from the server HTML?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`verifySsrContentsIntegrity()` scans `<body>` for the `<!--nghm-->` comment marker. If it's missing (stripped by CDN optimization), Angular throws `RuntimeErrorCode.MISSING_SSR_CONTENT_INTEGRITY_MARKER` and refuses to hydrate — because the `ngh` annotations it depends on may also have been stripped, making safe node claiming impossible."
      }
    },
    {
      "@type": "Question",
      "name": "What are the `enableLocateOrCreate*` function swaps and why are they tree-shakable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When `provideClientHydration()` is called, `enableHydrationRuntimeSupport()` swaps the default \"create\" code paths (`document.createElement()`, `document.createTextNode()`) with \"locate existing DOM node\" implementations that walk the live DOM. If hydration is never enabled, all these functions are eliminated from the production bundle — this is the tree-shaking boundary."
      }
    },
    {
      "@type": "Question",
      "name": "How does incremental hydration interact with `@defer` blocks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Incremental hydration serializes defer block metadata into `__nghDeferData__` and wires `jsaction` attributes on host elements. Each `@defer` block's hydration is deferred until its trigger fires (viewport, interaction, idle, timer) — the block's DOM is not claimed until then, managed by the `DEHYDRATED_BLOCK_REGISTRY`."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the `ngh` attribute removed after hydration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's scaffolding — only meaningful during the hydration pass. After the `DehydratedView` is extracted and stored on the `LView`, the attribute serves no purpose and would be noise in the browser's DOM inspector. Stripping it keeps the live DOM clean."
      }
    },
    {
      "@type": "Question",
      "name": "How does `ng build` get from a CLI command to the actual bundler?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The CLI reads `angular.json` to resolve the builder string (e.g., `@angular/build:application`), maps it to the `buildApplication()` function, feeds it your options, and lets the builder handle everything. The builder normalizes options, sets up esbuild bundler contexts, runs the Angular AOT compiler, and orchestrates the full build pipeline — you never touch webpack or esbuild directly."
      }
    },
    {
      "@type": "Question",
      "name": "What does `normalizeOptions()` do to your `angular.json` values?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It transforms raw options into a fully resolved internal form: relative paths become absolute (resolved against workspace root), `optimization: true` expands to `{ scripts: true, styles: { minify: true, inlineCritical: true }, fonts: { inline: true } }`, missing `outputPath` defaults to `dist/<projectName>`, and the `aot` flag controls AOT vs JIT mode (defaulting to `true`)."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `executeBuild()` create separate `BundlerContext` instances for TypeScript, global styles, and component styles?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each context can be independently invalidated and re-bundled during incremental rebuilds in watch mode. On the first build, fresh contexts are created; on rebuilds, they're reused and only changed files are re-bundled. The `SourceFileCache` persists TypeScript analysis across rebuilds to avoid redundant type-checking."
      }
    },
    {
      "@type": "Question",
      "name": "When does chunk optimization via Rollup/Rolldown actually run?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Only when `optimizationOptions.scripts` is enabled and the number of lazy chunks exceeds a configured threshold (`optimizeChunksThreshold`). Small projects skip the optimization pass entirely — it's gated behind the lazy chunk count, not applied unconditionally."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when you change the underlying bundler (webpack → esbuild) — do you need to update `angular.json`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. The builder is a higher-level abstraction that encapsulates the entire build tool plus Angular-specific compilation steps. Changing the underlying tool only requires changing the builder package — `angular.json`'s `builder` field stays the same. This is the entire point of the Architect builder system."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `assertCompatibleAngularVersion()` run before anything else in the builder?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The builder is tightly coupled to the Angular compiler version. Running a builder from Angular v19 against a v17 project (or vice versa) would produce silent compilation errors or incorrect output. The version check is a hard guard against mismatched toolchain versions."
      }
    },
    {
      "@type": "Question",
      "name": "Why does TestBed need a PlatformRef instead of just a DOM container?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The platform provides the root injector that supplies `NgZone`, `ApplicationRef`, `Compiler`, and all core Angular singletons. Without a `PlatformRef`, the test module has no parent injector, `TestBedCompiler.finalize()` has nothing to parent the test module under, and every `inject()` call for core services fails. TestBed is a full Angular bootstrap, miniaturized for a single test."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `initTestEnvironment()` throw on a second call instead of resetting?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The platform is a shared singleton that persists for the entire test session. Resetting it between tests would destroy `NgZone` and `ApplicationRef`, which are expensive to recreate and structurally identical across tests. Only the test module's declarations and providers need per-test isolation, which `resetTestingModule()` handles."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between `initTestEnvironment()` and `configureTestingModule()`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`initTestEnvironment()` is called once per suite and sets up the platform — it's the one-time bootstrap. `configureTestingModule()` is called per-test and configures declarations, imports, and providers for that test's dynamic test module. You can call `configureTestingModule` multiple times; `initTestEnvironment` only once."
      }
    },
    {
      "@type": "Question",
      "name": "How does `TestBedCompiler.finalize()` create the DI hierarchy for tests?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It creates an `NgModuleRef` with `this.platform.injector` as the parent injector. This makes the test module a child of the platform injector, so every `ComponentFactory.create()` call inside `createComponent()` resolves `NgZone`, `ApplicationRef`, and `ChangeDetectorRef` from the same injector tree a production app uses."
      }
    },
    {
      "@type": "Question",
      "name": "What's the mistake of assuming TestBed is a DOM mounting utility?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "TestBed is not a DOM container — `ComponentFactory.create()` does the real work, not DOM manipulation. The DOM element is inserted by `TestComponentRenderer`, but the *DI parent* for the component is `this.testModuleRef`. The DOM insertion is incidental; the injector hierarchy is load-bearing for component instantiation to succeed."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `resetTestingModule()` not destroy `NgZone` and `ApplicationRef`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because they're singletons provided by the platform, not by the test module. `resetTestingModule()` tears down only the test module's declarations and providers. The platform persists across tests, so `NgZone` and `ApplicationRef` are reused — this is why fixture teardown destroys components but doesn't recreate the zone."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `computed()` defer recomputation while `effect()` runs eagerly on creation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Computed values derive state — they produce nothing until someone reads the result, so computing eagerly wastes cycles on values nobody reads. Effects produce side effects — their entire purpose is to *do* something, so deferring them would mean missing the initial trigger they were registered to observe. Both use the same reactive graph, but the scheduling hook differs."
      }
    },
    {
      "@type": "Question",
      "name": "What is the `UNSET` sentinel and why isn't `null` used instead?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`UNSET` is `Symbol('UNSET')` so that `null`, `undefined`, and `0` are all valid computed values — a computed that legitimately returns `null` won't be mistaken for \"never computed.\" The `UNSET`/`COMPUTING`/`ERRORED` triple of sentinels is the state machine governing a computed's lifecycle, each triggering different behavior in `producerMustRecompute`."
      }
    },
    {
      "@type": "Question",
      "name": "What is the single point of divergence between computed and effect scheduling?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`consumerMarkedDirty`. `ComputedNode` inherits the default implementation from `REACTIVE_NODE` (which does nothing — just sets `dirty = true`). `VIEW_EFFECT_NODE` and `ROOT_EFFECT_NODE` override it to immediately schedule re-execution via the `ChangeDetectionScheduler`. Same graph, same dirty propagation, opposite consequences."
      }
    },
    {
      "@type": "Question",
      "name": "How does the epoch-based short-circuit in `producerUpdateValueVersion` make computed genuinely lazy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If `dirty` is `false` and `lastCleanEpoch === epoch`, the function returns immediately without recomputing. Even if `dirty` is `true`, `consumerPollProducersForChange` walks the dependency list and only recomputes if a version mismatch is found. A computed that was verified clean in the current epoch can skip recomputation entirely, preventing unnecessary re-polling of producer versions in a stable graph."
      }
    },
    {
      "@type": "Question",
      "name": "Can you force a `computed()` to be eager by wrapping it in an `effect()`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — `effect(() => { this.derived() });` reads the computed every time the effect runs, which forces the computed to recompute because reading the computed calls `producerUpdateValueVersion`. This is a deliberate pattern for computed values that need to always be current, though a computed with side effects is itself a design smell."
      }
    },
    {
      "@type": "Question",
      "name": "What's the risk of a deep `computed → computed → computed` chain for performance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`consumerMarkDirty` recurses through the whole chain on every source signal write. A single write can trigger many `consumerMarkDirty` calls for a deep chain. While no recomputation happens until read, the dirty-flag propagation itself has a cost that scales with chain depth and branching factor."
      }
    },
    {
      "@type": "Question",
      "name": "How does `@defer` create chunks differently from route-level lazy loading?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Route-level lazy loading splits an entire component (and its template) into a separate chunk when the router navigates. `@defer` splits a **sub-tree** of an already-loaded component's template into a separate chunk, loaded when a trigger fires within the same page. The bundling mechanism is identical (dynamic `import()`), but the granularity and trigger are different."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't `@defer` need an HTTP round-trip to discover the chunk URL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The chunk path is statically determined at build time. The compiler's `resolveDeferDepsFns` phase generates a `dependencyResolverFn` containing literal `import('./chunk-XYZ.js')` calls with paths baked in by the bundler. There is no runtime negotiation, no manifest lookup — the browser fetches a file whose path was determined during `ng build`."
      }
    },
    {
      "@type": "Question",
      "name": "What compiler phase generates the `dependencyResolverFn` and how does deduplication work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The `resolveDeferDepsFns` phase generates the resolver function. It calls `getSharedFunctionReference()` to ensure that if two `@defer` blocks in the same component share identical dependencies, they get a single shared resolver function — and the bundler produces one chunk, not two."
      }
    },
    {
      "@type": "Question",
      "name": "How does `@defer` respect `OnPush` change detection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The trigger calls `triggerDeferBlock()`, which notifies the scheduler via `NotificationSource.DeferBlockStateUpdate` — a typed notification that sets a specific dirty flag, not a Zone.js blanket notification. The parent `OnPush` component is only marked dirty when its own inputs or signal state change, not when the defer block transitions states."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a `@defer` block's dynamic import fails at runtime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The runtime catches the error and transitions the defer block to the `Error` state. If an `@error` block is defined, it is rendered. If not, the block stays in the `Loading` state with no visible content. The `LDeferBlockDetails` array stores cleanup functions that are invoked on error to clean up partial state."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between `dependencyResolverFn` in `TDeferBlockDetails` vs `LDeferBlockDetails`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`TDeferBlockDetails` is static — one per template, shared across all instances. `LDeferBlockDetails` is per-render instance. The resolver is stored in `TDeferBlockDetails` so the bundler splits it once, and every defer block using the same dependencies shares the same chunk reference."
      }
    },
    {
      "@type": "Question",
      "name": "How does `@loading (minimum 500ms)` work at the compiler/runtime level?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The compiler's `configureDeferInstructions` phase emits a `[loadingMinimumTime, loadingAfterTime]` const array into the constants table. The runtime reads this config and uses `ɵɵdeferEnableTimerScheduling` to freeze the block in the loading state for at least the specified duration, even if the chunk loads faster. The timer scheduling is tree-shakable because the compiler only emits the reference when these parameters are present."
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
