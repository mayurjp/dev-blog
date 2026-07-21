---
layout: post
title: "Azure: Why Are My Azure SQL Queries Slow After 1 PM Every Day?"
description: "A scenario-based debugging walkthrough: an API backed by Azure SQL that is fast in the morning but degrades sharply after 1 PM. The root cause is the DTU service tier's resource governor throttling the database under sustained load combined with an implicit table scan on a frequently queried indexed view. Trace the fix through Query Performance Insight, sys.dm_db_resource_stats, and index tuning."
date: 2026-08-24 09:00:00 +0530
categories: azure
order: 2
tags: [azure, debugging, sql, performance, dtu]
---

## The symptom

> "Our API is snappy before lunch (50-100ms p95) but starting around 1 PM the p95 latency climbs to 3-5 seconds. The slowdown is always at the same time of day. Restarting the database fixes it for about an hour."

The timing correlates with "after lunch" US time zone — suggesting higher traffic from afternoon users. But the dev team ruled out a traffic spike; the request volume is roughly the same all day.

## Reproduce

```csharp
// The slow endpoint
[HttpGet("dashboard")]
public async Task<IActionResult> GetDashboard(DateTime from, DateTime to)
{
    var data = await _db.DailySalesReport    // ← a view, not a table
        .Where(r => r.Date >= from && r.Date <= to)
        .ToListAsync();
    return Ok(data);
}
```

```bash
# Measure response time over the day
# This endpoint returns fast in the morning, slow in the afternoon
curl -w "@curl-format.txt" "https://myapi.azurewebsites.net/api/dashboard?from=2026-01-01&to=2026-06-30"
```

## The root cause chain

### 1. Check Azure SQL's Query Performance Insight

Open Azure Portal → Your SQL Database → Query Performance Insight.

Filter by the time window (2-3 PM). Look for:
- A query with high **duration** and high **CPU** consumption
- The query text matching the `DailySalesReport` view query

Click the query to see the execution plan. The plan shows an **Index Scan** on a large table, not an Index Seek.

### 2. The view definition

```sql
CREATE VIEW DailySalesReport AS
SELECT 
    o.OrderDate,
    c.CustomerName,
    SUM(oi.Quantity * oi.UnitPrice) AS TotalAmount,
    COUNT(DISTINCT o.OrderId) AS OrderCount
FROM Orders o
JOIN OrderItems oi ON o.OrderId = oi.OrderId
JOIN Customers c ON o.CustomerId = c.CustomerId
WHERE o.Status = 'Completed'
GROUP BY o.OrderDate, c.CustomerName;
```

The view joins three tables and aggregates. It is not indexed — every query against it performs a full scan of the underlying tables, materializing the entire view before applying the WHERE filter.

### 3. DTU throttling

Azure SQL Database in the **Basic** or **Standard** tier uses the DTU purchasing model. Your database has a fixed number of DTUs (e.g. S2 = 50 DTUs). DTU is a blended metric of CPU + IO + memory.

For most of the day, the database runs at 10-20% DTU utilization. But when enough concurrent requests hit the slow `DailySalesReport` view, the sustained CPU from the table scans pushes DTU utilization past 100%.

At that point, Azure SQL's **resource governor** kicks in and throttles the database — queuing queries, reducing parallelism, and slowing down all operations. This is the "slow after 1 PM" behavior: the database is **DTU-starved**.

### 4. Confirm with sys.dm_db_resource_stats

```sql
-- Run in the Azure SQL database context
SELECT 
    end_time,
    avg_cpu_percent,
    avg_data_io_percent,
    avg_log_write_percent,
    (avg_cpu_percent + avg_data_io_percent + avg_log_write_percent) / 3 AS avg_dtu_percent
FROM sys.dm_db_resource_stats
ORDER BY end_time DESC;
```

You will see `avg_dtu_percent` climb to 100% around 1 PM and stay there until traffic drops off. Before 1 PM, DTU stays under 50%.

## The fix

### Option A: Create an indexed view

```sql
CREATE UNIQUE CLUSTERED INDEX IX_DailySalesReport_Date ON DailySalesReport (OrderDate, CustomerName);
```

An indexed view materializes the aggregation result and persists it to disk, updated automatically when the underlying tables change. Queries against it use Index Seek instead of full table scans. This reduces the CPU cost per query by 10-100x.

### Option B: Add a covering index for the query pattern

```sql
CREATE NONCLUSTERED INDEX IX_Orders_Status_Date 
ON Orders (Status, OrderDate)
INCLUDE (CustomerId)
WHERE Status = 'Completed';

CREATE NONCLUSTERED INDEX IX_OrderItems_OrderId
ON OrderItems (OrderId)
INCLUDE (Quantity, UnitPrice);
```

### Option C: Scale up the DTU tier

If the data volume justifies it, scaling from S2 (50 DTU) to S3 (100 DTU) or S4 (200 DTU) buys more headroom. But this treats the symptom, not the cause — an indexed view would reduce DTU consumption for everyone.

## Deeper checks for production

1. **Enable Query Store** — `ALTER DATABASE ... SET QUERY_STORE = ON` captures historical query performance data at the plan level, making it easy to pinpoint when a query regressed.

2. **Set up DTU alerts** — Configure Azure Monitor alerts at 80% DTU utilization so the team is notified before throttling begins.

3. **Use read-only replicas for reporting** — In the Business Critical tier, use the `ApplicationIntent=ReadOnly` connection string to offload reporting queries to a readable secondary replica.

4. **Implement application-level query timeouts** — Setting `CommandTimeout = 30` in EF Core prevents a single slow query from holding a connection indefinitely, reducing connection pool pressure during DTU throttling.

## Prevention checklist

- [ ] Every query against a view has an execution plan validated for Index Seek operations
- [ ] DTU alerts are configured at 80% utilization for every Azure SQL Database
- [ ] Query Store is enabled with a 7-day data retention policy
- [ ] The slowest queries in Query Performance Insight are reviewed weekly
- [ ] Views used in reporting endpoints have clustered indexes (indexed views)

## Source

- Azure SQL DTU model: [learn.microsoft.com/en-us/azure/azure-sql/database/service-tiers-dtu](https://learn.microsoft.com/en-us/azure/azure-sql/database/service-tiers-dtu)
- `sys.dm_db_resource_stats`: [learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-resource-stats-azure-sql-database](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-resource-stats-azure-sql-database)
- Indexed views: [learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views](https://learn.microsoft.com/en-us/sql/relational-databases/views/create-indexed-views)
