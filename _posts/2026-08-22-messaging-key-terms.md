---
layout: post
title: "Messaging Key Terms: Kafka, RabbitMQ, and the Delivery Vocabulary Behind Every Post"
description: "A standalone glossary of messaging terms used across this blog's integration posts — brokers, topics, partitions, consumer groups, exactly-once, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: messaging
order: 99
tags: [messaging, glossary, kafka, rabbitmq, grpc]
---

**TL;DR:** This is the shared vocabulary for every messaging post on this blog — brokers, topics, partitions, consumer groups, delivery semantics, and the RabbitMQ/Kafka/gRPC pieces — each term defined in isolation so you can jump in from any later article.

## Brokers & models

### Message broker
A broker is a standalone server that receives messages from producers and delivers them to consumers, holding them durably so neither side must be online at the same time. It is the decoupling layer: producers and consumers only know the broker's address, never each other's. Apache Kafka and RabbitMQ are both brokers, just built around different delivery models.

### Queue
A queue is an ordered, FIFO buffer of messages owned by the broker; each message is delivered to exactly one consumer that pulls from it. RabbitMQ's classic work-queue is the canonical form, where competing workers drain one shared queue. Queues give you point-to-point delivery and natural load balancing across consumers.

### Topic
A topic is a named, append-only log or category of events that producers publish to and many consumers can subscribe to independently. In Kafka a topic is the unit of organization; in RabbitMQ the analogous fan-out target is a topic exchange plus bound queues. Publishing to a topic does not know or care who is listening.

### Publish/subscribe
Publish/subscribe (pub/sub) is the delivery model where one published message is copied to every subscriber's queue or read position, so many independent consumers react to the same event. It is the opposite of a work-queue: the event is broadcast, not consumed once. This is how an "order placed" event can trigger fulfillment, analytics, and email at the same time.

### Point-to-point
Point-to-point is the delivery model where a message is consumed by exactly one receiver out of a pool of competing consumers, typically from a single shared queue. It is the load-balancing pattern: ten workers on one queue means each message is handled by one of them. RabbitMQ work-queues are point-to-point; Kafka consumer groups achieve the same effect per partition.

## Kafka

### Partition
A partition is an ordered, immutable sequence of records within a Kafka topic, each assigned a monotonically increasing offset. A topic is split into N partitions so it can be parallelized and scaled across brokers and consumers. Ordering is guaranteed only within a single partition, never across the whole topic.

### Partition key
A partition key is a value (often a field like `order_id`) hashed by the producer to decide which partition a record lands on. Records with the same key always go to the same partition, which is how you keep all events for one entity strictly ordered. Choosing a poorly distributed key creates hot partitions that one consumer must shoulder alone.

### Consumer group
A consumer group is a named set of consumers that share the work of reading a topic, with each partition assigned to exactly one member of the group. Adding consumers scales throughput up to the partition count, after which extra consumers sit idle. Kafka tracks the group's progress with a single committed offset per partition.

### Consumer group rebalancing
When a consumer joins or leaves a group, Kafka redistributes partitions among the remaining consumers — this is a rebalance. During the rebalance, processing pauses briefly while partitions are reassigned. Assignment strategies include Range (assign contiguous partitions), RoundRobin (distribute evenly), and Sticky (minimize partition movement). If a consumer crashes mid-processing before committing its offset, the rebalance hands its partitions to another consumer, which may reprocess messages already handled.

### Offset
An offset is the integer position of a record within a Kafka partition, and the consumer group's committed offset marks the next record to read. Because the log is durable, a consumer can rewind by resetting its offset to replay or reprocess history. The consumer tracks the current offset in memory and commits periodically to Kafka's internal `__consumer_offsets` topic for durability.

### Kafka
Apache Kafka is a distributed, log-based broker where topics are partitioned and replicated across a cluster of broker nodes for durability and scale. Producers append records; consumers pull from partitions and track their own offsets, so the broker stays stateless about readers. Its design favors high-throughput, replayable event streams over low-latency per-message routing.

## RabbitMQ

### RabbitMQ
RabbitMQ is an AMQP-based broker that routes individual messages through exchanges and bindings into queues, optimized for flexible routing and per-message delivery guarantees. Unlike Kafka's log, RabbitMQ removes a message from the queue once it is acknowledged, so messages are not replayable by default. It excels at task queues and complex routing rather than high-volume event replay.

### Exchange
An exchange is the RabbitMQ entry point that receives published messages and decides, based on its type and the message's routing key, which bound queues receive a copy. Common types are direct, topic, fanout, and headers, each implementing a different matching rule. A producer never publishes directly to a queue; it always publishes to an exchange.

### Routing key
A routing key is a short string attached to a message that the exchange matches against queue bindings to decide delivery. In a topic exchange it is dot-separated (e.g. `order.created`) and supports `*` and `#` wildcards in the binding pattern. It is the addressing mechanism that lets one exchange fan messages out to the right subset of queues.

### Binding
A binding is the rule linking an exchange to a queue (optionally with a routing-key pattern) that tells the exchange when to route a message into that queue. Without a binding, a queue receives nothing even if it exists. Bindings are how you wire a topology: declare the exchange, declare the queue, then bind them with the keys you care about.

### AMQP
AMQP (Advanced Message Queuing Protocol) is the open wire and broker-behavior standard that RabbitMQ implements, defining exchanges, queues, bindings, and acknowledgements. It gives you broker-confirmed publishes, consumer acknowledgements, and transactional semantics at the protocol level. The 0-9-1 variant is what RabbitMQ speaks; 1.0 is a different, broker-agnostic standard.

## Delivery & reliability

### Delivery semantics: at-most-once
At-most-once means a message is delivered zero or one time — the broker may drop it if the consumer fails before acknowledging, and it is never resent. You get this by auto-acknowledging on receipt, which trades durability for simplicity. It is the right choice only when losing an occasional message is acceptable.

### Delivery semantics: at-least-once
At-least-once means a message is delivered one or more times — the broker resends until it sees an acknowledgement, so a crash before ack causes a duplicate. This is the default in both Kafka (offset committed after processing) and RabbitMQ (message requeued on nack). You must make consumers tolerate duplicates to be correct under this guarantee.

### Delivery semantics: exactly-once
Exactly-once means a message's effect is applied precisely one time, even across retries and crashes — usually achieved by combining idempotent writes with transactional offset/state commits, not by literally sending once. Kafka offers this via the transactional producer and the read-committed isolation level. It is the hardest guarantee and carries real throughput cost, so it is reserved for cases where duplicates are genuinely unacceptable.

### TTL / message expiry
RabbitMQ supports per-message TTL (time-to-live) natively — messages expire after a configured duration and are either dropped or routed to a dead-letter exchange. Kafka has no per-message TTL; instead it uses log retention policies (`log.retention.hours`, `log.retention.bytes`) that delete entire log segments once they age out. This means Kafka cannot expire individual messages, only ranges of the log based on time or size thresholds.

### Dead-letter queue
A dead-letter queue (DLQ) is a separate queue where messages are moved after repeated delivery failures or expiry so they stop poisoning the main pipeline. RabbitMQ routes to it on reject/nack-with-requeue-false or TTL; Kafka needs an outbox or a separate topic since the log has no built-in reject path. The DLQ lets you inspect, fix, and replay poison messages without blocking healthy traffic.

### Outbox pattern
The outbox pattern solves the dual-write problem: instead of publishing an event to Kafka in the same transaction as a database write (which risks inconsistency if either fails), you write the event to an "outbox" table in the DB as part of the same transaction. A separate process — either CDC-based polling or a tool like Debezium — reads the outbox and publishes to Kafka. This guarantees at-least-once delivery without requiring a two-phase commit between the database and the broker.

### Schema Registry
A Schema Registry is a service that stores and enforces message schemas (Avro, Protobuf, JSON Schema) for a Kafka cluster. Producers register their schema before publishing, and consumers fetch the schema to deserialize messages, which prevents producers from sending structurally incompatible records. Confluent Schema Registry is the reference implementation and adds schema evolution rules (backward, forward, full compatibility) so producers can evolve message formats without breaking existing consumers.

### Idempotent consumer
An idempotent consumer is one that produces the same result whether a message is handled once or five times, typically by keying its write on a unique message or event ID. This is what makes at-least-once delivery safe in practice. Common tricks are a dedupe table of seen IDs or an upsert keyed on the natural business key.

### Backpressure
Backpressure is the mechanism by which a slow or overloaded consumer signals or forces the producer/broker to slow down so the system does not buffer unbounded work and fall over. In Kafka it shows up as consumer lag and can be managed by scaling the group or throttling producers; in RabbitMQ, prefetch (QoS) limits how many unacked messages a consumer holds. Without it, a brief slowdown cascades into memory exhaustion or data loss.

### Event vs command
An event is a fact that already happened ("order placed") and is broadcast for anyone interested, while a command is a request for one receiver to do something ("send this email"). Events drive pub/sub and decoupling; commands drive point-to-point and explicit routing. Mixing them up — publishing a command as if it were an event — is a frequent source of double-processing bugs.

### Schema / serialization (Avro, Protobuf, JSON)
Serialization is how a message's structured data is encoded onto the wire, and a schema (Avro, Protobuf, JSON Schema) defines that structure so producers and consumers agree on the bytes. Avro and Protobuf are compact binary formats with enforced schemas and backward compatibility; JSON is human-readable but schema-optional and verbose. Kafka commonly pairs Protobuf/Avro with a Schema Registry so evolving a message does not break old consumers.

## RPC & realtime

### gRPC
gRPC is a high-performance RPC framework over HTTP/2 that uses Protobuf for strongly-typed request/response contracts, ideal for synchronous service-to-service calls. Unlike a broker, it is a direct, connection-oriented call: the client blocks for a response from one server. It is the sync counterpart to async messaging and shows up throughout this blog's service topologies.

### SignalR
SignalR is ASP.NET Core's realtime library that pushes messages from server to connected browser clients over WebSockets (with long-polling fallback). It is a server-initiated push channel, not a durable broker, so a disconnected client misses messages unless you persist and replay them yourself. It is the right tool for live UI updates rather than reliable backend integration.

### WebSocket
WebSocket is a full-duplex, long-lived TCP connection (upgraded from HTTP) that lets a server and client stream messages both ways without reopening a connection. It underpins SignalR and most realtime browser features, but it has no delivery guarantees, no replay, and no built-in routing. Treat it as a transport, not a broker.

---

Reference: terms here map directly to components in [apache/kafka](https://github.com/apache/kafka), [rabbitmq/rabbitmq-server](https://github.com/rabbitmq/rabbitmq-server), [grpc/grpc](https://github.com/grpc/grpc), and [dotnet/aspnetcore](https://github.com/dotnet/aspnetcore) (SignalR).
