---
layout: post
title: "Angular Key Terms: Signals, DI, and the Framework Vocabulary Behind Every Post"
description: "A standalone glossary of Angular terms used across this blog's framework-internals posts — signals, change detection, dependency injection, zones, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: angular
order: 99
tags: [angular, glossary, signals, frontend]
---

**TL;DR:** This is the vocabulary reference for every Angular post on this blog. Each term below is written to stand alone — bookmark it and jump back whenever a later post uses a word you don't have pinned down.

## Reactivity

### Component
A component is the unit of UI in Angular: a TypeScript class decorated with `@Component` that pairs a selector, a template, and a styles array, plus an HTML element injected into the DOM on render. It owns a view instance (`LView`) at runtime and exposes public fields and methods the template binds to. Components are the nodes that the change-detection graph walks and the router mounts.

### Template
The template is the HTML bound to a component, compiled by Angular into a `TemplateDefinition` (Ivy) that drives creation and update instructions on the component's `LView`. It supports interpolation, property/event bindings, structural directives, and two-way binding, all rewritten into Ivy's `ɵɵelementStart` / `ɵɵtext` / `ɵɵproperty` instruction calls. The template is not markup at runtime — it is executable render logic.

### Directive
A directive is a class that attaches behavior to the DOM: structural directives (`*ngIf`, `*ngFor`) manipulate the view tree, while attribute directives (`ngModel`, `routerLink`) modify an existing element. In Ivy each directive gets its own `LView` slot and its own set of host bindings, and the component itself is just a directive with a template. Directives are how Angular extends HTML without new elements.

### Pipe
A pipe is a pure or impure transform applied in a template with the `|` syntax, implemented as a class with a `transform()` method. Pure pipes are memoized by input value and only re-run when inputs change, so they are safe inside change detection; impure pipes run on every CD cycle and are a common performance trap. The `AsyncPipe` is the bridge that subscribes to an Observable and feeds its latest emission into the view.

### Signal
A signal is a reactive primitive — `signal(value)` returns a getter function that, when read inside a reactive context (a computed, an effect, or a template), registers a dependency in Angular's reactivity graph. Writing it via `set`/`update` notifies only the dependents, enabling targeted, fine-grained updates instead of traversing the whole component tree. Signals are the foundation of zoneless change detection in modern Angular.

### Computed signal
A `computed(() => ...)` is a read-only, lazily-evaluated signal derived from other signals; it only recomputes when one of its dependencies changes and is memoized until then. Reading a computed inside another computed or an effect wires the dependency edge automatically through the same reactivity graph that plain signals use. It replaces the old pattern of deriving state in a method called manually during change detection.

### Effect
`effect(() => { ... })` schedules a side-effecting callback that re-runs whenever any signal it reads changes, and is the sanctioned place for imperative work like logging, DOM measurement, or syncing non-Angular state. Effects run in an injection context by default and can be scoped with `allowSignalWrites` to permit signal writes inside them. Unlike a computed, an effect does not return a value usable by other reactive code.

## Change detection & rendering

### Zone.js
Zone.js is a monkey-patched execution context that intercepts async APIs (`setTimeout`, `Promise.then`, `addEventListener`, XHR) so Angular can be notified after any turn of the event loop. It forms a tree of zones and fires `onMicrotaskEmpty` when the current task and its microtasks drain, which is the trigger Angular uses to schedule a change-detection pass. Running without it is "zoneless" mode, where signals drive updates directly.

### NgZone
`NgZone` is Angular's wrapper around the root zone that exposes `run()` and `runOutsideAngular()` so you can choose whether a piece of code should trigger change detection. `runOutsideAngular` is the escape hatch for high-frequency events (scroll, mousemove, third-party libs) that would otherwise thrash the CD cycle. The framework's own `ApplicationRef.tick()` is scheduled off the zone's `onMicrotaskEmpty` event.

### Change detection
Change detection is the process of walking the component view tree and reconciling the template's bound expressions against current model state, writing changed values to the DOM. In default mode Angular checks every component on every tick; it uses the `LView` flags (e.g. `LViewFlags.Dirty`) to decide whether a node needs processing. A successful run clears the dirty flag and the `CheckAlways` state until the next trigger.

### OnPush
`ChangeDetectionStrategy.OnPush` tells Angular to skip a component's subtree during a tick unless it is marked dirty — which happens when an `@Input` reference changes, an event originates from the component or its children, or a signal read in its template changes. It converts change detection from "check everything" to "check only what could have changed," which is why OnPush and signals pair so well. Used wrong, it produces the classic "UI didn't update" stale-state bug.

## Dependency injection

### Dependency injection
Dependency injection is Angular's mechanism for supplying a class with its collaborators instead of constructing them itself; a service declared in a provider is created and passed into a component's constructor by the framework. This inverts control, makes classes testable with fakes, and centralizes the wiring of cross-cutting services. The injector tree mirrors the component tree, so where a provider is declared determines its lifetime.

### Injector
An injector is the runtime object that resolves a token to an instance, holding provider records and caching singletons it has already created. Angular maintains a hierarchical injector tree: each component and NgModule gets one, and resolution walks upward until it finds the provider or hits the root. `Injector.get(token)` is the low-level lookup; `inject()` is the ergonomic, injection-context version.

### Provider
A provider is the recipe the injector uses to create or return a value for a token — `providers: [MyService]` is shorthand for `{ provide: MyService, useClass: MyService }`. You can also alias to another token (`useExisting`), supply a constant (`useValue`), or run a factory (`useFactory`). Where you list the provider decides the scope: root, a specific NgModule, or a single component.

### DI token
A DI token is the key used to look a dependency up — typically the class type itself, but `InjectionToken` provides a typed, string-named key for values that have no class (config objects, strings, interfaces). Tokens allow multiple different values to be provided under distinct keys and are what makes optional/multi providers possible. `@Optional()` and `@Self()`/`@SkipSelf()` are modifiers that change how the injector resolves a token.

### Standalone component
A standalone component declares `standalone: true` and lists its own `imports` (other standalone components, directives, pipes) instead of belonging to an NgModule, removing the NgModule ceremony for most apps. It can be bootstrapped directly or used in routes via `loadComponent`. Since Angular 19 standalone is the default authoring style, and NgModules are now opt-in rather than mandatory.

## Modules & structure

### Module (NgModule)
An `NgModule` is a declarative grouping of components, directives, and pipes plus a `providers` list and `imports`/`exports` of other modules, originally the unit of compilation and DI scope. `BrowserModule` and `CommonModule` are the foundational ones, and `declarations` registered components with the compiler. Standalone components have made most NgModules optional, but they still matter for library authoring and fine-grained provider scoping.

### Router
The `Router` is Angular's service that maps a URL to a component tree, managing navigation, route params, query params, and the outlet where the activated component renders. It builds a `RouterState` snapshot and drives `router-outlet` placeholders in the template. Guards (`canActivate`, `canMatch`) and resolvers run during navigation to gate or pre-fetch data.

### Route
A route is a configuration object — `{ path, component | loadComponent, children, ... }` — that the router matches against the current URL to decide what to render. Child routes compose into nested `router-outlet` hierarchies, and `pathMatch`/`matcher` tune how segments are compared. Routes are the declarative spine of an Angular app's navigation.

### Lazy loading
Lazy loading defers loading a feature's code until its route is first visited, typically via `loadComponent: () => import('./feature/feature.component')` or the older `loadChildren` for NgModule-based features. This shrinks the initial bundle because Webpack/Vite split those imports into separate chunks fetched on demand. It is the primary lever for keeping an Angular app's first load fast.

## Async & forms

### RxJS
RxJS is the reactive-extensions library Angular uses for asynchronous streams; an `Observable` represents a lazy sequence of values over time that you subscribe to. Angular's `HttpClient` returns Observables, and `AsyncPipe` bridges them into templates, while operators (`map`, `switchMap`, `debounceTime`) compose stream transformations. Understanding the subscribe/unsubscribe lifecycle is mandatory to avoid memory leaks.

### Observable
An Observable is a callable that, when subscribed, pushes zero-to-many values to an observer via `next`/`error`/`complete`, and is cold by default (each subscribe re-runs the producer). It is how Angular models HTTP responses, route changes, and form value streams before signals absorbed much of that role. Mixing Observables and signals usually goes through `toSignal()` or `toObservable()`.

### Reactive forms
Reactive forms build a typed tree of `FormControl`, `FormGroup`, and `FormArray` in component code, with the template bound via `formControlName` and `formGroup` directives rather than template-driven `[(ngModel)]`. The `FormControl` holds value, validity, and dirty state, and emits value-changes as an Observable you can react to. This model is the recommended approach for anything beyond trivial forms because validation and testing live in code, not the template.

## Rendering internals

### Content projection
Content projection (`<ng-content>`) lets a component render the caller-supplied children passed between its tags, with `select` attributes routing specific elements to specific slots. At compile time the projected nodes are assigned to `LView` slots and re-associated with the consuming component's injector for binding. It is Angular's mechanism for composable, wrapper-style components like cards, modals, and layout primitives.

### Lifecycle hooks
Lifecycle hooks are callback methods the framework invokes at defined points — `ngOnInit` after first input binding, `ngOnChanges` on input changes, `ngAfterViewInit` after the view is initialized, `ngOnDestroy` for cleanup. They are the sanctioned seams for fetching data, subscribing, and unsubscribing so you don't leak resources. `ngOnChanges` is the OnPush-friendly signal that inputs changed; `ngOnDestroy` is where RxJS subscriptions must be torn down.

### AOT compilation
Ahead-of-Time (AOT) compilation runs the Angular compiler at build time, turning templates and decorators into efficient `ɵɵ` Ivy instructions baked into the bundle instead of interpreted at runtime. This catches template type errors before shipping, shrinks the runtime (no compiler shipped to the browser), and is the default for production builds. The older JIT mode compiled in the browser and is now only used for dev tooling and dynamic scenarios.

### Ivy
Ivy is Angular's current rendering and compilation engine, introduced to replace View Engine, that represents each component as an `LView` array of nodes, bindings, and context. Its instruction-based design enables tree-shakable, locality-based compilation where each component compiles independently. Ivy is what makes standalone components, signals, and zoneless mode possible under one runtime.

### Zoneless
Zoneless is the opt-in mode where Angular no longer relies on Zone.js to know when to run change detection; instead, signals, `markForCheck`, and explicit `ChangeDetectorRef` calls schedule updates. It removes the Zone.js patch overhead and the awkward `runOutsideAngular` dance, and makes reactivity explicit and traceable. Enabling it is a matter of providing `provideExperimentalZonelessChangeDetection()` (or its stable successor) at the root.

That's the vocabulary. Keep this open in a tab — the framework-internals posts reference these terms constantly, and the 101 below is where they first get wired together.




