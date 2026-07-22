---
layout: post
title: "System Design Key Terms: CAP, Sharding, and the Distributed-Architecture Vocabulary Behind Every Post"
description: "A standalone glossary of the system-design terms used across this blog's scalability, consistency, caching, and resilience posts — CAP/PACELC, sharding, consistent hashing, replication, CDN cache keys, rate limiting, idempotency, retry budgets, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: system-design
order: 99
tags: [system-design, glossary, scalability]
---

**TL;DR:** This is the reference page for the system-design vocabulary used throughout this blog's scalability, consistency, caching, and resilience posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


The posts in this domain assume you already know what a replication backlog or a consistent-hash ring is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Consistency & replication

### CAP theorem & PACELC
CAP theorem states that during a network partition you must trade off Consistency against Availability — partition tolerance is mandatory in any real distributed system, so it isn't a free choice. PACELC extends it: even when there is no partition, there is an ongoing tradeoff between Latency and Consistency, which is the dial most systems actually sit on day to day. The point is that "pick two" is a description of partition-time behavior, not a permanent architectural switch. See [CAP Theorem & PACELC]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }}).

### Consistency models (strong vs eventual)
A consistency model defines how stale a read may be relative to the latest write. Strong consistency makes every read reflect the most recent write (usually by routing through a single leader), while eventual consistency lets replicas lag and only guarantees convergence over time. The real production question is not a binary toggle but a continuously-tuned dial that trades read latency against staleness. See [CAP Theorem & PACELC]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }}).

### Leader-follower replication
Replication keeps one leader accepting writes and one or more followers applying the same write stream in order so they eventually converge. Followers serve reads and provide redundancy, but a follower's state can lag the leader by some number of writes, so reads served there may be stale by a bounded amount. See [Database Replication]({{ '/system-design/database-replication-partial-resync/' | relative_url }}).

### Replication backlog & partial resync
A leader keeps a bounded ring buffer of recent writes tagged with a monotonically increasing offset, plus a replication lineage ID. When a follower reconnects, the leader checks that the follower's lineage still matches and that its offset is still inside the retained backlog before streaming only the missing slice; otherwise it falls back to a full resync. See [Database Replication]({{ '/system-design/database-replication-partial-resync/' | relative_url }}).

### Quorum / multi-observer agreement
A quorum is the minimum number of independent votes required before a cluster treats a claim — a node is dead, a value is committed — as true. Requiring multiple independent observers prevents one observer's own network problem from unilaterally declaring a healthy node dead. See [Cluster Membership]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }}).

### Follower reads & closed timestamps
A closed timestamp is a leader's promise that no write will ever land below a given timestamp; once a follower has received a closed timestamp at or above a read's target time, it can serve that read locally without contacting the leader. The published timestamp is always slightly behind real "now" by a computed lead time (network RTT, clock skew, Raft propagation delay), which is the explicit price paid in staleness for lower-latency, available reads. See [CAP Theorem & PACELC]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }}).

## Scaling & partitioning

### Vertical vs horizontal scaling
Vertical scaling makes a single node bigger (more CPU/RAM); horizontal scaling runs more nodes sharing the work. Vertical hits a hard physical and pricing ceiling and stays a single point of failure; horizontal removes that ceiling but introduces the problem of deciding which node handles each unit of work. See [Scalability]({{ '/system-design/scalability-vertical-vs-horizontal-scaling/' | relative_url }}).

### Load-aware placement
Load-aware placement scores a small, randomized sample of candidate nodes on live signals (CPU, memory, active work count) and routes the new unit of work to the best-scoring one, rather than blindly round-robining. Checking every node is itself a coordination bottleneck, so sampling roughly √N candidates gets near-equal decision quality at a fraction of the cost. See [Scalability]({{ '/system-design/scalability-vertical-vs-horizontal-scaling/' | relative_url }}).

### Load balancer (L4/L7)
An L4 load balancer picks a backend once per TCP connection and is blind to individual HTTP requests; an L7 load balancer understands HTTP and can pick a backend per request. Modern proxies default to load-aware algorithms — such as power-of-two-choices, which samples a couple of random healthy hosts and routes to the least-loaded — instead of exact global least-connections, which would require perfectly synchronized state across every proxy instance. See [Load Balancing]({{ '/system-design/load-balancing-algorithms-and-health-checks/' | relative_url }}).

### Health checks
A health check removes an unhealthy backend from the pool a load-balancing algorithm samples from, upstream of any routing logic — the algorithm never has to reason about health directly. This separation is why a failed node stops receiving traffic without the balancing algorithm needing to know why it failed. See [Load Balancing]({{ '/system-design/load-balancing-algorithms-and-health-checks/' | relative_url }}).

### Sharding & partitioning
Sharding splits a dataset across many independent instances by key once a single instance can't hold the data or serve the throughput. The hard part is deterministic routing: given any key, the system must always know which shard owns it, without a lookup table that becomes its own bottleneck or single point of failure. See [Database Sharding]({{ '/system-design/database-sharding-vindex-and-keyranges/' | relative_url }}).

### Vindex & keyspace ID routing
A Vindex deterministically maps a primary key to a keyspace ID via a hash function; Vitess uses a reversible hash so it can also recover the original key from a keyspace ID. Each shard then owns a byte-range interval, and routing is a pure range-contains comparison rather than a modulo that would remap nearly every key on resharding. See [Database Sharding]({{ '/system-design/database-sharding-vindex-and-keyranges/' | relative_url }}).

### Consistent hashing
Consistent hashing places servers on a conceptual ring and routes each key to the next server clockwise from the key's hash, so adding or removing a server only remaps the small arc near its new position instead of the whole keyspace. Virtual nodes — multiple ring points per server — smooth out the otherwise-lumpy load distribution that a single point per server produces. See [Consistent Hashing]({{ '/system-design/consistent-hashing-ring-and-virtual-nodes/' | relative_url }}).

### Message queues & partitioning
A message queue decouples producers from consumers by buffering events; Kafka splits a topic into independent, ordered partitions so different keys spread across partitions for parallel processing while messages sharing a key stay ordered within one partition. A consumer group assigns each partition to exactly one consumer, which caps useful parallelism at the partition count, not the consumer count. See [Message Queues]({{ '/system-design/message-queues-partitioning-and-ordering/' | relative_url }}).

### Capacity planning & arrival rate
Capacity planning starts from a Fermi estimate (DAU × sessions × requests × peak ratio) that yields a target requests/second; a load test must hold that arrival rate steady rather than fixing a virtual-user count, because VU count only equals rate through response time — the very variable under test. k6's constant-arrival-rate executor decouples the two and reports dropped iterations as the actual bottleneck signal (this is Little's Law in reverse: concurrency = arrival_rate × response_time). See [Capacity Planning]({{ '/system-design/capacity-planning-arrival-rate-not-just-vu-count/' | relative_url }}).

### LSM tree & compaction
An LSM-tree never updates data in place; writes append to an in-memory memtable and are flushed as immutable sorted SSTables, trading read-time fan-out (a key may live in several levels) for fast sequential writes. Background compaction merges those files and pushes them down levels to bound read cost and reclaim space from overwritten or deleted keys; compaction falling behind is a distinct operational failure mode B-tree engines don't have. See [LSM Trees]({{ '/system-design/lsm-trees-and-compaction-at-scale/' | relative_url }}).

## Caching & delivery

### Cache-aside vs write-through
Cache-aside has the application check the cache, fall back to the database on a miss, and invalidate on write; write-through has every write flow through the cache, which then propagates to the database. Cache-aside keeps the database authoritative but leaves a race window on write; write-through always serves the latest write from the cache at the cost of write-path complexity. See [Caching Strategies]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }}).

### TTL & eviction
A TTL bounds worst-case staleness (eventual removal) but does not keep a cache correct the instant the underlying data changes — explicit invalidation on write does that, with TTL as the safety net. When the cache fills, eviction samples a few random keys, scores them by idle time or inverse frequency, and evicts the worst from a small candidate pool, giving constant-memory approximation instead of a perfectly-ordered LRU list. See [Caching Strategies]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }}).

### Active & lazy expiration
Lazy expiration removes a key only when something tries to read it and finds it past its TTL; active expiration is a separate periodic background cycle that proactively deletes expired keys even if nobody reads them again. Lazy alone leaks memory for unread keys; active alone wastes CPU re-scanning keys lazy access would have cleaned anyway. See [Caching Strategies]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }}).

### CDN & cache keys
A CDN sits in front of an origin and serves repeat requests without hitting the backend, but caching a personalized response and serving it to another user is a cross-user data-leak risk. The default safety rule bypasses the cache for any request carrying a Cookie or Authorization header, and marks a response uncacheable if the origin sets a cookie or sends no-store/private — and the cache key is built from URL plus Host, not URL alone. See [CDN Caching Rules]({{ '/system-design/cdn-caching-rules-and-stampede-protection/' | relative_url }}).

### Stampede protection (hit-for-miss)
When an origin response turns out to be uncacheable, hit-for-miss marks the cache key itself uncacheable for a bounded window instead of just skipping storage for that one response. Without it, a burst of concurrent requests for a never-cacheable URL would each independently hit the origin, hammering it exactly when load is highest. See [CDN Caching Rules]({{ '/system-design/cdn-caching-rules-and-stampede-protection/' | relative_url }}).

### Cursor pagination
Cursor pagination names a real position in the data's own ordering (an object ID, or a topological/stream pair) rather than an offset or page number, so paging stays correct even while rows are inserted, deleted, or backfilled between requests. It also avoids requiring the server to compute a total count, which breaks down once data is sharded across nodes. See [API Design for Scale]({{ '/system-design/api-design-for-scale-versioning-pagination-idempotency/' | relative_url }}).

## Resilience

### RPC failure semantics
A network call has a third outcome a local function call doesn't: the caller cannot tell whether the callee did the work when the response is lost or the call times out. Retrying blindly can duplicate a non-idempotent effect, and retrying without a shared sense of scale can amplify the very overload that triggered the failure. See [RPC Failure Semantics]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }}).

### Timeouts & per-try timeout
A timeout bounds how long a caller waits for a response; a per-try timeout bounds a single attempt separately from the overall budget so one hung attempt can't consume the entire allowance and leave nothing for a retry. Without it, a request that times out is silently never retried. See [RPC Failure Semantics]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }}).

### Retry budget & circuit breaker
A retry budget caps concurrent retries as a percentage of currently active plus pending requests (floored at a minimum), not a flat count, so retries can never become an unbounded multiplier of load during a partial outage. It lives on the cluster's circuit breaker, where it can see traffic the per-request retry policy alone cannot. See [RPC Failure Semantics]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }}).

### Exponential backoff with jitter
Backoff spaces retries out to let a struggling dependency recover, but a purely exponential (non-randomized) backoff still synchronizes: every caller that failed at the same instant retries at the same instant again. Full jitter returns a uniformly random delay between zero and the current interval so failed requests scatter instead of re-converging into another spike. See [RPC Failure Semantics]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }}).

### Idempotency
Idempotency is the property that repeating a request produces the same effect as doing it once, which is what makes a retried write safe when its original response was lost. It is realized by a client-generated key (an Idempotency-Key header, or retry-safe HTTP methods) that the server recognizes and de-duplicates on retry — a signal the server cannot invent after the fact. See [API Design for Scale]({{ '/system-design/api-design-for-scale-versioning-pagination-idempotency/' | relative_url }}).

### Rate limiting (distributed)
A per-instance in-memory counter only sees its own traffic, so behind a load balancer the effective limit becomes the configured limit multiplied by instance count. The fix moves the counter into shared state (e.g. Redis) that every instance atomically increments and expires, with a local cache of already-over-limit clients and jittered TTLs to avoid a thundering herd at window boundaries. See [Distributed Rate Limiting]({{ '/system-design/distributed-rate-limiting-shared-state/' | relative_url }}).

### Leaky bucket (per-key)
A leaky-bucket limiter gives each key its own bucket that fills with "cost" as actions occur and drains continuously at a fixed rate, allowing a burst up to a cap but denying sustained sending above the rate. Keying it per user (not one global bucket) means one abusive account hitting its limit never starves other users, and a denied attempt must leave the bucket unchanged so a legitimate retry after backoff isn't penalized. See [Chat Homeserver Case Studies]({{ '/system-design/real-world-system-design-case-studies-chat-homeserver/' | relative_url }}).

### Cluster membership & failure detection (SWIM/gossip)
Detecting a dead node is hard because one observer's inability to reach a peer could be that observer's own network problem; SWIM-style protocols require multiple independent missed-probe votes before gossiping a node dead. Monitoring is deliberately bounded (each node watches a subset of peers, not all-to-all) and membership propagates by gossip rather than a central coordinator. See [Cluster Membership]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }}).

### API versioning (dated pin)
Dated versioning sends a version string (e.g. a date) per request or per account instead of a coarse v1/v2 path segment, letting the server ship many small breaking changes without forcing a synchronized mass migration. Each account stays pinned to the version it integrated against and only moves forward when it opts in, so the server evolves field-by-field on one underlying implementation. See [API Design for Scale]({{ '/system-design/api-design-for-scale-versioning-pagination-idempotency/' | relative_url }}).

### Backpressure
Backpressure is a system's way of signaling upstream producers to slow down when a downstream stage is overloaded, rather than letting work pile up unbounded and fail. In this blog's posts it appears concretely as retry budgets capping concurrent retries and rate limiters (leaky buckets) denying writes when a key's budget is exhausted — both convert overload into a bounded, explicit signal instead of a retry storm or queue collapse. See [RPC Failure Semantics]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }}).

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.




