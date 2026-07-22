---
layout: post
title: "Developer portals: how Backstage unifies catalog, tech docs, and scaffolding"
description: "A developer portal is the single pane of glass over your services. This breaks down Backstage's three pillars — the software catalog, TechDocs, and software templates — using real upstream files."
date: 2026-08-12 09:00:00 +0530
categories: platform-engineering
order: 2
tags: [platform-engineering, backstage, developer-portal, techdocs, catalog]
---

**TL;DR:** *Where does a developer go to find out what services exist, how to run them, and how to create a new one correctly?* A developer portal — Backstage stitches those three answers (catalog, docs, scaffolding) into one place.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


**Real repo:** [backstage/backstage](https://github.com/backstage/backstage)

## 1. The Engineering Problem

At scale, knowledge fragments. "Which team owns the payments API?" lives in someone's head. "How do I run this service locally?" lives in a stale README. "How do I create a new service that follows our conventions?" lives in tribal copy-paste.

Every fragment is a tax on delivery. New engineers spend weeks discovering what already exists. Services get duplicated because nobody knew there was already one. Docs rot because they live far from the code.

A **developer portal** centralizes three things that developers constantly need:

1. **A catalog** — the authoritative registry of all software and who owns it.
2. **Documentation** — docs that live *next to* the code (docs-as-code).
3. **Scaffolding** — a "Create" button that produces a correctly-configured new service.

## 2. The Technical Solution

Backstage models everything as **entities** in a graph. The catalog reads `catalog-info.yaml` files from your repos and builds a graph: `Component → API → Resource → System → Domain`. TechDocs renders MkDocs sites from markdown in-repo. The Scaffolder runs **software templates** that fetch a skeleton, render it, publish to git, and register the result back into the catalog — closing the loop.

```mermaid
sequenceDiagram
    autonumber
    participant Dev as Developer
    participant Scaffolder as Backstage Scaffolder
    participant Git as GitHub
    participant Catalog as Software Catalog
    Dev->>Scaffolder: Choose template + fill parameters
    Scaffolder->>Scaffolder: Step fetch:template (render skeleton)
    Scaffolder->>Git: Step publish:github (create repo)
    Scaffolder->>Catalog: Step catalog:register (catalog-info.yaml)
    Catalog-->>Dev: New Component visible in portal
    Note over Dev,Catalog: Every scaffolded service is auto-registered

    class Scaffolder,Catalog portal
    class Git external
    class Dev user
    classDef portal fill:#2563eb,color:#fff
    classDef external fill:#7c3aed,color:#fff
    classDef user fill:#16a34a,color:#fff
```

Three core truths:

1. **The catalog is the backbone.** Docs and scaffolding both hang off catalog entities.
2. **Templates are Step → Action → Input/Output pipelines.** Each `step` invokes an `action` (`fetch:template`, `publish:github`, `catalog:register`) with typed inputs.
3. **Scaffolding closes the loop.** A created service is registered automatically, so the catalog never drifts from reality.

## 3. The clean example

The minimal catalog entity — this is what makes a service "exist" in the portal:

```yaml
apiVersion: backstage.io/v1alpha1
kind: Component
metadata:
  name: my-service
  annotations:
    backstage.io/techdocs-ref: dir:.   # enables TechDocs from ./docs
spec:
  type: service
  lifecycle: production
  owner: team-payments
```

The `techdocs-ref: dir:.` annotation is the whole docs-as-code trick: drop a `docs/` folder and `mkdocs.yml` in the repo, and the portal renders it.

## 4. Production reality

Here is a verbatim upstream **software template** — the scaffolding pillar. Note how `parameters` build the form and `steps` are the literal Step → Action pipeline:

> **Where things live (software-templates repo):**
> ```
> scaffolder-templates/
> ├── react-ssr-template/
> │   ├── template.yaml     # the Template entity (form + steps)
> │   └── skeleton/         # files rendered with {% raw %}${{ parameters.* }}{% endraw %}
> └── docs-template/
>     └── template.yaml     # adds TechDocs scaffold on top
> ```

{% raw %}
```yaml
# kind: Template — itself a catalog entity of type website
apiVersion: scaffolder.backstage.io/v1beta3
kind: Template
metadata:
  name: react-ssr-template
  title: React SSR Template
spec:
  owner: web@example.com
  type: website
  # parameters: these render the input form the developer fills
  parameters:
    - title: Provide some simple information
      required: [component_id, owner]
      properties:
        component_id:
          type: string
          ui:field: EntityNamePicker   # portal widget, not free text
        owner:
          type: string
          ui:field: OwnerPicker
  # steps: Step -> Action -> Input, executed in order
  steps:
    - id: template
      name: Fetch Skeleton + Template
      action: fetch:template          # render ./skeleton with values
      input:
        url: ./skeleton
        values:
          component_id: ${{ parameters.component_id }}
          owner: ${{ parameters.owner }}
    - id: publish
      name: Publish
      action: publish:github          # create the git repo
      input:
        repoUrl: ${{ parameters.repoUrl }}
    - id: register
      name: Register
      action: catalog:register        # add it back to the catalog
      input:
        repoContentsUrl: ${{ steps.publish.output.repoContentsUrl }}
        catalogInfoPath: "/catalog-info.yaml"
  # ...
```
{% endraw %}

**What this teaches:** scaffolding is not "copy a template folder". It is a typed pipeline where the *last step* registers the new service in the catalog — so the portal is always a truthful map. The `ui:field` widgets (`EntityNamePicker`, `OwnerPicker`) enforce valid input at the form level, which is where guardrails begin.

**Stale facts worth correcting:**
- *"Backstage deploys my app."* No. Backstage is a **portal** — catalog + docs + scaffolding. Deployment is done by your CD system (Argo CD, GitHub Actions). The template can *trigger* CI, but Backstage itself isn't a deploy tool.
- *"Platform engineering is just DevOps rebranded."* No — a portal is a **product** built for internal developers; DevOps is a culture, not a product surface.

## 5. Review checklist

- Does every service have a `catalog-info.yaml` with a real `owner`?
- Do templates end with `catalog:register` so the catalog stays truthful?
- Are docs referenced via `backstage.io/techdocs-ref` and living beside the code?
- Do template forms use `ui:field` pickers instead of free-text where identity matters?

## 6. FAQ

**Is Backstage the only portal?** No — Port, Cortex, and others exist. Backstage is the CNCF open-source reference; Port is a SaaS alternative with a lower setup cost.

**What's the difference between the catalog and scaffolding?** The catalog *records* what exists; scaffolding *creates* new entries. They connect via `catalog:register`.

**Do I have to use MkDocs for TechDocs?** TechDocs is built around MkDocs by default; the `techdocs-ref` annotation points at the docs source.

**What are actions?** Reusable functions (`fetch:template`, `publish:github`, `catalog:register`) that a template step invokes with typed inputs. You can write custom ones.

**Can a template add docs to an existing service?** Yes — the `docs-template` is designed to be layered on top of another template's skeleton.

## Source

- **Concept:** Developer portals — catalog, TechDocs, and software templates as one surface
- **Domain:** platform-engineering
- **Repo:** [backstage/software-templates](https://github.com/backstage/software-templates) → [scaffolder-templates/react-ssr-template/template.yaml](https://github.com/backstage/software-templates/blob/main/scaffolder-templates/react-ssr-template/template.yaml) — real Step → Action scaffolder pipeline
- **Repo:** [backstage/software-templates](https://github.com/backstage/software-templates) → [scaffolder-templates/docs-template/template.yaml](https://github.com/backstage/software-templates/blob/main/scaffolder-templates/docs-template/template.yaml) — TechDocs scaffold layered on top




