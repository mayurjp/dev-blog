---
layout: page
title: "Domain-Driven Design Interview Questions: 73 Real-World Q&A from Production Manifests"
description: "73 interview-ready Domain-Driven Design questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/ddd/
---

Bite-sized, standalone interview questions and answers for Domain-Driven Design. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">73</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: Ubiquitous Language & Event Storming (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does ubiquitous language solve that a glossary document can't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A glossary documents terms separately from code, so developers can "translate" domain vocabulary into technical names during implementation — and every translation step is a drift opportunity where business rules silently drop. Ubiquitous language requires the exact same words the domain expert uses to appear verbatim in method names, class names, and event names with zero translation, so a rule like "you can't ship before payment" lives at the one method named after that business action (`SetShippedStatus`), not scattered across utility code.

<p class="qa-link">[Full post →]({{ '/ddd/ubiquitous-language-and-event-storming/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why are domain events named in past tense rather than as commands? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Past tense ("Order Shipped") represents a fact that already happened, which lets other parts of the system react to it without being coupled to *why* or *what triggered* it. A command name ("ShipOrder") implies an action at the point of invocation, mixing the trigger with the fact and coupling consumers to the command's cause. The past-tense convention directly reflects how domain experts narrate processes — "the order shipped," not "we ship the order."

<p class="qa-link">[Full post →]({{ '/ddd/ubiquitous-language-and-event-storming/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: When would you use Event Storming vs. just interviewing domain experts? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Event Storming surfaces vocabulary *collaboratively* in a workshop setting, where developers and domain experts jointly name business-significant occurrences on sticky notes before any code exists. A solo interview risks capturing one person's mental model, which may use different words than what the warehouse team or finance team actually says. The board format also exposes sequences and dependencies between events that one-on-one conversation often misses.

<p class="qa-link">[Full post →]({{ '/ddd/ubiquitous-language-and-event-storming/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the common mistake when adopting ubiquitous language? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating it as naming convention retrofitted after code is written, rather than a vocabulary agreed on *before* code exists. Once `UpdateStatus(5)` is already in production, renaming it to `SetShippedStatus()` is a refactor that competes with feature work — the language needs to be established in Event Storming first, so the code is written with it from day one.

<p class="qa-link">[Full post →]({{ '/ddd/ubiquitous-language-and-event-storming/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does `SetShippedStatus()` enforce a business rule that `order.Status = 5` cannot? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`SetShippedStatus()` checks `OrderStatus != OrderStatus.Paid` and throws before allowing the transition, so the business rule "you can't ship an unpaid order" is enforced at the single method named after that action. A raw field assignment (`order.Status = 5`) is a field mutation with no guard — it can't enforce anything because it doesn't represent a business action, just a data change. The method named after the concept is the one place the rule can actually live.

<p class="qa-link">[Full post →]({{ '/ddd/ubiquitous-language-and-event-storming/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if the same business event uses different names across services? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Downstream services will desynchronize on meaning — "OrderStatusChanged" in one service might map to a different field set than "OrderPaid" in another, creating silent data mismatches on the message bus. The eShop codebase avoids this by having each service define its *own* independently-declared copy of the event, matched by event-name convention on the bus, not by a shared type reference. Different names break that convention-based contract.

<p class="qa-link">[Full post →]({{ '/ddd/ubiquitous-language-and-event-storming/' | relative_url }})</p>
  </div>
</div>

## Topic: Entities vs Value Objects (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does the Entity/Value Object distinction solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A single domain model constantly needs to answer "are these two objects the same?" — but the correct answer depends on *what* is being compared. Two `Order` records with identical dates and items are still two different orders if they have different IDs. Two `Address` values with identical street/city/zip *are* interchangeable. Using one equality rule for both gets one of them wrong.

<p class="qa-link">[Full post →]({{ '/ddd/entities-vs-value-objects-equality-mechanics/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does Entity equality differ from Value Object equality at the implementation level? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`Entity.Equals` compares only the `Id` field — every other field can differ (or change over time) and they're still equal. `ValueObject.Equals` uses `GetEqualityComponents().SequenceEqual()` to compare *every* defining component — change any one field and they're a genuinely different value. Both also check type first, but the identity-vs-structure split is the core distinction.

<p class="qa-link">[Full post →]({{ '/ddd/entities-vs-value-objects-equality-mechanics/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if two unsaved (transient) entities are compared using the default Id-based equality? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Both would have `Id == default` (typically `0`), so `Equals` would wrongly conclude every newly-constructed, not-yet-saved entity is equal to every other one. The `Entity` base class explicitly guards against this with `IsTransient()` — if either side is transient, it returns `false` immediately, falling back to reference identity. Without this guard, two different `Order` objects with no database ID yet would compare as equal.

<p class="qa-link">[Full post →]({{ '/ddd/entities-vs-value-objects-equality-mechanics/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the gotcha with implementing Value Objects using C# `record` vs. hand-written `class`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A C# `record` gets structural equality from the compiler for free, but a hand-written `class` (as `Address` is in eShop) needs `GetEqualityComponents()` written explicitly — without it, the class silently falls back to reference equality, and two `Address` instances with identical fields would compare as *not equal*. The immutability of a `record` and value-based equality are two separate properties; using a `record` gets both at once, but a `class` requires deliberate implementation of each.

<p class="qa-link">[Full post →]({{ '/ddd/entities-vs-value-objects-equality-mechanics/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: When would you use a Value Object instead of an Entity? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
When the concept has no meaningful identity beyond its component fields — an `Address`, a `Money` amount, a date range. You never need to look it up, reference it across contexts, or track it over time by an ID. If two instances have identical field values, they *are* the same thing, and there's no reason to distinguish them. If the concept needs a unique identifier for lookup or lifecycle tracking, it's an Entity.

<p class="qa-link">[Full post →]({{ '/ddd/entities-vs-value-objects-equality-mechanics/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the tradeoff of using a Value Object for a concept that might later need identity? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Value Objects are simpler (no ID management, no ORM identity mapping) but they're replaceable — you can't reference a specific `Address` instance across transactions. If you later discover you need to track a specific address's lifecycle (e.g., "was this address updated after the order shipped?"), you've made a structural commitment to equality-by-value that's expensive to unwind into an Entity with identity.

<p class="qa-link">[Full post →]({{ '/ddd/entities-vs-value-objects-equality-mechanics/' | relative_url }})</p>
  </div>
</div>

## Topic: Aggregates & Aggregate Roots (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does the aggregate boundary solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Without a consistency boundary, any code path can freely mutate the internals of a related object graph — adding duplicate line items, applying incorrect discounts, adding items after an order ships — and no single place is responsible for keeping the whole graph consistent. The aggregate root (`Order`) is the sole entry point for all mutations, so every change runs through its business rules before it takes effect.

<p class="qa-link">[Full post →]({{ '/ddd/aggregates-and-aggregate-roots-consistency-boundary/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How is the aggregate boundary enforced at the language level in eShop? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The item collection is `private readonly List<OrderItem>`, exposed externally only as `IReadOnlyCollection<OrderItem>` — there is no public `Add` or `Remove` method. The only way to mutate items is through `Order.AddOrderItem(...)`, which merges duplicate product lines (keeping the higher discount) and adds units to existing lines. The language-level enforcement means a developer literally cannot bypass the root's rules without refactoring.

<p class="qa-link">[Full post →]({{ '/ddd/aggregates-and-aggregate-roots-consistency-boundary/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if two aggregate roots are mutated in the same transaction? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
You've defeated the purpose of the aggregate boundary: now *two* places are responsible for "is this consistent," and the transactional coupling means a failure in one aggregate's rules can roll back the other's changes unexpectedly. The DDD rule is to reference other aggregates by identity (ID) only, not to load and mutate them together — cross-aggregate consistency is handled through domain events or eventual consistency, not a shared transaction.

<p class="qa-link">[Full post →]({{ '/ddd/aggregates-and-aggregate-roots-consistency-boundary/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the common mistake when using the term "aggregate"? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating it as just "a bigger object with sub-objects inside it," making it interchangeable with a plain composed class or a database join. The specific claim an aggregate makes is narrower and stronger: everything inside the boundary is only mutated through the root, and everything outside is referenced *only by identity* — never loaded and saved together in the same transaction. The transactional isolation between aggregates, not just internal encapsulation, is the part most often dropped.

<p class="qa-link">[Full post →]({{ '/ddd/aggregates-and-aggregate-roots-consistency-boundary/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `IAggregateRoot` have zero members? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a pure marker interface — its only job is to be checkable at compile time or via reflection ("does this type represent an aggregate root?"). The codebase uses it as a constraint on generic repository interfaces (`IRepository<T> where T : IAggregateRoot`), so repositories can only be registered for aggregate roots, never for internal objects like `OrderItem`. The absence of an `IOrderItemRepository` is the structural enforcement of "only the root is reachable from outside."

<p class="qa-link">[Full post →]({{ '/ddd/aggregates-and-aggregate-roots-consistency-boundary/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Compare the merge logic in `AddOrderItem` — why is keeping the higher discount a business decision, not a technical one? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
When a duplicate product line is found, the root keeps the *higher* discount and adds units to the existing line rather than creating a separate entry. This is a business policy ("the customer gets the best discount they've earned") encoded in the one method responsible for item consistency. If external code could append directly to `_orderItems`, this rule would either be duplicated at every call site or simply not enforced at all.

<p class="qa-link">[Full post →]({{ '/ddd/aggregates-and-aggregate-roots-consistency-boundary/' | relative_url }})</p>
  </div>
</div>

## Topic: Domain Events — Dispatch Timing (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does dispatching domain events *before* `SaveChanges` solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It guarantees that if a handler fails, the aggregate's own change is rolled back along with it — both live in the same transaction. If events were dispatched *after* commit, the aggregate's change would be durable regardless of whether handlers succeed, requiring compensating actions for partial failures. The before-commit approach trades atomicity for simplicity: either everything succeeds together, or nothing is persisted.

<p class="qa-link">[Full post →]({{ '/ddd/domain-events-dispatch-timing-same-transaction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does `SaveEntitiesAsync` in eShop find and dispatch pending domain events? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It uses EF Core's change tracker to find all tracked entities where `DomainEvents?.Any()` is true, collects all events into a flat list, calls `ClearDomainEvents()` on every entity *first*, then publishes each event via `mediator.Publish()` — all before `base.SaveChangesAsync()` runs. Clearing before publishing prevents a handler that calls `AddDomainEvent` from having those new events re-collected in the same dispatch pass.

<p class="qa-link">[Full post →]({{ '/ddd/domain-events-dispatch-timing-same-transaction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if a domain event handler throws an exception? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`SaveChangesAsync` never runs — the entire transaction is rolled back, including the aggregate's own state change that triggered the event. The handler's DB writes and the aggregate's writes share the same `DbContext` and transaction, so a failure in either propagates to both. This is a deliberate choice documented explicitly in `OrderingContext.SaveEntitiesAsync`'s own comments.

<p class="qa-link">[Full post →]({{ '/ddd/domain-events-dispatch-timing-same-transaction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How do domain events differ from integration events in eShop? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Domain events (`INotification`, dispatched via MediatR, handled in-process, same transaction) represent facts internal to a single service. Integration events (`UseIntegrationEventLogs()`, persisted to an outbox table, published to other services after commit) cross service boundaries and are eventually consistent. Conflating them leads to either publishing cross-service messages inside a transaction that might roll back, or expecting same-transaction guarantees from an eventually-consistent mechanism.

<p class="qa-link">[Full post →]({{ '/ddd/domain-events-dispatch-timing-same-transaction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is `ClearDomainEvents()` called *before* `mediator.Publish`, not after? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
If a handler itself calls `AddDomainEvent` on the same or another entity (a legitimate pattern — one event raising a further event), clearing before publishing ensures the original batch can't be accidentally re-collected and re-published in the same pass. Only a genuinely new call to `SaveEntitiesAsync` would pick up newly-added events. Clearing after would risk infinite re-dispatch.

<p class="qa-link">[Full post →]({{ '/ddd/domain-events-dispatch-timing-same-transaction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the tradeoff of dispatching domain events after commit instead of before? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
After-commit dispatch means the aggregate's change is already durable regardless of what handlers do — so handler failures require compensating actions (retries, dead-letter queues, rollback commands) rather than a simple transaction rollback. It gives better availability (the aggregate's write succeeds even if side effects fail) at the cost of eventual consistency and significantly more failure-handling complexity.

<p class="qa-link">[Full post →]({{ '/ddd/domain-events-dispatch-timing-same-transaction/' | relative_url }})</p>
  </div>
</div>

## Topic: Domain Services vs Application Services (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does an application service do that a domain service does not? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
An application service *orchestrates* a use case: it resolves dependencies via DI, loads or creates the aggregate, calls the aggregate's own methods (never re-implementing decisions), persists the result, and publishes integration events. It deliberately contains no business rules. A domain service holds logic that's genuinely part of the domain but doesn't belong to any single aggregate instance — logic that must reason across many instances or coordinate between different aggregate types.

<p class="qa-link">[Full post →]({{ '/ddd/domain-services-vs-application-services/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does eShop actually implement the "which orders exceeded their grace period" policy? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Not as a textbook domain service — it's a raw SQL query run from a background worker (`GracePeriodManagerService`, a `BackgroundService` in a separate `OrderProcessor` process). The query (`WHERE CURRENT_TIMESTAMP - "OrderDate" >= @GracePeriodTime`) directly hits the `ordering.orders` table, bypassing the aggregate and repository entirely. This is a pragmatic infrastructure choice, not the clean `IGracePeriodPolicy` domain service a textbook would suggest.

<p class="qa-link">[Full post →]({{ '/ddd/domain-services-vs-application-services/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the risk of the grace-period logic living in a raw SQL string? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The business rule exists in exactly one place — the SQL predicate — but nothing about `Order` itself enforces or represents it. A future change to what "expired" means has to be made in a raw SQL string in an unrelated microservice, not in the domain model a reader would naturally look to first. This is a real, honest gap worth naming: the logic is correct but its location violates the principle of keeping domain rules in the domain layer.

<p class="qa-link">[Full post →]({{ '/ddd/domain-services-vs-application-services/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Compare the command handler's role vs. the aggregate's role in `CreateOrderCommandHandler`. <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The handler sequences steps: publish an integration event, build the aggregate via its constructor, call `AddOrderItem`, save. Every line that could be described as "a business rule" is actually a call *into* the aggregate — the handler never decides *whether* an order is valid. `Order`'s constructor and `AddOrderItem` are where invariants are enforced. The handler is pure orchestration.

<p class="qa-link">[Full post →]({{ '/ddd/domain-services-vs-application-services/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if you put business rules in the application service instead of the aggregate? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Rules in the application service only apply when that specific use case is executed — a different API endpoint or background job that constructs the same aggregate won't run those rules. The aggregate is the consistency boundary; rules *inside* it apply regardless of who constructs or mutates it. Rules in the application service are effectively per-use-case guards, not invariants.

<p class="qa-link">[Full post →]({{ '/ddd/domain-services-vs-application-services/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why might a team choose raw SQL over a domain service for cross-aggregate policy? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Performance — loading every submitted `Order` aggregate through `IOrderRepository` and inspecting its date in memory would be orders of magnitude slower than a single SQL query that filters at the database level. The pragmatic choice trades domain purity for operational efficiency, especially when the policy runs as a periodic background job where query performance directly affects system throughput.

<p class="qa-link">[Full post →]({{ '/ddd/domain-services-vs-application-services/' | relative_url }})</p>
  </div>
</div>

## Topic: Repositories as Aggregate Persistence Boundaries (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does restricting repositories to aggregate roots solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Without this restriction, any code path can independently query `OrderItem` rows directly (raw SQL, a generic `DbSet<OrderItem>` LINQ query, a separate `OrderItemRepository`), load/mutate/save items without touching the `Order` that owns them — silently bypassing every invariant `AddOrderItem` enforces. The repository boundary mirrors the domain model's consistency boundary at the persistence layer.

<p class="qa-link">[Full post →]({{ '/ddd/repositories-as-aggregate-persistence-boundaries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does `GetAsync` ensure the caller never receives a partial aggregate? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It performs two separate calls to the `DbContext`: `FindAsync` for the `Order` root, then an explicit `Entry(order).Collection(i => i.OrderItems).LoadAsync()` for the items. This eagerly loads the entire graph before returning — the caller never receives an `Order` that looks complete but silently issues another database round-trip the first time `.OrderItems` is touched (which is what lazy loading would do).

<p class="qa-link">[Full post →]({{ '/ddd/repositories-as-aggregate-persistence-boundaries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the gotcha with relying on EF Core lazy loading inside a repository? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Lazy loading would let a caller receive an `Order` that *looks* complete but silently issues another database round-trip when `.OrderItems` is first accessed — possibly outside the original transaction or `DbContext` lifetime. This defeats the aggregate's consistency boundary: the caller thinks it has the whole graph, but parts of it are loaded later, in a potentially different context, without the root's invariants being re-checked.

<p class="qa-link">[Full post →]({{ '/ddd/repositories-as-aggregate-persistence-boundaries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `Update` just flip EF Core's entity state to `Modified` instead of doing field-by-field diffing? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
All the actual decision-making already happened earlier through the aggregate's own methods — the repository's job at save time is purely mechanical. The aggregate ensured invariants when the mutation happened; the repository just tells EF Core to persist whatever state the aggregate ended up in. Duplicating that logic in the repository would violate single responsibility and create two places to update when invariants change.

<p class="qa-link">[Full post →]({{ '/ddd/repositories-as-aggregate-persistence-boundaries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does the `UnitOfWork => _context` assignment relate to domain event dispatch? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The `DbContext` itself *is* the unit of work — so `_orderRepository.UnitOfWork` returns the same context the repository operates through. This makes `SaveEntitiesAsync()` (the method that dispatches domain events before committing) available directly from `_orderRepository.UnitOfWork`, unifying repository and unit-of-work without two competing abstractions.

<p class="qa-link">[Full post →]({{ '/ddd/repositories-as-aggregate-persistence-boundaries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the tradeoff of having no generic `Repository<T>` for internal types like `OrderItem`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
You lose CRUD convenience — querying `OrderItem` by its own ID isn't possible without going through `Order`. But this is deliberate: a generic repository per table optimizes for CRUD convenience, not consistency enforcement, and is precisely what this codebase avoids. The absence of extra repositories is the enforcement mechanism, not an oversight.

<p class="qa-link">[Full post →]({{ '/ddd/repositories-as-aggregate-persistence-boundaries/' | relative_url }})</p>
  </div>
</div>

## Topic: Factories — Complex Aggregate Construction (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does a static factory method like `Order.NewDraft()` solve that a constructor can't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A real order (buyer, address, payment, domain event) and a checkout-preview draft (no buyer, no event, minimal state) are two genuinely different valid starting states. Cramming both into one constructor means accepting null/placeholder values for fields that don't apply yet, or building a parallel "not-yet-a-real-order" type — both of which leak the distinction into every caller. The factory method encapsulates the draft construction path, hiding that the aggregate has two distinct initialization modes.

<p class="qa-link">[Full post →]({{ '/ddd/factories-for-complex-aggregate-construction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `NewDraft()` intentionally omit that the real constructor includes? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It raises no `OrderStartedDomainEvent`, sets no buyer, address, or payment details, and marks `_isDraft = true`. A draft was never "started" in any sense the rest of the system should react to — the *absence* of the domain event call is just as deliberate as its presence in the other constructor. The draft exists only to compute totals via `AddOrderItem`, then gets discarded.

<p class="qa-link">[Full post →]({{ '/ddd/factories-for-complex-aggregate-construction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if a draft order accidentally gets passed to `IOrderRepository.Add`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Nothing stops this at compile time — `NewDraft()` returns the same `Order` type. The draft is never persisted in eShop because `CreateOrderDraftCommandHandler` builds it, converts it to an `OrderDraftDTO`, and discards it. But if a different code path did persist it, you'd have an order in the database with no buyer, no address, no domain event, and `_isDraft = true` — a state the rest of the system doesn't expect to exist in persistence. This is a design risk the team accepts because the draft is used only within a narrow, controlled scope.

<p class="qa-link">[Full post →]({{ '/ddd/factories-for-complex-aggregate-construction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why do both construction paths converge on the same `AddOrderItem` method? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Because the aggregate's core invariants (merge duplicate product lines, keep higher discount, add units) are independent of which valid starting state was used to reach them. The factory methods differ only in what identity, payment, and event-raising happens *before* items are added — the item-handling logic itself is identical, proving the invariants belong to the aggregate, not to a specific construction path.

<p class="qa-link">[Full post →]({{ '/ddd/factories-for-complex-aggregate-construction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Does a DDD factory require a separate `OrderFactory` class with an `IFactory<T>` interface? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
No. `Order.NewDraft()` is a static method directly on the aggregate type — a real, working factory in every sense that matters (encapsulates a specific valid construction path, hides the details of reaching it). The classic GoF Factory Method pattern's typical presentation with a separate class is one implementation; a static method on the aggregate itself is simpler and sufficient when there's no complex creation logic requiring its own dependencies.

<p class="qa-link">[Full post →]({{ '/ddd/factories-for-complex-aggregate-construction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the tradeoff of raising a domain event inside a constructor vs. returning it separately? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Raising the event inside the constructor makes "an order was created" and "the system was told" atomic — they can never happen as two separate, forgettable steps. The tradeoff is that the constructor has a side effect (buffering an event), which makes the object harder to test in isolation and couples creation to event dispatch. Returning events separately gives more control but requires the caller to remember to raise them.

<p class="qa-link">[Full post →]({{ '/ddd/factories-for-complex-aggregate-construction/' | relative_url }})</p>
  </div>
</div>

## Topic: Specification Pattern (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does the specification pattern solve that ad hoc `if` chains don't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A rule like "eligible for expedited shipping" combines several smaller rules (in-stock, verified address, good standing). As an `if` statement, it works once — but the moment a second place needs "in-stock AND verified address" without the account check, the logic is either copy-pasted (and drifts) or the method gets an awkward boolean toggle. Specifications make each rule a reusable, testable object that composes without collapsing back into one big conditional.

<p class="qa-link">[Full post →]({{ '/ddd/specification-pattern-and-or-not-combinators/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `AndSpecification` evaluate both sides unconditionally instead of short-circuiting? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Because a visitor walks the same specification tree afterward to collect validation errors from every node. A node that was never evaluated has no stored result to collect — so short-circuiting would silently produce incomplete error reporting even though the boolean answer was technically correct. The unconditional evaluation is required by the error-collection mechanism layered on top, not by the boolean logic itself.

<p class="qa-link">[Full post →]({{ '/ddd/specification-pattern-and-or-not-combinators/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if you use the parameterless `Not()` instead of `Not(errorFactory)`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The parameterless version degrades to a plain `Specification<T>` wrapping a raw predicate — it loses the ability to report a specific validation error on failure through the visitor. The `errorFactory` overload returns a full `NotSpecification<T>`, preserving error-reporting capability. Composing with the wrong one silently drops error detail without any compiler warning.

<p class="qa-link">[Full post →]({{ '/ddd/specification-pattern-and-or-not-combinators/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does `ValidationResultCollector` walk the specification tree? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It implements the visitor pattern — `Visit(AndSpecification<TData>)` calls `.Accept(this)` on *both* `Left` and `Right` unconditionally, concatenating their results. This is why `AndSpecification` must evaluate both sides: if `Right` was never evaluated because `Left` already failed, `Right`'s `LastResults` would be stale or empty, and the collector would report an incomplete picture of *why* the specification failed.

<p class="qa-link">[Full post →]({{ '/ddd/specification-pattern-and-or-not-combinators/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Compare a boolean-only specification with one that supports visitor-based error collection. <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A boolean-only specification can short-circuit AND (stop at first failure) because it only needs a pass/fail answer. One that supports error collection *must* evaluate unconditionally because the visitor needs stored results from every node to produce a complete error breakdown. The boolean-only version is simpler but can't tell you *which* leaf rules failed — it just says the combined rule failed.

<p class="qa-link">[Full post →]({{ '/ddd/specification-pattern-and-or-not-combinators/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the tradeoff of unconditional evaluation in `AndSpecification`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Every node in the tree is evaluated even when the boolean answer is already determined — for a tree with expensive leaf evaluations (database queries, HTTP calls), this means wasted work. The tradeoff is complete error reporting (the visitor gets every failure) at the cost of performance. A boolean-only spec could short-circuit but would silently lose error detail.

<p class="qa-link">[Full post →]({{ '/ddd/specification-pattern-and-or-not-combinators/' | relative_url }})</p>
  </div>
</div>

## Topic: Context Mapping — Strategic DDD Relationships (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does each consumer defining its own copy of an integration event solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Adopting the upstream context's exact data shape means every field the upstream team adds silently becomes part of the downstream context's dependency surface, whether the downstream needs that field or not. Catalog.API defines its own smaller `OrderStatusChangedToPaidIntegrationEvent` with only `OrderId` and `OrderStockItems` — dropping `BuyerName`, `BuyerIdentityGuid`, and `OrderStatus` entirely — so Ordering's internal model changes don't force Catalog to recompile or retest.

<p class="qa-link">[Full post →]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does a Published Language relationship differ from a Conformist one? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
In a Conformist relationship, the downstream context adopts the upstream's exact type — there's a shared assembly reference, and the downstream is coupled to every field. In a Published Language (Open Host Service), the upstream exposes a stable contract, but each consumer defines its *own* locally-declared type shaped around what it needs, matched by event-name convention on the bus, not by a shared type reference. No shared assembly exists between publisher and consumer.

<p class="qa-link">[Full post →]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How many independently-declared classes represent "order paid" in eShop, and why isn't that duplication? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Four — `Ordering.API`, `Catalog.API`, `WebApp`, and `Webhooks.API` each declare their own `OrderStatusChangedToPaidIntegrationEvent`. This isn't refactoring-worthy duplication; each is a deliberate local translation of the same upstream fact into exactly the shape that consumer's logic needs. If Ordering adds a field for its own reasons, none of the consumers need to change.

<p class="qa-link">[Full post →]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What links these four event classes at the type-system level? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Nothing — no shared interface beyond the generic `IntegrationEvent` base, no shared assembly between publisher and consumer. The connection is entirely by convention: an event-name/routing-key match on the message bus. This is what makes each consumer genuinely free to shape its own contract; a shared type reference would couple them to the publisher's full model.

<p class="qa-link">[Full post →]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the gotcha with thinking context mapping is a single dropdown selection per pair of bounded contexts? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A real system frequently runs multiple relationship types *simultaneously* between the same two contexts. Ordering and Catalog share a Published Language integration-event contract for "order paid," while a completely different piece of shared code (common `IntegrationEvent` base type, shared infrastructure libraries) functions like a lightweight Shared Kernel. The relationship types describe what's happening in different parts of an integration, not a single classification applied uniformly.

<p class="qa-link">[Full post →]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if Catalog.API directly referenced Ordering's `OrderStatusChangedToPaidIntegrationEvent` type? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Catalog would be coupled to every field Ordering's team adds — a buyer name change, a new payment field, anything — forcing Catalog to recompile, retest, and potentially redeploy even when the change is irrelevant to stock management. The independent declaration ensures Catalog only depends on the two fields it actually uses (`OrderId`, `OrderStockItems`), insulated from Ordering's internal evolution.

<p class="qa-link">[Full post →]({{ '/ddd/context-mapping-published-language-per-consumer-contracts/' | relative_url }})</p>
  </div>
</div>

## Topic: Event Sourcing — Replay and Snapshotting (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does event sourcing solve that traditional state storage doesn't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Traditional storage keeps only current state — an `UPDATE` overwrites whatever was there, and the history of *how* it got there is gone. Event sourcing stores an append-only log of every fact that happened, and current state is *derived* by replaying that log. This preserves the full history, which is needed for audit trails, temporal queries, and reconstructing past states — but it raises the engineering question of how to load an aggregate's current values fast without replaying from the very first event every time.

<p class="qa-link">[Full post →]({{ '/ddd/event-sourcing-replay-and-snapshotting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `Emit()` do atomically, and why is this important? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It stamps the event with `Version + 1` and immediately applies it in-memory via `ApplyEvent` — so the aggregate's fields reflect the change right away, before anything is persisted. `_uncommittedEvents` merely buffers what still needs to be written; `CommitAsync` persists and clears the buffer later. A caller inspecting the aggregate's properties right after `Emit` sees already-updated state, with nothing written to storage yet.

<p class="qa-link">[Full post →]({{ '/ddd/event-sourcing-replay-and-snapshotting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens during replay if an event's `AggregateSequenceNumber` isn't exactly `Version + 1`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The replay throws an `InvalidOperationException` — a gap, duplicate, or out-of-order event is treated as corruption, not silently applied. Without this check, a corrupted event stream would produce a wrong final state with no error at all. The strict sequence-number verification is what makes "current state = replay of history" a safe claim.

<p class="qa-link">[Full post →]({{ '/ddd/event-sourcing-replay-and-snapshotting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does snapshotting bound replay cost? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Periodically, a serialized copy of the aggregate's state and its sequence number are persisted alongside the event log. On load, if a snapshot exists, `Version` is set directly from the snapshot's metadata, and only events *after* that point are fetched and replayed. The full history before the snapshot is never touched again — an aggregate with 100,000 events loads roughly as fast as one with 100, because only the bounded tail is replayed.

<p class="qa-link">[Full post →]({{ '/ddd/event-sourcing-replay-and-snapshotting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Does event sourcing require CQRS? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
No. EventFlow's `AggregateRoot` and `SnapshotAggregateRoot` implement complete event-sourcing mechanics (emit, replay, snapshot) with no reference to a separate read model, query side, or CQRS infrastructure. An aggregate can be fully event-sourced and still be queried the ordinary way through the same object. CQRS (splitting reads and writes into separate models) is a separate architectural decision that often pairs well with event sourcing for performance, but nothing about replaying state requires it.

<p class="qa-link">[Full post →]({{ '/ddd/event-sourcing-replay-and-snapshotting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the tradeoff of snapshotting frequency? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
More frequent snapshots mean faster loads (less replay per load) but more write overhead (serializing and persisting state after every N events). The `SnapshotStrategy.ShouldCreateSnapshotAsync` call controls this — too frequent wastes storage on aggregates with short lifetimes; too infrequent leaves hot aggregates replaying thousands of events. The strategy lets you tune this per aggregate type based on actual access patterns.

<p class="qa-link">[Full post →]({{ '/ddd/event-sourcing-replay-and-snapshotting/' | relative_url }})</p>
  </div>
</div>

## Topic: Rich Domain Model vs Anemic Domain Model (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the real test for whether a domain model is rich or anemic? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The question isn't "does this class have methods with logic" — it's "is there any code path, anywhere, that can change this field *without* going through those methods." `Order` answers no (all fields are `private set`, reachable only through `AddOrderItem`, `SetShippedStatus`, etc.). `CatalogItem` answers yes — `AvailableStock` has a public setter, and `UpdateItem` in the API uses `CurrentValues.SetValues(productToUpdate)` to bulk-copy every field from the HTTP request, bypassing `RemoveStock`'s guard clause entirely.

<p class="qa-link">[Full post →]({{ '/ddd/rich-vs-anemic-domain-model-same-repo-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does `CurrentValues.SetValues(productToUpdate)` bypass the domain model's invariants? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It's an EF Core convenience method that reflects over every scalar property on `productToUpdate` (bound directly from the HTTP request body) and copies each one onto the tracked entity — including `AvailableStock`. `RemoveStock`'s guard clause (`if (AvailableStock == 0) throw`) is in the same class but is never called by this code path. A client submitting a negative stock value gets it written straight to the database.

<p class="qa-link">[Full post →]({{ '/ddd/rich-vs-anemic-domain-model-same-repo-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the tradeoff of having a public setter on `AvailableStock` vs. making it `private set`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A public setter is simpler for CRUD operations — the `UpdateItem` endpoint can bulk-copy all properties without writing explicit per-field mapping. Making it `private set` would force every mutation through `RemoveStock`/`AddStock`, enforcing invariants but requiring more code per API endpoint. The team may have decided catalog data is lower-stakes than committed financial orders, accepting the tradeoff for simplicity.

<p class="qa-link">[Full post →]({{ '/ddd/rich-vs-anemic-domain-model-same-repo-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does the same repository demonstrate both rich and anemic models simultaneously? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`Order` (in `Ordering.Domain`) has `private set` on every field, reachable only through aggregate-root methods. `CatalogItem` (in `Catalog.API`) has real `RemoveStock`/`AddStock` methods with guard clauses, but `AvailableStock` is `{ get; set; }` — publicly settable. Both live in the same repository (`dotnet/eShop`), written by the same team. "Rich vs. anemic" isn't decided once for a whole codebase; it's decided per class.

<p class="qa-link">[Full post →]({{ '/ddd/rich-vs-anemic-domain-model-same-repo-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the common mistake when checking if a class has a rich domain model? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Checking only whether the class has behavior methods — "does it have `RemoveStock`? Yes? It's rich." The sufficient test requires checking the *rest of the codebase* to verify that every mutation path is forced through those methods. `CatalogItem` has behavior methods with real guard clauses but is still partially anemic because a public setter and a generic ORM convenience method provide an alternative path that skips them entirely.

<p class="qa-link">[Full post →]({{ '/ddd/rich-vs-anemic-domain-model-same-repo-both/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why isn't `CatalogItem`'s anemic model necessarily a bug? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Catalog data is arguably lower-stakes than committed financial orders — a stock value being set incorrectly is recoverable in a way that an order shipping without payment isn't. The team may have consciously decided the added rigor wasn't worth the API complexity for this particular aggregate. The gap is real and demonstrable, but its severity depends on the business consequences of the invariant being bypassed.

<p class="qa-link">[Full post →]({{ '/ddd/rich-vs-anemic-domain-model-same-repo-both/' | relative_url }})</p>
  </div>
</div>

## Topic: Domain Validation & Invariant Enforcement (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why are input validation and business invariant enforcement two separate layers? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
"is this input well-formed" (required field present, value is numeric) can be checked the instant a request arrives, before any domain object exists. "does this preserve the domain's rules" (this discount doesn't exceed what the item is worth) can only be checked once you have the actual values together inside a method that understands what "makes sense" for them. Collapsing both into one pass either checks business rules too early (before enough context exists) or lets structurally invalid input reach the domain at all.

<p class="qa-link">[Full post →]({{ '/ddd/domain-validation-vs-invariant-enforcement-two-layers/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does `ValidatorBehavior` in eShop's MediatR pipeline enforce input validation? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It runs every registered FluentValidation validator against the incoming command *before* its handler executes. If any validator reports a failure, it throws immediately and never calls `next()` — the handler, and the domain model downstream, is never reached. This is a hard gate applied uniformly to every command without each handler needing its own validation boilerplate.

<p class="qa-link">[Full post →]({{ '/ddd/domain-validation-vs-invariant-enforcement-two-layers/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What check can `OrderItem`'s constructor enforce that FluentValidation cannot? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`(unitPrice * units) < discount` — a rule depending on the *relationship* between three separate values that only exist together once you're constructing the actual domain object. FluentValidation could check "is `unitPrice` a positive number" in isolation, but "is this discount too large *relative to* this price and quantity" is a domain-shaped question that has to live where the values actually come together.

<p class="qa-link">[Full post →]({{ '/ddd/domain-validation-vs-invariant-enforcement-two-layers/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if the invariant layer is the only validation layer? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Every API endpoint that constructs an `OrderItem` must call its constructor (which enforces invariants), but nothing stops structurally invalid input (missing fields, nonsensical values) from reaching the domain layer at all — the domain objects would reject bad *relationships* between valid values but not malformed input shapes. This means the domain layer handles errors that are really API-layer concerns, mixing responsibilities.

<p class="qa-link">[Full post →]({{ '/ddd/domain-validation-vs-invariant-enforcement-two-layers/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why do both validation layers throw the same `OrderingDomainException` type? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It gives every API consumer one consistent exception type to catch, simplifying error handling at the API boundary. The cost is that the exception type alone doesn't distinguish "your request was malformed" from "this operation would violate a business rule" — a caller has to inspect the exception's message or inner exception to tell which kind of failure actually happened. This is a deliberate, if debatable, design choice.

<p class="qa-link">[Full post →]({{ '/ddd/domain-validation-vs-invariant-enforcement-two-layers/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the gotcha of treating validation as a single, undifferentiated concern? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It either pushes business-rule checks too early (before the values needed to evaluate them exist together) or risks skipping them if a caller reaches the domain object through any path other than the one the single validation pass was wired into. Two structurally different kinds of check exist in most real domain-driven systems: request-shape validation (checked once, before the domain is touched) and invariant enforcement (checked inside the domain model on every mutation, unconditionally).

<p class="qa-link">[Full post →]({{ '/ddd/domain-validation-vs-invariant-enforcement-two-layers/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Compare the two layers: when does each run, and what does each know? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Layer 1 (`ValidatorBehavior` + FluentValidation) runs first, before the handler executes, and knows only the *shape* of the incoming command — it has no access to the aggregate. Layer 2 (`OrderItem`'s constructor and `SetNewDiscount`) runs on every mutation, regardless of whether Layer 1 approved the command, and knows the actual domain values in context. Neither can replace the other: Layer 1 can't check business relationships between values it doesn't have; Layer 2 can't prevent malformed input from reaching the domain at all.

<p class="qa-link">[Full post →]({{ '/ddd/domain-validation-vs-invariant-enforcement-two-layers/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 73 across Domain-Driven Design

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
  });

  /* Expand all / collapse all */
  var expandBtn = document.getElementById('qa-expand-all');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var items = document.querySelectorAll('.qa-item');
      var allOpen = Array.prototype.every.call(items, function(i){ return i.classList.contains('open'); });
      items.forEach(function (item) {
        if (allOpen) item.classList.remove('open');
        else item.classList.add('open');
      });
      expandBtn.textContent = allOpen ? 'Expand all' : 'Collapse all';
    });
  }

  apply();
})();
</script>
