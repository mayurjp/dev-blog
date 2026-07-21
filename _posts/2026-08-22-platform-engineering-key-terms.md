---
layout: post
title: "Platform Engineering Key Terms: IDP, Golden Paths, and the DevEx Vocabulary Behind Every Post"
description: "A standalone glossary of the platform engineering terms used across this blog's infrastructure, developer experience, and internal platform posts — IDP, Backstage, golden paths, cognitive load, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: platform-engineering
order: 99
tags: [platform-engineering, glossary, developer-experience, internal-developer-platforms]
---

**TL;DR:** This is the reference page for the platform engineering vocabulary used throughout this blog's developer experience, infrastructure abstraction, and platform posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

The posts in this domain assume you already know what an IDP or a golden path is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Platform concepts

### Internal Developer Platform (IDP)
A collection of tools, workflows, and abstractions that provide self-service infrastructure to development teams. An IDP hides Kubernetes manifests, Terraform modules, and CI/CD configs behind a developer-friendly interface — the goal is that a developer never types `kubectl` or `terraform` directly.

### Golden path
An opinionated, pre-configured workflow for a common use case (e.g., deploying a web API). Golden paths include the CI/CD pipeline, monitoring dashboard, secrets configuration, and documentation — all wired together so the developer only provides business code. The path is "golden" because it's the easiest way, not the only way.

### Platform as a product
Treating the internal developer platform like an external product: with users (developers), a roadmap, adoption metrics, and feedback loops. Platform teams that don't do user research build tools nobody uses. The metric that matters: do developers *choose* to use the platform, or are they forced to?

### Developer experience (DevEx)
The ease and satisfaction of developing software within an organization. DevEx has three dimensions: feedback loops (how fast do I know if my change works?), flow state (can I focus without interruptions?), and cognitive load (how many things do I need to understand to ship code?).

### Cognitive load
The total mental effort required to complete a task. In platform engineering, cognitive load is the number of tools, configs, and concepts a developer must hold in their head to deploy a service. A good platform reduces cognitive load by handling infrastructure concerns implicitly.

## Tools & components

### Backstage
An open-source developer portal framework originally built by Spotify. It provides a service catalog (inventory of all services), Software Templates (scaffolding for new services), and TechDocs (auto-generated documentation from markdown). Backstage is the "front door" of many platforms.

### Software Templates (Backstage)
Template-driven scaffolding that creates new git repos with pre-configured CI/CD, monitoring, secrets, and documentation. A developer fills in a form (service name, owner, language) and gets a production-ready repo in minutes. Templates encode golden paths as code.

### TechDocs (Backstage)
A documentation system that generates and hosts docs from markdown files in each service's repo. Built on MkDocs, it auto-publishes docs alongside the code so they stay in sync. The goal: every service has searchable, up-to-date documentation without manual effort.

### Crossplane
A Kubernetes-native infrastructure provisioner that lets you define cloud resources (databases, buckets, VPCs) as Kubernetes Custom Resources. The platform team writes Composite Resource Definitions (XRDs) that abstract the cloud-specific details; developers claim resources through Claims.

### Backstage Software Catalog
A centralized inventory of all services, libraries, pipelines, and APIs in an organization. Each entry has an owner, lifecycle stage, dependencies, and links to docs/CI/monitoring. The catalog answers "who owns this service?" and "what depends on this database?" without asking around.

## Deployment & operations

### GitOps
A deployment model where git is the single source of truth for infrastructure and application state. A controller (Argo CD, Flux) watches the git repo and reconciles the cluster state to match. Changes happen via pull requests, not `kubectl apply` — providing audit trails and rollback.

### Progressive delivery
Deploying changes to a small subset of users before rolling out to everyone. Canary deployments (1% → 10% → 100%), blue-green deployments (two environments, swap traffic), and feature flags are progressive delivery techniques. The goal: catch issues before they affect all users.

### Self-service infrastructure
The ability for developers to create, modify, or delete infrastructure resources without filing a ticket. Self-service is the defining feature of a platform — if a developer needs to ask ops for a database, the platform isn't working.

### Service catalog
A machine-readable inventory of services, their owners, their dependencies, and their operational status. The catalog powers automated documentation, dependency graphs, on-call routing, and impact analysis. Without a catalog, "who owns this service?" is answered by Slack archaeology.

### Platform team
The team responsible for building and maintaining the internal developer platform. Typically 3-8 engineers with a mix of infrastructure (Kubernetes, Terraform), product management (user research, roadmap), and developer tools (Backstage, CI/CD) skills. The platform team's users are developers, not end users.

## Metrics & measurement

### DORA metrics
Four key metrics for measuring software delivery performance: deployment frequency, lead time for changes, time to restore service, and change failure rate. High-performing teams deploy on-demand, have lead times under one day, restore in under an hour, and have failure rates under 15%.

### Time to first deployment
How long from "I have a new service idea" to "it's running in production." This is the primary metric for platform effectiveness. A platform that reduces this from 3 days to 30 minutes has achieved its core mission.

### SPACE framework
A research-backed framework for measuring developer productivity: Satisfaction (well-being), Performance (output quality), Activity (commits, PRs), Communication (collaboration), and Efficiency (flow). SPACE counters the misuse of narrow metrics like lines of code or commit counts.

### Deployment frequency
How often code is deployed to production. High deployment frequency correlates with smaller, safer changes and faster feedback. The DORA threshold for elite performance is on-demand deployments (multiple per day).

### Lead time for changes
The time from code commit to code running in production. Elite teams have lead times under one hour. Long lead times indicate bottlenecks in CI/CD, testing, or deployment processes that the platform should automate away.

## Source

Terms verified against Backstage documentation (backstage.io), Google DORA "Accelerate" research, the SPACE framework (ACM queue 2021), Crossplane documentation, and real platform engineering implementations at Spotify, Zalando, and Thoughtworks.
