---
layout: page
title: "Databases Interview Questions: 78 Real-World Q&A from Production Manifests"
description: "78 interview-ready Databases questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/databases/
---

Bite-sized, standalone interview questions and answers for Databases. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">78</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: The storage engine — page/heap file layout and B-tree index structure (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a slotted page, and why doesn't Postgres just address tuples by byte offset? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A slotted page (`PageHeaderData`) uses a line-pointer array (`ItemIdData`) that grows forward from the header while tuple bytes grow backward from the end, with `pd_lower` and `pd_upper` marking the free-space gap. The line-pointer indirection means anything referencing a tuple uses a stable `(block, line-pointer-offset)` pair — so Postgres can prune, shift, or rewrite tuple bytes within a page without invalidating every pointer aimed at them.

<p class="qa-link">[Full post →]({{ '/databases/database-storage-engine-page-heap-btree-layout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does a B-tree index page differ physically from a heap table page in Postgres? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
They use the identical `PageHeaderData`/`ItemIdData` slotted-page layout. The only structural difference is the "special space" past `pd_special`: a heap page leaves it unused, while a B-tree page stores `BTPageOpaqueData` with sibling links (`btpo_prev`/`btpo_next`) and a tree level. Index tuples hold a key plus a heap `ctid` instead of a full row.

<p class="qa-link">[Full post →]({{ '/databases/database-storage-engine-page-heap-btree-layout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What actually triggers a B-tree page split in Postgres, and when does it happen? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`_bt_insertonpg` in `nbtinsert.c` compares `PageGetFreeSpace(page)` against the new tuple's size synchronously inside the INSERT path. If the new tuple doesn't fit, `_bt_split()` runs immediately — not on a background schedule — allocating a new right sibling page and linking it via `btpo_next`/`btpo_prev` before the insert completes.

<p class="qa-link">[Full post →]({{ '/databases/database-storage-engine-page-heap-btree-layout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a row's ctid, and is it stable long-term? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's `ItemPointerData` — a block number (`ip_blkid`) plus a line-pointer offset (`ip_posid`), set by `ItemPointerSet` in `RelationPutHeapTuple` immediately after `PageAddItem` returns the slot number. It is not stable: operations like `VACUUM FULL` or `CLUSTER` physically rewrite the table and change every row's ctid, breaking any cached references.

<p class="qa-link">[Full post →]({{ '/databases/database-storage-engine-page-heap-btree-layout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common mistake when reasoning about B-tree index height and page splits? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming wide index keys have no structural cost. `PageGetFreeSpace(page) < itemsz` checks against the same fixed 8KB page size for every index — much wider keys mean fewer entries fit per leaf page, which triggers more splits and produces a taller tree for the same row count than narrower keys would.

<p class="qa-link">[Full post →]({{ '/databases/database-storage-engine-page-heap-btree-layout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When does a table "look empty but still be big on disk"? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
After mass deletes, `LP_UNUSED`/`LP_DEAD` line pointers can remain on pages without the pages themselves being returned to the OS. `pd_lower` and disk usage don't shrink just because `DELETE` ran — `VACUUM` or pruning must reclaim those dead line pointers and potentially defragment the page.

---

<p class="qa-link">[Full post →]({{ '/databases/database-storage-engine-page-heap-btree-layout/' | relative_url }})</p>
  </div>
</div>

## Topic: Relational vs NoSQL data models (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What problem does a shard key solve that a primary key does not? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A primary key identifies a document within a collection; a shard key is the input to a real placement function that computes which physical shard owns a given document. The shard key value determines the `[min, max)` chunk range a document falls into, and each chunk is explicitly assigned to exactly one shard — primary keys say *which row*, shard keys say *which node*.

<p class="qa-link">[Full post →]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does MongoDB rebalance data without modifying document shard key values? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A chunk is just a `[min, max)` range of shard-key values with a `shard` field recording which node owns it. The balancer changes the `shard` field in the chunk's config document — reassigning which physical node owns that range — without ever touching the documents themselves. The keys stay put; ownership moves.

<p class="qa-link">[Full post →]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you use a hashed shard key instead of a range shard key, and what do you lose? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A hashed shard key distributes sequential or monotonic IDs evenly across chunks, preventing hotspots on a single shard. The cost is losing range-query locality — queries targeting a contiguous range of shard key values can no longer be routed to a single shard, because the hash scrambles the original ordering.

<p class="qa-link">[Full post →]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does a relational schema's `CREATE TABLE ... REFERENCES` actually say about physical data placement? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Nothing. A foreign-key constraint defines a logical relationship between two tables — it makes no claim about which physical node owns which rows. That absence is the real dividing line from sharded document databases: a standalone relational engine was never designed to answer the question "which node holds this row" at the schema level.

<p class="qa-link">[Full post →]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common mistake when choosing a shard key? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating it as a config checkbox rather than understanding the actual computation. A shard key on a field with low cardinality (e.g., a boolean flag) funnels most writes onto a single chunk/shard, defeating the entire purpose — the key must produce enough distinct ranges to distribute load evenly.

<p class="qa-link">[Full post →]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you shard a collection but query without using the shard key? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Mongo scatter-gathers the query to every shard in the cluster — a full-cluster fan-out that negates the performance benefit of sharding. Only queries that include the shard key (or a prefix of it) can be routed to a single target shard.

---

<p class="qa-link">[Full post →]({{ '/databases/relational-vs-nosql-data-models/' | relative_url }})</p>
  </div>
</div>

## Topic: Normalization vs denormalization (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the deciding factor between embedding a related object as columns vs. giving it a separate table? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Whether the related data has its own identity and is referenced by multiple owners. `Address` (a value object with no independent identity, never shared across orders) is embedded as columns on the `Orders` table via `.OwnsOne`; `Buyer` (has its own `Id`, referenced by many orders over time) gets a separate normalized table via `.HasOne().WithMany().HasForeignKey()`.

<p class="qa-link">[Full post →]({{ '/databases/normalization-vs-denormalization-same-table-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does embedding an Address on the Orders table affect query patterns? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You can never query "all orders sharing this exact address" as a join, because there's no separate address identity to join against — the address is only readable as part of loading the owning `Order` row. In exchange, every read of an order gets its address with zero joins, because the fields are physically co-located.

<p class="qa-link">[Full post →]({{ '/databases/normalization-vs-denormalization-same-table-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the downside of normalizing a relationship that is never actually shared across rows? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An extra table and an extra join on every read, for data that will never be independently queried or updated from more than one owner. The textbook rule "eliminate all duplication" applied blindly adds real I/O cost for a scenario (shared access) that doesn't exist for that particular relationship.

<p class="qa-link">[Full post →]({{ '/databases/normalization-vs-denormalization-same-table-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you use `.OnDelete(DeleteBehavior.Restrict)` on a foreign key, and what happens if you don't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Use it when deleting a referenced row while dependent rows still exist would cause data-integrity problems. Without it (or with `Cascade`), a delete of a `PaymentMethod` row could silently wipe out every `Order` that referenced it — `Restrict` forces the application to handle the dependency before deleting.

<p class="qa-link">[Full post →]({{ '/databases/normalization-vs-denormalization-same-table-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common mistake about normalization? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming it's an unconditional global rule — "always target 3NF, always split every relationship into its own table." Real production schemas make per-relationship decisions based on whether the related data has independent identity, is actually shared, and is independently queryable. One schema can legitimately contain both embedded value objects and normalized entity tables.

---

<p class="qa-link">[Full post →]({{ '/databases/normalization-vs-denormalization-same-table-both/' | relative_url }})</p>
  </div>
</div>

## Topic: Transactions & ACID (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is Postgres's `synchronous_commit` setting, and why does it exist? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It controls whether `XLogFlush` (an `fsync` that forces the WAL record to physical disk) runs synchronously before the client receives "COMMIT." When set to `off`, that flush is skipped and the client is told "done" immediately — trading guaranteed durability for lower write latency on workloads that can tolerate losing the last few transactions in a crash.

<p class="qa-link">[Full post →]({{ '/databases/transactions-acid-postgres-durability-gate/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When `synchronous_commit` is off, what exactly is at risk of being lost? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The WAL records that were written to memory buffers but not yet flushed to disk. The commit record may have been marked in CLOG (making it visible to other sessions), but if the process crashes before the async flush completes, those "committed" transactions simply vanish — as if they never happened. No partial state is left; the transaction is entirely gone.

<p class="qa-link">[Full post →]({{ '/databases/transactions-acid-postgres-durability-gate/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if a `DROP TABLE` runs inside a transaction with `synchronous_commit = off`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The `forceSyncCommit || nrels > 0` override condition in `RecordTransactionCommit` forces the synchronous path regardless — deleting non-temporary files cannot be made asynchronous because the file deletion must not reach disk before the COMMIT record does, or crash recovery would be corrupted. Some operations override the tunable because they have their own hard durability requirement.

<p class="qa-link">[Full post →]({{ '/databases/transactions-acid-postgres-durability-gate/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How do atomicity and durability interact in Postgres's actual commit function? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`TransactionIdCommitTree` (which makes changes visible to other sessions) runs *inside the same conditional block* as `XLogFlush` (which guarantees durability). A transaction's visibility and its durability are gated by the same checkpoint — if the flush didn't happen (async commit), the visibility marking may not have persisted either, so a crash leaves the transaction as if it never existed.

<p class="qa-link">[Full post →]({{ '/databases/transactions-acid-postgres-durability-gate/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake about ACID's durability guarantee? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming it's a fixed, always-on property of any database that markets itself as ACID-compliant. Postgres's `synchronous_commit` shows durability is a deliberately *tunable* boundary even within a strictly transactional system — you must check which specific configuration is actually delivering, not assume the label means a non-negotiable set of properties.

<p class="qa-link">[Full post →]({{ '/databases/transactions-acid-postgres-durability-gate/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the tradeoff of setting `synchronous_commit = off` for an analytics ingestion pipeline? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You get meaningfully lower write latency on every commit — no `fsync` blocking the client. The tradeoff is that on a crash, the most recent few transactions (potentially all those received since the last WAL flush) are silently lost. For data that can be re-fed from a durable upstream source, this is often an acceptable trade; for financial records, it isn't.

---

<p class="qa-link">[Full post →]({{ '/databases/transactions-acid-postgres-durability-gate/' | relative_url }})</p>
  </div>
</div>

## Topic: Isolation levels & concurrency anomalies (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the core mechanism behind Postgres's row visibility decisions? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`HeapTupleSatisfiesMVCC` compares a row version's creating transaction ID against a frozen snapshot — a record of which transaction IDs were in-progress at a specific earlier moment. If `XidInMVCCSnapshot` returns true (the creator was in-progress per this snapshot), the row is invisible regardless of whether that transaction has actually committed since.

<p class="qa-link">[Full post →]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Postgres distinguish READ COMMITTED from REPEATABLE READ? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
READ COMMITTED takes a fresh snapshot for every individual statement — so a later query in the same transaction sees newer committed changes, allowing non-repeatable reads. REPEATABLE READ takes exactly one snapshot for the entire transaction and reuses it for every query inside it, so repeated reads return identical results.

<p class="qa-link">[Full post →]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why doesn't Postgres take read locks to prevent non-repeatable reads? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because MVCC doesn't need them — a writer never blocks a reader and a reader never blocks a writer. Instead of physically preventing writes, Postgres makes newly committed row versions simply *invisible* to a transaction still working from an older snapshot. Consistency comes from each transaction seeing its own private, frozen snapshot, not from mutual exclusion.

<p class="qa-link">[Full post →]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does `XidInMVCCSnapshot` return if a row's creator has committed between snapshot time and the current moment? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It still returns "invisible" — the function checks against the *snapshot's* view of which transactions were in-progress, not the transaction's current real commit state. A row whose creator committed after the snapshot was taken is treated as invisible even though it has since committed, because visibility is a property of the frozen snapshot, not a live query.

<p class="qa-link">[Full post →]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When is `TransactionIdDidCommit` actually checked, and why is this ordering important? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Only for transaction IDs that are *not* in the snapshot at all — meaning they are old enough to be unambiguously committed or aborted by snapshot time. The two-tier check (first: was it running when my snapshot started; only then: did it actually commit) separates "too recent to have a settled answer" from "old enough that only its real outcome matters."

<p class="qa-link">[Full post →]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common mistake when reasoning about MVCC and isolation levels? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming that preventing non-repeatable reads requires locking rows to prevent changes. Postgres achieves the same guarantee without any read-side locking at all — it makes committed row versions invisible to stale snapshots. What differs between isolation levels isn't whether locks are taken on reads; it's how often the transaction's snapshot gets refreshed.

<p class="qa-link">[Full post →]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you run a long-running REPEATABLE READ transaction while many writes are occurring? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The transaction's snapshot becomes increasingly stale — rows committed after the snapshot was taken remain invisible for the entire transaction, even if they committed moments after `BEGIN`. Meanwhile, vacuum must keep old row versions alive because this transaction still needs them, causing table bloat until the transaction finishes.

---

<p class="qa-link">[Full post →]({{ '/databases/isolation-levels-mvcc-snapshot-visibility/' | relative_url }})</p>
  </div>
</div>

## Topic: ORMs & the N+1 query problem (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the N+1 query problem in the context of EF Core lazy loading? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A `foreach` loop over N orders, each accessing `order.Buyer.Name`, generates one query to fetch all orders plus N additional queries — one per order — to fetch each order's buyer. Each N query is invisible in the source code because it's triggered by a property access (`order.Buyer`), not by an explicit database call.

<p class="qa-link">[Full post →]({{ '/databases/orms-n-plus-1-lazy-loading-proxy-interception/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does EF Core's lazy-loading proxy detect that a property access should trigger a database query? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The proxy wraps every entity in a dynamically generated subclass via Castle DynamicProxy. When a property getter is called, its compiler-generated name (`get_Buyer`) is intercepted by `LazyLoadingInterceptor`, which checks whether `methodName[4..]` matches a known navigation property in the precomputed `_navigations` set — if yes, `_loader.Load()` runs before the getter returns.

<p class="qa-link">[Full post →]({{ '/databases/orms-n-plus-1-lazy-loading-proxy-interception/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is the N+1 problem easy to miss in small-scale testing? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because `IsLoaded` tracks per-entity, per-navigation loaded state in a per-instance dictionary — accessing the same navigation on the *same* entity instance doesn't re-query. A test with one or two rows barely shows the cost, but in production with real volume, each row is a *different* entity instance with its own loaded-state tracking, so every iteration triggers its own query.

<p class="qa-link">[Full post →]({{ '/databases/orms-n-plus-1-lazy-loading-proxy-interception/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the tradeoff of using eager loading (`Include()`) vs. lazy loading? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Eager loading fetches everything needed in one round-trip — no hidden per-entity queries — but may pull in data the caller never actually uses, increasing memory and transfer cost. Lazy loading only fetches what's accessed, but silently multiplies query count when navigations are accessed in loops, with no visual signal in the code.

<p class="qa-link">[Full post →]({{ '/databases/orms-n-plus-1-lazy-loading-proxy-interception/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake about ORMs and the N+1 problem? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming that using an ORM at all is sufficient protection against issuing excessive queries. EF Core's lazy loading makes triggering N separate queries as easy as writing what looks like ordinary property access — the ORM doesn't make the "eager vs. lazy" choice on your behalf, and lazy loading left enabled actively works against performance.

<p class="qa-link">[Full post →]({{ '/databases/orms-n-plus-1-lazy-loading-proxy-interception/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How is the intercepted method name determined — is it something the developer names, or something the compiler produces? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's the compiler: C# compiles `order.Buyer` into a call to `get_Buyer()`. The interceptor matches on the string `"get_" + propertyName`, which is a compiler convention, not something the developer wrote or controls — which is precisely why the query trigger is invisible at the call site.

---

<p class="qa-link">[Full post →]({{ '/databases/orms-n-plus-1-lazy-loading-proxy-interception/' | relative_url }})</p>
  </div>
</div>

## Topic: Database migrations & zero-downtime schema changes (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a "dirty" migration version, and why does `golang-migrate` set it *before* running the SQL? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A dirty version means a migration started but was never confirmed finished. `golang-migrate` calls `SetVersion(target, true)` *before* executing the migration body, so if the process crashes mid-execution, the dirty flag is the only record left behind — correctly signaling "something incomplete happened here" rather than leaving an ambiguous or misleading clean version number.

<p class="qa-link">[Full post →]({{ '/databases/database-migrations-dirty-flag-zero-downtime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you try to run migrations after a crash left a dirty flag? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Every entry point (`Migrate`, `Steps`, and others) checks the dirty flag on every operation. If it's set, the tool refuses outright with `ErrDirty` — returning a message like "Dirty database version N. Fix and force version." — rather than attempting anything, because it cannot know what state the schema is actually in.

<p class="qa-link">[Full post →]({{ '/databases/database-migrations-dirty-flag-zero-downtime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does a developer resolve a dirty migration state? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
They must explicitly inspect the schema's actual state and run a `force` command to declare a specific version clean again. The tool never silently guesses — the human has to make the determination about which migration version the schema truly corresponds to.

<p class="qa-link">[Full post →]({{ '/databases/database-migrations-dirty-flag-zero-downtime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is a plain version counter alone insufficient for migration safety? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A version number tells you which migration was most recently recorded, but can't distinguish "migration 12 completed successfully" from "migration 12 started and crashed halfway" — both show the same version. The dirty flag captures the *in-between* state, which is the actual safety signal.

<p class="qa-link">[Full post →]({{ '/databases/database-migrations-dirty-flag-zero-downtime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when relying on a migration tool's tracking table? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming that recording a version number is sufficient information to know the schema's actual state. Without a dirty flag, you can't detect whether the last recorded migration attempt actually finished or crashed mid-execution — the version number is identical in both cases.

<p class="qa-link">[Full post →]({{ '/databases/database-migrations-dirty-flag-zero-downtime/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does the dirty flag contract look like across different database drivers? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Every driver (Postgres, MySQL, Cassandra, dozens of others) must implement the same before/after dirty-marking discipline via the `Driver` interface: `SetVersion` is called before and after each `Run` call. The safety mechanism is part of the tool's core contract, not an optional feature a specific driver might skip.

---

<p class="qa-link">[Full post →]({{ '/databases/database-migrations-dirty-flag-zero-downtime/' | relative_url }})</p>
  </div>
</div>

## Topic: Connection pooling (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when a connection pool is at its configured maximum and a new request arrives? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The request doesn't fail immediately — it blocks on a FIFO-fair channel until either another caller returns a connection or the configured timeout elapses. Only the timeout elapsing actually produces a failure; a brief burst above the maximum just means requests wait, not that they fail.

<p class="qa-link">[Full post →]({{ '/databases/connection-pooling-exhaustion-fifo-wait-timeout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is FIFO fairness important for connection pool waiters? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Without it, a newly arriving request could race ahead of one that's been waiting longer and grab a freed connector first, potentially starving earlier waiters indefinitely under sustained load. The FIFO guarantee ensures first-come-first-served ordering so no request waits forever while others are served out of turn.

<p class="qa-link">[Full post →]({{ '/databases/connection-pooling-exhaustion-fifo-wait-timeout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Npgsql's pool acquisition path differ from a naive "just open a new connection" approach? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It tries three paths in order: (1) an idle, already-open connector (zero connection cost), (2) a genuinely new physical connection (only if under max capacity), (3) block on a channel waiting for someone to return one. A naive approach would open a new connection every time, ignoring the expensive TCP handshake and TLS negotiation overhead.

<p class="qa-link">[Full post →]({{ '/databases/connection-pooling-exhaustion-fifo-wait-timeout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does the pool exhaustion error message tell you that a generic timeout doesn't? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It includes the *actual, live* configured values of `Max Pool Size` and `Timeout` interpolated directly into the exception text — so whoever sees it doesn't need to go find the connection string to know what to change. The error names both settings and their current numbers.

<p class="qa-link">[Full post →]({{ '/databases/connection-pooling-exhaustion-fifo-wait-timeout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake about connection pool exhaustion? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming that reaching the configured maximum size equals an immediate hard failure — that "full" and "exhausted" are the same state. They're genuinely different: reaching the maximum just means new requests wait; only if the entire waiting window elapses without a connector becoming available does the request actually fail.

<p class="qa-link">[Full post →]({{ '/databases/connection-pooling-exhaustion-fifo-wait-timeout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens to a pool's internal capacity tracking while requests are waiting? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It re-checks: `OpenNewConnector` is retried at multiple points because a connector may have been returned in the meantime and the pool may no longer be at max capacity. The pool doesn't assume its own capacity count is static while a caller waits — it re-evaluates before concluding the pool is genuinely exhausted.

---

<p class="qa-link">[Full post →]({{ '/databases/connection-pooling-exhaustion-fifo-wait-timeout/' | relative_url }})</p>
  </div>
</div>

## Topic: Query plans & EXPLAIN ANALYZE (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does EXPLAIN's `cost=0.00..1234.56` actually measure? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a literal arithmetic formula: the table's page count multiplied by a per-page I/O cost constant (`seq_page_cost`), plus the table's tuple count multiplied by a per-tuple CPU cost constant (`cpu_tuple_cost`). The inputs come from statistics gathered by `ANALYZE`, not from a live count at plan time.

<p class="qa-link">[Full post →]({{ '/databases/query-plans-explain-analyze-cost-formula/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why would a planner choose a sequential scan even when a matching index exists? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An index scan uses `random_page_cost` (higher per-page cost for random I/O), while a sequential scan uses `seq_page_cost` (lower per-page cost). When a query touches a large fraction of a table's rows, the index scan's total random-access cost can exceed the sequential scan's cost — the planner picks seq scan not because the index doesn't exist, but because the per-page cost assumption itself changes.

<p class="qa-link">[Full post →]({{ '/databases/query-plans-explain-analyze-cost-formula/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the `cpu_per_tuple` cost formula account for different WHERE clauses? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's `cpu_tuple_cost + qpqual_cost.per_tuple` — the baseline per-tuple processing cost *plus* the actual cost of evaluating the query's specific WHERE conditions per row. A cheap equality check and an expensive regex match produce genuinely different `qpqual_cost.per_tuple` values, so the same table can show different sequential-scan costs for different queries against it.

<p class="qa-link">[Full post →]({{ '/databases/query-plans-explain-analyze-cost-formula/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the difference between plain `EXPLAIN` and `EXPLAIN ANALYZE`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Plain `EXPLAIN` only computes the cost estimate formula — it never actually runs the query. `EXPLAIN ANALYZE` genuinely executes the query and reports real measured elapsed time alongside the estimate, which is why comparing the two (estimated cost vs. actual time) is the real diagnostic technique for spotting planner decisions based on stale statistics.

<p class="qa-link">[Full post →]({{ '/databases/query-plans-explain-analyze-cost-formula/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if table statistics are stale when a query is planned? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The cost formula itself is exact arithmetic, but its inputs (`baserel->pages`, `baserel->tuples`) are outdated — the planner makes decisions based on stale numbers rather than current reality. This is a distinct failure mode from the formula being "wrong": the formula is correct, the inputs are old, and the resulting plan may be suboptimal.

<p class="qa-link">[Full post →]({{ '/databases/query-plans-explain-analyze-cost-formula/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Can different tablespaces produce different cost estimates for the same query? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Yes — `spc_seq_page_cost` is looked up per-tablespace, not globally hardcoded. Different tablespaces backed by different storage (fast SSD vs. slower spinning disk) can carry different page-cost assumptions, meaning the same query against tables in different tablespaces produces different cost estimates purely from where the data physically lives.

---

<p class="qa-link">[Full post →]({{ '/databases/query-plans-explain-analyze-cost-formula/' | relative_url }})</p>
  </div>
</div>

## Topic: Full-text search & search indexes (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is an analyzer pipeline, and why must both document text and query text pass through it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An analyzer is a composable chain of tokenization and normalization steps — `StandardTokenizer` splits raw text into tokens, `LowerCaseFilter` normalizes casing, `StopFilter` removes stopwords. Both sides must go through the *identical* pipeline so that casing differences, word order, and common words never prevent a human-recognizable match from being found.

<p class="qa-link">[Full post →]({{ '/databases/full-text-search-analyzer-chain-inverted-index/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does Lucene's `StopFilter` actually do to the token stream? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It removes configured stopwords (like "the," "a," "is") entirely from the stream — those tokens are never written into the inverted index, and they are stripped from queries too. A search for "the fox" and a search for "fox" produce the identical final token stream (`[fox]`) after this pipeline.

<p class="qa-link">[Full post →]({{ '/databases/full-text-search-analyzer-chain-inverted-index/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Lucene have a separate `normalize()` method alongside the full `createComponents()` chain? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`normalize()` applies only `LowerCaseFilter` — no tokenization, no stopword removal. It's used for exact single-term operations (wildcard queries, range queries) where the input is already a single term, not free text needing tokenization. Running the full chain on a single term would incorrectly strip stopwords from terms that aren't part of a sentence.

<p class="qa-link">[Full post →]({{ '/databases/full-text-search-analyzer-chain-inverted-index/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How are Lucene analyzers composed, and why does this matter for extensibility? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each filter wraps the previous stage's output stream as its own input — `tok = new StopFilter(new LowerCaseFilter(new StandardTokenizer()))`. Adding a new normalization step (stemming, synonym expansion) means wrapping the chain one layer deeper without rewriting the tokenizer or earlier filters, because each stage only knows about the stream it receives.

<p class="qa-link">[Full post →]({{ '/databases/full-text-search-analyzer-chain-inverted-index/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake about full-text matching? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming it's just a case-insensitive string comparison. Real search engines route both sides through an explicit multi-stage pipeline — tokenization, normalization, stopword removal, potentially stemming — and different fields or query types can legitimately use *different* analyzer chains. Whether two pieces of text "match" depends entirely on which specific chain was applied to each side.

<p class="qa-link">[Full post →]({{ '/databases/full-text-search-analyzer-chain-inverted-index/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't you just do a case-insensitive LIKE query instead of using a search index? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A `LIKE '%term%'` pattern scan examines every row and every character — it's O(n) with no use of the inverted index, which maps normalized terms to document IDs. The analyzer pipeline writes pre-normalized terms into the inverted index so lookups are O(1) per term, not a full table scan.

---

<p class="qa-link">[Full post →]({{ '/databases/full-text-search-analyzer-chain-inverted-index/' | relative_url }})</p>
  </div>
</div>

## Topic: Stored procedures & triggers (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the concrete cost of adding a trigger to a SQL Server table that uses EF Core? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
SQL Server disallows the `OUTPUT` clause (which fetches a generated ID in the same round-trip as an `INSERT`) on tables that have `AFTER` triggers. EF Core's `SqlServerOutputClauseConvention` detects the trigger's presence and automatically disables the `OUTPUT` optimization — forcing every future `INSERT` against that table to use a separate round-trip to fetch its generated ID, regardless of what the trigger actually does.

<p class="qa-link">[Full post →]({{ '/databases/stored-procedures-triggers-orm-output-clause-conflict/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't EF Core analyze the trigger's logic to decide whether the OUTPUT conflict matters? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because the SQL Server restriction applies unconditionally to *any* trigger's presence — it's an engine-level limitation, not one that depends on the trigger's body content. EF Core can't (and doesn't need to) inspect what the trigger does; the mere fact that one exists is enough to disable OUTPUT for that table.

<p class="qa-link">[Full post →]({{ '/databases/stored-procedures-triggers-orm-output-clause-conflict/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens to the OUTPUT clause optimization when the last trigger on a table is removed? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ProcessTriggerRemoved` checks `GetDeclaredTriggers()` and only re-enables the OUTPUT clause (via `UseSqlOutputClause(null, ...)`) if no other trigger still registered on that same table remains. Removing one trigger from a table with multiple triggers doesn't restore the optimization.

<p class="qa-link">[Full post →]({{ '/databases/stored-procedures-triggers-orm-output-clause-conflict/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the gotcha when a trigger is added directly in SQL without going through EF Core? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
EF Core only knows to disable OUTPUT for triggers it's explicitly told about via `HasTrigger` in its model configuration. A trigger added out-of-band via a raw migration script silently reintroduces the SQL Server restriction without EF Core ever finding out — every INSERT against that table would fail at the database level with no corresponding change in EF Core's behavior.

<p class="qa-link">[Full post →]({{ '/databases/stored-procedures-triggers-orm-output-clause-conflict/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common mistake about triggers' cost? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating them as effectively free — assuming their only cost is whatever their own logic does when they fire. This EF Core convention demonstrates a trigger's cost extends to engine-level restrictions: adding *any* trigger, regardless of what it does, forces a real, measurable change (extra round-trip) to how every future write against that table is executed.

<p class="qa-link">[Full post →]({{ '/databases/stored-procedures-triggers-orm-output-clause-conflict/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the scenario where adding an `updated_at` trigger on a high-write table causes a subtle performance regression? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Every INSERT now needs an extra round-trip to fetch the generated ID (because OUTPUT is disabled), but no one connecting the dots would suspect the `updated_at` trigger — the code change looks unrelated. The regression is real (measurable latency per write), invisible from reading the trigger's definition, and wouldn't appear in a code review of the application layer.

---

<p class="qa-link">[Full post →]({{ '/databases/stored-procedures-triggers-orm-output-clause-conflict/' | relative_url }})</p>
  </div>
</div>

## Topic: Backup strategies & point-in-time recovery (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is Postgres point-in-time recovery, and how does it achieve precise targeting? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It restores a base backup, then replays every WAL record in order, checking each one against a configured recovery target (timestamp, transaction ID, WAL location, or named restore point). Recovery doesn't jump directly to the target — it walks through the actual history of every change, halting the instant a record satisfies the stop condition, leaving the database at exactly that point.

<p class="qa-link">[Full post →]({{ '/databases/point-in-time-recovery-wal-replay-target/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does time-based recovery need inclusive vs. exclusive targeting, and what determines which side you land on? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because multiple transactions can share the exact same commit timestamp. An inclusive target stops *after* the last transaction that committed at exactly time T (using `>`), while an exclusive target stops *before* the first one (using `>=`). Without this tie-breaking rule, "recover to 2:47pm" would be ambiguous whenever multiple transactions committed within the same clock tick.

<p class="qa-link">[Full post →]({{ '/databases/point-in-time-recovery-wal-replay-target/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't you use a `>=` comparison for XID-based recovery targets? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because transaction IDs are assigned when a transaction *starts*, not when it *commits* — a higher-numbered transaction can genuinely finish before a lower-numbered one roughly 50% of the time under concurrent load. You must test for exact equality (`recordXid == target.xid`), not `>=`, to avoid recovering past transactions that completed out of their numbering order.

<p class="qa-link">[Full post →]({{ '/databases/point-in-time-recovery-wal-replay-target/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What determines the precision of PITR, and is it tied to backup frequency? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Precision comes from the WAL itself — individual transaction commits/aborts — not from how often full backups are taken. A single daily backup can still support recovering to the exact transaction before an afternoon mistake, as long as the WAL archive covering that whole day survived intact. What actually needs protecting continuously is the WAL archive, not necessarily the base backup frequency.

<p class="qa-link">[Full post →]({{ '/databases/point-in-time-recovery-wal-replay-target/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake about backup strategy? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Evaluating it purely by backup frequency — assuming that recovering more precisely just means taking full backups more often. Real PITR decouples these: the WAL archive provides per-record recovery granularity, and the base backup just gives you a starting point. If the WAL archive is incomplete, frequent backups won't help recover to an arbitrary moment between them.

<p class="qa-link">[Full post →]({{ '/databases/point-in-time-recovery-wal-replay-target/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if the WAL archive has gaps between the base backup and the target recovery time? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Recovery cannot reconstruct changes that occurred during the gap — those WAL records are missing, so replay stops at the last available record before the gap, leaving the database in an incomplete state between the backup and the target. This is why WAL archival must be continuous and reliable; gaps in the archive make precise recovery impossible regardless of backup frequency.

---

<p class="qa-link">[Full post →]({{ '/databases/point-in-time-recovery-wal-replay-target/' | relative_url }})</p>
  </div>
</div>

## Topic: Multi-model & polyglot persistence (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What decides whether a service gets Redis vs. Postgres in a polyglot persistence architecture? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The service's actual data shape and access pattern. `Basket.API` gets Redis because its cart data is ephemeral, per-user, and read/written as a single blob — a key-value fit. `Catalog`, `Ordering`, `Identity`, and `Webhooks` each get their own separate Postgres databases because their data needs relational integrity, transactions, and relational queries.

<p class="qa-link">[Full post →]({{ '/databases/polyglot-persistence-right-database-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does the eShop reference app use four separate Postgres databases instead of one shared database? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Database-per-service means each service owns its own schema, preventing one service's schema changes or query load from directly affecting another's. `catalogdb`, `identitydb`, `orderingdb`, and `webhooksdb` are four distinct databases on the same Postgres server — they share the technology but not the data, preserving service isolation.

<p class="qa-link">[Full post →]({{ '/databases/polyglot-persistence-right-database-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How can polyglot persistence be achieved without introducing separate database products? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
By using extensions on one database technology. The `ankane/pgvector` image bundles vector similarity search into Postgres itself, so the same instance serving Catalog's relational rows also stores and queries vector embeddings. Polyglot persistence doesn't always mean a different product per need — sometimes one product's extensions cover more than one data model.

<p class="qa-link">[Full post →]({{ '/databases/polyglot-persistence-right-database-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the downside of polyglot persistence compared to standardizing on one database? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Operational overhead: each distinct database technology requires its own backup strategy, monitoring, on-call expertise, and deployment pipeline. Choosing Redis for Basket means the team must operate Redis infrastructure in addition to Postgres — a real cost that should be justified by the data-model fit, not treated as free.

<p class="qa-link">[Full post →]({{ '/databases/polyglot-persistence-right-database-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake about polyglot persistence? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming it means reaching for a different database product every time a new data-modeling need appears. This real system shows a cheaper middle path: one relational database technology (Postgres), extended via `pgvector` to also serve vector search, can cover more ground — reserving an entirely separate technology (Redis) only for the cases where the underlying access pattern is genuinely different enough to justify it.

<p class="qa-link">[Full post →]({{ '/databases/polyglot-persistence-right-database-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does the orchestration file's database wiring tell you that a design doc can't? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The dependency graph *is* the architectural decision, visible and auditable in one place — `Basket.API` wired to Redis, not Postgres, makes it structurally impossible for Basket to accidentally depend on relational infrastructure it doesn't need. A design doc can drift from reality; the orchestration file can't, because it's what actually runs.

<p class="qa-link">[Full post →]({{ '/databases/polyglot-persistence-right-database-per-service/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 78 across Databases

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
