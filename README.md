# Kubernetes-from-real-repos — Jekyll blog

A free GitHub Pages + Jekyll blog. Your first post (the Services lesson) is
already in `_posts/`.

## One-time setup (about 5 minutes)

### 1. Create the GitHub repo
- Go to github.com → New repository.
- Name it `k8s-blog` (or anything). Make it **Public**.
- Do NOT add a README (this folder already has everything).

> Naming tip: if you name the repo exactly `YOUR-USERNAME.github.io`, the site
> lives at the clean root URL `https://YOUR-USERNAME.github.io` and you should
> set `baseurl: ""` in `_config.yml`. Any other repo name serves at
> `https://YOUR-USERNAME.github.io/<repo>` and needs `baseurl: "/<repo>"`.

### 2. Edit `_config.yml`
Replace the placeholders:
- `url:` → `https://YOUR-USERNAME.github.io`
- `baseurl:` → `/k8s-blog` (or `""` if you used the `<username>.github.io` name)
- `social_links.github:` → your GitHub username

### 3. Push this folder to the repo
From inside this `k8s-blog` folder:

```bash
git init
git add .
git commit -m "Initial blog + Services lesson"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/k8s-blog.git
git push -u origin main
```

### 4. Turn on GitHub Pages
- Repo → **Settings** → **Pages**.
- Under "Build and deployment", Source = **Deploy from a branch**.
- Branch = **main**, folder = **/ (root)**. Save.
- Wait ~1 minute; your site is live at the URL from step 2.

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
