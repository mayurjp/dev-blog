---
layout: post
title: "Multi-Cloud Key Terms: Identity, Networking, and the Cross-Provider Vocabulary Behind Every Post"
description: "A standalone glossary of multi-cloud terms used across this blog's cross-provider posts — federation, workload identity, cross-cluster service mesh, Terraform/Crossplane, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: multicloud
order: 99
tags: [multicloud, glossary, terraform, crossplane, istio]
---

**TL;DR:** This is the shared vocabulary for every multi-cloud post on this blog — provisioning, identity, networking, and portability terms, each defined at the mechanism level so later posts can reference them without re-explaining.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


## Provisioning

### multi-cloud
Running workloads across two or more public cloud providers (e.g. AWS + GCP) so no single provider is a hard dependency. The benefit is resilience and negotiating leverage; the cost is that you must reconcile differing APIs, IAM models, and networking primitives.

### hybrid cloud
Extending an on-premises data center with one or more public clouds over a dedicated link (VPN or direct interconnect). Unlike pure multi-cloud, hybrid explicitly keeps stateful systems on-prem while bursting or integrating with the cloud.

### Terraform
HashiCorp's declarative provisioning tool that reads `.tf` files describing desired infrastructure and computes a plan to converge actual state to it. It talks to each provider's API through a provider plugin and records what it built in a state file.

### provider
A Terraform plugin (or Crossplane CRD set) that translates declarative resources into a specific backend's API calls. A `provider "aws"` block supplies credentials and region; switching providers means authoring a new resource type, not changing the engine.

### state
Terraform's record (local file or remote backend) of which real-world objects correspond to which resource blocks. It is the source of truth for planning diffs and for storing opaque outputs like resource IDs that the API returns but the config does not contain.

### Crossplane
A Kubernetes add-on that turns a cluster into a control plane for external infrastructure. You declare infrastructure as custom resources and Crossplane's controllers call provider APIs to create and reconcile it, the same reconciliation loop pattern Kubernetes uses for Pods.

### composite resource
A Crossplane `XR` that bundles several managed resources into one higher-level, opinionated API for platform teams. Consumers request one composite (e.g. `XPostgreSQLInstance`) and Crossplane expands it into the underlying disks, networks, and instances.

### managed resource
A Crossplane custom resource that maps 1:1 to an external object (an `RDSInstance`, a `Bucket`). Its controller continuously reconciles the live cloud object toward the spec, creating, updating, or deleting it as the manifest changes.

### control plane (Crossplane)
The set of Crossplane controllers running in the Kubernetes cluster that watch custom resources and drive external APIs. It is distinct from the provider's own control plane; Crossplane's job is to keep your declared spec and the provider's reality in sync.

### GitOps
Storing the desired system state in Git and running a controller (Argo CD, Flux) that continuously reconciles the live cluster toward it. Drift between Git and cluster is detected and either auto-corrected or flagged, making Git the audit trail and rollback point.

### drift
The gap between declared configuration and actual infrastructure, caused by out-of-band changes (console edits, scripts, provider-side defaults). Terraform surfaces drift on the next `plan`; Crossplane/GitOps controllers close it automatically on the next reconcile loop.

## Identity & access

### IAM
Identity and Access Management: the provider's system mapping principals (users, services, roles) to permissions over resources. Each cloud has its own IAM dialect (AWS IAM policies, GCP IAM bindings, Azure RBAC), which is the core friction in cross-provider auth.

### workload identity federation
Granting a workload (a pod, a CI job) access to a cloud without long-lived static keys, by trusting an external identity token. The workload presents a short-lived token signed by an identity provider; the cloud exchanges it for temporary, scoped credentials.

### OIDC federation
Using OpenID Connect as the token format for workload identity: the cloud's IAM trusts a third-party OIDC issuer and maps its claims to roles. This is how a Kubernetes service account or GitHub Actions job logs into AWS/GCP without storing a secret.

## Networking

### service mesh
A dedicated layer (data plane of sidecar proxies plus a control plane) that handles service-to-service traffic, mTLS, retries, and routing. In multi-cloud it standardizes east-west communication across clusters that otherwise have no shared network.

### Istio
A service mesh built on Envoy sidecar proxies and an `istiod` control plane that programs them. It provides mTLS, traffic shifting, and telemetry for services regardless of which cloud the pod runs in, using Kubernetes CRDs like `VirtualService` and `Gateway`.

### multi-cluster
Running the same or related workloads across more than one Kubernetes cluster, often one per provider or region. Multi-cluster gives failure isolation and locality, at the cost of cross-cluster service discovery and network plumbing.

### east-west traffic
Internal service-to-service traffic within and across clusters, as opposed to north-south traffic from users at the edge. A mesh manages east-west flows; across clouds this requires reachable pod/cluster networks and a shared trust domain.

### global load balancer
A provider or DNS-level LB that fronts endpoints in multiple regions/clouds and routes each user to the nearest healthy one. At the DNS layer it returns different A/AAAA records per geography; at the anycast layer a single IP is answered from the closest edge.

### DNS-based failover
Health-checking endpoints and flipping DNS records (or TTLs) to steer traffic away from a failed region/provider. It depends on low TTLs and client re-resolution; it is coarse but provider-agnostic and works across clouds that share no L4 network.

### peering
A private, direct network connection between two VPCs or between a VPC and on-prem, avoiding the public internet. VPC peering and provider interconnects give lower latency and egress savings, but cross-provider peering usually means a third-party fabric or VPN.

### VPC
A Virtual Private Cloud: an isolated, software-defined network you carve into subnets, route tables, and security groups. Each provider's VPC model differs (AWS VPC, GCP VPC, Azure VNet), so multi-cloud networking means translating CIDR plans across them without overlap.

## Workload portability & cost

### cost allocation
Tagging and attributing spend to teams, environments, or workloads so multi-cloud bills are understandable. Without consistent tags/labels across providers, showback and chargeback break and egress costs in particular become invisible.

### landing zone
A pre-approved, policy-bound baseline environment (accounts, networks, IAM, logging) that new workloads land in. In multi-cloud, a landing zone per provider codifies guardrails so teams provision consistently instead of hand-rolling each account.

### egress cost
The charge a provider bills to move data OUT of its network to the internet or another cloud. Cross-provider traffic is the expensive axis of multi-cloud; chatty east-west calls that leave one cloud to hit another can dominate the bill.

**Closing:** Keep this page open while reading the 101 and follow-ups — every term here shows up again as a concrete component or a trap to avoid.




