---
layout: page
title: "Google Cloud — Q&A Bank"
permalink: /qa/gcp/
---

Bite-sized questions and answers from Google Cloud blog posts. Read 5-10 per sitting. Each answer is 2-4 sentences max and links back to the full post for deeper understanding.

## Topic: Application Default Credentials (Order 0)

### Q: What is Application Default Credentials and what problem does it solve?
ADC is a fixed, three-step fallback chain (env var, well-known gcloud file, metadata server) that resolves a credential once per process and caches it. It solves the problem of the same code needing to authenticate differently across a developer laptop, CI runner, and GCE/GKE/Cloud Run — without branching on environment.
→ Post: `_posts/2026-06-01-application-default-credentials-resolution-chain.md`

### Q: What is the difference between `gcloud auth login` and `gcloud auth application-default login` in the context of ADC?
`gcloud auth login` only authenticates the `gcloud` CLI itself. `gcloud auth application-default login` writes the `application_default_credentials.json` well-known file that `DefaultCredentialProvider` actually looks for in step 2 of the ADC chain. Confusing these two is a common mistake even in Google's own doc comments.
→ Post: `_posts/2026-06-01-application-default-credentials-resolution-chain.md`

### Q: What happens if the GCE metadata server isn't reachable the instant ADC tries to detect it?
`ComputeCredential` pings `169.254.169.254` up to 3 times with a 500ms timeout each. If all fail, it falls back to reading `/sys/class/dmi/id/product_name` (Linux) or `Win32_BIOS` Manufacturer (Windows) for the literal string "Google" — a local, network-free way to detect Google hardware.
→ Post: `_posts/2026-06-01-application-default-credentials-resolution-chain.md`

### Q: How does Workload Identity Federation plug into ADC?
WIF doesn't bypass ADC — it feeds step 1. `google-github-actions/auth` writes a short-lived external-account config file and sets `GOOGLE_APPLICATION_CREDENTIALS` to point at it, so the same env-var branch in the fallback chain picks it up. WIF changes what ends up in that file, not how it gets discovered.
→ Post: `_posts/2026-06-01-application-default-credentials-resolution-chain.md`

### Q: What is the common mistake when setting GOOGLE_APPLICATION_CREDENTIALS for a long-lived deployment?
Pointing it at a downloaded JSON service account key that never expires. Long-lived exportable keys are actively discouraged; Workload Identity Federation (which writes a short-lived config to the same path) is the current recommendation for anything running on GCE/GKE/Cloud Run.
→ Post: `_posts/2026-06-01-application-default-credentials-resolution-chain.md`

### Q: Why does ADC use null-coalescing (`??`) instead of try-catch for its fallback chain?
Each `GetAdcFrom*Async` method returns null when its source simply isn't present, letting the `??` chain fall through cleanly. A source only throws when it is present but corrupt (e.g. the env var points to an unreadable file), deliberately distinguishing "not configured" from "misconfigured."
→ Post: `_posts/2026-06-01-application-default-credentials-resolution-chain.md`

## Topic: Compute Engine vs App Engine vs Cloud Run (Order 1)

### Q: How does Cloud Run achieve scale-to-zero in a way Compute Engine cannot?
Cloud Run (built on Knative Serving) models "zero instances" as a first-class state with an activator component that intercepts requests and cold-starts an instance. Compute Engine VMs keep running regardless of traffic — they have no equivalent mechanism to stop when idle.
→ Post: `_posts/2025-09-14-compute-engine-vs-app-engine-vs-cloud-run.md`

### Q: What does `targetBurstCapacity` control in Cloud Run?
It controls whether the activator stays in the request path. Setting it to `"0"` means the activator only intercepts when there are exactly zero warm instances — specifically the scale-to-zero cold-start path, not a general-purpose traffic router.
→ Post: `_posts/2025-09-14-compute-engine-vs-app-engine-vs-cloud-run.md`

### Q: When would you use GKE Autopilot over Cloud Run?
When you need baseline pods running constantly (zero traffic doesn't mean zero instances) and want Kubernetes-native features like DaemonSets, StatefulSets, or complex networking. Autopilot removes node management but the cluster and its pods are still running things — it doesn't scale to zero like Cloud Run.
→ Post: `_posts/2025-09-14-compute-engine-vs-app-engine-vs-cloud-run.md`

### Q: What is the tradeoff of using Cloud Run's `containerConcurrency` for autoscaling?
It bases scaling on concurrent in-flight requests per instance rather than a static replica count, which means latency can spike during cold starts from zero. Compute Engine's fixed instance count has no cold-start latency but wastes resources at zero traffic.
→ Post: `_posts/2025-09-14-compute-engine-vs-app-engine-vs-cloud-run.md`

### Q: What happens if you set `minScale: "0"` on Cloud Run and traffic arrives?
The activator intercepts the request, triggers a cold start of a new instance, then routes the request in — the caller experiences added latency for that first request. This is the fundamental latency-vs-cost tradeoff of serverless scale-to-zero.
→ Post: `_posts/2025-09-14-compute-engine-vs-app-engine-vs-cloud-run.md`

## Topic: IAM (Order 2)

### Q: What is the difference between `google_project_iam_member` and `google_project_iam_binding` in Terraform?
`iam_member` is additive — it grants one member a role without touching any existing members. `iam_binding` is authoritative for that role — it replaces the entire member list, silently dropping anyone not listed in the Terraform config, even principals granted access outside that run.
→ Post: `_posts/2026-01-16-gcp-iam-additive-vs-authoritative-bindings.md`

### Q: What happens if you accidentally use `google_project_iam_binding` on a broad role like `roles/owner`?
Every principal not listed in the binding's members list loses that role on apply — silently, with no warning. The blast radius scales with how much the role could do, which is why authoritative mode on basic roles is particularly dangerous.
→ Post: `_posts/2026-01-16-gcp-iam-additive-vs-authoritative-bindings.md`

### Q: When would you actually want authoritative IAM bindings?
When you need to declare the complete, exclusive set of principals for a tightly-controlled role (e.g., a custom admin role where you want Terraform to be the single source of truth for membership). Authoritative mode is the correct tool for that job — it's not inherently a bug.
→ Post: `_posts/2026-01-16-gcp-iam-additive-vs-authoritative-bindings.md`

### Q: What is the common mistake with IAM binding mode in Terraform?
Reaching for `google_project_iam_binding` (authoritative) when you meant to add one member alongside grants managed by other teams or automation. The resource names look similar, so the destructive one gets used accidentally — the production Terraform IAM module addresses this by surfacing the choice as an explicit `mode` variable.
→ Post: `_posts/2026-01-16-gcp-iam-additive-vs-authoritative-bindings.md`

### Q: How do IAM Conditions compose with additive vs authoritative bindings?
IAM Conditions (`title`/`description`/`expression`) are identical regardless of binding mode. Choosing a binding mode and adding a least-privilege condition are two independent decisions — the condition block structure is shared across both resource types in the production module.
→ Post: `_posts/2026-01-16-gcp-iam-additive-vs-authoritative-bindings.md`

## Topic: VPC Networking (Order 3)

### Q: What is the problem with IP-based firewall rules in cloud environments where instances are constantly recreated?
IP-based rules are brittle — when instances are destroyed and recreated with different IPs, the rules become stale and either block correct traffic or allow traffic to wrong addresses. Identity-based targeting (network tags or service accounts) survives IP churn because it references who the instance is, not where it happens to be numerically.
→ Post: `_posts/2026-01-18-gcp-vpc-tag-based-firewalls-and-secondary-ranges.md`

### Q: What are secondary IP ranges and why does GKE need them?
A subnet's primary range gives Node VMs their IPs, while separate secondary ranges carve out independent address spaces for Pod IPs and Service IPs (alias IP ranges). This lets thousands of ephemeral Pod IPs coexist cleanly with a much smaller, stable set of Node IPs on the same subnet.
→ Post: `_posts/2026-01-18-gcp-vpc-tag-based-firewalls-and-secondary-ranges.md`

### Q: How does a firewall rule targeting `source_tags = ["web-frontend"]` survive instance recreation?
The rule matches by tag, not IP. When a VM tagged `web-frontend` is destroyed and a new one with the same tag is created at a different IP, the rule still matches because it never referenced an IP — only the identity-level tag.
→ Post: `_posts/2026-01-18-gcp-vpc-tag-based-firewalls-and-secondary-ranges.md`

### Q: What is the downside of relying only on IP-based firewall rules in a GCP VPC?
You miss the tag and service-account targeting mechanisms the platform offers, and you end up re-fighting the "instances keep changing IPs" problem that identity-based targeting exists specifically to solve. A real production rule set commonly mixes IP-range, tag, and service-account targeting in the same ruleset.
→ Post: `_posts/2026-01-18-gcp-vpc-tag-based-firewalls-and-secondary-ranges.md`

### Q: What does `private_ip_google_access` do on a GCP subnet?
It controls whether instances without external IPs can reach Google APIs (Cloud Storage, BigQuery, etc.) over Google's internal network rather than the public internet. It's independent of both firewall rules and secondary IP ranges — a third axis of traffic configuration.
→ Post: `_posts/2026-01-18-gcp-vpc-tag-based-firewalls-and-secondary-ranges.md`

## Topic: Cloud Storage (Order 4)

### Q: What actions does a Cloud Storage lifecycle rule support beyond deletion?
`SetStorageClass` transitions an object to a cheaper storage class (STANDARD → NEARLINE → COLDLINE), and `Delete` removes it. Cost-driven transitions are arguably the more common real-world use case — deletion is just one option.
→ Post: `_posts/2026-01-20-cloud-storage-lifecycle-rules.md`

### Q: What is the purpose of the `matches_storage_class` condition in a lifecycle rule?
It scopes a rule to only fire on objects currently in a specific storage class, enabling correct staged transitions — e.g., a rule that only moves objects from NEARLINE to COLDLINE won't accidentally re-apply to objects already in COLDLINE or still in STANDARD.
→ Post: `_posts/2026-01-20-cloud-storage-lifecycle-rules.md`

### Q: What is the difference between `age` and `days_since_noncurrent_time` as lifecycle conditions?
`age` measures time since the object was uploaded. `days_since_noncurrent_time` measures time since a version stopped being current (was superseded by a newer version). A version could be years old but only recently become noncurrent — these target different lifecycle events.
→ Post: `_posts/2026-01-20-cloud-storage-lifecycle-rules.md`

### Q: What is the common mistake when writing lifecycle rules for versioned buckets?
Using `num_newer_versions` without understanding it only prunes noncurrent versions, not the current one. A rule with `num_newer_versions = 3` keeps the 3 most recent versions and deletes older noncurrent ones — it never touches the live object, which is a materially different operation than blanket age-based deletion.
→ Post: `_posts/2026-01-20-cloud-storage-lifecycle-rules.md`

### Q: When would you use `days_since_custom_time` instead of `age`?
When the business-relevant age of an object isn't when it was uploaded, but when it became relevant (e.g., a document's retention period starts from when it was last reviewed, not when it was uploaded). You set `custom_time` on the object explicitly, and `days_since_custom_time` measures from that user-defined point.
→ Post: `_posts/2026-01-20-cloud-storage-lifecycle-rules.md`

## Topic: Cloud SQL vs Spanner vs Firestore (Order 5)

### Q: What is TrueTime and how does it differ from a standard synchronized clock?
TrueTime is a globally-synchronized clock with a bounded uncertainty interval, not just "a clock that's close enough." It lets Spanner assign real, externally-ordered timestamps to transactions without a global lock — the server, not the client, is the authority on what timestamp a staleness bound resolves to.
→ Post: `_posts/2026-01-22-cloud-sql-vs-spanner-vs-firestore-truetime.md`

### Q: How does `TimestampBound.OfExactStaleness` differ from `TimestampBound.OfMaxStaleness`?
`OfExactStaleness` reads at a timestamp exactly `duration` old, chosen once near the start — useful for nearby replicas without distributed timestamp negotiation overhead. `OfMaxStaleness` reads at `NOW - duration` or newer, which requires more coordination to determine "now" precisely.
→ Post: `_posts/2026-01-22-cloud-sql-vs-spanner-vs-firestore-truetime.md`

### Q: What happens if a client's local clock is badly skewed when reading from Spanner?
The read is still correct because the timestamp is chosen by Spanner's server using TrueTime, not derived from the client's clock. A client with a badly skewed local clock still gets correct, bounded results for staleness reads.
→ Post: `_posts/2026-01-22-cloud-sql-vs-spanner-vs-firestore-truetime.md`

### Q: What is the tradeoff of using `TimestampBound.Strong` vs `OfMaxStaleness`?
`Strong` reads the absolute latest committed data but may cross regions to confirm, adding latency. `OfMaxStaleness` reads from a nearby replica with lower latency but guarantees data is no older than the specified duration. The choice is per query, not fixed for the database.
→ Post: `_posts/2026-01-22-cloud-sql-vs-spanner-vs-firestore-truetime.md`

### Q: What is the common mistake when choosing between Cloud SQL and Spanner?
Treating it as just a scale decision ("Spanner for bigger workloads") when the real difference is architectural. Spanner's value — horizontal write scalability with strong cross-region consistency — depends on TrueTime; choosing it for workloads that don't need global distribution pays its complexity without using the capability that justifies it.
→ Post: `_posts/2026-01-22-cloud-sql-vs-spanner-vs-firestore-truetime.md`

## Topic: Pub/Sub (Order 6)

### Q: Why does a Pub/Sub client library automatically extend a message's ack deadline mid-processing?
The broker can't distinguish "still processing" from "consumer died." Without auto-extension, a slow-but-healthy consumer's in-progress message gets redelivered to a different consumer, causing duplicate processing or two consumers racing on the same work.
→ Post: `_posts/2026-01-24-pubsub-ack-deadline-lease-extension.md`

### Q: What is the problem if ack deadline auto-extension timing is not clamped to a minimum?
A very short ack deadline combined with a large extension window could produce a negative or near-zero delay — causing the client to extend "immediately, constantly" instead of on a sane schedule. The `MinimumLeaseExtensionDelay` clamp exists to prevent this.
→ Post: `_posts/2026-01-24-pubsub-ack-deadline-lease-extension.md`

### Q: What happens if an event-driven Cloud Function throws during processing?
The underlying HTTP response signals an error to Eventarc, which triggers the event source's retry logic — the same at-least-once redelivery semantics as a Pub/Sub subscriber. Completion without throwing = success; throwing = failure.
→ Post: `_posts/2026-01-28-cloud-functions-cloudevents-over-http.md`

### Q: What is the gotcha with Pub/Sub's exactly-once delivery mode vs at-least-once?
They aren't the same mechanism with a label. The client library maintains two separate `LeaseTiming` instances per channel — one for exactly-once, one for normal delivery — confirming genuinely different lease-management behavior under the hood, not just a naming difference.
→ Post: `_posts/2026-01-24-pubsub-ack-deadline-lease-extension.md`

### Q: What problem does `ExtendQueueThrottleInterval` solve in Pub/Sub?
Under high message volume, sending an individual extend-deadline call the instant every message's timer fires creates a real load problem. The throttle interval batches/paces that traffic to prevent spiking the broker with extend requests.
→ Post: `_posts/2026-01-24-pubsub-ack-deadline-lease-extension.md`

## Topic: GKE Workload Identity (Order 7)

### Q: What are the two bindings Workload Identity requires, and why is each alone insufficient?
Binding 1 is an IAM grant (`roles/iam.workloadIdentityUser`) authorizing the KSA to impersonate the GSA. Binding 2 is a KSA annotation telling the metadata server which GSA to hand tokens for. The IAM grant alone doesn't tell the metadata server what to hand out; the annotation alone doesn't grant impersonation permission.
→ Post: `_posts/2026-01-26-gke-workload-identity-dual-binding.md`

### Q: What is the special identity format used in Workload Identity IAM bindings?
`serviceAccount:PROJECT.svc.id.goog[NAMESPACE/KSA_NAME]` — a specific syntax GCP IAM understands as "this exact Kubernetes ServiceAccount in this exact namespace." Getting any part wrong (wrong namespace, wrong KSA name) means the binding silently doesn't apply to the Pod you think it does.
→ Post: `_posts/2026-01-26-gke-workload-identity-dual-binding.md`

### Q: What is the tradeoff of Workload Identity vs a downloaded service account key?
Workload Identity eliminates long-lived exportable secrets but requires both bindings to be correctly configured and adds the runtime token-fetched-on-demand step. Downloaded keys are simpler to set up but create a persistent, exportable credential that leaks mean permanent access.
→ Post: `_posts/2026-01-26-gke-workload-identity-dual-binding.md`

### Q: What is the common mistake when configuring Workload Identity?
Configuring only one of the two required bindings — the IAM grant or the KSA annotation. Missing either half is a real, common misconfiguration: the IAM grant alone doesn't tell the metadata server what to hand out, and the annotation alone doesn't authorize impersonation.
→ Post: `_posts/2026-01-26-gke-workload-identity-dual-binding.md`

### Q: How does Workload Identity differ from WIF (Workload Identity Federation)?
Workload Identity is for workloads running inside GKE — a KSA impersonates a GSA via two bindings and the metadata server. WIF is for external identities (GitHub Actions, other clouds) — it exchanges an OIDC token via Google STS with nothing stored on either side. Different trust boundaries, different mechanisms.
→ Post: `_posts/2026-01-26-gke-workload-identity-dual-binding.md`

## Topic: Cloud Functions (Order 8)

### Q: What is the actual transport mechanism behind event-driven Cloud Functions?
Every Cloud Function is invoked over plain HTTP, regardless of trigger type. For event-driven functions, Eventarc wraps the event as a CNCF CloudEvents-formatted HTTP POST, and the Functions Framework's `CloudEventAdapter` parses it back into a structured `CloudEvent`. The transport is uniform — "event-driven" describes the encoding and source, not a separate mechanism.
→ Post: `_posts/2026-01-28-cloud-functions-cloudevents-over-http.md`

### Q: What happens if a Cloud Function receives a malformed event (not parseable as CloudEvent)?
The framework returns HTTP 400 before the user's function code ever runs. Event-parsing failures and function-logic failures are separate error classes — a 400 in the framework logs means the event itself was malformed, distinct from an exception inside the handler.
→ Post: `_posts/2026-01-28-cloud-functions-cloudevents-over-http.md`

### Q: What legacy behavior does CloudEventAdapter maintain for older GCF functions?
It falls back to `GcfConverters.ConvertGcfEventToCloudEvent` for requests that aren't standard CloudEvents — evidence Google Cloud Functions' event format predates CNCF CloudEvents standardization, and the framework preserves backward compatibility for first-generation functions using the proprietary format.
→ Post: `_posts/2026-01-28-cloud-functions-cloudevents-over-http.md`

### Q: What is the gotcha with determining success/failure in a Cloud Function handler?
The `ICloudEventFunction.HandleAsync` interface returns no success/failure value — completion itself IS the signal. The CLR's exception mechanism is the entire error-reporting channel, so throwing = failure triggers redelivery, while returning normally = success with no extra translation needed.
→ Post: `_posts/2026-01-28-cloud-functions-cloudevents-over-http.md`

### Q: When would you choose an HTTP-triggered Cloud Function over an event-driven one?
When you need request-response semantics (the caller expects a synchronous reply) rather than fire-and-forget event processing. HTTP functions return a response to the caller; event-driven functions process asynchronously with at-least-once delivery and retry semantics managed by Eventarc.
→ Post: `_posts/2026-01-28-cloud-functions-cloudevents-over-http.md`

## Topic: Cloud Load Balancing (Order 9)

### Q: How does a single global anycast IP route users to the nearest regional backend without DNS?
A single `google_compute_global_address` is announced from many Google edge locations simultaneously. BGP-level anycast routing sends each user's traffic to the nearest edge at the network layer — no DNS TTL, no caching delay, no per-region IP management.
→ Post: `_posts/2026-01-30-gcp-global-load-balancing-anycast-serverless-negs.md`

### Q: What is a Serverless NEG and why does Cloud Run need a different NEG type than VM backends?
A Serverless NEG (`network_endpoint_type = "SERVERLESS"`) references a Cloud Run service by name rather than IP or instance group. Serverless backends get their own NEG type because "backend address" isn't a meaningful concept for something that scales to zero with no persistent instances.
→ Post: `_posts/2026-01-30-gcp-global-load-balancing-anycast-serverless-negs.md`

### Q: What is the problem with DNS-based geo-routing for global load balancing?
DNS caching and TTLs delay failover, and it requires managing multiple separate IPs and LB instances, one per region. GCP's global HTTP(S) load balancer is one resource with one global anycast IP — failover happens at the network layer without DNS propagation delay.
→ Post: `_posts/2026-01-30-gcp-global-load-balancing-anycast-serverless-negs.md`

### Q: What is the gotcha when deploying Cloud Run in multiple regions behind one global load balancer?
You need one Serverless NEG per region, each independently resolving to that region's Cloud Run service. The global load balancer is aware of regional backend topology — one NEG per region per backend, not a single global reference.
→ Post: `_posts/2026-01-30-gcp-global-load-balancing-anycast-serverless-negs.md`

### Q: How does a Serverless NEG handle Cloud Run scaling to zero?
The NEG references the service by name, and Google's infrastructure resolves that name to the service's current backend dynamically. The load balancer never needs to be told about instance count changes because it was never tracking individual instances — it just knows the service name.
→ Post: `_posts/2026-01-30-gcp-global-load-balancing-anycast-serverless-negs.md`

## Topic: Workload Identity Federation (Order 10)

### Q: What is the core mechanism behind Workload Identity Federation?
An OAuth2 token exchange (RFC 8693) where GitHub's own OIDC token is swapped for a Google Cloud token via Google STS. Google verifies the token against GitHub's public keys and hands back a federated access token, with nothing long-lived stored on either side.
→ Post: `_posts/2026-02-01-workload-identity-federation-token-exchange.md`

### Q: What is the tradeoff of WIF vs a stored service account JSON key for CI/CD?
WIF eliminates long-lived secrets entirely — every run re-proves identity from scratch with a fresh token exchange. The tradeoff is setup complexity: you need a configured Workload Identity Pool/Provider on GCP and proper OIDC trust conditions, whereas a JSON key is simpler to set up but creates a persistent credential leak risk.
→ Post: `_posts/2026-02-01-workload-identity-federation-token-exchange.md`

### Q: Why is the WIF federated token cached for only 30 seconds?
A deliberately short cache window avoids hammering the STS endpoint for every API call while still re-exchanging frequently enough that the cached token's own short lifetime doesn't become a practical long-lived credential in its own right.
→ Post: `_posts/2026-02-01-workload-identity-federation-token-exchange.md`

### Q: What is the common mistake when configuring WIF audience values?
Passing a raw string instead of the structured resource path `//iam.googleapis.com/projects/.../workloadIdentityPools/.../providers/...`. Google's STS uses the audience to know which configured trust relationship to check the incoming token against — the wrong provider causes the exchange to fail safely rather than silently succeeding.
→ Post: `_posts/2026-02-01-workload-identity-federation-token-exchange.md`

### Q: What does `credential-source` in the WIF credential file embed?
The exact URL and header needed to FETCH GitHub's OIDC token, not the token itself. This lets downstream tools (Terraform, gcloud) authenticate the same way without the auth action handing them a live token that could go stale mid-run — the file describes how to fetch a fresh token when needed.
→ Post: `_posts/2026-02-01-workload-identity-federation-token-exchange.md`

### Q: What is the difference between the federated token and service account impersonation in WIF?
The federated token alone can call GCP APIs if granted permissions directly. Service account impersonation is an optional layer on top where the federated token is exchanged for a scoped token of a specific service account, useful when permissions should live on a dedicated service account rather than the federated identity itself.
→ Post: `_posts/2026-02-01-workload-identity-federation-token-exchange.md`

## Topic: Cloud Monitoring & Logging (Order 11)

### Q: How does Cloud Logging automatically correlate log entries to distributed traces?
`SetTraceAndSpanIfAny` stamps the currently-active trace and span ID onto every `LogEntry` at creation time — a concrete field, not a UI inference from timestamps. This is what powers Cloud Console's "view logs for this trace" feature.
→ Post: `_posts/2026-02-03-cloud-logging-structured-entries-and-trace-correlation.md`

### Q: What is the difference between structured JsonPayload and a formatted text string in Cloud Logging?
JsonPayload is a structured `Struct` where individual fields remain genuinely queryable in Cloud Logging's query language after the fact. A formatted string is only discoverable via full-text search — you can't reliably filter by `user_id=123` without parsing the string back out.
→ Post: `_posts/2026-02-03-cloud-logging-structured-entries-and-trace-correlation.md`

### Q: What happens when a log call is made outside any active trace context?
`SetTraceAndSpanIfAny` is conditional — it simply doesn't attach trace/span fields rather than failing or writing empty placeholders. Trace correlation is opportunistic: present when there's an active context, silently absent otherwise.
→ Post: `_posts/2026-02-03-cloud-logging-structured-entries-and-trace-correlation.md`

### Q: Why can't a logger configured for an Organization target attach trace correlation?
Cloud Trace is a project-level concept. A logger writing at organization scope (`logTarget.Kind != Project`) structurally can't attach trace correlation — the code computes `_traceTarget` as null for non-Project targets rather than attempting it and failing at request time.
→ Post: `_posts/2026-02-03-cloud-logging-structured-entries-and-trace-correlation.md`

### Q: What is the gotcha with relying on timestamps to correlate logs and traces?
Timestamps are unreliable under concurrent traffic and don't scale. The real correlation is the trace ID and span ID stamped on each log entry by `SetTraceAndSpanIfAny` at creation time — a concrete, exact match, not a proximity guess.
→ Post: `_posts/2026-02-03-cloud-logging-structured-entries-and-trace-correlation.md`

### Q: How do ambient scopes and current scopes combine on a log entry?
Two separate `ApplyTo(entry)` calls merge labels from both ambient context (a using-block scope wrapping an operation) and thread-local current scope state. Labels attached at different call stack levels all end up on the same log line without the innermost call needing to know about them.
→ Post: `_posts/2026-02-03-cloud-logging-structured-entries-and-trace-correlation.md`

## Topic: Terraform on GCP (Order 12)

### Q: Why does a Terraform module need both the `google` and `google-beta` providers?
GCP's stable and beta API surfaces graduate features independently. The `google` provider tracks stable APIs; `google-beta` tracks the beta surface. A module needing even one beta-only feature routes that specific resource through `google-beta` while everything else defaults to stable `google`.
→ Post: `_posts/2026-02-05-terraform-google-vs-google-beta-provider.md`

### Q: What is the common mistake about using `google-beta` in Terraform?
Assuming it means "this whole configuration is experimental." In practice, production modules routinely use `google-beta` for specific, well-established resource configurations that simply haven't graduated to the stable API surface — it's a resource-by-resource API-surface selection, not a blanket risk signal.
→ Post: `_posts/2026-02-05-terraform-google-vs-google-beta-provider.md`

### Q: What is the difference between the two providers' version constraints?
They're independent — bumping the beta provider's allowed version range doesn't require touching the stable provider's constraint, and vice versa, because they genuinely track different underlying API surfaces with different release timelines.
→ Post: `_posts/2026-02-05-terraform-google-vs-google-beta-provider.md`

### Q: Why do both `google` and `google-beta` need their own `provider_meta` block?
`provider_meta` attributes API calls back to the specific module that generated them for usage telemetry. Since the same module makes calls through both providers, both need attribution wired up independently — calls via `google-beta` would go unattributed otherwise.
→ Post: `_posts/2026-02-05-terraform-google-vs-google-beta-provider.md`

### Q: What happens if you apply a beta-only feature using only the stable `google` provider?
The apply fails because the stable provider's resource schema doesn't know about the beta-only field or resource type. The fix is routing that specific resource through `google-beta` via an explicit `provider = google-beta` attribute, not converting the entire module to beta.
→ Post: `_posts/2026-02-05-terraform-google-vs-google-beta-provider.md`
---

**Last updated:** July 2026 | **Total Q&A:** 68 across Google Cloud

[Back to Q&A Index](/qa/) • [All Google Cloud posts](/gcp/)
