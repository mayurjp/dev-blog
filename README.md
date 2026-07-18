# Kubernetes-from-real-repos — Jekyll blog

A free GitHub Pages + Jekyll blog. Live at https://mayurjp.github.io/k8s-blog/,
publishing from `github.com/mayurjp/k8s-blog` (branch `main`, root). One-time
setup is done — new posts just need to land in `_posts/` and get pushed.

## Content pipeline (how new posts get made)

Posts come from the `kubernetes-repo-lesson` Claude Code skill, and progress
through its curriculum is tracked in `../content-tracker.md` (one level up,
outside this repo, so pipeline bookkeeping never gets pushed publicly).

The loop, driven on-demand — no scheduled automation:

1. Ask for the next post (e.g. "generate the next kubernetes lesson post").
2. Claude reads `content-tracker.md` for the next pending topic and the most
   recently used source repo, runs the `kubernetes-repo-lesson` skill, and
   saves the result into `_posts/YYYY-MM-DD-<slug>.md` with front matter
   matching the schema below.
3. Claude updates `content-tracker.md`, marking that topic `done` with the
   post filename, repo used, and date.
4. Claude stops there — **no auto commit/push**. Review the draft, then
   commit and push (or ask Claude to) when you're ready to publish.

## Publishing a new post
Drop a markdown file into `_posts/` named `YYYY-MM-DD-title.md` with this
header, then `git add . && git commit -m "new post" && git push`:

```markdown
---
layout: post
title: "Your title here"
date: 2026-08-01 09:00:00 +0530
categories: kubernetes
tags: [kubernetes, deployments]
---

...your markdown...
```

GitHub rebuilds the site automatically on every push.

## Preview locally (optional)
Requires Ruby. From this folder:

```bash
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```

## Change the look
`_config.yml` → `minima.skin:` accepts `classic`, `dark`, `solarized`,
`solarized-dark`, or `auto`. For a fancier theme later, look at
`jekyll-theme-chirpy` (needs a GitHub Actions build instead of the native one).
