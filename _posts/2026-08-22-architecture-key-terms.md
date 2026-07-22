---
layout: post
title: "Software Architecture Key Terms: Layered, Hexagonal, Clean — the Architecture Vocabulary Behind Every Post"
description: "A standalone glossary of the software-architecture terms used across this blog's layered, hexagonal, clean, modular-monolith, event-driven, and data-intensive posts — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: architecture
order: 99
tags: [architecture, glossary, design]
---

**TL;DR:** This is the reference page for the architecture vocabulary used throughout this blog's styles, quality-attribute, and boundary posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

The posts in this domain assume you already know what a port is, what "inward-pointing dependencies" means, or why a producer's schema change can break a consumer. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Architectural styles

### Layered (N-tier) architecture
A system is split into horizontal layers (Presentation, Application, Domain, Infrastructure) where each talks only to the one directly below it, making dependencies easy to draw and easy to enforce with project references. Strict downward dependencies eventually break, because the Domain needs capabilities only Infrastructure can provide — fixed by Domain *defining* the interface it needs (`IOrderRepository`) and Infrastructure *implementing* it, so the compile-time reference points inward even though the runtime call flows outward.
Deep dive: [Layered (N-tier) Architecture]({{ '/architecture/layered-n-tier-architecture-and-its-limits/' | relative_url }})

### Hexagonal architecture (ports & adapters)
Business logic sits at the center, defining its own needs as **ports** (interfaces in the domain's vocabulary) and letting infrastructure satisfy them as **adapters** (the `how` — EF Core, a message bus). The mechanism that enforces the decoupling isn't the interface split alone but the *project boundary*: the domain project holds zero reference to the infrastructure package, so a `using Microsoft.EntityFrameworkCore;` inside domain code fails to compile rather than merely looking wrong in review.
Deep dive: [Hexagonal Architecture]({{ '/architecture/hexagonal-architecture-ports-adapters-compiler-enforced/' | relative_url }})

### Clean architecture
A dependency-rule variant where business logic stays at the center and *use cases* are folded into their own folders (command + handler + validator together) instead of being scattered across technical `Controllers/`/`Services/` folders. Its precise twist on the dependency rule: the Application layer may reference the base, provider-agnostic ORM package to describe `DbSet<T>` in its own interface, but no concrete database *provider* package — swapping PostgreSQL for SQL Server touches only Infrastructure.
Deep dive: [Clean Architecture]({{ '/architecture/clean-architecture-use-case-folders-and-abstraction-vs-provider/' | relative_url }})

### Modular monolith & microservices
A modular monolith enforces genuine module boundaries (separate `Domain`/`Application`/`Infrastructure` projects per module) inside a single deployable, so cross-module communication happens only through published integration-event contracts. Because the transport is a swappable `IEventsBus` interface, going distributed later is a composition-root-only change (swap `InMemoryEventBusClient` for a RabbitMQ client) — none of the modules' business logic changes.
Deep dive: [Modular Monolith vs Microservices]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})

### Serverless (FaaS) architecture
Compute is deployed as functions the platform scales and runs on demand, with expensive one-time setup moved outside the request handler so warm environments reuse that work — at the cost of a real cold-start latency tax on new environments. Snapshotting an already-initialized environment (AWS Lambda SnapStart) skips that tax but creates a new bug class: anything meant to be unique *per environment* (a GUID, a fresh handle) must be regenerated in an explicit after-restore hook, or every restored copy silently shares the snapshot's value.
Deep dive: [Serverless SnapStart]({{ '/architecture/serverless-snapstart-restore-hooks-per-environment-state/' | relative_url }})

### Space-based architecture
A central database is replaced by a dataset partitioned across many nodes' RAM, so the defining move is routing *computation* to wherever the data already lives rather than pulling data to the compute. A deterministic affinity function maps each key to its owning partition; grouping keys by partition first turns N network round trips into one task per owning node, each computing a local partial result that travels back for combination.
Deep dive: [Space-Based Architecture]({{ '/architecture/space-based-architecture-affinity-collocated-compute/' | relative_url }})

### Plugin / microkernel architecture
A minimal core defines a stable, versioned plugin protocol and launches each extension as its own independent process — not a library loaded into the core's memory — communicating over RPC so a crashing plugin can't take down the whole host. A handshake secret (Terraform's `TF_PLUGIN_MAGIC_COOKIE`) gates whether a binary will even start serving, proving it was launched specifically as that host's plugin rather than run by accident.
Deep dive: [Plugin / Microkernel Architecture]({{ '/architecture/plugin-microkernel-architecture-terraform-provider-handshake/' | relative_url }})

### Pipe-and-filter architecture
Processing is an ordered chain of independent **filters**, each receiving data, doing one job, and handing the result onward — so steps are addable, removable, and reorderable without coupling to each other. The mechanism that makes it survive real pipelines: each filter returns an explicit status (`Continue`, `StopIteration`, `StopAllIterationAndBuffer`) that the chain manager uses to advance, halt, or buffer — letting one filter pause the whole pipe for an async call and resume later via `continueDecoding()` from outside the original stack.
Deep dive: [Pipe-and-Filter Architecture]({{ '/architecture/pipe-and-filter-architecture-envoy-filter-status/' | relative_url }})

### Event-driven architecture
Producers and consumers communicate by publishing and subscribing to events on a broker, decoupling them in the *network* dimension (no consumer host to know, no blocking, independent deploy schedules). The broker only decouples the wire, not the data contract — that's fixed by treating the event schema as a versioned, registry-enforced contract and by choosing whether an event carries just an ID (event notification) or the full state a consumer needs (event-carried state transfer).
Deep dive: [Event-Driven Architecture]({{ '/architecture/event-driven-architecture-event-schemas-as-the-real-decoupling-boundary/' | relative_url }})

### Data-intensive architecture (Lambda & Kappa)
A system whose product *is* moving and transforming data at scale needs both a fresh fast view and a correct complete view. The old **Lambda** architecture paid for that with two separate codebases (batch + speed layers) that had to stay logically in sync; a unified engine like Spark Structured Streaming collapses them into **Kappa** — the same DataFrame query runs against a bounded batch source (`read`) or an unbounded streaming source (`readStream`), differing only in the source and a checkpoint.
Deep dive: [Data-Intensive Architecture]({{ '/architecture/data-intensive-architecture-spark-structured-streaming-lambda-vs-kappa/' | relative_url }})

### Micro-frontends
Splitting a frontend by team the way you split a backend runs into a wall backends don't: every "micro-frontend" still shares one browser tab, one DOM, and usually one framework instance. Webpack Module Federation solves dependency duplication by negotiating shared, singleton dependencies at *runtime* (a `remoteEntry.js` manifest + `requiredVersion`), while single-spa solves "which app is active" with an explicit lifecycle state machine driven by `activeWhen(location)`.
Deep dive: [Micro-Frontends]({{ '/architecture/micro-frontends-module-federation-shared-singletons-vs-single-spa-lifecycle/' | relative_url }})

## Quality attributes

### Non-functional requirements & quality-attribute tradeoffs
"Fast" and "durable" are often in direct tension at the exact same point in a system, with no single correct answer — a session cache can lose a second of writes, a ledger cannot. The discipline is to expose that tradeoff as a configuration knob whose real consequences are documented at the point of choice (Redis's `appendfsync no | everysec | always`, defaulting to the named compromise), and to remember that tradeoffs *compound* across interacting settings rather than holding statically.
Deep dive: [NFR & Quality-Attribute Tradeoffs]({{ '/architecture/nfr-quality-attribute-tradeoffs-redis-fsync/' | relative_url }})

### Evolutionary architecture & fitness functions
A codebase changes on every commit, so an architecture rule verified true on day one has no guarantee of staying true unless something re-checks it. A **fitness function** turns a structural rule into an executable test that runs in the same pipeline as every other test — ArchUnit analyzes *compiled bytecode* and fails the build loudly, naming exactly which class broke which layer boundary, the moment vigilance lapses.
Deep dive: [Evolutionary Architecture & Fitness Functions]({{ '/architecture/evolutionary-architecture-fitness-functions-archunit/' | relative_url }})

### Architecture Decision Records (ADRs)
A small, dated, immutable record per decision with a fixed structure — Title (imperative), Status (`Proposed`/`Accepted`/`Superseded`/`Deprecated`), Context, Decision, Consequences. Once accepted, an ADR is never edited in place; a changed mind produces a *new*, separately dated record that supersedes the old one, preserving the actual sequence of reasoning rather than collapsing it into whatever the page says today.
Deep dive: [Architecture Decision Records]({{ '/architecture/architecture-decision-records-immutable-history/' | relative_url }})

### C4 model & architecture diagramming
C4 describes a system at four zoom levels (Context → Container → Component → Code) by defining its elements and relationships exactly once as a single **model**. Diagrams are declared as **views** — filtered projections of that model — so a node added or renamed once propagates to every view automatically; diagrams are generated from one source of truth, never independently hand-drawn, which is what stops two zoom levels from drifting apart.
Deep dive: [C4 Model]({{ '/architecture/c4-model-one-source-multiple-diagrams/' | relative_url }})

## Boundaries & coupling

### Coupling vs cohesion
**Coupling** is how tightly two modules depend on each other's internals — high coupling means changing one forces changing another; **cohesion** is how strongly the responsibilities inside one module belong together — high cohesion means a module does one related thing. Good boundaries maximize cohesion within a module and minimize coupling across modules, which is the real goal behind every style in this glossary, from layers to microservices.
Deep dive: [Layered (N-tier) Architecture]({{ '/architecture/layered-n-tier-architecture-and-its-limits/' | relative_url }})

### Dependency inversion
Instead of high-level logic depending on low-level detail, both depend on an *abstraction* the high-level side owns — so the compile-time reference points from detail toward policy, never the reverse. Concretely, Domain declares `IOrderRepository` and Infrastructure implements it; the runtime call still flows Domain → persistence, but Infrastructure now references Domain, keeping core business logic free of database or framework knowledge.
Deep dive: [Clean Architecture]({{ '/architecture/clean-architecture-use-case-folders-and-abstraction-vs-provider/' | relative_url }})

### Ports & adapters boundary (compiler-enforced)
The hexagonal boundary is only real if the *project graph* enforces it, not just a naming convention: the domain/Application project must have zero package or project reference to the infrastructure it's decoupled from. A build server then rejects any stray infrastructure import mechanically, which is why a domain unit test can construct an `Order` and assert on it with no database and no `Ordering.Infrastructure` reference anywhere in its graph.
Deep dive: [Hexagonal Architecture]({{ '/architecture/hexagonal-architecture-ports-adapters-compiler-enforced/' | relative_url }})

### Integration events & contract-first module boundaries
In a modular monolith, each module publishes its need to talk to others only through a separate `IntegrationEvents` contract project that other modules may reference — never the originating module's `Domain`, `Application`, or `Infrastructure`. That contracts-only reference restriction, checkable directly from `.csproj` files, is what makes the module boundary an enforceable project rule rather than a folder-naming hope, and what makes a later split mechanical.
Deep dive: [Modular Monolith vs Microservices]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})

### Bounded context
A bounded context is a explicit boundary within which a particular domain model is defined and meaningful, so the same word ("Order", "Customer") can mean different things in different contexts without colliding. In a DDD modular monolith each module is effectively its own bounded context; cross-context communication goes through published integration-event contracts rather than shared mutable entities, which is what keeps one context's model from leaking into and corrupting another's.
Deep dive: [Modular Monolith vs Microservices]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})

### Anti-corruption layer
When a system must integrate with an external model whose vocabulary and structure differ from its own, an anti-corruption layer sits between them and translates, so the foreign model never leaks into the local domain. It's the practical护栏 that keeps a bounded context's internal model pure even while consuming another system's events or APIs — the same contract-first discipline a modular monolith enforces between its own modules, extended across an organizational boundary.
Deep dive: [Modular Monolith vs Microservices]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})

### Event schema as the real decoupling boundary
The broker decouples deployment and availability; the *schema* decouples the data contract — and they are different mechanisms solving different failure modes. Confluent's Schema Registry embeds a schema ID inside every message so a consumer can fetch the exact writer's schema and deserialize correctly even having never seen the producer's code; compatibility rules enforced at registration reject a breaking change *before* a malformed message reaches a topic.
Deep dive: [Event-Driven Architecture]({{ '/architecture/event-driven-architecture-event-schemas-as-the-real-decoupling-boundary/' | relative_url }})

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.




