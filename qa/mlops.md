---
layout: page
title: "MLOps Interview Questions: 91 Real-World Q&A from Production Manifests"
description: "91 interview-ready MLOps questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/mlops/
---

Bite-sized, standalone interview questions and answers for MLOps. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">91</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: ML pipeline fundamentals (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What structural problem does a DAG-of-containers pipeline solve that `jupyter nbconvert --execute` on a schedule cannot? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: A notebook's correctness depends on leftover kernel state, ad-hoc `pip install`s, and click-order execution — none of which a scheduler reproduces. A real pipeline compiles cells into a DAG of independently containerized steps where each step gets its own image and dependencies, eliminating shared kernel state entirely.

<p class="qa-link">[Full post →]({{ '/mlops/ml-pipeline-fundamentals-dag-isolation-and-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Kubeflow's per-step caching differ from simply not re-running a notebook cell? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Kubeflow's driver computes a SHA-256 fingerprint over each step's inputs, outputs, container image, and command args. If a prior run produced the same fingerprint, the cached outputs are reused and the container is never launched. A notebook has no fingerprint concept — there's no way to detect that a cell's inputs haven't changed.

<p class="qa-link">[Full post →]({{ '/mlops/ml-pipeline-fundamentals-dag-isolation-and-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you bump a pipeline step's base image but don't change its data inputs? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The image hash is part of the cache key (`opts.Container.Image` goes into the `CacheKey` struct), so the fingerprint changes even though the data is identical. The step re-runs from scratch. This is correct behavior — the new image may produce different outputs.

<p class="qa-link">[Full post →]({{ '/mlops/ml-pipeline-fundamentals-dag-isolation-and-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why are PVC names folded into the cache fingerprint instead of being ignored? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: A mounted volume can carry side effects from a prior run, so a step reusing a differently-named PVC is treated as a genuinely different execution even if every other input matches. Ignoring PVC names would risk serving stale outputs from a volume that has been mutated since the cache was written.

<p class="qa-link">[Full post →]({{ '/mlops/ml-pipeline-fundamentals-dag-isolation-and-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the tradeoff of per-step containerization compared to running everything in a single notebook environment? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Each step gets full dependency isolation — bumping pandas in the training step can't break the data-loading step. The tradeoff is cold-start overhead: every step that isn't cached pays the cost of pulling and starting its own container image, which adds latency compared to reusing a warm kernel.

<p class="qa-link">[Full post →]({{ '/mlops/ml-pipeline-fundamentals-dag-isolation-and-caching/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when defining DAG edges in Kubeflow's Python SDK? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Assuming that the order of function calls in the Python file defines execution order. DAG edges are defined by data dependencies — passing `load_task.outputs['out_data']` into `train_model` as an argument — not by the physical position of calls in the Python file. A developer who places `train_model` above `load_data` in the file but correctly passes the output still gets a valid DAG.

<p class="qa-link">[Full post →]({{ '/mlops/ml-pipeline-fundamentals-dag-isolation-and-caching/' | relative_url }})</p>
  </div>
</div>

## Topic: Feature stores (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is point-in-time correctness, and why can't a naive join achieve it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Point-in-time correctness means a training example only sees feature values that were actually known at the moment the label was recorded. A naive "join the latest feature value" query lets the model see features updated after the label happened — this is data leakage, not a feature. Only a query that filters feature rows by `timestamp <= event_timestamp` enforces this guarantee.

<p class="qa-link">[Full post →]({{ '/mlops/feature-stores-point-in-time-join-vs-latest-lookup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `get_online_features` differ from `get_historical_features` at the query-structure level? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `get_historical_features` performs a point-in-time join with a TTL window (`timestamp >= event_time - ttl AND timestamp <= event_time`), while `get_online_features` takes entity keys with no timestamp at all and returns whatever the latest materialized value is. The online API structurally cannot express a point-in-time query — no timestamp argument exists in the call.

<p class="qa-link">[Full post →]({{ '/mlops/feature-stores-point-in-time-join-vs-latest-lookup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if a feature view's TTL is set too short for a slowly-changing feature? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The point-in-time join finds no feature rows within the narrow TTL window for many training examples, producing `NaN` values instead of the correct (slightly older) feature value. The TTL lower bound is a staleness guard that can be too aggressive if it doesn't match the feature's real update cadence.

<p class="qa-link">[Full post →]({{ '/mlops/feature-stores-point-in-time-join-vs-latest-lookup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the tradeoff of using a feature store's point-in-time join versus computing features inline in the training script? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The feature store enforces leakage guards mechanically (via `_filter_ttl`'s filter condition), but adds infrastructure complexity — a materialization pipeline to keep the online store fresh, and a separate offline store for historical joins. Computing features inline is simpler but leaves point-in-time correctness as a discipline engineers must remember to uphold by hand.

<p class="qa-link">[Full post →]({{ '/mlops/feature-stores-point-in-time-join-vs-latest-lookup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `get_online_features` not need a TTL filter even though features can be stale? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Production serving only ever has one meaningful timestamp — "now." There's no future value to accidentally leak, so a time-window filter is unnecessary. Staleness is a materialization concern (how often the online store is refreshed), not a retrieval concern.

<p class="qa-link">[Full post →]({{ '/mlops/feature-stores-point-in-time-join-vs-latest-lookup/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when building a training dataset that bypasses the feature store? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Querying the raw source table or the online store for "current" feature values and joining them onto historical training examples. This reintroduces exactly the leakage the feature store exists to prevent — the pipeline looks correct (the join succeeds, the model trains) while silently training on information the model could never have at real prediction time.

<p class="qa-link">[Full post →]({{ '/mlops/feature-stores-point-in-time-join-vs-latest-lookup/' | relative_url }})</p>
  </div>
</div>

## Topic: Experiment tracking & reproducibility (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does MLflow capture the git commit for a run without any user logging code? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Every `start_run()` call triggers `resolve_tags()`, which iterates a registry of `RunContextProvider`s. `GitRunContext.in_context()` checks if the code runs inside a git repo; if so, `tags()` reads the current commit hash, branch, and repo URL via `_resolve_git_info()` and attaches them as run tags automatically.

<p class="qa-link">[Full post →]({{ '/mlops/experiment-tracking-git-context-run-lineage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does MLflow's `runs:/<run_id>/<artifact_path>` URI scheme differ from saving a model to an arbitrary path? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The `run_id`-keyed URI is a structural guarantee — the artifact's storage address permanently points back to the run that produced it, along with all its tags (git commit, parameters, metrics). Saving to an arbitrary path creates a model with no structural link back to its producing run; the reproducibility connection depends on someone keeping a separate record in sync.

<p class="qa-link">[Full post →]({{ '/mlops/experiment-tracking-git-context-run-lineage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if training code runs outside a git repository when MLflow tracking is enabled? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `GitRunContext.in_context()` returns `False` because it can't resolve a commit, so the git tags are simply omitted from the run. The mechanism degrades gracefully — no empty or garbage values are logged — but the run loses its code-lineage guarantee entirely, which defeats the purpose of automatic tracking.

<p class="qa-link">[Full post →]({{ '/mlops/experiment-tracking-git-context-run-lineage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the limitation of commit-based lineage for notebook-driven training? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The git commit tag captures the last committed state, not uncommitted edits made interactively. A notebook run with uncommitted changes gets a real commit tag that doesn't reflect the exact code that ran — this is a known limitation of commit-based lineage, not specific to MLflow's implementation.

<p class="qa-link">[Full post →]({{ '/mlops/experiment-tracking-git-context-run-lineage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when logging a trained model that breaks run lineage? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Calling `model.save("some/path")` directly instead of using `mlflow.log_model()`. The manual save creates a model file that has no structural link back to the run — the artifact lives outside the `runs:/<run_id>/` mechanism, so six months later no one can trace which run produced it.

<p class="qa-link">[Full post →]({{ '/mlops/experiment-tracking-git-context-run-lineage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the provider registry pattern in MLflow's context system differ from a hardcoded git-commit capture? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The registry loop calls `in_context()`/`tags()` on every registered provider generically — adding a new context source (Databricks cluster ID, CI pipeline ID) means registering one more `RunContextProvider` without changing `resolve_tags()` at all. A hardcoded approach would require modifying the tagging logic for each new context source, creating tight coupling.

<p class="qa-link">[Full post →]({{ '/mlops/experiment-tracking-git-context-run-lineage/' | relative_url }})</p>
  </div>
</div>

## Topic: Data versioning (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does DVC keep large data files out of git while still tracking them in version control? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: DVC computes a content hash (MD5) of the data file and writes a small `.dvc` file containing the hash, size, and path — this is what git tracks. The actual bytes live in a separate content-addressed cache (`cache/<hash[0:2]>/<hash[2:]>`), completely outside git's object store.

<p class="qa-link">[Full post →]({{ '/mlops/data-versioning-dvc-content-addressed-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does DVC's content-addressed cache differ from Git LFS? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: DVC never lets the actual data enter git at all — git tracks only the tiny `.dvc` pointer file. Git LFS uses smudge/clean filter plumbing to intercept git operations and swap pointers for real files, which still requires per-repo hook configuration and keeps the git-native storage model in the loop. DVC's approach is fully decoupled from git internals.

<p class="qa-link">[Full post →]({{ '/mlops/data-versioning-dvc-content-addressed-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if the local DVC cache is deleted and no remote has been configured? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The `.dvc` files still exist in git (with their hashes), but the hashes point at data that no longer exists anywhere. The data is irrecoverable — `dvc checkout` would produce empty files or errors. This is why `dvc push` to cloud storage is essential; git only tracks the pointer files, not the underlying content.

<p class="qa-link">[Full post →]({{ '/mlops/data-versioning-dvc-content-addressed-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why must files in DVC's content-addressed cache be read-only (mode 0o444)? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Content-addressing's correctness guarantee — "this hash always means this exact content" — depends on cached objects never being mutated after they're written. Making the file read-only enforces that invariant at the filesystem level rather than trusting application code to never overwrite a cached object.

<p class="qa-link">[Full post →]({{ '/mlops/data-versioning-dvc-content-addressed-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the tradeoff of using MD5 as DVC's content hash? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: MD5 is no longer cryptographically secure against deliberate collision attacks, but at realistic dataset-versioning scales the collision probability is negligible. The practical tradeoff is speed vs. security — MD5 is faster to compute than SHA-256, and DVC doesn't need collision resistance against adversarial inputs, only against accidental collisions in normal usage.

<p class="qa-link">[Full post →]({{ '/mlops/data-versioning-dvc-content-addressed-cache/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if a data file is renamed outside of DVC's own commands? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The `.dvc` file's `path` field becomes desynchronized from the data's actual location — the pointer file still names the old path even though the content hash remains valid. This breaks `dvc checkout` and `dvc diff` operations. The correct way to move tracked files is `dvc move`, which updates both the file location and the `.dvc` file together.

<p class="qa-link">[Full post →]({{ '/mlops/data-versioning-dvc-content-addressed-cache/' | relative_url }})</p>
  </div>
</div>

## Topic: Model registry & versioning (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What problem do promotion stages solve that version numbers alone cannot? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Version numbers tell you sequence (v1 before v2) but not status (is v2 live, testing, or retired?). Promotion stages (None → Staging → Production → Archived) create a deterministic lifecycle where exactly one version occupies Production, making "which model is serving customers right now?" answerable without grepping logs or querying a CMDB.

<p class="qa-link">[Full post →]({{ '/mlops/mlflow-model-registry-promotion-stages/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How do model version aliases (MLflow 2.9+) differ from the fixed-stage lifecycle? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Stages are a fixed four-value enum (None, Staging, Production, Archived) that enforce a linear progression. Aliases like `@champion` or `@challenger` are user-defined names with no fixed ordering — they're more flexible for non-linear workflows (A/B testing, shadow deployment) where the same model version might simultaneously serve dual roles.

<p class="qa-link">[Full post →]({{ '/mlops/mlflow-model-registry-promotion-stages/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you promote a version to Production without setting `archive_existing_versions=True`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Multiple versions can accumulate in the Production stage simultaneously, and the "which model is live?" question becomes ambiguous. The serving layer may route traffic to the wrong version, and rollback requires manual archival of the old version. `archive_existing_versions=True` atomically archives all existing versions in the target stage.

<p class="qa-link">[Full post →]({{ '/mlops/mlflow-model-registry-promotion-stages/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is the stage transition atomic (single DB transaction) instead of two separate updates? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: If archival of the old version and promotion of the new version were separate operations, a crash between them would leave two versions in Production or zero versions in Production. The single `session.add_all()` → flush ensures both changes commit or neither does, preventing partial states.

<p class="qa-link">[Full post →]({{ '/mlops/mlflow-model-registry-promotion-stages/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when promoting to None or Archived? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Attempting to set `archive_existing_versions=True` when promoting to None or Archived — the registry raises `MlflowException` because only Staging and Production are "active" stages. This guard prevents nonsensical states where archival logic fires for non-production stages.

<p class="qa-link">[Full post →]({{ '/mlops/mlflow-model-registry-promotion-stages/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you promote a Production version back to Staging? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The version moves to Staging, but the previous Production version is NOT automatically archived — you'd need to explicitly archive it or promote a different version to Production with `archive_existing_versions=True`. This leaves a gap where no version is in Production and traffic has no valid model to route to.

<p class="qa-link">[Full post →]({{ '/mlops/mlflow-model-registry-promotion-stages/' | relative_url }})</p>
  </div>
</div>

## Topic: Model serving architectures (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't a batch scoring pipeline serve a prediction API with sub-100ms latency? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Batch pipelines optimize for throughput (millions of rows, scheduled, fault-tolerant) with minutes-to-hours latency budgets. Online inference needs single-request-in single-response-out with a strict per-request latency budget. The concurrency model, health/readiness requirements, and protocol differences (files vs. REST/gRPC endpoints) make them fundamentally different architectures.

<p class="qa-link">[Full post →]({{ '/mlops/kserve-model-serving-batch-vs-online/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does KServe's transformer/predictor split differ from a monolithic model server? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: KServe's `Model.__call__` can forward `predict()` to a separate predictor container via HTTP/gRPC when `predictor_host` is set. This lets preprocessing run on CPU pods while GPU-heavy inference runs on GPU pods — the transformer handles feature engineering on cheap CPU instances, the predictor runs the model on expensive GPU instances.

<p class="qa-link">[Full post →]({{ '/mlops/kserve-model-serving-batch-vs-online/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you forget to set `self.ready = True` in a KServe model's `load()` method? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The pod starts and passes its basic health checks, but Kubernetes readiness probes call `healthy()` which checks `self.ready`. Since `self.ready` remains `False`, the pod never receives traffic — it sits in the Service's endpoint list but the load balancer routes nothing to it. The model is deployed but effectively invisible.

<p class="qa-link">[Full post →]({{ '/mlops/kserve-model-serving-batch-vs-online/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does KServe forward only three headers (`x-request-id`, `x-b3-traceid`, `authorization`) instead of all headers? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Forwarding arbitrary headers would leak security context (cookies, internal tokens) and create subtle coupling between clients and predictor pods. The allowlist is deliberate: request tracing, distributed tracing propagation, and upstream auth are the only headers that have legitimate reasons to survive the hop from transformer to predictor.

<p class="qa-link">[Full post →]({{ '/mlops/kserve-model-serving-batch-vs-online/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the downside of KServe's per-stage Prometheus histograms for online serving? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Every request gets three histogram observations (`PRE_HIST_TIME`, `PREDICT_HIST_TIME`, `POST_HIST_TIME`) with model-specific labels, creating non-trivial metric cardinality. For a serving layer with many models and versions, the histogram time series can grow large enough to stress Prometheus storage — but this is the cost of per-stage latency breakdown needed for SLO enforcement.

<p class="qa-link">[Full post →]({{ '/mlops/kserve-model-serving-batch-vs-online/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if `preprocess()` is slow in a KServe model? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: It adds directly to total request latency — there's no circuit breaker or timeout at the framework level. If preprocess takes 500ms, the client waits 500ms + predict + postprocess. The latency is tracked by `PRE_HIST_TIME` (a Prometheus histogram), so you can detect it, but the only fix is to optimize it or move it to a separate transformer pod that scales independently.

<p class="qa-link">[Full post →]({{ '/mlops/kserve-model-serving-batch-vs-online/' | relative_url }})</p>
  </div>
</div>

## Topic: Model serving optimization (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Triton's dynamic batching amortize GPU overhead across concurrent requests? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Individual requests are held in a queue and grouped into batches. The GPU kernel launch overhead, memory transfer setup, and model weight loading are fixed costs paid once per batch, not once per request. A batch of 10 images might cost 7ms total instead of 60ms for 10 sequential single-image inferences — a 9x throughput improvement with no model or hardware change.

<p class="qa-link">[Full post →]({{ '/mlops/triton-dynamic-batching-inference-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Triton's `max_queue_delay_microseconds` differ from `preferred_batch_size` as a batching trigger? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `preferred_batch_size` triggers dispatch when the queue reaches that threshold — maximum batching efficiency. `max_queue_delay_microseconds` triggers dispatch when the timer expires regardless of queue depth — preventing starvation when traffic is light. Both can fire; the scheduler uses whichever triggers first.

<p class="qa-link">[Full post →]({{ '/mlops/triton-dynamic-batching-inference-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if only one request arrives within the `max_queue_delay` window? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Triton dispatches a batch of size 1 — there is no minimum batch size. The scheduler simply groups whatever is available when the timer fires. The request still benefits from the server infrastructure but gets no batching benefit.

<p class="qa-link">[Full post →]({{ '/mlops/triton-dynamic-batching-inference-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `preserve_ordering` mandatory for autoregressive LLMs but wasteful for stateless classifiers? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Autoregressive models produce different outputs depending on request order (the generation of one request may depend on tokens from another in streaming mode), so out-of-order responses would be semantically wrong. `preserve_ordering` adds internal synchronization to buffer and reorder responses, which is unnecessary overhead for stateless classifiers where response order doesn't affect correctness.

<p class="qa-link">[Full post →]({{ '/mlops/triton-dynamic-batching-inference-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the latency tax of dynamic batching, and how do you tune it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Every request in the queue waits up to `max_queue_delay_microseconds` before execution. For a 50ms end-to-end SLA, a 5ms queue delay is reasonable; for batch analytics, 50ms might be acceptable to capture larger batches. The tradeoff is linear: more delay = larger batches = higher throughput, but higher tail latency per request.

<p class="qa-link">[Full post →]({{ '/mlops/triton-dynamic-batching-inference-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when setting `preferred_batch_size` for a new model? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Guessing the value instead of profiling with NVIDIA Model Analyzer. Setting it too high causes GPU memory exhaustion (OOM); setting it too low wastes the batching opportunity entirely. The optimal batch size varies by orders of magnitude between a lightweight classifier (batch 64+) and a large language model (batch 2-8).

<p class="qa-link">[Full post →]({{ '/mlops/triton-dynamic-batching-inference-optimization/' | relative_url }})</p>
  </div>
</div>

## Topic: A/B testing & canary deployment for models (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Argo Rollouts' canary traffic shifting differ from a plain Kubernetes rolling update? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: A rolling update replaces Pods by count (25% new, then 50%) with no percentage-based traffic split or pause gate. Argo Rollouts uses a `Rollout` CRD where `setWeight` steps instruct the mesh/ingress to route an exact percentage of live traffic to the canary — the weight is enforced on the data plane, not by Pod count, giving precise traffic control.

<p class="qa-link">[Full post →]({{ '/mlops/argo-rollouts-ml-model-canary-traffic-shifting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is an `AnalysisRun`, and how does it gate model promotion? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: An `AnalysisRun` polls a metrics endpoint (Prometheus, Datadog) against configurable thresholds during a canary step. The rollout pauses until the analysis passes or fails — promotion only proceeds when real inference metrics (p99 latency, accuracy) meet the criteria. This is the A/B gate: the new model receives a known fraction of traffic, metrics are collected from that fraction, and promotion is gated on those metrics.

<p class="qa-link">[Full post →]({{ '/mlops/argo-rollouts-ml-model-canary-traffic-shifting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if the canary model OOMs mid-rollout? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The Pod crashes, `AvailableReplicas` drops to zero, and the controller detects `c.newRS.Status.AvailableReplicas == 0` in `reconcileTrafficRouting()`. It immediately sets traffic weight to zero, removes managed routes, and scales the canary ReplicaSet to 0. All traffic returns to the stable model with no human intervention needed.

<p class="qa-link">[Full post →]({{ '/mlops/argo-rollouts-ml-model-canary-traffic-shifting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the tradeoff of `dynamicStableScale: true` for GPU-heavy model rollouts? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The stable ReplicaSet scales down proportionally as canary weight increases, saving GPU costs during the rollout. The trade-off is that instantaneous rollback becomes slower — the stable ReplicaSet must scale back up before it can absorb full traffic. For ML models with slow cold-start (loading large weights into GPU memory), this delay matters.

<p class="qa-link">[Full post →]({{ '/mlops/argo-rollouts-ml-model-canary-traffic-shifting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `pause.duration` on analysis steps critical for statistical significance? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The analysis needs enough inference samples to detect real metric differences. A model serving 100 req/s with a 5-minute pause gives ~30,000 samples; a model serving 5 req/s may need 60+ minutes for the same confidence. Too short a pause means the analysis passes on insufficient data and a degraded model gets promoted.

<p class="qa-link">[Full post →]({{ '/mlops/argo-rollouts-ml-model-canary-traffic-shifting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if the Istio VirtualService doesn't exist when the Rollout is created? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Argo Rollouts will modify the VirtualService in place during the rollout, so the route must exist beforehand. Without it, `reconcileTrafficRouting()` fails to find the target route and the rollout gets stuck. The VirtualService must not be manually edited while a rollout is in progress either — Argo Rollouts owns it.

<p class="qa-link">[Full post →]({{ '/mlops/argo-rollouts-ml-model-canary-traffic-shifting/' | relative_url }})</p>
  </div>
</div>

## Topic: Data drift & model drift detection (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't you use only PSI or only KS for production drift detection? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: PSI bins distributions and catches overall proportion shifts, but misses local shape changes in narrow quantile ranges. KS finds the point of maximum CDF separation — sensitive to local deviations — but cannot handle categorical data and becomes oversensitive with very large sample sizes. Production monitoring needs both, applied to the right column types.

<p class="qa-link">[Full post →]({{ '/mlops/evidently-data-drift-distribution-shift/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does PSI's bin-based approach differ from KS's CDF-based approach mathematically? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: PSI computes `sum((ref_pct - cur_pct) * ln(ref_pct / cur_pct))` across shared bins — a global divergence measure sensitive to any bin where proportions differ. KS computes `max|F_ref(x) - F_cur(x)|` — the maximum distance between empirical CDFs — finding the single point of greatest separation regardless of bin structure.

<p class="qa-link">[Full post →]({{ '/mlops/evidently-data-drift-distribution-shift/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you try to apply the KS test to a categorical column in Evidently? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Evidently's `ks_stat_test` is registered only for `ColumnType.Numerical`. Applying it to a categorical column raises `StatTestInvalidFeatureTypeError`. The auto-selection logic routes categorical columns to chi-squared, z-test, or Jensen-Shannon instead.

<p class="qa-link">[Full post →]({{ '/mlops/evidently-data-drift-distribution-shift/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does KS become unreliable with very large sample sizes? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: With 100,000+ samples, KS detects statistically significant differences that are practically meaningless — a 1% mean shift with no effect on model accuracy triggers drift detection. This is why Evidently switches from KS to Wasserstein distance when the reference dataset exceeds 1,000 rows — Wasserstein produces magnitude-scale scores more interpretable at large sample sizes.

<p class="qa-link">[Full post →]({{ '/mlops/evidently-data-drift-distribution-shift/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't you directly compare PSI and KS scores? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: They're on different scales. PSI is a dimensionless divergence score (0 = identical, 0.1 = moderate drift) while KS returns a p-value (probability of observing the separation under the null hypothesis, with 0.05 as default significance). A PSI of 0.1 and a KS p-value of 0.05 measure fundamentally different things.

<p class="qa-link">[Full post →]({{ '/mlops/evidently-data-drift-distribution-shift/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when choosing a reference window for drift detection? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Comparing today's batch against the original training set (months or years old) — this will always show drift because distributions naturally change over time. The correct approach is to compare against a recent reference window of similar age, capturing meaningful shifts rather than expected temporal evolution.

<p class="qa-link">[Full post →]({{ '/mlops/evidently-data-drift-distribution-shift/' | relative_url }})</p>
  </div>
</div>

## Topic: Model monitoring & observability (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why do Prometheus's default histogram buckets produce inaccurate p99 percentiles for ML inference latency? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Default buckets (.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10) are tuned for HTTP request durations. A transformer at 15ms p50 and 200ms p99 sees 99% of observations land in the `0.1-0.25` bucket — a 150ms-wide bucket that makes `histogram_quantile(0.99, ...)` return an approximation spanning that entire range, useless for detecting a 20ms regression.

<p class="qa-link">[Full post →]({{ '/mlops/prometheus-ml-monitoring-latency-histograms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How do Prometheus native histograms differ from classic histograms in bucket boundary storage? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Classic histograms encode bucket boundaries in the metric name (`_bucket{le="0.1"}`), creating a new time series per bucket per label combination. Native histograms encode boundaries in the metric value itself via a `Schema` field (0 = base-2 exponential, 8 = 256 sub-buckets per power of two, -53 = custom boundaries) — boundaries are part of the data, not the metric name.

<p class="qa-link">[Full post →]({{ '/mlops/prometheus-ml-monitoring-latency-histograms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you change classic histogram bucket boundaries on an existing metric? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Prometheus identifies metrics by name + label set, and classic bucket boundaries are encoded in the metric name. Switching boundaries creates a new metric — historical data and new data are in separate time series with no continuity. Native histograms avoid this because boundaries are part of the metric value, not the name.

<p class="qa-link">[Full post →]({{ '/mlops/prometheus-ml-monitoring-latency-histograms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't you use summaries instead of histograms for cluster-wide p99 percentiles? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Summaries compute quantiles client-side and expose a single `quantile` label — you cannot aggregate quantiles across instances. With 20 inference pods, summaries give 20 separate p99 values with no way to combine them. Histograms let you aggregate at query time with `sum by (le)`, giving the true cluster-wide percentile.

<p class="qa-link">[Full post →]({{ '/mlops/prometheus-ml-monitoring-latency-histograms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the memory cost of custom histogram buckets? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: One time series per bucket per label combination. 14 custom buckets times 3 label combinations (model, version, endpoint) = 42 time series for one histogram. This is negligible compared to unbounded labels, but native histograms' sparse encoding (`PositiveSpans` + delta-encoded `PositiveBuckets`) stores only non-empty buckets, dramatically reducing memory for sparse distributions.

<p class="qa-link">[Full post →]({{ '/mlops/prometheus-ml-monitoring-latency-histograms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if an inference service produces a 0.0s observation when using custom bucket native histograms? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Custom bucket histograms have no zero bucket — the `Validate()` method enforces `ZeroCount == 0`. A 0.0s observation lands in your first defined bucket, not a special zero bucket. If your first bucket boundary is 0.005 (5ms), a 0.0s observation still counts there. Design your first bucket boundary accordingly.

<p class="qa-link">[Full post →]({{ '/mlops/prometheus-ml-monitoring-latency-histograms/' | relative_url }})</p>
  </div>
</div>

## Topic: Feature engineering pipelines & data validation (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does TFDS avoid re-downloading and re-transforming data on every `tfds.load()` call? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The first call runs `download_and_prepare()`, which writes sharded TFRecord files and a `dataset_info.json` sidecar to a versioned directory on disk. Subsequent calls detect the existing directory, read the proto from `dataset_info.json`, skip `download_and_prepare()` entirely, and construct a `tf.data.TFRecordDataset` from the cached shards.

<p class="qa-link">[Full post →]({{ '/mlops/tfds-feature-engineering-data-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `DatasetInfo` track cache validity, and what invalidates it? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `DatasetInfo` records the feature schema, split boundaries, version string, and checksum as JSON. `read_from_directory()` compares the proto's version against the builder's code version — a mismatch means the cache is stale and must be regenerated. Changing feature normalization without bumping the version leaves the old cache in place.

<p class="qa-link">[Full post →]({{ '/mlops/tfds-feature-engineering-data-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if you change the feature normalization in `_info()` without bumping the version? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `read_from_directory` compares version strings — if they match, the old `features.json` is restored regardless of whether the code now defines different features. The cached TFRecords from the old normalization are loaded, silently training on the wrong feature values. Bump the version to force regeneration.

<p class="qa-link">[Full post →]({{ '/mlops/tfds-feature-engineering-data-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the downside of using TFRecord as the default cache format? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: TFRecord is TensorFlow's native format with optimized I/O and parallel interleaving, but it's not easily readable by non-TF frameworks. Parquet support was added later (v4.9.5) for cross-framework use, but TFRecord remains the default because it integrates most deeply with `tf.data` pipelines — the tradeoff is ecosystem lock-in.

<p class="qa-link">[Full post →]({{ '/mlops/tfds-feature-engineering-data-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if two scripts call `tfds.load()` for the same dataset simultaneously? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: TFDS uses `utils.incomplete_dir` to write to a temporary directory and atomically rename on success. A concurrent caller that starts before the rename sees the directory doesn't exist and begins its own prepare — the second caller's write may overwrite or fail depending on `download_mode`. Production pipelines should prepare once in a dedicated step and share the data directory via a volume.

<p class="qa-link">[Full post →]({{ '/mlops/tfds-feature-engineering-data-validation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when relying on TFDS's auto-short-circuit in CI? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Assuming `tfds.load()` will skip preparation in a fresh container with no cached data. CI environments typically use ephemeral containers, so the data directory is empty every run — you need an explicit `download_and_prepare()` step or a pre-populated volume to avoid re-downloading on every pipeline execution.

<p class="qa-link">[Full post →]({{ '/mlops/tfds-feature-engineering-data-validation/' | relative_url }})</p>
  </div>
</div>

## Topic: Testing ML systems (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Great Expectations treat empty strings (`""`) as different from NULL? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Great Expectations checks for database-native null representations (PostgreSQL `NULL`, pandas `np.NaN`) — empty strings are valid non-null values by this definition. A CRM export might contain `""` in a `plan_type` column that isn't NULL but is invalid for the model. You need a separate `expect_column_values_to_not_be_in_set` with `[""]` to catch empty strings explicitly.

<p class="qa-link">[Full post →]({{ '/mlops/great-expectations-ml-data-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the `mostly` parameter differ from strict null checks? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `mostly=0.97` on `expect_column_values_to_not_be_null` means at least 97% of rows must be non-null for the check to pass — allowing 3% sporadic missingness while catching a jump to 15%. Without `mostly`, the check requires 100% non-null values, which fails on datasets known to have legitimate sparse missingness.

<p class="qa-link">[Full post →]({{ '/mlops/great-expectations-ml-data-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when a new category appears in a categorical feature that's gated by a data contract? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `expect_column_values_to_be_in_set` with a hardcoded `value_set` rejects the new category — the validation fails, the CI pipeline blocks, and the team must explicitly update the data contract in the same PR that adds the category. This is the entire point: schema changes are explicit and reviewed, not accidental.

<p class="qa-link">[Full post →]({{ '/mlops/great-expectations-ml-data-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why should you not use Great Expectations' auto-profiler for production data contracts? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The profiler auto-discovers value sets across batches, which means the contract reflects whatever values currently exist rather than what should be allowed. A new, invalid category would be automatically included. The profiler is useful during initial contract authoring to see what values exist, but production contracts should hardcode the allowed set.

<p class="qa-link">[Full post →]({{ '/mlops/great-expectations-ml-data-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the `ValidationGraph` prevent redundant metric computation across expectations? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Each `MetricEdge` has a unique ID, and the graph's `_edge_ids` set makes `add()` an O(1) duplicate check. Multiple expectations sharing the same metric (e.g., several nullity checks on different columns all need `column_values.nonnull.count`) compute it exactly once, with each expectation's `ExpectationValidationGraph` filtering the global metric info down to only what it needs.

<p class="qa-link">[Full post →]({{ '/mlops/great-expectations-ml-data-contracts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when running Great Expectations in CI? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Running the data contract check *after* model training instead of *before*. The contract should gate the pipeline before a single model weight is loaded — catching schema drift, null proliferation, or new categories before they corrupt the training run. Running it after training means the model was already trained on bad data.

<p class="qa-link">[Full post →]({{ '/mlops/great-expectations-ml-data-contracts/' | relative_url }})</p>
  </div>
</div>

## Topic: Hyperparameter tuning & automated model selection (Order 13)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does TPE find good hyperparameters in fewer trials than grid or random search? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: TPE splits completed trials into "good" (top gamma%) and "bad" (rest), fits a separate Parzen estimator (Gaussian mixture) to each group, then samples points that maximize `l(x)/g(x)` — the density ratio of good to bad. This focuses budget on regions of the space that actually work, unlike grid/random search which treat every region equally regardless of past outcomes.

<p class="qa-link">[Full post →]({{ '/mlops/optuna-tree-parzen-bayesian-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does TPE differ from Gaussian Process-based Bayesian optimization? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: GP-based BO fits a surrogate model to the objective function itself, scaling poorly beyond ~20-30 dimensions and failing on conditional spaces. TPE models the distribution of good vs. bad configurations instead — it scales to hundreds of dimensions, handles tree-structured (conditional) spaces natively, and avoids the expensive GP fitting step.

<p class="qa-link">[Full post →]({{ '/mlops/optuna-tree-parzen-bayesian-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is `constant_liar` and when should you use it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `constant_liar=True` includes `RUNNING` trials in the "above" (bad) group, penalizing configurations near in-flight parallel trials. Without it, multiple workers might suggest parameters near each other because they haven't seen each other's in-progress trials, wasting compute on similar configurations. Use it for parallel optimization with multiple workers.

<p class="qa-link">[Full post →]({{ '/mlops/optuna-tree-parzen-bayesian-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `multivariate=True` critical for hyperparameter optimization? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Without it, TPE treats each parameter independently — missing interactions like "high learning rate pairs well with large batch size." With `multivariate=True`, the Parzen estimator fits a joint density across all parameters simultaneously, capturing correlations that independent modeling misses and producing better candidates.

<p class="qa-link">[Full post →]({{ '/mlops/optuna-tree-parzen-bayesian-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the tradeoff of the gamma function's cap at 25 trials? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The cap prevents the "good" density model from becoming too diffuse — if 200 trials are "good," the model can't distinguish signal from noise. The tradeoff is that with fewer than 25 trials in the good group, the density estimate is based on limited data. The default `min(ceil(0.1 * n), 25)` means at 250+ completed trials, only the top 25 form the good model.

<p class="qa-link">[Full post →]({{ '/mlops/optuna-tree-parzen-bayesian-optimization/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What storage backend should you use for parallel Optuna optimization in production? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: PostgreSQL or MySQL via `RDBStorage` — never SQLite. SQLite has row-level locking that causes contention with multiple workers. Optuna's `RDBStorage` supports heartbeat-based dead worker detection (`heartbeat_interval`) and connection pool management (`pool_pre_ping=True` for MySQL) needed for cluster environments.

<p class="qa-link">[Full post →]({{ '/mlops/optuna-tree-parzen-bayesian-optimization/' | relative_url }})</p>
  </div>
</div>

## Topic: Distributed training (Order 14)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does gradient bucketing overlap AllReduce with the backward pass? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: DDP partitions parameters into 25 MiB buckets. As backward computes gradients, each bucket's ready count increments. The moment the last gradient in a bucket lands, the C++ Reducer fires an async AllReduce on that bucket's buffer while backward continues computing gradients for other buckets. This hides AllReduce latency behind gradient computation.

<p class="qa-link">[Full post →]({{ '/mlops/pytorch-ddp-gradient-bucketing-allreduce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does DDP's communication strategy differ from FSDP's? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: DDP replicates the full model on every rank and uses bucketed AllReduce for gradients — communication happens during backward. FSDP shards parameters across ranks and uses AllGather for forward/backward activation — communication happens during both forward and backward. They're mutually exclusive wrappers; you use one or the other.

<p class="qa-link">[Full post →]({{ '/mlops/pytorch-ddp-gradient-bucketing-allreduce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if one parameter's gradient takes much longer to compute than the rest? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: That parameter becomes the straggler in its bucket. The bucket's AllReduce cannot fire until every gradient in the bucket is ready, so one slow gradient delays communication for all parameters in the same bucket. This is why the first bucket (containing late-computed gradients) gets a smaller size cap (1 MiB vs. 25 MiB) — fewer parameters per bucket means fewer chances for a straggler.

<p class="qa-link">[Full post →]({{ '/mlops/pytorch-ddp-gradient-bucketing-allreduce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the tradeoff of `gradient_as_bucket_view=True`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The gradient tensor becomes a direct view into the communication bucket, eliminating the gradient-to-bucket copy and saving peak memory equal to total gradient size. The trade-off is that `detach_()` cannot be called on gradient tensors in this mode — you must use `zero_grad(set_to_none=True)` instead to avoid stale gradient accumulation.

<p class="qa-link">[Full post →]({{ '/mlops/pytorch-ddp-gradient-bucketing-allreduce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why are bucket indices reversed at Reducer creation? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Backward computes gradients in reverse order of the forward pass. If buckets were assigned in forward order, the first parameters processed by backward would fill buckets numbered last — the Reducer would have no bucket ready to AllReduce until deep into backward. Reversing the assignment aligns bucket fill order with backward execution order so the first gradient computed fills the first bucket the Reducer processes.

<p class="qa-link">[Full post →]({{ '/mlops/pytorch-ddp-gradient-bucketing-allreduce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when using `find_unused_parameters=True`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: Enabling it unconditionally when the model doesn't actually have unused parameters in some forward passes. It adds overhead for graph traversal on every backward pass — DDP must detect which parameters were unused and skip AllReduce for them. Only enable it when the model genuinely has conditional computation paths that leave some parameters unused in certain forward passes.

<p class="qa-link">[Full post →]({{ '/mlops/pytorch-ddp-gradient-bucketing-allreduce/' | relative_url }})</p>
  </div>
</div>

## Topic: ML pipeline orchestration (Order 15)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why must Airflow's retry state live in the metadata database instead of in the worker's memory? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: When a worker process crashes or is killed, every in-memory variable vanishes — including `try_number`, the next backoff delay, and the failure reason. The scheduler runs in a completely separate process and must independently know that a task failed, which attempt it was, and when to re-queue it. The only state that survives a process crash is a row in the metadata database.

<p class="qa-link">[Full post →]({{ '/mlops/airflow-dag-executor-taskinstance-retries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Airflow's heartbeat-based liveness detection work? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The worker updates `last_heartbeat_at` periodically in the `task_instance` row. The scheduler checks if this timestamp is stale relative to `now()`. If the worker crashes mid-task, the timestamp freezes, and the scheduler eventually declares the TI orphaned and re-queues it — entirely DB-driven, no in-memory signal needed.

<p class="qa-link">[Full post →]({{ '/mlops/airflow-dag-executor-taskinstance-retries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if a worker crashes between getting a task from the queue and writing `state = RUNNING` to the DB? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: The TI stays in `QUEUED` state because the DB row was never updated. The scheduler's next heartbeat loop either re-dispatches it (if the executor reports the task was never started) or detects the orphaned PID via `last_heartbeat_at` staleness. A TI is only considered "running" when the DB row says so.

<p class="qa-link">[Full post →]({{ '/mlops/airflow-dag-executor-taskinstance-retries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `max_tries` cumulative rather than per-clear? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `max_tries` is incremented when a task is cleared (re-run from the UI or API), never reset. This prevents infinite retry loops from repeated manual re-runs — each clear consumes part of the retry budget. The DB row is the only place that knows the true retry budget after multiple clears, something the worker process never tracks.

<p class="qa-link">[Full post →]({{ '/mlops/airflow-dag-executor-taskinstance-retries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `prepare_db_for_next_try()` assign a new UUID on every retry? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `TaskInstanceHistory.record_ti()` snapshots the current attempt's timing data before overwriting the row for the next attempt. A new UUID gives the next attempt a fresh primary key, keeping each attempt's history immutable and independently trackable. The composite unique key (`dag_id`, `task_id`, `run_id`, `map_index`) stays the same, but `id` changes.

<p class="qa-link">[Full post →]({{ '/mlops/airflow-dag-executor-taskinstance-retries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What prevents thundering-herd retries in Airflow when multiple tasks fail simultaneously? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `next_retry_datetime()` uses a SHA1 hash of `(dag_id, task_id, logical_date, try_number)` to compute deterministic jitter within the `[min_backoff, 2*min_backoff)` window. The same failed attempt always gets the same delay, but different tasks get different jitter offsets, spreading retries across time instead of all firing at once.

<p class="qa-link">[Full post →]({{ '/mlops/airflow-dag-executor-taskinstance-retries/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does the worker ignore SIGINT but handle SIGTERM? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A: `signal.signal(signal.SIGINT, signal.SIG_IGN)` means the worker ignores Ctrl-C, which the scheduler sends to shut down gracefully. Only SIGTERM (from `proc.terminate()`) or SIGKILL will kill a worker. This prevents a keyboard interrupt during a task from silently aborting cleanup code without the executor knowing — the task completes its current operation before shutting down.

<p class="qa-link">[Full post →]({{ '/mlops/airflow-dag-executor-taskinstance-retries/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 91 across MLOps

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What structural problem does a DAG-of-containers pipeline solve that `jupyter nbconvert --execute` on a schedule cannot?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: A notebook's correctness depends on leftover kernel state, ad-hoc `pip install`s, and click-order execution — none of which a scheduler reproduces. A real pipeline compiles cells into a DAG of independently containerized steps where each step gets its own image and dependencies, eliminating shared kernel state entirely."
      }
    },
    {
      "@type": "Question",
      "name": "How does Kubeflow's per-step caching differ from simply not re-running a notebook cell?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Kubeflow's driver computes a SHA-256 fingerprint over each step's inputs, outputs, container image, and command args. If a prior run produced the same fingerprint, the cached outputs are reused and the container is never launched. A notebook has no fingerprint concept — there's no way to detect that a cell's inputs haven't changed."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you bump a pipeline step's base image but don't change its data inputs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The image hash is part of the cache key (`opts.Container.Image` goes into the `CacheKey` struct), so the fingerprint changes even though the data is identical. The step re-runs from scratch. This is correct behavior — the new image may produce different outputs."
      }
    },
    {
      "@type": "Question",
      "name": "Why are PVC names folded into the cache fingerprint instead of being ignored?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: A mounted volume can carry side effects from a prior run, so a step reusing a differently-named PVC is treated as a genuinely different execution even if every other input matches. Ignoring PVC names would risk serving stale outputs from a volume that has been mutated since the cache was written."
      }
    },
    {
      "@type": "Question",
      "name": "What is the tradeoff of per-step containerization compared to running everything in a single notebook environment?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Each step gets full dependency isolation — bumping pandas in the training step can't break the data-loading step. The tradeoff is cold-start overhead: every step that isn't cached pays the cost of pulling and starting its own container image, which adds latency compared to reusing a warm kernel."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when defining DAG edges in Kubeflow's Python SDK?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Assuming that the order of function calls in the Python file defines execution order. DAG edges are defined by data dependencies — passing `load_task.outputs['out_data']` into `train_model` as an argument — not by the physical position of calls in the Python file. A developer who places `train_model` above `load_data` in the file but correctly passes the output still gets a valid DAG."
      }
    },
    {
      "@type": "Question",
      "name": "What is point-in-time correctness, and why can't a naive join achieve it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Point-in-time correctness means a training example only sees feature values that were actually known at the moment the label was recorded. A naive \"join the latest feature value\" query lets the model see features updated after the label happened — this is data leakage, not a feature. Only a query that filters feature rows by `timestamp <= event_timestamp` enforces this guarantee."
      }
    },
    {
      "@type": "Question",
      "name": "How does `get_online_features` differ from `get_historical_features` at the query-structure level?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `get_historical_features` performs a point-in-time join with a TTL window (`timestamp >= event_time - ttl AND timestamp <= event_time`), while `get_online_features` takes entity keys with no timestamp at all and returns whatever the latest materialized value is. The online API structurally cannot express a point-in-time query — no timestamp argument exists in the call."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a feature view's TTL is set too short for a slowly-changing feature?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The point-in-time join finds no feature rows within the narrow TTL window for many training examples, producing `NaN` values instead of the correct (slightly older) feature value. The TTL lower bound is a staleness guard that can be too aggressive if it doesn't match the feature's real update cadence."
      }
    },
    {
      "@type": "Question",
      "name": "What is the tradeoff of using a feature store's point-in-time join versus computing features inline in the training script?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The feature store enforces leakage guards mechanically (via `_filter_ttl`'s filter condition), but adds infrastructure complexity — a materialization pipeline to keep the online store fresh, and a separate offline store for historical joins. Computing features inline is simpler but leaves point-in-time correctness as a discipline engineers must remember to uphold by hand."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `get_online_features` not need a TTL filter even though features can be stale?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Production serving only ever has one meaningful timestamp — \"now.\" There's no future value to accidentally leak, so a time-window filter is unnecessary. Staleness is a materialization concern (how often the online store is refreshed), not a retrieval concern."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when building a training dataset that bypasses the feature store?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Querying the raw source table or the online store for \"current\" feature values and joining them onto historical training examples. This reintroduces exactly the leakage the feature store exists to prevent — the pipeline looks correct (the join succeeds, the model trains) while silently training on information the model could never have at real prediction time."
      }
    },
    {
      "@type": "Question",
      "name": "How does MLflow capture the git commit for a run without any user logging code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Every `start_run()` call triggers `resolve_tags()`, which iterates a registry of `RunContextProvider`s. `GitRunContext.in_context()` checks if the code runs inside a git repo; if so, `tags()` reads the current commit hash, branch, and repo URL via `_resolve_git_info()` and attaches them as run tags automatically."
      }
    },
    {
      "@type": "Question",
      "name": "How does MLflow's `runs:/<run_id>/<artifact_path>` URI scheme differ from saving a model to an arbitrary path?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The `run_id`-keyed URI is a structural guarantee — the artifact's storage address permanently points back to the run that produced it, along with all its tags (git commit, parameters, metrics). Saving to an arbitrary path creates a model with no structural link back to its producing run; the reproducibility connection depends on someone keeping a separate record in sync."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if training code runs outside a git repository when MLflow tracking is enabled?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `GitRunContext.in_context()` returns `False` because it can't resolve a commit, so the git tags are simply omitted from the run. The mechanism degrades gracefully — no empty or garbage values are logged — but the run loses its code-lineage guarantee entirely, which defeats the purpose of automatic tracking."
      }
    },
    {
      "@type": "Question",
      "name": "What is the limitation of commit-based lineage for notebook-driven training?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The git commit tag captures the last committed state, not uncommitted edits made interactively. A notebook run with uncommitted changes gets a real commit tag that doesn't reflect the exact code that ran — this is a known limitation of commit-based lineage, not specific to MLflow's implementation."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when logging a trained model that breaks run lineage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Calling `model.save(\"some/path\")` directly instead of using `mlflow.log_model()`. The manual save creates a model file that has no structural link back to the run — the artifact lives outside the `runs:/<run_id>/` mechanism, so six months later no one can trace which run produced it."
      }
    },
    {
      "@type": "Question",
      "name": "How does the provider registry pattern in MLflow's context system differ from a hardcoded git-commit capture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The registry loop calls `in_context()`/`tags()` on every registered provider generically — adding a new context source (Databricks cluster ID, CI pipeline ID) means registering one more `RunContextProvider` without changing `resolve_tags()` at all. A hardcoded approach would require modifying the tagging logic for each new context source, creating tight coupling."
      }
    },
    {
      "@type": "Question",
      "name": "How does DVC keep large data files out of git while still tracking them in version control?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: DVC computes a content hash (MD5) of the data file and writes a small `.dvc` file containing the hash, size, and path — this is what git tracks. The actual bytes live in a separate content-addressed cache (`cache/<hash[0:2]>/<hash[2:]>`), completely outside git's object store."
      }
    },
    {
      "@type": "Question",
      "name": "How does DVC's content-addressed cache differ from Git LFS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: DVC never lets the actual data enter git at all — git tracks only the tiny `.dvc` pointer file. Git LFS uses smudge/clean filter plumbing to intercept git operations and swap pointers for real files, which still requires per-repo hook configuration and keeps the git-native storage model in the loop. DVC's approach is fully decoupled from git internals."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if the local DVC cache is deleted and no remote has been configured?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The `.dvc` files still exist in git (with their hashes), but the hashes point at data that no longer exists anywhere. The data is irrecoverable — `dvc checkout` would produce empty files or errors. This is why `dvc push` to cloud storage is essential; git only tracks the pointer files, not the underlying content."
      }
    },
    {
      "@type": "Question",
      "name": "Why must files in DVC's content-addressed cache be read-only (mode 0o444)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Content-addressing's correctness guarantee — \"this hash always means this exact content\" — depends on cached objects never being mutated after they're written. Making the file read-only enforces that invariant at the filesystem level rather than trusting application code to never overwrite a cached object."
      }
    },
    {
      "@type": "Question",
      "name": "What's the tradeoff of using MD5 as DVC's content hash?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: MD5 is no longer cryptographically secure against deliberate collision attacks, but at realistic dataset-versioning scales the collision probability is negligible. The practical tradeoff is speed vs. security — MD5 is faster to compute than SHA-256, and DVC doesn't need collision resistance against adversarial inputs, only against accidental collisions in normal usage."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a data file is renamed outside of DVC's own commands?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The `.dvc` file's `path` field becomes desynchronized from the data's actual location — the pointer file still names the old path even though the content hash remains valid. This breaks `dvc checkout` and `dvc diff` operations. The correct way to move tracked files is `dvc move`, which updates both the file location and the `.dvc` file together."
      }
    },
    {
      "@type": "Question",
      "name": "What problem do promotion stages solve that version numbers alone cannot?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Version numbers tell you sequence (v1 before v2) but not status (is v2 live, testing, or retired?). Promotion stages (None → Staging → Production → Archived) create a deterministic lifecycle where exactly one version occupies Production, making \"which model is serving customers right now?\" answerable without grepping logs or querying a CMDB."
      }
    },
    {
      "@type": "Question",
      "name": "How do model version aliases (MLflow 2.9+) differ from the fixed-stage lifecycle?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Stages are a fixed four-value enum (None, Staging, Production, Archived) that enforce a linear progression. Aliases like `@champion` or `@challenger` are user-defined names with no fixed ordering — they're more flexible for non-linear workflows (A/B testing, shadow deployment) where the same model version might simultaneously serve dual roles."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you promote a version to Production without setting `archive_existing_versions=True`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Multiple versions can accumulate in the Production stage simultaneously, and the \"which model is live?\" question becomes ambiguous. The serving layer may route traffic to the wrong version, and rollback requires manual archival of the old version. `archive_existing_versions=True` atomically archives all existing versions in the target stage."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the stage transition atomic (single DB transaction) instead of two separate updates?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: If archival of the old version and promotion of the new version were separate operations, a crash between them would leave two versions in Production or zero versions in Production. The single `session.add_all()` → flush ensures both changes commit or neither does, preventing partial states."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when promoting to None or Archived?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Attempting to set `archive_existing_versions=True` when promoting to None or Archived — the registry raises `MlflowException` because only Staging and Production are \"active\" stages. This guard prevents nonsensical states where archival logic fires for non-production stages."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you promote a Production version back to Staging?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The version moves to Staging, but the previous Production version is NOT automatically archived — you'd need to explicitly archive it or promote a different version to Production with `archive_existing_versions=True`. This leaves a gap where no version is in Production and traffic has no valid model to route to."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't a batch scoring pipeline serve a prediction API with sub-100ms latency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Batch pipelines optimize for throughput (millions of rows, scheduled, fault-tolerant) with minutes-to-hours latency budgets. Online inference needs single-request-in single-response-out with a strict per-request latency budget. The concurrency model, health/readiness requirements, and protocol differences (files vs. REST/gRPC endpoints) make them fundamentally different architectures."
      }
    },
    {
      "@type": "Question",
      "name": "How does KServe's transformer/predictor split differ from a monolithic model server?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: KServe's `Model.__call__` can forward `predict()` to a separate predictor container via HTTP/gRPC when `predictor_host` is set. This lets preprocessing run on CPU pods while GPU-heavy inference runs on GPU pods — the transformer handles feature engineering on cheap CPU instances, the predictor runs the model on expensive GPU instances."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you forget to set `self.ready = True` in a KServe model's `load()` method?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The pod starts and passes its basic health checks, but Kubernetes readiness probes call `healthy()` which checks `self.ready`. Since `self.ready` remains `False`, the pod never receives traffic — it sits in the Service's endpoint list but the load balancer routes nothing to it. The model is deployed but effectively invisible."
      }
    },
    {
      "@type": "Question",
      "name": "Why does KServe forward only three headers (`x-request-id`, `x-b3-traceid`, `authorization`) instead of all headers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Forwarding arbitrary headers would leak security context (cookies, internal tokens) and create subtle coupling between clients and predictor pods. The allowlist is deliberate: request tracing, distributed tracing propagation, and upstream auth are the only headers that have legitimate reasons to survive the hop from transformer to predictor."
      }
    },
    {
      "@type": "Question",
      "name": "What's the downside of KServe's per-stage Prometheus histograms for online serving?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Every request gets three histogram observations (`PRE_HIST_TIME`, `PREDICT_HIST_TIME`, `POST_HIST_TIME`) with model-specific labels, creating non-trivial metric cardinality. For a serving layer with many models and versions, the histogram time series can grow large enough to stress Prometheus storage — but this is the cost of per-stage latency breakdown needed for SLO enforcement."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if `preprocess()` is slow in a KServe model?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: It adds directly to total request latency — there's no circuit breaker or timeout at the framework level. If preprocess takes 500ms, the client waits 500ms + predict + postprocess. The latency is tracked by `PRE_HIST_TIME` (a Prometheus histogram), so you can detect it, but the only fix is to optimize it or move it to a separate transformer pod that scales independently."
      }
    },
    {
      "@type": "Question",
      "name": "How does Triton's dynamic batching amortize GPU overhead across concurrent requests?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Individual requests are held in a queue and grouped into batches. The GPU kernel launch overhead, memory transfer setup, and model weight loading are fixed costs paid once per batch, not once per request. A batch of 10 images might cost 7ms total instead of 60ms for 10 sequential single-image inferences — a 9x throughput improvement with no model or hardware change."
      }
    },
    {
      "@type": "Question",
      "name": "How does Triton's `max_queue_delay_microseconds` differ from `preferred_batch_size` as a batching trigger?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `preferred_batch_size` triggers dispatch when the queue reaches that threshold — maximum batching efficiency. `max_queue_delay_microseconds` triggers dispatch when the timer expires regardless of queue depth — preventing starvation when traffic is light. Both can fire; the scheduler uses whichever triggers first."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if only one request arrives within the `max_queue_delay` window?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Triton dispatches a batch of size 1 — there is no minimum batch size. The scheduler simply groups whatever is available when the timer fires. The request still benefits from the server infrastructure but gets no batching benefit."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `preserve_ordering` mandatory for autoregressive LLMs but wasteful for stateless classifiers?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Autoregressive models produce different outputs depending on request order (the generation of one request may depend on tokens from another in streaming mode), so out-of-order responses would be semantically wrong. `preserve_ordering` adds internal synchronization to buffer and reorder responses, which is unnecessary overhead for stateless classifiers where response order doesn't affect correctness."
      }
    },
    {
      "@type": "Question",
      "name": "What is the latency tax of dynamic batching, and how do you tune it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Every request in the queue waits up to `max_queue_delay_microseconds` before execution. For a 50ms end-to-end SLA, a 5ms queue delay is reasonable; for batch analytics, 50ms might be acceptable to capture larger batches. The tradeoff is linear: more delay = larger batches = higher throughput, but higher tail latency per request."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when setting `preferred_batch_size` for a new model?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Guessing the value instead of profiling with NVIDIA Model Analyzer. Setting it too high causes GPU memory exhaustion (OOM); setting it too low wastes the batching opportunity entirely. The optimal batch size varies by orders of magnitude between a lightweight classifier (batch 64+) and a large language model (batch 2-8)."
      }
    },
    {
      "@type": "Question",
      "name": "How does Argo Rollouts' canary traffic shifting differ from a plain Kubernetes rolling update?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: A rolling update replaces Pods by count (25% new, then 50%) with no percentage-based traffic split or pause gate. Argo Rollouts uses a `Rollout` CRD where `setWeight` steps instruct the mesh/ingress to route an exact percentage of live traffic to the canary — the weight is enforced on the data plane, not by Pod count, giving precise traffic control."
      }
    },
    {
      "@type": "Question",
      "name": "What is an `AnalysisRun`, and how does it gate model promotion?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: An `AnalysisRun` polls a metrics endpoint (Prometheus, Datadog) against configurable thresholds during a canary step. The rollout pauses until the analysis passes or fails — promotion only proceeds when real inference metrics (p99 latency, accuracy) meet the criteria. This is the A/B gate: the new model receives a known fraction of traffic, metrics are collected from that fraction, and promotion is gated on those metrics."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if the canary model OOMs mid-rollout?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The Pod crashes, `AvailableReplicas` drops to zero, and the controller detects `c.newRS.Status.AvailableReplicas == 0` in `reconcileTrafficRouting()`. It immediately sets traffic weight to zero, removes managed routes, and scales the canary ReplicaSet to 0. All traffic returns to the stable model with no human intervention needed."
      }
    },
    {
      "@type": "Question",
      "name": "What is the tradeoff of `dynamicStableScale: true` for GPU-heavy model rollouts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The stable ReplicaSet scales down proportionally as canary weight increases, saving GPU costs during the rollout. The trade-off is that instantaneous rollback becomes slower — the stable ReplicaSet must scale back up before it can absorb full traffic. For ML models with slow cold-start (loading large weights into GPU memory), this delay matters."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `pause.duration` on analysis steps critical for statistical significance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The analysis needs enough inference samples to detect real metric differences. A model serving 100 req/s with a 5-minute pause gives ~30,000 samples; a model serving 5 req/s may need 60+ minutes for the same confidence. Too short a pause means the analysis passes on insufficient data and a degraded model gets promoted."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if the Istio VirtualService doesn't exist when the Rollout is created?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Argo Rollouts will modify the VirtualService in place during the rollout, so the route must exist beforehand. Without it, `reconcileTrafficRouting()` fails to find the target route and the rollout gets stuck. The VirtualService must not be manually edited while a rollout is in progress either — Argo Rollouts owns it."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't you use only PSI or only KS for production drift detection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: PSI bins distributions and catches overall proportion shifts, but misses local shape changes in narrow quantile ranges. KS finds the point of maximum CDF separation — sensitive to local deviations — but cannot handle categorical data and becomes oversensitive with very large sample sizes. Production monitoring needs both, applied to the right column types."
      }
    },
    {
      "@type": "Question",
      "name": "How does PSI's bin-based approach differ from KS's CDF-based approach mathematically?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: PSI computes `sum((ref_pct - cur_pct) * ln(ref_pct / cur_pct))` across shared bins — a global divergence measure sensitive to any bin where proportions differ. KS computes `max|F_ref(x) - F_cur(x)|` — the maximum distance between empirical CDFs — finding the single point of greatest separation regardless of bin structure."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you try to apply the KS test to a categorical column in Evidently?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Evidently's `ks_stat_test` is registered only for `ColumnType.Numerical`. Applying it to a categorical column raises `StatTestInvalidFeatureTypeError`. The auto-selection logic routes categorical columns to chi-squared, z-test, or Jensen-Shannon instead."
      }
    },
    {
      "@type": "Question",
      "name": "Why does KS become unreliable with very large sample sizes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: With 100,000+ samples, KS detects statistically significant differences that are practically meaningless — a 1% mean shift with no effect on model accuracy triggers drift detection. This is why Evidently switches from KS to Wasserstein distance when the reference dataset exceeds 1,000 rows — Wasserstein produces magnitude-scale scores more interpretable at large sample sizes."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't you directly compare PSI and KS scores?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: They're on different scales. PSI is a dimensionless divergence score (0 = identical, 0.1 = moderate drift) while KS returns a p-value (probability of observing the separation under the null hypothesis, with 0.05 as default significance). A PSI of 0.1 and a KS p-value of 0.05 measure fundamentally different things."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when choosing a reference window for drift detection?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Comparing today's batch against the original training set (months or years old) — this will always show drift because distributions naturally change over time. The correct approach is to compare against a recent reference window of similar age, capturing meaningful shifts rather than expected temporal evolution."
      }
    },
    {
      "@type": "Question",
      "name": "Why do Prometheus's default histogram buckets produce inaccurate p99 percentiles for ML inference latency?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Default buckets (.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10) are tuned for HTTP request durations. A transformer at 15ms p50 and 200ms p99 sees 99% of observations land in the `0.1-0.25` bucket — a 150ms-wide bucket that makes `histogram_quantile(0.99, ...)` return an approximation spanning that entire range, useless for detecting a 20ms regression."
      }
    },
    {
      "@type": "Question",
      "name": "How do Prometheus native histograms differ from classic histograms in bucket boundary storage?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Classic histograms encode bucket boundaries in the metric name (`_bucket{le=\"0.1\"}`), creating a new time series per bucket per label combination. Native histograms encode boundaries in the metric value itself via a `Schema` field (0 = base-2 exponential, 8 = 256 sub-buckets per power of two, -53 = custom boundaries) — boundaries are part of the data, not the metric name."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you change classic histogram bucket boundaries on an existing metric?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Prometheus identifies metrics by name + label set, and classic bucket boundaries are encoded in the metric name. Switching boundaries creates a new metric — historical data and new data are in separate time series with no continuity. Native histograms avoid this because boundaries are part of the metric value, not the name."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't you use summaries instead of histograms for cluster-wide p99 percentiles?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Summaries compute quantiles client-side and expose a single `quantile` label — you cannot aggregate quantiles across instances. With 20 inference pods, summaries give 20 separate p99 values with no way to combine them. Histograms let you aggregate at query time with `sum by (le)`, giving the true cluster-wide percentile."
      }
    },
    {
      "@type": "Question",
      "name": "What is the memory cost of custom histogram buckets?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: One time series per bucket per label combination. 14 custom buckets times 3 label combinations (model, version, endpoint) = 42 time series for one histogram. This is negligible compared to unbounded labels, but native histograms' sparse encoding (`PositiveSpans` + delta-encoded `PositiveBuckets`) stores only non-empty buckets, dramatically reducing memory for sparse distributions."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if an inference service produces a 0.0s observation when using custom bucket native histograms?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Custom bucket histograms have no zero bucket — the `Validate()` method enforces `ZeroCount == 0`. A 0.0s observation lands in your first defined bucket, not a special zero bucket. If your first bucket boundary is 0.005 (5ms), a 0.0s observation still counts there. Design your first bucket boundary accordingly."
      }
    },
    {
      "@type": "Question",
      "name": "How does TFDS avoid re-downloading and re-transforming data on every `tfds.load()` call?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The first call runs `download_and_prepare()`, which writes sharded TFRecord files and a `dataset_info.json` sidecar to a versioned directory on disk. Subsequent calls detect the existing directory, read the proto from `dataset_info.json`, skip `download_and_prepare()` entirely, and construct a `tf.data.TFRecordDataset` from the cached shards."
      }
    },
    {
      "@type": "Question",
      "name": "How does `DatasetInfo` track cache validity, and what invalidates it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `DatasetInfo` records the feature schema, split boundaries, version string, and checksum as JSON. `read_from_directory()` compares the proto's version against the builder's code version — a mismatch means the cache is stale and must be regenerated. Changing feature normalization without bumping the version leaves the old cache in place."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if you change the feature normalization in `_info()` without bumping the version?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `read_from_directory` compares version strings — if they match, the old `features.json` is restored regardless of whether the code now defines different features. The cached TFRecords from the old normalization are loaded, silently training on the wrong feature values. Bump the version to force regeneration."
      }
    },
    {
      "@type": "Question",
      "name": "What's the downside of using TFRecord as the default cache format?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: TFRecord is TensorFlow's native format with optimized I/O and parallel interleaving, but it's not easily readable by non-TF frameworks. Parquet support was added later (v4.9.5) for cross-framework use, but TFRecord remains the default because it integrates most deeply with `tf.data` pipelines — the tradeoff is ecosystem lock-in."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if two scripts call `tfds.load()` for the same dataset simultaneously?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: TFDS uses `utils.incomplete_dir` to write to a temporary directory and atomically rename on success. A concurrent caller that starts before the rename sees the directory doesn't exist and begins its own prepare — the second caller's write may overwrite or fail depending on `download_mode`. Production pipelines should prepare once in a dedicated step and share the data directory via a volume."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when relying on TFDS's auto-short-circuit in CI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Assuming `tfds.load()` will skip preparation in a fresh container with no cached data. CI environments typically use ephemeral containers, so the data directory is empty every run — you need an explicit `download_and_prepare()` step or a pre-populated volume to avoid re-downloading on every pipeline execution."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Great Expectations treat empty strings (`\"\"`) as different from NULL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Great Expectations checks for database-native null representations (PostgreSQL `NULL`, pandas `np.NaN`) — empty strings are valid non-null values by this definition. A CRM export might contain `\"\"` in a `plan_type` column that isn't NULL but is invalid for the model. You need a separate `expect_column_values_to_not_be_in_set` with `[\"\"]` to catch empty strings explicitly."
      }
    },
    {
      "@type": "Question",
      "name": "How does the `mostly` parameter differ from strict null checks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `mostly=0.97` on `expect_column_values_to_not_be_null` means at least 97% of rows must be non-null for the check to pass — allowing 3% sporadic missingness while catching a jump to 15%. Without `mostly`, the check requires 100% non-null values, which fails on datasets known to have legitimate sparse missingness."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when a new category appears in a categorical feature that's gated by a data contract?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `expect_column_values_to_be_in_set` with a hardcoded `value_set` rejects the new category — the validation fails, the CI pipeline blocks, and the team must explicitly update the data contract in the same PR that adds the category. This is the entire point: schema changes are explicit and reviewed, not accidental."
      }
    },
    {
      "@type": "Question",
      "name": "Why should you not use Great Expectations' auto-profiler for production data contracts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The profiler auto-discovers value sets across batches, which means the contract reflects whatever values currently exist rather than what should be allowed. A new, invalid category would be automatically included. The profiler is useful during initial contract authoring to see what values exist, but production contracts should hardcode the allowed set."
      }
    },
    {
      "@type": "Question",
      "name": "How does the `ValidationGraph` prevent redundant metric computation across expectations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Each `MetricEdge` has a unique ID, and the graph's `_edge_ids` set makes `add()` an O(1) duplicate check. Multiple expectations sharing the same metric (e.g., several nullity checks on different columns all need `column_values.nonnull.count`) compute it exactly once, with each expectation's `ExpectationValidationGraph` filtering the global metric info down to only what it needs."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when running Great Expectations in CI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Running the data contract check *after* model training instead of *before*. The contract should gate the pipeline before a single model weight is loaded — catching schema drift, null proliferation, or new categories before they corrupt the training run. Running it after training means the model was already trained on bad data."
      }
    },
    {
      "@type": "Question",
      "name": "How does TPE find good hyperparameters in fewer trials than grid or random search?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: TPE splits completed trials into \"good\" (top gamma%) and \"bad\" (rest), fits a separate Parzen estimator (Gaussian mixture) to each group, then samples points that maximize `l(x)/g(x)` — the density ratio of good to bad. This focuses budget on regions of the space that actually work, unlike grid/random search which treat every region equally regardless of past outcomes."
      }
    },
    {
      "@type": "Question",
      "name": "How does TPE differ from Gaussian Process-based Bayesian optimization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: GP-based BO fits a surrogate model to the objective function itself, scaling poorly beyond ~20-30 dimensions and failing on conditional spaces. TPE models the distribution of good vs. bad configurations instead — it scales to hundreds of dimensions, handles tree-structured (conditional) spaces natively, and avoids the expensive GP fitting step."
      }
    },
    {
      "@type": "Question",
      "name": "What is `constant_liar` and when should you use it?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `constant_liar=True` includes `RUNNING` trials in the \"above\" (bad) group, penalizing configurations near in-flight parallel trials. Without it, multiple workers might suggest parameters near each other because they haven't seen each other's in-progress trials, wasting compute on similar configurations. Use it for parallel optimization with multiple workers."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `multivariate=True` critical for hyperparameter optimization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Without it, TPE treats each parameter independently — missing interactions like \"high learning rate pairs well with large batch size.\" With `multivariate=True`, the Parzen estimator fits a joint density across all parameters simultaneously, capturing correlations that independent modeling misses and producing better candidates."
      }
    },
    {
      "@type": "Question",
      "name": "What is the tradeoff of the gamma function's cap at 25 trials?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The cap prevents the \"good\" density model from becoming too diffuse — if 200 trials are \"good,\" the model can't distinguish signal from noise. The tradeoff is that with fewer than 25 trials in the good group, the density estimate is based on limited data. The default `min(ceil(0.1 * n), 25)` means at 250+ completed trials, only the top 25 form the good model."
      }
    },
    {
      "@type": "Question",
      "name": "What storage backend should you use for parallel Optuna optimization in production?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: PostgreSQL or MySQL via `RDBStorage` — never SQLite. SQLite has row-level locking that causes contention with multiple workers. Optuna's `RDBStorage` supports heartbeat-based dead worker detection (`heartbeat_interval`) and connection pool management (`pool_pre_ping=True` for MySQL) needed for cluster environments."
      }
    },
    {
      "@type": "Question",
      "name": "How does gradient bucketing overlap AllReduce with the backward pass?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: DDP partitions parameters into 25 MiB buckets. As backward computes gradients, each bucket's ready count increments. The moment the last gradient in a bucket lands, the C++ Reducer fires an async AllReduce on that bucket's buffer while backward continues computing gradients for other buckets. This hides AllReduce latency behind gradient computation."
      }
    },
    {
      "@type": "Question",
      "name": "How does DDP's communication strategy differ from FSDP's?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: DDP replicates the full model on every rank and uses bucketed AllReduce for gradients — communication happens during backward. FSDP shards parameters across ranks and uses AllGather for forward/backward activation — communication happens during both forward and backward. They're mutually exclusive wrappers; you use one or the other."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if one parameter's gradient takes much longer to compute than the rest?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: That parameter becomes the straggler in its bucket. The bucket's AllReduce cannot fire until every gradient in the bucket is ready, so one slow gradient delays communication for all parameters in the same bucket. This is why the first bucket (containing late-computed gradients) gets a smaller size cap (1 MiB vs. 25 MiB) — fewer parameters per bucket means fewer chances for a straggler."
      }
    },
    {
      "@type": "Question",
      "name": "What is the tradeoff of `gradient_as_bucket_view=True`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The gradient tensor becomes a direct view into the communication bucket, eliminating the gradient-to-bucket copy and saving peak memory equal to total gradient size. The trade-off is that `detach_()` cannot be called on gradient tensors in this mode — you must use `zero_grad(set_to_none=True)` instead to avoid stale gradient accumulation."
      }
    },
    {
      "@type": "Question",
      "name": "Why are bucket indices reversed at Reducer creation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Backward computes gradients in reverse order of the forward pass. If buckets were assigned in forward order, the first parameters processed by backward would fill buckets numbered last — the Reducer would have no bucket ready to AllReduce until deep into backward. Reversing the assignment aligns bucket fill order with backward execution order so the first gradient computed fills the first bucket the Reducer processes."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when using `find_unused_parameters=True`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: Enabling it unconditionally when the model doesn't actually have unused parameters in some forward passes. It adds overhead for graph traversal on every backward pass — DDP must detect which parameters were unused and skip AllReduce for them. Only enable it when the model genuinely has conditional computation paths that leave some parameters unused in certain forward passes."
      }
    },
    {
      "@type": "Question",
      "name": "Why must Airflow's retry state live in the metadata database instead of in the worker's memory?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: When a worker process crashes or is killed, every in-memory variable vanishes — including `try_number`, the next backoff delay, and the failure reason. The scheduler runs in a completely separate process and must independently know that a task failed, which attempt it was, and when to re-queue it. The only state that survives a process crash is a row in the metadata database."
      }
    },
    {
      "@type": "Question",
      "name": "How does Airflow's heartbeat-based liveness detection work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The worker updates `last_heartbeat_at` periodically in the `task_instance` row. The scheduler checks if this timestamp is stale relative to `now()`. If the worker crashes mid-task, the timestamp freezes, and the scheduler eventually declares the TI orphaned and re-queues it — entirely DB-driven, no in-memory signal needed."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a worker crashes between getting a task from the queue and writing `state = RUNNING` to the DB?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: The TI stays in `QUEUED` state because the DB row was never updated. The scheduler's next heartbeat loop either re-dispatches it (if the executor reports the task was never started) or detects the orphaned PID via `last_heartbeat_at` staleness. A TI is only considered \"running\" when the DB row says so."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `max_tries` cumulative rather than per-clear?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `max_tries` is incremented when a task is cleared (re-run from the UI or API), never reset. This prevents infinite retry loops from repeated manual re-runs — each clear consumes part of the retry budget. The DB row is the only place that knows the true retry budget after multiple clears, something the worker process never tracks."
      }
    },
    {
      "@type": "Question",
      "name": "Why does `prepare_db_for_next_try()` assign a new UUID on every retry?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `TaskInstanceHistory.record_ti()` snapshots the current attempt's timing data before overwriting the row for the next attempt. A new UUID gives the next attempt a fresh primary key, keeping each attempt's history immutable and independently trackable. The composite unique key (`dag_id`, `task_id`, `run_id`, `map_index`) stays the same, but `id` changes."
      }
    },
    {
      "@type": "Question",
      "name": "What prevents thundering-herd retries in Airflow when multiple tasks fail simultaneously?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `next_retry_datetime()` uses a SHA1 hash of `(dag_id, task_id, logical_date, try_number)` to compute deterministic jitter within the `[min_backoff, 2*min_backoff)` window. The same failed attempt always gets the same delay, but different tasks get different jitter offsets, spreading retries across time instead of all firing at once."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the worker ignore SIGINT but handle SIGTERM?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A: `signal.signal(signal.SIGINT, signal.SIG_IGN)` means the worker ignores Ctrl-C, which the scheduler sends to shut down gracefully. Only SIGTERM (from `proc.terminate()`) or SIGKILL will kill a worker. This prevents a keyboard interrupt during a task from silently aborting cleanup code without the executor knowing — the task completes its current operation before shutting down."
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

  /* Accordion: click question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
    h3.setAttribute('aria-expanded', h3.parentElement.classList.contains('open'));
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
