---
layout: post
title: "GraphQL Schema Design: eliminating the N+1 problem with DataLoader batching"
description: "Why GraphQL resolvers trigger N+1 queries by default, and how a batching DataLoader collapses them into a single call within one request tick."
date: 2026-08-16 09:00:00 +0530
categories: api-design
order: 4
tags: [api-design, graphql, dataloader, n-plus-1, batching]
---

**TL;DR:** Why does a GraphQL query explode into hundreds of SQL calls? Because each field resolver fires independently; a DataLoader batches all keys requested in the same tick into one batched fetch.

> **In plain English (30 sec):** Code you already write — Map, function, API call, just bigger.

**Real repo:** [graphql/graphql-js](https://github.com/graphql/graphql-js) — the reference execution engine that resolves fields one at a time, and the companion [graphql/dataloader](https://github.com/graphql/dataloader) that batches and caches loads per request.

## 1. The Engineering Problem

In GraphQL, a query like this is the classic trap:

```graphql
query {
  articles {            # 1 query
    author { name }     # N queries — one per article
  }
}
```

The `author` resolver runs once per `article`. If you naively `SELECT * FROM users WHERE id = ?` inside it, you get 1 + N queries. This is the **N+1 problem**, and it is *inherent* to GraphQL's resolver model — the executor has no idea that N sibling fields could be answered by one `WHERE id IN (...)`.

## 2. The Technical Solution

`DataLoader` batches calls that happen within the same microtask. Every `load(key)` schedules a batch; on the next tick the executor invokes your `batchLoadFn(keys)` once with the collected keys. It also memoizes by key for the loader's lifetime, so repeated loads of the same id reuse the promise.

```mermaid
sequenceDiagram
  participant E as GraphQL Executor
  participant R as author resolver
  participant D as DataLoader
  participant B as batchLoadFn
  participant DB as Database
  E->>R: resolve article1.author (id 10)
  R->>D: load(10)
  E->>R: resolve article2.author (id 11)
  R->>D: load(11)
  E->>R: resolve article3.author (id 12)
  R->>D: load(12)
  Note over D: tick ends, flush batch
  D->>B: batchLoadFn([10,11,12])
  B->>DB: SELECT * FROM users WHERE id IN (10,11,12)
  DB-->>B: [{10..},{11..},{12..}]
  B-->>D: Map keyed by id
  D-->>R: author for 10, 11, 12 (cached)
  classDef exe fill:#2d6cdf,stroke:#1b3a8f,color:#fff;
  classDef load fill:#16a34a,stroke:#0f7a37,color:#fff;
  classDef db fill:#a855f7,stroke:#6b21a8,color:#fff;
  class E exe;
  class R,D,B load;
  class DB db;
```

Core truths:

- N+1 is a *resolution* problem, not a *schema* problem — it appears the moment resolvers do I/O per item.
- DataLoader batches per *request*; a new loader instance per request is mandatory (it holds the cache).
- Batching and caching are orthogonal: batching reduces calls, caching avoids re-loading the same key.

## 3. The clean example

```ts
import DataLoader from 'dataloader';

const userLoader = new DataLoader<number, User>(async (ids) => {
  const users = await db.users.findWhereIn('id', ids);   // ONE query
  const byId = new Map(users.map((u) => [u.id, u]));
  return ids.map((id) => byId.get(id));                   // order must match input
});

// resolver
const resolvers = {
  Article: {
    author: (article) => userLoader.load(article.authorId),
  },
};
```

The batched `SELECT ... WHERE id IN (...)` replaces N round-trips. Returning results *in the same order as the input keys* is the loader's contract — get it wrong and articles get the wrong author.

## 4. Production reality

Execution is field-by-field; the batching layer lives *outside* the executor and only works because resolvers defer their loads to the same tick:

```ts
// graphql-js executes resolvers and awaits each; DataLoader exploits the
// microtask gap between scheduling loads and flushing the batch.
// Key invariants from graphql/dataloader:
//  - one DataLoader instance per request (cache lifetime = request lifetime)
//  - batchLoadFn receives keys in call order; must return values in that order
//  - identical keys in one batch resolve to the same promise (memoization)
```

What this teaches: the fix is architectural — inject a per-request loader and route all entity fetches through it. The mirror-image problem on the server side is solved by engines like Hasura, which *plan* the whole query and emit a single joined SQL statement rather than per-row fetches.

**Stale fact (API Design):** GraphQL N+1 is real — DataLoader is client-side mitigation, not automatic. The executor will not batch for you; you must route I/O through a loader. Engines that compile the query to SQL (Hasura) avoid it differently.

## 5. Review checklist

- Does every entity-backed resolver go through a per-request DataLoader?
- Are batched results returned in the same order as the input keys?
- Is a fresh loader created per request (not a singleton)?
- Have you measured query count under a representative nested query?

## 6. FAQ

**Q: Does the GraphQL executor batch automatically?** No — batching is the DataLoader's job, exploiting the per-tick scheduling gap.

**Q: Can I reuse one DataLoader across requests?** No — its cache is request-scoped; reuse leaks data between users.

**Q: What about Mutations?** Same pattern; create loaders in the context passed to `execute`.

**Q: Is DataLoader only for databases?** No — any I/O (HTTP, RPC) that can be batched benefits.

**Q: Do federation/gateways solve N+1?** They shift it to the subgraph; you still batch inside each subgraph.

## Source

- **Concept:** GraphQL N+1 + DataLoader batching
- **Domain:** api-design
- **Repo:** graphql/graphql-js → [src/execution](https://github.com/graphql/graphql-js/tree/main/src/execution) — field-by-field resolver execution. graphql/dataloader → [src/dataloader.js](https://github.com/graphql/dataloader) — batch + cache loader.




