---
layout: post
title: "Databases Key Terms: ACID, Index, and Replication — the Data Vocabulary Behind Every Post"
description: "A standalone glossary of the database terms used across this blog's storage, transactions, and scaling posts — ACID, WAL, MVCC, B-tree, query plans, sharding, partitioning, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: databases
order: 99
tags: [databases, glossary, sql]
---

**TL;DR:** This is the reference page for the database vocabulary used throughout this blog's storage, transactions, and scaling posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it from definition to mechanism.

The posts in this domain assume you already know what a B-tree is, what isolation level you're running at, or why a shard key is not a search filter. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Transactions & consistency

### ACID
ACID is the four-property contract a transaction engine promises: Atomicity (all-or-nothing visibility), Consistency (constraints hold before and after), Isolation (concurrent transactions don't corrupt each other's view), and Durability (a committed change survives a crash). Durability is not unconditional — Postgres gates the physical flush of the WAL record behind `synchronous_commit`, and setting it to `off` trades guaranteed durability for lower write latency, so "ACID" names a *tunable* boundary, not a fixed guarantee.

**Deep dive:** [Transactions & ACID]({{ '/databases/transactions-acid-postgres-durability-gate/' | relative_url }})

### WAL (Write-Ahead Log)
The WAL is the append-only, ordered record of every change a database makes, written *before* the change is considered durable — a crash can always be recovered by replaying these records. A commit normally forces the relevant WAL record to disk with an `fsync` before telling the client "committed," which is the mechanism that makes durability real rather than aspirational.

**Deep dive:** [Transactions & ACID]({{ '/databases/transactions-acid-postgres-durability-gate/' | relative_url }})

### Point-in-Time Recovery (PITR)
PITR restores a base backup and then replays WAL records in order until it reaches a configured recovery target — a timestamp, transaction ID, or LSN — and halts exactly there, landing the database at an arbitrary moment instead of at the last full backup. Recovery granularity comes from the WAL, not from backup frequency: a daily backup can still recover to the transaction immediately before an afternoon mistake, provided the WAL archive covering that day survived.

**Deep dive:** [Point-in-Time Recovery]({{ '/databases/point-in-time-recovery-wal-replay-target/' | relative_url }})

### Transaction isolation levels
An isolation level decides how often a transaction's view of the data is refreshed, which in turn determines which anomalies it can observe. READ COMMITTED takes a fresh snapshot before every statement (allowing non-repeatable reads), while REPEATABLE READ reuses one snapshot for the whole transaction (preventing them); SERIALIZABLE adds predicate locking on top. The level is a tradeoff between anomaly-freedom and concurrency, not a simple "higher is better."

**Deep dive:** [Isolation Levels]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})

### MVCC (Multi-Version Concurrency Control)
MVCC gives each transaction a frozen snapshot — a record of which transaction IDs were still in-progress at a moment — and decides row visibility by comparing a row version's creating transaction ID against that snapshot, not against the row's live commit state. Because visibility is a property of the snapshot, a reader never locks a writer and a writer never locks a reader; consistency comes from each transaction seeing its own private, stable version of history.

**Deep dive:** [Isolation Levels & MVCC]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})

### Concurrency anomalies (dirty / non-repeatable / phantom reads)
A dirty read sees another transaction's *uncommitted* changes; a non-repeatable read sees different results for the same query because another transaction committed in between; a phantom read sees newly inserted rows appear in a repeated range query. These are the specific failure modes isolation levels exist to suppress, and which ones a given level permits is the practical meaning of the level's name.

**Deep dive:** [Isolation Levels & MVCC]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})

### Database migrations (dirty flag)
A migration tool marks the target schema version "dirty" in its tracking table *before* running the migration's SQL and only clears it after success, so a crash mid-migration leaves a flag that makes every subsequent run refuse rather than retry blindly. The flag captures the ambiguous in-between state a plain version counter cannot — "started and crashed" vs "completed" — forcing a human to inspect before anything proceeds.

**Deep dive:** [Database Migrations]({{ '/databases/database-migrations-dirty-flag-zero-downtime/' | relative_url }})

## Storage & indexing

### Storage engine & slotted pages
In Postgres, a "row" is physically a tuple placed inside a fixed-size 8KB slotted page — a header plus an array of line pointers (`ItemIdData`) that indirection to the tuple bytes, so updates never rewrite existing tuples, just the gap between `pd_lower` and `pd_upper`. The row's identity is its `ctid`, the `(block, line-pointer-offset)` pair handed back when the tuple is placed; nothing outside the page ever addresses tuple bytes by raw offset.

**Deep dive:** [Database Storage Engine]({{ '/databases/database-storage-engine-page-heap-btree-layout/' | relative_url }})

### B-tree & index
An index is the same slotted-page format as a table, except its "special space" holds sibling links and a tree level, and its tuples are a key plus the heap `ctid` it points back to. A search descends `O(log n)` pages from a fixed meta-page root instead of scanning rows, and an index page split is triggered synchronously by a single size check (`PageGetFreeSpace(page) < itemsz`) when a new entry doesn't fit.

**Deep dive:** [Database Storage Engine]({{ '/databases/database-storage-engine-page-heap-btree-layout/' | relative_url }})

### Query planner (EXPLAIN)
The `cost=0.00..1234.56` number in `EXPLAIN` is a literal arithmetic formula — page count times a per-page I/O cost (`seq_page_cost`/`random_page_cost`) plus tuple count times a per-tuple CPU cost (`cpu_tuple_cost`) — computed from `ANALYZE` statistics, not a live measurement. Plain `EXPLAIN` never runs the query; `EXPLAIN ANALYZE` executes it and reports real elapsed time, and comparing the two is how you spot a plan built on stale statistics.

**Deep dive:** [Query Plans]({{ '/databases/query-plans-explain-analyze-cost-formula/' | relative_url }})

### Full-text search & inverted index
Matching "The Quick FOX" against "quick fox jumps" works because both the document and the query pass through the identical analyzer pipeline — tokenize, lowercase, strip stopwords — before comparison, so casing and common words never affect the match. The normalized token stream is what gets written into (and searched against) the inverted index, which maps terms to the documents containing them; different fields or query types can legitimately use different analyzer chains.

**Deep dive:** [Full-Text Search]({{ '/databases/full-text-search-analyzer-chain-inverted-index/' | relative_url }})

### Normalization vs denormalization
Normalization splits shared data into its own table joined by foreign key; denormalization embeds it as columns on the owning row to avoid that join. The right choice is per-relationship: data with its own identity, referenced by many owners (a Buyer), is normalized; data with no identity of its own, owned by exactly one row (an Address), is embedded — trading away a never-needed shared query for a join-free read.

**Deep dive:** [Normalization vs Denormalization]({{ '/databases/normalization-vs-denormalization-same-table-both/' | relative_url }})

### Relational vs NoSQL data models
A relational model normalizes into small joined tables and answers "which node owns this row?" only at query time; a sharded document model embeds related data and demands a shard key up front that physically places each document. "NoSQL" is therefore a physical-distribution decision — whether data is split and placed by a key — not merely a query-syntax difference, and the two approaches can each do either replication or sharding.

**Deep dive:** [Relational vs NoSQL Data Models]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})

## Scaling & replication

### Sharding & the shard key
A shard key is the field fed into a real function that computes which key-range "chunk" a document falls into, and each chunk is explicitly owned by exactly one physical shard. A background balancer migrates whole chunks between shards to keep load even, changing only the chunk's owning shard, never the documents' shard-key values — so the key is a placement decision, not a search filter you bolt on later.

**Deep dive:** [Relational vs NoSQL Data Models]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})

### Sharding vs replication
Replication copies the *same* data onto multiple nodes for availability and failover; sharding *splits* data across nodes by key range for write and storage scalability. They solve different problems, both can coexist, and a shard key is what makes the split decision computable rather than arbitrary — confusing the two is the usual source of "why is one node hot?" surprises.

**Deep dive:** [Relational vs NoSQL Data Models]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})

### Partitioning (range / hash / list)
Partitioning trades one large index for several smaller ones by routing each row to a child table; Postgres's `get_partition_for_tuple` runs a different algorithm per strategy — a range walk for `RANGE`, a binary search for `LIST`, and a modulo over a combined hash for `HASH`. Range preserves natural order but concentrates writes on the newest partition; hash spreads writes evenly but forfeits range pruning; list gives exact O(log n) lookup but must be maintained by hand as categories appear.

**Deep dive:** [Advanced Partitioning & Sharding]({{ '/databases/advanced-partitioning-sharding-range-hash-list/' | relative_url }})

### Time-series chunking (hypertable)
A hypertable is a virtual table physically split into per-interval chunks — each a real Postgres table with its own indexes — computed by integer-dividing a timestamp by a fixed interval length, so recent writes only touch the newest, cache-resident chunk. Dropping a whole chunk for retention is near-instant, and a query with a time-range predicate skips chunks outside it entirely via chunk exclusion, which is why this beats one giant B-tree-indexed table for append-heavy, recency-biased data.

**Deep dive:** [Time-Series Databases]({{ '/databases/time-series-databases-hypertable-chunking/' | relative_url }})

### Polyglot persistence
Polyglot persistence means choosing the database per service by its actual data shape: ephemeral, key-value cart data gets Redis, while services needing relational integrity get their own separate Postgres database each. The cheapest path is often one relational technology extended (e.g. Postgres with `pgvector`) rather than a different product per need, reserving a genuinely separate engine only where the access pattern truly differs.

**Deep dive:** [Polyglot Persistence]({{ '/databases/polyglot-persistence-right-database-per-service/' | relative_url }})

### Connection pooling
Opening a real connection is expensive (TCP, TLS, auth), so a pool keeps a bounded set of open connections reused across requests; when the pool is full, a new request blocks on a FIFO-fair queue until another caller returns a connection or a timeout elapses. "Full" and "exhausted" are different states — only the timeout elapsing actually fails the request — so a pool sized slightly under peak can still survive a brief burst if connections free up fast enough.

**Deep dive:** [Connection Pooling]({{ '/databases/connection-pooling-exhaustion-fifo-wait-timeout/' | relative_url }})

### ORMs & the N+1 query problem
An ORM's lazy-loading proxy intercepts property getters and, when one matches a navigation property, issues a separate query to load it — so a loop over N entities each touching `.Buyer` produces one query for the list plus N more, invisible at the call site. Avoiding it requires eager loading (`Include`) or a projection that fetches everything in one query; lazy loading left on actively works against that, and the per-instance loaded-state cache hides the cost until real data volume appears.

**Deep dive:** [ORMs & N+1 Queries]({{ '/databases/orms-n-plus-1-lazy-loading-proxy-interception/' | relative_url }})

### Stored procedures & triggers
A trigger pushes logic into the database, invisible to the application code that thinks it's running a plain `INSERT`. Its cost extends beyond its own body: SQL Server disallows the `OUTPUT` clause (which fetches a generated ID in the same round-trip) on any table with `AFTER` triggers, so EF Core detects a trigger's presence and silently falls back to a separate round-trip for every future insert against that table.

**Deep dive:** [Stored Procedures & Triggers]({{ '/databases/stored-procedures-triggers-orm-output-clause-conflict/' | relative_url }})

### Stream processing (event time & watermarks)
In a stream, "now" is the event's own timestamp, not its arrival time, and out-of-order delivery means a window can't close on the wall clock. A watermark is a lower-bound promise — the maximum event timestamp seen minus a bounded out-of-orderness slack — that tells downstream windows "no older event will arrive," so a window fires when a watermark passes its end, not when the first event arrives or the clock ticks.

**Deep dive:** [Stream Processing]({{ '/databases/stream-processing-event-time-watermarks-windowing/' | relative_url }})

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.




