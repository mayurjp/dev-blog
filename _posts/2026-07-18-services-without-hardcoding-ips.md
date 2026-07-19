---
layout: post
title: "How do containers talk to each other without hardcoding IP addresses?"
date: 2026-07-18 09:00:00 +0530
categories: kubernetes
tags: [kubernetes, services, dns, kube-proxy, endpointslices]
---

## 1. The Engineering Problem: the volatile IP address

You have a **Frontend** web app that needs to call a **Backend** API over HTTP.

On a VM, you'd give the Backend a static IP (`192.168.1.50`) and paste it into the Frontend's config. Done.

In Kubernetes that approach is broken by design, because **pods are ephemeral**. If the Backend pod crashes, gets OOM-killed, or its node is drained for maintenance, Kubernetes deletes it and schedules a brand-new pod — with a **brand-new, random IP**. Any Frontend holding the old IP is now talking to nothing.

You cannot chase pod IPs by hand. You need a **stable address that never changes**, even as the pods behind it are destroyed and recreated a thousand times.

---

## 2. The Kubernetes Solution: the `Service` object

Kubernetes inserts a permanent routing layer *in front of* the volatile pods. That layer is a **Service**. It has a stable virtual IP (the ClusterIP) and a permanent DNS name. Clients talk to the Service; the Service tracks whichever pods are currently alive and healthy.

**Macro view — the routing layer in front of volatile pods:**

```
[ Frontend Pod ]
       │  http://backend:80   (DNS name, never changes)
       ▼
┌───────────────────────────────────────────────┐
│  Service: backend                              │
│  ClusterIP: 10.96.0.10   (virtual, stable)     │
│  selector: app=my-backend                      │
└───────────────────────────────────────────────┘
       │  kube-proxy rewrites dest IP → a live pod
       ├─► 10.244.1.5   (backend pod, Ready)
       └─► 10.244.2.82  (backend pod, Ready)
             ▲
             └─ a NOT-Ready pod is NOT in this list — it receives no traffic
```

**Zoom in — the exact timeline this lesson opened with** (a backend pod
crashing mid-traffic; this is what Q1/Q7 below are actually describing):

```
t=0s     EndpointSlice for "backend": [10.244.1.5 (Ready), 10.244.2.82 (Ready)]
         kube-proxy's iptables/IPVS rules route to both.

t=1s     backend pod 10.244.1.5 crashes / is OOM-killed.
         EndpointSlice controller notices the pod is gone almost immediately:
         EndpointSlice for "backend": [10.244.2.82 (Ready)]
         kube-proxy reprograms rules within milliseconds — 10.244.1.5 is
         no longer a DNAT target, so in-flight retries land only on .82.

t=2s     Deployment's ReplicaSet creates a REPLACEMENT pod: 10.244.1.9
         (new IP, new UID — the crashed pod is never "restarted in place")

t=2s..   new pod is NOT yet in the EndpointSlice — it's excluded until its
         readinessProbe passes at least once, same gate as any other pod.

t=12s    10.244.1.9 passes its readinessProbe.
         EndpointSlice for "backend": [10.244.2.82 (Ready), 10.244.1.9 (Ready)]
         kube-proxy adds it back to the routing set — traffic resumes to it.
```

The three things to hold onto:

1. The **ClusterIP is virtual** — it isn't bound to any network interface. It exists only as routing rules that `kube-proxy` programs on every node.
2. The Service finds its pods by **label selector**, not by IP.
3. Only **Ready** pods are in the routing set. Readiness is the on/off switch for traffic.

---

## 3. The clean YAML (the concept in isolation)

Pod stamped with a label:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: backend-pod
  labels:
    app: my-backend        # the identity tag the Service will look for
spec:
  containers:
  - name: api
    image: mycompany/api:v1
    ports:
    - containerPort: 8080
```

Service that selects it:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend            # becomes the DNS name: backend.<namespace>.svc.cluster.local
spec:
  selector:
    app: my-backend        # matches any pod carrying this exact label
  ports:
  - protocol: TCP
    port: 80               # port clients hit ON THE SERVICE
    targetPort: 8080       # port the container actually listens on
```

Frontend code just calls `http://backend:80`. Kubernetes does the rest.

That's the mental model. Now here's what it looks like when it's carrying real traffic.

---

## 4. Production reality: the same pattern in a real repo

Here is the **actual** manifest for the `frontend` service of Google's Online Boutique — a real, 11-service microservice app. I've trimmed the license header; everything else is verbatim, annotated.

### 4a. The Deployment — notice how it finds the *other* services

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  labels:
    app: frontend
spec:
  selector:
    matchLabels:
      app: frontend          # Deployment owns pods with this label...
  template:
    metadata:
      labels:
        app: frontend        # ...and stamps the SAME label on the pods it creates.
    spec:
      containers:
        - name: server
          image: frontend
          ports:
          - containerPort: 8080
          readinessProbe:                # <-- THIS is what gates Service traffic
            initialDelaySeconds: 10
            httpGet:
              path: "/_healthz"
              port: 8080
          env:
          # Service discovery in the real world: NOT one backend, but NINE,
          # each addressed by its Service DNS name + port. Zero IP addresses.
          - name: PRODUCT_CATALOG_SERVICE_ADDR
            value: "productcatalogservice:3550"
          - name: CURRENCY_SERVICE_ADDR
            value: "currencyservice:7000"
          - name: CART_SERVICE_ADDR
            value: "cartservice:7070"
          - name: RECOMMENDATION_SERVICE_ADDR
            value: "recommendationservice:8080"
          - name: SHIPPING_SERVICE_ADDR
            value: "shippingservice:50051"
          - name: CHECKOUT_SERVICE_ADDR
            value: "checkoutservice:5050"
          - name: AD_SERVICE_ADDR
            value: "adservice:9555"
          resources:
            requests: { cpu: 100m, memory: 64Mi }
            limits:   { cpu: 200m, memory: 128Mi }
```

**What this teaches that a hello-world can't:**

- **Discovery is DNS, at scale.** The frontend reaches nine backends purely by name — `cartservice:7070`, `shippingservice:50051`, etc. Not a single IP is hardcoded anywhere in a real production app. Every one of those names resolves through the Service layer.
- **The readiness probe is the traffic gate.** `/_healthz` on port 8080 is not decoration. Until it passes, this pod's IP is kept *out* of the Service's routing set, so no user request is ever sent to a pod that isn't ready to serve. (Details in the question bank — this is the single most-missed production fact about Services.)
- **The label contract is explicit.** `selector.matchLabels.app: frontend` (what the Deployment owns) and the pod template's `labels.app: frontend` (what gets stamped) must agree, and the Service's selector will key off that same label. Three places, one label — break the agreement and traffic silently goes nowhere.

### 4b. Two Services, same pods, different jobs

```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  type: ClusterIP            # internal-only. The default. For east-west (in-cluster) traffic.
  selector:
    app: frontend
  ports:
  - name: http               # NAMED port — production habit; lets other objects refer to "http"
    port: 80
    targetPort: 8080
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-external
spec:
  type: LoadBalancer         # asks the cloud for a real external IP / L4 load balancer
  selector:
    app: frontend            # SAME selector — both Services front the exact same pods
  ports:
  - name: http
    port: 80
    targetPort: 8080
```

**What this teaches:**

- **Service *type* is how you choose exposure.** `ClusterIP` (internal, the default), `NodePort` (opens a port on every node), `LoadBalancer` (provisions a cloud L4 balancer + external IP), and `ExternalName` (a DNS CNAME to something outside). Same object, four reach levels.
- **One set of pods can back multiple Services.** Here the identical `app: frontend` selector is fronted by an internal ClusterIP *and* an external LoadBalancer — internal callers use `frontend`, the internet comes in via `frontend-external`. You don't duplicate pods to expose them differently; you add a Service.
- **Named ports (`name: http`)** are standard in production because other objects (Ingress, NetworkPolicy, monitoring) can then reference the port by name instead of a brittle number.

---

## 5. Question Bank (control-plane depth — the mental-model test)

**Q1. When a pod restarts and gets a new IP, how does the Service learn the new IP so fast?**
A control-plane controller *watches* the API for pod changes and republishes the Service's backing address list within milliseconds. Classically this was the **Endpoints** object (the `Endpoints` controller). **Modern Kubernetes (v1.19+) uses `EndpointSlices`** — the `EndpointSlice` controller writes the pod IPs, ports, and per-address `ready` conditions into sliced objects that scale far better than one giant Endpoints blob. `kube-proxy` and DNS consume those slices to reprogram routing. *(If an interviewer says "Endpoints object," the sharper answer is "EndpointSlices now — Endpoints is the legacy compatibility view.")*

**Q2. Does a pod receive Service traffic the instant it starts?**
No. A pod's IP is only added to the Service's routing set (as an endpoint with `ready: true`) **after its readiness probe passes**. That's the whole point of `readinessProbe` in the Online Boutique manifest above: a booting or unhealthy pod is deliberately excluded, so users never hit a pod that can't serve. Remove the readiness probe and you route traffic into cold/broken pods.

**Q3. If I scale the backend to 3 pods, do I need 3 Services?**
No — one Service. Its selector matches all 3 labelled pods, and it load-balances across the Ready ones. **But the distribution is not naive round-robin:** in `kube-proxy`'s default **iptables** mode, a request is sent to a **randomly chosen** endpoint using probability rules (statistically even, not strictly sequential). In **IPVS** mode you get real algorithms (`rr` round-robin, `lc` least-connection, etc.), which is why large clusters prefer IPVS. Newer clusters may also run the **nftables** proxy mode.

**Q4. The ClusterIP — where does that IP actually "live"?**
Nowhere physical. It's a **virtual IP** not assigned to any NIC. `kube-proxy` runs on every node and programs kernel rules (iptables/IPVS/nftables) so that any packet destined for `10.96.0.10:80` is **DNAT'd** to a real pod IP:port. There's no process listening on the ClusterIP — it's pure packet rewriting at the kernel level.

**Q5. What actually resolves `cartservice:7070` to an address?**
**CoreDNS** (the in-cluster DNS server). Every Service gets an A/AAAA record at `<service>.<namespace>.svc.cluster.local`. The short name `cartservice` works because `/etc/resolv.conf` in each pod has a `search` list (e.g. `default.svc.cluster.local svc.cluster.local cluster.local`) and `ndots:5`. **Production gotcha:** `ndots:5` means any name with fewer than 5 dots is tried against every search domain *first*, so an external lookup like `api.stripe.com` can fire several failed cluster queries before succeeding — a classic source of mysterious DNS latency.

**Q6. When would you set `clusterIP: None` (a headless Service)?**
For a **headless Service**, DNS returns the **individual pod IPs** instead of one virtual ClusterIP — no kube-proxy load balancing. You use it when clients need to address specific pods directly: **StatefulSets** (so `pod-0`, `pod-1` get stable per-pod DNS), databases with primary/replica awareness, or clients that do their own balancing (many gRPC setups).

**Q7. A client can't reach a Service even though pods are running. What are the first two things you check?**
(1) **Selector/label mismatch** — does the Service `selector` exactly match the pod labels? A typo means zero endpoints. Check with `kubectl get endpointslices` (or `kubectl describe svc`): if the endpoint list is empty, it's almost always labels or readiness. (2) **Readiness** — are the pods actually passing their readiness probe? Running ≠ Ready; a failing probe keeps the pod out of the endpoint set even though it shows as `Running`.

---

## Source

- **Concept:** Kubernetes `Service`, service discovery, and the networking control plane
- **Domain:** kubernetes
- **Repo:** [GoogleCloudPlatform/microservices-demo](https://github.com/GoogleCloudPlatform/microservices-demo) → [`kubernetes-manifests/frontend.yaml`](https://github.com/GoogleCloudPlatform/microservices-demo/blob/main/kubernetes-manifests/frontend.yaml) — Google's "Online Boutique," an 11-microservice reference app
