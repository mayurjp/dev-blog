---
layout: post
title: "What does declaring a shard key actually DO, once you hit save?"
date: 2026-08-14 09:00:00 +0530
categories: databases
tags: [databases, sql, nosql, mongodb, sharding, data-modeling]
---

## 1. The Engineering Problem: "NoSQL" isn't a syntax choice, it's a physical-distribution choice

It's tempting to think of "NoSQL" as "a database that doesn't use SQL syntax" and treat
switching between a relational store and a document store as roughly a query-language
migration. It isn't. A relational schema is built around **normalization**: split data
into small tables, connect them with foreign keys, and let joins reassemble the full
picture at query time — because storage was expensive and duplication was the thing to
eliminate.

A sharded document database does close to the opposite on purpose. It **embeds**
related data into a single denormalized document, and it requires you to declare, up
front, a **shard key** — a field (or fields) whose value decides which physical shard
a document lives on. It's tempting to treat this as a config checkbox. It isn't one:
the shard key is the input to a real computation that decides physical placement, and
understanding that computation is the difference between a shard key that actually
distributes load and one that quietly funnels every write onto a single node.

## 2. The Technical Solution: the shard key drives a real range-assignment, not a label

```
A document is inserted
        │
        ▼
extractShardKeyFromDoc(doc) pulls the shard key's value out of that document
        │
        ▼
That value falls within some chunk's key range: [ min, max )
        │
        ▼
Every chunk is explicitly owned by one shard (config.chunks: { min, max, shard })
        │
        ▼
A background balancer migrates whole chunks between shards — reassigning
which shard owns a key range — to keep load even as data grows unevenly
```

Three truths to hold:

1. The shard key isn't a search filter you bolt on later — it's the value fed into a
   real function that determines which key-range "chunk" a document falls into, and
   every chunk is explicitly assigned to exactly one physical shard.
2. Because a chunk is just a `[min, max)` range of shard-key values, a balancer can
   migrate a chunk to a different shard — rebalancing the cluster — without ever
   touching the documents' shard key values themselves. The key stays put; the
   *ownership* of its range moves.
3. Sharding and replication solve different problems and both a relational and a
   document database can do either: replication copies the *same* data onto multiple
   nodes for availability; sharding *splits* data across nodes by key range for write
   and storage scalability. A shard key is what makes the split decision computable
   instead of arbitrary.

## 3. The clean example (concept in isolation)

```sql
-- Relational: normalize, connect via foreign key, no distribution decision needed.
CREATE TABLE orders (id UUID PRIMARY KEY, buyer_id UUID);
CREATE TABLE order_items (id UUID PRIMARY KEY, order_id UUID REFERENCES orders(id));
```

```javascript
// Document/NoSQL: embed the items directly, and declare a shard key —
// this single command is what makes the physical-distribution decision real.
db.orders.insertOne({ _id: "order-123", buyerId: "buyer-42", items: [ /* embedded */ ] });
sh.shardCollection("shop.orders", { buyerId: 1 }); // buyerId now drives chunk placement
```

## 4. Production reality (from MongoDB's own sharding source)

This is real code and real documentation comments from `mongodb/mongo` — not a client
library's wrapper around it, but the engine that actually computes chunk placement.
License headers omitted; nothing else changed.

**Extracting the shard key from a document** — the computation `sh.shardCollection`
sets up for every subsequent write:

```cpp
/**
 * Given a document, extracts the shard key corresponding to the key pattern. Paths to shard key
 * fields must not contain arrays at any level, and shard keys may not be array fields or
 * non-storable sub-documents. If the shard key pattern is a hashed key pattern, this method
 * performs the hashing.
 *
 * Examples:
 *  If 'this' KeyPattern is { a : 1 }
 *   { a: "hi" , b : 4} --> returns { a : "hi" }
 *   { c : 4 , a : 2 } -->  returns { a : 2 }
 *   { b : 2 }  -> returns {}
 *  If 'this' KeyPattern is { a : "hashed" }
 *   { a: 1 } --> returns { a : NumberLong("5902408780260971510") }
 */
BSONObj extractShardKeyFromDoc(const BSONObj& doc) const;
```

**A chunk, exactly as MongoDB's own config server stores it** — a real document format,
not a diagram:

```
Expected config server config.chunks collection format:
  {
     _id : "test.foo-a_MinKey",
     uuid : Bindata(UUID),
     min : { "a" : { "$minKey" : 1 } },
     max : { "a" : { "$maxKey" : 1 } },
     shard : "test-rs1",
     lastmod : Timestamp(1, 0),
     jumbo : false              // optional field
  }
```

**Rebalancing** — the real struct describing a chunk migration between shards:

```cpp
struct MigrateInfo {
    NamespaceString nss;
    UUID uuid;
    ShardId to;     // the shard gaining ownership of this key range
    ShardId from;   // the shard losing it
    BSONObj minKey;
    boost::optional<BSONObj> maxKey;
    ChunkVersion version;
    ForceJumbo forceJumbo;
};
```

What this teaches that a config-flag view can't:

- **`extractShardKeyFromDoc`'s own doc comment gives you the actual before/after
  transformation** — including that a *hashed* shard key doesn't store your value at
  all, it stores a computed hash (`NumberLong("5902408780260971510")` for input `1`).
  That single detail explains why hashed shard keys are chosen specifically to spread
  sequential IDs evenly across chunks, at the cost of losing range-query locality.
- **A chunk is a real, persisted document** — `{ min, max, shard }` — not an internal
  implementation detail. `shard : "test-rs1"` is the literal field that answers "which
  physical node owns this range of the collection," and it's this field the balancer
  changes during a migration, nothing else.
- **`MigrateInfo` has both a `to` and a `from` shard, plus the exact key range being
  moved.** Rebalancing is provably just "change which shard owns this
  already-computed range" — it's not recomputing anyone's shard key, and it's not
  moving individual documents one at a time by hand.
- **Contrast with relational**: nothing in a `CREATE TABLE ... REFERENCES` statement
  makes any claim about which physical node owns which rows — because a standalone
  relational engine was never designed to answer that question at the schema level in
  the first place. That absence, not a syntax difference, is the real dividing line.

---

## Source

- **Concept:** Relational vs NoSQL data models
- **Domain:** databases
- **Repo:** [mongodb/mongo](https://github.com/mongodb/mongo) → [`src/mongo/db/global_catalog/shard_key_pattern.h`](https://github.com/mongodb/mongo/blob/master/src/mongo/db/global_catalog/shard_key_pattern.h), [`src/mongo/db/global_catalog/type_chunk.h`](https://github.com/mongodb/mongo/blob/master/src/mongo/db/global_catalog/type_chunk.h), [`src/mongo/db/s/balancer/balancer_policy.h`](https://github.com/mongodb/mongo/blob/master/src/mongo/db/s/balancer/balancer_policy.h) — MongoDB's own server source, the actual engine behind sharding, not a client-side wrapper around it
