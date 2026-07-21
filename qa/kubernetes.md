---
layout: page
title: "Kubernetes Interview Questions: 109 Real-World Q&A from Production Manifests"
description: "109 interview-ready Kubernetes questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/kubernetes/
---

Bite-sized, standalone interview questions and answers for Kubernetes. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">109</span></strong> questions shown. Filter by keyword or difficulty below.</p>

<div class="qa-toolbar" id="qa-toolbar">
  <input type="text" id="qa-search" placeholder="Filter questions by keyword…" aria-label="Filter questions" />
  <button type="button" id="qa-expand-all" class="qa-expand-btn">Expand all</button>
  <div class="qa-diff-buttons" id="qa-diff-buttons">
    <button type="button" data-diff="all" class="active">All</button>
    <button type="button" data-diff="Beginner">Beginner</button>
    <button type="button" data-diff="Intermediate">Intermediate</button>
    <button type="button" data-diff="Expert">Expert</button>
  </div>
</div>

## Topic: Cluster architecture: control plane vs. node, and how the control plane bootstraps itself (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the chicken-and-egg problem with bootstrapping a Kubernetes cluster? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The scheduler needs a running API server to record placement decisions, and the API server needs etcd to store state — but none of them exist yet. You can't use normal scheduling to start the very first control-plane component because the scheduler that would do the placement is itself one of those components.

<p class="qa-link">[Full post →]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does kubeadm break the bootstrap circular dependency? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
kubeadm writes Pod manifest YAML files directly to `/etc/kubernetes/manifests/` on the control-plane node. The kubelet has a separate **file source** (`pkg/kubelet/config/file.go`) that polls that directory and starts whatever Pod specs it finds — completely bypassing the scheduler and API server.

<p class="qa-link">[Full post →]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is a "mirror Pod" and why can't you `kubectl edit` it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Once the API server is up, the kubelet registers a read-only mirror of each static pod it's running so `kubectl get pods -n kube-system` can see it. Editing or deleting the mirror via the API changes nothing — the kubelet recreates it from the local file, which remains the source of truth.

<p class="qa-link">[Full post →]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to the rest of the control plane if etcd's static pod goes down? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The API server loses its backing store and starts failing reads/writes, which cascades to the scheduler and controller-manager — both of which depend on the API server. Even though their own manifest files never changed, a single unhealthy etcd pod can make the entire control plane appear broken.

<p class="qa-link">[Full post →]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the kubelet's file-based pod source differ structurally from the API-server pod source? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The file source (`sourceFile`) feeds Pod objects straight into a Go channel (`updates chan<- sourceUpdate`) by polling a directory on disk. The API-server source uses informer/watch machinery over the network. These are two completely separate code paths inside the kubelet, not one path with a special case bolted on.

<p class="qa-link">[Full post →]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the common mistake when troubleshooting a static pod that won't start? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Editing the mirror Pod via `kubectl edit` in `kube-system` and expecting it to take effect. The real source of truth is the YAML file on disk at `/etc/kubernetes/manifests/`, not the API object. Also, assuming the kube-apiserver manifest looks healthy means etcd is healthy — kube-apiserver depends on etcd, not the other way around.

<p class="qa-link">[Full post →]({{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }})</p>
  </div>
</div>

## Topic: Pod (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Kubernetes schedule Pods, not bare containers? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Sidecars need the same node, the same IP, and the same lifecycle as the container they sit next to. A Pod is the smallest scheduling unit — it guarantees co-location on one node, shared network namespace (so containers reach each other over `127.0.0.1`), and shared lifecycle managed by one kubelet.

<p class="qa-link">[Full post →]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the pause container's actual role in a Pod? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The pause container is a tiny infrastructure container the kubelet creates first. It holds the network namespace (and IPC namespace) open; all subsequent containers join that same namespace. It never appears in your YAML — you only see it in `crictl ps` or `docker ps` on the node.

<p class="qa-link">[Full post →]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `securityContext` at the Pod level differ from `securityContext` at the container level? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Pod-level `securityContext` (`fsGroup`, `runAsUser`, `runAsNonRoot`) shapes the whole sandbox and volume ownership. Container-level `securityContext` (`allowPrivilegeEscalation`, `capabilities`, `readOnlyRootFilesystem`) applies per-container kernel capabilities. Confusing the two scopes is one of the most common manifest review mistakes.

<p class="qa-link">[Full post →]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to a Pod's IP when it's rescheduled? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A rescheduled Pod is a completely new Pod object — new UID, new IP. Nothing relocates the existing Pod; a controller (Deployment, StatefulSet, DaemonSet) creates a brand-new Pod, which the scheduler places independently, usually on a different node.

<p class="qa-link">[Full post →]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When would you enable `shareProcessNamespace: true` on a Pod? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When a debugging sidecar needs to see every container's processes via `ps` and `/proc/$pid/root`. The tradeoff: the pause container becomes PID 1, so any container assuming it is PID 1 (e.g., one running `systemd`) can misbehave or refuse to start.

<p class="qa-link">[Full post →]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with `terminationGracePeriodSeconds` being left at its default? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The 30-second default is a guess that fits nothing in particular. A stateless gRPC service might shut down in 5 seconds; a database with a flush cache could need 120. Leaving it untuned means every rollout or scale-down takes longer than it should, or kills a process mid-shutdown.

<p class="qa-link">[Full post →]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How did the removal of dockershim in Kubernetes v1.24 affect Pods? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The kubelet no longer talks to Docker Engine — it speaks CRI directly to containerd or CRI-O. Docker-built images still run fine (they're OCI-compliant); only Docker's runtime control path was removed. Any tooling that relied on `docker` CLI inside a Pod or node broke.

<p class="qa-link">[Full post →]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }})</p>
  </div>
</div>

## Topic: Deployment / ReplicaSet (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does the Deployment controller actually do that the ReplicaSet controller doesn't? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The Deployment controller manages transitions between ReplicaSet generations — creating a new ReplicaSet, scaling it up while scaling the old one down, bounded by `maxUnavailable`/`maxSurge`. The ReplicaSet controller's job is narrower: ensure exactly N Pods matching its selector exist right now.

<p class="qa-link">[Full post →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `pod-template-hash` prevent two ReplicaSet generations from claiming each other's Pods during a rollout? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each ReplicaSet's selector only matches Pods carrying its own hash value. A v1 ReplicaSet won't claim a v2 Pod (wrong hash), and vice versa. This is what lets both generations coexist mid-rollout without either controller accidentally deleting or recreating the other's Pods.

<p class="qa-link">[Full post →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if you set `maxUnavailable: 0` and `maxSurge: 0`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The rollout becomes impossible — you can't create a new Pod until an old one is deleted, but you can't delete an old one until a new one is ready. This is a deadlock, not a safety measure. In practice, `maxUnavailable: 0` with `maxSurge: 1` achieves zero-downtime updates.

<p class="qa-link">[Full post →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the rollout's pace depend on the new Pod's readiness probe? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A new Pod isn't counted as "available" until it passes its readiness probe. If the v2 container is slow to start, the Deployment controller stalls at its current step — it won't surge another v2 Pod or drain another v1 Pod until the current one passes. A slow probe slows the rollout; a missing probe lets it barrel ahead blindly.

<p class="qa-link">[Full post →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can you change `spec.selector` on an existing Deployment? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No — `apps/v1` makes the selector immutable after creation. If you need a different selector, you must delete and recreate the Deployment. This is why selectors are chosen conservatively up front, not as an afterthought.

<p class="qa-link">[Full post →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with the default `maxUnavailable` and `maxSurge` values? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Both default to 25% of desired replicas. An un-tuned Deployment can go 25% over capacity and 25% under capacity simultaneously during a routine update — significant for a large replica count, and invisible if you never explicitly set these fields.

<p class="qa-link">[Full post →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the difference between a Deployment and a ReplicaSet in terms of ownership and visibility? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You almost never author a ReplicaSet directly. The Deployment generates it, names it by hashing the pod template, and owns it via `ownerReferences`. Running `kubectl get rs` after a Deployment change is the fastest way to see the reconcile loop working in real time.

<p class="qa-link">[Full post →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})</p>
  </div>
</div>

## Topic: Service (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a Service learn a new Pod's IP after a crash and replacement? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The EndpointSlice controller watches the API for Pod changes and republishes the Service's backing address list. Modern Kubernetes uses `EndpointSlices` (not the legacy `Endpoints` object) — sliced objects that scale better. `kube-proxy` and CoreDNS consume those slices to reprogram routing.

<p class="qa-link">[Full post →]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does a Pod receive Service traffic the instant it starts? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. A Pod's IP is only added to the Service's routing set after its readiness probe passes. A booting or unhealthy Pod is deliberately excluded from traffic — remove the readiness probe and you route requests into cold or broken Pods.

<p class="qa-link">[Full post →]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Where does a ClusterIP actually "live" on the network? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a virtual IP not bound to any NIC. `kube-proxy` programs kernel routing rules (iptables/IPVS/nftables) so that any packet destined for the ClusterIP is DNAT'd to a real Pod IP:port. No process ever listens on the ClusterIP itself — it's pure packet rewriting at the kernel level.

<p class="qa-link">[Full post →]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is a headless Service, and when would you use one? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A headless Service (`clusterIP: None`) returns individual Pod IPs in DNS instead of one virtual IP. Clients do their own load balancing. You use it for StatefulSets (stable per-pod DNS like `pod-0.cache.ns.svc`), databases with primary/replica awareness, or gRPC clients that manage connections themselves.

<p class="qa-link">[Full post →]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `ndots:5` in a Pod's `/etc/resolv.conf` cause DNS latency for external lookups? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Any name with fewer than 5 dots is tried against every search domain first (e.g., `api.stripe.com.default.svc.cluster.local`, `api.stripe.com.svc.cluster.local`, etc.) before falling through to the actual external query. For external FQDNs, this means several failed cluster-internal DNS lookups before the real answer returns.

<p class="qa-link">[Full post →]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: A client can't reach a Service even though Pods are running. What's the first thing to check? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Two things, in order: (1) selector/label mismatch — does the Service's `selector` exactly match the Pod labels? A typo means zero endpoints. (2) Readiness — are the Pods actually passing their readiness probe? Running ≠ Ready; a failing probe keeps a Pod out of the endpoint set.

<p class="qa-link">[Full post →]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do iptables mode and IPVS mode differ for kube-proxy load balancing? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
In iptables mode (default), traffic is sent to a randomly-chosen endpoint using probability rules — statistically even, not sequential. IPVS mode offers real algorithms (round-robin, least-connection, etc.), which is why large clusters prefer IPVS. Newer clusters may also use nftables mode.

<p class="qa-link">[Full post →]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})</p>
  </div>
</div>

## Topic: ConfigMap / Secret (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does env-var injection differ from volume-mount injection when a ConfigMap is updated? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A value injected via `env.valueFrom.configMapKeyRef` is read once at container start and frozen — editing the ConfigMap does nothing until the Pod restarts. A value delivered via a mounted volume is kept in sync by the kubelet's periodic sync interval — the file on disk updates, but the application must notice the change itself.

<p class="qa-link">[Full post →]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Is a Kubernetes Secret actually encrypted at rest by default? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. A Secret is base64-*encoded*, not encrypted. Unless the cluster admin configures `--encryption-provider-config` with a real provider (`aescbc`, `aesgcm`, `secretbox`), Secret data sits in etcd as plain base64. "It's a Secret so it's encrypted" is a common and wrong assumption.

<p class="qa-link">[Full post →]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `immutable: true` on a ConfigMap actually do, and why would you use it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It tells the API server the object will never change again. The kubelet stops watching it for updates (less API server load at scale) and it prevents accidental `kubectl edit` in production. The common pattern is naming the ConfigMap with a content hash and rolling the Deployment on every change.

<p class="qa-link">[Full post →]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is the `stringData` field used in Secret manifests instead of pre-encoding to base64? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`stringData` lets you write plaintext in the manifest; the API server base64-encodes it into `.data` on write. You never hand-encode a Secret in a real manifest. The field is write-only — it's not present when you read the object back.

<p class="qa-link">[Full post →]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why can't you pass a large, structured YAML document as an environment variable to a container? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Environment variables are flat key-value strings — a multi-hundred-line YAML with Go template syntax inside it (`<<.GroupBy>>`) is structurally impossible to pass as one. This is the practical reason ConfigMaps support volume mounting at all, not just env injection.

<p class="qa-link">[Full post →]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with using Secret objects for non-password operational config? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A Secret's RBAC defaults and `kubectl get -o wide` visibility make it a reasonable choice for operational config that shouldn't be world-readable via `kubectl get configmap -o yaml` — but it's not encrypted at rest unless you've configured etcd encryption. Teams often assume Secret = encrypted, which it isn't by default.

<p class="qa-link">[Full post →]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})</p>
  </div>
</div>

## Topic: Probes (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the difference between a failed liveness probe and a failed readiness probe? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A failed liveness probe makes the kubelet restart the container in place (same Pod, same UID, same IP). A failed readiness probe does *not* restart anything — the container keeps running, but the Pod is pulled out of Service traffic until it passes again. Two completely different outcomes from two different failure signals.

<p class="qa-link">[Full post →]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What role does `startupProbe` play, and when is it unnecessary? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`startupProbe` holds off liveness and readiness checks until it succeeds once. This gives a slow-booting app (large JVM, big cache warm) a long runway without being killed by premature liveness checks. For a small, fast-starting Go binary, the normal `initialDelaySeconds` plus `failureThreshold` already gives enough slack — a `startupProbe` isn't always needed.

<p class="qa-link">[Full post →]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Who executes the probe — the API server, the kubelet, or a controller? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The kubelet, directly, on each node where the Pod runs. It's a local polling loop, not a control-plane operation. No API server round-trip is involved in the probe itself.

<p class="qa-link">[Full post →]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why do metrics-server's liveness and readiness probes hit different endpoints? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`/readyz` answers "has the metrics cache finished warming up?" — it depends on initialization. `/livez` answers "is the process alive?" — a fundamentally different question. A single shared `/health` endpoint conflates the two and risks restart loops triggered by conditions that only affect readiness.

<p class="qa-link">[Full post →]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if you omit the liveness probe entirely? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The kubelet's only health signal becomes the process exit code. A container that is alive but wedged — deadlocked event loop, exhausted connection pool, stuck thread — stays running forever, eating every request routed to it, with no automatic restart.

<p class="qa-link">[Full post →]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does metrics-server use `maxUnavailable: 0` in its rollout strategy? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
metrics-server feeds the HPA and `kubectl top`. A gap during rollout means cluster-wide autoscaling stalls. `maxUnavailable: 0` accepts a slower rollout in exchange for zero gaps in metrics availability — the tradeoff is correctness over speed.

<p class="qa-link">[Full post →]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the common mistake with `initialDelaySeconds` on a liveness probe? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Setting it too short for a slow-starting app causes premature restarts; setting it too long delays detection of genuine post-boot deadlocks. The real fix for slow boots is a `startupProbe` with a generous `failureThreshold × periodSeconds` window, not inflating `initialDelaySeconds` on the liveness probe.

<p class="qa-link">[Full post →]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})</p>
  </div>
</div>

## Topic: Volumes / PV / PVC (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why doesn't `emptyDir` survive a Pod restart? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`emptyDir` is scoped to the Pod's lifetime — it's created when the Pod is scheduled on a node and deleted when the Pod is removed. If the Pod is rescheduled to a different node, the new Pod gets a fresh `emptyDir`. It's designed for inter-container data sharing within a single Pod, not persistence.

<p class="qa-link">[Full post →]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between a PVC and a PV? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A PVC is a namespaced *request* for storage (e.g., "I need 10Gi ReadWriteOnce"). A PV is the actual storage resource, cluster-scoped, usually created on demand by a StorageClass's CSI provisioner. The PVC binds to the PV; the PV outlives any individual Pod that uses it.

<p class="qa-link">[Full post →]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does a PVC's `reclaimPolicy` control, and why is the default dangerous? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`Delete` (the default for most dynamic-provisioning classes) destroys the underlying cloud disk when the PVC is deleted. `Retain` orphans the disk for manual admin cleanup. Deleting a PVC on the `Delete` policy without checking what data lives on it is a classic way to destroy production data or leak cloud disks forever.

<p class="qa-link">[Full post →]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Prometheus in kube-prometheus default to `emptyDir` for its TSDB? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's opt-in persistence — without a `storage.volumeClaimTemplate`, the monitoring stack's own metrics history doesn't survive a Pod reschedule. "Prometheus obviously persists its data" is exactly the assumption that costs someone their metrics history during a routine node drain.

<p class="qa-link">[Full post →]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if you use a `hostPath` volume and the Pod is rescheduled? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The data stays pinned to the original node. The new Pod on a different node gets an empty directory — the data never left the old machine. `hostPath` is only safe when the Pod is guaranteed to always run on the same node (DaemonSets), not general-purpose workloads.

<p class="qa-link">[Full post →]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why would you use `emptyDir` with `medium: Memory`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It creates a tmpfs mount — RAM-backed, faster than disk, and counted against the Pod's memory limit. Use it for plugin scratch space or temporary caches that benefit from RAM speed. The gotcha: memory usage looks higher than the process's own footprint because these files are in the Pod's memory accounting.

<p class="qa-link">[Full post →]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with a `ReadWriteOnce` PVC on a Deployment? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ReadWriteOnce` means one node can mount it at a time. If a Deployment with multiple replicas all try to mount the same `ReadWriteOnce` PVC, only one succeeds — the rest stay `Pending`. `ReadWriteOncePod` (a newer access mode) restricts it further to a single Pod, not just a single node.

<p class="qa-link">[Full post →]({{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }})</p>
  </div>
</div>

## Topic: StatefulSet (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does a StatefulSet give you that a Deployment doesn't? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Stable, per-replica ordinal identity (`app-0`, `app-1`, `app-2`) with corresponding stable DNS entries (`app-0.app.ns.svc.cluster.local`) and, optionally, per-ordinal persistent volumes that follow the same replica across reschedules. Deployments produce anonymous, fungible Pods; StatefulSets produce named, distinguishable ones.

<p class="qa-link">[Full post →]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does a StatefulSet require a headless Service? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The headless Service (`clusterIP: None`) is what gives each Pod its own DNS entry — DNS returns individual Pod IPs instead of one virtual IP. Without it, Pods still get created, but they never get the stable `<pod>.<service>` DNS names that are the entire reason to use a StatefulSet.

<p class="qa-link">[Full post →]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is `OrderedReady` pod management policy, and why does it matter for databases? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Pods are created and deleted one at a time, in ordinal order, each waiting to reach Ready before the controller touches the next. This sequencing is how you safely bootstrap a primary before its replicas, or roll a cluster node-by-node instead of all at once.

<p class="qa-link">[Full post →]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Do PVCs created by a StatefulSet's `volumeClaimTemplates` get deleted when the StatefulSet is scaled down? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No — by default, deleting or scaling down a StatefulSet does *not* delete its PVCs. This is deliberate: data safety is considered more valuable than automatic cleanup. An opt-in `persistentVolumeClaimRetentionPolicy` field exists if you want automatic cleanup.

<p class="qa-link">[Full post →]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Argo CD's application controller use a StatefulSet despite having zero persistent storage? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The StatefulSet exists purely for stable, predictable ordinal identity — each replica's ordinal becomes a shard number for cluster-watching assignments. A Deployment's replicas have no durable ordinal to shard by, so a rescheduled Pod could silently "become" a different shard than the one it was covering.

<p class="qa-link">[Full post →]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with `ARGOCD_CONTROLLER_REPLICAS` being out of sync with `spec.replicas`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The application controller can't introspect its own StatefulSet's replica count from inside the Pod. If you bump `spec.replicas` without updating the `ARGOCD_CONTROLLER_REPLICAS` env var, the sharding math silently uses the old count — a real operational gotcha.

<p class="qa-link">[Full post →]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a StatefulSet scale down? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
In reverse ordinal order, one Pod at a time. If you scale from 3 to 1, `app-2` is deleted first, then `app-1`, each waiting to fully terminate before the next deletion starts.

<p class="qa-link">[Full post →]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})</p>
  </div>
</div>

## Topic: DaemonSet (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why can't you just use a Deployment with `replicas: 10` for a per-node workload? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Nothing guarantees the scheduler spreads exactly one Pod per node — two Pods could land on the same node while another gets zero. When you add an 11th node, a Deployment has no idea it exists. A DaemonSet automatically adds a Pod to new nodes and removes it from departed ones.

<p class="qa-link">[Full post →]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does a DaemonSet bypass the scheduler? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No — that's pre-1.17 behavior. The DaemonSet controller creates each Pod with node affinity, and the default scheduler typically takes over to bind it to the target node. The controller creates Pods; the scheduler does the binding.

<p class="qa-link">[Full post →]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does node-exporter use `tolerations: [{operator: Exists}]`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Without it, the DaemonSet silently skips tainted nodes — including the control plane, which absolutely still needs its CPU/memory/disk monitored. The blanket toleration is what gets the monitoring Pod onto every node, even those repelled by default taints.

<p class="qa-link">[Full post →]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does node-exporter use `hostNetwork: true` and `hostPID: true`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Its job is reading the node's real network interfaces and process table. These fields deliberately break the Pod network and PID isolation that normally protects it from the host — a necessary exception for a node-level monitoring agent.

<p class="qa-link">[Full post →]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a DaemonSet rolling update differ from a Deployment rolling update? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A DaemonSet updates one node's Pod at a time (controlled by `maxUnavailable`). With `maxSurge` at its default of 0, the old Pod is deleted *before* the new one starts — there's never two copies on the same node. A Deployment can surge Pods above the target count.

<p class="qa-link">[Full post →]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does node-exporter's `kube-rbac-proxy` sidecar bind to `127.0.0.1:9101` instead of directly exposing port 9100? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The actual metrics exporter is intentionally unreachable from outside the Pod. The `kube-rbac-proxy` sidecar adds TLS and RBAC authentication in front of those metrics, and exposes `hostPort: 9100` — splitting "collect the data" from "authenticate access to the data" into two containers sharing the Pod's localhost.

<p class="qa-link">[Full post →]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to a DaemonSet Pod when its node is cordoned? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The Pod is evicted — there's nowhere else to go since DaemonSet Pods are node-specific. No replacement is scheduled on a different node. A Deployment, by contrast, would reschedule the Pod elsewhere.

<p class="qa-link">[Full post →]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})</p>
  </div>
</div>

## Topic: Job / CronJob (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why can't a Job Pod have `restartPolicy: Always`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`restartPolicy: Always` is for long-lived workloads — the kubelet always restarts the container, so the process never "completes." A Job tracks *completions* (Pods that exit 0), so the restart policy must be `Never` or `OnFailure` to let a Pod actually finish.

<p class="qa-link">[Full post →]({{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `concurrencyPolicy: Forbid` do in a CronJob? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When a tick fires while the previous Job is still running, the new tick is skipped entirely. This is a correctness decision for workloads that mutate shared state — two concurrent descheduler passes, for example, could both evict the same Pods at once, compounding disruption.

<p class="qa-link">[Full post →]({{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to completed Job objects by default? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
They stick around in etcd until manually cleaned up or garbage-collected by `successfulJobsHistoryLimit`/`failedJobsHistoryLimit` on the CronJob (defaults: 3 and 1). A high-frequency CronJob (every 2 minutes) accumulates finished Job objects fast — production clusters need to actually monitor that history limit.

<p class="qa-link">[Full post →]({{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a CronJob relate to a Job structurally? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The CronJob's `jobTemplate.spec` is structurally identical to a standalone Job's `spec` — same `priorityClassName`, `restartPolicy`, `livenessProbe`, `securityContext`. The CronJob adds exactly one thing: `schedule` plus `concurrencyPolicy`. It's a Job with a clock around it, not a separate execution model.

<p class="qa-link">[Full post →]({{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `backoffLimit` control in a Job, and what happens when it's exceeded? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It caps the number of times the Job controller creates a replacement Pod after failures (default: 6). Once `backoffLimit` is hit, the Job is marked as failed and the controller stops creating new Pods. Exponential backoff is applied between retries.

<p class="qa-link">[Full post →]({{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `priorityClassName: system-cluster-critical` matter specifically for the descheduler? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The descheduler evicts other Pods to fix scheduling — if its own Pod got preempted under node pressure, the thing meant to relieve pressure would be the first casualty. A high priority class protects the workload from being the first to be evicted.

<p class="qa-link">[Full post →]({{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with `startingDeadlineSeconds` being unset? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
If the CronJob controller is down across several scheduled ticks, it doesn't replay every missed tick on restart by default — but it also might replay them all at once if the window isn't bounded. Setting `startingDeadlineSeconds` bounds how late a missed tick is still allowed to start, preventing a flood of catch-up Jobs.

<p class="qa-link">[Full post →]({{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }})</p>
  </div>
</div>

## Topic: HPA (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What formula does the HPA controller use to decide replica count? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`desiredReplicas = ceil(currentReplicas × (currentMetricValue / desiredMetricValue))`. It polls a metrics API (typically metrics-server) every sync period (default 15s), computes this ratio, and patches the target Deployment's `spec.replicas`.

<p class="qa-link">[Full post →]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is `resources.requests.cpu` required for CPU-based HPA scaling to work? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
"70% utilization" means 70% *of the request*. An unset request makes the percentage undefined — the HPA literally has no baseline to compute utilization against.

<p class="qa-link">[Full post →]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do scale-up and scale-down differ in terms of stabilization? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Scale-down has a default 300-second stabilization window (avoid flapping right before the next spike). Scale-up defaults to near-immediate. A manifest that overrides `scaleUp.stabilizationWindowSeconds: 0` is choosing instant reaction over default caution.

<p class="qa-link">[Full post →]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does bank-of-anthos set `requests.cpu` and `limits.cpu` to the identical value (250m)? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
This creates Guaranteed QoS for the CPU dimension — it makes "70% utilization" mean the same, stable thing on every replica instead of drifting with however much headroom `limits` happened to leave above `requests`.

<p class="qa-link">[Full post →]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `policies: [{type: Percent, value: 100, periodSeconds: 5}]` on scale-up behavior do? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It caps growth at doubling the replica count every 5 seconds. Even with `stabilizationWindowSeconds: 0`, the *rate* of scale-up is still bounded — a guard against a metrics blip causing `maxReplicas` to be hit in one step.

<p class="qa-link">[Full post →]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with using the deprecated `autoscaling/v2beta2` API version? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`v2beta1` and `v2beta2` were removed in Kubernetes 1.26, not just deprecated. A manifest still targeting `v2beta2` will fail outright on any current cluster. `autoscaling/v2` (which carries the `behavior` field) has been the only API version since 1.23 went GA.

<p class="qa-link">[Full post →]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can an HPA create Pods by itself? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No — an HPA can only scale what `scaleTargetRef` names (a Deployment, ReplicaSet, or StatefulSet). It patches someone else's `replicas` field; it never creates Pods independently.

<p class="qa-link">[Full post →]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})</p>
  </div>
</div>

## Topic: Ingress (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why doesn't an Ingress object do anything on its own? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An Ingress is a set of routing rules stored in etcd with no built-in reconciler. Without an Ingress Controller (a Pod watching Ingress objects via `ingressClassName`) to turn those rules into real proxy behavior, the rules just sit in etcd, matched by nothing.

<p class="qa-link">[Full post →]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Where is TLS actually terminated in an Ingress setup? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
At the Ingress Controller, not the backend Service. The `tls:` block names a Secret holding the cert/key; NGINX decrypts there and usually proxies plaintext HTTP to the backend Pod over the cluster network.

<p class="qa-link">[Full post →]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the problem with relying on `nginx.ingress.kubernetes.io/*` annotations for behavior like auth? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
These annotations are controller-specific — they only work because `ingress-nginx` reads them and wires NGINX directives. Swapping to a different controller (Traefik, HAProxy, GCE Ingress) silently drops this behavior unless that controller has its own equivalent annotation. The base Kubernetes `Ingress` API only standardizes host/path routing and TLS.

<p class="qa-link">[Full post →]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is `pathType: Prefix` a required field in `networking.k8s.io/v1`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Pre-`v1`, path matching semantics were controller-specific and inconsistent. `v1` made `pathType` required (`Exact`, `Prefix`, or `ImplementationSpecific`) precisely so an Ingress means the same thing across controllers.

<p class="qa-link">[Full post →]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when an Ingress references a `secretName` that doesn't exist yet? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The Ingress controller doesn't create the TLS Secret, issue the cert, or validate the CN matches the host — that's cert-manager's job upstream. An Ingress referencing a missing Secret fails silently from the client's perspective, falling back to a default self-signed cert rather than rejecting the Ingress.

<p class="qa-link">[Full post →]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `type: LoadBalancer` scale differently from Ingress? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each `LoadBalancer` Service provisions one cloud load balancer — a billed, externally-routable IP per Service. For 20 HTTP services, that's 20 cloud LBs, 20 IPs, 20 TLS certs, and no shared routing logic. Ingress consolidates all of them behind one entry point with host/path routing.

<p class="qa-link">[Full post →]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What replaced the deprecated `kubernetes.io/ingress.class` annotation? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The `ingressClassName` field on the Ingress spec, plus a real `IngressClass` object in the cluster. Using the old annotation on a current cluster with multiple controllers installed has undefined behavior for which one claims the Ingress.

<p class="qa-link">[Full post →]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})</p>
  </div>
</div>

## Topic: NetworkPolicy (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `ingress: []` (empty list) on a NetworkPolicy actually mean? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It means deny all incoming traffic to the selected Pods — *once any policy selects a Pod for a direction*, that direction switches from "allow everything" to "allow only what's explicitly listed." A Pod matched by zero policies stays fully open.

<p class="qa-link">[Full post →]({{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Do NetworkPolicy objects enforce themselves, like RBAC? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. Like an Ingress without a controller, a NetworkPolicy is inert without a CNI plugin (Calico, Cilium) that implements the NetworkPolicy API. A cluster running a CNI that doesn't implement NetworkPolicy will accept these objects via the API and silently do nothing.

<p class="qa-link">[Full post →]({{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Are NetworkPolicies additive or do they override each other? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Additive, never overriding. If two policies both select the same Pod, the Pod's allowed traffic is the *union* of what each policy permits. You cannot "un-allow" something a broader policy already opened.

<p class="qa-link">[Full post →]({{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why doesn't a NetworkPolicy with only `ingress` rules provide full security? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It leaves egress unrestricted. A Pod locked down by a `web-deny-all` ingress policy can still connect *out* to anything — databases, external APIs, data exfiltration endpoints. Full defense requires both ingress and egress policies.

<p class="qa-link">[Full post →]({{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Do Kubernetes namespaces provide network isolation by default? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No, and they never have. A namespace is an API/RBAC boundary, not a network one. A Pod in `dev` can reach a Pod in `prod` unless a NetworkPolicy explicitly stops it. GKE specifically requires Dataplane V2 (Cilium-based) for NetworkPolicy enforcement.

<p class="qa-link">[Full post →]({{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the difference between `namespaceSelector` and `podSelector` inside a NetworkPolicy `from` rule? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`podSelector` matches Pods by their labels in the same namespace as the policy. `namespaceSelector` matches entire namespaces by their labels, regardless of Pod labels. They compose: a rule can require both "from this namespace" AND "matching this Pod label" at once.

<p class="qa-link">[Full post →]({{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with applying a NetworkPolicy to a cluster without a compliant CNI? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The API server accepts the object without error — but no CNI agent programs the corresponding iptables/eBPF rules, so traffic flows as if no policy existed. It's the exact same silent failure as deploying an Ingress with no controller watching it.

<p class="qa-link">[Full post →]({{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }})</p>
  </div>
</div>

## Topic: RBAC (Order 13)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can you write a "deny" rule in Kubernetes RBAC? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. RBAC has no `deny` rule — every grant is purely additive. You cannot subtract a permission another binding already granted. The only way to restrict access is to never grant it in the first place, which is why least-privilege must be the default posture, not a cleanup pass.

<p class="qa-link">[Full post →]({{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does it mean that a `ClusterRole` used in a `RoleBinding` is scoped to one namespace? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The ClusterRole's rules don't change, but the *binding* limits where they apply. A workload can reuse a broadly-defined ClusterRole via a RoleBinding to get permissions in just one namespace, instead of needing a separate Role definition.

<p class="qa-link">[Full post →]({{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do built-in roles like `view`/`edit`/`admin` get extended? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A ClusterRole aggregation controller watches for any ClusterRole carrying a specific label (e.g., `rbac.authorization.k8s.io/aggregate-to-view: "true"`) and merges its rules into the built-in role automatically. No RoleBinding changes are needed — anyone already holding `view` gains the new permissions.

<p class="qa-link">[Full post →]({{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does metrics-server use a namespaced RoleBinding for `extension-apiserver-authentication-reader` but ClusterRoleBindings for the rest? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The ConfigMap `extension-apiserver-authentication` only exists in `kube-system` — a ClusterRoleBinding would be strictly broader than the workload needs. Meanwhile, `system:auth-delegator` and `system:metrics-server` must be cluster-wide because metrics-server serves Pod/Node metrics for *every* namespace.

<p class="qa-link">[Full post →]({{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `system:aggregated-metrics-reader` actually grant metrics-server itself? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Nothing. It exists purely to extend the built-in `view`/`edit`/`admin` roles via its aggregate-to labels, so any human already holding `view` automatically gains read access to `metrics.k8s.io` data — a permission grant aimed at *other* subjects, not at metrics-server's own ServiceAccount.

<p class="qa-link">[Full post →]({{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the gotcha with debugging "why can't this Pod do X" in a self-managed cluster? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
RBAC may not be the only authorization layer. ABAC and legacy `Node,RBAC` authorizer chains still exist in self-managed clusters. A debugging session that assumes "RBAC is the only thing deciding this" can waste hours if an older ABAC policy file is also present. Check `--authorization-mode` on the API server.

<p class="qa-link">[Full post →]({{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }})</p>
  </div>
</div>

## Topic: ResourceQuota / LimitRange (Order 14)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do LimitRange and ResourceQuota interact at Pod creation time? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
LimitRange (mutating) runs first, injecting `default`/`defaultRequest` values into any Pod that omitted them. ResourceQuota (validating) runs after, checking whether the sum of all existing usage plus this Pod's requests exceeds the hard ceiling. The ordering is critical — LimitRange makes ResourceQuota survivable for Pods without explicit resources.

<p class="qa-link">[Full post →]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when a ResourceQuota blocks a Pod creation? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The API server returns a 403 Forbidden with "exceeded quota." The Pod is never created. This is the enforcement mechanism — a namespace can't run 500 Pods each requesting 2 CPU on a 200-CPU cluster once a ResourceQuota is in place.

<p class="qa-link">[Full post →]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can a ResourceQuota object-count limit block Pod creation even if compute quota is available? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Yes — `pods: "50"` is a completely separate axis from CPU/memory. A namespace can be well under its compute quota and still get new Pod creations rejected because it hit the object-count ceiling.

<p class="qa-link">[Full post →]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why are LimitRange's `default` and `defaultRequest` deliberately different values? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A Pod that omits `resources` gets a small request (110m) — so it schedules easily and doesn't inflate quota usage — but a larger limit (700m) as headroom for bursts. Setting both to the same value removes burst headroom for exactly the Pods least likely to have been tuned by their author.

<p class="qa-link">[Full post →]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `services.nodeports: "0"` in a ResourceQuota actually enforce? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It blocks NodePort Services entirely in that namespace — a policy enforcement lever, not a resource cap. It shows ResourceQuota isn't just about compute; it's a general per-namespace admission gate that can control which *types* of objects are allowed.

<p class="qa-link">[Full post →]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can a namespace have multiple ResourceQuota objects with different scope? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Yes — a ResourceQuota with `scopeSelector` (matching by PriorityClass or built-in scopes like `BestEffort`/`Terminating`) lets you apply different quotas to different subsets of Pods. Multiple scoped ResourceQuota objects can coexist in the same namespace, each enforcing its own limits.

<p class="qa-link">[Full post →]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Do LimitRange or ResourceQuota changes retroactively affect running Pods? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. Both only act at admission time. Changing a LimitRange's `default` or a ResourceQuota's `hard` ceiling never retroactively touches Pods already running — only new Pod creations are affected.

<p class="qa-link">[Full post →]({{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }})</p>
  </div>
</div>

## Topic: Secret Management & GitOps (Order 15)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does SealedSecrets prevent ciphertext from being decrypted in the wrong namespace? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The object's namespace and name are fed as an RSA-OAEP label directly into the cryptographic scheme. Decryption with the wrong label produces a cryptographic failure, not just a policy rejection — there's no "does this namespace match" `if` statement to bypass.

<p class="qa-link">[Full post →]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does External Secrets Operator differ from SealedSecrets architecturally? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
SealedSecrets encrypts the value client-side into ciphertext safe to commit — the value lives in git, encrypted. External Secrets Operator never puts the value in git at all; the committed `ExternalSecret` is just a reference to an external store, and the controller fetches the live value on a `refreshInterval`.

<p class="qa-link">[Full post →]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does SealedSecrets use hybrid AES-GCM + RSA-OAEP instead of just RSA? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
RSA-OAEP has a maximum plaintext size tied to the key size — far too small for real secret payloads (TLS private keys, JSON credential blobs). The hybrid scheme generates a random one-time AES-256 key, encrypts the payload with that, and only RSA-encrypts the small AES key itself.

<p class="qa-link">[Full post →]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the latency characteristic of External Secrets Operator's secret rotation? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
External Secrets Operator re-fetches on every `refreshInterval` tick. A credential rotated in AWS Secrets Manager doesn't reach the cluster instantly — it reaches it within one `refreshInterval` window, which is a real latency characteristic to design around.

<p class="qa-link">[Full post →]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What are the scope tradeoffs in SealedSecrets' `StrictScope` vs `ClusterWideScope`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`StrictScope` (the default) binds ciphertext to the exact namespace/name — strongest blast-radius containment but the SealedSecret can't be moved. `ClusterWideScope` sets an empty RSA-OAEP label, allowing portability across namespaces but giving up the cryptographic namespace binding.

<p class="qa-link">[Full post →]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does External Secrets Operator write fetched values into etcd? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Yes — once it creates the target `Secret` object, that Secret lives in etcd (base64-encoded, encrypted at rest only if etcd encryption-at-rest is configured). The distinction is about *git*: the `ExternalSecret` in the repo never contained the value; the real `Secret` it produces follows normal Kubernetes storage semantics.

<p class="qa-link">[Full post →]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the common mistake that defeats both SealedSecrets and External Secrets Operator? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A stray `kubectl create secret` or an un-migrated raw `Secret` manifest applied directly, bypassing both mechanisms. Either approach's guarantee only holds if it's the only path secrets enter the cluster through — one raw Secret in the GitOps flow defeats the whole point.

<p class="qa-link">[Full post →]({{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 109 across Kubernetes

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the chicken-and-egg problem with bootstrapping a Kubernetes cluster?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The scheduler needs a running API server to record placement decisions, and the API server needs etcd to store state — but none of them exist yet. You can't use normal scheduling to start the very first control-plane component because the scheduler that would do the placement is itself one of those components."
      }
    },
    {
      "@type": "Question",
      "name": "How does kubeadm break the bootstrap circular dependency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "kubeadm writes Pod manifest YAML files directly to `/etc/kubernetes/manifests/` on the control-plane node. The kubelet has a separate **file source** (`pkg/kubelet/config/file.go`) that polls that directory and starts whatever Pod specs it finds — completely bypassing the scheduler and API server."
      }
    },
    {
      "@type": "Question",
      "name": "What is a \"mirror Pod\" and why can't you `kubectl edit` it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Once the API server is up, the kubelet registers a read-only mirror of each static pod it's running so `kubectl get pods -n kube-system` can see it. Editing or deleting the mirror via the API changes nothing — the kubelet recreates it from the local file, which remains the source of truth."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to the rest of the control plane if etcd's static pod goes down?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The API server loses its backing store and starts failing reads/writes, which cascades to the scheduler and controller-manager — both of which depend on the API server. Even though their own manifest files never changed, a single unhealthy etcd pod can make the entire control plane appear broken."
      }
    },
    {
      "@type": "Question",
      "name": "How does the kubelet's file-based pod source differ structurally from the API-server pod source?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The file source (`sourceFile`) feeds Pod objects straight into a Go channel (`updates chan<- sourceUpdate`) by polling a directory on disk. The API-server source uses informer/watch machinery over the network. These are two completely separate code paths inside the kubelet, not one path with a special case bolted on."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when troubleshooting a static pod that won't start?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Editing the mirror Pod via `kubectl edit` in `kube-system` and expecting it to take effect. The real source of truth is the YAML file on disk at `/etc/kubernetes/manifests/`, not the API object. Also, assuming the kube-apiserver manifest looks healthy means etcd is healthy — kube-apiserver depends on etcd, not the other way around."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Kubernetes schedule Pods, not bare containers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Sidecars need the same node, the same IP, and the same lifecycle as the container they sit next to. A Pod is the smallest scheduling unit — it guarantees co-location on one node, shared network namespace (so containers reach each other over `127.0.0.1`), and shared lifecycle managed by one kubelet."
      }
    },
    {
      "@type": "Question",
      "name": "What is the pause container's actual role in a Pod?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The pause container is a tiny infrastructure container the kubelet creates first. It holds the network namespace (and IPC namespace) open; all subsequent containers join that same namespace. It never appears in your YAML — you only see it in `crictl ps` or `docker ps` on the node."
      }
    },
    {
      "@type": "Question",
      "name": "How does `securityContext` at the Pod level differ from `securityContext` at the container level?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pod-level `securityContext` (`fsGroup`, `runAsUser`, `runAsNonRoot`) shapes the whole sandbox and volume ownership. Container-level `securityContext` (`allowPrivilegeEscalation`, `capabilities`, `readOnlyRootFilesystem`) applies per-container kernel capabilities. Confusing the two scopes is one of the most common manifest review mistakes."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to a Pod's IP when it's rescheduled?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A rescheduled Pod is a completely new Pod object — new UID, new IP. Nothing relocates the existing Pod; a controller (Deployment, StatefulSet, DaemonSet) creates a brand-new Pod, which the scheduler places independently, usually on a different node."
      }
    },
    {
      "@type": "Question",
      "name": "When would you enable `shareProcessNamespace: true` on a Pod?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When a debugging sidecar needs to see every container's processes via `ps` and `/proc/$pid/root`. The tradeoff: the pause container becomes PID 1, so any container assuming it is PID 1 (e.g., one running `systemd`) can misbehave or refuse to start."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with `terminationGracePeriodSeconds` being left at its default?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The 30-second default is a guess that fits nothing in particular. A stateless gRPC service might shut down in 5 seconds; a database with a flush cache could need 120. Leaving it untuned means every rollout or scale-down takes longer than it should, or kills a process mid-shutdown."
      }
    },
    {
      "@type": "Question",
      "name": "How did the removal of dockershim in Kubernetes v1.24 affect Pods?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The kubelet no longer talks to Docker Engine — it speaks CRI directly to containerd or CRI-O. Docker-built images still run fine (they're OCI-compliant); only Docker's runtime control path was removed. Any tooling that relied on `docker` CLI inside a Pod or node broke."
      }
    },
    {
      "@type": "Question",
      "name": "What does the Deployment controller actually do that the ReplicaSet controller doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Deployment controller manages transitions between ReplicaSet generations — creating a new ReplicaSet, scaling it up while scaling the old one down, bounded by `maxUnavailable`/`maxSurge`. The ReplicaSet controller's job is narrower: ensure exactly N Pods matching its selector exist right now."
      }
    },
    {
      "@type": "Question",
      "name": "How does `pod-template-hash` prevent two ReplicaSet generations from claiming each other's Pods during a rollout?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each ReplicaSet's selector only matches Pods carrying its own hash value. A v1 ReplicaSet won't claim a v2 Pod (wrong hash), and vice versa. This is what lets both generations coexist mid-rollout without either controller accidentally deleting or recreating the other's Pods."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you set `maxUnavailable: 0` and `maxSurge: 0`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The rollout becomes impossible — you can't create a new Pod until an old one is deleted, but you can't delete an old one until a new one is ready. This is a deadlock, not a safety measure. In practice, `maxUnavailable: 0` with `maxSurge: 1` achieves zero-downtime updates."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the rollout's pace depend on the new Pod's readiness probe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A new Pod isn't counted as \"available\" until it passes its readiness probe. If the v2 container is slow to start, the Deployment controller stalls at its current step — it won't surge another v2 Pod or drain another v1 Pod until the current one passes. A slow probe slows the rollout; a missing probe lets it barrel ahead blindly."
      }
    },
    {
      "@type": "Question",
      "name": "Can you change `spec.selector` on an existing Deployment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — `apps/v1` makes the selector immutable after creation. If you need a different selector, you must delete and recreate the Deployment. This is why selectors are chosen conservatively up front, not as an afterthought."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with the default `maxUnavailable` and `maxSurge` values?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both default to 25% of desired replicas. An un-tuned Deployment can go 25% over capacity and 25% under capacity simultaneously during a routine update — significant for a large replica count, and invisible if you never explicitly set these fields."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between a Deployment and a ReplicaSet in terms of ownership and visibility?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You almost never author a ReplicaSet directly. The Deployment generates it, names it by hashing the pod template, and owns it via `ownerReferences`. Running `kubectl get rs` after a Deployment change is the fastest way to see the reconcile loop working in real time."
      }
    },
    {
      "@type": "Question",
      "name": "How does a Service learn a new Pod's IP after a crash and replacement?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The EndpointSlice controller watches the API for Pod changes and republishes the Service's backing address list. Modern Kubernetes uses `EndpointSlices` (not the legacy `Endpoints` object) — sliced objects that scale better. `kube-proxy` and CoreDNS consume those slices to reprogram routing."
      }
    },
    {
      "@type": "Question",
      "name": "Does a Pod receive Service traffic the instant it starts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. A Pod's IP is only added to the Service's routing set after its readiness probe passes. A booting or unhealthy Pod is deliberately excluded from traffic — remove the readiness probe and you route requests into cold or broken Pods."
      }
    },
    {
      "@type": "Question",
      "name": "Where does a ClusterIP actually \"live\" on the network?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's a virtual IP not bound to any NIC. `kube-proxy` programs kernel routing rules (iptables/IPVS/nftables) so that any packet destined for the ClusterIP is DNAT'd to a real Pod IP:port. No process ever listens on the ClusterIP itself — it's pure packet rewriting at the kernel level."
      }
    },
    {
      "@type": "Question",
      "name": "What is a headless Service, and when would you use one?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A headless Service (`clusterIP: None`) returns individual Pod IPs in DNS instead of one virtual IP. Clients do their own load balancing. You use it for StatefulSets (stable per-pod DNS like `pod-0.cache.ns.svc`), databases with primary/replica awareness, or gRPC clients that manage connections themselves."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `ndots:5` in a Pod's `/etc/resolv.conf` cause DNS latency for external lookups?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Any name with fewer than 5 dots is tried against every search domain first (e.g., `api.stripe.com.default.svc.cluster.local`, `api.stripe.com.svc.cluster.local`, etc.) before falling through to the actual external query. For external FQDNs, this means several failed cluster-internal DNS lookups before the real answer returns."
      }
    },
    {
      "@type": "Question",
      "name": "A client can't reach a Service even though Pods are running. What's the first thing to check?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Two things, in order: (1) selector/label mismatch — does the Service's `selector` exactly match the Pod labels? A typo means zero endpoints. (2) Readiness — are the Pods actually passing their readiness probe? Running ≠ Ready; a failing probe keeps a Pod out of the endpoint set."
      }
    },
    {
      "@type": "Question",
      "name": "How do iptables mode and IPVS mode differ for kube-proxy load balancing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In iptables mode (default), traffic is sent to a randomly-chosen endpoint using probability rules — statistically even, not sequential. IPVS mode offers real algorithms (round-robin, least-connection, etc.), which is why large clusters prefer IPVS. Newer clusters may also use nftables mode."
      }
    },
    {
      "@type": "Question",
      "name": "How does env-var injection differ from volume-mount injection when a ConfigMap is updated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A value injected via `env.valueFrom.configMapKeyRef` is read once at container start and frozen — editing the ConfigMap does nothing until the Pod restarts. A value delivered via a mounted volume is kept in sync by the kubelet's periodic sync interval — the file on disk updates, but the application must notice the change itself."
      }
    },
    {
      "@type": "Question",
      "name": "Is a Kubernetes Secret actually encrypted at rest by default?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. A Secret is base64-*encoded*, not encrypted. Unless the cluster admin configures `--encryption-provider-config` with a real provider (`aescbc`, `aesgcm`, `secretbox`), Secret data sits in etcd as plain base64. \"It's a Secret so it's encrypted\" is a common and wrong assumption."
      }
    },
    {
      "@type": "Question",
      "name": "What does `immutable: true` on a ConfigMap actually do, and why would you use it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It tells the API server the object will never change again. The kubelet stops watching it for updates (less API server load at scale) and it prevents accidental `kubectl edit` in production. The common pattern is naming the ConfigMap with a content hash and rolling the Deployment on every change."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the `stringData` field used in Secret manifests instead of pre-encoding to base64?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`stringData` lets you write plaintext in the manifest; the API server base64-encodes it into `.data` on write. You never hand-encode a Secret in a real manifest. The field is write-only — it's not present when you read the object back."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't you pass a large, structured YAML document as an environment variable to a container?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Environment variables are flat key-value strings — a multi-hundred-line YAML with Go template syntax inside it (`<<.GroupBy>>`) is structurally impossible to pass as one. This is the practical reason ConfigMaps support volume mounting at all, not just env injection."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with using Secret objects for non-password operational config?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Secret's RBAC defaults and `kubectl get -o wide` visibility make it a reasonable choice for operational config that shouldn't be world-readable via `kubectl get configmap -o yaml` — but it's not encrypted at rest unless you've configured etcd encryption. Teams often assume Secret = encrypted, which it isn't by default."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between a failed liveness probe and a failed readiness probe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A failed liveness probe makes the kubelet restart the container in place (same Pod, same UID, same IP). A failed readiness probe does *not* restart anything — the container keeps running, but the Pod is pulled out of Service traffic until it passes again. Two completely different outcomes from two different failure signals."
      }
    },
    {
      "@type": "Question",
      "name": "What role does `startupProbe` play, and when is it unnecessary?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`startupProbe` holds off liveness and readiness checks until it succeeds once. This gives a slow-booting app (large JVM, big cache warm) a long runway without being killed by premature liveness checks. For a small, fast-starting Go binary, the normal `initialDelaySeconds` plus `failureThreshold` already gives enough slack — a `startupProbe` isn't always needed."
      }
    },
    {
      "@type": "Question",
      "name": "Who executes the probe — the API server, the kubelet, or a controller?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The kubelet, directly, on each node where the Pod runs. It's a local polling loop, not a control-plane operation. No API server round-trip is involved in the probe itself."
      }
    },
    {
      "@type": "Question",
      "name": "Why do metrics-server's liveness and readiness probes hit different endpoints?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`/readyz` answers \"has the metrics cache finished warming up?\" — it depends on initialization. `/livez` answers \"is the process alive?\" — a fundamentally different question. A single shared `/health` endpoint conflates the two and risks restart loops triggered by conditions that only affect readiness."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you omit the liveness probe entirely?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The kubelet's only health signal becomes the process exit code. A container that is alive but wedged — deadlocked event loop, exhausted connection pool, stuck thread — stays running forever, eating every request routed to it, with no automatic restart."
      }
    },
    {
      "@type": "Question",
      "name": "Why does metrics-server use `maxUnavailable: 0` in its rollout strategy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "metrics-server feeds the HPA and `kubectl top`. A gap during rollout means cluster-wide autoscaling stalls. `maxUnavailable: 0` accepts a slower rollout in exchange for zero gaps in metrics availability — the tradeoff is correctness over speed."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake with `initialDelaySeconds` on a liveness probe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Setting it too short for a slow-starting app causes premature restarts; setting it too long delays detection of genuine post-boot deadlocks. The real fix for slow boots is a `startupProbe` with a generous `failureThreshold × periodSeconds` window, not inflating `initialDelaySeconds` on the liveness probe."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't `emptyDir` survive a Pod restart?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`emptyDir` is scoped to the Pod's lifetime — it's created when the Pod is scheduled on a node and deleted when the Pod is removed. If the Pod is rescheduled to a different node, the new Pod gets a fresh `emptyDir`. It's designed for inter-container data sharing within a single Pod, not persistence."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a PVC and a PV?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A PVC is a namespaced *request* for storage (e.g., \"I need 10Gi ReadWriteOnce\"). A PV is the actual storage resource, cluster-scoped, usually created on demand by a StorageClass's CSI provisioner. The PVC binds to the PV; the PV outlives any individual Pod that uses it."
      }
    },
    {
      "@type": "Question",
      "name": "What does a PVC's `reclaimPolicy` control, and why is the default dangerous?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`Delete` (the default for most dynamic-provisioning classes) destroys the underlying cloud disk when the PVC is deleted. `Retain` orphans the disk for manual admin cleanup. Deleting a PVC on the `Delete` policy without checking what data lives on it is a classic way to destroy production data or leak cloud disks forever."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Prometheus in kube-prometheus default to `emptyDir` for its TSDB?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's opt-in persistence — without a `storage.volumeClaimTemplate`, the monitoring stack's own metrics history doesn't survive a Pod reschedule. \"Prometheus obviously persists its data\" is exactly the assumption that costs someone their metrics history during a routine node drain."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you use a `hostPath` volume and the Pod is rescheduled?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The data stays pinned to the original node. The new Pod on a different node gets an empty directory — the data never left the old machine. `hostPath` is only safe when the Pod is guaranteed to always run on the same node (DaemonSets), not general-purpose workloads."
      }
    },
    {
      "@type": "Question",
      "name": "Why would you use `emptyDir` with `medium: Memory`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It creates a tmpfs mount — RAM-backed, faster than disk, and counted against the Pod's memory limit. Use it for plugin scratch space or temporary caches that benefit from RAM speed. The gotcha: memory usage looks higher than the process's own footprint because these files are in the Pod's memory accounting."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with a `ReadWriteOnce` PVC on a Deployment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ReadWriteOnce` means one node can mount it at a time. If a Deployment with multiple replicas all try to mount the same `ReadWriteOnce` PVC, only one succeeds — the rest stay `Pending`. `ReadWriteOncePod` (a newer access mode) restricts it further to a single Pod, not just a single node."
      }
    },
    {
      "@type": "Question",
      "name": "What does a StatefulSet give you that a Deployment doesn't?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Stable, per-replica ordinal identity (`app-0`, `app-1`, `app-2`) with corresponding stable DNS entries (`app-0.app.ns.svc.cluster.local`) and, optionally, per-ordinal persistent volumes that follow the same replica across reschedules. Deployments produce anonymous, fungible Pods; StatefulSets produce named, distinguishable ones."
      }
    },
    {
      "@type": "Question",
      "name": "Why does a StatefulSet require a headless Service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The headless Service (`clusterIP: None`) is what gives each Pod its own DNS entry — DNS returns individual Pod IPs instead of one virtual IP. Without it, Pods still get created, but they never get the stable `<pod>.<service>` DNS names that are the entire reason to use a StatefulSet."
      }
    },
    {
      "@type": "Question",
      "name": "What is `OrderedReady` pod management policy, and why does it matter for databases?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pods are created and deleted one at a time, in ordinal order, each waiting to reach Ready before the controller touches the next. This sequencing is how you safely bootstrap a primary before its replicas, or roll a cluster node-by-node instead of all at once."
      }
    },
    {
      "@type": "Question",
      "name": "Do PVCs created by a StatefulSet's `volumeClaimTemplates` get deleted when the StatefulSet is scaled down?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — by default, deleting or scaling down a StatefulSet does *not* delete its PVCs. This is deliberate: data safety is considered more valuable than automatic cleanup. An opt-in `persistentVolumeClaimRetentionPolicy` field exists if you want automatic cleanup."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Argo CD's application controller use a StatefulSet despite having zero persistent storage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The StatefulSet exists purely for stable, predictable ordinal identity — each replica's ordinal becomes a shard number for cluster-watching assignments. A Deployment's replicas have no durable ordinal to shard by, so a rescheduled Pod could silently \"become\" a different shard than the one it was covering."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with `ARGOCD_CONTROLLER_REPLICAS` being out of sync with `spec.replicas`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The application controller can't introspect its own StatefulSet's replica count from inside the Pod. If you bump `spec.replicas` without updating the `ARGOCD_CONTROLLER_REPLICAS` env var, the sharding math silently uses the old count — a real operational gotcha."
      }
    },
    {
      "@type": "Question",
      "name": "How does a StatefulSet scale down?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In reverse ordinal order, one Pod at a time. If you scale from 3 to 1, `app-2` is deleted first, then `app-1`, each waiting to fully terminate before the next deletion starts."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't you just use a Deployment with `replicas: 10` for a per-node workload?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nothing guarantees the scheduler spreads exactly one Pod per node — two Pods could land on the same node while another gets zero. When you add an 11th node, a Deployment has no idea it exists. A DaemonSet automatically adds a Pod to new nodes and removes it from departed ones."
      }
    },
    {
      "@type": "Question",
      "name": "Does a DaemonSet bypass the scheduler?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — that's pre-1.17 behavior. The DaemonSet controller creates each Pod with node affinity, and the default scheduler typically takes over to bind it to the target node. The controller creates Pods; the scheduler does the binding."
      }
    },
    {
      "@type": "Question",
      "name": "Why does node-exporter use `tolerations: [{operator: Exists}]`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Without it, the DaemonSet silently skips tainted nodes — including the control plane, which absolutely still needs its CPU/memory/disk monitored. The blanket toleration is what gets the monitoring Pod onto every node, even those repelled by default taints."
      }
    },
    {
      "@type": "Question",
      "name": "Why does node-exporter use `hostNetwork: true` and `hostPID: true`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Its job is reading the node's real network interfaces and process table. These fields deliberately break the Pod network and PID isolation that normally protects it from the host — a necessary exception for a node-level monitoring agent."
      }
    },
    {
      "@type": "Question",
      "name": "How does a DaemonSet rolling update differ from a Deployment rolling update?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A DaemonSet updates one node's Pod at a time (controlled by `maxUnavailable`). With `maxSurge` at its default of 0, the old Pod is deleted *before* the new one starts — there's never two copies on the same node. A Deployment can surge Pods above the target count."
      }
    },
    {
      "@type": "Question",
      "name": "Why does node-exporter's `kube-rbac-proxy` sidecar bind to `127.0.0.1:9101` instead of directly exposing port 9100?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The actual metrics exporter is intentionally unreachable from outside the Pod. The `kube-rbac-proxy` sidecar adds TLS and RBAC authentication in front of those metrics, and exposes `hostPort: 9100` — splitting \"collect the data\" from \"authenticate access to the data\" into two containers sharing the Pod's localhost."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to a DaemonSet Pod when its node is cordoned?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Pod is evicted — there's nowhere else to go since DaemonSet Pods are node-specific. No replacement is scheduled on a different node. A Deployment, by contrast, would reschedule the Pod elsewhere."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't a Job Pod have `restartPolicy: Always`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`restartPolicy: Always` is for long-lived workloads — the kubelet always restarts the container, so the process never \"completes.\" A Job tracks *completions* (Pods that exit 0), so the restart policy must be `Never` or `OnFailure` to let a Pod actually finish."
      }
    },
    {
      "@type": "Question",
      "name": "What does `concurrencyPolicy: Forbid` do in a CronJob?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When a tick fires while the previous Job is still running, the new tick is skipped entirely. This is a correctness decision for workloads that mutate shared state — two concurrent descheduler passes, for example, could both evict the same Pods at once, compounding disruption."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to completed Job objects by default?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They stick around in etcd until manually cleaned up or garbage-collected by `successfulJobsHistoryLimit`/`failedJobsHistoryLimit` on the CronJob (defaults: 3 and 1). A high-frequency CronJob (every 2 minutes) accumulates finished Job objects fast — production clusters need to actually monitor that history limit."
      }
    },
    {
      "@type": "Question",
      "name": "How does a CronJob relate to a Job structurally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The CronJob's `jobTemplate.spec` is structurally identical to a standalone Job's `spec` — same `priorityClassName`, `restartPolicy`, `livenessProbe`, `securityContext`. The CronJob adds exactly one thing: `schedule` plus `concurrencyPolicy`. It's a Job with a clock around it, not a separate execution model."
      }
    },
    {
      "@type": "Question",
      "name": "What does `backoffLimit` control in a Job, and what happens when it's exceeded?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It caps the number of times the Job controller creates a replacement Pod after failures (default: 6). Once `backoffLimit` is hit, the Job is marked as failed and the controller stops creating new Pods. Exponential backoff is applied between retries."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `priorityClassName: system-cluster-critical` matter specifically for the descheduler?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The descheduler evicts other Pods to fix scheduling — if its own Pod got preempted under node pressure, the thing meant to relieve pressure would be the first casualty. A high priority class protects the workload from being the first to be evicted."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with `startingDeadlineSeconds` being unset?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If the CronJob controller is down across several scheduled ticks, it doesn't replay every missed tick on restart by default — but it also might replay them all at once if the window isn't bounded. Setting `startingDeadlineSeconds` bounds how late a missed tick is still allowed to start, preventing a flood of catch-up Jobs."
      }
    },
    {
      "@type": "Question",
      "name": "What formula does the HPA controller use to decide replica count?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`desiredReplicas = ceil(currentReplicas × (currentMetricValue / desiredMetricValue))`. It polls a metrics API (typically metrics-server) every sync period (default 15s), computes this ratio, and patches the target Deployment's `spec.replicas`."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `resources.requests.cpu` required for CPU-based HPA scaling to work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "\"70% utilization\" means 70% *of the request*. An unset request makes the percentage undefined — the HPA literally has no baseline to compute utilization against."
      }
    },
    {
      "@type": "Question",
      "name": "How do scale-up and scale-down differ in terms of stabilization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scale-down has a default 300-second stabilization window (avoid flapping right before the next spike). Scale-up defaults to near-immediate. A manifest that overrides `scaleUp.stabilizationWindowSeconds: 0` is choosing instant reaction over default caution."
      }
    },
    {
      "@type": "Question",
      "name": "Why does bank-of-anthos set `requests.cpu` and `limits.cpu` to the identical value (250m)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "This creates Guaranteed QoS for the CPU dimension — it makes \"70% utilization\" mean the same, stable thing on every replica instead of drifting with however much headroom `limits` happened to leave above `requests`."
      }
    },
    {
      "@type": "Question",
      "name": "What does `policies: [{type: Percent, value: 100, periodSeconds: 5}]` on scale-up behavior do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It caps growth at doubling the replica count every 5 seconds. Even with `stabilizationWindowSeconds: 0`, the *rate* of scale-up is still bounded — a guard against a metrics blip causing `maxReplicas` to be hit in one step."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with using the deprecated `autoscaling/v2beta2` API version?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`v2beta1` and `v2beta2` were removed in Kubernetes 1.26, not just deprecated. A manifest still targeting `v2beta2` will fail outright on any current cluster. `autoscaling/v2` (which carries the `behavior` field) has been the only API version since 1.23 went GA."
      }
    },
    {
      "@type": "Question",
      "name": "Can an HPA create Pods by itself?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — an HPA can only scale what `scaleTargetRef` names (a Deployment, ReplicaSet, or StatefulSet). It patches someone else's `replicas` field; it never creates Pods independently."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't an Ingress object do anything on its own?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An Ingress is a set of routing rules stored in etcd with no built-in reconciler. Without an Ingress Controller (a Pod watching Ingress objects via `ingressClassName`) to turn those rules into real proxy behavior, the rules just sit in etcd, matched by nothing."
      }
    },
    {
      "@type": "Question",
      "name": "Where is TLS actually terminated in an Ingress setup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "At the Ingress Controller, not the backend Service. The `tls:` block names a Secret holding the cert/key; NGINX decrypts there and usually proxies plaintext HTTP to the backend Pod over the cluster network."
      }
    },
    {
      "@type": "Question",
      "name": "What's the problem with relying on `nginx.ingress.kubernetes.io/*` annotations for behavior like auth?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "These annotations are controller-specific — they only work because `ingress-nginx` reads them and wires NGINX directives. Swapping to a different controller (Traefik, HAProxy, GCE Ingress) silently drops this behavior unless that controller has its own equivalent annotation. The base Kubernetes `Ingress` API only standardizes host/path routing and TLS."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `pathType: Prefix` a required field in `networking.k8s.io/v1`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Pre-`v1`, path matching semantics were controller-specific and inconsistent. `v1` made `pathType` required (`Exact`, `Prefix`, or `ImplementationSpecific`) precisely so an Ingress means the same thing across controllers."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when an Ingress references a `secretName` that doesn't exist yet?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Ingress controller doesn't create the TLS Secret, issue the cert, or validate the CN matches the host — that's cert-manager's job upstream. An Ingress referencing a missing Secret fails silently from the client's perspective, falling back to a default self-signed cert rather than rejecting the Ingress."
      }
    },
    {
      "@type": "Question",
      "name": "How does `type: LoadBalancer` scale differently from Ingress?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each `LoadBalancer` Service provisions one cloud load balancer — a billed, externally-routable IP per Service. For 20 HTTP services, that's 20 cloud LBs, 20 IPs, 20 TLS certs, and no shared routing logic. Ingress consolidates all of them behind one entry point with host/path routing."
      }
    },
    {
      "@type": "Question",
      "name": "What replaced the deprecated `kubernetes.io/ingress.class` annotation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The `ingressClassName` field on the Ingress spec, plus a real `IngressClass` object in the cluster. Using the old annotation on a current cluster with multiple controllers installed has undefined behavior for which one claims the Ingress."
      }
    },
    {
      "@type": "Question",
      "name": "What does `ingress: []` (empty list) on a NetworkPolicy actually mean?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It means deny all incoming traffic to the selected Pods — *once any policy selects a Pod for a direction*, that direction switches from \"allow everything\" to \"allow only what's explicitly listed.\" A Pod matched by zero policies stays fully open."
      }
    },
    {
      "@type": "Question",
      "name": "Do NetworkPolicy objects enforce themselves, like RBAC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Like an Ingress without a controller, a NetworkPolicy is inert without a CNI plugin (Calico, Cilium) that implements the NetworkPolicy API. A cluster running a CNI that doesn't implement NetworkPolicy will accept these objects via the API and silently do nothing."
      }
    },
    {
      "@type": "Question",
      "name": "Are NetworkPolicies additive or do they override each other?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Additive, never overriding. If two policies both select the same Pod, the Pod's allowed traffic is the *union* of what each policy permits. You cannot \"un-allow\" something a broader policy already opened."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't a NetworkPolicy with only `ingress` rules provide full security?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It leaves egress unrestricted. A Pod locked down by a `web-deny-all` ingress policy can still connect *out* to anything — databases, external APIs, data exfiltration endpoints. Full defense requires both ingress and egress policies."
      }
    },
    {
      "@type": "Question",
      "name": "Do Kubernetes namespaces provide network isolation by default?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No, and they never have. A namespace is an API/RBAC boundary, not a network one. A Pod in `dev` can reach a Pod in `prod` unless a NetworkPolicy explicitly stops it. GKE specifically requires Dataplane V2 (Cilium-based) for NetworkPolicy enforcement."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between `namespaceSelector` and `podSelector` inside a NetworkPolicy `from` rule?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`podSelector` matches Pods by their labels in the same namespace as the policy. `namespaceSelector` matches entire namespaces by their labels, regardless of Pod labels. They compose: a rule can require both \"from this namespace\" AND \"matching this Pod label\" at once."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with applying a NetworkPolicy to a cluster without a compliant CNI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The API server accepts the object without error — but no CNI agent programs the corresponding iptables/eBPF rules, so traffic flows as if no policy existed. It's the exact same silent failure as deploying an Ingress with no controller watching it."
      }
    },
    {
      "@type": "Question",
      "name": "Can you write a \"deny\" rule in Kubernetes RBAC?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. RBAC has no `deny` rule — every grant is purely additive. You cannot subtract a permission another binding already granted. The only way to restrict access is to never grant it in the first place, which is why least-privilege must be the default posture, not a cleanup pass."
      }
    },
    {
      "@type": "Question",
      "name": "What does it mean that a `ClusterRole` used in a `RoleBinding` is scoped to one namespace?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The ClusterRole's rules don't change, but the *binding* limits where they apply. A workload can reuse a broadly-defined ClusterRole via a RoleBinding to get permissions in just one namespace, instead of needing a separate Role definition."
      }
    },
    {
      "@type": "Question",
      "name": "How do built-in roles like `view`/`edit`/`admin` get extended?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A ClusterRole aggregation controller watches for any ClusterRole carrying a specific label (e.g., `rbac.authorization.k8s.io/aggregate-to-view: \"true\"`) and merges its rules into the built-in role automatically. No RoleBinding changes are needed — anyone already holding `view` gains the new permissions."
      }
    },
    {
      "@type": "Question",
      "name": "Why does metrics-server use a namespaced RoleBinding for `extension-apiserver-authentication-reader` but ClusterRoleBindings for the rest?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The ConfigMap `extension-apiserver-authentication` only exists in `kube-system` — a ClusterRoleBinding would be strictly broader than the workload needs. Meanwhile, `system:auth-delegator` and `system:metrics-server` must be cluster-wide because metrics-server serves Pod/Node metrics for *every* namespace."
      }
    },
    {
      "@type": "Question",
      "name": "What does `system:aggregated-metrics-reader` actually grant metrics-server itself?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nothing. It exists purely to extend the built-in `view`/`edit`/`admin` roles via its aggregate-to labels, so any human already holding `view` automatically gains read access to `metrics.k8s.io` data — a permission grant aimed at *other* subjects, not at metrics-server's own ServiceAccount."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with debugging \"why can't this Pod do X\" in a self-managed cluster?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "RBAC may not be the only authorization layer. ABAC and legacy `Node,RBAC` authorizer chains still exist in self-managed clusters. A debugging session that assumes \"RBAC is the only thing deciding this\" can waste hours if an older ABAC policy file is also present. Check `--authorization-mode` on the API server."
      }
    },
    {
      "@type": "Question",
      "name": "How do LimitRange and ResourceQuota interact at Pod creation time?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "LimitRange (mutating) runs first, injecting `default`/`defaultRequest` values into any Pod that omitted them. ResourceQuota (validating) runs after, checking whether the sum of all existing usage plus this Pod's requests exceeds the hard ceiling. The ordering is critical — LimitRange makes ResourceQuota survivable for Pods without explicit resources."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when a ResourceQuota blocks a Pod creation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The API server returns a 403 Forbidden with \"exceeded quota.\" The Pod is never created. This is the enforcement mechanism — a namespace can't run 500 Pods each requesting 2 CPU on a 200-CPU cluster once a ResourceQuota is in place."
      }
    },
    {
      "@type": "Question",
      "name": "Can a ResourceQuota object-count limit block Pod creation even if compute quota is available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — `pods: \"50\"` is a completely separate axis from CPU/memory. A namespace can be well under its compute quota and still get new Pod creations rejected because it hit the object-count ceiling."
      }
    },
    {
      "@type": "Question",
      "name": "Why are LimitRange's `default` and `defaultRequest` deliberately different values?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A Pod that omits `resources` gets a small request (110m) — so it schedules easily and doesn't inflate quota usage — but a larger limit (700m) as headroom for bursts. Setting both to the same value removes burst headroom for exactly the Pods least likely to have been tuned by their author."
      }
    },
    {
      "@type": "Question",
      "name": "What does `services.nodeports: \"0\"` in a ResourceQuota actually enforce?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It blocks NodePort Services entirely in that namespace — a policy enforcement lever, not a resource cap. It shows ResourceQuota isn't just about compute; it's a general per-namespace admission gate that can control which *types* of objects are allowed."
      }
    },
    {
      "@type": "Question",
      "name": "Can a namespace have multiple ResourceQuota objects with different scope?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — a ResourceQuota with `scopeSelector` (matching by PriorityClass or built-in scopes like `BestEffort`/`Terminating`) lets you apply different quotas to different subsets of Pods. Multiple scoped ResourceQuota objects can coexist in the same namespace, each enforcing its own limits."
      }
    },
    {
      "@type": "Question",
      "name": "Do LimitRange or ResourceQuota changes retroactively affect running Pods?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Both only act at admission time. Changing a LimitRange's `default` or a ResourceQuota's `hard` ceiling never retroactively touches Pods already running — only new Pod creations are affected."
      }
    },
    {
      "@type": "Question",
      "name": "How does SealedSecrets prevent ciphertext from being decrypted in the wrong namespace?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The object's namespace and name are fed as an RSA-OAEP label directly into the cryptographic scheme. Decryption with the wrong label produces a cryptographic failure, not just a policy rejection — there's no \"does this namespace match\" `if` statement to bypass."
      }
    },
    {
      "@type": "Question",
      "name": "How does External Secrets Operator differ from SealedSecrets architecturally?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SealedSecrets encrypts the value client-side into ciphertext safe to commit — the value lives in git, encrypted. External Secrets Operator never puts the value in git at all; the committed `ExternalSecret` is just a reference to an external store, and the controller fetches the live value on a `refreshInterval`."
      }
    },
    {
      "@type": "Question",
      "name": "Why does SealedSecrets use hybrid AES-GCM + RSA-OAEP instead of just RSA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "RSA-OAEP has a maximum plaintext size tied to the key size — far too small for real secret payloads (TLS private keys, JSON credential blobs). The hybrid scheme generates a random one-time AES-256 key, encrypts the payload with that, and only RSA-encrypts the small AES key itself."
      }
    },
    {
      "@type": "Question",
      "name": "What's the latency characteristic of External Secrets Operator's secret rotation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "External Secrets Operator re-fetches on every `refreshInterval` tick. A credential rotated in AWS Secrets Manager doesn't reach the cluster instantly — it reaches it within one `refreshInterval` window, which is a real latency characteristic to design around."
      }
    },
    {
      "@type": "Question",
      "name": "What are the scope tradeoffs in SealedSecrets' `StrictScope` vs `ClusterWideScope`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`StrictScope` (the default) binds ciphertext to the exact namespace/name — strongest blast-radius containment but the SealedSecret can't be moved. `ClusterWideScope` sets an empty RSA-OAEP label, allowing portability across namespaces but giving up the cryptographic namespace binding."
      }
    },
    {
      "@type": "Question",
      "name": "Does External Secrets Operator write fetched values into etcd?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — once it creates the target `Secret` object, that Secret lives in etcd (base64-encoded, encrypted at rest only if etcd encryption-at-rest is configured). The distinction is about *git*: the `ExternalSecret` in the repo never contained the value; the real `Secret` it produces follows normal Kubernetes storage semantics."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake that defeats both SealedSecrets and External Secrets Operator?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A stray `kubectl create secret` or an un-migrated raw `Secret` manifest applied directly, bypassing both mechanisms. Either approach's guarantee only holds if it's the only path secrets enter the cluster through — one raw Secret in the GitOps flow defeats the whole point."
      }
    }
  ]
}
</script>

<script>
(function () {
  var search = document.getElementById('qa-search');
  var buttons = document.getElementById('qa-diff-buttons');
  if (!search || !buttons) return;
  var activeDiff = 'all';
  function normalize(s){ return (s||'').toLowerCase(); }
  function apply() {
    var q = normalize(search.value).trim();
    var items = document.querySelectorAll('.qa-item');
    var shown = 0;
    items.forEach(function (item) {
      var txt = normalize(item.textContent);
      var diff = item.getAttribute('data-diff') || 'Intermediate';
      var okText = q === '' || txt.indexOf(q) !== -1;
      var okDiff = activeDiff === 'all' || diff === activeDiff;
      var visible = okText && okDiff;
      item.style.display = visible ? '' : 'none';
      if (visible) shown++;
    });
    var count = document.getElementById('qa-shown');
    if (count) count.textContent = shown;
  }
  search.addEventListener('input', apply);
  buttons.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    activeDiff = btn.getAttribute('data-diff');
    buttons.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    apply();
  });

  /* Accordion: click or keypress on question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
    h3.setAttribute('aria-expanded', h3.parentElement.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    e.preventDefault();
    h3.click();
  });

  /* Expand all / collapse all */
  var expandBtn = document.getElementById('qa-expand-all');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var items = document.querySelectorAll('.qa-item');
      var allOpen = Array.prototype.every.call(items, function(i){ return i.classList.contains('open'); });
      items.forEach(function (item) {
        var q = item.querySelector('.qa-q');
        if (allOpen) {
          item.classList.remove('open');
          if (q) q.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          if (q) q.setAttribute('aria-expanded', 'true');
        }
      });
      expandBtn.textContent = allOpen ? 'Expand all' : 'Collapse all';
    });
  }

  apply();
})();
</script>
