---
layout: page
title: "Docker Interview Questions: 79 Real-World Q&A from Production Manifests"
description: "79 interview-ready Docker questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/docker/
---

Bite-sized, standalone interview questions and answers for Docker. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">79</span></strong> questions shown. Filter by keyword or difficulty below.</p>

<div class="qa-toolbar" id="qa-toolbar">
  <input type="text" id="qa-search" placeholder="Filter questions by keyword…" aria-label="Filter questions" />
  <button type="button" id="qa-expand-all" class="qa-expand-btn">Expand all</button>
  <div class="qa-diff-buttons" id="qa-diff-buttons">
    <button type="button" data-diff="all" class="active">All</button>
    <button type="button" data-diff="Beginner">Beginner</button>
    <button type="button" data-diff="Intermediate">Intermediate</button>
    <button type="button" data-diff="Expert">Expert</button>
  </div>
</div>

## Topic: Images & layers (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does changing one source file sometimes cause a 10-minute rebuild instead of a 10-second one? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Cache invalidation cascades downward through the layer stack. If you `COPY . .` early in the Dockerfile, any file change invalidates that layer and every layer after it — including expensive `RUN pip install` steps that haven't actually changed. The fix is ordering: copy dependency manifests first, install deps, then copy source code last so only the final layer rebuilds on code edits.

<p class="qa-link">[Full post →]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between a metadata instruction like `CMD` and a filesystem instruction like `RUN`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ENV`, `ARG`, `CMD`, `EXPOSE`, `LABEL`, and `WORKDIR` modify image configuration stored in the manifest — they don't create a layer on disk and don't cost cache or storage. `RUN`, `COPY`, and `ADD` produce a filesystem diff (an immutable, content-addressed layer). Only the second group participates in layer caching or adds to image size.

<p class="qa-link">[Full post →]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why do two images built from the same base take less disk space than building them independently? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Docker images share content-addressed layers on disk. Two images with identical base layers reference the same blobs in the content store — no duplication. When pulling, the client skips any layer whose SHA-256 digest already exists locally, so shared bases are transferred only once.

<p class="qa-link">[Full post →]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What component actually manages the layer content store and the overlay2 snapshotter — dockerd or containerd? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
containerd owns the content store (blob storage addressed by SHA-256 digest) and the snapshotter that mounts layers into a live overlay2 filesystem. `dockerd` is a client that delegates to containerd over gRPC — it handles the Docker-specific features (build, networking, volumes) but does not manage layers directly.

<p class="qa-link">[Full post →]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the common mistake when writing a Dockerfile that destroys build cache? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Placing `COPY . .` before dependency installation (e.g., `pip install -r requirements.txt` or `npm ci`). Any source code change invalidates the "copy everything" layer, which cascades to and re-runs every subsequent layer including the expensive dependency install. The correct order is always: dependency manifests → install → source copy.

<p class="qa-link">[Full post →]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `RUN --mount=type=cache` differ from regular layer caching? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Regular layer caching skips re-running an entire instruction when the cache key matches — the layer's contents are baked into the image. A BuildKit cache mount lets an instruction re-run but reuses a persistent directory (e.g., pip's download cache) across builds. The cache mount's contents are never baked into any image layer, so they survive `--no-cache` rebuilds that discard the entire layer graph.

<p class="qa-link">[Full post →]({{ '/docker/docker-image-layers-and-build-cache/' | relative_url }})</p>
  </div>
</div>

## Topic: Dockerfile (build) (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the build context, and why does a stray `node_modules/` or `.git/` directory matter? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`docker build .` sends the entire directory tree (minus `.dockerignore` exclusions) to the builder before any instruction runs. A large `node_modules/` or `.git/` directory inflates the context tarball, slows every build, and can leak secrets into layers if files are carelessly `COPY`'d. A `.dockerignore` file that excludes build artifacts and version control is essential.

<p class="qa-link">[Full post →]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the practical difference between `ARG` and `ENV` in a Dockerfile? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ARG` values exist only during the build phase (passed via `--build-arg`) and vanish from the final image. `ENV` values are baked into the image manifest and visible to every process at container runtime. The standard pattern is `ENV NODE_ENV=$APP_ENV` to turn a build-time build arg into a runtime-visible environment variable.

<p class="qa-link">[Full post →]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `EXPOSE 3000` actually do at runtime? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Nothing. It's metadata — it documents the app's port in the image manifest and serves as a default for inter-container port discovery in Compose. It does not publish the port to the host; that requires `-p 3000:3000` at `docker run` time or a `ports:` entry in Compose.

<p class="qa-link">[Full post →]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the `# syntax=docker/dockerfile:1.7` directive at the top of a Dockerfile for? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It pins the BuildKit frontend version that parses the rest of the file. BuildKit-specific instructions like `RUN --mount=type=cache`, heredoc syntax (`<<EOF ... EOF`), and `COPY --parents` require a frontend that understands them. This directive lets a Dockerfile opt into newer syntax independent of which Docker Engine version is running the build.

<p class="qa-link">[Full post →]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to the build if you use shell-form `CMD` in an image with no shell (e.g., `FROM scratch`)? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Shell-form `CMD ["node", "server.js"]` is fine, but shell-form without the array — `CMD node server.js` — gets wrapped as `/bin/sh -c "node server.js"`. In a `FROM scratch` image with no `/bin/sh`, the container fails to start because there's no shell to invoke. Always use exec-form (JSON array) in minimal images.

<p class="qa-link">[Full post →]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the production awesome-compose Dockerfile use four separate `ENV` instructions instead of one combined line? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Readability and diffability. Each `ENV` becomes its own line in `docker history`. Combining them into one `ENV KEY1=val1 KEY2=val2` line means any single value change shows as a full-line diff, obscuring what actually changed. Splitting them makes version control diffs tell you exactly which environment variable was modified.

<p class="qa-link">[Full post →]({{ '/docker/dockerfile-instructions-and-build-context/' | relative_url }})</p>
  </div>
</div>

## Topic: Multi-stage builds (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does a single-stage Dockerfile that compiles code produce an image hundreds of megabytes larger than necessary? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Everything installed during the build — compiler toolchain, dev headers, source tree, build caches — accumulates in the same filesystem layers as the application. In a single `FROM`, there's no way to discard intermediate build artifacts. Multi-stage builds solve this by letting the final image `COPY --from=builder` only the compiled artifact, leaving the entire toolchain in a discarded stage.

<p class="qa-link">[Full post →]({{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `docker build --target=builder` change what gets shipped? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
By default, `docker build` builds only the last stage and discards all earlier stages from the final image. `--target=builder` stops at the named `builder` stage and ships that instead — useful for debug images with the full toolchain still attached, built from the exact same Dockerfile as the slim production image.

<p class="qa-link">[Full post →]({{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Does a later stage automatically inherit the filesystem of an earlier stage? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. Each `FROM` starts a brand-new build stage with its own base image and independent layer cache. Nothing carries over automatically. The only way to pull something from an earlier stage is an explicit `COPY --from=<stage-name-or-index>`.

<p class="qa-link">[Full post →]({{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the trade-off between Alpine, Ubuntu, and distroless base images in Grafana's multi-variant build? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Alpine is smallest but uses musl libc (some glibc-linked binaries won't work without a shim). Ubuntu has glibc compatibility but is larger. Distroless is the smallest attack surface — no shell, no package manager — but you lose operational flexibility: no `GF_*__FILE` secret expansion or `run.sh`-based entrypoints because there's no shell to execute them.

<p class="qa-link">[Full post →]({{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Grafana use bare, seemingly unused `FROM` lines at the top of its Dockerfile? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Base images referenced only through `ARG GO_IMAGE=go-builder-base` can't be tracked by dependency bots like Dependabot. Those bare `FROM alpine:3.24.1 AS alpine-base` lines exist purely so Dependabot has a literal `FROM <image>:<tag>` to scan and bump — a real workaround for tooling limitations that has nothing to do with the build logic.

<p class="qa-link">[Full post →]({{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `COPY --link` improve build performance in a wide multi-stage graph? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`COPY --link` decouples a copy from the layers below it in the build graph. If the source stage changes, BuildKit can re-execute the copy without invalidating earlier instructions in the target stage — a cache optimization on top of ordinary layer caching, most valuable when many stages share work through intermediate stages.

<p class="qa-link">[Full post →]({{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }})</p>
  </div>
</div>

## Topic: Containers & the container runtime (containerd/runc) (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why doesn't `runc` stay running as a child process after it starts a container? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
If `runc` remained the parent of every container's process tree, restarting `dockerd` or `containerd` would kill all running containers — because terminating the parent sends signals down the tree. By design, `runc` creates the namespaces and cgroups, execs PID 1, and immediately exits. A separate `containerd-shim-runc-v2` process (reparented to init, PID 1 on the host) supervises the container after that.

<p class="qa-link">[Full post →]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the actual role of `containerd-shim-runc-v2` in the runtime chain? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
One shim process per container becomes the real parent after `runc` exits, holds the container's I/O streams (stdout/stderr), and reports the exit code back to containerd. This is why `dockerd` can restart without containers dying — the shim persists independently and reattaches to containerd when it comes back.

<p class="qa-link">[Full post →]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `docker stop` send `SIGTERM` to PID 1, and why does exec-form `CMD` matter for signal handling? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`docker stop` sends `SIGTERM` to the container's PID 1. In exec-form `CMD ["/usr/local/bin/backend"]`, PID 1 *is* the application binary — it receives the signal directly. In shell-form `CMD /usr/local/bin/backend`, PID 1 becomes `/bin/sh`, which may or may not forward `SIGTERM` to the child. In a `FROM scratch` image with no shell, shell-form `CMD` fails entirely.

<p class="qa-link">[Full post →]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if PID 1 in a container is a process that spawns children but never calls `wait()`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The container leaks defunct (zombie) processes. Linux only reaps zombies through their parent process, and a naive PID 1 that doesn't call `wait()` correctly never cleans them up. A statically-linked Go binary in a `FROM scratch` image avoids this entirely — no forking means nothing to reap.

<p class="qa-link">[Full post →]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the difference between `dockerd`'s responsibilities and `containerd`'s in modern Docker Engine? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`dockerd` handles the Docker-specific layer: image build, the Docker API, networking setup, and volume management. `containerd` owns the content store, the snapshotter, and container lifecycle via the CRI (Container Runtime Interface). `dockerd` talks to containerd over gRPC — it's one more client of containerd, not a monolithic daemon that does everything.

<p class="qa-link">[Full post →]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `FROM scratch` actually mean, and what does it tell you about what the container runtime requires? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`FROM scratch` means zero base OS — no shell, no libc, no `/bin`, nothing. It proves that `runc` only needs an executable to exec as PID 1 inside the namespaces it creates. Everything people associate with "a Linux system" is optional from the runtime's perspective; Docker images conventionally include it, but the runtime doesn't demand it.

<p class="qa-link">[Full post →]({{ '/docker/containers-runtime-containerd-runc/' | relative_url }})</p>
  </div>
</div>

## Topic: Volumes & bind mounts (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to data written to a container's filesystem when the container is removed? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's deleted. `docker rm` removes the container's thin writable layer — that's by design. Named volumes survive `docker rm` because their storage lives under Docker's managed directory (`/var/lib/docker/volumes/` on Linux), not in the container's writable layer. Only `docker rm -v` or `docker volume rm` deletes the volume.

<p class="qa-link">[Full post →]({{ '/docker/volumes-and-bind-mounts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a named volume differ from a bind mount in terms of host-path management? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A named volume is referenced by name — Docker picks and manages the host path under `/var/lib/docker/volumes/`. You don't need to know or care where that is. A bind mount maps an explicit host path (e.g., `./nginx.conf`) into the container; its correctness depends on the host's directory layout existing exactly where you specified.

<p class="qa-link">[Full post →]({{ '/docker/volumes-and-bind-mounts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What mistake does Compose make if you reference a volume name without declaring it under the top-level `volumes:` key? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Compose creates an anonymous volume — a volume with a random hash name instead of the name you intended. It still technically persists data, but there's no memorable name to attach a new container to later. The data effectively becomes orphaned.

<p class="qa-link">[Full post →]({{ '/docker/volumes-and-bind-mounts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: When would you use `read_only: true` on a bind mount? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When the container only needs to read the file and there's no legitimate reason for it to write back to the host path. The nginx config in the awesome-compose stack uses `read_only: true` on its `./proxy/nginx.conf` mount — defense-in-depth at the mount level, not just by convention.

<p class="qa-link">[Full post →]({{ '/docker/volumes-and-bind-mounts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does the Sentry stack mark its named volumes with `external: true`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It tells Compose that these volumes were created externally (by the install script) and must already exist. If they don't, Compose refuses to start rather than silently creating fresh empty volumes — which would silently wipe what looks like persistent data, the worst kind of silent failure for a database.

<p class="qa-link">[Full post →]({{ '/docker/volumes-and-bind-mounts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Can a named volume and a bind mount be used on the same service? What would that look like? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Yes — it's the standard pattern. A database service typically uses a named volume for `/var/lib/postgresql/data` (Docker-managed persistence) and a bind mount for a custom config file like `./pg_hba.conf` mounted into the container. The volume handles data lifecycle; the bind mount injects configuration the developer owns.

<p class="qa-link">[Full post →]({{ '/docker/volumes-and-bind-mounts/' | relative_url }})</p>
  </div>
</div>

## Topic: Networking (bridge/overlay) (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why can't containers on the default `bridge` network resolve each other by name? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The default `bridge` network (created automatically by Docker, not user-defined) does not run Docker's embedded DNS server. Only user-defined bridge networks have the DNS server at `127.0.0.11` that resolves container names to their current IPs. Containers on the default bridge can only communicate via IP address, which goes stale on restart.

<p class="qa-link">[Full post →]({{ '/docker/docker-networking-bridge-and-service-discovery/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to name resolution when a container restarts with a new IP on a user-defined network? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Docker's embedded DNS re-resolves the container's name to its current IP on every lookup. The restarted container gets a fresh IP from the network's pool, and the next DNS query from any peer returns that new IP. Nothing needs manual updating — the DNS record is always live.

<p class="qa-link">[Full post →]({{ '/docker/docker-networking-bridge-and-service-discovery/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Traefik discover which containers to route traffic to? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It mounts the Docker socket (`/var/run/docker.sock`) as a read-only bind mount and watches container start/stop events via the Docker API. Containers with labels like `traefik.enable=true` and `traefik.http.routers.whoami.rule=Host(...) are automatically picked up — no config file restart required.

<p class="qa-link">[Full post →]({{ '/docker/docker-networking-bridge-and-service-discovery/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the risk of not setting `--providers.docker.exposedbydefault=false` on Traefik? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Every container with an exposed port becomes routable through Traefik automatically. With the flag set to `false`, only containers that explicitly opt in with `traefik.enable=true` label get routed — a real security-relevant default that prevents unintended exposure of services not meant to be public.

<p class="qa-link">[Full post →]({{ '/docker/docker-networking-bridge-and-service-discovery/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do overlay networks extend the same name-based discovery model across multiple Docker hosts? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Overlay networks encapsulate container traffic between Docker daemons on different hosts using VXLAN tunneling. Containers on different physical machines can still resolve and reach each other by service name through the same DNS mechanism — the application doesn't change how it looks anything up, just the network driver underneath is different.

<p class="qa-link">[Full post →]({{ '/docker/docker-networking-bridge-and-service-discovery/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why doesn't the Traefik compose file declare an explicit `networks:` block despite having multiple services? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Compose creates one project-scoped user-defined network automatically and attaches every service to it. Since Traefik and its backends are in the same compose file, they share this implicit network and can reach each other by service name. An explicit `networks:` block is only needed when services span multiple compose files or require custom network isolation.

<p class="qa-link">[Full post →]({{ '/docker/docker-networking-bridge-and-service-discovery/' | relative_url }})</p>
  </div>
</div>

## Topic: Docker Compose (multi-container) (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the difference between `condition: service_started` and `condition: service_healthy` in `depends_on`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`service_started` waits only for the dependency's process to launch — it doesn't confirm the service is actually accepting connections. `service_healthy` waits for the dependency's healthcheck to pass first. The gap between "process started" and "healthcheck passing" is exactly where "works on my machine, crash-loops in CI" bugs come from.

<p class="qa-link">[Full post →]({{ '/docker/docker-compose-multi-container-orchestration/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Sentry's compose file mix `*depends_on-healthy` and `*depends_on-default` on the same service? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Different dependencies have different readiness requirements. Redis, Kafka, and pgbouncer must be genuinely *healthy* (accepting connections) before the Sentry web process starts — a broken connection to any of those crashes startup. Memcached, SMTP, and others only need to have *started* — a deliberate, per-dependency distinction, not a blanket setting.

<p class="qa-link">[Full post →]({{ '/docker/docker-compose-multi-container-orchestration/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do YAML anchors and `x-` top-level keys make a 70-service compose file maintainable? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Keys prefixed `x-` are ignored by Compose as services but valid YAML, so they serve as anchor definition blocks. A shared restart policy or healthcheck timing is defined once as an anchor (e.g., `&restart_policy`) and merged into every service with `<<: *restart_policy` — avoiding dozens of identical repeated blocks. Without this, a 70-service file would be unmaintainable.

<p class="qa-link">[Full post →]({{ '/docker/docker-compose-multi-container-orchestration/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does environment variable interpolation like `$HEALTHCHECK_INTERVAL` in a compose file actually do? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Compose substitutes these from the shell environment or a `.env` file *before* the YAML is even parsed as a service definition. This lets operators tune healthcheck aggressiveness globally without editing the compose file itself — the file stays stable while environment-specific tuning lives outside it.

<p class="qa-link">[Full post →]({{ '/docker/docker-compose-multi-container-orchestration/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is the legacy `docker-compose` (hyphenated, V1) different from `docker compose` (V2)? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
V1 was a standalone Python binary. V2 is a Go CLI plugin built into Docker Engine with different performance characteristics — faster startup, better parallelism, and it understands current Compose Specification features like `restart: true` on `depends_on` entries. Tutorials still teaching `docker-compose up` are describing the legacy tool.

<p class="qa-link">[Full post →]({{ '/docker/docker-compose-multi-container-orchestration/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if you don't declare a `networks:` block in a multi-service compose file? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Compose creates one project-scoped user-defined bridge network automatically and attaches every service to it. All services can reach each other by service name through the embedded DNS. This is invisible but doing significant work — even Sentry's 70-service file has no `networks:` block at all, relying entirely on this implicit default.

<p class="qa-link">[Full post →]({{ '/docker/docker-compose-multi-container-orchestration/' | relative_url }})</p>
  </div>
</div>

## Topic: Healthchecks & restart policies (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is a healthcheck probe's test command limited to telling you about the container's internal state, not external reachability? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The healthcheck command runs inside the container's own PID, network, and mount namespace. `curl http://localhost` tells you whether the app answers on its own loopback — not whether a host-level port mapping or reverse proxy can reach it. This isolates "is the app itself broken" from "is the network in front of it broken."

<p class="qa-link">[Full post →]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens if a container is marked `unhealthy` — does Docker restart it? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. Health state is primarily an input signal — it feeds into `depends_on: condition: service_healthy` in other services, into orchestrator probes, and into tooling watching `docker inspect`. An unhealthy container is *not* automatically restarted by Docker itself. Only an actual process exit triggers the restart policy.

<p class="qa-link">[Full post →]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the difference between `restart: always` and `restart: unless-stopped`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Both restart on process exit. The difference: `always` restarts the container even after an explicit `docker stop` when the Docker daemon reboots. `unless-stopped` respects `docker stop` — if you manually stopped it, it stays stopped until you explicitly `docker start` it again. Using `always` for something you intend to manually stop for maintenance is a common confusing mistake.

<p class="qa-link">[Full post →]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `start_period` do in a healthcheck, and why is omitting it dangerous? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`start_period` defines a grace window at startup where failed probes don't count toward the `retries` threshold. Without it, a slow-starting app (e.g., a Java service taking 30 seconds to bind) racks up failures immediately and can be marked unhealthy before it ever had a chance to come up — causing dependents to block or the container to be stuck in an unhealthy state permanently.

<p class="qa-link">[Full post →]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does `restart: true` inside a `depends_on` entry differ from the top-level `restart:` policy? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The top-level `restart:` controls what happens when *this* service's own process exits. `restart: true` inside `depends_on` means "if the dependency itself gets restarted, restart *this* service too" — propagating a dependency's restart forward. Nginx uses this to restart itself when its upstream `web` service restarts, without needing a separate mechanism.

<p class="qa-link">[Full post →]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does each service in Sentry's stack have a protocol-specific healthcheck test instead of a generic template? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
"Healthy" means something different for each service: Redis uses `redis-cli ping | grep PONG`, Kafka uses `nc -z localhost 9092` (just "is the broker port accepting TCP"), memcached speaks its own text protocol (`echo stats | nc`), and nginx does a real `curl` HTTP request. Each is the cheapest check that's still a meaningful proxy for "this specific service is usable."

<p class="qa-link">[Full post →]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does the `x-file-healthcheck` anchor in Sentry's compose file do, and why is it written as inline Python? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It checks whether a consumer process updated a heartbeat file (`/tmp/health.txt`) recently — a liveness signal that's "did this worker actually do work recently," not "can I reach a port." It's inline Python (not a mounted script) so the same anchor works across four different image bases without wiring a script into every one of them.

<p class="qa-link">[Full post →]({{ '/docker/healthchecks-and-restart-policies/' | relative_url }})</p>
  </div>
</div>

## Topic: Resource limits (cgroups) (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why can one runaway container take down every other container on the host if no resource limits are set? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Without a memory limit, a leaking container's usage climbs until the host kernel runs out of RAM. The host-wide OOM killer fires and scores *every* process on the machine — it doesn't know about container boundaries and can kill your database's process instead of the leaking service. Per-container cgroup limits scope the OOM killer to the offending container's process tree.

<p class="qa-link">[Full post →]({{ '/docker/docker-resource-limits-and-cgroups/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens when a container exceeds its CPU limit versus its memory limit? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Exceeding a memory limit kills a process (SIGKILL) — memory can't be throttled, a process either fits or it doesn't. Exceeding a CPU limit throttles the process — it gets scheduled less often and requests get slower, but nothing terminates. This is a fundamental design asymmetry: OOM is catastrophic, CPU contention is just latency.

<p class="qa-link">[Full post →]({{ '/docker/docker-resource-limits-and-cgroups/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the trap with `deploy.resources` in a Compose file for resource limits? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`deploy.resources` is a Swarm-only field — `docker stack deploy` reads it, but plain `docker compose up` silently ignores it entirely. The top-level `mem_limit` and `cpus` keys (not nested under `deploy:`) are what plain Compose actually enforces. A Compose file with limits only under `deploy:` has no resource limits outside Swarm mode, and nothing warns you.

<p class="qa-link">[Full post →]({{ '/docker/docker-resource-limits-and-cgroups/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Elasticsearch use `ulimits.memlock: {soft: -1, hard: -1}` in addition to `mem_limit`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`ulimits` are POSIX per-process resource limits (`setrlimit`), a mechanism that predates cgroups entirely. Elasticsearch unlocks unlimited memory-locking so its JVM can `mlock` its heap into physical RAM, preventing the kernel from swapping it out. Swapped JVM heap pages cause garbage-collection pauses severe enough to make the service unusable — `mem_limit` limits total memory, `memlock` prevents swapping.

<p class="qa-link">[Full post →]({{ '/docker/docker-resource-limits-and-cgroups/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why do some teams set memory limits on every service but never set CPU limits? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An out-of-memory event is catastrophic — a killed process, possibly mid-write for a database. CPU contention just makes requests slower, a self-limiting problem. Teams with limited tuning budget often spend it all on memory ceilings (where the failure mode is severe) and leave CPU scheduling to the kernel's default fair-share behavior (where the failure mode is latency).

<p class="qa-link">[Full post →]({{ '/docker/docker-resource-limits-and-cgroups/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What underlying kernel mechanism do Docker's `mem_limit` and `cpus` settings map to? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Linux cgroups (control groups). `mem_limit: 6g` becomes the cgroup's `memory.max` file (cgroup v2), and `cpus: "1.5"` becomes `cpu.max`'s quota/period pair. Docker's settings are a thin interface — `runc` writes into the cgroup when creating the container's process tree, and the kernel enforces the limits from there.

<p class="qa-link">[Full post →]({{ '/docker/docker-resource-limits-and-cgroups/' | relative_url }})</p>
  </div>
</div>

## Topic: Registries & image distribution (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why is the second `docker push` of a rebuilt image dramatically faster than the first? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Before uploading each blob, the client sends a `HEAD` request asking the registry "do you already have this digest?" Any layer the registry already has (from any image, any repo) is skipped entirely. The push only transfers genuinely new blobs — and if only one layer changed, that's the only one transferred.

<p class="qa-link">[Full post →]({{ '/docker/registries-and-image-distribution/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the relationship between a tag, a manifest, and a blob in a registry? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A blob is a content-addressed chunk (keyed by SHA-256 digest). A manifest is a small JSON document listing the digests of one image's config and layers. A tag is a mutable pointer to one manifest's digest. The digest is the only thing that identifies content; tags can be reassigned at will, which is why pinning to `image@sha256:...` is the only way to guarantee identical bytes.

<p class="qa-link">[Full post →]({{ '/docker/registries-and-image-distribution/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a single tag like `myapp:1.0` serve different binaries on `linux/amd64` vs `linux/arm64`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The tag points to an image index (manifest list), which contains multiple platform-specific manifests. The puller sends its own platform in the `Accept` header, the registry returns the image index, the client selects the manifest matching its architecture, and then pulls that manifest's specific layers. Shared base layers have identical digests and are stored once.

<p class="qa-link">[Full post →]({{ '/docker/registries-and-image-distribution/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `:latest` have no special meaning in the registry protocol? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`:latest` is just a tag name — the registry stores no "most recent build" guarantee. It's the Docker CLI's default when no tag is specified, not a server-side "always points to newest" behavior. A tag called `:latest` can point to an old, broken image just as easily as a new one. Only the digest actually identifies content.

<p class="qa-link">[Full post →]({{ '/docker/registries-and-image-distribution/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `storage.cache.blobdescriptor: inmemory` in the distribution registry config actually cache? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Metadata about blobs (digest, size, media type), not the blobs themselves. Actual blob bytes live on disk under `storage.filesystem.rootdirectory` (or S3/GCS in production). This split means a registry restart doesn't lose data but does briefly slow down existence checks until the metadata cache warms.

<p class="qa-link">[Full post →]({{ '/docker/registries-and-image-distribution/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the growing problem with `FROM` lines that default to Docker Hub for base images? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Docker Hub's anonymous and free-tier pull rate limits can cause `FROM python:3.12-slim` to start failing in CI under load. Production pipelines increasingly authenticate their pulls or mirror base images through a private pull-through cache registry — something older Docker tutorials don't address at all.

<p class="qa-link">[Full post →]({{ '/docker/registries-and-image-distribution/' | relative_url }})</p>
  </div>
</div>

## Topic: BuildKit & build caching (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `docker build --no-cache` still skip redownloading packages when using BuildKit cache mounts? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A BuildKit cache mount tracks its contents by mount ID, not by layer digest. Its contents are never baked into any image layer, so they survive even `--no-cache` which discards the entire layer graph. The instruction re-runs, but the cache mount is still populated — so `go mod download` effectively no-ops against existing cached modules.

<p class="qa-link">[Full post →]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Grafana use two separate cache mounts (`/go/pkg/mod` and `/root/.cache/go-build`) on the same `RUN` instruction instead of one? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
They're populated by different tools at different times and invalidate on different triggers. Module downloads change only when `go.mod`/`go.sum` change, but the Go build cache changes on every source edit. Mounting them separately means a source-only change still gets full module-download reuse without needing the build cache to also stay valid.

<p class="qa-link">[Full post →]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do layer caching and BuildKit cache mounts solve complementary problems? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Layer caching gives a fast local rebuild — if the instruction and its inputs are identical, the entire instruction is skipped. Cache mounts give a fast *first* build on a fresh machine (like CI runners) where no prior layer cache exists — the instruction re-runs but reuses a persistent directory of previously downloaded packages. The two are stacked, not redundant.

<p class="qa-link">[Full post →]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does `COPY --parents **/go.mod **/go.sum ./` do, and why is it needed in Grafana's build? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a `1.7-labs`-gated feature that copies files while preserving their relative directory structure. Grafana's build is a multi-module Go workspace (`go.work`) with `go.mod` files scattered across subdirectories. Without `--parents`, each would need its own `COPY` line — this replaces dozens of them.

<p class="qa-link">[Full post →]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why are cache mount contents "invisible to the final image"? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
BuildKit cache mount directories are mounted only during the `RUN` instruction's execution. Nothing written to them becomes part of any image layer — the layer records only the instruction's actual filesystem changes, not what was written to the cache mount path. This means you can cache gigabytes of package downloads without bloating the shipped image.

<p class="qa-link">[Full post →]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Is `DOCKER_BUILDKIT=1` still necessary to use cache mounts and BuildKit features? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No. BuildKit has been the default builder in Docker Engine and Docker Desktop for years — `DOCKER_BUILDKIT=1` is a no-op on current versions. Cache mounts and other BuildKit features work out of the box. The `# syntax=docker/dockerfile:1.7` directive pins the frontend syntax version, which is a different concern from whether BuildKit itself is enabled.

<p class="qa-link">[Full post →]({{ '/docker/buildkit-cache-mounts-vs-layer-caching/' | relative_url }})</p>
  </div>
</div>

## Topic: Security (rootless, non-root user, seccomp/AppArmor) (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why doesn't `USER 1000` in a Dockerfile alone make a container secure? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Container hardening is four independent kernel-enforced layers: UID/GID, Linux capabilities, seccomp syscall filtering, and AppArmor/SELinux. Setting `USER 1000` only closes the UID door. Docker's default capability set still grants ~14 capabilities (including `CAP_NET_RAW` for raw sockets) that work regardless of which UID is running. A non-root process with the default capability set is not the same as a non-root process with *no* capabilities.

<p class="qa-link">[Full post →]({{ '/docker/docker-security-nonroot-capabilities-seccomp/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What does Docker's default seccomp profile actually block? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It uses `SCMP_ACT_ERRNO` (deny by default, then an explicit allow-list). Dangerous syscalls like `mount`, `reboot`, `unshare`, and `keyctl` are never in the allow-list — a process would need `--security-opt seccomp=unconfined` to call them, which is the kind of flag that shows up in an incident review after a container breakout.

<p class="qa-link">[Full post →]({{ '/docker/docker-security-nonroot-capabilities-seccomp/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What's the difference between rootless Docker and running a container as non-root? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Rootless Docker means `dockerd` itself runs as an unprivileged host user, using Linux user namespaces to remap UID 0 inside the container to an unprivileged UID on the host. Even a full container-to-host escape lands on a non-root host account. Running as non-root (`USER 1000` in the Dockerfile) only affects what UID the process runs as *inside* the container — it's a completely unrelated setting.

<p class="qa-link">[Full post →]({{ '/docker/docker-security-nonroot-capabilities-seccomp/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Grafana's distroless Dockerfile use `printf` to write `/etc/passwd` instead of `useradd`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Distroless images have no shell, no package manager, no `useradd` binary — that's the entire point. The Dockerfile hand-writes `/etc/passwd` and `/etc/group` as raw text. This is what "distroless" actually costs operationally: even basic user provisioning must be hand-rolled because the image has none of the tooling present.

<p class="qa-link">[Full post →]({{ '/docker/docker-security-nonroot-capabilities-seccomp/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Grafana set GID to 0 (root's group) and `chmod 777` on data directories? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
OpenShift assigns containers an arbitrary, unpredictable UID at deploy time but keeps them in group 0. Files need to be group-writable by GID 0 to work under both "run as the Dockerfile's UID" and "run as whatever OpenShift assigns." `chmod 777` is necessary because you can't `chown` in advance for a UID you don't know yet.

<p class="qa-link">[Full post →]({{ '/docker/docker-security-nonroot-capabilities-seccomp/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Which security layer runs first in the kernel when a process attempts an action — seccomp or capabilities? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Seccomp runs first, at the syscall boundary itself. It filters whether the syscall is even callable before capability checks run. A blocked syscall (like `mount`) is denied by seccomp regardless of what capabilities the process has in its effective set. Then capabilities are checked, then UID/GID file permissions, then AppArmor/SELinux mandatory access control.

<p class="qa-link">[Full post →]({{ '/docker/docker-security-nonroot-capabilities-seccomp/' | relative_url }})</p>
  </div>
</div>

## Topic: Multi-arch builds (buildx) (Order 13)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does `docker buildx build --platform linux/amd64,linux/arm64` take 10x longer than a single-platform build on an x86_64 runner? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The arm64 build doesn't run on real ARM hardware — it runs under QEMU user-mode emulation, translating every ARM64 instruction in software on x86_64. For a `RUN go build` step compiling real source, emulated execution can be 5-20x slower than native. Teams blame Docker or buildx when the actual culprit is QEMU doing exactly what it's designed to do.

<p class="qa-link">[Full post →]({{ '/docker/multi-arch-builds-buildx-emulation-vs-cross-compile/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Traefik avoid QEMU emulation entirely in its multi-arch build? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Traefik cross-compiles Go binaries natively *before* `docker buildx build` runs, using `GOOS`/`GOARCH` environment variables (Go's built-in cross-compilation support). The Dockerfile never runs a compiler — it just `COPY`s the right pre-built binary based on `$TARGETPLATFORM`. By the time buildx runs, both platform binaries exist on disk; buildx's job is packaging and manifest-list assembly only.

<p class="qa-link">[Full post →]({{ '/docker/multi-arch-builds-buildx-emulation-vs-cross-compile/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the Dockerfile know which pre-built binary to copy for each platform? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Buildx automatically injects `TARGETPLATFORM` (e.g., `linux/amd64` or `linux/arm64`) as a build arg for each platform in the matrix. The Dockerfile uses `COPY ./dist/$TARGETPLATFORM/traefik /` — variable substitution maps directly to the directory structure the Makefile already produced. No conditional logic needed.

<p class="qa-link">[Full post →]({{ '/docker/multi-arch-builds-buildx-emulation-vs-cross-compile/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why can't the default `docker` builder driver produce multi-platform output? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The default `docker` driver is tied directly to the local daemon's single-platform image store. Producing a multi-platform manifest list requires a builder instance using the `docker-container` driver (or a remote builder) — it can write to a registry with `--push` and assemble the manifest list, which the default driver cannot do.

<p class="qa-link">[Full post →]({{ '/docker/multi-arch-builds-buildx-emulation-vs-cross-compile/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Why does Traefik's GitHub Actions workflow install QEMU even though its Dockerfile never needs it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a defensive default in the `docker/setup-buildx-action` setup pattern. Seeing `setup-qemu-action` in a workflow doesn't mean QEMU is doing meaningful work — you have to check whether anything in the Dockerfile actually executes platform-specific code. Traefik's Dockerfile only does `COPY` and `apk add`, neither of which needs emulation.

<p class="qa-link">[Full post →]({{ '/docker/multi-arch-builds-buildx-emulation-vs-cross-compile/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: Is the cross-compile-then-COPY pattern universal, or only for specific languages? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's only available when your language's compiler supports targeting a different architecture natively. Go does this with `GOOS`/`GOARCH`. Many C/C++ builds with native toolchain dependencies don't have this option and genuinely need QEMU emulation. The pattern is a powerful optimization for Go projects, not a universal solution.

<p class="qa-link">[Full post →]({{ '/docker/multi-arch-builds-buildx-emulation-vs-cross-compile/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 79 across Docker

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Why does changing one source file sometimes cause a 10-minute rebuild instead of a 10-second one?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Cache invalidation cascades downward through the layer stack. If you `COPY . .` early in the Dockerfile, any file change invalidates that layer and every layer after it — including expensive `RUN pip install` steps that haven't actually changed. The fix is ordering: copy dependency manifests first, install deps, then copy source code last so only the final layer rebuilds on code edits."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a metadata instruction like `CMD` and a filesystem instruction like `RUN`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ENV`, `ARG`, `CMD`, `EXPOSE`, `LABEL`, and `WORKDIR` modify image configuration stored in the manifest — they don't create a layer on disk and don't cost cache or storage. `RUN`, `COPY`, and `ADD` produce a filesystem diff (an immutable, content-addressed layer). Only the second group participates in layer caching or adds to image size."
      }
    },
    {
      "@type": "Question",
      "name": "Why do two images built from the same base take less disk space than building them independently?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Docker images share content-addressed layers on disk. Two images with identical base layers reference the same blobs in the content store — no duplication. When pulling, the client skips any layer whose SHA-256 digest already exists locally, so shared bases are transferred only once."
      }
    },
    {
      "@type": "Question",
      "name": "What component actually manages the layer content store and the overlay2 snapshotter — dockerd or containerd?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "containerd owns the content store (blob storage addressed by SHA-256 digest) and the snapshotter that mounts layers into a live overlay2 filesystem. `dockerd` is a client that delegates to containerd over gRPC — it handles the Docker-specific features (build, networking, volumes) but does not manage layers directly."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when writing a Dockerfile that destroys build cache?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Placing `COPY . .` before dependency installation (e.g., `pip install -r requirements.txt` or `npm ci`). Any source code change invalidates the \"copy everything\" layer, which cascades to and re-runs every subsequent layer including the expensive dependency install. The correct order is always: dependency manifests → install → source copy."
      }
    },
    {
      "@type": "Question",
      "name": "How does `RUN --mount=type=cache` differ from regular layer caching?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Regular layer caching skips re-running an entire instruction when the cache key matches — the layer's contents are baked into the image. A BuildKit cache mount lets an instruction re-run but reuses a persistent directory (e.g., pip's download cache) across builds. The cache mount's contents are never baked into any image layer, so they survive `--no-cache` rebuilds that discard the entire layer graph."
      }
    },
    {
      "@type": "Question",
      "name": "What is the build context, and why does a stray `node_modules/` or `.git/` directory matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`docker build .` sends the entire directory tree (minus `.dockerignore` exclusions) to the builder before any instruction runs. A large `node_modules/` or `.git/` directory inflates the context tarball, slows every build, and can leak secrets into layers if files are carelessly `COPY`'d. A `.dockerignore` file that excludes build artifacts and version control is essential."
      }
    },
    {
      "@type": "Question",
      "name": "What's the practical difference between `ARG` and `ENV` in a Dockerfile?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ARG` values exist only during the build phase (passed via `--build-arg`) and vanish from the final image. `ENV` values are baked into the image manifest and visible to every process at container runtime. The standard pattern is `ENV NODE_ENV=$APP_ENV` to turn a build-time build arg into a runtime-visible environment variable."
      }
    },
    {
      "@type": "Question",
      "name": "What does `EXPOSE 3000` actually do at runtime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Nothing. It's metadata — it documents the app's port in the image manifest and serves as a default for inter-container port discovery in Compose. It does not publish the port to the host; that requires `-p 3000:3000` at `docker run` time or a `ports:` entry in Compose."
      }
    },
    {
      "@type": "Question",
      "name": "What is the `# syntax=docker/dockerfile:1.7` directive at the top of a Dockerfile for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It pins the BuildKit frontend version that parses the rest of the file. BuildKit-specific instructions like `RUN --mount=type=cache`, heredoc syntax (`<<EOF ... EOF`), and `COPY --parents` require a frontend that understands them. This directive lets a Dockerfile opt into newer syntax independent of which Docker Engine version is running the build."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to the build if you use shell-form `CMD` in an image with no shell (e.g., `FROM scratch`)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Shell-form `CMD [\"node\", \"server.js\"]` is fine, but shell-form without the array — `CMD node server.js` — gets wrapped as `/bin/sh -c \"node server.js\"`. In a `FROM scratch` image with no `/bin/sh`, the container fails to start because there's no shell to invoke. Always use exec-form (JSON array) in minimal images."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the production awesome-compose Dockerfile use four separate `ENV` instructions instead of one combined line?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Readability and diffability. Each `ENV` becomes its own line in `docker history`. Combining them into one `ENV KEY1=val1 KEY2=val2` line means any single value change shows as a full-line diff, obscuring what actually changed. Splitting them makes version control diffs tell you exactly which environment variable was modified."
      }
    },
    {
      "@type": "Question",
      "name": "Why does a single-stage Dockerfile that compiles code produce an image hundreds of megabytes larger than necessary?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Everything installed during the build — compiler toolchain, dev headers, source tree, build caches — accumulates in the same filesystem layers as the application. In a single `FROM`, there's no way to discard intermediate build artifacts. Multi-stage builds solve this by letting the final image `COPY --from=builder` only the compiled artifact, leaving the entire toolchain in a discarded stage."
      }
    },
    {
      "@type": "Question",
      "name": "How does `docker build --target=builder` change what gets shipped?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "By default, `docker build` builds only the last stage and discards all earlier stages from the final image. `--target=builder` stops at the named `builder` stage and ships that instead — useful for debug images with the full toolchain still attached, built from the exact same Dockerfile as the slim production image."
      }
    },
    {
      "@type": "Question",
      "name": "Does a later stage automatically inherit the filesystem of an earlier stage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Each `FROM` starts a brand-new build stage with its own base image and independent layer cache. Nothing carries over automatically. The only way to pull something from an earlier stage is an explicit `COPY --from=<stage-name-or-index>`."
      }
    },
    {
      "@type": "Question",
      "name": "What is the trade-off between Alpine, Ubuntu, and distroless base images in Grafana's multi-variant build?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Alpine is smallest but uses musl libc (some glibc-linked binaries won't work without a shim). Ubuntu has glibc compatibility but is larger. Distroless is the smallest attack surface — no shell, no package manager — but you lose operational flexibility: no `GF_*__FILE` secret expansion or `run.sh`-based entrypoints because there's no shell to execute them."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Grafana use bare, seemingly unused `FROM` lines at the top of its Dockerfile?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Base images referenced only through `ARG GO_IMAGE=go-builder-base` can't be tracked by dependency bots like Dependabot. Those bare `FROM alpine:3.24.1 AS alpine-base` lines exist purely so Dependabot has a literal `FROM <image>:<tag>` to scan and bump — a real workaround for tooling limitations that has nothing to do with the build logic."
      }
    },
    {
      "@type": "Question",
      "name": "How does `COPY --link` improve build performance in a wide multi-stage graph?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`COPY --link` decouples a copy from the layers below it in the build graph. If the source stage changes, BuildKit can re-execute the copy without invalidating earlier instructions in the target stage — a cache optimization on top of ordinary layer caching, most valuable when many stages share work through intermediate stages."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't `runc` stay running as a child process after it starts a container?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "If `runc` remained the parent of every container's process tree, restarting `dockerd` or `containerd` would kill all running containers — because terminating the parent sends signals down the tree. By design, `runc` creates the namespaces and cgroups, execs PID 1, and immediately exits. A separate `containerd-shim-runc-v2` process (reparented to init, PID 1 on the host) supervises the container after that."
      }
    },
    {
      "@type": "Question",
      "name": "What is the actual role of `containerd-shim-runc-v2` in the runtime chain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "One shim process per container becomes the real parent after `runc` exits, holds the container's I/O streams (stdout/stderr), and reports the exit code back to containerd. This is why `dockerd` can restart without containers dying — the shim persists independently and reattaches to containerd when it comes back."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `docker stop` send `SIGTERM` to PID 1, and why does exec-form `CMD` matter for signal handling?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`docker stop` sends `SIGTERM` to the container's PID 1. In exec-form `CMD [\"/usr/local/bin/backend\"]`, PID 1 *is* the application binary — it receives the signal directly. In shell-form `CMD /usr/local/bin/backend`, PID 1 becomes `/bin/sh`, which may or may not forward `SIGTERM` to the child. In a `FROM scratch` image with no shell, shell-form `CMD` fails entirely."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if PID 1 in a container is a process that spawns children but never calls `wait()`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The container leaks defunct (zombie) processes. Linux only reaps zombies through their parent process, and a naive PID 1 that doesn't call `wait()` correctly never cleans them up. A statically-linked Go binary in a `FROM scratch` image avoids this entirely — no forking means nothing to reap."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between `dockerd`'s responsibilities and `containerd`'s in modern Docker Engine?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`dockerd` handles the Docker-specific layer: image build, the Docker API, networking setup, and volume management. `containerd` owns the content store, the snapshotter, and container lifecycle via the CRI (Container Runtime Interface). `dockerd` talks to containerd over gRPC — it's one more client of containerd, not a monolithic daemon that does everything."
      }
    },
    {
      "@type": "Question",
      "name": "What does `FROM scratch` actually mean, and what does it tell you about what the container runtime requires?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`FROM scratch` means zero base OS — no shell, no libc, no `/bin`, nothing. It proves that `runc` only needs an executable to exec as PID 1 inside the namespaces it creates. Everything people associate with \"a Linux system\" is optional from the runtime's perspective; Docker images conventionally include it, but the runtime doesn't demand it."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to data written to a container's filesystem when the container is removed?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's deleted. `docker rm` removes the container's thin writable layer — that's by design. Named volumes survive `docker rm` because their storage lives under Docker's managed directory (`/var/lib/docker/volumes/` on Linux), not in the container's writable layer. Only `docker rm -v` or `docker volume rm` deletes the volume."
      }
    },
    {
      "@type": "Question",
      "name": "How does a named volume differ from a bind mount in terms of host-path management?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A named volume is referenced by name — Docker picks and manages the host path under `/var/lib/docker/volumes/`. You don't need to know or care where that is. A bind mount maps an explicit host path (e.g., `./nginx.conf`) into the container; its correctness depends on the host's directory layout existing exactly where you specified."
      }
    },
    {
      "@type": "Question",
      "name": "What mistake does Compose make if you reference a volume name without declaring it under the top-level `volumes:` key?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compose creates an anonymous volume — a volume with a random hash name instead of the name you intended. It still technically persists data, but there's no memorable name to attach a new container to later. The data effectively becomes orphaned."
      }
    },
    {
      "@type": "Question",
      "name": "When would you use `read_only: true` on a bind mount?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When the container only needs to read the file and there's no legitimate reason for it to write back to the host path. The nginx config in the awesome-compose stack uses `read_only: true` on its `./proxy/nginx.conf` mount — defense-in-depth at the mount level, not just by convention."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the Sentry stack mark its named volumes with `external: true`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It tells Compose that these volumes were created externally (by the install script) and must already exist. If they don't, Compose refuses to start rather than silently creating fresh empty volumes — which would silently wipe what looks like persistent data, the worst kind of silent failure for a database."
      }
    },
    {
      "@type": "Question",
      "name": "Can a named volume and a bind mount be used on the same service? What would that look like?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — it's the standard pattern. A database service typically uses a named volume for `/var/lib/postgresql/data` (Docker-managed persistence) and a bind mount for a custom config file like `./pg_hba.conf` mounted into the container. The volume handles data lifecycle; the bind mount injects configuration the developer owns."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't containers on the default `bridge` network resolve each other by name?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The default `bridge` network (created automatically by Docker, not user-defined) does not run Docker's embedded DNS server. Only user-defined bridge networks have the DNS server at `127.0.0.11` that resolves container names to their current IPs. Containers on the default bridge can only communicate via IP address, which goes stale on restart."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to name resolution when a container restarts with a new IP on a user-defined network?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Docker's embedded DNS re-resolves the container's name to its current IP on every lookup. The restarted container gets a fresh IP from the network's pool, and the next DNS query from any peer returns that new IP. Nothing needs manual updating — the DNS record is always live."
      }
    },
    {
      "@type": "Question",
      "name": "How does Traefik discover which containers to route traffic to?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It mounts the Docker socket (`/var/run/docker.sock`) as a read-only bind mount and watches container start/stop events via the Docker API. Containers with labels like `traefik.enable=true` and `traefik.http.routers.whoami.rule=Host(...) are automatically picked up — no config file restart required."
      }
    },
    {
      "@type": "Question",
      "name": "What's the risk of not setting `--providers.docker.exposedbydefault=false` on Traefik?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every container with an exposed port becomes routable through Traefik automatically. With the flag set to `false`, only containers that explicitly opt in with `traefik.enable=true` label get routed — a real security-relevant default that prevents unintended exposure of services not meant to be public."
      }
    },
    {
      "@type": "Question",
      "name": "How do overlay networks extend the same name-based discovery model across multiple Docker hosts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Overlay networks encapsulate container traffic between Docker daemons on different hosts using VXLAN tunneling. Containers on different physical machines can still resolve and reach each other by service name through the same DNS mechanism — the application doesn't change how it looks anything up, just the network driver underneath is different."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't the Traefik compose file declare an explicit `networks:` block despite having multiple services?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compose creates one project-scoped user-defined network automatically and attaches every service to it. Since Traefik and its backends are in the same compose file, they share this implicit network and can reach each other by service name. An explicit `networks:` block is only needed when services span multiple compose files or require custom network isolation."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between `condition: service_started` and `condition: service_healthy` in `depends_on`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`service_started` waits only for the dependency's process to launch — it doesn't confirm the service is actually accepting connections. `service_healthy` waits for the dependency's healthcheck to pass first. The gap between \"process started\" and \"healthcheck passing\" is exactly where \"works on my machine, crash-loops in CI\" bugs come from."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Sentry's compose file mix `*depends_on-healthy` and `*depends_on-default` on the same service?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Different dependencies have different readiness requirements. Redis, Kafka, and pgbouncer must be genuinely *healthy* (accepting connections) before the Sentry web process starts — a broken connection to any of those crashes startup. Memcached, SMTP, and others only need to have *started* — a deliberate, per-dependency distinction, not a blanket setting."
      }
    },
    {
      "@type": "Question",
      "name": "How do YAML anchors and `x-` top-level keys make a 70-service compose file maintainable?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Keys prefixed `x-` are ignored by Compose as services but valid YAML, so they serve as anchor definition blocks. A shared restart policy or healthcheck timing is defined once as an anchor (e.g., `&restart_policy`) and merged into every service with `<<: *restart_policy` — avoiding dozens of identical repeated blocks. Without this, a 70-service file would be unmaintainable."
      }
    },
    {
      "@type": "Question",
      "name": "What does environment variable interpolation like `$HEALTHCHECK_INTERVAL` in a compose file actually do?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compose substitutes these from the shell environment or a `.env` file *before* the YAML is even parsed as a service definition. This lets operators tune healthcheck aggressiveness globally without editing the compose file itself — the file stays stable while environment-specific tuning lives outside it."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the legacy `docker-compose` (hyphenated, V1) different from `docker compose` (V2)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "V1 was a standalone Python binary. V2 is a Go CLI plugin built into Docker Engine with different performance characteristics — faster startup, better parallelism, and it understands current Compose Specification features like `restart: true` on `depends_on` entries. Tutorials still teaching `docker-compose up` are describing the legacy tool."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you don't declare a `networks:` block in a multi-service compose file?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Compose creates one project-scoped user-defined bridge network automatically and attaches every service to it. All services can reach each other by service name through the embedded DNS. This is invisible but doing significant work — even Sentry's 70-service file has no `networks:` block at all, relying entirely on this implicit default."
      }
    },
    {
      "@type": "Question",
      "name": "Why is a healthcheck probe's test command limited to telling you about the container's internal state, not external reachability?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The healthcheck command runs inside the container's own PID, network, and mount namespace. `curl http://localhost` tells you whether the app answers on its own loopback — not whether a host-level port mapping or reverse proxy can reach it. This isolates \"is the app itself broken\" from \"is the network in front of it broken.\""
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a container is marked `unhealthy` — does Docker restart it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. Health state is primarily an input signal — it feeds into `depends_on: condition: service_healthy` in other services, into orchestrator probes, and into tooling watching `docker inspect`. An unhealthy container is *not* automatically restarted by Docker itself. Only an actual process exit triggers the restart policy."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between `restart: always` and `restart: unless-stopped`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Both restart on process exit. The difference: `always` restarts the container even after an explicit `docker stop` when the Docker daemon reboots. `unless-stopped` respects `docker stop` — if you manually stopped it, it stays stopped until you explicitly `docker start` it again. Using `always` for something you intend to manually stop for maintenance is a common confusing mistake."
      }
    },
    {
      "@type": "Question",
      "name": "What does `start_period` do in a healthcheck, and why is omitting it dangerous?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`start_period` defines a grace window at startup where failed probes don't count toward the `retries` threshold. Without it, a slow-starting app (e.g., a Java service taking 30 seconds to bind) racks up failures immediately and can be marked unhealthy before it ever had a chance to come up — causing dependents to block or the container to be stuck in an unhealthy state permanently."
      }
    },
    {
      "@type": "Question",
      "name": "How does `restart: true` inside a `depends_on` entry differ from the top-level `restart:` policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The top-level `restart:` controls what happens when *this* service's own process exits. `restart: true` inside `depends_on` means \"if the dependency itself gets restarted, restart *this* service too\" — propagating a dependency's restart forward. Nginx uses this to restart itself when its upstream `web` service restarts, without needing a separate mechanism."
      }
    },
    {
      "@type": "Question",
      "name": "Why does each service in Sentry's stack have a protocol-specific healthcheck test instead of a generic template?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "\"Healthy\" means something different for each service: Redis uses `redis-cli ping | grep PONG`, Kafka uses `nc -z localhost 9092` (just \"is the broker port accepting TCP\"), memcached speaks its own text protocol (`echo stats | nc`), and nginx does a real `curl` HTTP request. Each is the cheapest check that's still a meaningful proxy for \"this specific service is usable.\""
      }
    },
    {
      "@type": "Question",
      "name": "What does the `x-file-healthcheck` anchor in Sentry's compose file do, and why is it written as inline Python?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It checks whether a consumer process updated a heartbeat file (`/tmp/health.txt`) recently — a liveness signal that's \"did this worker actually do work recently,\" not \"can I reach a port.\" It's inline Python (not a mounted script) so the same anchor works across four different image bases without wiring a script into every one of them."
      }
    },
    {
      "@type": "Question",
      "name": "Why can one runaway container take down every other container on the host if no resource limits are set?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Without a memory limit, a leaking container's usage climbs until the host kernel runs out of RAM. The host-wide OOM killer fires and scores *every* process on the machine — it doesn't know about container boundaries and can kill your database's process instead of the leaking service. Per-container cgroup limits scope the OOM killer to the offending container's process tree."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when a container exceeds its CPU limit versus its memory limit?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Exceeding a memory limit kills a process (SIGKILL) — memory can't be throttled, a process either fits or it doesn't. Exceeding a CPU limit throttles the process — it gets scheduled less often and requests get slower, but nothing terminates. This is a fundamental design asymmetry: OOM is catastrophic, CPU contention is just latency."
      }
    },
    {
      "@type": "Question",
      "name": "What's the trap with `deploy.resources` in a Compose file for resource limits?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`deploy.resources` is a Swarm-only field — `docker stack deploy` reads it, but plain `docker compose up` silently ignores it entirely. The top-level `mem_limit` and `cpus` keys (not nested under `deploy:`) are what plain Compose actually enforces. A Compose file with limits only under `deploy:` has no resource limits outside Swarm mode, and nothing warns you."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Elasticsearch use `ulimits.memlock: {soft: -1, hard: -1}` in addition to `mem_limit`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`ulimits` are POSIX per-process resource limits (`setrlimit`), a mechanism that predates cgroups entirely. Elasticsearch unlocks unlimited memory-locking so its JVM can `mlock` its heap into physical RAM, preventing the kernel from swapping it out. Swapped JVM heap pages cause garbage-collection pauses severe enough to make the service unusable — `mem_limit` limits total memory, `memlock` prevents swapping."
      }
    },
    {
      "@type": "Question",
      "name": "Why do some teams set memory limits on every service but never set CPU limits?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An out-of-memory event is catastrophic — a killed process, possibly mid-write for a database. CPU contention just makes requests slower, a self-limiting problem. Teams with limited tuning budget often spend it all on memory ceilings (where the failure mode is severe) and leave CPU scheduling to the kernel's default fair-share behavior (where the failure mode is latency)."
      }
    },
    {
      "@type": "Question",
      "name": "What underlying kernel mechanism do Docker's `mem_limit` and `cpus` settings map to?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Linux cgroups (control groups). `mem_limit: 6g` becomes the cgroup's `memory.max` file (cgroup v2), and `cpus: \"1.5\"` becomes `cpu.max`'s quota/period pair. Docker's settings are a thin interface — `runc` writes into the cgroup when creating the container's process tree, and the kernel enforces the limits from there."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the second `docker push` of a rebuilt image dramatically faster than the first?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Before uploading each blob, the client sends a `HEAD` request asking the registry \"do you already have this digest?\" Any layer the registry already has (from any image, any repo) is skipped entirely. The push only transfers genuinely new blobs — and if only one layer changed, that's the only one transferred."
      }
    },
    {
      "@type": "Question",
      "name": "What's the relationship between a tag, a manifest, and a blob in a registry?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A blob is a content-addressed chunk (keyed by SHA-256 digest). A manifest is a small JSON document listing the digests of one image's config and layers. A tag is a mutable pointer to one manifest's digest. The digest is the only thing that identifies content; tags can be reassigned at will, which is why pinning to `image@sha256:...` is the only way to guarantee identical bytes."
      }
    },
    {
      "@type": "Question",
      "name": "How does a single tag like `myapp:1.0` serve different binaries on `linux/amd64` vs `linux/arm64`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The tag points to an image index (manifest list), which contains multiple platform-specific manifests. The puller sends its own platform in the `Accept` header, the registry returns the image index, the client selects the manifest matching its architecture, and then pulls that manifest's specific layers. Shared base layers have identical digests and are stored once."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `:latest` have no special meaning in the registry protocol?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`:latest` is just a tag name — the registry stores no \"most recent build\" guarantee. It's the Docker CLI's default when no tag is specified, not a server-side \"always points to newest\" behavior. A tag called `:latest` can point to an old, broken image just as easily as a new one. Only the digest actually identifies content."
      }
    },
    {
      "@type": "Question",
      "name": "What does `storage.cache.blobdescriptor: inmemory` in the distribution registry config actually cache?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Metadata about blobs (digest, size, media type), not the blobs themselves. Actual blob bytes live on disk under `storage.filesystem.rootdirectory` (or S3/GCS in production). This split means a registry restart doesn't lose data but does briefly slow down existence checks until the metadata cache warms."
      }
    },
    {
      "@type": "Question",
      "name": "What's the growing problem with `FROM` lines that default to Docker Hub for base images?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Docker Hub's anonymous and free-tier pull rate limits can cause `FROM python:3.12-slim` to start failing in CI under load. Production pipelines increasingly authenticate their pulls or mirror base images through a private pull-through cache registry — something older Docker tutorials don't address at all."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `docker build --no-cache` still skip redownloading packages when using BuildKit cache mounts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A BuildKit cache mount tracks its contents by mount ID, not by layer digest. Its contents are never baked into any image layer, so they survive even `--no-cache` which discards the entire layer graph. The instruction re-runs, but the cache mount is still populated — so `go mod download` effectively no-ops against existing cached modules."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Grafana use two separate cache mounts (`/go/pkg/mod` and `/root/.cache/go-build`) on the same `RUN` instruction instead of one?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They're populated by different tools at different times and invalidate on different triggers. Module downloads change only when `go.mod`/`go.sum` change, but the Go build cache changes on every source edit. Mounting them separately means a source-only change still gets full module-download reuse without needing the build cache to also stay valid."
      }
    },
    {
      "@type": "Question",
      "name": "How do layer caching and BuildKit cache mounts solve complementary problems?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Layer caching gives a fast local rebuild — if the instruction and its inputs are identical, the entire instruction is skipped. Cache mounts give a fast *first* build on a fresh machine (like CI runners) where no prior layer cache exists — the instruction re-runs but reuses a persistent directory of previously downloaded packages. The two are stacked, not redundant."
      }
    },
    {
      "@type": "Question",
      "name": "What does `COPY --parents **/go.mod **/go.sum ./` do, and why is it needed in Grafana's build?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's a `1.7-labs`-gated feature that copies files while preserving their relative directory structure. Grafana's build is a multi-module Go workspace (`go.work`) with `go.mod` files scattered across subdirectories. Without `--parents`, each would need its own `COPY` line — this replaces dozens of them."
      }
    },
    {
      "@type": "Question",
      "name": "Why are cache mount contents \"invisible to the final image\"?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "BuildKit cache mount directories are mounted only during the `RUN` instruction's execution. Nothing written to them becomes part of any image layer — the layer records only the instruction's actual filesystem changes, not what was written to the cache mount path. This means you can cache gigabytes of package downloads without bloating the shipped image."
      }
    },
    {
      "@type": "Question",
      "name": "Is `DOCKER_BUILDKIT=1` still necessary to use cache mounts and BuildKit features?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No. BuildKit has been the default builder in Docker Engine and Docker Desktop for years — `DOCKER_BUILDKIT=1` is a no-op on current versions. Cache mounts and other BuildKit features work out of the box. The `# syntax=docker/dockerfile:1.7` directive pins the frontend syntax version, which is a different concern from whether BuildKit itself is enabled."
      }
    },
    {
      "@type": "Question",
      "name": "Why doesn't `USER 1000` in a Dockerfile alone make a container secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Container hardening is four independent kernel-enforced layers: UID/GID, Linux capabilities, seccomp syscall filtering, and AppArmor/SELinux. Setting `USER 1000` only closes the UID door. Docker's default capability set still grants ~14 capabilities (including `CAP_NET_RAW` for raw sockets) that work regardless of which UID is running. A non-root process with the default capability set is not the same as a non-root process with *no* capabilities."
      }
    },
    {
      "@type": "Question",
      "name": "What does Docker's default seccomp profile actually block?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It uses `SCMP_ACT_ERRNO` (deny by default, then an explicit allow-list). Dangerous syscalls like `mount`, `reboot`, `unshare`, and `keyctl` are never in the allow-list — a process would need `--security-opt seccomp=unconfined` to call them, which is the kind of flag that shows up in an incident review after a container breakout."
      }
    },
    {
      "@type": "Question",
      "name": "What's the difference between rootless Docker and running a container as non-root?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Rootless Docker means `dockerd` itself runs as an unprivileged host user, using Linux user namespaces to remap UID 0 inside the container to an unprivileged UID on the host. Even a full container-to-host escape lands on a non-root host account. Running as non-root (`USER 1000` in the Dockerfile) only affects what UID the process runs as *inside* the container — it's a completely unrelated setting."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Grafana's distroless Dockerfile use `printf` to write `/etc/passwd` instead of `useradd`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Distroless images have no shell, no package manager, no `useradd` binary — that's the entire point. The Dockerfile hand-writes `/etc/passwd` and `/etc/group` as raw text. This is what \"distroless\" actually costs operationally: even basic user provisioning must be hand-rolled because the image has none of the tooling present."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Grafana set GID to 0 (root's group) and `chmod 777` on data directories?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "OpenShift assigns containers an arbitrary, unpredictable UID at deploy time but keeps them in group 0. Files need to be group-writable by GID 0 to work under both \"run as the Dockerfile's UID\" and \"run as whatever OpenShift assigns.\" `chmod 777` is necessary because you can't `chown` in advance for a UID you don't know yet."
      }
    },
    {
      "@type": "Question",
      "name": "Which security layer runs first in the kernel when a process attempts an action — seccomp or capabilities?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Seccomp runs first, at the syscall boundary itself. It filters whether the syscall is even callable before capability checks run. A blocked syscall (like `mount`) is denied by seccomp regardless of what capabilities the process has in its effective set. Then capabilities are checked, then UID/GID file permissions, then AppArmor/SELinux mandatory access control."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `docker buildx build --platform linux/amd64,linux/arm64` take 10x longer than a single-platform build on an x86_64 runner?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The arm64 build doesn't run on real ARM hardware — it runs under QEMU user-mode emulation, translating every ARM64 instruction in software on x86_64. For a `RUN go build` step compiling real source, emulated execution can be 5-20x slower than native. Teams blame Docker or buildx when the actual culprit is QEMU doing exactly what it's designed to do."
      }
    },
    {
      "@type": "Question",
      "name": "How does Traefik avoid QEMU emulation entirely in its multi-arch build?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Traefik cross-compiles Go binaries natively *before* `docker buildx build` runs, using `GOOS`/`GOARCH` environment variables (Go's built-in cross-compilation support). The Dockerfile never runs a compiler — it just `COPY`s the right pre-built binary based on `$TARGETPLATFORM`. By the time buildx runs, both platform binaries exist on disk; buildx's job is packaging and manifest-list assembly only."
      }
    },
    {
      "@type": "Question",
      "name": "How does the Dockerfile know which pre-built binary to copy for each platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Buildx automatically injects `TARGETPLATFORM` (e.g., `linux/amd64` or `linux/arm64`) as a build arg for each platform in the matrix. The Dockerfile uses `COPY ./dist/$TARGETPLATFORM/traefik /` — variable substitution maps directly to the directory structure the Makefile already produced. No conditional logic needed."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't the default `docker` builder driver produce multi-platform output?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The default `docker` driver is tied directly to the local daemon's single-platform image store. Producing a multi-platform manifest list requires a builder instance using the `docker-container` driver (or a remote builder) — it can write to a registry with `--push` and assemble the manifest list, which the default driver cannot do."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Traefik's GitHub Actions workflow install QEMU even though its Dockerfile never needs it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's a defensive default in the `docker/setup-buildx-action` setup pattern. Seeing `setup-qemu-action` in a workflow doesn't mean QEMU is doing meaningful work — you have to check whether anything in the Dockerfile actually executes platform-specific code. Traefik's Dockerfile only does `COPY` and `apk add`, neither of which needs emulation."
      }
    },
    {
      "@type": "Question",
      "name": "Is the cross-compile-then-COPY pattern universal, or only for specific languages?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's only available when your language's compiler supports targeting a different architecture natively. Go does this with `GOOS`/`GOARCH`. Many C/C++ builds with native toolchain dependencies don't have this option and genuinely need QEMU emulation. The pattern is a powerful optimization for Go projects, not a universal solution."
      }
    }
  ]
}
</script>

<script>
(function () {
  var search = document.getElementById('qa-search');
  var buttons = document.getElementById('qa-diff-buttons');
  if (!search || !buttons) return;
  var activeDiff = 'all';
  function normalize(s){ return (s||'').toLowerCase(); }
  function apply() {
    var q = normalize(search.value).trim();
    var items = document.querySelectorAll('.qa-item');
    var shown = 0;
    items.forEach(function (item) {
      var txt = normalize(item.textContent);
      var diff = item.getAttribute('data-diff') || 'Intermediate';
      var okText = q === '' || txt.indexOf(q) !== -1;
      var okDiff = activeDiff === 'all' || diff === activeDiff;
      var visible = okText && okDiff;
      item.style.display = visible ? '' : 'none';
      if (visible) shown++;
    });
    var count = document.getElementById('qa-shown');
    if (count) count.textContent = shown;
  }
  search.addEventListener('input', apply);
  buttons.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    activeDiff = btn.getAttribute('data-diff');
    buttons.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    apply();
  });

  /* Accordion: click or keypress on question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
    h3.setAttribute('aria-expanded', h3.parentElement.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    e.preventDefault();
    h3.click();
  });

  /* Expand all / collapse all */
  var expandBtn = document.getElementById('qa-expand-all');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var items = document.querySelectorAll('.qa-item');
      var allOpen = Array.prototype.every.call(items, function(i){ return i.classList.contains('open'); });
      items.forEach(function (item) {
        var q = item.querySelector('.qa-q');
        if (allOpen) {
          item.classList.remove('open');
          if (q) q.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          if (q) q.setAttribute('aria-expanded', 'true');
        }
      });
      expandBtn.textContent = allOpen ? 'Expand all' : 'Collapse all';
    });
  }

  apply();
})();
</script>
