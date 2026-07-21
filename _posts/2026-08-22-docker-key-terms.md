---
layout: post
title: "Docker Key Terms: Image, Layer, and Container — the Vocabulary Behind Every Post"
description: "A standalone glossary of the Docker terms used across this blog's image, build, runtime, and operations posts — image, layer, container, Dockerfile, ENTRYPOINT vs CMD, multi-stage build, registry, volume, bind mount, network, Compose, build cache, base image, distroless, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: docker
order: 99
tags: [docker, glossary, containers]
---

**TL;DR:** This is the reference page for the Docker vocabulary used throughout this blog's image, build, runtime, and operations posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

> **In plain English (30 sec):** Like Git commits for filesystem — each Dockerfile line is cached layer.

The posts in this domain assume you already know what an image layer or a `depends_on` condition is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Image, layers & the Dockerfile

### Image
A Docker image is a read-only, content-addressed artifact — a stack of layers plus a config blob describing how to run it. It's the template from which containers are created; it never changes at runtime, and two images built from the same base share identical layers on disk and over the network rather than duplicating them. Deep dive: [Image & layers]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }}).

### Layer
A layer is an immutable, content-addressed diff of what one filesystem-touching instruction (`RUN`, `COPY`, `ADD`) changed when the image was built. Layers are merged into a single filesystem view at runtime by a union filesystem (`overlay2` is the default on Linux), and an unchanged layer with unchanged inputs is reused from cache instead of being rebuilt — but the moment one layer's cache misses, every layer after it must rebuild too. Deep dive: [Image & layers]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }}).

### Build cache (layer caching)
Layer caching reuses a previously-built layer when an instruction and all the layers before it are byte-identical to a prior build, keyed by a hash of the instruction plus its inputs. Ordering instructions so dependency manifests are copied before source code is what keeps a rebuild fast — a change to `app.py` invalidates only the final `COPY`, not the cached dependency-install layer above it. Deep dive: [Image & layers]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }}) and [BuildKit cache mounts vs layer caching]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }}).

### BuildKit cache mount
A cache mount (`RUN --mount=type=cache,target=<path>`) is a persistent scratch directory BuildKit tracks by mount ID, not by layer digest — its contents are never baked into any image layer and survive even a `--no-cache` rebuild that discards the whole layer graph. It solves a different problem than layer caching: keeping package-manager downloads (pip's cache, Go's module cache) warm on a fresh CI runner where no layer cache exists yet. Deep dive: [BuildKit cache mounts vs layer caching]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }}).

### Dockerfile
A Dockerfile is an ordered list of instructions that BuildKit (the default builder since Docker Engine 23.0) parses into a dependency graph and executes, producing layers written into containerd's content store as a taggable image. Filesystem instructions (`RUN`, `COPY`, `ADD`) create layers; metadata instructions (`ENV`, `ARG`, `EXPOSE`, `CMD`, `ENTRYPOINT`, `USER`, `WORKDIR`) only change the image config and cost no disk or cache. Deep dive: [Dockerfile instructions]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }}).

### Build context
The build context is the entire directory sent to the builder before a single instruction runs — `docker build .` ships everything (minus `.dockerignore` exclusions), not just the Dockerfile. A stray `node_modules/` or `.git/` in that directory slows every build and can leak secrets into layers, which is why a tight `.dockerignore` matters as much as the Dockerfile itself. Deep dive: [Dockerfile instructions]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }}).

### BuildKit & the `# syntax=` frontend
BuildKit is the default build engine in current Docker Engine and Docker Desktop, replacing the legacy builder — it parses the Dockerfile into a graph, runs independent instructions in parallel, and enables features like cache mounts and heredocs. The `# syntax=docker/dockerfile:1.x` line at the top of a Dockerfile pins the *frontend* image that parses the rest, letting a Dockerfile opt into newer syntax (e.g. `COPY --parents`) independent of which Docker Engine version is running the build. Deep dive: [BuildKit cache mounts vs layer caching]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }}).

### ENTRYPOINT vs CMD
`ENTRYPOINT` sets the executable that always runs as the container's PID 1; `CMD` supplies its default arguments and is fully overridable at `docker run` time, whereas `ENTRYPOINT` is not. They combine — the typical pattern is `ENTRYPOINT ["python3"]` with `CMD ["app.py"]`, so the command stays fixed but the argument can be swapped — and both come in exec form (`["a","b"]`, no shell) versus shell form (a string, which wraps PID 1 in `/bin/sh -c`). Deep dive: [Dockerfile instructions]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }}).

### ARG vs ENV
`ARG` is a build-time-only variable, passed with `--build-arg` and gone once the image is built, while `ENV` is baked into the final image config and visible to every process at container runtime (and to `docker inspect`). The standard hand-off is `ENV NODE_ENV=$APP_ENV` — declare the choice with `ARG`, then promote it to runtime with `ENV`. Deep dive: [Dockerfile instructions]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }}).

### Base image
A base image is the `FROM` line's starting point — everything from the OS userland to a language runtime (e.g. `python:3.11-slim`, `golang:1.22-alpine`) that the rest of the Dockerfile layers on top of. Because layers are content-addressed and shared, every image built from the same base reuses that base's layers exactly once on disk and across the network. Deep dive: [Image & layers]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }}).

### Multi-stage build
A multi-stage build declares multiple `FROM` stages in one Dockerfile, each with its own base image and layer cache, so only the final stage ships — the compiler, headers, and source tree in earlier stages are discarded. `COPY --from=<stage>` is the only way to pull an artifact (e.g. a compiled binary) forward, and `--target` lets one file produce multiple images (a slim production image plus a debug image with the toolchain still attached). Deep dive: [Multi-stage builds]({{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }}).

### distroless & scratch
A distroless image strips the base down to libc, a CA cert bundle, and your static binary — no shell, no package manager, no `useradd` — shrinking attack surface at the cost of hand-rolling basics like `/etc/passwd`. `scratch` is the extreme: literally zero base OS, so `runc` just execs one executable inside the namespaces it creates with no scaffolding at all. Deep dive: [Multi-stage builds]({{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }}) and [Container runtime]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }}).

## Runtime, namespaces & cgroups

### Container
A container is a running instance of an image: the read-only image layers plus one thin writable layer on top, isolated by Linux namespaces and resource-bound by cgroups. The writable layer holds everything the process changes at runtime and is deleted when the container is removed — which is why database data must live in a volume, not in the container's own filesystem. Deep dive: [Containers & runtime]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }}).

### Runtime chain: dockerd → containerd → runc
`dockerd` delegates over gRPC to `containerd`, which spawns one `containerd-shim-runc-v2` process per container; that shim invokes `runc` to create the namespaces and cgroups and exec PID 1, after which `runc` exits and the shim stays behind as the actual supervisor. This split is why `dockerd` (or even `containerd`) can restart without your containers dying — the shim reparents to init and reattaches. Deep dive: [Container runtime]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }}).

### Namespaces & cgroups
Namespaces give a container its own isolated view of the system — PID, network, mount, UTS, IPC, and user — so it thinks it's alone on a machine, while cgroups enforce kernel-level resource ceilings on that process tree. `runc` writes these into the kernel per the OCI Runtime Spec when it starts the container; together they are what makes a container "contained" rather than just a chrooted process. Deep dive: [Container runtime]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }}).

### Resource limits (mem_limit / cpus)
`mem_limit`/`--memory` and `cpus`/`--cpus` are a thin interface onto cgroups: exceeding a memory limit gets the process killed by a cgroup-scoped OOM killer, while exceeding a CPU limit only throttles (the container gets scheduled less often, it doesn't die). Plain `docker compose up` only honors the top-level `mem_limit`/`cpus` keys — the `deploy.resources` block is Swarm-only and silently ignored outside Swarm mode. Deep dive: [Resource limits & cgroups]({{ '/docker/docker-resource-limits-and-cgroups/' | relative_url }}).

### Container security: non-root, capabilities, seccomp
Hardening is four independent, stacked kernel layers — UID/GID, Linux capabilities, seccomp syscall filtering, and AppArmor/SELinux — and setting `USER 1000` closes only the first. Docker's default capability set and default seccomp allow-list apply regardless of which UID runs, so a non-root process can still hold `CAP_NET_RAW`; dropping capabilities (`--cap-drop=ALL`) and keeping `seccomp=default` plus `no-new-privileges` is what actually narrows the surface. Deep dive: [Docker security]({{ '/docker/docker-security-nonroot-capabilities-seccomp/' | relative_url }}).

## Storage & networking

### Named volume
A named volume is Docker-managed host storage referenced by name (not a host path), living under `/var/lib/docker/volumes/` and declared under the top-level `volumes:` key in Compose. It outlives the container that created it — `docker rm` removes the writable layer, not the volume — so a new container attaching the same name picks up exactly where the last left off. Deep dive: [Volumes & bind mounts]({{ '/docker/volumes-and-bind-mounts/' | relative_url }}).

### Bind mount
A bind mount maps an exact host path into the container's filesystem as a live, two-way window — changes on either side are immediately visible on the other. It's how you inject your own config or source code without baking it into the image (often read-only, `:ro`, to stop the container writing back), and it's distinct from a named volume because its correctness depends on the host's directory layout. Deep dive: [Volumes & bind mounts]({{ '/docker/volumes-and-bind-mounts/' | relative_url }}).

### User-defined bridge network & embedded DNS
Every user-defined bridge network runs an embedded DNS server (at `127.0.0.11` inside each attached container) that resolves a container's name to its *current* IP on every lookup. This is what lets containers address each other by stable service name instead of a hardcoded IP that goes stale on restart — the default `bridge` network every host has does *not* do this, which is the usual source of "why can't my containers see each other by name." Deep dive: [Docker networking]({{ '/docker/docker-networking-bridge-and-service-discovery/' | relative_url }}).

### Overlay network
An overlay network extends the same name-based DNS-discovery model across multiple Docker hosts (Swarm mode) by encapsulating container traffic between daemons with VXLAN. Containers on different physical machines still resolve and reach each other by service name, so the application's lookup logic doesn't change as the system scales past one host. Deep dive: [Docker networking]({{ '/docker/docker-networking-bridge-and-service-discovery/' | relative_url }}).

## Orchestration & operations

### Docker Compose
`docker compose` (no hyphen — the current CLI plugin, not the legacy `docker-compose` V1 binary) reads a declarative YAML spec describing every service, resolves the `depends_on` graph, creates one shared default network, and starts services whose dependencies are ready. It turns "twenty `docker run` commands in the right order" into one reproducible file that's the source of truth for a multi-container system. Deep dive: [Docker Compose]({{ '/docker/docker-compose-multi-container-orchestration/' | relative_url }}).

### depends_on & healthcheck
`depends_on` controls start order, and with `condition: service_healthy` it waits for a dependency's `HEALTHCHECK` to actually pass rather than merely for its process to launch — the fix for "my app crash-loops because the database wasn't ready." A healthcheck is a command Docker runs *inside* the container on an interval whose exit code decides health state; it's an input signal (to `depends_on` and your tooling), separate from the restart policy that only fires on a real process exit. Deep dive: [Healthchecks & restart policies]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }}).

### Restart policy
A restart policy declares what the daemon does when a container's PID 1 actually exits: `no` (never), `always` (even after `docker stop`, on daemon reboot), `on-failure[:max]` (non-zero exit only), or `unless-stopped` (like `always` but respects an explicit `docker stop`). It's independent of health state — an `unhealthy` container is not auto-restarted by Docker itself; only a process exit triggers it. Deep dive: [Healthchecks & restart policies]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }}).

### Logging driver
The logging driver decides where a container's stdout/stderr goes; Docker's default `json-file` has no size cap and no rotation until you set `max-size`/`max-file` explicitly, so a long-running production container silently fills the disk. `logging.options.max-size`/`max-file` make the driver rotate and delete old log files — opt-in, because Compose has no "production mode" that changes this default for you. Deep dive: [Docker in production]({{ '/docker/docker-in-production-logging-secrets-compose-profiles/' | relative_url }}).

### Secrets management
A "secret" passed via `environment:` or `env_file:` lands in the container's environment and is readable through `docker inspect` or `/proc/<pid>/environ` — neither compose key hides it. The mechanism that actually keeps a value out of inspection is generating it once at deploy time and mounting it as a *file* the app reads, never through the environment. Deep dive: [Docker in production]({{ '/docker/docker-in-production-logging-secrets-compose-profiles/' | relative_url }}).

### Compose profiles
`profiles:` lets one `docker-compose.yml` define every possible service while `COMPOSE_PROFILES` (set per environment) decides which actually start on `docker compose up` — without maintaining a drifting parallel `docker-compose.prod.yml`. It answers "which of these 30 services run here" — the dev laptop starts everything for local testing, production starts only what it needs. Deep dive: [Docker in production]({{ '/docker/docker-in-production-logging-secrets-compose-profiles/' | relative_url }}).

## Distribution & supply chain

### Registry
A registry is a server that stores images as content-addressed blobs keyed by SHA-256 digest, so identical bytes (the same base layer, say) are stored and transferred only once no matter how many images or repos reference them. `docker push` sends a `HEAD` for each blob first and skips any the registry already has; a tag is just a mutable pointer to a manifest digest, which is why pinning to `image@sha256:...` — not `image:latest` — is the only way to guarantee identical bytes. Deep dive: [Registries & distribution]({{ '/docker/registries-and-image-distribution/' | relative_url }}).

### Manifest, image index & digest
A manifest is a small JSON document listing the config blob and ordered layer blobs that make up one image; an image index (manifest list) points to multiple per-platform manifests so one tag resolves to different bytes per architecture. The digest is the only authoritative identifier — the tag is mutable and the index entries are immutable, so a re-push swaps which index the tag points at while old digests stay fetchable. Deep dive: [Registries & distribution]({{ '/docker/registries-and-image-distribution/' | relative_url }}).

### Multi-arch builds & buildx
`docker buildx build --platform linux/amd64,linux/arm64` builds once per platform and assembles a single image index, but non-native platforms run under slow QEMU emulation unless you cross-compile the binary natively and just `COPY` it per platform. buildx auto-injects `TARGETPLATFORM`/`TARGETARCH` so a Dockerfile can pick the right pre-built binary, and multi-platform output specifically requires the `docker-container` builder driver — the default `docker` driver can't produce a manifest list. Deep dive: [Multi-arch builds]({{ '/docker/multi-arch-builds-buildx-emulation-vs-cross-compile/' | relative_url }}).

### Image signing & SLSA provenance
A `cosign` signature proves *which identity produced a set of bytes* (via a keyless Fulcio cert + Rekor log), but says nothing about *how* — which source commit, dependencies, or build steps. A SLSA provenance attestation is a separate, equally-signed in-toto predicate attached to the same digest recording the builder id and source commit, so a deploy-time policy can reject an image built from the wrong repo even though its signature is valid. Deep dive: [Image signing & supply chain]({{ '/docker/container-image-signing-supply-chain-cosign-slsa-provenance/' | relative_url }}).

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.




