---
layout: post
title: "Self-service infrastructure: provisioning without tickets, with guardrails"
description: "Self-service means developers provision what they need through an abstraction, while the platform team enforces policy underneath. Uses HashiCorp Waypoint's waypoint.hcl as a real build/deploy abstraction."
date: 2026-08-14 09:00:00 +0530
categories: platform-engineering
order: 3
tags: [platform-engineering, self-service, waypoint, guardrails, infrastructure]
---

**TL;DR:** *How do developers get infrastructure without filing a ticket and waiting three days — without also handing them a loaded gun?* Self-service: an abstraction they control, with guardrails the platform enforces underneath.

**Real repo:** [hashicorp/waypoint](https://github.com/hashicorp/waypoint)

## 1. The Engineering Problem

The ticket queue is where developer velocity goes to die. "I need a Redis instance." "I need a new environment." "I need to deploy this." Each becomes a Jira ticket, a Slack ping, and a context switch for a platform engineer who is now a human API with a multi-day latency.

But the naive fix — give everyone admin — is worse. Unbounded access means cost blowups, security holes, and inconsistent infrastructure that nobody can reason about.

**Self-service infrastructure** threads the needle: developers describe *what* they want in a high-level abstraction, and the platform decides *how* to fulfill it, applying policy (quotas, allowed regions, required tags, approved base images) automatically. No ticket, no admin keys.

## 2. The Technical Solution

The mechanism is a **declarative abstraction** that developers own plus a **fulfillment engine** the platform owns. HashiCorp Waypoint is a clean example: developers write a `waypoint.hcl` describing build/deploy/release in high-level terms, and Waypoint's plugins translate that into the concrete cloud operations — the developer never touches the Dockerfile-to-Kubernetes plumbing.

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant Abstraction as waypoint.hcl
    participant Engine as Waypoint Runner
    participant Policy as Guardrail (labels/registry/probe)
    participant Cloud as Kubernetes / Cloud
    Dev->>Abstraction: Declare build/deploy/release intent
    Dev->>Engine: waypoint up
    Engine->>Policy: Apply plugin defaults + constraints
    Policy->>Cloud: Build image, deploy, release
    Cloud-->>Engine: Endpoint + status
    Engine-->>Dev: URL returned (no ticket filed)
    Note over Dev,Cloud: Developer declares intent, platform enforces how

    class Abstraction,Engine,Policy platform
    class Cloud infra
    class Dev user
    classDef platform fill:#2563eb,color:#fff
    classDef infra fill:#dc2626,color:#fff
    classDef user fill:#16a34a,color:#fff
```

Three core truths:

1. **Intent, not implementation.** The developer says "deploy to kubernetes", not "here are 200 lines of manifests".
2. **Guardrails live in the fulfillment layer.** Registry, probes, labels, and load balancer config are set by the platform's plugin config, not per developer.
3. **Self-service ≠ no control.** It is *automated* control — policy runs on every `up`, replacing the human reviewer.

## 3. The clean example

The simplest self-service declaration — build with Cloud Native Buildpacks, deploy to Docker, zero Dockerfile:

```hcl
project = "example-nodejs"

app "example-nodejs" {
  labels = {
    "service" = "example-nodejs",
    "env"     = "dev"
  }

  build {
    use "pack" {}     # buildpacks: no Dockerfile the dev has to maintain
  }

  deploy {
    use "docker" {}   # platform picks the target
  }
}
```

The developer never wrote a Dockerfile, never touched a registry command. `use "pack" {}` is the guardrail: everyone gets the same buildpack-based image, consistently.

## 4. Production reality

A production-grade `waypoint.hcl` targeting Kubernetes shows where the guardrails actually bite — the registry, the health probe, and the release load balancer are all platform-owned defaults:

> **Where things live (waypoint-examples repo):**
> ```
> waypoint-examples/
> ├── docker/nodejs/waypoint.hcl        # simple: build + deploy
> └── kubernetes/nodejs/waypoint.hcl    # full: build + registry + deploy + release
> ```

```hcl
project = "kubernetes-nodejs"

app "kubernetes-nodejs-web" {
  labels = {
    "service" = "kubernetes-nodejs-web",
    "env"     = "dev"
  }

  build {
    use "pack" {}
    # registry: platform dictates WHERE images go — a guardrail
    registry {
      use "docker" {
        image = "kubernetes-nodejs-web"
        tag   = "1"
        local = true
      }
    }
  }

  deploy {
    use "kubernetes" {
      # probe_path: platform enforces a health check on every deploy
      probe_path = "/"
    }
  }

  release {
    use "kubernetes" {
      # load_balancer + port: release policy owned by the platform
      load_balancer = true
      port          = 3000
    }
  }
}
```

**What this teaches:** the developer's file is short and declarative, but each `use` block is an injection point where the platform enforces standards — you *must* have a `probe_path`, images *must* go to the approved registry, releases *must* go through the defined load balancer. That's self-service *with* guardrails, not self-service *instead of* guardrails.

**Stale facts worth correcting:**
- *"Self-service means developers get admin."* No — it means they get a constrained, automated path. Admin access is the anti-pattern this replaces.
- *"Golden paths / paved roads are a hard lock-in."* No — they are opinionated defaults *with escape hatches*. Waypoint lets you swap plugins or drop to raw manifests when a use case genuinely needs it.
- *"Platform engineering is just DevOps renamed."* No — self-service infra is a **product** with an SLA to internal users; DevOps is the culture that motivates it.

## 5. Review checklist

- Can a developer provision the common case with zero tickets and zero admin credentials?
- Are guardrails (registry, probes, quotas, regions) enforced in the fulfillment layer, not by convention?
- Is the developer-facing spec declarative *intent*, not raw implementation?
- Is there a documented escape hatch for the genuine exceptions?

## 6. FAQ

**Isn't self-service just a fancy CLI?** The CLI (`waypoint up`) is the trigger. The value is that the *fulfillment* applies policy automatically — that's the difference from a raw script.

**What stops a developer from over-provisioning?** Guardrails in the fulfillment layer: quotas, approved plugins, required labels. The abstraction simply doesn't expose the dangerous knobs.

**Does Waypoint replace Terraform?** No — Waypoint focuses on the build/deploy/release workflow for apps. Terraform provisions the underlying infra. They compose.

**What are buildpacks doing here?** `use "pack" {}` produces a container image from source without a Dockerfile, so every service gets a consistent, patched base — a guardrail disguised as convenience.

**Is Waypoint still the tool to pick in 2026?** HashiCorp sunset active Waypoint development, but its `waypoint.hcl` model remains one of the clearest teaching examples of a self-service build/deploy abstraction — which is why it's used here as a concept illustration.

## Source

- **Concept:** Self-service infrastructure — provisioning without tickets, guardrails in the fulfillment layer
- **Domain:** platform-engineering
- **Repo:** [hashicorp/waypoint-examples](https://github.com/hashicorp/waypoint-examples) → [kubernetes/nodejs/waypoint.hcl](https://github.com/hashicorp/waypoint-examples/blob/main/kubernetes/nodejs/waypoint.hcl) — full build/registry/deploy/release abstraction with guardrails
- **Repo:** [hashicorp/waypoint-examples](https://github.com/hashicorp/waypoint-examples) → [docker/nodejs/waypoint.hcl](https://github.com/hashicorp/waypoint-examples/blob/main/docker/nodejs/waypoint.hcl) — minimal buildpack self-service declaration




