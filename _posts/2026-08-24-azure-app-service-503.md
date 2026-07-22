---
layout: post
title: "Azure: Why Is My App Service Returning 503 Service Unavailable Every 10 Minutes?"
description: "A scenario-based debugging walkthrough: an ASP.NET Core app on Azure App Service that returns 503 every 10 minutes on the dot. The root cause is the default App Service auto-heal recycling combined with a process-wide singleton that cannot recover from an unrecoverable state. Trace the fix through App Service diagnostic logs, Kudu process dumps, and WinDBG analysis."
date: 2026-08-24 09:00:00 +0530
categories: azure
order: 90
tags: [azure, troubleshooting, debugging, app-service, performance, dotnet]
---

## The symptom

> "Our API on Azure App Service returns 503 Service Unavailable every 10 minutes, lasting for about 15-30 seconds. The health-check endpoint also returns 503 during these windows. It is reproducible in production but never in dev."

The 503 is consistent — every 10 minutes, like clockwork. The Azure App Service platform always returns 503 when the application pool recycles (cold start) or when the worker process fails to respond to its pings.

## Reproduce

You do not need to reproduce the exact environment. The pattern is visible in the App Service diagnostics:

```
Azure Portal → Your App Service → Diagnose and Solve Problems → Availability and Performance
```

Look for:
- **HTTP 5xx Errors** — spikes every 10 minutes
- **Application Pool** → **Recycle Events** — confirming a recycle every 600 seconds
- **App Restarts** — the count increments at the same cadence

## The root cause chain

### 1. The default idle timeout

Azure App Service on Basic and above tiers uses IIS (Windows) or a custom process manager (Linux) to host your app. By default, the application pool recycles every 29 hours for memory leak mitigation. But a 10-minute recycle is not the default — something else is triggering it.

Run this in Kudu (https://{app}.scm.azurewebsites.net):

```powershell
# Check application pool settings via Kudu PowerShell
Get-ItemProperty -Path "IIS:\AppPools\~1" -Name Recycling.periodicRestart.time
```

The output will often be blank or show the 29-hour default. So the recycle is not coming from the pool's periodic restart.

### 2. Auto-heal recycling

App Service has an **Auto-heal** feature that recycles the worker process when it detects a failure condition (memory threshold, request count, slow requests). Check the auto-heal configuration:

```xml
<!-- applicationHost.xdt -->
<add name="ASP.NET" autoStart="true" managedRuntimeVersion="v4.0">
  <recycling>
    <periodicRestart time="00:00:00" /> <!-- disabled? -->
  </recycling>
  <processModel identityType="ApplicationPoolIdentity" />
  <failureDefinitions>
    <add failureInterval="00:10:00" /> <!-- 10 minute window -->
  </failureDefinitions>
</add>
```

But auto-heal recycles based on failure conditions — not on a fixed schedule. The 10-minute cadence suggests something in the app is *causing the failure* and auto-heal is responding to it.

### 3. The real cause: HttpClient socket exhaustion with a Singleton

In the affected app, the code was:

```csharp
public class OrderService
{
    private static readonly HttpClient _httpClient = new HttpClient(); // Singleton

    public async Task<List<Order>> GetOrdersAsync()
    {
        var response = await _httpClient.GetAsync("https://orders-api.example.com/orders");
        // ...
    }
}
```

`HttpClient` is a Singleton. It is created once and reused for the lifetime of the process. By default, `HttpClient` creates one `System.Net.Http.SocketsHandler` per connection, backed by a **TCP socket**.

Every HTTP call to the downstream `orders-api` opens a **new HTTP connection** (unless `ServicePointManager.DefaultConnectionLimit` is increased) — but .NET's `HttpClient` in the default configuration does *not* reuse connections when the DNS resolution changes, and each connection holds a socket open in `TIME_WAIT` state after use.

With about 500 requests per minute to `orders-api`, and each request taking ~5 seconds, the app exhausts the ephemeral port range (~16,000 ports on Azure App Service Windows). Once ports are exhausted:

1. All new `HttpClient.GetAsync` calls throw `SocketException: Only one usage of each socket address is normally permitted`
2. The exception propagates to the health-check endpoint, which returns 500
3. Auto-heal detects the 500 spike and initiates a recycle to recover the process
4. The recycle kills all sockets, freeing the ports — fresh start
5. After 10 minutes, enough `TIME_WAIT` ports accumulate to exhaust the range again

### 4. Confirm with process dump

```bash
# Via Kudu Debug Console → CMD → Collect a process dump
# Or use Procdump from the Azure CLI
az webapp deploy --resource-group myapp --name myapp --src-path dump.zip
```

Open the dump in WinDBG or Visual Studio:

```windbg
!dumpheap -type HttpClient
!clrstack
```

Count the number of `Socket` objects. If you see thousands, you have socket exhaustion.

## The fix

```csharp
// Use IHttpClientFactory with typed client
builder.Services.AddHttpClient<IOrderService, OrderService>(client =>
{
    client.BaseAddress = new Uri("https://orders-api.example.com");
});

public class OrderService : IOrderService
{
    private readonly HttpClient _httpClient;
    public OrderService(HttpClient httpClient) => _httpClient = httpClient;

    public async Task<List<Order>> GetOrdersAsync()
    {
        var response = await _httpClient.GetAsync("/orders");
        // ...
    }
}
```

`IHttpClientFactory` pools `HttpMessageHandler` instances and rotates them on DNS changes, avoiding socket exhaustion entirely. It also sets the default `ServicePointManager.DefaultConnectionLimit` to `int.MaxValue`.

## Deeper checks for production

1. **Set `ServicePointManager.DefaultConnectionLimit`** — even without `IHttpClientFactory`, increasing the limit to 100+ reduces connection churn.

2. **Check `netstat` in Kudu** — `netstat -an | find "TIME_WAIT"` will show thousands of connections in TIME_WAIT state if socket exhaustion is the issue.

3. **Disable auto-heal for false positives** — if auto-heal is firing on the symptom (503 from socket exhaustion) rather than the cause, consider disabling auto-heal for the short term and fixing the socket issue first.

4. **Monitor `HttpClient` lifetime** — any `HttpClient` created with `new HttpClient()` in a transient service or static field should be replaced with `IHttpClientFactory`.

## Prevention checklist

- [ ] No `static HttpClient` fields — always use `IHttpClientFactory` or manually dispose short-lived `HttpClient` instances
- [ ] `ServicePointManager.DefaultConnectionLimit` is set to at least 100
- [ ] Auto-heal rules are configured only for the specific failure condition (e.g. high memory) not as a general recovery mechanism
- [ ] App Service Always On is enabled (`WEBSITE_SCM_ALWAYS_ON_ENABLED = 1`)
- [ ] Process dump confirms no socket leak

## Source

- Microsoft docs: `IHttpClientFactory` guidance: [learn.microsoft.com/en-us/dotnet/architecture/microservices/implement-resilient-applications/use-httpclientfactory-to-implement-resilient-http-requests](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/implement-resilient-applications/use-httpclientfactory-to-implement-resilient-http-requests)
- Azure App Service diagnostics: [learn.microsoft.com/en-us/azure/app-service/overview-diagnostics](https://learn.microsoft.com/en-us/azure/app-service/overview-diagnostics)




