---
layout: post
title: "Domain-Driven Design Key Terms: Bounded Context, Aggregate, and the Modeling Vocabulary Behind Every Post"
description: "A standalone glossary of the DDD terms used across this blog's modeling, strategic-design, and persistence posts — entity, value object, aggregate, aggregate root, domain event, ubiquitous language, bounded context, context map, repository, event sourcing, CQRS, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: ddd
order: 99
tags: [ddd, glossary, modeling]
---

**TL;DR:** This is the reference page for the Domain-Driven Design vocabulary used throughout this blog's strategic-design, tactical-modeling, and persistence posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

The posts in this domain assume you already know what an aggregate root or a bounded context is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Building blocks

### Entity
An Entity is an object whose identity is its distinguishing property — two entities are equal if and only if their `Id` matches, regardless of how their other fields differ. Equality is implemented at the base-class level (same runtime type + same id, explicitly excluding not-yet-persisted "transient" entities that would otherwise all share a default id). This is what makes an order look-up-able and referenceable independent of its changing state.
Deep dive: [Entity]({{ '/ddd/entities-vs-value-objects-equality-mechanics/' | relative_url }})

### Value Object
A Value Object has no identity; it is equal to another instance only when every one of its defining components matches. It is typically immutable, and changing any component yields a genuinely different value rather than a mutation of the same one. Equality is structural (overridden via `GetEqualityComponents()` or a compiler-supplied record), never by reference.
Deep dive: [Value Object]({{ '/ddd/entities-vs-value-objects-equality-mechanics/' | relative_url }})

### Aggregate & Aggregate Root
An aggregate is a cluster of domain objects treated as one consistency unit, loaded and transacted together. The aggregate root is the single object reachable from outside the cluster; every contained member (e.g. an order line) is only ever created, read, or mutated through the root's own methods, so the root can enforce invariants on the whole graph. Cross-aggregate changes happen in separate transactions, referenced only by the root's id — never loaded and saved in the same transaction as a different aggregate.
Deep dive: [Aggregate & Aggregate Root]({{ '/ddd/aggregates-and-aggregate-roots-consistency-boundary/' | relative_url }})

### Domain Event
A domain event is a plain object representing a fact that already happened in the domain (named in past tense), decoupled from who reacts to it. It is buffered on the aggregate via `AddDomainEvent(...)` and dispatched in-process immediately before the transaction commits, so a throwing handler rolls back the originating state change too. It is distinct from an integration event, which crosses process/service boundaries asynchronously after commit.
Deep dive: [Domain Event]({{ '/ddd/domain-events-dispatch-timing-same-transaction/' | relative_url }})

### Domain Service & Application Service
A domain service holds logic that is genuinely part of the domain but fits no single aggregate instance — a policy reasoned over a whole collection of aggregates. An application service (e.g. a command handler) contains no business rules; it orchestrates the use case: resolve dependencies, construct/load the aggregate, call its methods, persist, publish. The handler delegates every real decision into the aggregate's own constructor or methods rather than re-implementing it.
Deep dive: [Domain Service & Application Service]({{ '/ddd/domain-services-vs-application-services/' | relative_url }})

### Factory
A factory encapsulates a non-trivial, valid construction path for an aggregate, hiding the details of reaching a specific starting state. It can be a dedicated class or, as in practice, a static method on the aggregate itself (`Order.NewDraft()`): the real constructor raises a creation event, while the factory produces a partial preview state with no event. Both paths still reuse the aggregate's own item/invariant logic.
Deep dive: [Factory]({{ '/ddd/factories-for-complex-aggregate-construction/' | relative_url }})

### Specification Pattern
A Specification wraps one business rule behind a single `IsSatisfiedBy(entity)` method, and the `And`/`Or`/`Not` combinators return new specification objects (a tree), not immediate booleans. `AndSpecification` evaluates both sides unconditionally rather than short-circuiting, because a visitor later walks the same tree to collect every failed rule's error. This separates "which rules combine" from the conditional logic that would otherwise scatter across call sites.
Deep dive: [Specification Pattern]({{ '/ddd/specification-pattern-and-or-not-combinators/' | relative_url }})

### Rich vs Anemic Domain Model
A rich domain model forces every mutation of a protected field through a behavior method with its own guard clause, so invariants can't be bypassed. An anemic model looks similar — it may even have guard-claused methods — yet leaves the same field publicly settable, so an ORM or HTTP binding can write a bad value without the check ever running. Richness is decided per class by whether all paths go through the behavior, not by whether behavior exists.
Deep dive: [Rich vs Anemic Domain Model]({{ '/ddd/rich-vs-anemic-domain-model-same-repo-both/' | relative_url }})

### Invariant Enforcement (validation)
Two distinct check layers exist — input-shape validation runs before the domain is touched (a pipeline behavior running FluentValidation on the command), and invariant enforcement lives inside the domain object itself, run on every mutation regardless of whether the first layer passed. The domain-layer check can reason about relationships between values (e.g. discount ≤ price × units) that a request-shape validator cannot. Both may throw the same exception type, but they answer different questions at different moments.
Deep dive: [Invariant Enforcement]({{ '/ddd/domain-validation-vs-invariant-enforcement-two-layers/' | relative_url }})

## Context & language

### Ubiquitous Language
The exact vocabulary domain experts use in conversation must appear, untranslated, in code — class names, method names, event names. A method named after the business action (`SetShippedStatus()`) is the one place a rule about that action can be enforced, rather than a generic field mutation (`Status = 5`). The language has to be identical in meetings and in code, or the two groups silently drift toward discussing different models.
Deep dive: [Ubiquitous Language]({{ '/ddd/ubiquitous-language-and-event-storming/' | relative_url }})

### Event Storming
Event Storming is a workshop where developers and domain experts name every business-significant occurrence as a past-tense sticky note (an event), before any code exists. Those notes become domain event class names with the wording unchanged, surfacing the ubiquitous language collaboratively and early. Writing facts in past tense ("the order *shipped*") is what keeps the model aligned with how the business actually experiences the process.
Deep dive: [Event Storming]({{ '/ddd/ubiquitous-language-and-event-storming/' | relative_url }})

### Bounded Context
A bounded context is a boundary within which a particular domain model — and a particular meaning for its terms — applies consistently. The same word ("Order", "Customer") can mean different things in different contexts; the context makes the intended model explicit rather than letting one definition leak across the whole system. It is the unit at which models are allowed to diverge without contradiction.
Deep dive: [Bounded Context]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})

### Context Map
A context map documents the relationships between bounded contexts — how they depend on, share with, or translate each other's models. Relationship types include Customer/Supplier, Shared Kernel, Conformist, Open Host Service, and Anti-Corruption Layer. A real system often runs several of these simultaneously between the same pair, so the map is a vocabulary for describing what's actually happening, not a single dropdown choice.
Deep dive: [Context Map]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})

### Published Language / Open Host Service / Conformist
A Published Language is a stable, shared contract an upstream context exposes (often via an Open Host Service) so each consumer defines its own local copy of only the fields it needs, matched by event name on the bus. A Conformist consumer instead adopts the upstream shape wholesale, coupling itself to every field the upstream adds. The relationship type answers whose model governs what crosses the boundary.
Deep dive: [Published Language]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})

### Anti-Corruption Layer
An Anti-Corruption Layer is a translation boundary a downstream context places between itself and an upstream model it doesn't want to depend on, converting the upstream's representation into its own local model. It prevents a foreign model's concepts and changes from leaking into and corrupting the downstream context's own domain. It is one of the relationship types a context map can name.
Deep dive: [Anti-Corruption Layer]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})

## Persistence patterns

### Repository
A repository is the persistence boundary for an aggregate root — it speaks only in terms of the root type (`Add(Order)`, `GetAsync(orderId)`), never its internal members, and loads/saves the whole graph as one unit. `Update` just flips the tracked entity's state to Modified; the actual decisions happened earlier through the aggregate's methods. No repository exists for objects reachable only through the root, which is the enforcement mechanism, not an oversight.
Deep dive: [Repository]({{ '/ddd/repositories-as-aggregate-persistence-boundaries/' | relative_url }})

### Event Sourcing
Event sourcing makes the append-only event log the single source of truth; current state is derived by replaying events through convention-matched `Apply` methods, never stored directly. `Emit` mutates in-memory immediately and buffers for later commit; a sequence-number check rejects gaps or out-of-order events; snapshots periodically capture state so replay starts from the snapshot's version instead of event #1. The sequence check is what makes "current state = replay of history" a safe claim rather than a silent-corruption risk.
Deep dive: [Event Sourcing]({{ '/ddd/event-sourcing-replay-and-snapshotting/' | relative_url }})

### CQRS
CQRS (Command Query Responsibility Segregation) splits a model into a write side (commands/aggregates) and a read side (dedicated query models), so each is optimized independently. It is a separate architectural decision that pairs well with event sourcing for performance but is not required by it — an aggregate can be fully event-sourced and still queried directly through the same object.
Deep dive: [CQRS]({{ '/ddd/event-sourcing-replay-and-snapshotting/' | relative_url }})

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.




