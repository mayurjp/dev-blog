---
layout: post
title: "Why can't you just add a partition key to a SQL table and call it Cosmos DB?"
date: 2026-08-14 09:00:00 +0530
categories: databases
tags: [databases, sql, nosql, entity-framework-core, cosmos-db, data-modeling]
---

## 1. The Engineering Problem: "NoSQL" isn't a syntax choice, it's a physical-distribution choice

It's tempting to think of "NoSQL" as "a database that doesn't use SQL syntax" and treat
switching between a relational store and a document store as roughly a query-language
migration. It isn't. A relational schema is built around **normalization**: split data
into small tables, connect them with foreign keys, and let joins reassemble the full
picture at query time — because storage was expensive and duplication was the thing to
eliminate.

A document database does close to the opposite on purpose. It **embeds** related data
into a single denormalized document (an order together with its line items, in one
document, not three joined tables), because the engine is optimized to fetch or write
one whole document in a single operation with no join at all. And it requires you to
declare, up front, a **partition key** — a concept relational databases simply don't
have, because relational engines don't require you to decide in advance which physical
node your data will live on.

## 2. The Technical Solution: the partition key is a distribution decision, not a modeling nicety

```
Relational (normalized, joined at query time):
   Orders table          OrderItems table
   ┌────┬────────┐       ┌────┬─────────┬──────────┐
   │ Id │ Buyer  │  ◄──┐ │ Id │ OrderId │ ProductId│
   └────┴────────┘     └─┤ FK └────┴─────────┴──────────┘
   One row, one place. Query joins them back together.

Document/NoSQL (denormalized, embedded, partitioned):
   { "id": "order-123",
     "partitionKey": "buyer-42",       ◄── decides WHICH physical partition
     "buyer": "buyer-42",                  this document lives on
     "items": [ {...}, {...} ] }        ◄── embedded, not joined
```

Three truths to hold:

1. The partition key isn't a search filter you bolt on later — it determines which
   physical partition (and therefore which node) a document is written to and read
   from, which is why queries *within* one partition are cheap and queries *across*
   partitions require fanning out to many nodes.
2. Embedding related data (line items inside the order document) trades away
   normalization's "single source of truth per fact" guarantee for "one read, one
   write, no join" — a deliberate tradeoff, not a limitation to work around.
3. Relational engines can add read replicas and shard manually, but they were never
   designed around a mandatory, schema-level distribution key the way document stores
   are — that's the actual dividing line, not the query syntax.

## 3. The clean example (concept in isolation)

```csharp
// Relational: normalize, connect via foreign key, no distribution decision needed.
modelBuilder.Entity<Order>()
    .HasMany(o => o.Items)
    .WithOne()
    .HasForeignKey(i => i.OrderId);

// Document/NoSQL: embed the items directly, and declare a partition key —
// this single line is what tells the engine how to physically distribute data.
modelBuilder.Entity<Order>()
    .HasPartitionKey(o => o.BuyerId)
    .OwnsMany(o => o.Items); // embedded, not a separate joined table
```

## 4. Production reality (from a real relational config and the real Cosmos provider)

**Relational** — the actual `DbContext` wiring from `dotnet/eShop`'s Ordering service,
using PostgreSQL:

```csharp
services.AddDbContext<OrderingContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("orderingdb"));
});
builder.EnrichNpgsqlDbContext<OrderingContext>();
```

**Document/NoSQL** — the real `UseCosmos` and `HasPartitionKey` extension methods from
`dotnet/efcore`'s own Cosmos provider (the same EF Core API surface, a fundamentally
different underlying model). License headers omitted:

```csharp
public static class CosmosDbContextOptionsExtensions
{
    public static DbContextOptionsBuilder UseCosmos(
        this DbContextOptionsBuilder optionsBuilder,
        Action<CosmosDbContextOptionsBuilder> cosmosOptionsAction)
    {
        Check.NotNull(optionsBuilder);
        Check.NotNull(cosmosOptionsAction);

        ConfigureWarnings(optionsBuilder);
        cosmosOptionsAction.Invoke(new CosmosDbContextOptionsBuilder(optionsBuilder));

        return optionsBuilder;
    }
}
```

```csharp
public static EntityTypeBuilder HasPartitionKey(
    this EntityTypeBuilder entityTypeBuilder,
    string? name,
    params string[]? additionalPropertyNames)
{
    Check.NullButNotEmpty(name);
    Check.HasNoEmptyElements(additionalPropertyNames);

    if (name is null)
    {
        entityTypeBuilder.Metadata.SetPartitionKeyPropertyNames(null);
    }
    else
    {
        var propertyNames = new List<string> { name };
        propertyNames.AddRange(additionalPropertyNames);
        entityTypeBuilder.Metadata.SetPartitionKeyPropertyNames(propertyNames);
    }

    return entityTypeBuilder;
}
```

What this teaches that "SQL vs NoSQL" as a slogan can't:

- **`UseNpgsql` takes a connection string. `UseCosmos` takes a configuration action**
  that, among other things, is where a partition key gets declared — the *shape* of
  the configuration API itself reflects that one engine needs a distribution decision
  up front and the other doesn't.
- **`HasPartitionKey` writes into the entity's own metadata**
  (`SetPartitionKeyPropertyNames`) — it's not a query-time hint, it's baked into how EF
  Core understands the entity's storage model from that point forward, exactly like a
  primary key is.
- **Both are genuinely EF Core** — the same `DbContext`/`EntityTypeBuilder` API
  surface wraps two engines with fundamentally different physical models. That's the
  real lesson: the abstraction can unify the *syntax*; it can't and shouldn't hide the
  *distribution tradeoff* underneath it, which is exactly why `HasPartitionKey` exists
  as an explicit, unavoidable call rather than an automatic default.

---

## Source

- **Concept:** Relational vs NoSQL data models
- **Domain:** databases
- **Repo:** [dotnet/efcore](https://github.com/dotnet/efcore) → [`src/EFCore.Cosmos/Extensions/CosmosDbContextOptionsExtensions.cs`](https://github.com/dotnet/efcore/blob/main/src/EFCore.Cosmos/Extensions/CosmosDbContextOptionsExtensions.cs), [`src/EFCore.Cosmos/Extensions/CosmosEntityTypeBuilderExtensions.cs`](https://github.com/dotnet/efcore/blob/main/src/EFCore.Cosmos/Extensions/CosmosEntityTypeBuilderExtensions.cs); [dotnet/eShop](https://github.com/dotnet/eShop) → [`src/Ordering.API/Extensions/Extensions.cs`](https://github.com/dotnet/eShop/blob/main/src/Ordering.API/Extensions/Extensions.cs) — EF Core's own first-party providers for both models
