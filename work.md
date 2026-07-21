---
layout: page
title: Work
permalink: /work/
---

# Work

{%- assign author = site.data.author -%}

## What I do

{{ author.name }} — {{ author.role }}.

I build and operate production systems at scale, with deep focus on:

- **Kubernetes & Container Orchestration** — cluster architecture, networking, security policies, and workload scheduling
- **Distributed Systems** — service meshes, event-driven architectures, and consensus protocols
- **Cloud Infrastructure** — GCP, multi-cloud networking, and infrastructure as code
- **Observability** — metrics, distributed tracing, and alerting at production scale
- **Security** — authentication, authorization, and supply chain security

## The blog

This site documents what I learn from reading real production codebases — not toy examples. Every post cites an actual file and line from an open-source repository. The goal is to understand systems deeply enough to operate them confidently in production.

## Get in touch

{%- if author.social.github -%}
- **GitHub:** [{{ author.social.github }}]({{ author.social.github }})
{%- endif -%}
{%- if author.social.linkedin -%}
- **LinkedIn:** [{{ author.social.linkedin }}]({{ author.social.linkedin }})
{%- endif -%}
{%- if author.social.twitter -%}
- **X:** [{{ author.social.twitter }}]({{ author.social.twitter }})
{%- endif -%}
