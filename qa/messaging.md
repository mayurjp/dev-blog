---
layout: page
title: "Messaging & Integration Interview Questions: 35 Real-World Q&A from Production Manifests"
description: "35 interview-ready Messaging & Integration questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/messaging/
---

Bite-sized, standalone interview questions and answers for Messaging & Integration. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

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

## Topic: Brokers & delivery semantics (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is the core difference between a direct service call and messaging? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A direct call is one service invoking another over the network and blocking for an answer, like gRPC. Messaging replaces "call and wait" with "write to a broker and move on" — the producer returns immediately and the broker holds the message until a consumer is ready. The win is decoupling; the cost is that you inherit delivery problems like duplicates, ordering, and stuck messages.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is a message broker, and what decoupling does it provide? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A broker is a standalone server that receives messages from producers and delivers them to consumers, holding them durably so neither side must be online at the same time. Producers and consumers only know the broker's address, never each other's. Apache Kafka and RabbitMQ are both brokers, just built around different delivery models.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is at-least-once delivery, and why is it the default in Kafka and RabbitMQ? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
At-least-once means a message is delivered one or more times — the broker resends until it sees an acknowledgement, so a crash before ack causes a duplicate. This is the default in both Kafka (offset committed after processing) and RabbitMQ (message requeued on nack). You must make consumers tolerate duplicates to be correct under this guarantee.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Comparison] How does at-least-once differ from at-most-once and exactly-once? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
At-most-once delivers zero or one time and may drop a message on failure (achieved by auto-acking on receipt). At-least-once resends until acked, risking duplicates. Exactly-once applies an effect precisely once, usually via idempotent writes plus transactional offset/state commits, carrying real throughput cost — so it is reserved for cases where duplicates are genuinely unacceptable.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] Fulfillment processes an order, then crashes before committing its offset, and reprocesses the same order on restart — shipping two boxes. Which delivery semantic caused this, and what fixes it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
This is at-least-once delivery producing a duplicate after a crash before acknowledgement. The fix is an idempotent consumer that deduplicates on a message or business ID, so reprocessing the same order yields the same result (one shipment) instead of a second box.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Kafka partitions & consumer groups (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is a partition in Kafka, and how does it relate to ordering? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A partition is an ordered, immutable sequence of records within a Kafka topic, each assigned a monotonically increasing offset. A topic is split into N partitions so it can be parallelized and scaled across brokers and consumers. Ordering is guaranteed only within a single partition, never across the whole topic.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does a partition key do, and why does choosing it well matter? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A partition key is a value (often a field like `order_id`) hashed by the producer to decide which partition a record lands on, so records with the same key always go to the same partition and stay strictly ordered. Choosing a poorly distributed key creates hot partitions that a single consumer must shoulder alone.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] You partition by `user_id` but need per-`order_id` ordering, and events for the same order get processed out of sequence. What went wrong? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Ordering is guaranteed only within a partition, and your key selected the wrong partition boundary. Because `order_id` events spread across different `user_id` partitions, they are processed out of sequence. Choose the partition key to match the ordering you actually need — partition by `order_id`, not `user_id`.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a consumer group, and how does adding consumers scale throughput? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A consumer group is a named set of consumers that share the work of reading a topic, with each partition assigned to exactly one member of the group. Adding consumers scales throughput up to the partition count, after which extra consumers sit idle. Kafka tracks the group's progress with a single committed offset per partition.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Tradeoff] What is the practical limit on scaling a consumer group, and what happens beyond it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A consumer group scales up to the partition count — each partition is read by exactly one member, so extra consumers beyond that count sit idle. The design takeaway is to size the group to (but not beyond) the number of partitions, and to monitor consumer lag as the signal of whether consumers are keeping up.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

## Topic: RabbitMQ exchanges & routing (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is a RabbitMQ exchange, and why does a producer never publish to a queue directly? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An exchange is the RabbitMQ entry point that receives published messages and decides, based on its type and the message's routing key, which bound queues receive a copy. A producer never publishes directly to a queue; it always publishes to an exchange, which then routes via bindings.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a routing key, and how does it work with a topic exchange? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A routing key is a short string attached to a message that the exchange matches against queue bindings to decide delivery. In a topic exchange it is dot-separated (e.g. `order.created`) and supports `*` and `#` wildcards in the binding pattern. It is the addressing mechanism that lets one exchange fan messages out to the right subset of queues.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Concept] What is a binding, and what happens if a queue has no binding? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A binding is the rule linking an exchange to a queue (optionally with a routing-key pattern) that tells the exchange when to route a message into that queue. Without a binding, a queue receives nothing even if it exists. Bindings are how you wire a topology: declare the exchange, declare the queue, then bind them with the keys you care about.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Comparison] How does message acknowledgement differ between Kafka and RabbitMQ? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
RabbitMQ uses per-message acknowledgement: a worker pulls a message, processes it, and acks it, at which point RabbitMQ deletes it — there is no replay once acked. Kafka uses per-partition offset commits after processing, and the log is durable so a consumer can rewind; the broker does not delete records on read.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Kafka vs RabbitMQ: pub/sub vs point-to-point (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Comparison] When should you choose Kafka over RabbitMQ? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Use Kafka when many independent systems need the same event stream, when you need replay, or when throughput and ordering-per-key dominate. Use RabbitMQ when you need flexible routing, per-message ack, and a simple work-queue where each task is done exactly once by one worker. Real systems often run Kafka as the event backbone and RabbitMQ for task queues.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Concept] What is publish/subscribe, and how does it contrast with point-to-point? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Pub/sub is the delivery model where one published message is copied to every subscriber's queue or read position, so many independent consumers react to the same event — it broadcasts, not consumes once. Point-to-point delivers a message to exactly one receiver out of a pool of competing consumers, giving load balancing. RabbitMQ work-queues are point-to-point; Kafka consumer groups achieve the same effect per partition.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] An "order placed" event should trigger fulfillment, analytics, and email simultaneously. Which model fits, and why? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Pub/sub fits: one published "order placed" event is copied to every subscriber so fulfillment, analytics, and email all react independently. Broadcast (not consume-once) is exactly the point — a topic or fan-out target reaches multiple systems at once. Point-to-point would wrongly deliver it to only one consumer.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Concept] What is a Kafka topic, and how does RabbitMQ express the same fan-out idea? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A topic is a named, append-only log or category of events that producers publish to and many consumers subscribe to independently; publishing to a topic does not know or care who is listening. In RabbitMQ the analogous fan-out target is a topic exchange plus bound queues. Both let many consumers react to the same category of message.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: Poison messages & reliability (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is a poison message, and what harm does it cause? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A malformed or always-failing message can be requeued forever, blocking a RabbitMQ queue, or be endlessly retried by a Kafka consumer, driving up lag. One bad record can stall healthy traffic if it is never moved aside. The fix is to route failures to a dead-letter queue after a retry budget.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a dead-letter queue, and how do Kafka and RabbitMQ differ in supporting it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A DLQ is a separate queue where messages are moved after repeated delivery failures or expiry so they stop poisoning the main pipeline. RabbitMQ routes to it on reject/nack-with-requeue-false or TTL; Kafka needs an outbox or a separate topic since the log has no built-in reject path. The DLQ lets you inspect, fix, and replay poison messages without blocking healthy traffic.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Concept] What is an idempotent consumer, and how is it typically implemented? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An idempotent consumer produces the same result whether a message is handled once or five times, typically by keying its write on a unique message or event ID. This is what makes at-least-once delivery safe in practice. Common tricks are a dedupe table of seen IDs or an upsert keyed on the natural business key.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] A brief consumer slowdown turns into a long backlog of stale data. Which two mechanisms should you have in place? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You need backpressure and consumer-group scaling. Without backpressure or scaling the group up to the partition count, a brief slowdown becomes a long backlog — in Kafka this shows up as growing consumer lag, and in RabbitMQ as growing queues. Prefetch (QoS) limits unacked messages in RabbitMQ; scaling or producer throttling helps in Kafka.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is backpressure, and how does it manifest in Kafka versus RabbitMQ? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Backpressure is the mechanism by which a slow or overloaded consumer signals or forces the producer/broker to slow down so the system does not buffer unbounded work and fall over. In Kafka it shows up as consumer lag and is managed by scaling the group or throttling producers; in RabbitMQ, prefetch (QoS) limits how many unacked messages a consumer holds. Without it, a brief slowdown cascades into memory exhaustion or data loss.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: gRPC & realtime (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Beginner] What is gRPC, and when is it the right tool versus a broker? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
gRPC is a high-performance RPC framework over HTTP/2 that uses Protobuf for strongly-typed request/response contracts, ideal for synchronous service-to-service calls. Unlike a broker, it is a direct, connection-oriented call where the client blocks for a response from one server. For synchronous request/response you reach for gRPC; brokers are for backend-to-backend integration, not direct user push.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Comparison] How does SignalR differ from a messaging broker like Kafka or RabbitMQ? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
SignalR is ASP.NET Core's realtime library that pushes messages from server to connected browser clients over WebSockets, a server-initiated push channel — not a durable broker. A disconnected client misses messages unless you persist and replay them yourself. It is the right tool for live UI updates, whereas brokers handle reliable backend integration.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Concept] What is WebSocket, and why is it a transport rather than a broker? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
WebSocket is a full-duplex, long-lived TCP connection upgraded from HTTP that lets a server and client stream messages both ways without reopening a connection. It underpins SignalR and most realtime browser features, but it has no delivery guarantees, no replay, and no built-in routing. It is a transport, not a broker.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: Events vs commands & serialization (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Concept] What is the difference between an event and a command in messaging? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An event is a fact that already happened ("order placed") and is broadcast for anyone interested, while a command is a request for one receiver to do something ("send this email"). Events drive pub/sub and decoupling; commands drive point-to-point and explicit routing. Mixing them up — publishing a command as if it were an event — is a frequent source of double-processing bugs.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] A "send this email" command was published to a Kafka topic and consumed by two workers, sending the email twice. What anti-pattern caused this? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The command was published as if it were an event — commands are requests for one receiver and should use point-to-point routing (e.g., a RabbitMQ work-queue), not broadcast pub/sub. Broadcasting a command lets multiple consumers act on it, causing double-processing. Distinguish event (broadcast) from command (single receiver) before choosing the delivery model.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Comparison] How do Avro, Protobuf, and JSON compare as message serialization formats? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Serialization encodes a message's structured data onto the wire, and a schema (Avro, Protobuf, JSON Schema) defines that structure so producers and consumers agree on the bytes. Avro and Protobuf are compact binary formats with enforced schemas and backward compatibility; JSON is human-readable but schema-optional and verbose. Kafka commonly pairs Protobuf/Avro with a Schema Registry so evolving a message does not break old consumers.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Tradeoff] Why would a real system run both Kafka and RabbitMQ instead of picking one? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
They solve different problems: Kafka is for high-throughput, replayable event streams consumed by many systems, while RabbitMQ is for routed, acked work items handled by one worker. The order example uses Kafka for the event backbone (order placed) and RabbitMQ for a task queue (send email). Running both matches each message to its natural delivery model rather than forcing one broker to do both poorly.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Exactly-once, outbox & schema evolution (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] What is exactly-once delivery and why is it hard? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Exactly-once means each message is processed exactly one time — no duplicates, no losses. In practice, no distributed system can guarantee this across the network (messages can be duplicated by the broker, the network, or the consumer). Kafka approximates it via idempotent producers (`enable.idempotence=true`) and transactional consumers (`read_committed` isolation), but this adds latency and limits throughput. Most systems settle for at-least-once delivery combined with idempotent consumers (deduplication on the consumer side) as a more practical tradeoff.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] What happens when a consumer in a group crashes or is added? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Kafka triggers a rebalance: partitions are redistributed among the remaining (or new) consumers in the group. During the rebalance, processing pauses briefly — no consumer processes the affected partitions. After rebalance, each consumer resumes from its last committed offset. If the consumer crashed mid-processing (before committing), the new owner re-processes those messages, causing duplicates. This is why at-least-once + idempotent consumers is the standard pattern.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Expert] How does the outbox pattern solve the dual-write problem? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The dual-write problem: you want to write to the database and publish an event to Kafka, but these are two separate operations that can't be atomic without two-phase commit. The outbox pattern writes the event to an "outbox" table in the same database transaction as the business data. A separate process (CDC via Debezium, or a polling publisher) reads the outbox table and publishes events to Kafka. This guarantees at-least-once delivery without distributed transactions, because the event and the data are in the same transactional boundary.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Intermediate] What is a Schema Registry and why do you need one? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A Schema Registry stores message schemas (Avro, Protobuf) and enforces compatibility rules when a producer registers a new version. It prevents a producer from publishing a message that breaks existing consumers — for example, removing a required field or changing a type. The producer fetches the schema ID, includes it in the message header, and the consumer uses it to deserialize. Without a registry, schema evolution is a manual coordination process between producer and consumer teams.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: [Scenario] What do you do with messages in a dead-letter queue? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A DLQ accumulates messages that repeatedly failed processing (poison messages, malformed data, downstream dependency down). First, inspect the message to understand why it failed — check the original error, the message shape, and the consumer logs. If it's a bug, fix the consumer and replay the DLQ. If it's bad data, decide whether to fix the data, transform it, or discard it. Most systems need a DLQ replay mechanism (re-publish to the original topic after fixes) — without it, DLQ messages become permanently lost.

<p class="qa-link">[Full post →]({{ '/messaging/messaging-key-terms/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 35 across Messaging & Integration

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
