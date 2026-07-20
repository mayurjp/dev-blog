---
layout: post
title: "Kubernetes Key Terms: Pod, Service, Ingress and the Orchestration Vocabulary Behind Every Post"
description: "A standalone glossary of the Kubernetes terms used across this blog's orchestration, networking, storage, control-plane, and security posts — Pod, Service, Ingress, StatefulSet, kube-proxy, etcd, RBAC, HPA, NetworkPolicy, admission controllers, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: kubernetes
order: 99
tags: [kubernetes, glossary, orchestration]
---

**TL;DR:** This is the reference page for the Kubernetes vocabulary used throughout this blog's orchestration, networking, storage, and security posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

The posts in this domain assume you already know what a `Pod` or a `ReplicaSet` is, and what "the scheduler" or "the API server" means when a sentence refers to them. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other — a Service only makes sense once you know a Pod's IP is volatile, and an admission controller only matters once you know RBAC doesn't gate Pod fields.

## Core objects (workloads)

### [Pod]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})
The atomic scheduling and lifecycle unit: one or more containers that the scheduler always places together, that share a network namespace (one IP, `localhost` between them) and optionally volumes, and that live and die as one unit. The **kubelet** manages a Pod's containers on the node — restarting crashed ones per `restartPolicy` — but a Pod itself has no cross-node self-healing: when it dies, a controller creates a brand-new Pod object with a new UID and usually a new IP. The "pause" (sandbox) container, created first by the kubelet over the **CRI**, is what actually holds the shared network namespace open; your app containers then join it and never appear in your YAML.

### [ReplicaSet]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})
A controller that continuously enforces "N Pods matching this label selector should exist," recreating any that disappear. It is almost never authored directly — a **Deployment** generates it and names it by hashing the Pod template into a `pod-template-hash`, so the old and new ReplicaSets can coexist side by side mid-rollout without claiming each other's Pods. The selector (including that hash) is immutable once created; change it and the API server rejects the update.

### [Deployment]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})
A controller that sits above a ReplicaSet and orchestrates transitions between generations of Pod templates without ever dropping below an acceptable capacity. Its rollout pace is bounded by two knobs — `maxUnavailable` and `maxSurge` (both default to 25% of desired replicas) — and gated at each step by the new Pods' readiness probe, so a slow-starting container automatically slows its own rollout. The old ReplicaSet is scaled to zero but kept around, which is what makes `kubectl rollout undo` possible.

### [StatefulSet]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})
A controller for replicas that must not be interchangeable: each gets a fixed ordinal identity (`-0`, `-1`, `-2`…) with a stable DNS name and, optionally, its own persistent volume, re-issued to the same ordinal across every reschedule. Its default `podManagementPolicy: OrderedReady` creates and deletes Pods one at a time in ordinal order — the sequencing that lets you bootstrap a primary before its replicas — and it requires *you* to create a **headless Service** for the network identity, since the StatefulSet doesn't provision it. Storage is optional: Argo CD's application controller runs as a StatefulSet purely for sharding-by-ordinal with zero PVCs.

### [DaemonSet]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})
A controller that takes no `replicas` count at all — it ensures exactly one matching Pod runs on every eligible node, automatically adding one when a node joins and removing it when a node leaves. The default scheduler still binds the Pods (the DaemonSet controller stamps node affinity and hands off), and taints still apply, so reaching control-plane nodes requires an explicit `tolerations: [{operator: Exists}]`. Rolling updates are per-node, not percentage-of-a-pool, and with the default `maxSurge: 0` the old Pod is deleted before the new one starts.

### [Job and CronJob]({{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }})
A Job tracks *completions*, not liveness — its Pods run with `restartPolicy: Never`/`OnFailure` and are retried up to `backoffLimit` with exponential backoff, and the Job is "done" once `completions` Pods have exited 0. A CronJob is a thin clock around that: at every cron tick it creates a new Job from its `jobTemplate`, so every Job-level behavior (retries, `activeDeadlineSeconds`, `concurrencyPolicy`) applies underneath it unchanged. A Job's `restartPolicy` is never `Always` — that's the tell you're looking at a run-to-completion workload.

### [ConfigMap]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})
An API object holding ordinary configuration (key/value pairs or whole files) that is decoupled from any image and injected into containers at runtime as env vars or mounted files. A value injected via env var is read once at container start and frozen until restart; a value delivered via a mounted volume is kept in sync by the kubelet on its periodic interval, though the app must still notice the file changed. `immutable: true` (v1.19+) stops the kubelet watching it and protects against accidental prod edits.

### [Secret]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})
An API object for sensitive data, structurally like a ConfigMap but with different handling conventions (restricted RBAC defaults, mounted via tmpfs, not shown in `kubectl get -o wide`). Critically, it is **base64-encoded, not encrypted by default** — unless the API server is configured with an encryption provider, the value sits in etcd as plain base64 decodable by anyone with etcd access. `stringData` lets you write plaintext and have the API server encode it; `automountServiceAccountToken` and proper RBAC are what actually protect it.

### [CustomResourceDefinition and Operator]({{ '/kubernetes/custom-operators-crds-extending-kubernetes-api/' | relative_url }})
A CRD registers a brand-new API kind (e.g. `Memcached`) with the API server — giving it etcd storage, validation against an OpenAPI schema, and `kubectl`/`RBAC` treatment like any built-in object — while the Operator is the controller process (typically `controller-runtime`) that runs a `Reconcile` loop to make actual state match the CR's spec. `Owns()` on the controller is what makes it self-healing: changes to a resource it created re-trigger `Reconcile`, the same watch-what-you-created pattern a ReplicaSet uses for Pods. A CRD alone is inert schema; without a running controller, nothing reconciles it.

### [Probe (liveness, readiness, startup)]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})
Health checks the **kubelet** runs directly on each node — not the API server or a controller — polling each container via `httpGet`, `tcpSocket`, `exec`, or `grpc`. A failed **liveness** probe restarts that container in place (same Pod, same UID); a failed **readiness** probe pulls the Pod from Service traffic *without* restarting it; and a **startup** probe (GA v1.20) holds the other two off until a slow boot finishes once. The kubelet is the sole executor, which is why probes are a local node loop with no control-plane involvement.

## Networking

### [Service (ClusterIP)]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})
A permanent routing layer in front of volatile Pods: a stable virtual IP (the ClusterIP) and DNS name that clients address, while the Service tracks which Pods are currently Ready via a label selector. The ClusterIP is virtual — it lives nowhere on a NIC — and `kube-proxy` programs kernel rules on every node to DNAT packets destined for it to a real backend Pod IP. Only Ready Pods enter the routing set, so the readiness probe is the on/off switch for traffic.

### [Service types (ClusterIP, NodePort, LoadBalancer, ExternalName)]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})
The `type` field chooses how a Service is exposed. `ClusterIP` (default) is internal-only east-west traffic; `NodePort` opens a fixed port on every node; `LoadBalancer` provisions a real cloud L4 balancer + external IP; `ExternalName` is a DNS `CNAME` to something outside the cluster. One set of Pods can back multiple Services simultaneously — internal callers use a ClusterIP, the internet comes in via a LoadBalancer — without duplicating Pods.

### [CoreDNS]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})
The in-cluster DNS server that resolves a Service name to its address. Every Service gets an A/AAAA record at `<service>.<namespace>.svc.cluster.local`; the short name works because each Pod's `/etc/resolv.conf` carries a search list and `ndots:5`. That `ndots:5` is a classic latency footgun: an external name like `api.stripe.com` fires several failed cluster queries before succeeding, because any name with fewer than five dots is tried against every search domain first.

### [EndpointSlices]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})
The scaled replacement (v1.19+, replacing the legacy `Endpoints` object) that holds the list of a Service's backing Pod IPs, ports, and per-address `ready` conditions. An `EndpointSlice` controller watches Pod changes and republishes the set within milliseconds, and `kube-proxy` plus CoreDNS consume those slices to reprogram routing and DNS. "Endpoints object" is the outdated answer; modern clusters use EndpointSlices.

### [kube-proxy]({{ '/kubernetes/kubernetes-network-model-cni-kube-proxy-modes/' | relative_url }})
The per-node agent that reconciles Service/EndpointSlice objects into node-local packet-forwarding rules — it does **not** sit inline in the data path; the kernel's netfilter/IPVS subsystem does the actual DNAT. In `iptables` mode it chains per-rule random-probability matches (statistically even, not true round-robin); in `IPVS` mode it uses a real in-kernel scheduler (`rr`, `lc`, `dh`…); a newer `nftables` mode exists too. It has no role in NetworkPolicy enforcement — that's the CNI plugin's job.

### [Ingress and Ingress Controller]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})
An Ingress object declares host/path HTTP routing rules with no reconciler of its own — it does nothing until an **Ingress Controller** (e.g. ingress-nginx) watches it (matched by `ingressClassName`) and turns the rules into real proxy behavior, typically by templating and reloading an `nginx.conf`. TLS is terminated at the controller, not the backend Service, and controller-specific behavior (rate limiting, auth subrequests) is wired through `nginx.ingress.kubernetes.io/*` annotations that have no equivalent in the base Ingress spec and don't port across controllers. `pathType` (`Exact`/`Prefix`/`ImplementationSpecific`) is required in `networking.k8s.io/v1`.

### [Headless Service]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})
A Service with `clusterIP: None`, so DNS returns the individual Pod IPs instead of one virtual ClusterIP, and kube-proxy performs no load balancing. It exists so clients can address specific Pods directly — StatefulSets use it for stable per-ordinal DNS (`pod-0.service.ns.svc.cluster.local`), and stateful or primary/replica-aware workloads (and many gRPC clients doing their own balancing) need exactly that.

### [NetworkPolicy]({{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }})
An allow-list, enforced at the network layer, selecting Pods via `podSelector` and listing permitted ingress/egress. An empty `ingress: []` on a selected Pod means deny-all inbound — NetworkPolicy is default-deny-once-selected, switching a direction from "allow everything" to "allow only what's listed" the moment any policy selects the Pod. The object itself enforces nothing: a CNI plugin that implements the NetworkPolicy API (Calico, Cilium) does the actual iptables/eBPF programming, and `kube-proxy` is uninvolved. Policies are additive and never override each other — two policies selecting the same Pod union their allowed traffic.

### [CNI plugin]({{ '/kubernetes/kubernetes-network-model-cni-kube-proxy-modes/' | relative_url }})
The Container Network Interface plugin (Calico, Cilium, Flannel, …) that assigns each Pod a routable IP from the cluster Pod CIDR and builds the underlying fabric — routed or encapsulated — so Pod IPs are reachable cluster-wide, even across nodes. It is a separate layer from `kube-proxy` (which only rewrites Service-destined packets), and it is also the component that actually enforces NetworkPolicy. A cluster whose CNI doesn't implement policy accepts NetworkPolicy objects via the API and silently does nothing.

## Storage

### [Volume]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})
A directory made available to a container, drawn from many underlying sources. `emptyDir`, `configMap`, and `secret` volumes are Pod-scoped and die with the Pod — they exist to share data between same-Pod containers or project API objects into the filesystem, not to persist. Only a volume backed by a `PersistentVolumeClaim` survives a Pod being deleted and recreated; `hostPath` pins data to one node's disk, which breaks the moment the Pod is rescheduled elsewhere.

### [PersistentVolume (PV)]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})
The cluster-scoped object representing actual provisioned storage — a disk, a CSI volume, etc. — bound to a claim. In virtually all modern clusters you never hand-create one: a `StorageClass`'s provisioner (a CSI driver for EBS, GCE PD, Ceph…) creates the PV automatically the moment a matching PVC appears. Its `reclaimPolicy` (`Delete` by default for dynamic classes, or `Retain`) decides what happens to the underlying disk when the claim is deleted.

### [PersistentVolumeClaim (PVC)]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})
A namespaced *request* for storage ("I need 10Gi, `ReadWriteOnce`"), not the storage itself — the bound PV is the actual resource. A StatefulSet's `volumeClaimTemplates` stamp one PVC per ordinal (`data-cache-0`, `data-cache-1`…), each bound to its own PV, and those PVCs survive a StatefulSet scale-down by default (v1.32 stabilized an opt-in `persistentVolumeClaimRetentionPolicy` to change that). Deleting a PVC under the wrong reclaim policy is a classic way to leak disks or destroy data.

### [StorageClass and CSI]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})
A StorageClass names a provisioner (a CSI — Container Storage Interface — driver) and parameters; a PVC referencing it triggers on-demand PV creation. CSI is the standard plugin interface that lets Kubernetes consume block/file storage from any backend without in-tree driver code. The StorageClass is what makes storage a self-service, dynamic resource rather than an admin-provisioned one.

### [accessModes and reclaimPolicy]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})
`accessModes` declares how a volume may be mounted — `ReadWriteOnce` (one node, read-write), `ReadOnlyMany`, `ReadWriteMany` — and constrains scheduling: an RWO PVC can't safely back a scaled Deployment spread across nodes. `reclaimPolicy` governs lifecycle: `Delete` destroys the backing disk with the claim (the dynamic default), `Retain` orphans it for manual recovery. Both are properties of the PV, set from the StorageClass at provisioning time.

### [volumeClaimTemplates]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})
A field on a StatefulSet (and on some operators like Prometheus) that stamps one PVC per Pod ordinal at create time, each bound to its own PV rather than shared. Because the template is evaluated per ordinal, `prometheus-k8s-0` and `prometheus-k8s-1` get independent disks — the mechanism that gives StatefulSet members durable, individually-addressable storage that follows the ordinal across reschedules.

## Control plane

### [Control plane]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})
The set of components that holds and continuously reconciles the cluster's desired state, distinct from worker nodes that just run whatever they're told. It comprises etcd, kube-apiserver, kube-scheduler, and kube-controller-manager — and, notably, those components are themselves just Pods built from the same `v1.Pod` shape as anything a Deployment templates. Everything a normal Pod does (written through the API server, watched by the scheduler) is a different code path from how the control plane bootstraps itself.

### [kube-apiserver]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})
The only component everything else talks to — a validating, authenticating front door onto etcd, not a separate store. It serves the REST API, runs admission plugins (including Pod Security Admission), and is what the scheduler, controllers, kubelets, and every `kubectl` command reconcile against. If etcd (its backing store) is down, the API server fails reads/writes and the rest of the control plane cascades.

### [etcd]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})
The distributed key-value store that is the single source of truth for all cluster state — every object, every binding, every lease lives here and only here. The API server is the gatekeeper onto it; no other control-plane component (scheduler, controller-manager) touches etcd directly. A single unhealthy etcd static pod can make the whole control plane appear broken even though the other component files never changed.

### [kube-scheduler]({{ '/kubernetes/advanced-scheduling-topology-spread-affinity-anti-affinity/' | relative_url }})
The control-plane component that decides *where* a Pod runs, watching for unscheduled Pods and writing a node binding through the API server. Its `podtopologyspread` and `interpodaffinity` plugins evaluate placement constraints once, at admission time — they do not re-balance already-running Pods afterward, which is the gap `descheduler` exists to close. It is itself a static Pod during bootstrap.

### [kube-controller-manager]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})
The process running the built-in reconcile loops — Deployment, ReplicaSet, StatefulSet, CronJob, namespace, service-account, and (with `kube-scheduler`) the cluster's steady-state enforcement. Each loop watches its resource type and drives actual state toward spec, the same read-compare-converge pattern a custom Operator reimplements for its own CRDs. It is also a static Pod during bootstrap.

### [kubelet]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})
The per-node agent that manages Pods on its machine: it talks to the container runtime over the **CRI** (containerd or CRI-O; Docker was removed via dockershim in v1.24), starts the pause container first to hold the network namespace, runs the probes, and restarts crashed containers per `restartPolicy`. It also reads ConfigMaps/Secrets to inject them, and on control-plane nodes it runs a second pod source — a file directory — to start the control plane's own components as static Pods.

### [Static pod]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})
A Pod whose definition comes from a file on a node's disk (e.g. `/etc/kubernetes/manifests/`) rather than the API server. The kubelet watches that path directly and starts/stops containers to match, with no scheduler decision and no API server round-trip — precisely how the control plane bootstraps itself, breaking the chicken-and-egg where you'd otherwise need a running API server to start the API server. Once the API server is up, the kubelet registers a read-only "mirror" Pod so `kubectl` can see it; editing that mirror does nothing, because the file is the source of truth.

### [Admission controller / Pod Security Admission]({{ '/kubernetes/pod-security-standards-admission-controllers/' | relative_url }})
A plugin in the API server that intercepts create/update requests before they're persisted, either mutating (e.g. LimitRanger injecting defaults) or validating (rejecting). Pod Security Admission is a built-in validating plugin, compiled into the API server, that evaluates every Pod against one of three fixed Pod Security Standards levels driven entirely by `pod-security.kubernetes.io/*` labels on the namespace — the replacement for the removed PodSecurityPolicy (gone in 1.25). It has `enforce`/`audit`/`warn` modes that run independently, and unlike a custom webhook it has no `failurePolicy` availability risk because it lives inside the API server itself.

## Security & access

### [RBAC (Role, ClusterRole, RoleBinding, ClusterRoleBinding)]({{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }})
Authorization split into two axes: *what's allowed* (a `Role` namespaced, or `ClusterRole` cluster-wide — a list of `apiGroups`/`resources`/`verbs`) and *who gets it* (a `RoleBinding` namespaced, or `ClusterRoleBinding` cluster-wide, pointing a subject at a Role/ClusterRole). RBAC has no `deny` rule — every grant is purely additive, so least-privilege must be the default posture. A `ClusterRole` referenced by a `RoleBinding` is scoped down to that one namespace at bind time, and built-in roles (`view`/`edit`/`admin`) are continuously extended by an aggregation controller that merges in any ClusterRole carrying the right `aggregate-to-*` label.

### [ServiceAccount]({{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }})
The identity a Pod authenticates to the API server as — every Pod runs as one, and every API request carries its token through an authorization check. In a multi-container Pod, all containers share the Pod's `serviceAccountName` (set on the Pod spec, not per container), so a sidecar needing a different API identity needs its own Pod. RBAC grants are bound to the ServiceAccount, which is why "who can this workload talk to the API as" is a distinct question from "who can create this Pod."

### [Pod Security Standards]({{ '/kubernetes/pod-security-standards-admission-controllers/' | relative_url }})
Three fixed, non-customizable policy levels — `privileged` (no restrictions), `baseline` (blocks the most obviously dangerous fields), and `restricted` (a hardened run-as-unprivileged posture requiring `runAsNonRoot`, `allowPrivilegeEscalation: false`, dropping all capabilities, and a `RuntimeDefault` seccomp profile). Unlike RBAC (which controls *who* creates a Pod), PSS constrains *what fields the Pod spec may contain* once created — closing the gap where an RBAC-permitted user requests `privileged: true`. The level is set purely by namespace labels, with no separate policy object or binding step.

### [SealedSecrets]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})
A GitOps-safe way to commit secrets: `kubeseal` encrypts the value client-side (hybrid AES-GCM + RSA-OAEP) against the in-cluster controller's public key, producing ciphertext that is safe to put in git because decryption needs the private key that never leaves the cluster. The encryption binds the ciphertext to the exact namespace/name (via the RSA-OAEP `label` parameter) — copy-pasting the committed YAML into another namespace cryptographically fails to decrypt, by design.

### [External Secrets Operator]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})
A different trust model: the committed `ExternalSecret` object only *references* a key in an external store (AWS Secrets Manager, GCP Secret Manager, Vault), and the operator fetches the live value on a `refreshInterval` and writes it into a real `Secret` at runtime — the plaintext's home is always the external store, never git or etcd's source of truth. Unlike SealedSecrets, it has a live recurring sync, so a credential rotated upstream propagates within one refresh window without a new git commit.

### [Validating and Mutating webhook]({{ '/kubernetes/pod-security-standards-admission-controllers/' | relative_url }})
A custom admission mechanism — a `ValidatingWebhookConfiguration` or `MutatingWebhookConfiguration` — that points the API server at an external HTTPS service for requests matching its rules. The cluster runs all mutating webhooks before validating ones, so a mutation can still be checked against policy afterward; `failurePolicy: Fail` means a down webhook rejects matching requests cluster-wide, while `Ignore` fails open. Namespace-scoping via `namespaceSelector` (the same label-driven opt-in pattern PSA uses) keeps it from running unconditionally.

## Scaling & multi-tenancy

### [HorizontalPodAutoscaler (HPA)]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})
A control loop, not a config value: every sync period (default 15s) it reads a metric for the Pods under `scaleTargetRef` and computes `desiredReplicas = ceil(currentReplicas * (currentMetricValue / desiredMetricValue))`, then patches the target's `replicas` field — the same field `kubectl scale` touches. It can only scale what `scaleTargetRef` names (a Deployment/ReplicaSet/StatefulSet) and never creates Pods itself. CPU-utilization scaling is undefined without a `resources.requests.cpu` on the target, and scale-down carries a 300s default stabilization window while scale-up is near-immediate.

### [metrics-server]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})
The cluster add-on (powering `kubectl top` and feeding the HPA) that scrapes every kubelet's `/stats/summary` and exposes it through the `metrics.k8s.io` API. The HPA controller reads resource metrics from it; for anything else (queue depth, RPS) the HPA reads `custom.metrics.k8s.io` or `external.metrics.k8s.io` from a separate adapter. Without a healthy metrics-server, the HPA has no signal and autoscaling stalls cluster-wide.

### [ResourceQuota]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})
A namespace-scoped object that caps the namespace's *total* resource consumption and object counts (PVCs, LoadBalancer Services, Pods) against a `hard` ceiling, rejecting any new object that would push the sum over it — at admission time, not by throttling afterward. Its object-count axis (`services.loadbalancers: "2"`, `services.nodeports: "0"`) is independent of compute limits, and a `scopeSelector` can target a subset (e.g. only `cluster-services` PriorityClass Pods). A namespace with none is fully unbounded by default.

### [LimitRange]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})
A namespace-scoped object that fills per-Pod/per-container gaps at admission: it sets `min`/`max` bounds and — critically — `default`/`defaultRequest` values injected into any Pod that omitted them, *before* ResourceQuota evaluates it. That ordering is what makes "every Pod must set resources or be rejected" survivable, since a missing block would otherwise violate a quota's compute requirement. Like ResourceQuota, it only acts at admission time and never touches already-running Pods.

### [topologySpreadConstraints]({{ '/kubernetes/advanced-scheduling-topology-spread-affinity-anti-affinity/' | relative_url }})
A Pod-spec field that spreads replicas across topology domains (zones, nodes) with a `maxSkew` and a `whenUnsatisfiable` of `DoNotSchedule` (hard) or `ScheduleAnyway` (soft preference). The scheduler enforces it *once*, at placement time — a later node/zone failure that reschedules Pods elsewhere can skew the distribution, and nothing in the base cluster re-checks it, which is exactly the gap `descheduler`'s `RemovePodsViolatingTopologySpreadConstraint` plugin closes.

### [Pod (anti-)affinity]({{ '/kubernetes/advanced-scheduling-topology-spread-affinity-anti-affinity/' | relative_url }})
Scheduling preferences/constraints expressed as `podAffinity`/`podAntiAffinity` with `requiredDuringSchedulingIgnoredDuringExecution` (hard) or `preferredDuringSchedulingIgnoredDuringExecution` (soft) rules against other Pods' labels. Like topology spread, they're evaluated only at admission time — a rule "don't co-locate two replicas on one node" can be violated later by a cordon-and-reschedule, and `descheduler`'s `RemovePodsViolatingInterPodAntiAffinity` plugin exists to evict the lowest-priority offender and let the scheduler redo placement.

### [descheduler]({{ '/kubernetes/advanced-scheduling-topology-spread-affinity-anti-affinity/' | relative_url }})
A separate SIG-maintained controller (run as a CronJob/Deployment) that re-implements the *evaluation* of topology-spread and affinity constraints against already-running Pods and **evicts** the violators, handing them back to kube-scheduler to re-place — it never places Pods itself. Its check runs on a polling interval (not continuously), eviction is priority-aware (lowest `priorityClassName` first), and it only re-enforces `DoNotSchedule` (hard) constraints by default, matching the strictness the scheduler itself applied.

### [Namespace and multi-tenancy]({{ '/kubernetes/multi-tenancy-namespace-isolation-quotas-netpol-at-scale/' | relative_url }})
A Namespace is a naming and API/RBAC scoping boundary — it enforces neither a compute ceiling nor network isolation on its own. Real multi-tenancy composes a `ResourceQuota` (compute/object cap) plus a `LimitRange` (per-Pod defaults) with a default-deny `NetworkPolicy` (cross-tenant traffic block), three independent per-namespace objects that must be applied to *every* tenant namespace; a new namespace created without them starts fully unbounded and fully open. Quota rejection is admission-time, and `ingress: []` differs by one character from `ingress: [{}]` (deny-all vs allow-all) — a common footgun.

### [priorityClassName / PriorityClass]({{ '/kubernetes/advanced-scheduling-topology-spread-affinity-anti-affinity/' | relative_url }})
A PriorityClass assigns a numeric priority that influences both scheduling (higher-priority Pods preempt lower) and descheduler eviction order (lower priority is evicted first). Unset priority defaults to zero, making a critical Pod indistinguishable from a batch job when descheduler picks an eviction candidate. A `scopeSelector`-based ResourceQuota can also reserve budget for a `cluster-services` PriorityClass regardless of which namespace its Pods land in.

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.
