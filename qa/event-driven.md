---
layout: page
title: "Event-Driven Architecture Interview Questions: 35 Real-World Q&A from Production Manifests"
description: "35 interview-ready Event-Driven Architecture questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/event-driven/
---

Bite-sized, standalone interview questions and answers for Event-Driven Architecture. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">35</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: Events vs commands & core concepts (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] What is the core difference between an event-driven system and a request/response system? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
In request/response, services call each other synchronously — checkout waits on payment, then on shipping. In an event-driven system the `orders` service records that an order was placed and emits an `OrderPlaced` event; `fulfillment`, `email`, and `analytics` each notice it on their own time, so the producer never names its consumers.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] What is the difference between an event and a command? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A command is a request for something to happen in the future (`PlaceOrder`) and expects exactly one handler that may reject it. An event is a report that something did happen (`OrderPlaced`) and fans out to zero or many reactors, none of whom can undo it. Both travel as messages, but a command targets one owner while an event targets everyone interested.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is an event described as "past tense" and "append-only"? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An event records a fact that already happened — `OrderPlaced` says the order was placed, not that it should be. Because it is past-tense and append-only, it is safe to broadcast the same event to many consumers at once without any of them mutating the original.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is an aggregate and why is its id used as the partition key? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An aggregate is a cluster of domain objects treated as one consistency boundary — a single `Order` with its line items is loaded, mutated by a command, and produces internally consistent events. Its id becomes the partition key for its event stream, so all its events live in one ordered log and ordering is preserved per partition.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is the role of the event bus and why is Kafka a good choice for it? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The event bus is the transport — a broker like Kafka whose topics carry published events from producers to subscribers and handle fan-out, persistence, and delivery. Kafka is a durable, replayable log that retains events so new consumers can replay history and rebuild state, which queues typically can't because they delete a message after consumption.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What does CloudEvents standardize and why does it matter? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
CloudEvents defines a vendor-neutral envelope — standard attributes like `id`, `source`, `type`, `specversion`, and `datacontenttype` wrap your payload so any broker or function can route it. By adopting `type` and `source`, a consumer can bind to events across Kafka, HTTP, and cloud queues without bespoke parsers, which prevents every team inventing its own event shape.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: Event sourcing & CQRS (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is event sourcing and how is current state obtained? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Event sourcing stores state as a sequence of events instead of mutating a current row — an `Order`'s state is the fold of every `OrderPlaced`, `ItemAdded`, and `OrderShipped` event in its stream. To get current state you replay the stream (or load a snapshot plus later events) and apply each event in order.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] What problem does CQRS solve by splitting write and read models? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
CQRS (Command Query Responsibility Segregation) splits a model into a write side that handles commands and produces events, and a read side that serves queries from a denormalized view. The two sides can use different stores (Postgres for writes, Elasticsearch for reads), so read and write workloads scale and evolve independently.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] What is the write model responsible for in CQRS? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The write model is the command-handling side: it loads the aggregate, validates the command against current state, and emits events. It is optimized for consistency and usually backed by the event stream itself; no user-facing query ever hits the write model directly because it exists only to protect invariants and produce facts.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is a read model / projection and why is it safe to delete? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A read model (or projection) is a purpose-built, denormalized store populated by consuming events — a "orders by customer" view in a fast key-value store. It is tuned for the exact queries the UI needs and is rebuilt from events, so you can delete and recreate it at any time without losing source data.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Expert] What is a snapshot and why does event sourcing need it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A snapshot is a periodically saved aggregate state (e.g. every 100 events) so you don't replay the entire stream to load an entity. On load you read the latest snapshot and apply only the events after it, bounding reconstruction cost — without snapshots a long-lived aggregate's startup time grows linearly with its event count.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Expert] What is replay and what makes it safe to reprocess a stream? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Replay reprocesses an event stream from the beginning (or a snapshot) to rebuild state or a projection — used to fix a buggy projection or bootstrap a new read model. Because events are immutable facts, replays yield the same result as the first time, which is what makes projections disposable; the catch is that replay must be idempotent or you double-count events.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] In the order example, what is the read model and why can't the dashboard read the aggregate directly? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
In the example the dashboard reads from a projection — a denormalized "orders by customer" view in a fast key-value store. The read model is derived from the event stream so it can be deleted and rebuilt by replaying Kafka, whereas the aggregate is the write-side consistency boundary that only emits events.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

## Topic: The outbox pattern & reliability (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] What is the dual-write problem and how does the outbox fix it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The naive approach writes the order to Postgres and publishes to Kafka as two separate steps; if the DB commit succeeds but the Kafka publish crashes, you have an order with no event and every reactor silently misses it. The outbox writes both the order row and an `outbox` row in one Postgres transaction, then a relay publishes the outbox rows to Kafka, so the two can never diverge.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is the transaction outbox concretely? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The transaction outbox is the concrete implementation: an `outbox` table co-located with the business tables, written inside the same ACID transaction as the state change. A polling publisher or a log-based CDC tool like Debezium reading the write-ahead log drains the outbox and sends each row to Kafka exactly once per row.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] Why must every event handler be idempotent? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
At-least-once delivery means the bus may resend an event after timeouts or crashes, producing duplicates — lost events are the opposite failure, but both are real. An idempotent handler records processed event ids (or uses the event's natural key) so a redelivered `OrderPlaced` doesn't create a second shipment.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is a poison event and what is the dead-letter remedy? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A malformed `OrderPlaced` (bad JSON, missing field) can make a consumer throw forever, stalling the whole partition as it retries the same bad message. Routing repeated failures to a dead-letter topic lets the stream keep moving while you inspect the bad message later; without one, a single poison event can stall a consumer group forever.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Expert] What is the difference between at-least-once and exactly-once delivery? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
At-least-once delivery may send an event more than once after a failure, so consumers must be idempotent. Exactly-once is stronger but in practice is "effectively once," achieved by idempotent producers plus transactional reads/writes (Kafka's transactions) rather than a magic guarantee — most systems choose at-least-once plus idempotency because it is simpler and nearly as safe.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What eventual-consistency confusion hits the UI and how do you handle it? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A user places an order and immediately refreshes the dashboard, but it isn't there yet because the projection hasn't consumed the event. If the UI assumes read-your-writes you get "where did my order go?" bugs; either accept the lag, or have the write path return a token the read path can use to wait for catch-up.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Choreography vs orchestration & sagas (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] What is choreography in event-driven systems? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Choreography is decentralized coordination where each service reacts to events and emits its own, with no central controller — the fulfillment service hears `OrderPlaced` and emits `FulfillmentStarted` on its own. It is loosely coupled and resilient to individual services being down, because nobody orchestrates the whole flow.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is orchestration and how does it differ from choreography? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Orchestration is centralized coordination where one process (a saga orchestrator or workflow engine) tells each service what to do and in what order, tracking overall progress. Unlike choreography, a timeout or failure is handled by the orchestrator issuing a compensating command rather than hoping someone reacts, at the cost of a coupling point that must be highly available.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] When should you pick choreography versus orchestration? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Use choreography (reactors) for loose coupling and resilience when no one needs to see the whole flow. Use a saga orchestrator when you need to observe the end-to-end process and handle failures with compensating actions, accepting the coupling point it introduces.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is a saga and why does it replace a distributed two-phase commit? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A saga is a sequence of local transactions across services where each step publishes an event, and if a later step fails, earlier steps are undone by compensating actions — charge the card, reserve inventory, and if shipping fails, refund the card. It replaces a distributed two-phase commit (which doesn't work across autonomous services) with a series of reversible local commits.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Scenario] A fraud-check service must start reacting to orders without touching the orders service. Which coordination style fits? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Choreography fits — because the producer doesn't call anyone, `orders` writes to its outbox and Kafka without naming `fulfillment` or `fraud-check`. You add a new reactor that subscribes to `OrderPlaced` and it catches up by replaying the topic, with no change to the producer.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Schema evolution, replay & consumer safety (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] How do you evolve an event's schema without breaking existing consumers? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Schema evolution means changing an event's structure without breaking consumers — add optional fields, never remove required ones, and version via the CloudEvents `type` or a schema registry. A consumer written for v1 must still read v2 events, so changes are backward-compatible by rule, and a registry can reject a bad change at publish time.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Scenario] A buggy projection computed wrong totals. How do you fix it without losing source data? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Reset the projection's offset and replay the event stream from the beginning (or a snapshot) to rebuild it. Because events are immutable facts, replaying yields the same result, so you can delete the read model and recreate it from the source-of-truth event log — the source data was never in the projection to begin with.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Tradeoff] Why is Kafka preferred over a simple queue for event-driven backends? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Kafka is a durable, replayable log: topics retain events so new consumers can replay history and rebuild state, which is exactly what projections and the outbox relay need. A queue typically deletes a message after it's consumed, so you can't rebuild a read model or bootstrap a new consumer from it.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Beginner] Is event-driven architecture always better than calling services directly? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. Synchronous calls give you an immediate answer and a single transaction; events give you decoupling and resilience at the cost of lag and complexity. Use events for "tell the next thing this happened," and direct calls for "I need the result now."

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Expert] What single takeaway should you carry into designing an event-driven system? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Emit events from a transactionally consistent outbox, make every consumer idempotent, and design the UI for eventual consistency. Concretely: adopt CloudEvents for a portable envelope, use the outbox (DB row + relay) instead of publishing after a separate commit, treat the read model as derived and rebuildable by replay, and add a dead-letter path so one poison event can't stall a consumer group.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Correlation, versioning & production patterns (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is a correlation ID and why do you need one? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A correlation ID is a unique identifier attached to the original user request that propagates through every event in the chain (OrderPlaced → FulfillmentStarted → ItemShipped). When something fails in a multi-service event flow, the correlation ID lets you trace the entire chain across services, logs, and traces — without it, debugging is guesswork. A causation ID goes further: it identifies which specific event caused another, distinguishing "this happened after that" from "this happened because of that."

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What happens when an event consumer is slow or falls behind? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The consumer accumulates consumer lag — the gap between the latest event in the partition and the consumer's committed offset. In Kafka, the consumer keeps processing from its last committed offset; other consumers in the group are not affected (each owns its own partitions). But if the lag grows too large, the consumer may hit log retention limits (older events are deleted before they're processed) or cause timeouts on dependent services. Solutions: scale up consumers (up to the partition count), optimize processing, or add backpressure.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Expert] How do you handle out-of-order events in a distributed system? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Kafka guarantees ordering within a partition, not across partitions or topics. If events for the same entity end up in different partitions (different keys), they can arrive out of order. Solutions: use a consistent partition key (e.g., order ID) so all events for one entity go to the same partition; design consumers to handle out-of-order events (e.g., apply events by timestamp or version number rather than assuming order); use event versioning so consumers can skip or reorder stale events.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is event versioning and how do you handle it? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When you evolve an event schema (adding a field to OrderPlaced), old consumers must still read old versions. Strategies: include a `version` field in the event type so consumers can branch on it; use a Schema Registry that enforces backward compatibility (adding a field with a default is safe; removing or renaming is not); or use CloudEvents with a `type` that includes the version (e.g., `OrderPlaced.v2`). The key rule: old consumers must never break when a new event version is published.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Comparison] What is the inbox pattern and how does it differ from the outbox? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The outbox is push-based: you write an event to an outbox table in the same transaction as your business data, then a relay (CDC/polling) publishes it to the broker. The inbox is pull-based: the consumer polls a "pending events" table in its own database, processes each event, and marks it as processed. The inbox is simpler (no CDC tooling needed) but adds polling latency; the outbox is more real-time but requires Debezium or a polling publisher. Both guarantee at-least-once delivery without two-phase commit.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: [Intermediate] What is CDC (Change Data Capture) and how does it relate to event-driven architecture? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
CDC streams database row changes (INSERT/UPDATE/DELETE) as events by reading the database's WAL (Write-Ahead Log) or binlog. Tools like Debezium attach to the log and publish change events to Kafka in real time. CDC is the engine behind the outbox pattern (reading the outbox table as a change stream) and enables event-driven architectures without requiring applications to explicitly publish events — the database itself becomes the event source.

<p class="qa-link">[Full post →]({{ '/event-driven/event-driven-key-terms/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 35 across Event-Driven Architecture

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Beginner] What is the core difference between an event-driven system and a request/response system?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In request/response, services call each other synchronously — checkout waits on payment, then on shipping. In an event-driven system the `orders` service records that an order was placed and emits an `OrderPlaced` event; `fulfillment`, `email`, and `analytics` each notice it on their own time, so the producer never names its consumers."
      }
    },
    {
      "@type": "Question",
      "name": "[Beginner] What is the difference between an event and a command?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A command is a request for something to happen in the future (`PlaceOrder`) and expects exactly one handler that may reject it. An event is a report that something did happen (`OrderPlaced`) and fans out to zero or many reactors, none of whom can undo it. Both travel as messages, but a command targets one owner while an event targets everyone interested."
      }
    },
    {
      "@type": "Question",
      "name": "Why is an event described as \"past tense\" and \"append-only\"?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An event records a fact that already happened — `OrderPlaced` says the order was placed, not that it should be. Because it is past-tense and append-only, it is safe to broadcast the same event to many consumers at once without any of them mutating the original."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is an aggregate and why is its id used as the partition key?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An aggregate is a cluster of domain objects treated as one consistency boundary — a single `Order` with its line items is loaded, mutated by a command, and produces internally consistent events. Its id becomes the partition key for its event stream, so all its events live in one ordered log and ordering is preserved per partition."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is the role of the event bus and why is Kafka a good choice for it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The event bus is the transport — a broker like Kafka whose topics carry published events from producers to subscribers and handle fan-out, persistence, and delivery. Kafka is a durable, replayable log that retains events so new consumers can replay history and rebuild state, which queues typically can't because they delete a message after consumption."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What does CloudEvents standardize and why does it matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CloudEvents defines a vendor-neutral envelope — standard attributes like `id`, `source`, `type`, `specversion`, and `datacontenttype` wrap your payload so any broker or function can route it. By adopting `type` and `source`, a consumer can bind to events across Kafka, HTTP, and cloud queues without bespoke parsers, which prevents every team inventing its own event shape."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is event sourcing and how is current state obtained?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Event sourcing stores state as a sequence of events instead of mutating a current row — an `Order`'s state is the fold of every `OrderPlaced`, `ItemAdded`, and `OrderShipped` event in its stream. To get current state you replay the stream (or load a snapshot plus later events) and apply each event in order."
      }
    },
    {
      "@type": "Question",
      "name": "[Beginner] What problem does CQRS solve by splitting write and read models?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CQRS (Command Query Responsibility Segregation) splits a model into a write side that handles commands and produces events, and a read side that serves queries from a denormalized view. The two sides can use different stores (Postgres for writes, Elasticsearch for reads), so read and write workloads scale and evolve independently."
      }
    },
    {
      "@type": "Question",
      "name": "[Beginner] What is the write model responsible for in CQRS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The write model is the command-handling side: it loads the aggregate, validates the command against current state, and emits events. It is optimized for consistency and usually backed by the event stream itself; no user-facing query ever hits the write model directly because it exists only to protect invariants and produce facts."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is a read model / projection and why is it safe to delete?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A read model (or projection) is a purpose-built, denormalized store populated by consuming events — a \"orders by customer\" view in a fast key-value store. It is tuned for the exact queries the UI needs and is rebuilt from events, so you can delete and recreate it at any time without losing source data."
      }
    },
    {
      "@type": "Question",
      "name": "[Expert] What is a snapshot and why does event sourcing need it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A snapshot is a periodically saved aggregate state (e.g. every 100 events) so you don't replay the entire stream to load an entity. On load you read the latest snapshot and apply only the events after it, bounding reconstruction cost — without snapshots a long-lived aggregate's startup time grows linearly with its event count."
      }
    },
    {
      "@type": "Question",
      "name": "[Expert] What is replay and what makes it safe to reprocess a stream?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Replay reprocesses an event stream from the beginning (or a snapshot) to rebuild state or a projection — used to fix a buggy projection or bootstrap a new read model. Because events are immutable facts, replays yield the same result as the first time, which is what makes projections disposable; the catch is that replay must be idempotent or you double-count events."
      }
    },
    {
      "@type": "Question",
      "name": "[Beginner] In the order example, what is the read model and why can't the dashboard read the aggregate directly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In the example the dashboard reads from a projection — a denormalized \"orders by customer\" view in a fast key-value store. The read model is derived from the event stream so it can be deleted and rebuilt by replaying Kafka, whereas the aggregate is the write-side consistency boundary that only emits events."
      }
    },
    {
      "@type": "Question",
      "name": "[Beginner] What is the dual-write problem and how does the outbox fix it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The naive approach writes the order to Postgres and publishes to Kafka as two separate steps; if the DB commit succeeds but the Kafka publish crashes, you have an order with no event and every reactor silently misses it. The outbox writes both the order row and an `outbox` row in one Postgres transaction, then a relay publishes the outbox rows to Kafka, so the two can never diverge."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is the transaction outbox concretely?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The transaction outbox is the concrete implementation: an `outbox` table co-located with the business tables, written inside the same ACID transaction as the state change. A polling publisher or a log-based CDC tool like Debezium reading the write-ahead log drains the outbox and sends each row to Kafka exactly once per row."
      }
    },
    {
      "@type": "Question",
      "name": "[Beginner] Why must every event handler be idempotent?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "At-least-once delivery means the bus may resend an event after timeouts or crashes, producing duplicates — lost events are the opposite failure, but both are real. An idempotent handler records processed event ids (or uses the event's natural key) so a redelivered `OrderPlaced` doesn't create a second shipment."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is a poison event and what is the dead-letter remedy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A malformed `OrderPlaced` (bad JSON, missing field) can make a consumer throw forever, stalling the whole partition as it retries the same bad message. Routing repeated failures to a dead-letter topic lets the stream keep moving while you inspect the bad message later; without one, a single poison event can stall a consumer group forever."
      }
    },
    {
      "@type": "Question",
      "name": "[Expert] What is the difference between at-least-once and exactly-once delivery?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "At-least-once delivery may send an event more than once after a failure, so consumers must be idempotent. Exactly-once is stronger but in practice is \"effectively once,\" achieved by idempotent producers plus transactional reads/writes (Kafka's transactions) rather than a magic guarantee — most systems choose at-least-once plus idempotency because it is simpler and nearly as safe."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What eventual-consistency confusion hits the UI and how do you handle it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A user places an order and immediately refreshes the dashboard, but it isn't there yet because the projection hasn't consumed the event. If the UI assumes read-your-writes you get \"where did my order go?\" bugs; either accept the lag, or have the write path return a token the read path can use to wait for catch-up."
      }
    },
    {
      "@type": "Question",
      "name": "[Beginner] What is choreography in event-driven systems?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Choreography is decentralized coordination where each service reacts to events and emits its own, with no central controller — the fulfillment service hears `OrderPlaced` and emits `FulfillmentStarted` on its own. It is loosely coupled and resilient to individual services being down, because nobody orchestrates the whole flow."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is orchestration and how does it differ from choreography?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Orchestration is centralized coordination where one process (a saga orchestrator or workflow engine) tells each service what to do and in what order, tracking overall progress. Unlike choreography, a timeout or failure is handled by the orchestrator issuing a compensating command rather than hoping someone reacts, at the cost of a coupling point that must be highly available."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] When should you pick choreography versus orchestration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Use choreography (reactors) for loose coupling and resilience when no one needs to see the whole flow. Use a saga orchestrator when you need to observe the end-to-end process and handle failures with compensating actions, accepting the coupling point it introduces."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is a saga and why does it replace a distributed two-phase commit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A saga is a sequence of local transactions across services where each step publishes an event, and if a later step fails, earlier steps are undone by compensating actions — charge the card, reserve inventory, and if shipping fails, refund the card. It replaces a distributed two-phase commit (which doesn't work across autonomous services) with a series of reversible local commits."
      }
    },
    {
      "@type": "Question",
      "name": "[Scenario] A fraud-check service must start reacting to orders without touching the orders service. Which coordination style fits?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Choreography fits — because the producer doesn't call anyone, `orders` writes to its outbox and Kafka without naming `fulfillment` or `fraud-check`. You add a new reactor that subscribes to `OrderPlaced` and it catches up by replaying the topic, with no change to the producer."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] How do you evolve an event's schema without breaking existing consumers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schema evolution means changing an event's structure without breaking consumers — add optional fields, never remove required ones, and version via the CloudEvents `type` or a schema registry. A consumer written for v1 must still read v2 events, so changes are backward-compatible by rule, and a registry can reject a bad change at publish time."
      }
    },
    {
      "@type": "Question",
      "name": "[Scenario] A buggy projection computed wrong totals. How do you fix it without losing source data?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Reset the projection's offset and replay the event stream from the beginning (or a snapshot) to rebuild it. Because events are immutable facts, replaying yields the same result, so you can delete the read model and recreate it from the source-of-truth event log — the source data was never in the projection to begin with."
      }
    },
    {
      "@type": "Question",
      "name": "[Tradeoff] Why is Kafka preferred over a simple queue for event-driven backends?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kafka is a durable, replayable log: topics retain events so new consumers can replay history and rebuild state, which is exactly what projections and the outbox relay need. A queue typically deletes a message after it's consumed, so you can't rebuild a read model or bootstrap a new consumer from it."
      }
    },
    {
      "@type": "Question",
      "name": "[Beginner] Is event-driven architecture always better than calling services directly?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Synchronous calls give you an immediate answer and a single transaction; events give you decoupling and resilience at the cost of lag and complexity. Use events for \"tell the next thing this happened,\" and direct calls for \"I need the result now.\""
      }
    },
    {
      "@type": "Question",
      "name": "[Expert] What single takeaway should you carry into designing an event-driven system?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Emit events from a transactionally consistent outbox, make every consumer idempotent, and design the UI for eventual consistency. Concretely: adopt CloudEvents for a portable envelope, use the outbox (DB row + relay) instead of publishing after a separate commit, treat the read model as derived and rebuildable by replay, and add a dead-letter path so one poison event can't stall a consumer group."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is a correlation ID and why do you need one?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A correlation ID is a unique identifier attached to the original user request that propagates through every event in the chain (OrderPlaced → FulfillmentStarted → ItemShipped). When something fails in a multi-service event flow, the correlation ID lets you trace the entire chain across services, logs, and traces — without it, debugging is guesswork. A causation ID goes further: it identifies which specific event caused another, distinguishing \"this happened after that\" from \"this happened because of that.\""
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What happens when an event consumer is slow or falls behind?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The consumer accumulates consumer lag — the gap between the latest event in the partition and the consumer's committed offset. In Kafka, the consumer keeps processing from its last committed offset; other consumers in the group are not affected (each owns its own partitions). But if the lag grows too large, the consumer may hit log retention limits (older events are deleted before they're processed) or cause timeouts on dependent services. Solutions: scale up consumers (up to the partition count), optimize processing, or add backpressure."
      }
    },
    {
      "@type": "Question",
      "name": "[Expert] How do you handle out-of-order events in a distributed system?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Kafka guarantees ordering within a partition, not across partitions or topics. If events for the same entity end up in different partitions (different keys), they can arrive out of order. Solutions: use a consistent partition key (e.g., order ID) so all events for one entity go to the same partition; design consumers to handle out-of-order events (e.g., apply events by timestamp or version number rather than assuming order); use event versioning so consumers can skip or reorder stale events."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is event versioning and how do you handle it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you evolve an event schema (adding a field to OrderPlaced), old consumers must still read old versions. Strategies: include a `version` field in the event type so consumers can branch on it; use a Schema Registry that enforces backward compatibility (adding a field with a default is safe; removing or renaming is not); or use CloudEvents with a `type` that includes the version (e.g., `OrderPlaced.v2`). The key rule: old consumers must never break when a new event version is published."
      }
    },
    {
      "@type": "Question",
      "name": "[Comparison] What is the inbox pattern and how does it differ from the outbox?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The outbox is push-based: you write an event to an outbox table in the same transaction as your business data, then a relay (CDC/polling) publishes it to the broker. The inbox is pull-based: the consumer polls a \"pending events\" table in its own database, processes each event, and marks it as processed. The inbox is simpler (no CDC tooling needed) but adds polling latency; the outbox is more real-time but requires Debezium or a polling publisher. Both guarantee at-least-once delivery without two-phase commit."
      }
    },
    {
      "@type": "Question",
      "name": "[Intermediate] What is CDC (Change Data Capture) and how does it relate to event-driven architecture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CDC streams database row changes (INSERT/UPDATE/DELETE) as events by reading the database's WAL (Write-Ahead Log) or binlog. Tools like Debezium attach to the log and publish change events to Kafka in real time. CDC is the engine behind the outbox pattern (reading the outbox table as a change stream) and enables event-driven architectures without requiring applications to explicitly publish events — the database itself becomes the event source."
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
