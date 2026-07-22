---
layout: post
title: "Golden paths: opinionated defaults with real escape hatches"
description: "A golden path (paved road) is the well-lit, supported way to build a service — opinionated defaults, not a cage. Uses a real Backstage scaffolder template as the paved road that produces a correct service by default."
date: 2026-08-16 09:00:00 +0530
categories: platform-engineering
order: 4
tags: [platform-engineering, golden-paths, paved-roads, backstage, scaffolder]
---

**TL;DR:** *How do you make the right way to build a service also the easiest way, without forbidding the exceptions?* A golden path: opinionated defaults baked into a template, with an escape hatch for when the default genuinely doesn't fit.

**Real repo:** [backstage/backstage](https://github.com/backstage/backstage)

## 1. The Engineering Problem

Give ten teams freedom and you get ten build systems, ten CI configs, ten logging conventions, and ten ways to handle secrets. Each was locally reasonable; collectively they're unmaintainable. The platform team can't support ten of everything, and security can't audit it.

The opposite extreme — mandating one rigid stack with no exceptions — fails differently: the one team with a legitimately different need (a GPU workload, a legacy protocol) is now blocked, so they route *around* the platform entirely, and now you have shadow infrastructure.

**Golden paths** (a.k.a. paved roads) resolve this: define the supported, opinionated way to do the common thing so well that 90% of teams happily take it — and provide a documented escape hatch for the 10% who genuinely shouldn't.

## 2. The Technical Solution

A golden path is encoded, not just documented. In Backstage, a **software template** *is* the paved road: it produces a new service that already has the correct structure, CI wiring, catalog registration, and ownership — by default, with no way to get it wrong. The developer picks the template, fills a short form, and gets a compliant service.

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant Template as Golden Path Template
    participant Skeleton as skeleton/
    participant Git as GitHub
    participant Catalog as Catalog
    Dev->>Template: Pick paved road + fill form
    Template->>Skeleton: fetch:template renders defaults
    Note over Skeleton: CI, structure, catalog-info baked in
    Template->>Git: publish:github (compliant repo)
    Template->>Catalog: catalog:register (owner set)
    Catalog-->>Dev: Compliant service, correct by default
    Note over Dev,Catalog: Escape hatch = copyWithoutRender / custom template

    class Template,Skeleton,Catalog platform
    class Git external
    class Dev user
    classDef platform fill:#2563eb,color:#fff
    classDef external fill:#7c3aed,color:#fff
    classDef user fill:#16a34a,color:#fff
```

Three core truths:

1. **The default must be the easy button.** If the golden path is harder than rolling your own, nobody takes it.
2. **Correctness is baked into the skeleton.** CI files, structure, and `catalog-info.yaml` come pre-wired — the developer can't forget them.
3. **Escape hatches keep the road honest.** `copyWithoutRender`, template forking, and drop-to-raw options mean the path is a default, not a jail.

## 3. The clean example

A minimal paved-road template: one form field, one action that renders a correct skeleton.

{% raw %}
```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: golden-service
  title: New Service (Golden Path)
spec:
  type: service
  parameters:
    - properties:
        name: { type: string, ui:field: EntityNamePicker }
  steps:
    - id: template
      action: fetch:template
      input:
        url: ./skeleton         # ships CI, Dockerfile, catalog-info.yaml
        values: { name: '${{ parameters.name }}' }
```
{% endraw %}

Everything opinionated — the CI pipeline, the base image, the health check — lives in `./skeleton` and comes for free.

## 4. Production reality

Here's the escape-hatch mechanism in a real upstream template. Look at `copyWithoutRender`: the platform ships GitHub Actions workflows *verbatim* (not templated), so teams get the paved CI, but the field exists precisely so certain files bypass the templating engine — a controlled seam.

> **Where things live (software-templates repo):**
> ```
> scaffolder-templates/react-ssr-template/
> ├── template.yaml       # the paved road definition
> └── skeleton/
>     ├── .github/workflows/   # copied verbatim (the paved CI)
>     └── catalog-info.yaml    # rendered with owner/name
> ```

{% raw %}
```yaml
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: react-ssr-template
  title: React SSR Template
spec:
  owner: web@example.com
  type: website
  parameters:
    - title: Provide some simple information
      required: [component_id, owner]
      properties:
        component_id:
          type: string
          ui:field: EntityNamePicker
        owner:
          type: string
          ui:field: OwnerPicker      # ownership is mandatory, not optional
  steps:
    - id: template
      name: Fetch Skeleton + Template
      action: fetch:template
      input:
        url: ./skeleton
        # copyWithoutRender: escape hatch — ship these files unmodified
        copyWithoutRender:
          - .github/workflows/*
        values:
          component_id: ${{ parameters.component_id }}
          owner: ${{ parameters.owner }}
    - id: publish
      action: publish:github         # paved: always a real repo
    - id: register
      action: catalog:register       # paved: always in the catalog
  # ...
```
{% endraw %}

**What this teaches:** the golden path enforces the *important* invariants (there must be an owner, there must be CI, it must be registered) while `copyWithoutRender` and the option to fork the template are the escape hatches. The road is opinionated but not a wall — teams with a real need can copy this template and adjust the skeleton.

**Stale facts worth correcting:**
- *"Golden paths / paved roads are hard lock-in."* Explicitly wrong. They are **opinionated defaults with escape hatches**. If there's no escape hatch, you built a cage, not a road, and teams will route around it.
- *"Backstage deploys my golden-path service."* No — Backstage **scaffolds** it (portal + templates). Deployment is your CD system's job.
- *"Platform engineering is DevOps with a new hat."* No — golden paths are a **product** decision (which defaults, which escape hatches); DevOps is the culture.

## 5. Review checklist

- Is taking the golden path *easier* than rolling your own? If not, adoption fails.
- Are critical invariants (owner, CI, catalog registration) baked in and non-skippable?
- Is there a documented, supported escape hatch for legitimate exceptions?
- Can a team fork or extend the template without abandoning the platform entirely?

## 6. FAQ

**Golden path vs. paved road — are they different?** They're the same concept, different vocabulary. "Paved road" (Netflix origin) and "golden path" (Spotify origin) both mean the supported default way.

**What if a team refuses the golden path?** That's the signal to check your escape hatch — and possibly to improve the path. Forced adoption breeds shadow infra.

**How is this different from a plain template repo?** A scaffolder template also *registers* the result in the catalog and enforces form-level constraints (mandatory owner), so compliance is automatic, not hoped-for.

**Does `copyWithoutRender` weaken the golden path?** No — it strengthens it. It ships opinionated files (CI workflows) exactly, without the templating engine mangling their syntax.

**How many golden paths should we have?** As few as cover the real common cases. Each path is a product you must maintain; one great path beats five mediocre ones.

## Source

- **Concept:** Golden paths / paved roads — opinionated defaults with escape hatches, not lock-in
- **Domain:** platform-engineering
- **Repo:** [backstage/software-templates](https://github.com/backstage/software-templates) → [scaffolder-templates/react-ssr-template/template.yaml](https://github.com/backstage/software-templates/blob/main/scaffolder-templates/react-ssr-template/template.yaml) — paved road with `copyWithoutRender` escape hatch and mandatory ownership




