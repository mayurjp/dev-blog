---
layout: post
title: "System Design: High-Level Architecture of an Event-Driven Order Processing System"
description: "A scenario-based system design post covering the high-level architecture of a distributed order processing system with ASP.NET Core WebAPI, Azure Service Bus, and Cosmos DB. Topics covered: service decomposition, messaging patterns (compensating transactions, saga), idempotency keys, and failure modes (poison messages, out-of-order delivery)."
date: 2026-08-25 09:00:00 +0530
categories: aspnet-webapi
order: 3
tags: [aspnet-webapi, system-design, architecture, event-driven, messaging]
---

## The problem

Design an order processing system that:
- Accepts orders via an HTTP API
- Validates inventory, processes payment, and triggers fulfillment
- Handles failures gracefully (payment declined, inventory out of stock)
- Can scale to 10,000 orders per hour
- Ensures exactly-once processing for each order

## High-level architecture

```
                     ┌──────────────┐
                     │   Client     │
                     │  (Web/Mobile)│
                     └──────┬───────┘
                            │ POST /orders
                            ▼
                    ┌────────────────┐
                    │  API Gateway   │
                    │  (Azure APIM)  │
                    └───────┬────────┘
                            │
                   ┌────────┴────────┐
                   │  Order Service  │
                   │  (ASP.NET Core) │
                   └────────┬────────┘
                            │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
     ┌──────────────┐ ┌──────────┐ ┌──────────────┐
     │  Azure       │ │  Cosmos  │ │  Service     │
     │  SQL (state) │ │  DB      │ │  Bus (events)│
     └──────────────┘ └──────────┘ └──────┬───────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
                    ▼                     ▼                     ▼
           ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
           │  Inventory   │     │  Payment     │     │  Fulfillment │
           │  Service     │     │  Service     │     │  Service     │
           └──────────────┘     └──────────────┘     └──────────────┘
```

## Service decomposition

### Order Service

The entry point. Validates the request (schema, business rules), assigns an order ID, and publishes an `OrderCreated` event. Does **not** wait for downstream services — it returns `202 Accepted` immediately with the order ID and status URL.

```csharp
[HttpPost("orders")]
public async Task<IActionResult> CreateOrder(OrderRequest request)
{
    var orderId = Guid.NewGuid().ToString();
    
    // Validate schema (synchronous — fast)
    var validation = await _validator.ValidateAsync(request);
    if (!validation.IsValid) return ValidationProblem(validation.Errors);

    // Persist initial state
    var order = new Order(orderId, request, status: "Pending");
    await _orderStore.SaveAsync(order);    // Cosmos DB — fast writes

    // Publish event — the system boundary
    await _messageBus.PublishAsync(new OrderCreated(orderId, request));

    return Accepted(new { orderId, status = "Pending", statusUrl = $"/orders/{orderId}" });
}
```

### Inventory Service

Consumes `OrderCreated` events, checks stock, and publishes `InventoryReserved` or `InventoryFailed`.

```csharp
// Azure Service Bus trigger
[FunctionName("HandleOrderCreated")]
public async Task HandleOrderCreated(
    [ServiceBusTrigger("orders", "inventory")] OrderCreatedEvent @event)
{
    var hasStock = await _inventoryStore.ReserveAsync(
        @event.Items.Select(i => (i.Sku, i.Quantity)));

    var outcomeEvent = hasStock
        ? new InventoryReserved(@event.OrderId, @event.Items)
        : new InventoryFailed(@event.OrderId, "Out of stock");

    await _messageBus.PublishAsync(outcomeEvent);
}
```

### Payment Service

Consumes `InventoryReserved` (only proceeds after inventory is confirmed), processes payment, and publishes `PaymentSucceeded` or `PaymentFailed`.

### Fulfillment Service

Consumes `PaymentSucceeded`, creates a shipment, and publishes `FulfillmentStarted`.

## Messaging patterns

### Compensating transactions

When PaymentService fails after InventoryReserved, the system must **compensate**: release the reserved inventory.

```csharp
// Published by PaymentService on failure
public class PaymentFailed : IEvent
{
    public string OrderId { get; }
    public string Reason { get; }
}

// Consumed by InventoryService to release stock
[FunctionName("HandlePaymentFailed")]
public async Task HandlePaymentFailed([ServiceBusTrigger("orders", "inventory-compensation")] PaymentFailed @event)
{
    await _inventoryStore.ReleaseAsync(@event.OrderId);
}
```

### Saga pattern

Each service publishes events that trigger the next step. The saga is **choreographed** (no central coordinator). If any step fails, a compensation event undoes the previous steps.

### Idempotency keys

Every event carries an `IdempotencyKey` (event ID). Services store processed event IDs and skip duplicates:

```csharp
public async Task<bool> TryProcessEventAsync<T>(T @event) where T : IEvent
{
    // Check if already processed (Cosmos DB point read — fast)
    var processed = await _idempotencyStore.ContainsAsync(@event.IdempotencyKey);
    if (processed) return true;  // already processed, skip

    // Process the event
    await ProcessAsync(@event);

    // Record as processed
    await _idempotencyStore.RecordAsync(@event.IdempotencyKey);
    return true;
}
```

## Failure modes

### Poison message

A malformed event that causes the consumer to throw on every retry. Azure Service Bus moves it to the **dead-letter queue** after 10 retries. The ops team must inspect the DLQ, fix the event (or the consumer), and re-queue it.

**Detection**: Monitor the DLQ length. Add an alert when DLQ count > 0.

### Out-of-order delivery

Events for the same order arrive in the wrong sequence (e.g. `PaymentSucceeded` before `InventoryReserved`). Solutions:

1. **Session-aware queues** — Azure Service Bus sessions guarantee FIFO ordering within a session (session ID = order ID)
2. **State-machine validation** — each event handler checks that the current state allows the transition

```csharp
public async Task HandlePaymentSucceeded(PaymentSucceeded @event)
{
    var order = await _orderStore.GetAsync(@event.OrderId);
    
    // State-machine guard
    if (order.Status != "InventoryReserved")  
    {
        // Re-queue or defer — the event arrived too early
        await _messageBus.DeferAsync(@event, TimeSpan.FromSeconds(30));
        return;
    }
    
    order.Status = "PaymentSucceeded";
    await _orderStore.UpdateAsync(order);
}
```

## Data model

```
Orders container (Cosmos DB):
{
    id: "order-123",
    customerId: "cust-456",
    items: [{ sku: "SKU-001", quantity: 2, price: 19.99 }],
    status: "PaymentSucceeded",  // Pending | InventoryReserved | PaymentSucceeded | Fulfilled | Failed
    createdAt: "2026-08-25T09:00:00Z",
    updatedAt: "2026-08-25T09:00:05Z"
}
```

Event store (Cosmos DB, same container, different partition key):
```
{
    id: "evt-789",
    orderId: "order-123",
    type: "OrderCreated",
    data: { ... },
    timestamp: "2026-08-25T09:00:01Z"
}
```

## Scaling considerations

- **Order Service**: Stateless, scale horizontally behind Azure App Service auto-scale (target: 70% CPU)
- **Service Bus**: Use topics + subscriptions for fan-out (each service gets its own subscription)
- **Cosmos DB**: Partition by `customerId` for even distribution. Use RU auto-scale with 30% buffer
- **Inventory Service**: Must be single-writer per SKU to avoid overselling. Use Cosmos DB optimistic concurrency with ETags for the inventory count

## Review checklist

- [ ] Every event has an idempotency key to guarantee exactly-once processing
- [ ] Every processing step has a compensating event for rollback
- [ ] State-machine guards prevent events from being processed in the wrong order
- [ ] Dead-letter queue length is monitored with alerts
- [ ] Each service is independently deployable and has its own data store
- [ ] API returns `202 Accepted` for async operations with a status URL

## Source

- Azure Service Bus: [learn.microsoft.com/en-us/azure/service-bus-messaging](https://learn.microsoft.com/en-us/azure/service-bus-messaging/)
- Saga pattern: [learn.microsoft.com/en-us/azure/architecture/reference-architectures/saga](https://learn.microsoft.com/en-us/azure/architecture/reference-architectures/saga/)
