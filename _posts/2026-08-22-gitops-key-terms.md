---
layout: post
title: "GitOps Key Terms: Reconciliation, Sync, and the Declarative-Delivery Vocabulary Behind Every Post"
description: "A standalone glossary of GitOps terms used across this blog's declarative-delivery posts — reconciliation loops, sync waves, drift, progressive delivery, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: gitops
order: 99
tags: [gitops, glossary, argocd, flux, kubernetes]
---

**TL;DR:** This is the shared vocabulary for every GitOps post on this blog — read it once, then treat it as a lookup table. Each term is written to stand alone, so you can jump straight to the one you hit in another post.

> **In plain English (30 sec):** Code you already write — Map, function, API call, just bigger.

## Core model

### GitOps
GitOps is an operating model where a Git repository holds the declarative desired state of a system, and automated controllers continuously make the live system match that state. Git becomes the single source of truth for what *should* be, and the cluster is just a convergence target.

### Declarative desired state
Declarative desired state is a description of *what* the system should look like (a set of Kubernetes manifests, Kustomize overlays, or Helm values) rather than an ordered list of *how* to get there. The controller is responsible for figuring out the steps from current state to that declared end state.

### Reconciliation loop
A reconciliation loop is the controller's core routine: it periodically (or on-event) compares the live cluster state against the desired state in Git and computes the diff. If they differ, it applies the changes needed to close the gap, then repeats — so the system self-heals toward the declared state without human intervention.

### Source of truth
The source of truth is the Git repository that holds the canonical desired state; nothing else (not the cluster, not a dashboard, not a CLI edit) is authoritative. Any state not derivable from Git is, by definition, drift.

### Drift
Drift is the condition where the live cluster state no longer matches the declared state in Git — caused by manual `kubectl` edits, in-cluster controllers mutating objects, or a failed/partial sync. Because Git is the source of truth, drift is always something to be detected and corrected, never accepted as the new baseline.

### Drift detection
Drift detection is the controller comparing the live object spec/status against the Git-stored manifest and flagging the difference (Argo CD shows a resource as `OutOfSync`; Flux emits a `Kustomization`/`HelmRelease` not-ready condition). Detection is read-only; it tells you something is wrong without necessarily fixing it until a sync is allowed to run.

### Sync
Sync is the act of applying the desired state from Git onto the cluster to eliminate drift. In Argo CD a sync is triggered manually, on a webhook, or automatically via `automated.syncPolicy`; in Flux the controller reconciles on a polling interval or Git push event and applies the rendered manifests.

### Sync wave
A sync wave is an ordering hint (Argo CD's `syncWave` annotation, an integer) that tells the controller which resources to apply before others during a single sync. Lower-numbered waves apply first, so you can bring up a database (wave 0) before the app that depends on it (wave 1) within one operation.

### Sync hook
A sync hook is a special pod or Job, marked with Argo CD `hook` annotations (`PreSync`, `Sync`, `PostSync`, `Skip`), that runs at a defined point in the sync lifecycle. Hooks let you run migrations or smoke tests before or after applying the real resources, and can be configured to run on success, failure, or always.

## Argo CD

### Argo CD
Argo CD is a declarative, GitOps continuous-delivery tool for Kubernetes, maintained in `argoproj/argo-cd`, that runs a set of controllers watching Git and the cluster. It renders manifests from plain YAML, Kustomize, Helm, Jsonnet, or a plugin, then reconciles the cluster toward them and reports sync/health status in a UI and CLI.

### Application CRD
The `Application` CRD is Argo CD's unit of delivery: it binds a source (Git repo, path, revision, and tool like Kustomize/Helm) to a destination cluster and namespace, plus a sync policy. Creating an `Application` object is what tells Argo CD "manage this chunk of desired state and keep it reconciled."

### ApplicationSet
The `ApplicationSet` CRD generates many `Application` objects from a template and a generator (cluster list, Git directory, matrix, pull-request, etc.). It is how you fan one pattern out across many clusters, many teams' repos, or many environments without writing each `Application` by hand.

### Health assessment
Health assessment is Argo CD's built-in logic that inspects a resource's kind and status to decide if it is `Healthy` (for example, a Deployment is healthy when its desired replicas are available and not progressing). Health is separate from sync status: a resource can be `InSync` but still `Degraded` if its pods are crash-looping.

### Image updater
The Argo CD Image Updater (`argoproj-labs/argocd-image-updater`) watches container image registries and updates the image tag in Git (or directly in the live `Application`) when a newer version matching a policy appears. It keeps the Git source of truth current so the normal reconciliation loop picks up the new image.

## Flux

### Flux
Flux is a set of composable GitOps controllers for Kubernetes, maintained in `fluxcd/flux2`, built on Kubernetes controller-runtime. Its components (source, kustomize, helm, notification, image) each reconcile one concern and communicate through custom resources rather than a central server.

### Kustomization CRD
The Flux `Kustomization` CRD (from `kustomize-controller`) points at a `GitRepository` source and a path, then builds and applies the Kustomize output on an interval. It carries reconciliation knobs like `interval`, `prune`, `wait`, and `dependsOn` so you can order and garbage-collect managed resources.

### GitRepository
The Flux `GitRepository` CRD (from `source-controller`) defines where to fetch desired state from — a Git URL, revision (branch, tag, or semver), and polling interval. It produces an artifact (a tarball of the repo at that revision) that other Flux controllers consume, decoupling "where state lives" from "how to apply it."

### HelmRepository
The Flux `HelmRepository` CRD (also from `source-controller`) registers a Helm chart repository or OCI registry as a source, exposing its charts as artifacts. `HelmRelease` resources then reference it to install or upgrade a chart on the cluster.

### Controller
In both Argo CD and Flux, a controller is a long-running process that watches its custom resources and the cluster, then acts to make reality match the spec. Flux splits this into many small controllers (source, kustomize, helm, image, notification); Argo CD runs an application controller plus repo-server and application-set controllers.

### Webhook
A webhook is an inbound HTTP receiver (Argo CD's `argocd-repo-server` webhook or Flux's `receiver`/`webhook` resources) that triggers an immediate reconciliation when Git pushes instead of waiting for the polling interval. Receivers map an external event (GitHub/GitLab push) to a specific source or `Kustomization` to refresh.

## Progressive delivery

### Progressive delivery
Progressive delivery is shipping a change to a subset of traffic or replicas first, observing it, then expanding — instead of a big-bang rollout. It layers on top of GitOps by keeping the rollout strategy itself declared in Git, so the controller manages not just *what* is deployed but *how* it is gradually exposed.

### Canary
A canary release routes a small percentage of traffic (or a small replica set) to the new version and shifts more over as metrics stay healthy. Tools like Argo Rollouts or Flagger encode the canary steps as a declared object so the GitOps controller drives the staged progression and auto-rolls-back on failure.

### Blue-green
Blue-green keeps two identical environments (blue = current, green = new) and switches traffic from one to the other at a single cutover point. The new version is fully deployed and verified behind the switch, so rollback is just pointing traffic back to blue.

### Rollout
A rollout is the managed, observable progression of a new version to production, often via the Argo Rollouts `Rollout` CRD that supersedes a Deployment's strategy. It supports canary and blue-green with analysis gates, pause steps, and automated abort — all declared in Git.

## Tooling & secrets

### Kustomize
Kustomize is a Kubernetes-native configuration tool that builds a final manifest by layering `base` resources with `overlays` (patches, name prefixes, label sets) without templating. Both Argo CD and Flux can render Kustomize directly, making it a common way to keep environment differences as small overlay diffs on top of a shared base.

### Helm
Helm is the Kubernetes package manager: charts are parameterized templates, and a `values.yaml` (or values override) supplies the configuration. Argo CD renders Helm charts during sync; Flux uses `HelmRelease` to install and reconcile them, with values often sourced from Git or a `ConfigMap`/`Secret`.

### Sealed secrets
Sealed Secrets (`bitnami-labs/sealed-secrets`) encrypt a `Secret` into a `SealedSecret` resource that is safe to commit to Git; only the in-cluster controller holds the private key to decrypt it back into a real `Secret`. This solves the GitOps contradiction of "everything in Git" versus "secrets must not be in Git" without an external vault in the simplest cases.

Keep this page open in a tab — the 101 and the deeper GitOps posts all assume these definitions.




