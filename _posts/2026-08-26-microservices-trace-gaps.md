---
layout: post
title: "Microservices: Why Does My Distributed Trace Show Gaps Between Services?"
description: "A scenario-based debugging walkthrough: an OpenTelemetry trace shows 500ms gaps between service calls even though network latency is <5ms. The root cause is async context propagation loss when using Task.Run without Activity.Current. Trace the fix through W3C traceparent headers, ActivitySource, and baggage."
date: 2026-08-26 09:00:00 +0530
categories: microservices
order: 90
tags: [microservices, troubleshooting, debugging, distributed-tracing, opentelemetry, dotnet]
---
> **In plain English (30 sec):** Code you already write — Map, function, API call, just bigger.


## The symptom

> "Our distributed trace in Jaeger shows the API gateway calling Service A (5ms), then a 500ms gap, then Service B (3ms), then another 400ms gap, then Service C. The network team says inter-service latency is sub-5ms. What's eating 900ms?"

The trace looks like this:
```
Gateway (2ms)
  └── Service A (5ms)     ← 500ms gap here →   
       └── Service B (3ms)  ← 400ms gap here →
            └── Service C (4ms)
```

Total end-to-end: ~914ms. Actual work: ~14ms. Gaps: ~900ms.

## Reproduce locally

```bash
# Start Jaeger
docker run -d --name jaeger -p 16686:16686 -p 6831:6831/udp jaegertracing/all-in-one:1.53

# Run the 3-service chain with otel
dotnet run --project Gateway
dotnet run --project ServiceA
dotnet run --project ServiceB
dotnet run --project ServiceC

# Hit the endpoint
curl http://localhost:5000/api/process
# Check Jaeger UI at http://localhost:16686
```

## The root cause chain

### 1. The trace is created correctly at the gateway

```csharp
// Gateway - Program.cs
builder.Services.AddOpenTelemetry()
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddSource("Gateway")
        .AddOtlpExporter(o => o.Endpoint = new Uri("http://localhost:4317")));
```

The gateway creates an `Activity` with `traceparent` header on the outbound HTTP call to Service A. Service A receives it and extracts the context. ✅

### 2. Service A loses context on `Task.Run`

```csharp
// Service A - Controller
[HttpPost("process")]
public async Task<IActionResult> Process(OrderRequest req)
{
    // THIS IS THE BUG
    await Task.Run(() => _processor.HandleAsync(req));
    
    return Ok();
}
```

`Task.Run` captures the current `SynchronizationContext` (none in ASP.NET Core) but **does not capture `Activity.Current`**. The background thread has `Activity.Current == null`, so when it makes the HTTP call to Service B, no `traceparent` header is sent.

### 3. Service B starts a new trace

Since Service B receives a request without `traceparent`, it starts a **new root span**. The trace is now split into two separate traces in Jaeger.

### 4. Confirm with correlation IDs

Add logging with correlation ID:

```csharp
// In all services
logger.LogInformation("TraceId={TraceId} SpanId={SpanId} ParentId={ParentId}", 
    Activity.Current?.TraceId, Activity.Current?.SpanId, Activity.Current?.ParentSpanId);
```

You'll see:
```
Service A: TraceId=abc123 SpanId=aaa ParentId=gateway-span
Service A background: TraceId=abc123 SpanId=aaa ParentId=gateway-span  ← same!
Service B: TraceId=def456 SpanId=bbb ParentId=                    ← NEW ROOT!
```

### 5. The fix: propagate Activity context

```csharp
// Service A - Correct
[HttpPost("process")]
public async Task<IActionResult> Process(OrderRequest req)
{
    var parentActivity = Activity.Current;  // Capture before Task.Run
    await Task.Run(() => 
    {
        Activity.Current = parentActivity;  // Restore context
        return _processor.HandleAsync(req);
    });
    return Ok();
}
```

Or better: use `ActivitySource.StartActivity` with explicit parent:

```csharp
// In the processor
public async Task HandleAsync(OrderRequest req)
{
    using var activity = _activitySource.StartActivity("HandleOrder", ActivityKind.Internal, Activity.Current?.Context ?? default);
    // ... work that calls Service B
}
```

The `HttpClientInstrumentation` will automatically inject `traceparent` from `Activity.Current` into the outbound request.

## Deeper checks for production

1. **Verify all HttpClient calls use instrumented clients** — register via `AddHttpClient<...>()` not `new HttpClient()`

2. **Check `HttpClientInstrumentation` options** — ensure `EnrichWithException` and `RecordException` are enabled

3. **Validate W3C traceparent format** — `traceparent: 00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`

4. **Add baggage for cross-cutting concerns** — tenant ID, user ID, feature flags:

```csharp
// Gateway - add baggage
Baggage.Current = Baggage.Current.SetBaggage("tenant-id", tenantId);

// Service C - read baggage
var tenantId = Baggage.GetBaggage("tenant-id");
```

5. **Sampling strategy** — use `TraceIdRatioBasedSampler` (e.g., 10%) in production, `AlwaysOnSampler` in dev

## Prevention checklist

- [ ] Never use `Task.Run` / `ThreadPool.QueueUserWorkItem` without restoring `Activity.Current`
- [ ] Prefer `IHostedService` / `BackgroundService` for background work with explicit `ActivitySource`
- [ ] All outbound HTTP calls go through DI-registered `HttpClient` (instrumented)
- [ ] gRPC calls use `GrpcClientInstrumentation` with context propagation
- [ ] Message queues (RabbitMQ, Kafka, Azure Service Bus) propagate trace context via headers
- [ ] Jaeger/Zipkin UI shows continuous trace — no "orphan" spans with missing parents

## Source

- `open-telemetry/opentelemetry-dotnet` — `Activity.Current` semantics: [github.com/open-telemetry/opentelemetry-dotnet](https://github.com/open-telemetry/opentelemetry-dotnet)
- W3C Trace Context spec: [w3c.github.io/trace-context](https://w3c.github.io/trace-context/)




