---
layout: page
title: "Observability — Q&A Bank"
permalink: /qa/observability/
---

Bite-sized questions and answers from Observability blog posts. Read 5-10 per sitting. Each answer is 2-4 sentences max and links back to the full post for deeper understanding.

## Topic: The three pillars of observability (Order 1)

### Q: What are the three pillars of observability and what kind of question does each one answer?
A: Metrics answer "is the system healthy in aggregate?" using cheap, pre-aggregated numeric time series. Logs answer "what exactly happened during this one specific request?" using rich per-event detail. Traces answer "how did one request's total time get spent across every service?" using causally linked records that follow a single request across process boundaries. No single data stream answers all three well.
→ Post: `_posts/2026-05-06-three-pillars-observability-metrics-logs-traces.md`

### Q: Why does OpenTelemetry require three separate configuration calls instead of one to enable "observability"?
A: Because logs, metrics, and traces are structurally different instrumentation APIs — `Logging.AddOpenTelemetry`, `WithMetrics`, and `WithTracing` — that use different .NET primitives (`ILogger`, `Meter`, `Activity`). They converge only at the export step, all sending data over the same OTLP endpoint, but everything before that point is genuinely separate. Unifying the transport doesn't unify the instrumentation.
→ Post: `_posts/2026-05-06-three-pillars-observability-metrics-logs-traces.md`

### Q: Why would using a high-cardinality field (like user ID) in both a metric and a trace cause different problems in each?
A: In metrics, a high-cardinality field creates millions of distinct time series, each consuming memory and storage in the backend — potentially exhausting resources. In traces, high-cardinality detail is exactly what you need to reconstruct one specific request's story. Treating both as the same stream loses the distinction: metrics blow up cost, while traces need the detail.
→ Post: `_posts/2026-05-06-three-pillars-observability-metrics-logs-traces.md`

### Q: In eShop's OpenTelemetry config, why does `WithMetrics` register `AddRuntimeInstrumentation()` while `WithTracing` registers `AddGrpcClientInstrumentation()`?
A: Metrics needs aggregate, system-level numbers like GC pressure and thread pool stats (`RuntimeInstrumentation`), which traces never touches. Traces needs per-event causal detail about which gRPC call was made and when (`GrpcClientInstrumentation`), which metrics has no use for. The two lists instrument genuinely different concerns even though both cover overlapping application layers.
→ Post: `_posts/2026-05-06-three-pillars-observability-metrics-logs-traces.md`

### Q: What happens if you only configure the OTLP exporter for metrics but forget to wire it for logs?
A: The metrics pipeline exports to your collector successfully, but logs continue going through whatever default logging sink is configured (e.g., console). OpenTelemetry's three pillars are independent pipelines — configuring an exporter for one has no effect on the others. The eShop codebase calls `AddOtlpExporter()` three separate times, once per pillar, to prove this.
→ Post: `_posts/2026-05-06-three-pillars-observability-metrics-logs-traces.md`

### Q: Why does eShop's tracing config use `AlwaysOnSampler` only in development, and why doesn't the same concept apply to metrics?
A: Sampling decides which *requests* get a full causal record kept — meaningful only for traces, which are per-request chains that are expensive to keep for every request. In dev, keeping all traces helps debugging. Metrics are pre-aggregated numeric time series, so sampling in the statistical sense is meaningless — you either record the counter increment or you don't. Logs are handled differently too, typically via log level filtering, not statistical sampling.
→ Post: `_posts/2026-05-06-three-pillars-observability-metrics-logs-traces.md`

## Topic: Structured logging (Order 2)

### Q: What's the difference between `logger.LogInformation($"User {userId}")` and `logger.LogInformation("User {UserId}", userId)`?
A: The string-interpolated version collapses the template and values into one opaque message before the logging API sees it, producing a single `Message` field with no sub-fields. The template-based version lets `LogValuesFormatter` parse `{UserId}` as a named placeholder, producing separate, individually queryable `KeyValuePair` entries like `(UserId, 42)` alongside the original template as `{OriginalFormat}`.
→ Post: `_posts/2026-05-08-structured-logging-template-placeholder-extraction.md`

### Q: Why is `{OriginalFormat}` appended as an extra entry beyond the named placeholders?
A: It lets a log aggregation backend group every instance of the *same log statement* together across the application's entire history, regardless of which specific values triggered each occurrence. "How many times did this specific log line fire?" is a different question from "how many logins came from this IP?" — and `{OriginalFormat}` is what makes the first question answerable. A string-interpolated message has no equivalent.
→ Post: `_posts/2026-05-08-structured-logging-template-placeholder-extraction.md`

### Q: How does `LogValuesFormatter` extract field names — from the template string or from the rendered output?
A: From the template string itself, at construction time. The constructor scans for `{PlaceholderName}` patterns and extracts just the name into `_valueNames`. The actual argument values passed at call time don't determine field names — `"User {UserId}"` always produces a field named `UserId` regardless of what value is logged. The rendered output is only used for the human-readable message.
→ Post: `_posts/2026-05-08-structured-logging-template-placeholder-extraction.md`

### Q: Why can't you just wrap a string-interpolated log message in JSON to make it "structured"?
A: JSON wrapping produces one opaque `message` field containing the fully rendered string — no individually queryable sub-fields. True structured logging requires the logging call itself to preserve placeholder names as separate values, which only the template-based API does. String interpolation destroys that information before the logging framework ever sees it, so no amount of post-hoc serialization recovers it.
→ Post: `_posts/2026-05-08-structured-logging-template-placeholder-extraction.md`

### Q: What happens to format specifiers like `:C` in a placeholder like `{Price:C}` during structured logging?
A: The `:C` is stripped from the extracted field name (the field is named `Price`, not `Price:C`) but preserved in the rendering template for the human-readable message. Display formatting and structured field identity are deliberately kept as two separate concerns, resolved from the same single placeholder.
→ Post: `_posts/2026-05-08-structured-logging-template-placeholder-extraction.md`

### Q: What's the common mistake when teams say they've adopted "structured logging"?
A: Confusing it with simply formatting logs as JSON. Wrapping an interpolated string in JSON still produces one opaque `message` field with no individually queryable sub-fields. Genuine structure originates from using template-based logging calls where placeholder names survive as separate `KeyValuePair` entries — a mechanism-level distinction, not a serialization format choice.
→ Post: `_posts/2026-05-08-structured-logging-template-placeholder-extraction.md`

## Topic: OpenTelemetry instrumentation (Order 3)

### Q: How can a library add tracing instrumentation without knowing whether the application has configured a tracing backend?
A: OpenTelemetry splits into a vendor-neutral API package (what libraries depend on) and a separate SDK/exporter setup (only the app entry point wires up). `TracerProvider.Default` is a real, always-available no-op instance — library code calling `tracerProvider.GetTracer(...).StartRootSpan(...)` works whether or not any SDK is configured, producing no observable effect in the unconfigured case.
→ Post: `_posts/2026-05-10-opentelemetry-api-sdk-exporter-separation.md`

### Q: What is `TracerProvider.Default` and why is it a static singleton rather than null?
A: It's a real, fully functional no-op instance available with zero configuration. Making it a guaranteed non-null singleton means library code never needs null-checks or try/catch guards before using it. "No SDK configured" is an ordinary, expected, cheap state — not an error condition — and `Default` is what makes that true.
→ Post: `_posts/2026-05-10-opentelemetry-api-sdk-exporter-separation.md`

### Q: Why is `Tracer.ActivitySource` typed as nullable (`ActivitySource?`)?
A: Because when no SDK is configured, there's genuinely no `ActivitySource` backing the tracer — the type system directly encodes the API/SDK separation at the type level. This isn't defensive null-handling; it's the design acknowledging that the real backing object might not exist, which is a completely valid, expected state.
→ Post: `_posts/2026-05-10-opentelemetry-api-sdk-exporter-separation.md`

### Q: What is `TelemetrySpan.NoopInstance` and when is it returned?
A: It's a named, reusable singleton returned when `Activity.Current` is null — meaning no span is currently active. Rather than constructing a new dummy object per call or throwing an exception, the API returns one designated "nothing is happening" value that behaves predictably and cheaply, keeping the no-configuration path fast enough that library authors don't need to weigh whether instrumentation is "worth the overhead."
→ Post: `_posts/2026-05-10-opentelemetry-api-sdk-exporter-separation.md`

### Q: What problem does the API/SDK separation solve that direct vendor integration doesn't?
A: With direct integration, a library would need "this library supports Datadog tracing" as a distinct feature from "this library supports Jaeger tracing." OpenTelemetry's API layer makes that obsolete — instrumented code never references a specific backend. Which backend receives telemetry is decided once at the application entry point, with zero changes to any library regardless of which backend is chosen or switched to later.
→ Post: `_posts/2026-05-10-opentelemetry-api-sdk-exporter-separation.md`

### Q: If a library uses OpenTelemetry's API but the application never wires up an SDK, what overhead does the library incur?
A: Minimal — `TracerProvider.Default` returns a no-op tracer, spans become lightweight no-op objects (via `TelemetrySpan.NoopInstance` when there's no current activity), and nothing is exported. The overhead is the API call itself and a small object allocation, not any I/O or processing. This is by design: unconfigured instrumentation is an expected, cheap path, not a degraded one.
→ Post: `_posts/2026-05-10-opentelemetry-api-sdk-exporter-separation.md`

## Topic: Trace context propagation (Order 4)

### Q: What is the W3C `traceparent` header format?
A: Four dash-separated fields: 2-character version, 32-character trace-id, 16-character parent-id, and 2-character trace-flags, all lowercase hex. Example: `00-0af7651916cd43dd8448eb211c80319c-b9c7c989f97918e1-01`. The wire format itself is the standard — any W3C-compliant implementation in any language from any vendor can parse it.
→ Post: `_posts/2026-05-12-trace-context-propagation-w3c-traceparent-header.md`

### Q: Why is version `ff` explicitly forbidden in the traceparent header?
A: The W3C spec reserves `ff` to always mean "invalid," permanently, regardless of future protocol evolution. It's not just "any invalid-looking version fails" — it's a dedicated, permanent reserved value baked into the format itself that no future version could ever repurpose. The .NET runtime checks for it as its own explicit case.
→ Post: `_posts/2026-05-12-trace-context-propagation-w3c-traceparent-header.md`

### Q: Why are all-zeros trace-id and parent-id rejected?
A: An all-zero ID is structurally valid hex but semantically meaningless — nothing should ever generate an ID that's literally all zeros through normal random generation. Encountering one indicates a malformed or corrupted header, not a legitimately rare value, so it's rejected as invalid.
→ Post: `_posts/2026-05-12-trace-context-propagation-w3c-traceparent-header.md`

### Q: How does the traceparent parser handle a future version of the W3C spec?
A: If a header uses a version higher than `00`, the parser still accepts it as long as the first 55 characters (the core fields it understands) are well-formed, and any extra content after position 55 starts with a dash. Anything beyond the known fields is simply ignored — the service doesn't need to be upgraded in lockstep with every spec revision.
→ Post: `_posts/2026-05-12-trace-context-propagation-w3c-traceparent-header.md`

### Q: Before the W3C standard existed, what happened when two services used different tracing vendors?
A: Linking spans across the network boundary silently failed — not with an error, but by producing disconnected, unrelated traces on each side. The agreement on trace identity had to be custom (vendor-specific header format), so two different vendors simply couldn't link their spans. The W3C standard's value is that neither side needs to agree on anything — the wire format itself is the agreement.
→ Post: `_posts/2026-05-12-trace-context-propagation-w3c-traceparent-header.md`

### Q: What's the gotcha with `IsInvalidTraceParent` returning `traceId = null`?
A: When validation fails, `ExtractTraceIdAndState` sets `traceId` to null and returns, meaning the extracted trace context is silently discarded. An invalid incoming header doesn't throw or log an error — it just means the downstream service starts a root span instead of a child span, breaking trace continuity without any visible warning.
→ Post: `_posts/2026-05-12-trace-context-propagation-w3c-traceparent-header.md`

## Topic: Metrics cardinality (Order 5)

### Q: What is cardinality explosion in metrics?
A: A metric like "HTTP requests tagged by endpoint and status code" becomes millions of time series when a tag with unbounded distinct values (user ID, UUID, full URL with query parameters) sneaks in. The backend must track a separate time series for every unique tag combination, which can exhaust memory and degrade the entire pipeline — not just the one offending metric.
→ Post: `_posts/2026-05-14-metrics-cardinality-explosion-overflow-bucket.md`

### Q: How does OpenTelemetry's SDK protect against cardinality explosion at runtime?
A: `AggregatorStore` reserves a fixed number of metric point slots (the cardinality limit + 2 for zero-tag and overflow). Once the limit is hit, any new tag combination is redirected into one shared overflow slot tagged `otel.metric.overflow=true`, while a `DroppedMeasurements` counter increments on every overflowed measurement. Memory stays bounded; the tradeoff is lossy aggregation for excess combinations.
→ Post: `_posts/2026-05-14-metrics-cardinality-explosion-overflow-bucket.md`

### Q: Why does `NumberOfMetricPoints = cardinalityLimit + 2` instead of just `cardinalityLimit`?
A: Two slots are reserved in addition to the user-configured limit: index 0 for measurements with zero tags, and index 1 for the overflow bucket. Previously these were included within the limit, causing ambiguity; now they're explicitly carved out so the cardinality limit accurately reflects how many distinct tag combinations the user is allowed.
→ Post: `_posts/2026-05-14-metrics-cardinality-explosion-overflow-bucket.md`

### Q: Why is the overflow tag `otel.metric.overflow=true` initialized with a double-checked lock?
A: The first measurement to trigger overflow could arrive from any thread, and the initialization must happen exactly once regardless of how many concurrent measurements race to be the trigger. The double-checked lock (check, lock, check again) ensures thread-safe one-time initialization without holding the lock on every measurement.
→ Post: `_posts/2026-05-14-metrics-cardinality-explosion-overflow-bucket.md`

### Q: Why does `Interlocked.Increment(ref DroppedMeasurements)` run on *every* overflowed measurement, not just the first?
A: Because a binary "cardinality limit exceeded" flag doesn't tell you magnitude — is this one measurement or thousands? The running count gives operators a concrete sense of how much data is being lossily merged, letting them gauge severity and prioritize fixes appropriately.
→ Post: `_posts/2026-05-14-metrics-cardinality-explosion-overflow-bucket.md`

### Q: What happens to a metric with a user-ID tag in production when the cardinality limit is exceeded?
A: The first N distinct user IDs each get their own metric point slot. Once that limit is hit, every subsequent new user ID gets merged into one shared overflow bucket tagged `otel.metric.overflow=true`. You lose the ability to distinguish between those excess user IDs individually, but you gain a visible, alertable `DroppedMeasurements` counter signaling the problem.
→ Post: `_posts/2026-05-14-metrics-cardinality-explosion-overflow-bucket.md`

### Q: What's the common mistake when teams are told to "keep labels low-cardinality"?
A: Treating it as abstract guidance with no concrete consequence. The real SDK enforces a runtime limit — exceeding it doesn't crash or corrupt data, it triggers bounded degradation with a visible counter. Teams that don't know about `DroppedMeasurements` and `otel.metric.overflow` miss the alertable signal that their metric has a cardinality problem.
→ Post: `_posts/2026-05-14-metrics-cardinality-explosion-overflow-bucket.md`

## Topic: Log aggregation architecture (Order 6)

### Q: Why doesn't Loki index the words inside log lines?
A: Building a full-text index over every word across terabytes of daily logs would cost more than the raw logs themselves, paid continuously on every line written. Most real log queries don't need "search anywhere" — they need "this service, this pod, this time range, and the line mentions X." Loki indexes only labels (service, pod, environment) and treats content matching as a query-time scan over already-narrowed chunks.
→ Post: `_posts/2026-05-16-log-aggregation-loki-label-indexing-vs-full-text.md`

### Q: How does Loki's two-phase query execution work?
A: First, the label selector (`{app='checkout'}`) does a small, indexed lookup to identify which streams and chunks to examine. Then, the content filter (`|= "error"`) runs a literal byte-by-byte scan against decompressed lines only within those narrowed chunks. Chunks from other streams are never scanned — content search cost scales with how much data the label filter left, not with total log volume.
→ Post: `_posts/2026-05-16-log-aggregation-loki-label-indexing-vs-full-text.md`

### Q: What tradeoff does Loki make compared to Elasticsearch for log search?
A: Loki trades instant full-text search for a dramatically smaller, cheaper index. Elasticsearch indexes every word; Loki indexes only label combinations. "Find every log line anywhere containing a word" isn't instant in Loki the way it is in Elasticsearch, but Loki's label index stays small and cheap regardless of log volume — and most production queries already narrow by service/pod/time before needing content search.
→ Post: `_posts/2026-05-16-log-aggregation-loki-label-indexing-vs-full-text.md`

### Q: Does Loki have a faster query path for simple substring matches vs. regex?
A: No — `Filter(line []byte)` operates on raw bytes at query time for both `|=` (substring) and `|~` (regex). There's no separate fast path; both are variations of scanning decompressed bytes, because neither benefits from a pre-built content index in this architecture.
→ Post: `_posts/2026-05-16-log-aggregation-loki-label-indexing-vs-full-text.md`

### Q: What's the gotcha with Loki's "like Prometheus, but for logs" approach?
A: It works brilliantly for queries that start with known labels (which service? which pod?) — but if you genuinely need to search for a term across all logs regardless of origin without any label narrowing first, Loki will scan everything, which can be slow and expensive. The architecture assumes most queries already know the scope before searching content.
→ Post: `_posts/2026-05-16-log-aggregation-loki-label-indexing-vs-full-text.md`

### Q: Why is the label index in Loki proportional to distinct label *combinations*, not log lines?
A: Because each unique set of label values (e.g., `app=checkout, env=prod`) defines one stream, and the index only maps streams to chunks. Millions of log lines from the same service/pod/time produce just one index entry. This is why the index stays small even at terabyte scale — it grows with configuration complexity (how many distinct label combos you have), not with data volume.
→ Post: `_posts/2026-05-16-log-aggregation-loki-label-indexing-vs-full-text.md`

## Topic: SLIs, SLOs & error budgets (Order 7)

### Q: What is a burn rate in the context of SLO error budgets?
A: A burn rate is a multiplier expressing how many times faster than the sustainable pace the error budget is being consumed. A burn rate of 1.0× means errors are happening at exactly the rate that exhausts the budget right on schedule by period's end. 14.4× means the budget is being consumed 14.4 times faster than sustainable — on track to run out well before the period ends.
→ Post: `_posts/2026-05-18-slo-error-budget-burn-rate-calculation.md`

### Q: How is the burn-rate threshold calculated for a specific alert window?
A: First, compute how many hours it would take to consume a given percentage of the full SLO period's budget at a steady rate (`errorBudgetPercent × totalPeriod.Hours() / 100`). Then divide by the alert's own shorter measurement window. For example, consuming 2% of a 30-day budget takes 14.4 hours at steady rate; dividing by a 1-hour window gives a threshold of 14.4×.
→ Post: `_posts/2026-05-18-slo-error-budget-burn-rate-calculation.md`

### Q: Why does the slok/sloth tool compute four separate burn-rate thresholds instead of one?
A: Because "how much budget, consumed how fast" needs multiple answers. A fast, severe burn (2% budget in 1 hour → page) and a slow, still-dangerous trend (10% budget in 6 hours → ticket) are genuinely different failure shapes requiring different urgency. A single threshold couldn't distinguish a two-hour budget exhaustion from a 30-day one.
→ Post: `_posts/2026-05-18-slo-error-budget-burn-rate-calculation.md`

### Q: Why is an SLO alert based on a single threshold-and-window pair problematic?
A: It pages on every transient blip — a 90-second retry storm, a brief deploy hiccup, a network glitch — because any short enough window will occasionally cross a threshold from noise alone. This causes alert fatigue: on-call engineers start muting pages, which is dangerous because it also dulls their response to pages that genuinely matter.
→ Post: `_posts/2026-05-18-slo-error-budget-burn-rate-calculation.md`

### Q: What's the common mistake when teams first adopt SLOs?
A: Treating "99.9% uptime" as a hard binary line — alerting the instant any error happens. This makes the SLO practically impossible to honor because error budgets exist specifically to absorb expected transient failures. The real question isn't "has any error happened?" but "how fast is the budget being consumed right now relative to how fast it's allowed to last the entire period?"
→ Post: `_posts/2026-05-18-slo-error-budget-burn-rate-calculation.md`

### Q: What is the practical difference between a burn rate of 2.0× and 14.4×?
A: At 2.0×, the error budget is being consumed twice as fast as sustainable — concerning but manageable, likely a non-urgent ticket. At 14.4×, the budget is being consumed over 14 times too fast — a severe, urgent situation that will exhaust the budget in hours, not days, warranting an immediate page. Both are above sustainable pace, but at genuinely different urgency.
→ Post: `_posts/2026-05-18-slo-error-budget-burn-rate-calculation.md`

## Topic: Alerting & on-call (Order 8)

### Q: How does multi-window alerting prevent paging on transient error spikes?
A: It requires a short window AND a long window to both independently exceed the burn-rate threshold, combined with a logical `AND`. A 90-second spike moves the 5-minute short window but doesn't last long enough to push the 1-hour long window over threshold, so the `AND` never becomes true and no alert fires. Only sustained degradations that exceed both windows actually page.
→ Post: `_posts/2026-05-20-alerting-oncall-multi-window-alert-fatigue.md`

### Q: What are Google SRE's recommended window pairs for page-level and ticket-level alerts?
A: Page quick: 5-minute short window, 1-hour long window, 2% error budget. Page slow: 30-minute short, 6-hour long, 5% budget. Ticket quick and slow both use 10% budget with their own window pairs. These are the defaults slok/sloth uses, derived directly from Google's published SRE workbook.
→ Post: `_posts/2026-05-20-alerting-oncall-multi-window-alert-fatigue.md`

### Q: Why does the generated PromQL use `without ({{ .WindowLabel }})` on every `max()` call?
A: The short-window and long-window metrics are computed as separate time series (different label values for the window size). The `without` clause strips that label before comparison so both sides of the `AND` can be compared as plain numbers rather than being kept apart as distinct series by a label that neither side of the logical `AND` should care about.
→ Post: `_posts/2026-05-20-alerting-oncall-multi-window-alert-fatigue.md`

### Q: Why is the full alert expression `(quick-short AND quick-long) OR (slow-short AND slow-long)` instead of a single pair?
A: Because a fast, severe burn (caught by the quick pair: 5m/1h) and a slower, still-dangerous burn (caught by the slow pair: 30m/6h) are different failure shapes. Either one alone is sufficient to page, but each pair internally still requires both windows to agree. This catches two structurally different kinds of budget-threatening degradation.
→ Post: `_posts/2026-05-20-alerting-oncall-multi-window-alert-fatigue.md`

### Q: What is alert fatigue and how does single-window alerting contribute to it?
A: Alert fatigue is when on-call engineers start muting or ignoring pages because most of them turn out to be transient noise. Single-window alerting pages on every brief spike that crosses a threshold, which at real production volumes happens frequently from ordinary noise. Over time, engineers lose trust in the paging system, which is dangerous when real incidents also page.
→ Post: `_posts/2026-05-20-alerting-oncall-multi-window-alert-fatigue.md`

### Q: What happens if you use a single-window alert and a real degradation is slow enough that it doesn't cross the short window's threshold?
A: The short window never triggers because the degradation is gradual enough that a 5-minute average stays below the threshold — but the budget is still being consumed. The slow pair (30m/6h) exists specifically to catch these gradual burns. Without it, a real, sustained but slow degradation could exhaust the entire error budget without ever tripping a fast window alert.
→ Post: `_posts/2026-05-20-alerting-oncall-multi-window-alert-fatigue.md`

## Topic: Dashboards & the RED/USE methods (Order 9)

### Q: What's the fundamental difference between RED and USE dashboards?
A: RED is request-centric — Rate, Errors, Duration — answering "how is this service performing for its callers?" from request counters and histograms. USE is resource-centric — Utilization, Saturation, Errors — answering "is this resource about to become a bottleneck?" from capacity/usage/limit gauges. They're answers to two different questions built from two different shapes of metric, not the same three panels with different labels.
→ Post: `_posts/2026-06-15-dashboards-red-use-methods-panel-shapes.md`

### Q: Why can't you meaningfully apply RED to a node's CPU or USE to a stateless API endpoint?
A: A node's CPU doesn't have a "request rate" or "verb" — it has no callers performing operations, so RED's operation-keyed panels are meaningless. A stateless HTTP service scaled horizontally has no fixed capacity ceiling — there's no "utilization" in the USE sense because there's no hard limit to approach. Each method requires structural prerequisites the other's target doesn't have.
→ Post: `_posts/2026-06-15-dashboards-red-use-methods-panel-shapes.md`

### Q: Why does `mydurationpanel` use `histogram_quantile` instead of average duration?
A: An average hides the tail latency that usually matters operationally — a p99 spike can be invisible in an average while 1% of real users have a bad experience. `histogram_quantile` over a Prometheus histogram (bucketed duration observations) makes a specific percentile computable; an average duration gauge couldn't produce this because it never had the distribution, only a running mean.
→ Post: `_posts/2026-06-15-dashboards-red-use-methods-panel-shapes.md`

### Q: In the kubernetes-mixin, why does USE's saturation ratio use `cpuUsageByPod / cpuLimitsByPod`?
A: Because it's a ratio of two independently collected metrics: actual measured usage from cAdvisor (`container_cpu_usage_seconds_total`) divided by the pod spec's declared limit (`kube_pod_container_resource_limits`). The ratio only means something because both sides are real, separately-sourced numbers — it's not derivable from either metric alone, and it tells you how close to the configured ceiling this pod actually is.
→ Post: `_posts/2026-06-15-dashboards-red-use-methods-panel-shapes.md`

### Q: Why do the RED panel functions have different `standardOptions.withUnit` values for each panel?
A: Because the unit encodes which RED question the panel answers: `'reqps'` (requests per second) for Rate, `'percentunit'` for the error ratio, and `'s'` (seconds) for Duration. The unit isn't cosmetic — it's the panel function encoding, in code, which of the three structurally different metrics it represents.
→ Post: `_posts/2026-06-15-dashboards-red-use-methods-panel-shapes.md`

### Q: What's the common mistake when a team is asked to build a "RED dashboard" for infrastructure resources?
A: Repackaging resource capacity/usage gauges under RED's naming — e.g., calling CPU utilization "Rate" and calling it a "RED dashboard." If there's no real operation being measured (no verb, no request counter), it's a USE dashboard that's mislabeled. The two methods have structurally different prerequisites, not just different panel titles.
→ Post: `_posts/2026-06-15-dashboards-red-use-methods-panel-shapes.md`

### Q: Can a single Prometheus metric answer both a RED and a USE question?
A: Rarely. `apiserver_request_total` (RED's source) is a per-request counter with no notion of a resource ceiling. `kube_node_status_capacity` (USE's source) is a capacity gauge with no notion of an individual request. They can sit on the same dashboard, but that's two methods side by side, not one metric serving two structurally different questions.
→ Post: `_posts/2026-06-15-dashboards-red-use-methods-panel-shapes.md`

## Topic: Sampling strategies (Order 10)

### Q: Why does uniform 1% trace sampling throw away exactly the traces you need most?
A: Errors and slow outliers are rare — typically well under 1% of all traces. A flat 1% keep-rate drops roughly 99% of error traces right along with 99% boring healthy ones. The sample left behind doesn't correlate with the incidents that actually happened — a system could be having a real failure and the sampled set would show almost nothing wrong, purely because the interesting trace didn't win its coin flip.
→ Post: `_posts/2026-06-29-trace-sampling-head-based-vs-tail-based.md`

### Q: How does head-based sampling make its decision?
A: It hashes the trace ID into a deterministic "randomness" value and compares it against a threshold derived from the sampling percentage — a pure function of the trace ID alone, computed once, with no memory, no buffering, and no visibility into how the trace turns out. The same trace ID always gets the same decision, which is load-bearing: it lets independent collector instances make consistent decisions without coordinating.
→ Post: `_posts/2026-06-29-trace-sampling-head-based-vs-tail-based.md`

### Q: Why does tail-based sampling need to buffer every span?
A: Because the decision "keep this trace if any span had an error or total latency exceeds a threshold" can only be evaluated against the complete trace. At the moment the first span is created, nothing is known about whether that trace will end in an error. Buffering the full trace is what makes outcome-aware sampling possible — it's not overhead incidental to the feature; it *is* the feature.
→ Post: `_posts/2026-06-29-trace-sampling-head-based-vs-tail-based.md`

### Q: What operational cost does tail-based sampling introduce that head-based doesn't?
A: Every trace in flight occupies memory in the collector until its `decision_wait` timer fires. This scales with concurrent traces × `decision_wait` duration, not with output data volume. A traffic spike can grow that buffer faster than expected. Head-based sampling, by contrast, is stateless — no buffer to size, no timer to manage, no risk of OOM from holding incomplete traces.
→ Post: `_posts/2026-06-29-trace-sampling-head-based-vs-tail-based.md`

### Q: Can head-based and tail-based sampling coexist in the same pipeline?
A: Yes — it's a common pattern. A cheap head-based sampler at each service's SDK reduces raw span volume before spans even leave the process. A downstream tail-sampling collector tier then makes the outcome-aware "keep errors and slow traces" decision on whatever made it through. They solve different problems (volume reduction vs. outcome-aware retention) and aren't mutually exclusive.
→ Post: `_posts/2026-06-29-trace-sampling-head-based-vs-tail-based.md`

### Q: What happens if `decision_wait` is too short for the slowest traces in your system?
A: A trace still in flight when its decision batch is evaluated gets an incomplete-trace decision — it might miss the late error span or the late latency spike that the policy was meant to catch, causing tail-based sampling to drop it even though it should have been kept. The `decision_wait` must be long enough for the slowest realistic trace to complete.
→ Post: `_posts/2026-06-29-trace-sampling-head-based-vs-tail-based.md`

### Q: What's the gotcha with tail-based sampling in a multi-service trace?
A: If all of a trace's spans don't land in the same collector instance's buffer (because they arrive at different collectors), the tail sampler can't see the complete picture and might make incorrect keep/drop decisions. You need consistent trace-ID routing — e.g., via a load-balancing exporter tier — so all spans for one trace ID reach the same buffer.
→ Post: `_posts/2026-06-29-trace-sampling-head-based-vs-tail-based.md`

## Topic: Correlation IDs & request tracing across async boundaries (Order 11)

### Q: Why does `[ThreadStatic]` break correlation across async boundaries?
A: A single logical async operation frequently resumes on a different physical thread after an `await` yields control back to the thread pool. A `[ThreadStatic]` variable shows whatever was last set on *that* thread — potentially unrelated work from a different request — the moment execution resumes elsewhere. `AsyncLocal<T>` solves this by flowing with the logical call via `ExecutionContext`, not the physical thread.
→ Post: `_posts/2026-07-13-correlation-ids-async-boundaries-asynclocal.md`

### Q: How does `Activity.Start()` automatically create parent-child links?
A: It reads `Activity.Current` (the ambient activity) *before* overwriting it with itself, and uses that previous value as the new activity's parent. This means starting a new activity anywhere inside an already-running async operation automatically produces the correct parent/child link, entirely as a side effect of `AsyncLocal`'s flow — no explicit parent passing required.
→ Post: `_posts/2026-07-13-correlation-ids-async-boundaries-asynclocal.md`

### Q: What is `Activity.Current` implemented as, mechanically?
A: Nothing more exotic than `private static readonly AsyncLocal<Activity?> s_current`. The "current operation" for tracing is carried inside `ExecutionContext`, which the CLR captures at each `await` suspension point and restores when the continuation runs. This is why `Activity` gets async-correctness "for free" — it's delegated entirely to `AsyncLocal<T>`'s semantics, not reimplemented.
→ Post: `_posts/2026-07-13-correlation-ids-async-boundaries-asynclocal.md`

### Q: What happens to `Activity.Current` if `ExecutionContext.SuppressFlow()` is called?
A: The ambient context (and every `AsyncLocal<T>` value including `Activity.Current`) stops flowing across the next `await` boundary. Any activity started after that point won't see the correct parent, breaking the trace tree. This is a real, sometimes-legitimate performance optimization, but it silently breaks automatic parent-linking if used where trace correctness is needed downstream.
→ Post: `_posts/2026-07-13-correlation-ids-async-boundaries-asynclocal.md`

### Q: Do concurrent `Task.WhenAll` branches share the same `Activity.Current` value?
A: No — each branch gets its own logical copy of the `ExecutionContext` at the point it branches off. Setting `Activity.Current` in one concurrent branch doesn't affect another. This is what makes parallel operations safe: each branch can start its own child activities without interfering with others' "current" values.
→ Post: `_posts/2026-07-13-correlation-ids-async-boundaries-asynclocal.md`

### Q: Why can't you just pass a correlation-ID parameter through every method instead of using `AsyncLocal`?
A: You technically can, but every method in the call chain — including ones that have nothing to do with tracing — needs an extra parameter. It's trivially easy for someone adding a new method to forget to pass it, silently breaking the chain at that point. `AsyncLocal` makes the current context ambient and automatic, requiring zero explicit plumbing in application code.
→ Post: `_posts/2026-07-13-correlation-ids-async-boundaries-asynclocal.md`

### Q: Does a manually created `new Thread(...)` automatically flow `Activity.Current`?
A: No. A raw `Thread` does not capture and flow the creating thread's `ExecutionContext` the way `Task`-based async continuations do. `Activity.Current` inside that new thread's entry method would not reflect the value from the creating thread, unless the code explicitly captures and restores the `ExecutionContext`. This is a structural difference between raw `Thread` and the `async`/`await` model.
→ Post: `_posts/2026-07-13-correlation-ids-async-boundaries-asynclocal.md`

## Topic: APM & profiling in production (Order 12)

### Q: Why does the "three pillars of observability" approach create friction during incident response?
A: Each pillar lives in a different tool (Prometheus for metrics, Loki for logs, Jaeger for traces), each with its own query language and UI. An on-call engineer must copy a trace ID from one tool, paste it into another, re-derive context each time, and can't natively jump from a slow span back to the specific log entry that captured the exception. The signals are correlated by the system's behavior but decoupled by the toolchain.
→ Post: `_posts/2026-07-27-apm-profiling-unified-observability-dashboard.md`

### Q: How does the Aspire Dashboard correlate traces, logs, and metrics?
A: All three signal types are ingested through one OTLP endpoint and stored in a single in-memory `TelemetryRepository` indexed by shared `TraceId`, `SpanId`, and `ResourceKey`. Clicking a slow trace retrieves spans; clicking "View Logs" on a span constructs a filter `TraceId == {id} AND SpanId == {spanId}` and navigates to the logs view with those filters pre-applied — showing logs from the same causal unit of work, not just the same time window.
→ Post: `_posts/2026-07-27-apm-profiling-unified-observability-dashboard.md`

### Q: Why does `TelemetryRepository` use `CircularBuffer` instead of an append-only store?
A: Because it stores telemetry in memory only — an append-only store would eventually OOM under sustained load. The `CircularBuffer` has a configurable max capacity (`MaxLogCount`/`MaxTraceCount`), evicting oldest entries when full. It's a fixed-memory ring buffer designed for "just-in-time" diagnostic use, not persistent production storage.
→ Post: `_posts/2026-07-27-apm-profiling-unified-observability-dashboard.md`

### Q: How does the Aspire Dashboard notify the UI when new telemetry arrives?
A: `AddLogs()`/`AddTraces()`/`AddMetrics()` each call `RaiseSubscriptionChanged()`, which pushes notifications to all active UI subscriptions. This is a push-based reactive model, not polling. UI components register callbacks via `OnNewTraces()`/`OnNewLogs()` and must dispose them when done — a leaked subscription keeps firing `InvokeAsync` against a disposed Blazor component.
→ Post: `_posts/2026-07-27-apm-profiling-unified-observability-dashboard.md`

### Q: Why does clicking "View Logs" on a span show logs from the same causal unit of work, not just the same time window?
A: Because the filter uses `TraceId` AND `SpanId` — the `SpanId` identifies the specific span's execution context. Logs emitted during that span's execution carry its `TraceId` and `SpanId` as attributes (injected automatically by the OTel SDK when an `Activity` is active). The join is on shared identity fields, not on timestamp overlap, which would return unrelated logs that merely happened to be emitted at the same time.
→ Post: `_posts/2026-07-27-apm-profiling-unified-observability-dashboard.md`

### Q: What happens to old telemetry entries when the Aspire Dashboard's buffer is full?
A: The oldest entries are silently evicted by the `CircularBuffer`, and the UI displays a "limit reached" message. You won't see data from before the buffer rolled. In a high-throughput scenario during debugging, this means you might miss earlier events — tune `MaxLogCount`/`MaxTraceCount` in `DashboardOptions.TelemetryLimits` if you need longer retention.
→ Post: `_posts/2026-07-27-apm-profiling-unified-observability-dashboard.md`

### Q: What is the structural advantage of one OTLP endpoint for all three signals vs. three separate ingestion pipelines?
A: With three separate pipelines (Prometheus scrapes metrics, Loki ingests logs, Jaeger receives spans), each has its own SDK configuration, retention policy, and query language — switching backends means rewriting instrumentation across every service. One OTLP endpoint means one SDK configuration, one export destination, and shared `TraceId`/`SpanId` correlation across all signals — instrumentation is coupled to the system's behavior, not to the toolchain.
→ Post: `_posts/2026-07-27-apm-profiling-unified-observability-dashboard.md`
---

**Last updated:** July 2026 | **Total Q&A:** 77 across Observability

[Back to Q&A Index]({{ '/qa/' | relative_url }}) • [All Observability posts]({{ '/observability/' | relative_url }})
