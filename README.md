# Real Repos, Real Ops — Jekyll blog

A free GitHub Pages + Jekyll blog. Live at https://mayurjp.github.io/dev-blog/,
publishing from `github.com/mayurjp/dev-blog` (branch `main`, root). One-time
setup is done — new posts just need to land in `_posts/` and get pushed.

## Content pipeline (how new posts get made)

Posts come from the `tech-repo-lesson` Claude Code skill (Kubernetes, Docker,
Microservices, and more — one `domains/<name>.md` file per topic area), and
progress through each domain's curriculum is tracked in `../content-tracker.md`
(one level up, outside this repo, so pipeline bookkeeping never gets pushed
publicly).

The loop, driven on-demand — no scheduled automation:

1. Ask for the next post (e.g. "generate the next kubernetes/docker/
   microservices lesson post").
2. Claude reads `content-tracker.md` for the next pending topic and the most
   recently used source repo in that domain, runs the `tech-repo-lesson`
   skill, and saves the result into `_posts/YYYY-MM-DD-<slug>.md` with front
   matter matching the schema below.
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

## Publishing Q&A

The `/qa/` section contains bite-sized questions and answers distilled from 
blog posts — one domain per page. Q&A content lives in 
`../blog-pipeline/question-bank/` and is published here via `publish-qa.py`.

**To update published Q&A:**
1. The `question-bank` skill appends new Q&A to `../blog-pipeline/question-bank/`
2. Run `python ../publish-qa.py` from the repo root to sync all domains
3. Commit and push the updated `/qa/` pages

The script converts each question-bank markdown file to a Jekyll page with 
proper front matter, counts, and footer links back to the index and posts.

## Preview locally (optional)
Requires Ruby. From this folder:

```bash
bundle install
bundle exec jekyll serve
# open http://localhost:4000
```

## Change the look
GitHub Pages builds with minima 2.5.1, which predates minima's `skin:`
config key, so that setting is silently ignored — the site just uses
minima's stock (light) styling. To customize colors, override minima's
`!default` Sass variables (`$text-color`, `$background-color`,
`$brand-color`, `$grey-color*`) in `assets/main.scss` before `@import
"minima";`. For a fancier theme, look at `jekyll-theme-chirpy` (needs a
GitHub Actions build instead of the native one).
