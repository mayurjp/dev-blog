---
layout: post
title: "Why does your production image ship a full Go toolchain to run one binary?"
date: 2026-07-22 09:00:00 +0530
categories: docker
tags: [docker, multi-stage-builds, buildkit, image-size, dockerfile]
published: false
---

## 1. The Engineering Problem: the build toolchain becomes part of the artifact

A single-stage Dockerfile that compiles code has to install everything the compiler needs: `gcc`, `make`, the Go or Node or JDK toolchain, header files, dev packages. All of that gets baked into the same layers as your application — because in a single `FROM ... RUN build ...` stage there's only one filesystem, and it accumulates everything you ever ran a command in.

Before multi-stage builds existed, teams worked around this with a "builder pattern" implemented by hand: build the artifact in one container, `docker cp` the binary out to the host, then `docker build` a *second*, separate Dockerfile that just `COPY`s that binary in. It worked, but it meant two Dockerfiles, a host-side script gluing them together, and a build that wasn't reproducible from `git clone` + one command anymore.

The cost isn't hypothetical: a compiler toolchain and dev headers routinely add hundreds of megabytes over the actual binary, and every one of those packages is attack surface and CVE exposure sitting in your production image for no runtime benefit.

---

## 2. The Technical Solution: multiple `FROM` instructions, one Dockerfile

Multi-stage builds let a single Dockerfile declare more than one `FROM`. Each `FROM` starts a brand-new build stage with its own base image and its own layer cache — nothing carries over from a previous stage automatically. The only way to pull something from an earlier stage into a later one is an explicit `COPY --from=<stage>`.

```
┌─────────────────────────────┐
│ Stage: builder (FROM golang) │
│  - apt/apk toolchain          │
│  - go build → /app/bin/server │
└─────────────────────────────┘
              │  COPY --from=builder /app/bin/server .
              ▼
┌─────────────────────────────┐
│ Stage: final (FROM alpine)    │  ← only this stage produces the shipped image
│  - /app/bin/server             │
│  - no compiler, no headers,    │
│    no source tree               │
└─────────────────────────────┘

docker build (no --target) → builds every stage needed to produce the LAST one, discards intermediate stages' layers from the final image (they stay cached on disk for reuse, but aren't part of the image you ship)
```

Three things to hold onto:

1. **Only the final stage ships.** Every earlier stage is a scratchpad — its filesystem exists only for `COPY --from` to reach into. Nothing from `builder` ends up in your image unless a later stage explicitly copies it.
2. **`--target` lets one Dockerfile produce multiple images.** `docker build --target=builder .` stops at that stage and ships *it* — handy for a debug image with the full toolchain still attached, built from the exact same file as your slim production image.
3. **BuildKit builds only what the requested target needs**, and runs independent stages in parallel when they don't depend on each other — a second reason (beyond image size) multi-stage builds are faster in practice than the old two-Dockerfile workaround, not slower.

---

## 3. The clean Dockerfile (the concept in isolation)

```dockerfile
# syntax=docker/dockerfile:1.7

FROM golang:1.22-alpine AS builder     # Stage 1: has the full Go toolchain -- never shipped
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server .   # static binary -- no libc dependency to carry forward

FROM alpine:3.20 AS final              # Stage 2: fresh base, toolchain NOT inherited
RUN adduser -D -u 10001 appuser        # non-root user, created directly in the slim final stage
COPY --from=builder /out/server /usr/local/bin/server   # only the compiled artifact crosses the stage boundary
USER appuser
ENTRYPOINT ["/usr/local/bin/server"]
```

`builder`'s 300+ MB of Go toolchain, module cache, and source tree never touch the final image — `alpine:3.20` plus one ~10 MB static binary does. Rerunning `docker build` after a source change reuses `go mod download`'s cached layer in `builder` (dependencies didn't change) and only reruns `go build` and the final `COPY` — the same layer-caching rules from the Dockerfile lesson apply *within* each stage independently.

---

## 4. Production reality: six images from one Dockerfile

Grafana's actual production `Dockerfile` takes this idea much further than a two-stage build: one file, multiple named intermediate stages that are shared and recombined, producing **three different final variants** (alpine, ubuntu, distroless) — selected at build time with `--target`. Verbatim (license/comment headers preserved as written), annotated below.

```dockerfile
# syntax=docker/dockerfile:1.7-labs

# to maintain formatting of multiline commands in vscode, add the following to settings.json:
# "docker.languageserver.formatter.ignoreMultilineInstructions": true

ARG GO_IMAGE=go-builder-base
ARG JS_IMAGE=js-builder-base
ARG JS_PLATFORM=linux/amd64

# Default to building locally
ARG GO_SRC=go-builder
ARG JS_SRC=js-builder

# Dependabot cannot update dependencies listed in ARGs
# By using FROM instructions we can delegate dependency updates to dependabot
FROM alpine:3.24.1 AS alpine-base
FROM ubuntu:24.04 AS ubuntu-base
FROM golang:1.26.5-alpine AS go-builder-base
FROM --platform=${JS_PLATFORM} node:24-alpine AS js-builder-base
FROM gcr.io/distroless/static-debian13 AS distroless-base
# Javascript build stage
FROM --platform=${JS_PLATFORM} ${JS_IMAGE} AS js-builder
ARG JS_NODE_ENV=production
ARG JS_YARN_INSTALL_FLAG=--immutable
ARG JS_YARN_BUILD_FLAG=build

ENV NODE_OPTIONS=--max_old_space_size=8000

WORKDIR /tmp/grafana

RUN apk add --no-cache make build-base python3

COPY package.json project.json nx.json yarn.lock .yarnrc.yml ./
COPY .yarn .yarn
COPY packages packages
COPY e2e-playwright e2e-playwright
COPY public public
COPY LICENSE ./
COPY conf/defaults.ini ./conf/defaults.ini

#
# Set the node env according to defaults or argument passed
#
ENV NODE_ENV=${JS_NODE_ENV}
#
RUN if [ "$JS_YARN_INSTALL_FLAG" = "" ]; then \
    yarn install; \
  else \
    yarn install --immutable; \
  fi

COPY tsconfig.json eslint.config.js .editorconfig .browserslistrc .prettierrc.js ./
COPY scripts scripts
COPY emails emails

# Set the build argument according to default or argument passed
RUN yarn ${JS_YARN_BUILD_FLAG}

# Golang build stage
FROM ${GO_IMAGE} AS go-builder

ARG COMMIT_SHA=""
ARG BUILD_BRANCH=""
ARG SOURCE_DATE_EPOCH=""
ARG GO_BUILD_TAGS="oss"
ARG WIRE_TAGS="oss"

RUN if grep -i -q alpine /etc/issue; then \
  apk add --no-cache \
  bash \
  # Install build dependencies
  make git; \
  fi

WORKDIR /tmp/grafana

COPY go.mod go.sum go.work go.work.sum ./
COPY .citools .citools

# Copy go.mod/go.sum from each workspace module for dependency caching.
# Only dependency file changes invalidate the go mod download cache layer.
# Uses --parents to preserve directory structure with fewer COPY directives.
COPY --parents **/go.mod **/go.sum ./

RUN --mount=type=cache,target=/go/pkg/mod \
    go mod download

# Copy full source
COPY embed.go Makefile package.json ./
COPY cue.mod cue.mod
COPY kinds kinds
COPY local local
COPY packages/grafana-schema packages/grafana-schema
COPY packages/grafana-data/src/themes/themeDefinitions packages/grafana-data/src/themes/themeDefinitions
COPY public/app/plugins public/app/plugins
COPY public/api-merged.json public/api-merged.json
COPY pkg pkg
COPY apps apps
COPY scripts scripts
COPY conf conf
COPY .github .github

ENV COMMIT_SHA=${COMMIT_SHA}
ENV BUILD_BRANCH=${BUILD_BRANCH}
ENV SOURCE_DATE_EPOCH=${SOURCE_DATE_EPOCH}

RUN --mount=type=cache,target=/go/pkg/mod \
    --mount=type=cache,target=/root/.cache/go-build \
    make build-go GO_BUILD_TAGS=${GO_BUILD_TAGS} WIRE_TAGS=${WIRE_TAGS}

RUN mkdir -p data/plugins-bundled

# From-tarball build stage
FROM alpine-base AS tgz-builder

WORKDIR /tmp/grafana

ARG GRAFANA_TGZ="grafana-latest.linux-x64-musl.tar.gz"

COPY ${GRAFANA_TGZ} /tmp/grafana.tar.gz

# add -v to make tar print every file it extracts
RUN tar x -z -f /tmp/grafana.tar.gz --strip-components=1

RUN mkdir -p data/plugins-bundled

# helpers for COPY --from
FROM ${GO_SRC} AS go-src
FROM ${JS_SRC} AS js-src

# Binaries and frontend assets — shared by all 6 variants (full and slim) via COPY --link.
# No plugins here; keeping this stage SLIM-agnostic ensures the layer hash is identical
# across every build regardless of the SLIM flag.
FROM alpine-base AS grafana-assets

ENV GF_PATHS_HOME="/usr/share/grafana"
WORKDIR $GF_PATHS_HOME

COPY --from=go-src /tmp/grafana/bin/grafana* /tmp/grafana/bin/*/grafana* ./bin/
COPY --from=js-src /tmp/grafana/public ./public
COPY --from=js-src /tmp/grafana/LICENSE ./

# Bundled plugins — shared by the 3 full (non-slim) variants, and by the 3 slim variants
# among themselves (as an empty directory). Kept separate from grafana-assets so the two
# groups each get their own shared layer rather than a single mixed one.
FROM alpine-base AS grafana-plugins

ARG GF_UID="472"
ARG GF_GID="0"

ENV GF_PATHS_HOME="/usr/share/grafana"
WORKDIR $GF_PATHS_HOME

RUN mkdir -p data/plugins-bundled

ARG SLIM=false
RUN --mount=type=bind,from=go-src,source=/tmp/grafana/data/plugins-bundled,target=/mnt/plugins-bundled \
  { [ "$SLIM" = "true" ] || cp -a /mnt/plugins-bundled/. ./data/plugins-bundled/; } && \
  chown -R "${GF_UID}:${GF_GID}" data/plugins-bundled && \
  chmod -R 777 data/plugins-bundled

# Intermediate filesystem setup for the distroless target.
# Uses an Alpine shell to create directories, users, and config files
# since distroless has no shell. No network access required.
FROM alpine-base AS distroless-prep

ARG GF_UID="472"
ARG GF_GID="0"

ENV PATH="/usr/share/grafana/bin:$PATH" \
  GF_PATHS_CONFIG="/etc/grafana/grafana.ini" \
  GF_PATHS_DATA="/var/lib/grafana" \
  GF_PATHS_HOME="/usr/share/grafana" \
  GF_PATHS_LOGS="/var/log/grafana" \
  GF_PATHS_PLUGINS="/var/lib/grafana/plugins" \
  GF_PATHS_PROVISIONING="/etc/grafana/provisioning"

WORKDIR $GF_PATHS_HOME

COPY --from=go-src /tmp/grafana/conf ./conf
COPY --from=go-src /tmp/grafana/bin/grafana* /tmp/grafana/bin/*/grafana* ./bin/

RUN if [ ! "$(getent group "$GF_GID")" ]; then \
  addgroup -S -g $GF_GID grafana; \
  fi && \
  GF_GID_NAME=$(getent group $GF_GID | cut -d':' -f1) && \
  mkdir -p "$GF_PATHS_HOME/.aws" \
  "$GF_PATHS_PROVISIONING/datasources" \
  "$GF_PATHS_PROVISIONING/dashboards" \
  "$GF_PATHS_PROVISIONING/notifiers" \
  "$GF_PATHS_PROVISIONING/plugins" \
  "$GF_PATHS_PROVISIONING/access-control" \
  "$GF_PATHS_PROVISIONING/alerting" \
  "$GF_PATHS_LOGS" \
  "$GF_PATHS_PLUGINS" \
  "$GF_PATHS_HOME/data/plugins-bundled" \
  "$GF_PATHS_DATA" \
  /etc/grafana && \
  adduser -S -u $GF_UID -G "$GF_GID_NAME" grafana && \
  cp conf/sample.ini "$GF_PATHS_CONFIG" && \
  cp conf/ldap.toml /etc/grafana/ldap.toml && \
  chown -R "grafana:$GF_GID_NAME" "$GF_PATHS_DATA" "$GF_PATHS_HOME/.aws" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" "$GF_PATHS_HOME/data/plugins-bundled" && \
  chmod -R 777 "$GF_PATHS_DATA" "$GF_PATHS_HOME/.aws" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" "$GF_PATHS_HOME/data/plugins-bundled" && \
  printf 'root:x:0:0:root:/root:/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/sbin/nologin\ngrafana:x:%s:%s::/usr/share/grafana:/sbin/nologin\n' "$GF_UID" "$GF_GID" > /tmp/distroless-passwd && \
  printf 'root:x:0:\nnobody:x:65534:\n' > /tmp/distroless-group && \
  if [ "$GF_GID" != "0" ]; then printf 'grafana:x:%s:\n' "$GF_GID" >> /tmp/distroless-group; fi && \
  grafana server --homepath="$GF_PATHS_HOME" -v | sed -e 's/Version //' > /.grafana-version && \
  chmod 644 /.grafana-version

# Alpine final stage
FROM alpine-base AS final-alpine

LABEL maintainer="Grafana Labs <hello@grafana.com>"
LABEL org.opencontainers.image.source="https://github.com/grafana/grafana"

ARG GF_UID="472"
ARG GF_GID="0"

ENV PATH="/usr/share/grafana/bin:$PATH" \
  GF_PATHS_CONFIG="/etc/grafana/grafana.ini" \
  GF_PATHS_DATA="/var/lib/grafana" \
  GF_PATHS_HOME="/usr/share/grafana" \
  GF_PATHS_LOGS="/var/log/grafana" \
  GF_PATHS_PLUGINS="/var/lib/grafana/plugins" \
  GF_PATHS_PROVISIONING="/etc/grafana/provisioning"

WORKDIR $GF_PATHS_HOME

RUN apk add --no-cache ca-certificates bash bubblewrap curl tzdata musl-utils && \
  apk info -vv | sort

# glibc support for alpine x86_64 only
# docker run --rm --env STDOUT=1 sgerrand/glibc-builder 2.40 /usr/glibc-compat > glibc-bin-2.40.tar.gz
ARG GLIBC_VERSION=2.40

RUN if [ "$(arch)" = "x86_64" ]; then \
  curl -fsSL "https://dl.grafana.com/glibc/glibc-bin-$GLIBC_VERSION.tar.gz" | tar zxf - -C / \
  usr/glibc-compat/lib/ld-linux-x86-64.so.2 \
  usr/glibc-compat/lib/libc.so.6 \
  usr/glibc-compat/lib/libdl.so.2 \
  usr/glibc-compat/lib/libm.so.6 \
  usr/glibc-compat/lib/libpthread.so.0 \
  usr/glibc-compat/lib/librt.so.1 \
  usr/glibc-compat/lib/libresolv.so.2 && \
  mkdir /lib64 && \
  ln -s /usr/glibc-compat/lib/ld-linux-x86-64.so.2 /lib64; \
  fi

COPY --from=go-src /tmp/grafana/conf ./conf

RUN if [ ! "$(getent group "$GF_GID")" ]; then \
  addgroup -S -g $GF_GID grafana; \
  fi && \
  GF_GID_NAME=$(getent group $GF_GID | cut -d':' -f1) && \
  mkdir -p "$GF_PATHS_HOME/.aws" && \
  adduser -S -u $GF_UID -G "$GF_GID_NAME" grafana && \
  mkdir -p "$GF_PATHS_PROVISIONING/datasources" \
  "$GF_PATHS_PROVISIONING/dashboards" \
  "$GF_PATHS_PROVISIONING/notifiers" \
  "$GF_PATHS_PROVISIONING/plugins" \
  "$GF_PATHS_PROVISIONING/access-control" \
  "$GF_PATHS_PROVISIONING/alerting" \
  "$GF_PATHS_LOGS" \
  "$GF_PATHS_PLUGINS" \
  "$GF_PATHS_HOME/data/plugins-bundled" \
  "$GF_PATHS_DATA" && \
  cp conf/sample.ini "$GF_PATHS_CONFIG" && \
  cp conf/ldap.toml /etc/grafana/ldap.toml && \
  chown -R "grafana:$GF_GID_NAME" "$GF_PATHS_DATA" "$GF_PATHS_HOME/.aws" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" "$GF_PATHS_HOME/data/plugins-bundled" && \
  chmod -R 777 "$GF_PATHS_DATA" "$GF_PATHS_HOME/.aws" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" "$GF_PATHS_HOME/data/plugins-bundled"

COPY --link --from=grafana-assets /usr/share/grafana /usr/share/grafana
COPY --link --from=grafana-plugins /usr/share/grafana/data /usr/share/grafana/data

RUN grafana server -v | sed -e 's/Version //' > /.grafana-version
RUN chmod 644 /.grafana-version

EXPOSE 3000

ARG RUN_SH=./packaging/docker/run.sh

COPY ${RUN_SH} /run.sh

USER "$GF_UID"
ENTRYPOINT [ "/run.sh" ]

# Ubuntu final stage — use --target=final-ubuntu to select this variant
FROM ubuntu-base AS final-ubuntu

LABEL maintainer="Grafana Labs <hello@grafana.com>"
LABEL org.opencontainers.image.source="https://github.com/grafana/grafana"

ARG GF_UID="472"
ARG GF_GID="0"

ENV PATH="/usr/share/grafana/bin:$PATH" \
  GF_PATHS_CONFIG="/etc/grafana/grafana.ini" \
  GF_PATHS_DATA="/var/lib/grafana" \
  GF_PATHS_HOME="/usr/share/grafana" \
  GF_PATHS_LOGS="/var/log/grafana" \
  GF_PATHS_PLUGINS="/var/lib/grafana/plugins" \
  GF_PATHS_PROVISIONING="/etc/grafana/provisioning"

WORKDIR $GF_PATHS_HOME

RUN DEBIAN_FRONTEND=noninteractive apt-get update && \
  apt-get install -y ca-certificates curl tzdata musl && \
  apt-get autoremove -y && \
  rm -rf /var/lib/apt/lists/*

COPY --from=go-src /tmp/grafana/conf ./conf

RUN if [ ! "$(getent group "$GF_GID")" ]; then \
  groupadd --system --gid $GF_GID grafana; \
  fi && \
  GF_GID_NAME=$(getent group $GF_GID | cut -d':' -f1) && \
  mkdir -p "$GF_PATHS_HOME/.aws" && \
  useradd --system --uid $GF_UID --gid "$GF_GID_NAME" --create-home grafana && \
  mkdir -p "$GF_PATHS_PROVISIONING/datasources" \
  "$GF_PATHS_PROVISIONING/dashboards" \
  "$GF_PATHS_PROVISIONING/notifiers" \
  "$GF_PATHS_PROVISIONING/plugins" \
  "$GF_PATHS_PROVISIONING/access-control" \
  "$GF_PATHS_PROVISIONING/alerting" \
  "$GF_PATHS_LOGS" \
  "$GF_PATHS_PLUGINS" \
  "$GF_PATHS_HOME/data/plugins-bundled" \
  "$GF_PATHS_DATA" && \
  cp conf/sample.ini "$GF_PATHS_CONFIG" && \
  cp conf/ldap.toml /etc/grafana/ldap.toml && \
  chown -R "grafana:$GF_GID_NAME" "$GF_PATHS_DATA" "$GF_PATHS_HOME/.aws" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" "$GF_PATHS_HOME/data/plugins-bundled" && \
  chmod -R 777 "$GF_PATHS_DATA" "$GF_PATHS_HOME/.aws" "$GF_PATHS_LOGS" "$GF_PATHS_PLUGINS" "$GF_PATHS_PROVISIONING" "$GF_PATHS_HOME/data/plugins-bundled"

COPY --link --from=grafana-assets /usr/share/grafana /usr/share/grafana
COPY --link --from=grafana-plugins /usr/share/grafana/data /usr/share/grafana/data

RUN grafana server -v | sed -e 's/Version //' > /.grafana-version
RUN chmod 644 /.grafana-version

EXPOSE 3000

ARG RUN_SH=./packaging/docker/run.sh

COPY ${RUN_SH} /run.sh

USER "$GF_UID"
ENTRYPOINT [ "/run.sh" ]

# Distroless final stage — use --target=final-distroless to select this variant.
# No shell, no package manager, no OS utilities: significantly reduces CVE surface.
# Requires a static binary (CGO_ENABLED=0). The run.sh entrypoint is replaced by a
# direct grafana server invocation, so these run.sh features are unavailable:
#   - GF_*__FILE secret expansion (reading config values from mounted secret files)
#   - AWS credential file generation from GF_AWS_* env vars
#   - GF_INSTALL_PLUGINS (deprecated; use GF_PLUGINS_PREINSTALL instead)
# GF_PATHS_* env vars work normally — they are not overridden by cfg: flags in this entrypoint.
#
# Filesystem layout (dirs, users, config) is prepared by distroless-prep and
# binaries/assets are copied directly from go-src/js-src. No Alpine OS packages,
# libraries, or network downloads are included.
FROM distroless-base AS final-distroless

LABEL maintainer="Grafana Labs <hello@grafana.com>"
LABEL org.opencontainers.image.source="https://github.com/grafana/grafana"

ARG GF_UID="472"
ARG GF_GID="0"

ENV PATH="/usr/share/grafana/bin:$PATH" \
  GF_PATHS_CONFIG="/etc/grafana/grafana.ini" \
  GF_PATHS_DATA="/var/lib/grafana" \
  GF_PATHS_HOME="/usr/share/grafana" \
  GF_PATHS_LOGS="/var/log/grafana" \
  GF_PATHS_PLUGINS="/var/lib/grafana/plugins" \
  GF_PATHS_PROVISIONING="/etc/grafana/provisioning"

WORKDIR $GF_PATHS_HOME

COPY --from=distroless-prep /tmp/distroless-passwd /etc/passwd
COPY --from=distroless-prep /tmp/distroless-group /etc/group
COPY --from=distroless-prep /etc/grafana /etc/grafana
COPY --chown=${GF_UID}:${GF_GID} --from=distroless-prep /var/lib/grafana /var/lib/grafana
COPY --chown=${GF_UID}:${GF_GID} --from=distroless-prep /var/log/grafana /var/log/grafana
COPY --from=distroless-prep /usr/share/grafana/conf /usr/share/grafana/conf
COPY --chown=${GF_UID}:${GF_GID} --from=distroless-prep /usr/share/grafana/.aws /usr/share/grafana/.aws
COPY --chown=${GF_UID}:${GF_GID} --from=distroless-prep /usr/share/grafana/data /usr/share/grafana/data
COPY --link --from=grafana-assets /usr/share/grafana /usr/share/grafana
COPY --link --from=grafana-plugins /usr/share/grafana/data /usr/share/grafana/data
COPY --from=distroless-prep /.grafana-version /.grafana-version

EXPOSE 3000

USER $GF_UID

# ENTRYPOINT holds the invariant invocation; CMD holds the overridable default
# args. Splitting them follows the conventional Docker pattern so runtime args
# (docker run <img> <args> / Kubernetes args:) replace the defaults instead of
# being permanently pinned after a fully-baked ENTRYPOINT.
ENTRYPOINT ["/usr/share/grafana/bin/grafana", "server", "--homepath=/usr/share/grafana", "--config=/etc/grafana/grafana.ini", "--packaging=docker"]
CMD ["cfg:default.log.mode=console"]

# Default stage — alpine. Builds without --target produce an alpine image.
# Use --target=final-ubuntu to build the ubuntu variant instead.
FROM final-alpine
```

**What this teaches that a hello-world can't:**

- **`FROM alpine:3.24.1 AS alpine-base` / `FROM golang:1.26.5-alpine AS go-builder-base` etc. as bare, unused-looking `FROM` lines** exist purely so Dependabot has a `FROM <image>:<tag>` line to bump — a base image referenced only through `ARG GO_IMAGE=go-builder-base` can't be tracked by dependency bots that scan for literal `FROM` statements. This is a real-world workaround for tooling limitations, not something a toy example would ever surface.
- **`FROM ${GO_SRC} AS go-src`** where `GO_SRC` defaults to `go-builder` (the actual compile stage) shows stages can be *redirected* via build arg — CI can override `--build-arg GO_SRC=tgz-builder` to build the final images from a pre-built release tarball (`tgz-builder`) instead of compiling from source, from the *same* Dockerfile.
- **`grafana-assets` and `grafana-plugins` are shared stages**, each `COPY --from`'d by all three `final-*` stages. This is the payoff of naming stages: shared build work happens once and is reused across every variant, rather than every final stage repeating the same `COPY --from=go-src`/`js-src` logic and losing cache coherence.
- **`COPY --link`** decouples a copy from the layers below it in the build graph, letting BuildKit skip re-executing earlier instructions in that stage purely because a copied-from stage changed — a cache optimization on top of ordinary layer caching, most valuable exactly in a multi-stage graph this wide.
- **Three genuinely different final bases** (`alpine-base`, `ubuntu-base`, `distroless-base`) selected by `--target=final-alpine|final-ubuntu|final-distroless` are three real trade-offs: Alpine (smallest, musl libc, has a shell), Ubuntu (glibc compatibility, larger), distroless (no shell, no package manager — smallest attack surface, but the comment block explains real feature loss: no `GF_*__FILE` secret expansion, no AWS credential generation, because those depend on `run.sh`, and distroless has no shell to run `run.sh` in).
- **Non-root `USER "$GF_UID"`** is set in every final stage, using a numeric UID (`472`) rather than a username — deliberate, because the distroless stage has no `/etc/passwd` entry for `grafana` until `distroless-prep` synthesizes one and it's copied in (`COPY --from=distroless-prep /tmp/distroless-passwd /etc/passwd`); a numeric UID works even without a name resolving.
- **No `HEALTHCHECK` instruction appears anywhere in this file** — worth calling out explicitly since it's a reasonable assumption for a production image to make. Health signaling for Grafana in practice comes from the orchestrator (Kubernetes liveness/readiness probes hitting `/api/health`) rather than a baked-in `HEALTHCHECK`, which is itself a real, current design choice worth knowing: `HEALTHCHECK` and orchestrator-level probes are alternatives, not requirements that stack.
- **`FROM final-alpine`** with no `AS` at the very end is what makes Alpine the *default* image when you `docker build .` without `--target` — the last stage in the file wins when none is specified.

---

## Source

- **Concept:** Multi-stage Dockerfile builds — shared stages, `--target` variant selection, `COPY --from`
- **Domain:** docker
- **Repo:** [grafana/grafana](https://github.com/grafana/grafana) → [`Dockerfile`](https://github.com/grafana/grafana/blob/main/Dockerfile) — Grafana's production multi-variant (Alpine/Ubuntu/distroless) build definition
