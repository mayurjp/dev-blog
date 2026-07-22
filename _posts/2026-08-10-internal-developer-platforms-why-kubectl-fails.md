---
layout: post
title: "Internal Developer Platforms: why kubectl doesn't scale as a developer interface"
description: "An IDP is a product-managed layer that turns raw infrastructure into self-service golden paths. Here's why handing developers kubectl fails, using the CNOE idpbuilder reference stack."
date: 2026-08-10 09:00:00 +0530
categories: platform-engineering
order: 1
tags: [platform-engineering, idp, kubernetes, backstage, cnoe]
---

**TL;DR:** *How do you give 200 developers safe access to Kubernetes without turning each of them into a cluster operator?* You build an Internal Developer Platform — a product-managed abstraction over infrastructure — instead of handing everyone `kubectl`.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


**Real repo:** [cnoe-io/idpbuilder](https://github.com/cnoe-io/idpbuilder)

## 1. The Engineering Problem

`kubectl apply -f` is a fine interface for a platform engineer. It is a terrible interface for a product developer who wants to ship a service.

The moment you hand a full cluster to application teams, every developer must learn: Deployments vs. StatefulSets, resource requests and limits, RBAC, network policies, ingress controllers, secret management, and the twelve ways a Pod can fail to schedule. This is unbounded **cognitive load** dumped onto people whose actual job is writing business logic.

The failure modes are predictable:

- Copy-pasted YAML that nobody understands, drifting per team.
- No guardrails — a bad `resources` block starves a node.
- Every team reinvents CI/CD, secrets, and observability wiring.
- Platform team becomes a ticket queue: "please give me a namespace", "please add ingress".

An **Internal Developer Platform (IDP)** solves this by binding the tools together into a self-service layer with sane defaults, so developers interact with *their application*, not with Kubernetes primitives.

## 2. The Technical Solution

CNOE's `idpbuilder` is a reference implementation: a single binary that stands up a complete IDP on Docker using industry-standard components — Kubernetes (kind), Argo CD for GitOps delivery, Gitea for git, and Backstage as the developer portal. It exists so you can *see* what the composed platform looks like end to end.

The key idea: a developer request never touches infrastructure directly. It flows through a portal, hits a policy/guardrail, gets provisioned by a controller, and lands on a golden path.

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant Portal as Backstage Portal
    participant GitOps as Argo CD
    participant K8s as Kubernetes Cluster
    Dev->>Portal: Request new service (fill form)
    Portal->>Portal: Apply guardrails (owner, quota, template)
    Portal->>GitOps: Commit catalog-info.yaml + manifests
    GitOps->>K8s: Reconcile desired state
    K8s-->>GitOps: Report health
    GitOps-->>Portal: Sync status
    Portal-->>Dev: Service live + catalog entry

    Note over Dev,K8s: Developer never runs kubectl

    class Portal,GitOps platform
    class K8s infra
    class Dev user
    classDef platform fill:#2563eb,color:#fff
    classDef infra fill:#dc2626,color:#fff
    classDef user fill:#16a34a,color:#fff
```

Three core truths:

1. **An IDP is a composition, not a product you buy.** idpbuilder wires Kubernetes + Argo CD + Backstage + Gitea — the value is the integration, not any single tool.
2. **The interface is the point.** Developers get a portal and git; the platform team owns the messy layer underneath.
3. **Self-service replaces tickets.** Provisioning is automated behind guardrails, not requested from humans.

## 3. The clean example

You can spin the entire reference platform up locally with one command:

```bash
brew install cnoe-io/tap/idpbuilder
idpbuilder create
```

That single call bootstraps a kind cluster, installs Argo CD, Gitea, and Backstage, and wires them together. This is the whole thesis of an IDP compressed into a binary: the developer-facing experience is one command, while dozens of infrastructure decisions are made *for* you underneath.

## 4. Production reality

In a real IDP built on Backstage, the unit a developer works with is a **catalog entity**, not a Pod. Here is a verbatim Backstage `Component` from the upstream examples:

> **Where things live (Backstage catalog model):**
> ```
> packages/catalog-model/examples/
> ├── components/artist-lookup-component.yaml   # a Component entity
> ├── all-apis.yaml                             # Location pointing at API entities
> └── apis/                                     # API entities
> ```

```yaml
# apiVersion/kind: this is a catalog Entity, the atom of the IDP
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: artist-lookup
  description: Artist Lookup
  tags:
    - java
    - data
  annotations:
    # links the component back to the template that scaffolded it
    backstage.io/source-template: template:default/springboot-template
    backstage.io/linguist: 'https://github.com/backstage/backstage/tree/master/plugins/playlist'
spec:
  # type/lifecycle/owner: how the platform reasons about this service
  type: service
  lifecycle: experimental
  owner: team-a
  # system/dependsOn: the entity graph — Component → Resource → System → Domain
  system: artist-engagement-portal
  dependsOn: ['resource:artists-db']
  apiConsumedBy: ['component:www-artist']
```

**What this teaches:** the developer's mental model becomes *Component → System → Domain* and "who owns it", not "which Deployment on which node". The `owner`, `system`, and `dependsOn` fields let the platform answer questions (who to page, what breaks if this dies) that raw `kubectl get pods` never could.

**Stale facts worth correcting:**
- *"Platform engineering is just DevOps with a new name."* Wrong. DevOps is a **culture** (shared responsibility for delivery). Platform engineering is a **product discipline** — you build an IDP *as a product* for internal customers.
- *"Backstage is a deployment tool."* No — Backstage is a **portal** (catalog + docs + scaffolding). It registers and links to services; Argo CD / your CD system does the actual deploying.

## 5. Review checklist

- Does the developer-facing path avoid raw `kubectl` for the common case?
- Is every service represented as a catalog entity with an `owner`?
- Are provisioning actions self-service behind guardrails, not tickets?
- Is the platform *composed* from GitOps + portal + catalog, with each concern owned?

## 6. FAQ

**Is an IDP the same as Kubernetes?** No. Kubernetes is one component in the Resource plane. The IDP is the whole self-service experience layered on top.

**Do developers lose access to Kubernetes entirely?** Not necessarily — good IDPs offer escape hatches. The default path is abstracted; power users can still drop down.

**Can I buy an IDP off the shelf?** You buy components. The integration and the product decisions (golden paths, guardrails) are yours. idpbuilder shows one reference composition.

**Why does idpbuilder only need Docker?** It runs Kubernetes as kind (Kubernetes-in-Docker), so the entire reference platform is reproducible locally for demos, CI, and platform-team development.

**Is this overkill for a 5-person team?** Probably. IDPs pay off when cognitive load and ticket volume scale past what a couple of people can absorb.

## Source

- **Concept:** Internal Developer Platforms and why kubectl is the wrong developer interface
- **Domain:** platform-engineering
- **Repo:** [cnoe-io/idpbuilder](https://github.com/cnoe-io/idpbuilder) → [README.md](https://github.com/cnoe-io/idpbuilder/blob/main/README.md) — single-binary IDP reference (Kubernetes + Argo CD + Backstage + Gitea)
- **Repo:** [backstage/backstage](https://github.com/backstage/backstage) → [packages/catalog-model/examples/components/artist-lookup-component.yaml](https://github.com/backstage/backstage/blob/master/packages/catalog-model/examples/components/artist-lookup-component.yaml) — the catalog Component entity developers work with




