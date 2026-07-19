---
layout: post
title: "What actually happens between git push and 'All checks have passed'?"
date: 2026-08-11 09:00:00 +0530
categories: cicd
tags: [cicd, github-actions, ci, dotnet, automation]
---

## 1. The Engineering Problem: "works on my machine" isn't a gate, it's a hope

Before CI, the only thing standing between a broken change and `main` is whether the
person pushing it remembered to build and test locally first — on their machine, with
their locally-installed SDK version, their locally-cached dependencies, possibly a
stale local branch. Multiply that by every contributor and every commit, and "the
build is green" stops meaning anything consistent. Someone eventually pushes a change
that builds fine for them and breaks for everyone else, and it's only discovered when
the *next* person pulls `main`.

What's actually needed is a gate that runs the exact same build and test steps, in the
exact same clean environment, for every single change — regardless of who pushed it or
what they happened to remember to run first.

## 2. The Technical Solution: an ephemeral, identical environment, triggered automatically

```
git push / open a Pull Request
        │
        ▼
GitHub Actions matches the event against a workflow's trigger
        │
        ▼
A fresh, ephemeral runner is provisioned (a clean VM, every single time —
nothing left over from any previous run)
        │
        ▼
Steps execute in order: checkout the exact commit → install the pinned
toolchain → build → test
        │
        ▼
Pass/fail is reported back onto that commit/PR as a status check
```

Three truths to hold:

1. The runner starts from a known-clean state on every run — that's what makes "it
   passed CI" mean something a local "it built for me" never can.
2. What triggers a run matters as much as what runs — a workflow that fires on every
   push to *every* branch for a docs-only typo fix is burning real compute for zero
   signal; triggers can and should be scoped.
3. A green check is only a gate if something *enforces* it (branch protection rules,
   covered separately) — the pipeline itself just reports true/false; it doesn't
   inherently block anything on its own.

## 3. The clean example (concept in isolation)

```yaml
# Minimal illustration — the smallest thing that's actually a CI pipeline.
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4        # exact commit, clean checkout every time
      - uses: actions/setup-dotnet@v3    # pinned toolchain, not "whatever's installed"
      - run: dotnet build
      - run: dotnet test
```

## 4. Production reality (from dotnet/eShop)

This is the real, currently-active PR validation workflow from `dotnet/eShop` —
Microsoft's own .NET microservices reference app. Unchanged:

```yaml
name: eShop Pull Request Validation

on:
  pull_request:
    paths-ignore:
      - '**.md'
      - 'src/ClientApp/**'
      - 'tests/ClientApp.UnitTests/**'
      - '.github/workflows/pr-validation-maui.yml'
  push:
    branches:
      - main
    paths-ignore:
      - '**.md'
      - 'src/ClientApp/**'
      - 'tests/ClientApp.UnitTests/**'
      - '.github/workflows/pr-validation-maui.yml'

jobs:  
  test:
    runs-on: ubuntu-latest    
    steps:
      - uses: actions/checkout@v4
      - name: Setup .NET (global.json)
        uses: actions/setup-dotnet@v3
      - name: Build 
        run: dotnet build eShop.Web.slnf
      - name: Test
        run: dotnet test --solution eShop.Web.slnf --no-build --no-progress --output detailed
```

What this teaches that the minimal example above can't:

- **`paths-ignore` is doing real cost/time management**, not just tidiness — a
  markdown-only PR, or a change scoped entirely to the MAUI mobile client (which has
  its own separate `pr-validation-maui.yml`), skips this entire workflow rather than
  spinning up a runner to build a .NET solution that change couldn't possibly break.
- **Both `pull_request` and `push: branches: [main]` are wired**, not just one — the PR
  trigger is the pre-merge gate; the push-to-main trigger re-validates *after* merge,
  catching the case where two individually-fine PRs merge into a broken combination.
- **"Setup .NET (global.json)"** — `actions/setup-dotnet@v3` with no explicit version
  input reads the repo's own `global.json` to pick the SDK version, meaning CI is
  guaranteed to build with the *same* SDK version every contributor's `dotnet` CLI
  resolves to locally, not whatever happens to be newest on the runner image.
- **`dotnet test --no-build`** reuses the binaries from the `dotnet build` step instead
  of rebuilding — a small but real detail: the test step trusts the build step's output
  rather than repeating expensive work.

---

## Source

- **Concept:** CI fundamentals (from manual builds to automated pipelines)
- **Domain:** cicd
- **Repo:** [dotnet/eShop](https://github.com/dotnet/eShop) → [`.github/workflows/pr-validation.yml`](https://github.com/dotnet/eShop/blob/main/.github/workflows/pr-validation.yml) — Microsoft's own .NET microservices reference app
