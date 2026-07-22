---
layout: post
title: "CI/CD Key Terms: Pipelines, Caching, and the Delivery Vocabulary Behind Every Post"
description: "A standalone glossary of CI/CD terms used across this blog's pipeline posts — GitHub Actions workflows, build matrices, caching, artifacts, deployment strategies, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: cicd
order: 99
tags: [cicd, glossary, github-actions, pipelines]
---

**TL;DR:** This is the reference page for the CI/CD vocabulary used throughout this blog's pipeline and delivery posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


The posts in this domain assume you already know what a runner or a cache key is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Pipeline basics

### CI (Continuous Integration)
The practice of merging every developer's changes into a shared branch frequently and running an automated build plus tests on each merge so integration breaks are caught early. The mechanism is a hook that triggers a build on every pushed commit, so a failing change is isolated to one small diff rather than a weeks-long divergence.

### CD (Continuous Delivery / Continuous Deployment)
Continuous Delivery keeps the main branch always in a deployable state so a human-triggered release is the only thing between code and production; Continuous Deployment removes even that, automatically shipping every green build. The mechanism differs only in the final gate — a Delivery pipeline stops at "ready to deploy," a Deployment pipeline crosses the line on its own.

### Pipeline
An ordered, automated sequence of stages (build, test, package, deploy) executed by a CI/CD system whenever its trigger fires. Each stage's exit status gates the next, so a red test stage halts the pipeline before anything reaches the artifact or deploy step.

### Job
A single unit of work in a pipeline — one set of steps run in a fresh environment on a single runner. Jobs may run in parallel or depend on each other via `needs`, which is how a CD job waits for the CI job's green signal.

### Step
The smallest executable unit inside a job — one shell command or one action invocation. Steps share the job's filesystem and environment, so a file written in step one is visible to step two within the same job but not across jobs.

### Runner
The worker process (agent) that actually executes a job's steps, either hosted by the CI provider or self-hosted on your own hardware. It pulls the job off a queue, provisions the environment, streams logs back, and tears everything down when the job finishes.

## GitHub Actions

### Trigger / `on`
The event condition in a workflow file that decides when the pipeline runs — `push`, `pull_request`, a schedule, or a manual `workflow_dispatch`. The trigger is what determines whether untrusted fork code can ever execute on your runners and thus whether secrets are exposed.

### Workflow
The YAML file (under `.github/workflows/`) declaring triggers, jobs, and steps for one automation. A repo can hold many workflows, each an independent pipeline that shares the repo's events and secrets scope.

### Matrix
A strategy block that expands one job definition into many parallel jobs by fanning out over variables like OS, language version, or architecture. The CI system instantiates a job per combination, so a 3-OS × 4-version matrix runs twelve jobs from a dozen lines of YAML without copy-paste.

### Build matrix
The concrete set of parameter combinations a matrix produces at runtime — the cartesian product of the declared axes. Each cell is an isolated job whose environment variable values let the build pick the right toolchain and the logs be traced back to one specific combination.

### Secret
An encrypted environment variable stored by the CI provider and injected only at runtime into jobs that have permission to read it. Secrets are never printed in logs and are masked on output, so they survive in the pipeline without being committed to the repo.

### Environment
A named, gated target (e.g. `staging`, `production`) that scopes secrets and can require approval before a job using it may run. Environments give you a deployment history per target plus protection rules like required reviewers and branch restrictions.

## Build & cache

### Cache
A keyed blob of files the CI system stores between runs and restores into a later job that presents a matching key. It is best-effort (a miss just rebuilds), unlike an artifact, and its whole value is skipping the slow re-download of dependencies and toolchains on every run.

### Dependency caching
Pinning a cache key to a hash of your lockfile (`package-lock.json`, `Gemfile.lock`, etc.) so the restored dependency tree matches exactly the versions the build expects. When the lockfile changes, the key changes, the cache misses, and dependencies are fetched fresh — keeping the cache both fast and correct.

### Artifact
A named file or directory produced by a job and uploaded to the CI system so a later job (or a human) can download it. Unlike a cache, an artifact is a durable, always-retained output — the built binary, test report, or container image handed off to the deploy stage or released to users.

### Immutable artifact
A build output whose content is fixed forever once created, referenced by a content hash or immutable tag rather than a mutable `latest`. Immutability means the exact same bits deploy to staging and production, eliminating the "works in staging, fails in prod" class of bugs rooted in drift between environments.

## Deployment & delivery

### Deployment
The act of moving a built artifact into a runtime environment so users can reach it. The mechanism is a job that pulls the artifact and applies it to the target (host, cluster, or serverless platform), recording the association in the environment's deployment history.

### Canary
A rollout that shifts a small percentage of live traffic to the new version while the rest stays on the old, watching metrics before widening the slice. It catches bad releases on a limited blast radius, so only a fraction of users see the failure before the deploy is halted or rolled back.

### Blue-green
Two identical production environments — blue (live) and green (idle) — where the new version is deployed to idle and traffic flips to it in one switch. If anything breaks, the switch reverses to the still-warm old environment instantly, making rollback a routing change rather than a redeploy.

### Rolling update
The deploy replaces old instances with new ones incrementally, a few at a time, so capacity is never fully taken offline. The orchestrator waits for each new instance to pass health checks before retiring the next old one, bounding the failure surface to the in-flight batch.

### Progressive delivery
The umbrella term for releasing gradually by signal — canary, blue-green, and feature-flagged rollouts all qualify. The mechanism couples deployment to observability: promotion to the next stage is gated on metrics, not on a timer, so bad versions stop advancing automatically.

### Approval gate
A manual or policy checkpoint that blocks a pipeline stage until a human approves or a condition is met. On GitHub Actions it lives at the environment level via required reviewers, so production deploys cannot proceed until the designated approver clicks through.

### Pre-merge checks
The CI runs triggered on a pull request before it can be merged — tests, lint, build — enforcing that main never receives a change that breaks the pipeline. Because they execute on PR-open rather than post-merge, regressions are caught on a branch no user depends on.

### Release
The act of tagging a specific, immutable artifact as the version you're publishing to users, often via a Git tag plus a generated changelog. The release is the handoff point where CI output becomes a named, supportable version rather than an anonymous build number.

## Security

### SHA pinning
Pinning an action to a full commit hash (`actions/checkout@a12a394...`) instead of a mutable tag like `@v4`, so a compromised or rewritten tag can't silently swap the code your pipeline runs. The hash is immutable and must be updated deliberately, turning "trust the tag" into "verify the exact commit."

### OIDC (OpenID Connect)
A federated identity protocol that lets the runner mint a short-lived, audience-scoped token from the CI provider and exchange it at a cloud's STS for temporary cloud credentials. This removes long-lived cloud secrets from the repo entirely — there is no static key to leak because the credential expires minutes after each job.

### Least privilege
The principle of granting a pipeline only the permissions it needs and nothing more — on GitHub Actions, via the `permissions:` block scoping each workflow's `GITHUB_TOKEN`. A token that can only write contents, not deploy, contains the damage if the workflow or a dependency it calls is compromised.

### pwn-requests (pull-request approval)
The policy that PRs from forked or untrusted authors must be approved by a maintainer before their workflows may run with access to secrets or write scopes. Without it, an attacker could open a PR that exfiltrates your secrets by merely executing on your runners.

### Monorepo vs polyrepo
A monorepo holds many packages or services in one repository with a shared pipeline and cross-project impact analysis; a polyrepo splits them so each owns its own repo, pipeline, and access boundary. The trade-off is coordination versus isolation: monorepos make change-impact and shared-versioning easy but concentrate trust, while polyrepos localize blast radius at the cost of duplicated pipeline config.

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism.




