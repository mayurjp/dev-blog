---
layout: post
title: "Design Patterns Key Terms: SOLID, DI, and the OO Vocabulary Behind Every Post"
description: "A standalone glossary of the design-patterns vocabulary used across this blog's OO and architecture posts — Factory, Strategy, Observer, Decorator, Adapter, Repository, Unit of Work, DI, IoC, SOLID, Circuit Breaker, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: design-patterns
order: 99
tags: [design-patterns, glossary, oop]
---

**TL;DR:** This is the reference page for the object-oriented and architectural vocabulary used throughout this blog's design-patterns posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

The posts in this domain assume you already know what a Strategy or a Repository is. If a term lands cold, find it here first. The list is grouped by theme (Creational, Structural, Behavioral, Principles, Concurrency, Architectural), not alphabetically, because these concepts build on each other.

## Creational

### Factory Method
A factory method hides object creation behind an interface (`Create...()`), so callers depend on the factory abstraction rather than `new SomeConcreteType()` directly. The concrete factory decides *how* an instance is produced — fresh allocation versus a recycled instance from a pool — and swapping the registered implementation is a configuration change, not a code change at any call site. Deep dive: [Factory Method & Abstract Factory]({{ '/design-patterns/factory-method-and-abstract-factory/' | relative_url }}).

### Abstract Factory
An abstract factory is a factory whose products come in coordinated families, so a client requests "a set of compatible objects" through one interface without knowing which concrete family it receives. In modern practice the heavyweight GoF class hierarchy collapses into a single generic factory interface with a few interchangeable DI-selected implementations — the principle (depend on an abstraction, not a constructor) survives, the machinery mostly doesn't. Deep dive: [Factory Method & Abstract Factory]({{ '/design-patterns/factory-method-and-abstract-factory/' | relative_url }}).

### Builder
A builder accumulates configuration through a chain of fluent methods that each return the same builder instance, enabling one coherent setup statement instead of a constructor with dozens of positional parameters. Production builders add a second layer: the configuration data underneath is *immutable* — every `With...()` call produces a brand-new extension object rather than mutating the old one — so a cached options object can be shared by many consumers without any of them corrupting the others' configuration. Deep dive: [Builder Pattern]({{ '/design-patterns/builder-pattern-fluent-immutable-options/' | relative_url }}).

### Singleton
A Singleton guarantees exactly one instance for a process lifetime, which is genuinely right for stateless, thread-safe shared resources (a connection pool, a cache client) but an anti-pattern for request-scoped state. In a concurrent, request-scoped system a Singleton that captures a scoped dependency (e.g. a per-request `DbContext`) silently shares that state across every request and corrupts data — which is why DI containers validate and reject such captive dependencies at startup. Deep dive: [Singleton Anti-Pattern]({{ '/design-patterns/singleton-anti-pattern-and-di-lifetime-validation/' | relative_url }}).

## Structural

### Adapter
An Adapter translates an existing, incompatible interface into the shape its callers expect, without those callers branching on which implementation is active. Django's `BaseDatabaseOperations` defines one interface (`quote_name`, `date_trunc_sql`, ...) and each database backend implements it to reconcile its genuinely different SQL dialect, so the ORM's query builder calls one method uniformly and never knows which database answered. Deep dive: [Adapter Pattern]({{ '/design-patterns/adapter-pattern-database-backends/' | relative_url }}).

### Decorator
A Decorator wraps an object behind the same interface it implements, adding behavior before, after, or around the wrapped call and delegating inward — so behaviors compose by nesting, and nesting order is itself a behavioral decision. Polly's resilience policies each implement the same strategy interface and call the wrapped delegate internally, so Retry outside CircuitBreaker re-checks the breaker on every attempt, while the reverse treats the whole retry sequence as one unit. Deep dive: [Decorator Pattern]({{ '/design-patterns/decorator-pattern-policy-wrapping/' | relative_url }}).

## Behavioral

### Strategy
The Strategy pattern defines one minimal common contract and puts each interchangeable algorithm behind a class that implements it, so the context holds only the abstraction and never branches on which strategy it has. Because every strategy honors the same contract they compose — a pipeline can stack several — and the caller's `Execute()` call is unchanged no matter how many are nested. Deep dive: [Strategy Pattern]({{ '/design-patterns/strategy-pattern-pluggable-behavior/' | relative_url }}).

### Observer
The Observer pattern lets a subject notify many subscribers of an event without knowing who they are, by holding a list of observer references it iterates on each notification. The textbook `List<Observer>` isn't thread-safe; production reactive libraries make the observer list an *immutable* array swapped atomically with `Interlocked.CompareExchange`, so publishing only needs one lock-free read and concurrent subscribe/unsubscribe build new arrays for future reads. Deep dive: [Observer Pattern]({{ '/design-patterns/observer-pattern-lock-free-subjects/' | relative_url }}).

### Command
The Command pattern represents each request as an object (a struct or class carrying a function pointer plus metadata), so a generic execution path can dispatch through one uniform call regardless of which command runs. Redis models all 200+ commands as a `redisCommand` struct with a `proc` function pointer; the dispatch code sets flags, times, and logs once around the single `c->cmd->proc(c)` line, decoupling infrastructure from an ever-growing set of handlers. Deep dive: [Command Pattern]({{ '/design-patterns/command-pattern-redis-dispatch/' | relative_url }}).

### Chain of Responsibility
Chain of Responsibility passes a request along a chain of handlers, each deciding whether to act and whether to forward to the next, so no handler holds a reference to the others. ASP.NET Core's middleware pipeline is one nested `RequestDelegate` built by iterating registrations *backwards* — each middleware wraps "the rest of the pipeline" — so the first-registered middleware ends up outermost and forward execution order emerges from reverse-built closures. Deep dive: [Chain of Responsibility]({{ '/design-patterns/chain-of-responsibility-middleware-pipeline/' | relative_url }}).

### Circuit Breaker
A Circuit Breaker is a state machine that stops calling a failing dependency after a failure threshold, then cautiously probes for recovery, protecting both caller and dependency. Polly's real breaker has four states — Closed, Open, HalfOpen, and a manually-triggered Isolated — and throws distinct `BrokenCircuitException` (automatic trip) versus `IsolatedCircuitException` (operator action) so monitoring can tell an incident from deliberate maintenance. Deep dive: [Circuit Breaker]({{ '/design-patterns/circuit-breaker-state-machine/' | relative_url }}).

## Principles

### Inversion of Control
Inversion of Control (IoC) is the principle that a framework, not the application, owns the flow of control and calls into your code — pushing the "who creates and wires dependencies" question out of your classes and into a container. In DI containers this shows up concretely as the container walking constructor parameters to build the object graph on your behalf. Deep dive: [Dependency Injection]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }}).

### Dependency Injection
Dependency Injection is the practice of a class declaring what it needs through its constructor and letting a container supply it, so dependencies are received rather than constructed internally. A real container sorts a type's constructors by parameter count (most first) and picks the first fully-resolvable one, and tracks the chain of services currently being resolved to detect and fail fast on circular dependencies instead of overflowing the stack. Deep dive: [Dependency Injection]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }}).

### SOLID
SOLID is five design principles — Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, and Dependency Inversion — that keep OO modules cohesive, substitutable, and decoupled. The "D", Dependency Inversion (depend on abstractions, not concretions), is exactly what [Dependency Injection]({{ '/design-patterns/dependency-injection-constructor-selection-and-cycles/' | relative_url }}) puts into practice at the wiring level.

### Service Lifetimes & Captive Dependencies
A DI container manages three lifetimes — Singleton (one instance, process-wide), Scoped (one instance per logical unit of work such as a request), and Transient (a new instance per resolution) — and the mismatch between them is a real bug class. A Singleton that transitively depends on a Scoped service captures that per-request state and shares it across every request; containers catch this by walking the full dependency tree and throwing at validation time rather than corrupting data under concurrent load. Deep dive: [Singleton Anti-Pattern]({{ '/design-patterns/singleton-anti-pattern-and-di-lifetime-validation/' | relative_url }}).

### Repository
A Repository is a narrow, domain-shaped interface (e.g. `IOrderRepository`) that encapsulates the correct way to load and save a specific aggregate, hiding the persistence technology from domain code. Its real value isn't just hiding the ORM — it centralizes "load this aggregate *completely*" (eager-loading related collections) in one place so no caller can silently get a half-loaded object. Deep dive: [Repository Pattern]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }}).

### Aggregate
An Aggregate is a cluster of domain objects treated as one consistency unit, with a single root that guards its invariants and is the only thing external code may reference. Loading it correctly means loading its related parts together — the `Order` aggregate isn't really loaded unless its `OrderItems` are — which is why a repository's `GetAsync` explicitly eager-loads the children rather than returning a bare root. Deep dive: [Repository Pattern]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }}).

### Unit of Work
Unit of Work tracks a set of operations against a data store and commits them as one atomic transaction, so multiple repository changes participate in a single save rather than each committing independently. In eShop the repository exposes the same `DbContext` as an `IUnitOfWork`; `Add`/`Update` only stage changes, and nothing persists until `SaveEntitiesAsync()` is called. Deep dive: [Repository Pattern]({{ '/design-patterns/repository-pattern-aggregate-loading/' | relative_url }}).

## Concurrency

### Producer-Consumer
The Producer-Consumer pattern puts a bounded queue between producers that create work and consumers that process it, decoupling their rates and letting either side suspend (not busy-spin) when the queue is full or empty. The bounded queue's real job is the *signal* that coordinates the two sides, not storage — an unbounded queue with no backpressure just defers a memory-exhaustion failure. Deep dive: [Concurrency Patterns]({{ '/design-patterns/concurrency-patterns-producer-consumer-reader-writer-thread-pool/' | relative_url }}).

### Reader-Writer Lock
A Reader-Writer lock allows many concurrent readers but gives writers exclusive access, so read-mostly structures stop serializing readers behind each other. Production implementations (e.g. `ReaderWriterLockSlim`) pack the reader count and the writer-held flag into a single `uint` (`WRITER_HELD` as the top bit) so one atomic comparison checks both facts, avoiding a third lock that would defeat the purpose. Deep dive: [Concurrency Patterns]({{ '/design-patterns/concurrency-patterns-producer-consumer-reader-writer-thread-pool/' | relative_url }}).

### Thread Pool & Work-Stealing
A thread pool reuses a fixed set of worker threads instead of spawning a raw OS thread per task, avoiding the megabyte-of-stack and scheduler cost that makes thread-per-task collapse under load. .NET's pool gives each worker its own local queue and only falls back to a shared global queue — or steals from a peer's queue — when local work runs out, keeping most synchronization off the contended shared structure. Deep dive: [Concurrency Patterns]({{ '/design-patterns/concurrency-patterns-producer-consumer-reader-writer-thread-pool/' | relative_url }}).

## Architectural (Microservices)

### Sidecar
A Sidecar is a helper process deployed alongside the main application (same pod/host) that owns cross-cutting concerns so the app's code stays simple. `cloud-sql-proxy` runs as a sidecar listening on `127.0.0.1` and dials Cloud SQL with IAM auth the application never sees — upgrading the auth mechanism means shipping a new proxy binary, not touching app code. Deep dive: [Microservices Patterns as Code]({{ '/design-patterns/microservices-patterns-as-code-sidecar-ambassador-bff-event-driven/' | relative_url }}).

### Ambassador
An Ambassador is a sidecar whose role is to proxy outbound calls on the app's behalf, owning TLS, token exchange, and cert rotation for a remote dependency. The same `cloud-sql-proxy` binary is both a sidecar (topology) and an ambassador (role): the app opens a plain local socket and the ambassador does the real authenticated network work on the other side. Deep dive: [Microservices Patterns as Code]({{ '/design-patterns/microservices-patterns-as-code-sidecar-ambassador-bff-event-driven/' | relative_url }}).

### BFF (Backend-for-Frontend)
A BFF is a dedicated aggregator controller per client type that fans out to several backend services and returns one response shaped for that specific client. It is deliberately *not* a generic API gateway — a mobile BFF and a web BFF are allowed to shape responses differently, and branching its response by `clientType` is the anti-pattern it exists to avoid. Deep dive: [Microservices Patterns as Code]({{ '/design-patterns/microservices-patterns-as-code-sidecar-ambassador-bff-event-driven/' | relative_url }}).

### Event-Driven
Event-Driven decoupling means a producer publishes a typed message and knows nothing about who consumes it; consumers implement a narrow marker interface the broker discovers and invokes. MassTransit's `IConsumer<T>` carries zero knowledge of how `Consume` gets called — adding consumer #4 is a zero-change operation for the producer, because discovery and dispatch live entirely in the broker's machinery. Deep dive: [Microservices Patterns as Code]({{ '/design-patterns/microservices-patterns-as-code-sidecar-ambassador-bff-event-driven/' | relative_url }}).

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.
