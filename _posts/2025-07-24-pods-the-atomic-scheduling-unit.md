---
layout: post
title: "Kubernetes Pods: Why Kubernetes Schedules Pods, Not Bare Containers"
description: "Learn why Kubernetes schedules Pods, not containers. How the pause container, shared network namespace, and Pod lifecycle work — with a real productcatalogservice manifest from Google's microservices-demo."
date: 2025-07-24 09:00:00 +0530
categories: kubernetes
order: 1
tags: [kubernetes, pods, kubelet, containers]
---

**TL;DR:** Why does Kubernetes never schedule a single bare container? Because sidecars need the same node, the same IP, and the same lifecycle as the container they sit next to — so Kubernetes schedules a **Pod**, not a container, and lets the kubelet manage the whole group as one unit.

> **In plain English (30 sec):** Think of a Pod like a small VM holding containers sharing same IP — like containers on localhost.

**Real repo:** [`GoogleCloudPlatform/microservices-demo`](https://github.com/GoogleCloudPlatform/microservices-demo)

## 1. The Engineering Problem: containers that need to live together

Say you're running a gRPC service, and you also want a sidecar process next to it — a service-mesh proxy, a log shipper, or a init step that fetches a TLS cert before the app boots. On a single VM you'd probably just run both processes with `docker run`, give them a shared bind-mount for logs, and let them talk over `localhost`.

Try to do that with independent containers on a cluster and it falls apart immediately:

- **No atomic placement.** Nothing guarantees the app container and its sidecar land on the *same node*. You'd have to hand-write that constraint yourself, every time.
- **No shared network identity.** Two independently-scheduled containers get two different IPs. "Talk to your sidecar on `localhost`" simply doesn't work — you're back to service discovery for two processes that are supposed to be inseparable.
- **No single lifecycle.** If the app crashes but the sidecar doesn't (or vice versa), what's the unit of "healthy"? Who decides to restart what, and does the replacement land next to its partner again?

You need a boundary that is smaller than "a whole application" but bigger than "a single container" — a unit the scheduler places *once*, as a whole, and the per-node agent manages *together*.

---

## 2. The Technical Solution: the Pod

Kubernetes' scheduler never places a container. It places a **Pod** — one or more containers that share a network namespace (one IP, `localhost` between them), can share volumes, and share a lifecycle. The **kubelet** (the per-node agent) is the thing that actually keeps a Pod's containers running, restarting the ones that crash according to `restartPolicy`.

```mermaid
flowchart TD
    subgraph Node
        kubelet(["kubelet"]) -- "talks via CRI" --> CRI["containerd / CRI-O"]
        subgraph Pod["Pod: productcatalogservice-7d9f-xk2p1"]
            Sandbox["Pod sandbox (pause container)<br/>owns: network namespace (1 Pod IP), IPC"]
            App["app: server<br/>joins netns"]
            Sidecar["sidecar (opt.)<br/>joins same netns"]
            App <-->|localhost| Sidecar
            App -.->|"mounts same Volume"| Vol[("shared Volume")]
            Sidecar -.->|"mounts same Volume"| Vol
        end
        CRI --> Sandbox
    end
```

Three things to hold onto:

1. **Every container shares the same network namespace, not just the same IP.** That's why they can reach each other over `127.0.0.1:<port>` — plain localhost — rather than routing through the Pod IP at all; the Pod IP is what the *outside world* uses to reach the Pod, not what containers use to reach each other.
2. **You never see the thing that makes this work.** The kubelet, talking to the container runtime over the **CRI (Container Runtime Interface)**, creates an infrastructure ("pause") container first — it's the one that actually holds the network namespace open. Your app container(s) then join *that* namespace. It never appears in your YAML.
3. **Pods are mortal, and never rescheduled in place.** If a Pod dies, nothing "restarts the Pod" onto a new node — a *controller* (Deployment, StatefulSet, DaemonSet...) creates a brand-new Pod object, with a new UID and usually a new IP. The Pod itself has no self-healing power across nodes; that's the controller's reconcile loop, not the Pod's.
4. **Namespace sharing is opt-in for processes, not just network.** `shareProcessNamespace: true` on the Pod spec (default `false`) goes a step further than networking and volumes — it makes every container's processes visible to every other container via `ps` and `/proc/$pid/root`, which teams enable for debugging sidecars. It has a real side effect worth knowing before you flip it on: the pause container becomes PID 1 inside the shared namespace, so a container that assumes *it* is PID 1 (e.g. one running `systemd`) can misbehave or refuse to start.

**Correcting a stale fact:** if you learned Kubernetes before 2022, you may have learned "the kubelet talks to Docker." As of **Kubernetes v1.24, dockershim was removed from the kubelet entirely.** The kubelet now speaks CRI directly to a CRI-compliant runtime — almost always **containerd** or **CRI-O** today. Docker Engine, if present at all, is no longer in the loop.

---

## 3. The clean example (the concept in isolation)

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: report-generator
spec:
  # Pod-level: applies to every container and every volume in this Pod
  restartPolicy: Always          # default; kubelet restarts crashed containers in place
  terminationGracePeriodSeconds: 10

  volumes:
  - name: shared-output           # a volume both containers below can mount
    emptyDir: {}

  containers:
  - name: app                     # generates a report file
    image: mycompany/report-app:v1
    volumeMounts:
    - name: shared-output
      mountPath: /output

  - name: shipper                 # sidecar: ships whatever "app" writes to /output
    image: mycompany/log-shipper:v1
    volumeMounts:
    - name: shared-output
      mountPath: /output
    env:
    - name: UPSTREAM
      value: "http://localhost:9000"   # <-- talks to "app" over localhost, same Pod
```

Two containers, one Pod: they share an IP (so `localhost` works), share a volume (so `/output` is the same directory in both), and share a lifecycle (kill the Pod, both containers go with it).

That's the isolated mechanism. Production Pods are almost always *authored indirectly* — as the `template:` inside a Deployment — so here's what that actually looks like.

---

## 4. Production reality (from the real repo)

Here is the **actual** manifest for the `productcatalogservice` in Google's Online Boutique (`microservices-demo`). License header trimmed; everything else verbatim, annotated for what's Pod-level vs container-level.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: productcatalogservice
  # ... labels and the selector are elided; unremarkable Deployment boilerplate ...
spec:
  template:                                # <-- THIS block is the actual Pod spec.
    # ... template metadata elided ...
    spec:
      # Pod-level identity: ALL containers in this Pod authenticate to the
      # API server as this ServiceAccount.
      serviceAccountName: productcatalogservice

      # Pod-level. Default is 30s — this app overrides it down to 5s because
      # a stateless gRPC service shuts down fast, and a slow grace period
      # means every rollout/scale-down takes longer.
      terminationGracePeriodSeconds: 5

      # Pod-level security fields: apply to every container AND every
      # mounted volume in this Pod (e.g. fsGroup sets group ownership of
      # volume contents).
      securityContext:
        fsGroup: 1000
        runAsGroup: 1000
        runAsNonRoot: true
        runAsUser: 1000

      containers:
      - name: server
        # Container-level: these fields can only be set per-container, never
        # at the Pod level — each container gets its own kernel capability set.
        securityContext:
          allowPrivilegeEscalation: false
          capabilities:
            drop:
              - ALL
          privileged: false
          readOnlyRootFilesystem: true
        image: productcatalogservice
        # ... ports and env vars elided; not central to the Pod-vs-container scoping point ...

        # Container-level, but the Pod's overall "Ready" condition is the
        # AND of every container's readiness.
        readinessProbe:
          grpc:
            port: 3550
        # ... livenessProbe elided; same shape as readinessProbe above ...

        # Per-container. A Pod's total resource footprint is the SUM across
        # containers — there's no single "Pod resources" field.
        resources:
          requests:
            cpu: 100m
            memory: 64Mi
          limits:
            cpu: 200m
            memory: 128Mi
```

(Service and ServiceAccount objects follow in the same file — omitted here since this lesson is about the Pod, not the routing layer.)

**What this teaches that a hello-world can't:**

- **Two different `securityContext` blocks, two different scopes.** `fsGroup`/`runAsUser`/`runAsNonRoot` at the *Pod* level shape the whole sandbox (and volume ownership); `allowPrivilegeEscalation`/`capabilities`/`readOnlyRootFilesystem` at the *container* level are per-container hardening. Mixing these up is one of the most common manifest review mistakes.
- **A tuned `terminationGracePeriodSeconds`.** The 30-second default is a guess that fits nothing in particular. This team measured their shutdown path and cut it to 5s — a small production detail that never shows up in tutorials, because tutorials don't scale-down under load.
- **A single-container Pod is still "a Pod."** There's no special "simple mode" — this manifest goes through the exact same sandbox/network-namespace machinery as the two-container example above, just with one tenant instead of two.
- **`serviceAccountName` lives on the Pod, not the container.** In a multi-container Pod, every container shares that identity — you cannot give the sidecar a different API server identity than the app without a second Pod.

**When reviewing a Pod manifest, check:**

1. **`securityContext` scope** — Pod-level (`fsGroup`, `runAsUser`, `runAsNonRoot`) and container-level (`capabilities`, `allowPrivilegeEscalation`, `readOnlyRootFilesystem`) aren't interchangeable; confusing the two is one of the most common review misses.
2. **`terminationGracePeriodSeconds`** — is the 30s default actually right for this workload's real shutdown path, or was it never tuned?
3. **`serviceAccountName` scope** — every container in this Pod shares this identity; a sidecar needing a different one needs its own Pod.
4. **`resources` sum, not per-Pod** — a Pod's real footprint is the sum of every container's `requests`/`limits`, not any single container's numbers.

---

## FAQ

### What is a pause container in Kubernetes?
The pause container is a small infrastructure container the kubelet creates first for every Pod. It holds the Pod's network namespace (and IPC namespace) open; the app container(s) then join that same namespace — which is why they share one Pod IP and can reach each other over `127.0.0.1`.

### How do containers in the same Pod communicate?
They share the same network namespace, so they talk over `127.0.0.1:<port>` — plain localhost, not the Pod IP. They can also share files through a common volume, such as the `emptyDir` in the clean example above.

### What is the difference between a Pod and a container?
A container is a single running image. A Pod is Kubernetes' atomic scheduling and lifecycle unit — one or more containers that the scheduler always places together, that share a network namespace and (optionally) volumes, and that live and die as one unit.

### Why was dockershim removed in Kubernetes v1.24?
dockershim was a compatibility shim that let the kubelet talk to Docker Engine, which never natively implemented the CRI (Container Runtime Interface). Removing it let the kubelet speak CRI directly to CRI-native runtimes like containerd and CRI-O. Docker-built images still run fine everywhere, since they're OCI-compliant — only the runtime's Docker-specific control path was removed, not Docker's image format.

### Are Pods ever moved to another node after they're scheduled?
No. A Pod is bound to the node it was scheduled on for its whole life; if that node fails or the Pod is deleted, nothing relocates the existing Pod object. A controller (Deployment, StatefulSet, DaemonSet...) creates a brand-new Pod — new UID, usually a new IP — which the scheduler then places independently, possibly on a different node.

---

## Source

- **Concept:** Kubernetes `Pod` — the atomic scheduling and lifecycle unit
- **Domain:** kubernetes
- **Repo:** [GoogleCloudPlatform/microservices-demo](https://github.com/GoogleCloudPlatform/microservices-demo) → [`kubernetes-manifests/productcatalogservice.yaml`](https://github.com/GoogleCloudPlatform/microservices-demo/blob/main/kubernetes-manifests/productcatalogservice.yaml) — Google's "Online Boutique," an 11-microservice reference app

---

**Next in the Kubernetes series:** [Who actually recreates a crashed Pod, and how do you update one without downtime? →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})




