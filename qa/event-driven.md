---
layout: page
title: "Event-Driven Architecture Interview Questions: 29 Real-World Q&A from Production Manifests"
description: "29 interview-ready Event-Driven Architecture questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/event-driven/
---

Bite-sized, standalone interview questions and answers for Event-Driven Architecture. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">29</span></strong> questions shown. Filter by keyword or difficulty below.</p>

<div class="qa-toolbar" id="qa-toolbar">
  <input type="text" id="qa-search" placeholder="Filter questions by keyword…" aria-label="Filter questions" />
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
  <h3>Q: [Beginner] What is the core difference between an event-driven system and a request/response system? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
In request/response, services call each other synchronously — checkout waits on payment, then on shipping. In an event-driven system the `orders` service records that an order was placed and emits an `OrderPlaced` event; `fulfillment`, `email`, and `analytics` each notice it on their own time, so the producer never names its consumers.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Beginner] What is the difference between an event and a command? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
A command is a request for something to happen in the future (`PlaceOrder`) and expects exactly one handler that may reject it. An event is a report that something did happen (`OrderPlaced`) and fans out to zero or many reactors, none of whom can undo it. Both travel as messages, but a command targets one owner while an event targets everyone interested.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why is an event described as "past tense" and "append-only"? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
An event records a fact that already happened — `OrderPlaced` says the order was placed, not that it should be. Because it is past-tense and append-only, it is safe to broadcast the same event to many consumers at once without any of them mutating the original.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What is an aggregate and why is its id used as the partition key? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
An aggregate is a cluster of domain objects treated as one consistency boundary — a single `Order` with its line items is loaded, mutated by a command, and produces internally consistent events. Its id becomes the partition key for its event stream, so all its events live in one ordered log and ordering is preserved per partition.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What is the role of the event bus and why is Kafka a good choice for it? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The event bus is the transport — a broker like Kafka whose topics carry published events from producers to subscribers and handle fan-out, persistence, and delivery. Kafka is a durable, replayable log that retains events so new consumers can replay history and rebuild state, which queues typically can't because they delete a message after consumption.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What does CloudEvents standardize and why does it matter? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
CloudEvents defines a vendor-neutral envelope — standard attributes like `id`, `source`, `type`, `specversion`, and `datacontenttype` wrap your payload so any broker or function can route it. By adopting `type` and `source`, a consumer can bind to events across Kafka, HTTP, and cloud queues without bespoke parsers, which prevents every team inventing its own event shape.
  </div>
</div>

## Topic: Event sourcing & CQRS (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What is event sourcing and how is current state obtained? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Event sourcing stores state as a sequence of events instead of mutating a current row — an `Order`'s state is the fold of every `OrderPlaced`, `ItemAdded`, and `OrderShipped` event in its stream. To get current state you replay the stream (or load a snapshot plus later events) and apply each event in order.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Beginner] What problem does CQRS solve by splitting write and read models? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
CQRS (Command Query Responsibility Segregation) splits a model into a write side that handles commands and produces events, and a read side that serves queries from a denormalized view. The two sides can use different stores (Postgres for writes, Elasticsearch for reads), so read and write workloads scale and evolve independently.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Beginner] What is the write model responsible for in CQRS? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
The write model is the command-handling side: it loads the aggregate, validates the command against current state, and emits events. It is optimized for consistency and usually backed by the event stream itself; no user-facing query ever hits the write model directly because it exists only to protect invariants and produce facts.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What is a read model / projection and why is it safe to delete? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
A read model (or projection) is a purpose-built, denormalized store populated by consuming events — a "orders by customer" view in a fast key-value store. It is tuned for the exact queries the UI needs and is rebuilt from events, so you can delete and recreate it at any time without losing source data.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: [Expert] What is a snapshot and why does event sourcing need it? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
A snapshot is a periodically saved aggregate state (e.g. every 100 events) so you don't replay the entire stream to load an entity. On load you read the latest snapshot and apply only the events after it, bounding reconstruction cost — without snapshots a long-lived aggregate's startup time grows linearly with its event count.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: [Expert] What is replay and what makes it safe to reprocess a stream? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Replay reprocesses an event stream from the beginning (or a snapshot) to rebuild state or a projection — used to fix a buggy projection or bootstrap a new read model. Because events are immutable facts, replays yield the same result as the first time, which is what makes projections disposable; the catch is that replay must be idempotent or you double-count events.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Beginner] In the order example, what is the read model and why can't the dashboard read the aggregate directly? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
In the example the dashboard reads from a projection — a denormalized "orders by customer" view in a fast key-value store. The read model is derived from the event stream so it can be deleted and rebuilt by replaying Kafka, whereas the aggregate is the write-side consistency boundary that only emits events.
  </div>
</div>

## Topic: The outbox pattern & reliability (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Beginner] What is the dual-write problem and how does the outbox fix it? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
The naive approach writes the order to Postgres and publishes to Kafka as two separate steps; if the DB commit succeeds but the Kafka publish crashes, you have an order with no event and every reactor silently misses it. The outbox writes both the order row and an `outbox` row in one Postgres transaction, then a relay publishes the outbox rows to Kafka, so the two can never diverge.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What is the transaction outbox concretely? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The transaction outbox is the concrete implementation: an `outbox` table co-located with the business tables, written inside the same ACID transaction as the state change. A polling publisher or a log-based CDC tool like Debezium reading the write-ahead log drains the outbox and sends each row to Kafka exactly once per row.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Beginner] Why must every event handler be idempotent? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
At-least-once delivery means the bus may resend an event after timeouts or crashes, producing duplicates — lost events are the opposite failure, but both are real. An idempotent handler records processed event ids (or uses the event's natural key) so a redelivered `OrderPlaced` doesn't create a second shipment.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What is a poison event and what is the dead-letter remedy? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
A malformed `OrderPlaced` (bad JSON, missing field) can make a consumer throw forever, stalling the whole partition as it retries the same bad message. Routing repeated failures to a dead-letter topic lets the stream keep moving while you inspect the bad message later; without one, a single poison event can stall a consumer group forever.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: [Expert] What is the difference between at-least-once and exactly-once delivery? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
At-least-once delivery may send an event more than once after a failure, so consumers must be idempotent. Exactly-once is stronger but in practice is "effectively once," achieved by idempotent producers plus transactional reads/writes (Kafka's transactions) rather than a magic guarantee — most systems choose at-least-once plus idempotency because it is simpler and nearly as safe.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What eventual-consistency confusion hits the UI and how do you handle it? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
A user places an order and immediately refreshes the dashboard, but it isn't there yet because the projection hasn't consumed the event. If the UI assumes read-your-writes you get "where did my order go?" bugs; either accept the lag, or have the write path return a token the read path can use to wait for catch-up.
  </div>
</div>

## Topic: Choreography vs orchestration & sagas (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Beginner] What is choreography in event-driven systems? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
Choreography is decentralized coordination where each service reacts to events and emits its own, with no central controller — the fulfillment service hears `OrderPlaced` and emits `FulfillmentStarted` on its own. It is loosely coupled and resilient to individual services being down, because nobody orchestrates the whole flow.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What is orchestration and how does it differ from choreography? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Orchestration is centralized coordination where one process (a saga orchestrator or workflow engine) tells each service what to do and in what order, tracking overall progress. Unlike choreography, a timeout or failure is handled by the orchestrator issuing a compensating command rather than hoping someone reacts, at the cost of a coupling point that must be highly available.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] When should you pick choreography versus orchestration? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Use choreography (reactors) for loose coupling and resilience when no one needs to see the whole flow. Use a saga orchestrator when you need to observe the end-to-end process and handle failures with compensating actions, accepting the coupling point it introduces.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] What is a saga and why does it replace a distributed two-phase commit? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
A saga is a sequence of local transactions across services where each step publishes an event, and if a later step fails, earlier steps are undone by compensating actions — charge the card, reserve inventory, and if shipping fails, refund the card. It replaces a distributed two-phase commit (which doesn't work across autonomous services) with a series of reversible local commits.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Scenario] A fraud-check service must start reacting to orders without touching the orders service. Which coordination style fits? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
Choreography fits — because the producer doesn't call anyone, `orders` writes to its outbox and Kafka without naming `fulfillment` or `fraud-check`. You add a new reactor that subscribes to `OrderPlaced` and it catches up by replaying the topic, with no change to the producer.
  </div>
</div>

## Topic: Schema evolution, replay & consumer safety (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Intermediate] How do you evolve an event's schema without breaking existing consumers? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Schema evolution means changing an event's structure without breaking consumers — add optional fields, never remove required ones, and version via the CloudEvents `type` or a schema registry. A consumer written for v1 must still read v2 events, so changes are backward-compatible by rule, and a registry can reject a bad change at publish time.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: [Scenario] A buggy projection computed wrong totals. How do you fix it without losing source data? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Reset the projection's offset and replay the event stream from the beginning (or a snapshot) to rebuild it. Because events are immutable facts, replaying yields the same result, so you can delete the read model and recreate it from the source-of-truth event log — the source data was never in the projection to begin with.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: [Tradeoff] Why is Kafka preferred over a simple queue for event-driven backends? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Kafka is a durable, replayable log: topics retain events so new consumers can replay history and rebuild state, which is exactly what projections and the outbox relay need. A queue typically deletes a message after it's consumed, so you can't rebuild a read model or bootstrap a new consumer from it.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: [Beginner] Is event-driven architecture always better than calling services directly? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
No. Synchronous calls give you an immediate answer and a single transaction; events give you decoupling and resilience at the cost of lag and complexity. Use events for "tell the next thing this happened," and direct calls for "I need the result now."
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: [Expert] What single takeaway should you carry into designing an event-driven system? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Emit events from a transactionally consistent outbox, make every consumer idempotent, and design the UI for eventual consistency. Concretely: adopt CloudEvents for a portable envelope, use the outbox (DB row + relay) instead of publishing after a separate commit, treat the read model as derived and rebuildable by replay, and add a dead-letter path so one poison event can't stall a consumer group.
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 29 across Event-Driven Architecture

[Back to Q&A Index]({{ '/qa/' | relative_url }})

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
  apply();
})();
</script>
