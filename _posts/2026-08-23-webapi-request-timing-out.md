---
layout: post
title: "ASP.NET WebAPI: Why Is This Request Timing Out After 30 Seconds?"
description: "A scenario-based debugging walkthrough: a WebAPI endpoint that reliably hangs for 30 seconds then returns 502 from the load balancer. The root cause is a synchronous blocking call inside an async endpoint, which exhausts the ASP.NET thread pool. Trace the fix through Kestrel connection logs, thread-pool counters, and adding ConfigureAwait."
date: 2026-08-23 09:00:00 +0530
categories: aspnet-webapi
order: 1
tags: [aspnet-webapi, debugging, async, threading, performance]
---

## The symptom

> "Our `/api/orders/recent` endpoint returns 502 Bad Gateway after exactly 30 seconds when the site has more than about 20 concurrent users. Works fine in dev with 1-2 users."

The 502 comes from the load balancer (Azure App Service's built-in load balancer or AWS ALB), which has a 30-second idle timeout. The endpoint isn't returning *anything* inside that window — so the proxy gives up.

## Reproduce locally

```csharp
// GET /api/orders/recent?count=50
[HttpGet("recent")]
public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 50)
{
    // Simulates the slow operation users report
    var orders = await _db.Orders
        .OrderByDescending(o => o.CreatedAt)
        .Take(count)
        .ToListAsync();

    return Ok(orders);
}
```

Start the app, hit the endpoint with 25 concurrent requests:

```bash
# using hey (formerly rakyll/hey)
hey -n 100 -c 25 http://localhost:5000/api/orders/recent
```

Watch: a handful complete quickly, then everything stalls until the 30-second Kestrel timeout kills the connections.

## The root cause chain

### 1. `ToListAsync` blocks the thread

Look at the action method more carefully — the real code wasn't using `ToListAsync`:

```csharp
[HttpGet("recent")]
public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 50)
{
    var orders = _db.Orders
        .OrderByDescending(o => o.CreatedAt)
        .Take(count)
        .ToList();  // SYNC! Not ToListAsync

    return Ok(orders);
}
```

The method is `async Task<IActionResult>` but calls the synchronous `.ToList()` instead of `.ToListAsync()`. The method signature is misleading: the method *appears* async, but the body has a blocking call.

### 2. Thread pool starvation

ASP.NET Core serves requests using the .NET thread pool. When you call `.ToList()`, the Entity Framework provider sends a SQL query to SQL Server and **blocks the current thread** waiting for the response. That thread cannot serve any other request while it waits.

With 25 concurrent users and only 8-16 thread pool threads available per core, every thread gets blocked on a database query. New requests are queued. Queries take longer because SQL Server is under load from 25 simultaneous query executions instead of a few interleaved async ones.

The thread pool attempts to inject new threads at a rate of about 1-2 per second (the thread injection algorithm adds one thread every 500ms once threads are saturated). By the time new threads arrive to process the waiting requests, the 30-second load balancer timeout has already fired.

### 3. Confirm with counters

```bash
# Watch thread pool state
dotnet counters monitor --process-id <pid>
```

Look for:
- `threadpool-thread-count` — approaches the CPU count + injection rate, never serving
- `threadpool-queue-length` — climbs into the hundreds
- `elapsed-time` on each request — linearly increasing

## The fix

Change the synchronous call to its async equivalent:

```csharp
[HttpGet("recent")]
public async Task<IActionResult> GetRecentOrders([FromQuery] int count = 50)
{
    var orders = await _db.Orders
        .OrderByDescending(o => o.CreatedAt)
        .Take(count)
        .ToListAsync();  // ASYNC — does not block the thread

    return Ok(orders);
}
```

The thread returns to the pool while the database query is in flight. With 25 concurrent users, the same 8-16 threads can interleave all 25 queries because they yield at the `await` point instead of blocking.

## Deeper checks for production

1. **Check every `Task`-returning method for sync calls** — the `async` keyword on the method signature is irrelevant; the calling pattern inside the method body is what matters. A method marked `async Task` that calls `ToList()`, `Read()`, `Send()` (sync), or `.Result` / `.Wait()` will still block.

2. **ConfigureAwait(false) in library code** — if the EF query is inside a library method, ensure you call `.ConfigureAwait(false)` to avoid re-entering the request's `SynchronizationContext` (though ASP.NET Core does not have one by default, it's still a good practice for library code).

3. **Set the minimum thread pool threads** — as a safety net, increase `ThreadPool.SetMinThreads(workerThreads, completionPortThreads)` to a reasonable baseline (e.g. 100 for a 4-core box) so the pool doesn't need to ramp up under load.

4. **Enable Kestrel connection logging** — add `app.UseHttpLogging()` in `Program.cs` to see exactly when connections arrive and when they close.

## Prevention checklist

- [ ] Every EF call in an async method uses the `Async` suffix method (`ToListAsync`, `FirstOrDefaultAsync`, `SaveChangesAsync`)
- [ ] Every `HttpClient` call uses `SendAsync`, not `Send` or `Post`
- [ ] Every I/O operation (file, network, database) uses the async API
- [ ] Thread pool min threads are set at application startup to avoid ramp-up delay
- [ ] Load test (`hey -n 1000 -c 50 http://localhost:5000/api/orders/recent`) passes without 502s

## Source

- `dotnet/runtime` — ThreadPool source: [github.com/dotnet/runtime](https://github.com/dotnet/runtime)
- `dotnet/aspnetcore` — Kestrel timeout configuration: [github.com/dotnet/aspnetcore](https://github.com/dotnet/aspnetcore)
