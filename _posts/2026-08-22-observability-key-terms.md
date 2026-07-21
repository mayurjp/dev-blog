---
layout: post
title: "Observability Key Terms: Metrics, Logs, Traces and the OpenTelemetry Vocabulary Behind Every Post"
description: "A standalone glossary of observability terms used across this blog's monitoring posts — metrics, logs, traces, OpenTelemetry, Prometheus, spans, exemplars, RED/USE, SLO/SLI, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: observability
order: 99
tags: [observability, glossary, monitoring, opentelemetry]
---

**TL;DR:** This is the reference page for the observability vocabulary used throughout this blog's monitoring posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

> **In plain English (30 sec):** Logs with traceId that follows request across services.

The posts in this domain assume you already know what a span or an OpenTelemetry exporter is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Signals

### Metrics
A metric is a numeric measurement sampled over time and stored as a **time series** — a sequence of `(timestamp, value)` points keyed by a name plus a set of label values. Unlike logs, metrics are aggregated by design, so they stay cheap at high volume and answer "how many / how much" questions, not "what exactly happened."

### Logs
A log is an immutable, timestamped, human- or machine-readable record of a single event emitted by a process. **Structured logging** emits each event as a typed record (JSON with consistent fields) rather than a free-text line, so a backend like Loki or Elasticsearch can index and filter on those fields instead of doing full-text regex.

### Traces
A trace is the end-to-end record of one request as it flows through many services, composed of the spans each service contributes. Its job is to answer the question a metric can't: "which service and which operation made this slow," by reconstructing the request's path and per-hop timing.

### Spans
A span is one unit of work inside a trace — typically a single operation like an HTTP handler or a database query — carrying a start/end timestamp, a name, attributes, and a status. A trace is the tree of spans linked by parent/child relationships, so a single slow span is visible inside the larger request.

### Span context
Span context is the identifying baggage — trace ID, span ID, trace flags, and the parent span ID — that travels with a request so each hop can attach its own span to the right trace. It is what lets a span created in `service-a` become the parent of a span created in `service-b`, even though they run in different processes.

### Tracing context propagation
Propagation is the mechanism that moves span context across process and protocol boundaries, usually by injecting it into request headers. The W3C `traceparent` header is the standard wire format: without it, a request crossing an HTTP or messaging boundary starts a *new* trace and the chain breaks.

### W3C traceparent
The `traceparent` HTTP header is the standard carrier for trace context: `version-traceid-parentid-traceflags`, a 2-byte version, 16-byte trace ID, 8-byte parent span ID, and 1-byte flags (e.g. `sampled`). Because it's a spec rather than a vendor format, any OpenTelemetry-instrumented service can hand context to any other without a proprietary header.

## OpenTelemetry

### OpenTelemetry (OTel)
OpenTelemetry is a vendor-neutral set of APIs, SDKs, and tools for generating and shipping telemetry, so your code doesn't hard-wire a single backend like Prometheus or Jaeger. The `open-telemetry/opentelemetry-js` SDK produces metrics, logs, and traces through a common pipeline; the `open-telemetry/opentelemetry-collector` receives and routes them.

### OTLP
The OpenTelemetry Protocol (OTLP) is the wire format OTel uses to send telemetry between SDKs, the Collector, and backends. It's a binary gRPC (and HTTP/protobuf) protocol carrying metrics, logs, and traces in one consistent framing, which is why the Collector and most modern backends speak it natively.

### Collector
The OpenTelemetry Collector (`open-telemetry/opentelemetry-collector`) is a standalone process that receives telemetry via OTLP, runs it through pipelines of receivers, processors, and exporters, then ships it onward. It decouples your application from your backends: you emit OTLP once and the Collector can fan out to Prometheus, Jaeger, Tempo, and more.

### Exporter
An exporter is the Collector (or SDK) component that sends telemetry to a specific destination in that destination's format — a Prometheus exporter exposes a scrape endpoint, a Jaeger exporter sends spans to the Jaeger gRPC/HTTP endpoint. Swapping backends means swapping exporters, not rewriting instrumentation.

### Instrumentation
Instrumentation is the code that captures telemetry from your app — creating a tracer, starting spans, recording metric values. **Manual instrumentation** calls the OTel API directly at the points you care about; **auto-instrumentation** intercepts common libraries (HTTP clients, database drivers) so spans and metrics appear without you editing every call site.

### Auto-instrumentation
Auto-instrumentation uses runtime hooks or library wrappers to generate telemetry for well-known frameworks (Express routes, Redis calls, PostgreSQL queries) with no code changes. On Node.js this is the `@opentelemetry/auto-instrumentations-node` bundle; it's the fastest way to get traces, though you still add manual spans for your own business logic.

## Collection & storage

### Prometheus
Prometheus is a pull-based metrics TSDB: it **scrapes** HTTP `/metrics` endpoints at a fixed interval and stores each sample as part of a time series. Its query language (PromQL) evaluates those series over time, which is what makes "p99 latency over the last hour" a one-line expression rather than a log scan.

### Scrape
A scrape is Prometheus walking its configured list of targets and issuing an HTTP GET to each one's `/metrics` endpoint on the scrape interval. Each response is a snapshot of that target's current counters, gauges, and histograms; Prometheus timestamps them server-side, so the client's clock never has to be correct.

### Time series
A time series is the fundamental Prometheus storage unit: a metric name plus a unique combination of label values, holding an ordered list of samples. Two requests with different `status="200"` vs `status="500"` labels are *different* series — which is exactly where the cardinality trap lives (see below).

### Labels / tags
Labels (Prometheus) or tags (OTel/tracing) are key-value dimensions attached to a metric or span that let you slice and group — `method`, `route`, `status_code`, `service.name`. They're powerful because `rate(http_requests_total[5m]) by (status_code)` breaks a total into per-status lines, but every unique combination multiplies the series count.

### Exemplars
An exemplar is a pointer stored alongside an aggregated metric bucket that links it to a specific trace — e.g. the histogram bucket for "request > 1s" carries the trace ID of one actual slow request that fell in it. That's how you jump from "p99 is high" straight to "here is a real trace that contributed to it" in Grafana.

### Sampling
Sampling is dropping a fraction of telemetry to control cost and volume — head sampling decides at trace start whether to keep it, tail sampling decides after the trace completes based on duration or error status. Without it a high-traffic service can emit more span bytes than response bytes; with too much, the one failing trace gets dropped.

### Cardinality
Cardinality is the number of distinct series a metric produces, driven by the unique combinations of its label values. A label like `user_id` (millions of values) turns one metric into millions of series and can OOM a Prometheus; bounded labels like `status_code` are safe. It's the single most common way monitoring silently falls over.

## SLOs & alerting

### RED method
The RED method is a metric template for request-driven services: **R**ate (requests/sec), **E**rrors (failed requests/sec), **D**uration (latency distribution). It deliberately ignores resource internals and asks only the three questions a user-facing service must answer.

### USE method
The USE method is the resource-counterpart template: **U**tilization, **S**aturation, **E**rrors for every resource (CPU, memory, disk, network). Where RED asks "is the service healthy," USE asks "is the box it runs on overloaded" — the two together cover service and infrastructure.

### SLO
A Service Level Objective (SLO) is a target reliability number, e.g. "99.9% of requests succeed over 30 days." It's the line that separates "working as intended" from "incident," and it's deliberately looser than 100% because chasing perfection is more expensive than a little downtime.

### SLI
A Service Level Indicator (SLI) is the *measured* signal that feeds an SLO — the actual ratio of good requests to total requests, or the fraction of requests under 300 ms. The SLO is the goal; the SLI is the instrument reading you compare against it.

### Error budget
An error budget is the inverse of the SLO expressed as allowable failure: at 99.9% SLO you're allowed 0.1% bad over the window. Burn it within a day and you've used up the quarter's tolerance — which is what triggers a freeze on risky deploys rather than a page at 2 a.m. for a non-event.

### Alerting
Alerting is the rule that fires a notification when an SLI breaches its SLO or a symptom crosses a threshold (e.g. `rate(errors) / rate(total) > 0.01` for 5 minutes). Good alerting pages on *symptoms users feel* (high latency, error rate) not *causes* (a single pod restart), so it's actionable instead of noisy.

## Visualization & backends

### Dashboards
A dashboard is a saved arrangement of metric/trace/log panels that renders a system's health at a glance — latency heatmaps, error-rate counters, trace-waterfall links. The point is to make the RED/USE signals visible per service so a human can spot the outlier before an alert does.

### Grafana
Grafana is the visualization layer that queries backends (Prometheus for metrics, Tempo/Jaeger for traces, Loki for logs) and draws them as dashboards. Because it speaks all three, it's the usual place where an exemplar links a Prometheus latency panel to a Jaeger trace in one click.

### Jaeger / Tempo
Jaeger and Grafana Tempo are trace backends: they store spans and let you search and replay a trace's waterfall to see each service's duration. Jaeger (from `jaegertracing/jaeger`) predates OTel and has its own agent/collector; Tempo is a cheaper, OTLP-native store that keeps traces indexed by ID and pairs with Grafana for search.

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.




