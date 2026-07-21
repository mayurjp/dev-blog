---
layout: page
title: About
permalink: /about/
---

# About

{%- assign author = site.data.author -%}

<div class="about-author">
  {%- if author.avatar -%}
  <img class="about-avatar" src="{{ author.avatar | relative_url }}" alt="{{ author.name }}" width="120" height="120" loading="lazy" />
  {%- endif -%}
  <div>
    <h2 id="author">{{ author.name }}</h2>
    <p class="about-role">{{ author.role }}</p>
  </div>
</div>

**Real Repos, Real Ops** is a technical blog that teaches Kubernetes, Docker, Microservices, Security, System Design, and {{ site.data.topics.size | minus: 2 }} other domains — every lesson grounded in a real production GitHub repository's code, not hello-world examples.

## How it works

Each post follows the same structure:

1. **Engineering problem** — what goes wrong in production
2. **Technical solution** — the mechanism that fixes it, with a diagram
3. **Clean example** — the concept in isolation
4. **Production reality** — verbatim code from a real repo, annotated
5. **Source citation** — link to the exact file and line

## By the numbers

- **{{ site.posts.size }} posts** across {{ site.data.topics.size }} domains
- **1,636 Q&A pairs** for interview prep
- **{{ site.data.topics.size }} glossaries** with cross-referenced terms
- **37 hands-on challenges** — find the bug in a real manifest
- **CKA/CKAD roadmap** mapped to blog posts

## The tech stack

- [Jekyll](https://jekyllrb.com/) on [GitHub Pages](https://pages.github.com/)
- Custom dark mode, quiz app, and accordion Q&A
- Posts generated from a Claude Code skill pipeline (`blog-pipeline` repo)
- Mermaid.js for diagrams, Rouge for syntax highlighting

## Written by

{{ author.bio }}

<div class="about-links">
  {%- if author.social.github -%}
  <a href="{{ author.social.github }}">GitHub</a>
  {%- endif -%}
  {%- if author.social.twitter -%}
  <a href="{{ author.social.twitter }}">X / Twitter</a>
  {%- endif -%}
  {%- if author.social.linkedin -%}
  <a href="{{ author.social.linkedin }}">LinkedIn</a>
  {%- endif -%}
  <a href="{{ '/feed.xml' | relative_url }}">RSS Feed</a>
</div>
