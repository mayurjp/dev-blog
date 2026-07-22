---
layout: post
title: "Event-Driven Architecture Key Terms: Events, CQRS, and the Async Vocabulary Behind Every Post"
description: "A standalone glossary of event-driven-architecture terms used across this blog's async-system posts — event sourcing, CQRS, the outbox pattern, choreography vs orchestration, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: event-driven
order: 99
tags: [event-driven, glossary, cqrs, event-sourcing]
---

**TL;DR:** This is a reference glossary for the event-driven-architecture series — every term below is defined standalone so you can jump in from any post and know what "projection," "outbox," or "choreography" concretely means at the mechanism level.

## Core concepts

### Event
An event is an immutable, timestamped record of something that already happened in the domain — `OrderPlaced` says the order was placed, not that it should be. It carries a payload of facts (order id, items, total) and is published onto a log so any subscriber can react, without the producer knowing who is listening. Because it is past-tense and append-only, an event is safe to broadcast to many consumers at once.

### Event vs command
A command is a request for something to happen in the future ("PlaceOrder") and expects exactly one handler to decide and possibly reject it. An event is a report that something did happen ("OrderPlaced") and expects zero or many reactors, none of which can undo it. The two are often confused because both travel as messages, but a command targets one owner while an event fans out to everyone interested.

### Aggregate
An aggregate is a cluster of domain objects treated as one consistency boundary — a single `Order` with its line items is loaded, mutated by a command, and produces events that must remain internally consistent. The aggregate's id is the partition key for its event stream, so all its events live in one ordered log. Outside the aggregate boundary you cannot enforce invariants directly; you react to its emitted events instead.

### Event bus
An event bus is the transport that carries published events from producers to subscribers — in practice this is a broker like Apache Kafka whose topics are the bus. It decouples the sender from the receiver: the producer writes to a topic and the bus handles fan-out, persistence, and delivery. The bus is the shared contract that lets services stay unaware of each other's existence.

### Event stream
An event stream is the ordered, append-only sequence of all events for one aggregate or one topic, keyed so ordering is preserved per partition. In Kafka this is a topic partition; reading it from offset 0 replays the full history of that entity. The stream is the source of truth in an event-sourced system, from which state is rebuilt rather than stored directly.

### CloudEvents
CloudEvents is a CNCF specification (cloudevents/spec) that defines a vendor-neutral envelope for events — standard attributes like `id`, `source`, `type`, `specversion`, and `datacontenttype` wrap your payload so any broker or function can route it. By adopting the `type` and `source` fields, a consumer can bind to events across Kafka, HTTP, and cloud queues without bespoke parsers. It is the interoperability layer that stops every team inventing its own event shape.

### Eventual consistency
Eventual consistency means a read model may briefly lag the write model because it is updated asynchronously by events that have not yet been processed. After the event propagates, all readers converge on the same value; there is no global lock enforcing instant agreement. The trade-off is that a just-written value is not guaranteed to be readable immediately, which is the central thing developers must design around.

### Correlation / Causation ID
A correlation ID traces a chain of events back to the original user request across multiple services — when OrderPlaced triggers FulfillmentStarted which triggers ItemShipped, the same correlation ID rides on every event so you can reconstruct the full flow. A causation ID identifies which specific event caused another (FulfillmentStarted was caused by OrderPlaced). Both are propagated as metadata fields on events and are essential for distributed tracing and debugging.

## Event sourcing & CQRS

### Event sourcing
Event sourcing stores state as a sequence of events instead of mutating a current row — the `Order` aggregate's state is the fold of every `OrderPlaced` and `FulfillmentStarted` event in its stream. To get current state you replay the stream (or load a snapshot plus later events) and apply each event in order. This gives you a complete audit log for free and lets you rebuild any past state, at the cost of a growing log and the need for snapshots.

### CQRS
CQRS (Command Query Responsibility Segregation) splits a model into a write side that handles commands and produces events, and a read side that serves queries from a denormalized view. The two sides can use different stores — Postgres for writes, Elasticsearch for reads — because they are updated by the same event stream. The benefit is that read and write workloads scale and evolve independently; the cost is that the read side is derived, so it is eventually consistent.

### Write model
The write model is the command-handling side of CQRS: it loads the aggregate, validates the command against current state, and emits events. It is optimized for consistency and usually backed by the event stream itself rather than a query-friendly table. No user-facing query ever hits the write model directly; it exists only to protect invariants and produce facts.

### Read model
The read model (or projection) is a purpose-built, denormalized store populated by consuming events — a "orders by customer" view in a fast key-value store, for example. It is tuned for the exact queries the UI needs, so reads are cheap and don't join across services. Because it is rebuilt from events, you can delete and recreate it at any time without losing source data.

### Projection
A projection is a specific read model built by subscribing to an event stream and folding events into a queryable shape — the "open orders dashboard" is a projection of `OrderPlaced` events before `FulfillmentStarted`. It is just a consumer with a table; when the logic changes you reset its offset and replay. Projections are how CQRS turns the write-side event log into many optimized read APIs.

### Snapshot
A snapshot is a periodically saved aggregate state (e.g. every 100 events) so you don't replay the entire stream to load an entity. On load you read the latest snapshot and apply only the events after it, bounding reconstruction cost. Without snapshots a long-lived aggregate's startup time grows linearly with its event count.

### Replay
Replay is reprocessing an event stream from the beginning (or from a snapshot) to rebuild state or a projection — used to fix a buggy projection or bootstrap a new read model. Because events are immutable facts, replaying them yields the same result as the first time, which is what makes projections disposable. The catch is that replay must be idempotent, or you double-count events.

## Reliability patterns

### Outbox pattern
The outbox pattern avoids the dual-write problem by writing the domain change and the event to the same database in one local transaction, into an `outbox` table. A separate relay then publishes those outbox rows to the event bus, guaranteeing the event is emitted if and only if the business data committed. This turns "update DB and publish to Kafka" into one atomic step plus an async publish, so a crash can't leave the two out of sync.

### Transaction outbox
The transaction outbox is the concrete implementation of the outbox pattern: a `outbox` table co-located with the business tables, written inside the same ACID transaction as the state change. A polling publisher or a log-based CDC tool (like Debezium reading the write-ahead log) drains the outbox and sends each row to Kafka exactly once per row. It is the mechanism that makes "did the event get sent?" answerable with a database query instead of hope.

### Inbox pattern
The inbox pattern is the pull-based complement to the outbox: instead of pushing events to a broker, a consumer polls a "pending events" table in the database, processes each event, and marks it as processed. It ensures at-least-once delivery without requiring CDC tooling, making it simpler than the outbox pattern but adding polling latency. Useful when the consumer owns both the events table and the processing logic in the same database.

### CDC (Change Data Capture)
CDC is a pattern that streams database row changes (INSERT/UPDATE/DELETE) as events. Tools like Debezium attach to the database's WAL or binlog and publish change events to Kafka in near real-time. CDC is the engine behind the outbox pattern (draining the outbox table) and is also used for database replication and keeping derived data stores in sync.

### Idempotent handler
An idempotent handler is a consumer that produces the same result whether an event is processed once or delivered five times. It does this by recording processed event ids (or using the event's natural key) so a redelivery is a no-op rather than a duplicate order. At-least-once delivery makes idempotency mandatory, because the bus will resend after timeouts and crashes.

### Dead-letter
A dead-letter queue (DLQ) is where a broker routes events that repeatedly fail to process, so they stop blocking the live stream and can be inspected later. In Kafka this is often a separate topic; in a queue system it is the built-in DLQ. Without one, a single poison event can stall a consumer group forever as it retries the same bad message.

### Schema evolution
Schema evolution is the disciplined practice of changing an event's structure without breaking existing consumers — adding optional fields, never removing required ones, and versioning via the CloudEvents `type` or a schema registry. A consumer written for v1 must still read v2 events, so changes are backward-compatible by rule. The schema registry (e.g. Confluent's) enforces compatibility at publish time so a bad change is rejected before it reaches production.

### Event versioning
When an event schema evolves (new fields, changed types), old consumers must still read old versions. Strategies include a `version` field in the event type, a schema registry (like Confluent's) to enforce backward compatibility, or CloudEvents `datacontenttype` versioning. Without versioning, deploying a new consumer that expects a field older producers don't send causes runtime failures.

### Exactly-once vs at-least-once
At-least-once delivery means the bus may send an event more than once after a failure, so consumers must be idempotent. Exactly-once is stronger — the event is processed once and only once — but in practice it is usually "effectively once," achieved by idempotent producers plus transactional reads/writes (Kafka's transactions) rather than a magic guarantee. Most systems choose at-least-once plus idempotency because it is simpler and nearly as safe.

### Backpressure
Backpressure is the signal a slow consumer sends upstream to say "stop sending so fast" so it doesn't fall over or grow an unbounded queue. In Kafka this is implicit — consumers just lag behind the partition head — while reactive streams and brokers like Pulsar expose explicit flow-control protocols. Without backpressure, a burst of events can exhaust memory or cause a cascading slowdown across the pipeline.

## Coordination

### Choreography
Choreography is decentralized coordination where each service reacts to events and emits its own, with no central controller — the fulfillment service hears `OrderPlaced` and emits `FulfillmentStarted` on its own. It is loosely coupled and resilient to individual services being down, because nobody is orchestrating the whole flow. The downside is that the overall business process lives only in the emergent behavior of many services, which is harder to trace and reason about.

### Orchestration
Orchestration is centralized coordination where one process (a saga orchestrator or workflow engine) tells each service what to do and in what order, tracking the overall progress. It makes the end-to-end flow explicit and observable, at the cost of a coupling point that must be highly available. Unlike choreography, a timeout or failure is handled by the orchestrator issuing a compensating command rather than hoping someone reacts.

### Saga
A saga is a sequence of local transactions across services where each step publishes an event, and if a later step fails, earlier steps are undone by compensating actions — charge the card, reserve inventory, and if shipping fails, refund the card. It replaces a distributed two-phase commit, which doesn't work across autonomous services, with a series of reversible local commits. Sagas come in choreography and orchestration flavors, trading coupling for visibility.

This glossary is the shared vocabulary for the event-driven series; the [Event-Driven Architecture 101]({{ '/event-driven/event-driven-101/' | relative_url }}) post applies these terms to a concrete order-and-fulfillment example.




