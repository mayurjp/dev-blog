---
layout: post
title: "Google Cloud Key Terms: Project, VPC, and IAM — the GCP Vocabulary Behind Every Post"
description: "A standalone glossary of the Google Cloud terms used across this blog's GCP posts — project, organization, folder, VPC, subnet, region/zone, IAM, service account, GKE, Cloud Run, Pub/Sub, BigQuery, Cloud Storage, load balancer, VPC Service Controls, Org Policy, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: gcp
order: 99
tags: [gcp, glossary, cloud]
---

**TL;DR:** This is the reference page for the Google Cloud vocabulary used throughout this blog's GCP posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


The posts in this domain assume you already know what a project, a VPC, or an IAM binding is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Resource hierarchy

### Project
A project is the base unit of deployment, billing, and IAM scoping in GCP: every resource belongs to exactly one project, and API enablement, quotas, and permission checks are all resolved at the project boundary. IAM bindings and Org Policy constraints attach here, and a project is the smallest object a VPC Service Controls perimeter can wrap. Deep dive: [how a perimeter wraps projects]({{ '/gcp/gcp-security-compliance-vpc-service-controls-org-policy/' | relative_url }}).

### Organization
The organization is the root node of the GCP resource hierarchy, sitting above folders and projects and backed by a Google Workspace or Cloud Identity domain. It is the level where Org Policy constraints are set org-wide and where the access policy that owns VPC Service Controls perimeters lives. Deep dive: [hierarchy-wide Org Policy constraints]({{ '/gcp/gcp-security-compliance-vpc-service-controls-org-policy/' | relative_url }}).

### Folder
A folder is an optional grouping node between the organization and projects, used to model departments or environments and to inherit IAM and Org Policy settings. Constraints applied at a folder are inherited by everything underneath and can only be narrowed, never widened, by children. Deep dive: [folder-level policy exceptions]({{ '/gcp/gcp-security-compliance-vpc-service-controls-org-policy/' | relative_url }}).

## Networking

### VPC (Virtual Private Cloud)
A VPC is a global, software-defined network canvas in one project that spans all regions, on which subnets and firewall rules are defined; it is not tied to a single geographic location. Traffic between subnets in the same VPC routes internally, and the VPC is the unit that peering and Private Service Connect attach to. Deep dive: [VPC peering and PSC]({{ '/gcp/gcp-networking-vpc-peering-private-service-connect/' | relative_url }}).

### Subnet (primary and secondary ranges)
A subnet is a regional IP range carved out of a VPC; its primary range assigns Node/VM IPs, while optional secondary ranges assign independent, separately-sized address spaces for Kubernetes Pod and Service IPs. GKE VPC-native clusters rely on secondary ranges so thousands of ephemeral Pod IPs coexist with a smaller, stable set of Node IPs on one subnet. Deep dive: [secondary ranges and tag-based firewalls]({{ '/gcp/gcp-vpc-tag-based-firewalls-and-secondary-ranges/' | relative_url }}).

### Region and zone
A region is a geographic location (e.g. `us-central1`) composed of multiple zones, where a zone is an isolated failure domain with independent power, cooling, and networking. A resource is zonal (runs in one zone) or regional (spread across zones for failover); global services like Cloud Run or the global load balancer sit above any single zone. Deep dive: [regional Serverless NEGs]({{ '/gcp/gcp-global-load-balancing-anycast-serverless-negs/' | relative_url }}).

### VPC Peering
VPC Peering is a point-to-point route exchange between exactly two VPCs, implemented as a pair of `google_compute_network_peering` resources with their own export/import route flags. It is deliberately non-transitive — a VPC peered to B that is itself peered to C gets no visibility into C — which is why hub-and-spoke across many VPCs needs Network Connectivity Center. Deep dive: [why peering doesn't transit]({{ '/gcp/gcp-networking-vpc-peering-private-service-connect/' | relative_url }}).

### Private Service Connect (PSC)
PSC terminates a Google-managed or third-party service on an internal IP inside your own VPC via a global forwarding rule, so a VM with no public IP reaches the service without ever leaving private address space. For Google APIs, a private DNS override points `googleapis.com` at that internal IP; `restricted.googleapis.com` is the VPC Service Controls-aware target. Deep dive: [internal endpoints for Google APIs]({{ '/gcp/gcp-networking-vpc-peering-private-service-connect/' | relative_url }}).

### Firewall rules
A GCP firewall rule is an allow/deny rule evaluated on every packet, targeting instances by network tag, service-account identity, or CIDR range rather than only IP. Identity-based targeting survives instance IP churn, so a rule like "allow `web-frontend` → `db-backend`" stays correct as VMs are recreated. Deep dive: [tag- and service-account-based targeting]({{ '/gcp/gcp-vpc-tag-based-firewalls-and-secondary-ranges/' | relative_url }}).

### Global load balancer, anycast, and Serverless NEG
A single global anycast IP (`google_compute_global_address`) is announced from many Google edge locations at once, so BGP routes each user to the nearest edge with no DNS involved. A Serverless NEG (`network_endpoint_type = "SERVERLESS"`) lets the backend service reference a Cloud Run service by name rather than a fixed IP, staying correctly routed as instances scale to zero and back. Deep dive: [anycast IP and Serverless NEGs]({{ '/gcp/gcp-global-load-balancing-anycast-serverless-negs/' | relative_url }}).

## Compute

### Compute Engine
Compute Engine is GCP's IaaS layer: you provision VMs (instances) that run 24/7 regardless of traffic, and you own OS patching, capacity planning, and the bill. Its "scaling" is pre-provisioned capacity that has no notion of current traffic being zero. Deep dive: [VM vs serverless scaling]({{ '/gcp/compute-engine-vs-app-engine-vs-cloud-run/' | relative_url }}).

### GKE (Google Kubernetes Engine)
GKE is the managed Kubernetes control plane plus nodes; Autopilot hands node provisioning and patching to Google while you still define Pods, Deployments, and HPAs. A baseline set of Pods stays running even at zero traffic unless scale-to-zero is configured, and GKE is where Workload Identity binds a Kubernetes ServiceAccount to a GCP service account. Deep dive: [GKE Workload Identity dual binding]({{ '/gcp/gke-workload-identity-dual-binding/' | relative_url }}).

### Cloud Run
Cloud Run is the serverless container platform built on the open-source Knative Serving: it models "zero instances" as a first-class state and uses an activator component to cold-start a container only when a request arrives, billing per request rather than uptime. It is referenced by name from a Serverless NEG behind the global load balancer. Deep dive: [scale-to-zero and the activator]({{ '/gcp/compute-engine-vs-app-engine-vs-cloud-run/' | relative_url }}).

### Cloud Functions
Cloud Functions is GCP's event-driven/serverless function platform; every function — HTTP- or event-triggered — is invoked over plain HTTP. For event triggers, Eventarc wraps the real event as a CNCF CloudEvents HTTP POST, and the Functions Framework's adapter parses it back into a structured `CloudEvent` before calling user code. Deep dive: [CloudEvents over HTTP]({{ '/gcp/cloud-functions-cloudevents-over-http/' | relative_url }}).

### App Engine
App Engine is GCP's original PaaS: you deploy application code and Google manages the runtime and scaling, sitting between Compute Engine's IaaS and Cloud Run's serverless containers on the ownership ladder. Unlike Cloud Run it is framework/runtime-oriented rather than a generic OCI-container server, and it is taught here mainly as the contrast point on that ladder. Deep dive: [where App Engine sits vs VMs and Cloud Run]({{ '/gcp/compute-engine-vs-app-engine-vs-cloud-run/' | relative_url }}).

## Data & messaging

### Cloud Storage
Cloud Storage is the object store organized into buckets, each with a storage class (STANDARD, NEARLINE, COLDLINE, ARCHIVE) and optional object versioning. Lifecycle rules are a condition-and-action engine against every object — `SetStorageClass` transitions and `Delete` actions compose on conditions like age, current storage class, and version count. Deep dive: [lifecycle rules beyond deletion]({{ '/gcp/cloud-storage-lifecycle-rules/' | relative_url }}).

### BigQuery
BigQuery is GCP's serverless, columnar data warehouse that queries structured data directly without managing servers. It is a frequent `restricted_services` target in VPC Service Controls, where a correctly-IAM-authorized identity can still be blocked from copying a dataset across a perimeter boundary. Deep dive: [BigQuery inside a VPC-SC perimeter]({{ '/gcp/gcp-security-compliance-vpc-service-controls-org-policy/' | relative_url }}).

### Cloud SQL
Cloud SQL is the fully-managed relational database service for Postgres, MySQL, and SQL Server: one primary handles all writes, with vertical scaling and read replicas, capped by that machine's throughput. It scales within a single region and never attempts globally-consistent distributed writes. Deep dive: [Cloud SQL vs Spanner vs Firestore]({{ '/gcp/cloud-sql-vs-spanner-vs-firestore-truetime/' | relative_url }}).

### Spanner (and TrueTime)
Cloud Spanner is the globally-distributed, horizontally-write-scalable SQL database whose strong cross-region consistency comes from TrueTime — a globally-synchronized clock with a bounded uncertainty interval. TrueTime lets Spanner assign externally-ordered transaction timestamps without a global lock, exposed per query as `Strong` or bounded-staleness `TimestampBound` modes. Deep dive: [TrueTime and per-query consistency]({{ '/gcp/cloud-sql-vs-spanner-vs-firestore-truetime/' | relative_url }}).

### Firestore
Firestore is GCP's managed NoSQL document database with its own consistency and synchronization model, distinct from Spanner's TrueTime-backed SQL semantics. It is the document-store alternative in the managed-database trio, chosen for flexible schema and offline-friendly clients rather than cross-region SQL consistency. Deep dive: [Firestore in the managed-DB comparison]({{ '/gcp/cloud-sql-vs-spanner-vs-firestore-truetime/' | relative_url }}).

### Pub/Sub
Pub/Sub is the managed asynchronous messaging service using at-least-once delivery by default, with an opt-in exactly-once mode tracked as a separate delivery path. The client library auto-extends each message's ack deadline while it is still processing, so a slow consumer isn't redelivered its in-progress message before it finishes. Deep dive: [ack-deadline lease extension]({{ '/gcp/pubsub-ack-deadline-lease-extension/' | relative_url }}).

### CloudEvents
CloudEvents is the CNCF-standardized event envelope (not a Google protocol) that Eventarc wraps real GCP events into before POSTing them to an event-driven function over HTTP. The Functions Framework adapter parses the HTTP request back into a structured `CloudEvent`, so user code never handles raw HTTP parsing. Deep dive: [CloudEvents over HTTP]({{ '/gcp/cloud-functions-cloudevents-over-http/' | relative_url }}).

## Identity & access

### IAM (bindings, additive vs authoritative)
IAM is the identity-and-permission system: a role grants a set of permissions, and a binding attaches a member (user, service account, group) to a role on a resource. `google_project_iam_member` is additive (coexists with other grants), while `google_project_iam_binding` is authoritative for that one role and silently replaces its entire member list on apply. Deep dive: [additive vs authoritative bindings]({{ '/gcp/gcp-iam-additive-vs-authoritative-bindings/' | relative_url }}).

### Service account
A service account is a non-human GCP identity that a VM, GKE Pod, Cloud Run service, or function authenticates as when calling GCP APIs. Its permissions come from IAM bindings on the service account itself, and historically it was used via a long-lived downloaded JSON key — the pattern Workload Identity and Federation exist to replace. Deep dive: [GKE Workload Identity bindings]({{ '/gcp/gke-workload-identity-dual-binding/' | relative_url }}).

### Application Default Credentials (ADC)
ADC is the fixed, ordered client-side fallback chain every GCP client library runs first to find an identity: `GOOGLE_APPLICATION_CREDENTIALS`, then the well-known `application_default_credentials.json` file, then the GCE/GKE/Cloud Run metadata server at `169.254.169.254`. It answers "which identity" before IAM answers "what is allowed," resolved once per process and cached. Deep dive: [the ADC resolution chain]({{ '/gcp/application-default-credentials-resolution-chain/' | relative_url }}).

### Workload Identity
GKE Workload Identity lets a Pod get short-lived GCP tokens with no downloaded key file, via two independent bindings: an IAM grant letting the Kubernetes ServiceAccount impersonate the GCP service account, plus a KSA annotation telling the metadata server which GSA to issue tokens for. Either binding alone is insufficient; together they remove any exportable, long-lived credential from the Pod. Deep dive: [the two required bindings]({{ '/gcp/gke-workload-identity-dual-binding/' | relative_url }}).

### Workload Identity Federation
Workload Identity Federation swaps an external OIDC token (e.g. a GitHub Actions job token) for a Google Cloud token via an OAuth2 token exchange (RFC 8693) at request time, with nothing long-lived stored on either side. A configured Workload Identity Pool/Provider trusts the external issuer for a specific repo/condition; optional service-account impersonation layers on top. Deep dive: [the token-exchange flow]({{ '/gcp/workload-identity-federation-token-exchange/' | relative_url }}).

### VPC Service Controls
VPC Service Controls wraps a security perimeter around a set of projects and restricted services so that even a fully IAM-authorized principal is blocked from moving data across the boundary unless an access level admits the request. It evaluates after IAM already said yes and only ever narrows what authorized requests may do; `restricted_services` is an explicit allowlist of which APIs are enforced. Deep dive: [perimeters vs IAM]({{ '/gcp/gcp-security-compliance-vpc-service-controls-org-policy/' | relative_url }}).

### Organization Policy
Organization Policy is the hierarchical constraint system that restricts which product-level capabilities are allowed at all (e.g. forbidding VM external IPs), independent of IAM's who/what model. Constraints attached at org, folder, or project inherit downward and can only be narrowed by children, with explicit per-scope exceptions modeled as their own resources. Deep dive: [hierarchical constraints and exceptions]({{ '/gcp/gcp-security-compliance-vpc-service-controls-org-policy/' | relative_url }}).

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.




