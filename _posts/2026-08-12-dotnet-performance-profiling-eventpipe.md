---
layout: post
title: ".NET performance profiling: capturing traces, counters, and GC metrics with EventPipe and dotnet-trace"
description: "How to collect runtime telemetry in production using EventPipe-based tools — dotnet-trace, dotnet-counters, and dotnet-gc, plus Memory Profiler workflows for heap analysis."
date: 2026-08-12 09:00:00 +0530
categories: dotnet
order: 17
tags: [dotnet, performance, profiling, eventpipe, gc, diagnostics]
---

**TL;DR:** How do you find a CPU or memory regression in a production .NET service without attaching a debugger? Use EventPipe-based CLI tools (`dotnet-trace`, `dotnet-counters`, `dotnet-gc`) to collect runtime telemetry live, then analyze traces and heap dumps offline.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


**Real repo:** [dotnet/runtime](https://github.com/dotnet/runtime)

## 1. The Engineering Problem

Production performance work has two killers: you can't attach Visual Studio, and you can't reproduce the load locally. You need a way to capture what the runtime is *actually* doing — CPU samples, allocations, GC pauses, HTTP request rates — from the outside, with low overhead, and ship the data somewhere you can analyze later.

## 2. The Technical Solution

.NET exposes an in-process tracing pipeline called **EventPipe**. The `dotnet-diagnostic` CLI tools (`dotnet-trace`, `dotnet-counters`, `dotnet-gc`, `dotnet-dump`) talk to EventPipe over IPC, so you collect telemetry from a running process with no code changes and minimal startup impact. `dotnet-trace` emits `.nettrace` (nettrace = EventPipe + speedscope-compatible); `dotnet-counters` streams `System.Runtime` metrics live; `dotnet-gc` captures GC recalls/heap stats.

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant Tool as dotnet-trace / counters
    participant Pipe as EventPipe (in-proc)
    participant RT as .NET Runtime
    participant File as .nettrace / metrics

    Dev->>Tool: collect --process-id PID
    Tool->>Pipe: open IPC session
    Pipe->>RT: subscribe to providers (Microsoft-Windows-DotNETRuntime)
    RT-->>Pipe: events (CPU, GC, alloc)
    Pipe-->>Tool: buffered stream
    Tool->>File: write .nettrace
    Dev->>Tool: analyze / PerfView / Visual Studio
    Tool-->>Dev: flame graph + GC metrics

    classDef tool fill:#cfe8ff,stroke:#3a6ea5,color:#10243b;
    classDef rt fill:#d6f5d6,stroke:#2e7d32,color:#0b2710;
    classDev,Tool tool;
    class Pipe,RT,File rt;
```

Core truths:
- EventPipe is always on; the tools only *connect* to it, so enabling profiling needs no recompile and near-zero steady-state cost.
- `System.Runtime` is the canonical counter provider (GC heap size, gen0/1/2 collections, CPU %, working set, thread count).
- GC metrics come from the `Microsoft-Windows-DotNETRuntime` provider's `GarbageCollection` keywords — you read **% time in GC**, gen sizes, and pause times.

## 3. The clean example

Collect a trace for 30 seconds on a live PID:

```bash
dotnet-trace collect \
  --process-id 12345 \
  --providers Microsoft-Windows-DotNETRuntime \
  --duration 00:00:30 \
  --output prod_trace.nettrace
```

Watch GC/CPU counters live (great for spotting a leak forming):

```bash
dotnet-counters monitor \
  --process-id 12345 \
  --counters System.Runtime \
  --refresh-interval 2
```

Sample output you are reading:

```text
[System.Runtime]
    % Time in GC since last GC (%)      3.2
    Gen 0 GC Count (since start)       142
    Gen 2 GC Count (since start)         7
    GC Heap Size (MB)                  512.4
    CPU Usage (%)                       24.0
    Working Set (MB)                   890.1
    Thread Count                        28
```

Capture a memory dump for deep heap analysis (the "Memory Profiler" path):

```bash
dotnet-dump collect --process-id 12345 --output leak.dmp
dotnet-dump analyze leak.dmp
> dumpheap -stat        # top types by instance count + bytes
> gcroot 0000023...     # why is this object still alive?
```

## 4. Production reality

From `dotnet/runtime`, `IDistributedCache` is unrelated here, but the runtime's diagnostics model is the backbone. The relevant, well-established facts (stable across .NET 6–9):

```csharp
// The runtime emits these counters via the System.Runtime EventSource.
// You consume them through dotnet-counters, NOT by writing this code:
//   [EventSource(Name = "System.Runtime")]
//   public sealed class RuntimeEventSource : EventSource
//   {
//       // Gen0/Gen1/Gen2 collection counts
//       // GC Heap Size
//       // % Time in GC
//       // CPU Usage, Working Set, Thread Count
//   }

// ASP.NET Core adds its own request counters (Kestrel + SignalR):
//   [EventSource(Name = "Microsoft.AspNetCore.Hosting")]
//   public sealed class HostingEventSource : EventSource
//   {
//       // requests-per-second, failed requests, request duration
//   }
```

What this teaches:
- **GarbageCollection metrics are first-class.** When `% Time in GC` climbs above ~5–10%, you have a allocation-pressure problem, not a CPU problem.
- **Gen2 counts matter.** A rising Gen2 count with a stable request rate signals objects promoted to old gen (cache/static leaks).
- `dotnet-trace` + PerfView/Visual Studio gives a CPU flame graph; `dotnet-dump` gives the heap "who is holding memory" answer. Use both.

**Stale facts:** `Startup.cs` is no longer the default entry point — the minimal hosting model is. A third-party DI container is not needed for basic DI — `Microsoft.Extensions.DependencyInjection` is built in. ASP.NET Core defaults to **Server GC**, not Workstation GC (so expect parallel GC threads by default). `async void` is a footgun: exceptions escape the async state machine and crash the process.

## 5. Review checklist
- Is a baseline `.nettrace` + `dotnet-counters` snapshot captured *before* declaring "it's slow"?
- Are you watching `% Time in GC` and Gen2 collection counts, not just CPU%?
- Did you capture a `dotnet-dump` when heap size trended up, and run `dumpheap -stat`?
- Are traces collected with a bounded `--duration` so EventPipe buffers don't overshoot memory?

## 6. FAQ
- **Do I need to restart the app to profile?** No. EventPipe tools attach to a running PID; no recompile or restart required.
- **What is `.nettrace`?** The EventPipe trace format, openable in PerfView, Visual Studio, and speedscope.
- **Which provider gives GC metrics?** `Microsoft-Windows-DotNETRuntime` (with GC keywords); `dotnet-counters` surfaces the cooked `System.Runtime` versions live.
- **Is overhead safe for production?** Yes — EventPipe is designed for low-overhead always-on collection; keep trace durations bounded.
- **Trace or dump for a memory leak?** Start with `dotnet-counters` to confirm heap growth, then `dotnet-dump` + `dumpheap -stat`/`gcroot` to find the retained type.

## Source
- **Concept:** EventPipe-based performance profiling (dotnet-trace, dotnet-counters, GC metrics, Memory Profiler/dump)
- **Domain:** dotnet
- **Repo:** dotnet/runtime → [src/libraries/System.Runtime](https://github.com/dotnet/runtime/tree/main/src/libraries/System.Runtime) — `System.Runtime` EventSource counters (GC Heap Size, % Time in GC, CPU Usage)
- **Repo:** dotnet/runtime → [src/Diagnostics](https://github.com/dotnet/runtime/tree/main/src/Diagnostics) — `dotnet-trace` / `dotnet-counters` / `dotnet-gc` / `dotnet-dump` CLI tooling built on EventPipe




