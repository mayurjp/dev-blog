---
layout: post
title: "If a dependency is dying, should your own code have to notice?"
date: 2026-08-01 09:00:00 +0530
categories: microservices
tags: [microservices, circuit-breaker, istio, service-mesh, resilience]
---

## 1. The Engineering Problem

In a distributed call graph, failure is rarely a clean "up" or "down."
More often, a downstream dependency gets slow — its response times creep
up, its connections start queuing — and every caller keeps sending it
requests exactly as before. Those requests pile up on the struggling
service, threads and connections block waiting for responses that arrive
too late to matter, and the slowdown propagates backward into every caller
that depends on it. One overloaded service turns into a cascading outage
across the graph.

The traditional fix was a **circuit breaker**: after enough consecutive
failures, stop sending requests to that dependency for a while, fail fast
instead, and periodically test whether it's recovered. The traditional
*implementation* of that fix was a library — Hystrix, most famously —
wrapped around every outbound call, in every service, in every language a
company happened to use.

That's the part worth re-examining. If your system is polyglot — Go,
Java, Python, C#, Node, all calling each other — a library-based circuit
breaker means implementing (and keeping consistent) the same resilience
logic five separate times, once per language runtime.

## 2. The Technical Solution: circuit breaking as infrastructure, not library code

The mechanism hasn't changed — limit concurrent load, eject unhealthy
endpoints, let them back in gradually — but where it *runs* has, once a
service mesh is in the picture. A sidecar proxy (Envoy, via Istio) sits
next to every service instance and intercepts every outbound call, for
every service, in every language, without any application code involved.

```
   caller's pod                          callee's pod
┌────────────────┐                    ┌────────────────┐
│  app container  │                    │  app container  │
│       │          │                   │       ▲          │
│       ▼          │                    │       │          │
│  ┌───────────┐  │   HTTP/gRPC call   │  ┌───────────┐  │
│  │  sidecar  │──┼────────────────────┼─▶│  sidecar  │  │
│  │  (Envoy)  │  │  connectionPool    │  │  (Envoy)  │  │
│  └───────────┘  │  limits +          │  └───────────┘  │
└────────────────┘  outlierDetection   └────────────────┘
                     applied HERE, before
                     the request even leaves
```

Core truths to hold:

- **"Circuit breaking" is actually two distinct mechanisms people
  conflate.** Connection/request limiting is *proactive* — refuse before
  you overload. Outlier detection is *reactive* — eject an endpoint only
  after it's already shown a run of failures.
- **Ejection is temporary, not permanent.** An ejected endpoint returns to
  the pool after a base ejection time — the mesh equivalent of a circuit
  breaker's "half-open" state, periodically letting traffic back in to test
  recovery.
- **Correcting a stale fact, with a citation, not a guess:** Hystrix's own
  README states it plainly — *"Hystrix is no longer in active development,
  and is currently in maintenance mode"* — with its last release, 1.5.18,
  shipped in 2018. Netflix's own guidance is to use resilience4j for new
  in-application work. But the more consequential shift for a polyglot
  system isn't "which library" — it's that this logic can move out of
  application code entirely and become infrastructure config applied
  uniformly, regardless of what language a given service is written in.

## 3. The clean example (concept in isolation)

The mechanism isolated to its two knobs, with no other traffic-management
concerns mixed in:

```yaml
# destination-rule-minimal.yaml
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: payments
spec:
  host: payments
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 50        # proactive: cap concurrent connections
      http:
        http1MaxPendingRequests: 50
    outlierDetection:
      consecutive5xxErrors: 5     # reactive: eject after 5 consecutive 5xxs
      interval: 10s
      baseEjectionTime: 30s       # how long an ejected instance stays out
      maxEjectionPercent: 50      # never eject more than half the pool at once
```

No application code changes. This is a Kubernetes custom resource applied
with `kubectl apply`; the `payments` service doesn't know it exists.

## 4. Production reality (from the real repo)

[istio/istio](https://github.com/istio/istio) ships the `bookinfo` sample
specifically to demonstrate mesh traffic management, and Istio's own
task documentation — a file in the same project, continuously tested as
part of Istio's docs pipeline (`test: yes` in its front matter) — carries
the canonical, runnable circuit-breaking `DestinationRule` applied against
the `httpbin` sample:

```yaml
# istio.io/content/en/docs/tasks/traffic-management/circuit-breaking/index.md
# (the DestinationRule embedded in this CI-tested task page)
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: httpbin
spec:
  host: httpbin
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 1              # deliberately tiny — see note below
      http:
        http1MaxPendingRequests: 1
        maxRequestsPerConnection: 1
    outlierDetection:
      consecutive5xxErrors: 1
      interval: 1s
      baseEjectionTime: 3m
      maxEjectionPercent: 100
```

Applying it, Istio's own docs then trip the breaker deliberately with a
load-testing client (`fortio`) sending concurrent requests, and the
response headers from a *successful* call already show the proxy layer at
work before any breaker even trips:

```
X-B3-Traceid: 86a929a0e76cda378fc453fb1dec2c22
X-B3-Spanid: 071d7f06bc94943c
X-B3-Parentspanid: 8fc453fb1dec2c22
X-B3-Sampled: 1
```

For comparison, `bookinfo`'s own shipped `DestinationRule`s — the ones
actually running the sample app — carry no `trafficPolicy` at all:

```yaml
# samples/bookinfo/networking/destination-rule-all.yaml (trimmed)
apiVersion: networking.istio.io/v1
kind: DestinationRule
metadata:
  name: reviews
spec:
  host: reviews
  subsets:
  - name: v1
    labels:
      version: v1
  - name: v2
    labels:
      version: v2
  - name: v3
    labels:
      version: v3
```

What this teaches that a hello-world can't:

- **`maxConnections: 1` / `http1MaxPendingRequests: 1` /
  `maxRequestsPerConnection: 1` are absurdly low on purpose.** These
  values exist so the docs task can trip the breaker on demand, in minutes,
  for a demo — they are not production sizing. A real `DestinationRule`
  sets these to the dependency's actual measured capacity, not to 1.
- **`consecutive5xxErrors: 1` with `baseEjectionTime: 3m` is a passive
  circuit breaker.** Envoy isn't polling a health endpoint here — it's
  counting failures on *real* traffic and ejecting reactively. That's a
  materially different mechanism from an active health check, and knowing
  which one is configured matters when debugging why a healthy-looking
  instance is being skipped.
- **`maxEjectionPercent: 100` is itself a real, load-bearing production
  knob** — normally used to cap what fraction of a pool can be ejected at
  once, so a bad outlier-detection config can't accidentally take *every*
  instance out and turn a partial failure into a total one. This demo sets
  it to 100 deliberately, to make the failure total and the lesson
  unambiguous — not as a value to copy into production.
- **`bookinfo`'s own `DestinationRule`s ship with subsets but no
  `trafficPolicy`** — proof that version-based routing (subsets, used for
  canary/traffic-splitting) and resilience policy (`trafficPolicy`) are
  separate concerns riding the same CRD. Production configs frequently
  need one without the other; they aren't a package deal.
- **None of this is Go, Java, Python, or C# code.** It's a Kubernetes
  resource applied once, mesh-wide, per hostname. A polyglot system like
  the one in this series' first lesson — Go, Java, Python, C#, and Node
  services calling each other over gRPC — gets identical breaker behavior
  for every one of those services without a single one of them importing a
  resilience library.

---

## Source

- **Concept:** Circuit breakers & resilience
- **Domain:** microservices
- **Repo:** [istio/istio](https://github.com/istio/istio) → [`samples/bookinfo/networking/destination-rule-all.yaml`](https://github.com/istio/istio/blob/master/samples/bookinfo/networking/destination-rule-all.yaml) (mesh, `bookinfo` sample), plus [istio/istio.io](https://github.com/istio/istio.io) → [`content/en/docs/tasks/traffic-management/circuit-breaking/index.md`](https://github.com/istio/istio.io/blob/master/content/en/docs/tasks/traffic-management/circuit-breaking/index.md) (CI-tested docs task, `httpbin` sample) — Istio service mesh, mesh-layer traffic management
