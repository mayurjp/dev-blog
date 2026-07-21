---
layout: page
title: "CI/CD Interview Questions: 73 Real-World Q&A from Production Manifests"
description: "73 interview-ready CI/CD questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/cicd/
---

Bite-sized, standalone interview questions and answers for CI/CD. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">73</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: CI fundamentals (from manual builds to automated pipelines) (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does CI actually solve that local builds don't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Local builds prove "it works on my machine" — same SDK version, same cached deps, same stale branch. CI provisions a fresh ephemeral runner from a known-clean state every time, so "it passed CI" means something reproducible that a local build never can. The environment is identical for every contributor, every commit.

<p class="qa-link">[Full post →]({{ '/cicd/ci-fundamentals-from-manual-builds-to-pipelines/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does the eShop workflow use both `pull_request` and `push: branches: [main]` triggers? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The `pull_request` trigger is the pre-merge gate — it validates the branch before it's allowed to merge. The `push: branches: [main]` trigger re-validates after merge, catching the case where two individually-passing PRs merge into a broken combination. Only one trigger misses this class of integration failure.

<p class="qa-link">[Full post →]({{ '/cicd/ci-fundamentals-from-manual-builds-to-pipelines/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `paths-ignore` actually control in a workflow trigger? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It prevents the workflow from running at all when only matched files change. A markdown-only PR or a change scoped entirely to a separate subsystem skips the entire workflow rather than spinning up a runner to build a solution that change couldn't possibly break — real compute cost and time savings, not just tidiness.

<p class="qa-link">[Full post →]({{ '/cicd/ci-fundamentals-from-manual-builds-to-pipelines/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `dotnet test --no-build` matter in a CI pipeline? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It reuses the binaries from the `dotnet build` step instead of rebuilding. The test step trusts the build step's output rather than repeating expensive work — a small but real detail that prevents the test step from masking build failures by rebuilding silently.

<p class="qa-link">[Full post →]({{ '/cicd/ci-fundamentals-from-manual-builds-to-pipelines/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does a green CI check actually enforce on its own? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Nothing. The pipeline just reports pass/fail onto the commit or PR as a status check. Without an explicit enforcement layer (branch protection rules), a red build and a green build are both mergeable by clicking the same button — the signal exists but nothing is wired to act on it.

<p class="qa-link">[Full post →]({{ '/cicd/ci-fundamentals-from-manual-builds-to-pipelines/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does `actions/setup-dotnet@v3` with no explicit version input determine which SDK to install? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It reads the repo's own `global.json` to pick the SDK version, meaning CI is guaranteed to build with the same SDK version every contributor's `dotnet` CLI resolves to locally — not whatever happens to be newest on the runner image. This pins the toolchain to what the repo declares, not what the CI environment defaults to.

<p class="qa-link">[Full post →]({{ '/cicd/ci-fundamentals-from-manual-builds-to-pipelines/' | relative_url }})</p>
  </div>
</div>

## Topic: GitHub Actions workflow anatomy (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why do job outputs require explicit `outputs:` declaration instead of being automatic? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Jobs run on separate runners with no shared filesystem — a step's output is a value on that runner's local state, not in a global namespace. The job must explicitly re-expose it in its `outputs:` block to make it accessible across the runner-isolation boundary. A value computed in a step but never declared at the job level is genuinely invisible to other jobs.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-workflow-anatomy-step-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What two things does `needs:` do simultaneously? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It creates a data-access relationship (`needs.<job>.outputs`) and an execution-order dependency (the consuming job waits for the producing job to finish). You cannot reference another job's outputs without also making your job depend on its completion — the two are inseparable.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-workflow-anatomy-step-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Terraform's workflow pass a step output via `env:` instead of string interpolation? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Passing structured or multi-line values as an environment variable avoids string-interpolation escaping concerns in downstream scripts. The value arrives as a genuine environment variable the script can read normally, rather than requiring shell-safe quoting inside a `run:` command string.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-workflow-anatomy-step-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What's the difference between `steps.<id>.outputs.<name>` and `needs.<job>.outputs.<name>`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The first references a step output within the same job — both steps share the same runner and workspace. The second crosses a runner-isolation boundary — it references a value that was explicitly re-declared in another job's `outputs:` block. The syntax difference reflects genuinely different isolation levels, not just naming convention.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-workflow-anatomy-step-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does a real workflow surface multiple independent step outputs at the job level? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A job commonly computes several independent pieces of data across different steps — version numbers, experiment flags, package names — each requiring its own explicit line in the `outputs:` block. There is no blanket "expose everything" switch; each value needs deliberate promotion.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-workflow-anatomy-step-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is the dependency graph in a real workflow deliberately sparse? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Jobs without a `needs:` relationship run fully in parallel by default. Only jobs that genuinely need each other's data or ordering get connected — everything else runs concurrently to keep total pipeline time down. Adding unnecessary `needs:` links serializes what could run in parallel for no benefit.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-workflow-anatomy-step-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

## Topic: Triggers & events (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does a `schedule` trigger provide essentially no event context to the workflow? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Cron is pure time-based — it tells the workflow *when* to run, never *what* changed. There is no git event, no commit SHA, no PR number. Any scheduled workflow that needs to know what's changed or what needs attention has to determine that itself, from scratch, on every run — the trigger only provides timing.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-triggers-schedule-vs-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What makes `workflow_dispatch` inputs fundamentally different from `push` event metadata? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`push` and `pull_request` hand you metadata about what already happened (commit SHA, PR number, sender). `workflow_dispatch` hands you exactly, and only, whatever fields the workflow author chose to expose as a form — explicitly author-defined, not automatically derived from any event. The data is future-oriented (what you want to do), not retrospective.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-triggers-schedule-vs-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Can a `workflow_dispatch` input be both `required: true` and have a `default`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Yes. Required means "this field will always have SOME value" — a default supplies that value when the human doesn't override it. Most runs won't need to think about it, but the field always resolves, which is what `required` guarantees.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-triggers-schedule-vs-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What unique power does `workflow_dispatch` give a human over a `push`-triggered workflow? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A human choosing to run a `workflow_dispatch` workflow is selecting, at trigger time, which branch the entire rest of the job operates against — via inputs like `ref: ${{ inputs.target-branch }}`. This is real, meaningful control that a push/pull_request-triggered workflow doesn't have, where the target is already determined by the event itself.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-triggers-schedule-vs-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does the `lock.yml` scheduled workflow know which issues to lock? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It doesn't — the entire workflow just runs unconditionally at 1:50 AM UTC daily, and the third-party action (`dessant/lock-threads`) is responsible for figuring out which issues/PRs qualify (inactive 30+ days). There's genuinely nothing for the workflow to react to beyond the clock; all the decision logic lives downstream of the trigger.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-triggers-schedule-vs-dispatch/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What's the common mistake when writing scheduled workflows? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming the `github.event` context carries useful payload like it does for push/PR triggers. A schedule run's event context contains essentially nothing actionable — the workflow must independently determine what state to check or act on, using its own logic, on every invocation.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-triggers-schedule-vs-dispatch/' | relative_url }})</p>
  </div>
</div>

## Topic: Build matrix (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the practical difference between matrix cross-product and `include` form? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Cross-product generates every combination of separate arrays — mostly invalid when axes are correlated (a specific runner only pairs with a specific OS). `include` with fully-specified objects states valid combinations directly, avoiding invalid combos that need `exclude:` pruning or waste CI time generating jobs that were never going to work.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-build-matrix-include-and-fail-fast/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `fail-fast: true` actually do when one matrix leg fails? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It cancels every other in-progress matrix job immediately. For platform-specific testing, this throws away useful information — knowing Linux and macOS still pass after Windows fails is often exactly the diagnostic signal you need. The default trades complete cross-platform information for saved compute.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-build-matrix-include-and-fail-fast/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why would a matrix define three separate properties (`job-name`, `os-name`, `runner`) for the same leg? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Each serves a different downstream consumer: `runner` is the literal `runs-on` value GitHub needs; `os-name` is a normalized short label for artifact naming and Codecov flags; `job-name` is a human-friendly display label. One matrix axis producing three differently-shaped values for three different purposes is a real, common pattern.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-build-matrix-include-and-fail-fast/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does Codecov benefit from per-platform artifact uploads via matrix flags? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Coverage results from all platform legs get uploaded separately, tagged by `matrix.os-name`, instead of merging into one undifferentiated blob. This lets a coverage dashboard show platform-specific coverage gaps ("this code path is covered on Linux but not on Windows") rather than an aggregate number that hides them.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-build-matrix-include-and-fail-fast/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How do you run a step on only one matrix leg? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Use a conditional: `if: matrix.os-name == 'windows'`. Matrix variables aren't limited to parameterizing setup steps — they can gate whether an entire step runs at all, letting platform-specific steps live inside the same job definition rather than needing a wholly separate job.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-build-matrix-include-and-fail-fast/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: When should you explicitly set `fail-fast: false`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
When testing across platforms where knowing which ones still pass after one fails is diagnostic information you actually need. A matrix genuinely testing platform-specific behavior benefits from always seeing the full picture. `fail-fast: true` saves compute but silently discards that cross-platform status.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-build-matrix-include-and-fail-fast/' | relative_url }})</p>
  </div>
</div>

## Topic: Caching dependencies (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `cache-hit: false` not mean nothing was restored? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`cache-hit` reports `true` only for an exact primary-key match. A `restore-keys` fallback match still restores real files from an older, close-enough cache but reports `cache-hit: false` — because a fallback-restored cache is a useful starting point for incremental install, not a guaranteed-complete substitute for one.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-cache-restore-keys-fallback/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does the restore-keys fallback chain actually work? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The primary key (typically a lockfile hash) is tried first. If it misses, restore-keys are tried in the order they're listed, stopping at the first prefix match. A broader key like `npm-` matches any older npm cache regardless of lockfile hash. The workflow author controls fallback specificity by ordering broader-to-narrower deliberately.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-cache-restore-keys-fallback/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `restoreCache` actually return — a boolean or a string? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It returns the key that actually matched — a string — not a boolean. Comparing the returned key against the originally requested primary key is what makes `isExactKeyMatch` possible. A fallback match and an exact match both return a truthy string; only comparing the two strings reveals which kind of match happened.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-cache-restore-keys-fallback/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why should you always run the install step even when the cache hit? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A fallback-restored cache is a partial starting point, not a complete dependency set. Running `npm ci` after a fallback restore is fast because it's incremental — it only downloads what's missing or changed — but skipping it based on `cache-hit: false` means missing real dependencies, while skipping based on a false assumption of completeness is wrong.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-cache-restore-keys-fallback/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What's the purpose of `failOnCacheMiss` in `actions/cache`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It changes miss behavior from "log and continue" to "throw and fail the job." Most caching use cases want misses to be non-fatal (just a slower cold start), but this option exists for cases where a workflow genuinely depends on a cache existing — referencing a cache populated by a separate job — and treats its absence as a real error.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-cache-restore-keys-fallback/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does the cache miss log message list ALL keys tried, not just the primary? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a deliberate debugging aid. When a cache genuinely can't be found, the workflow log shows every key attempted, which is exactly the information needed to diagnose whether a restore-key list was too narrow, misspelled, or simply had no prior cache to match at all.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-cache-restore-keys-fallback/' | relative_url }})</p>
  </div>
</div>

## Topic: Artifacts & build outputs (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why can't job outputs replace artifacts for passing compiled binaries? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Job outputs only carry small string values — a version number, a computed flag. Artifacts upload actual file content to GitHub's artifact storage under an explicit name, because each job runs on its own separate runner with no shared filesystem, and the first runner may already be destroyed by the time the next job starts.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-artifacts-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why are artifact names often dynamically computed from matrix values? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Multiple parallel matrix legs upload different files under different names. If two legs used the same hardcoded name, they'd collide. Dynamic naming (e.g., `app-${{ matrix.os }}`) ensures each leg uploads under a unique name that downstream jobs can match exactly.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-artifacts-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is `if-no-files-found: error` important instead of using the default? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The default behavior (a warning, not a failure) lets a build that silently produced zero files pass its own job successfully, only to fail confusingly several jobs later when nothing can be downloaded. Setting `error` moves the failure to the moment it actually happened, with a clearer error message pointing at the real cause.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-artifacts-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does a downloading job reconstruct a dynamically-named artifact's exact name? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The artifact system does no fuzzy matching — the name must match byte for byte. The downloading job must independently reconstruct the exact name string the uploading job used, which means both jobs need access to the same underlying matrix/version values via job outputs, env vars, or matrix inputs.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-artifacts-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does Terraform's workflow use `$(basename out/*.rpm)` for at runtime? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It computes the artifact name from a glob at runtime instead of duplicating the packaging tool's naming logic in the workflow YAML. The exact filename includes version and architecture details baked in by the packaging tool itself — using the filesystem directly prevents the workflow from drifting out of sync with what the tool actually produces.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-artifacts-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: When would you use a job output instead of an artifact? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
When the value is small and string-shaped — a version number, a boolean flag, an environment name. Artifacts are for actual file content a later job needs to read, execute, or test. Using one where the other fits is an avoidable inefficiency once a pipeline grows past its simplest form.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-artifacts-vs-job-outputs/' | relative_url }})</p>
  </div>
</div>

## Topic: Secrets & environments (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does an environment-scoped secret's blast radius look like compared to a repo secret? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A repo secret is visible to every workflow and job in the repo. An environment-scoped secret is only accessible to a job that explicitly declares `environment: <name>` — every other job gets an empty value because the secret simply doesn't exist outside that scope. This gives high-value secrets a narrower blast radius independent of any deployment gating.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-environments-as-secret-scoping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Are GitHub Environments a deployment-gating-only feature? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
No. Scoping (which secrets exist for a given job) and gating (required reviewers, wait timers) are two separate, composable mechanisms. A repo can use an environment purely for its scoping property, with zero deployment gate involved — as `dotnet/aspnetcore`'s PAT validation workflow demonstrates.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-environments-as-secret-scoping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why should secrets be injected via `env:` on the step instead of interpolated into shell commands? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
GitHub's runner redacts known secret values from logs, but that redaction reliably tracks values coming directly from a secrets context. A value transformed, concatenated, or echoed through shell substitution can slip past the automatic log protection — injecting via `env:` keeps the secret's path clean for redaction.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-environments-as-secret-scoping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does the PAT pool validation workflow use `continue-on-error: true` on each step? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It lets all PATs in the pool be checked in a single run. Without it, the first invalid PAT would stop the job before the remaining nine were ever checked — defeating the purpose of validating the entire pool in one invocation.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-environments-as-secret-scoping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is `permissions: {}` set explicitly on a workflow that validates authentication tokens? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The workflow calls an external Copilot CLI, not the GitHub API — it needs zero GitHub API access to do its job. Setting `permissions: {}` explicitly grants zero, which is the precise minimal-permission mindset applied consistently, not an oversight.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-environments-as-secret-scoping/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens to a job that syntactically references `secrets.SOME_ENV_SECRET` but doesn't declare the environment? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It gets an empty value. The secret doesn't exist outside the environment's scope — the declaration is what makes it visible, not the syntax of the reference. This is a real source of confusion when a secret reference looks correct but the job is missing the `environment:` declaration.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-environments-as-secret-scoping/' | relative_url }})</p>
  </div>
</div>

## Topic: Reusable workflows & composite actions (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: At which level does each mechanism compose — step or job? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Composite actions bundle multiple steps into one reusable step, invoked *inside* a job's `steps:` list, running on the same runner. Reusable workflows bundle an entire job (or several), invoked *as* a job via `uses:` at the job level. The distinguishing question is whether reused logic needs its own runner.

<p class="qa-link">[Full post →]({{ '/cicd/composite-actions-vs-reusable-workflows/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Can a composite action declare its own `runs-on`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
No. Composite actions inherit whatever runner the calling job is already using — they run inside that job's step sequence on the same machine. Reusable workflows always specify their own `runs-on`, because they run as a separate job with their own runner.

<p class="qa-link">[Full post →]({{ '/cicd/composite-actions-vs-reusable-workflows/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What's the tradeoff of `secrets: inherit` versus explicitly listing secrets? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`inherit` gives the called workflow everything the caller has access to — convenient for workflows with many secret dependencies. The cost is not documenting at the call site precisely which secrets actually get used, making the dependency surface less explicit and harder to audit.

<p class="qa-link">[Full post →]({{ '/cicd/composite-actions-vs-reusable-workflows/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does a reusable workflow interact with a matrix strategy in the calling workflow? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The reusable workflow itself has no knowledge of the matrix — it just runs once per set of inputs it's handed. The calling workflow's `strategy.matrix` expands, and each expansion calls the reusable workflow with different `with:` values, resulting in N independent invocations.

<p class="qa-link">[Full post →]({{ '/cicd/composite-actions-vs-reusable-workflows/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What DRY benefit does Terraform's `go-version` composite action provide? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It's referenced from multiple different workflows across the repo, each getting the same `cat .go-version` logic in one place. Every workflow needing the Go version answer gets it identically rather than each re-implementing and potentially drifting from the same logic independently.

<p class="qa-link">[Full post →]({{ '/cicd/composite-actions-vs-reusable-workflows/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if you mistakenly use a reusable workflow inside a job's `steps:`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It fails — reusable workflows are invoked at the job level, not inside a job's steps. Conversely, a composite action can't be invoked at the job level. The `uses:` placement is the hard structural boundary between the two mechanisms.

<p class="qa-link">[Full post →]({{ '/cicd/composite-actions-vs-reusable-workflows/' | relative_url }})</p>
  </div>
</div>

## Topic: Self-hosted vs GitHub-hosted runners (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What state isolation guarantee does a GitHub-hosted runner provide that a self-hosted one doesn't by default? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A GitHub-hosted runner provisions a fresh VM for every job — no leftover files, no lingering env vars, no risk of cross-job contamination. A self-hosted runner reuses the same persistent filesystem and OS by default, so one job's artifacts or a compromised workflow step can contaminate the next job.

<p class="qa-link">[Full post →]({{ '/cicd/self-hosted-vs-github-hosted-runners-ephemeral-flag/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does the `--ephemeral` flag actually do to the runner process? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The runner registers, listens for exactly one job, executes it, then calls `configManager.DeleteLocalRunnerConfig()` to erase its own registration and exits. It is expected to never run a second job — something else (an autoscaling controller) must provision a fresh runner for the next job.

<p class="qa-link">[Full post →]({{ '/cicd/self-hosted-vs-github-hosted-runners-ephemeral-flag/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does the Actions Runner Controller create fresh pods for each ephemeral job? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A Runner ScaleSet Listener pod holds a long-poll HTTPS connection to GitHub. When a `Job Available` message arrives, it patches the EphemeralRunnerSet's desired-replica count, the EphemeralRunner Controller creates a new runner pod, which registers, runs one job, and is torn down after GitHub confirms deletion.

<p class="qa-link">[Full post →]({{ '/cicd/self-hosted-vs-github-hosted-runners-ephemeral-flag/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why did the old `HorizontalRunnerAutoscaler` polling design hit rate limits? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It polled GitHub's API on a fixed `--sync-period` timer for a `PercentageRunnersBusy` metric. At scale, this repeated polling consumed the API rate limit. The new long-poll architecture holds a single connection that GitHub pushes messages down, eliminating the rate-limit problem entirely.

<p class="qa-link">[Full post →]({{ '/cicd/self-hosted-vs-github-hosted-runners-ephemeral-flag/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What's the risk of using a persistent self-hosted runner without `--ephemeral`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A compromised workflow's `run:` step could leave malicious state — injected secrets in env vars, modified binaries, planted files — that the next job on the same runner picks up. There is no filesystem isolation between jobs unless `--ephemeral` or equivalent orchestration provides it.

<p class="qa-link">[Full post →]({{ '/cicd/self-hosted-vs-github-hosted-runners-ephemeral-flag/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `DeleteLocalRunnerConfig()` run after one ephemeral job instead of just exiting? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
An ephemeral runner doesn't just stop — it actively erases its own registration first. This ensures no valid config is left behind for a restart; the orchestrator (ARC, an autoscaling group) must provision a genuinely new runner rather than restarting the old process.

<p class="qa-link">[Full post →]({{ '/cicd/self-hosted-vs-github-hosted-runners-ephemeral-flag/' | relative_url }})</p>
  </div>
</div>

## Topic: Continuous Deployment strategies (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is "deploy" and "receive traffic" treated as two separate operations in a canary strategy? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
If the new version receives 100% of traffic immediately upon deployment, every user hits any bug simultaneously. Separating creation (deploy with `no_traffic: true`) from exposure (traffic shifting in a second step) allows gradual rollout and fast rollback without redeploying.

<p class="qa-link">[Full post →]({{ '/cicd/continuous-deployment-canary-traffic-splitting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is rollback a traffic-split operation rather than a redeploy in Cloud Run? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The old revision was never deleted or replaced — it's still running, holding whatever traffic percentage it wasn't assigned away from. "Undo" is exactly as fast as "do" and carries none of the risk of a fresh deploy potentially hitting a different failure mode than the one being rolled back from.

<p class="qa-link">[Full post →]({{ '/cicd/continuous-deployment-canary-traffic-splitting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What's the difference between `revision_traffic` and `tag_traffic` in Cloud Run? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`revision_traffic` names a specific revision directly — it won't survive the next deploy. `tag_traffic` names a stable tag that points at whichever revision currently holds it — it persists across deploys. Mixing them in one call would be ambiguous about which targeting mechanism wins, so they're mutually exclusive.

<p class="qa-link">[Full post →]({{ '/cicd/continuous-deployment-canary-traffic-splitting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What happens if neither `revision_traffic` nor `tag_traffic` is set in the deploy action? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The deploy action skips the `update-traffic` step entirely — the new revision gets 100% of traffic by default. Canary/blue-green behavior is opt-in, layered onto the same action, not a fork of it.

<p class="qa-link">[Full post →]({{ '/cicd/continuous-deployment-canary-traffic-splitting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does a tag survive across multiple deploys while a revision name doesn't? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A tag is a stable pointer that Cloud Run re-assigns to the newest revision on each deploy. A revision name is pinned to the exact version it was created with — it never moves. This is why tag-based traffic shifting is operationally safer for gradual promotion workflows.

<p class="qa-link">[Full post →]({{ '/cicd/continuous-deployment-canary-traffic-splitting/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why doesn't a canary deploy on Cloud Run require a service mesh or Argo Rollouts? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Cloud Run's revision-and-traffic-split model is native to the platform. The `gcloud run deploy --no-traffic` and `gcloud run services update-traffic` are two real, independently-callable gcloud subcommands — the primitive exists at the platform level, not as an external component bolted on.

<p class="qa-link">[Full post →]({{ '/cicd/continuous-deployment-canary-traffic-splitting/' | relative_url }})</p>
  </div>
</div>

## Topic: Branch protection & required status checks (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `strict_required_status_checks_policy` actually enforce? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It requires a PR to be re-tested against the *latest* state of the target branch before merging — not just whatever the target branch looked like when the PR was last pushed. This closes the gap where a check passed against stale code that has since drifted from what will actually land after the merge.

<p class="qa-link">[Full post →]({{ '/cicd/branch-protection-required-status-checks-as-code/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `integration_id` scoped to a `context` matter for required checks? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Without it, anything capable of setting a commit status with the matching context string — including a compromised token — could satisfy the requirement. Pinning the App ID ensures the required check originates from a specific, trusted GitHub App, not just any actor that knows the context name.

<p class="qa-link">[Full post →]({{ '/cicd/branch-protection-required-status-checks-as-code/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does `do_not_enforce_on_create` solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A repo can require status checks on every update to a branch while still allowing that branch (or the repository) to be created before any check has ever run against it. The check can't exist before the branch does — a single blanket "require checks" toggle can't express this ordering problem.

<p class="qa-link">[Full post →]({{ '/cicd/branch-protection-required-status-checks-as-code/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why are multiple rulesets composable instead of one monolithic protection config? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Multiple rulesets can apply to the same branch simultaneously — one requiring status checks, a separate one requiring code-owner review, another restricting who can bypass — each independently scoped. Classic branch protection was one monolithic config per branch name pattern, which couldn't express layered, independently-auditable rules.

<p class="qa-link">[Full post →]({{ '/cicd/branch-protection-required-status-checks-as-code/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `bypass_mode = "always"` mean for an Integration-type bypass actor? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A specific GitHub App (like a release bot or dependency-update App) can bypass the ruleset's rules unconditionally, not just during specific operations like a pull request merge. Bypass is a first-class, actor-scoped, mode-scoped concept, not a blanket "admins can always force-push" escape hatch.

<p class="qa-link">[Full post →]({{ '/cicd/branch-protection-required-status-checks-as-code/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does a CI result not block a merge by default? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
CI is just information — it reports pass/fail as a status check. Without branch protection rules wiring the check result to enforcement, nothing about running CI prevents a merge. The signal exists but nothing is connected to act on it unless explicitly configured.

<p class="qa-link">[Full post →]({{ '/cicd/branch-protection-required-status-checks-as-code/' | relative_url }})</p>
  </div>
</div>

## Topic: Security hardening (SHA-pinning, GITHUB_TOKEN permissions) (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does SHA-pinning alone not provide complete supply-chain protection? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A SHA never updates itself. A repo either freezes on one commit forever — missing real security fixes — or needs an active process (Dependabot's `github-actions` ecosystem) to bump the pin. SHA-pinning and an update process are a pair, not a single fix.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-security-hardening-sha-pinning-permissions-pwn-requests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the "pwn request" pattern and how does it happen? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A `pull_request_target` workflow gets elevated permissions and secrets for fork PRs. If that same workflow checks out and runs the fork's own head commit, the attacker's code executes with the elevated token — the fork's code runs in the target repo's trusted context. The fix is to never check out fork code under elevated permissions.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-security-hardening-sha-pinning-permissions-pwn-requests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Terraform's changelog enforcement workflow use `ref: ${{ github.base_ref }}` with sparse checkout? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Even the checkout that does happen in this elevated-permission workflow pulls only the target branch's own file, never the fork's contributed commit, and only the path actually needed (`version/VERSION`). Two independent restrictions stacked on the one checkout step that could otherwise be the pwn-request vector.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-security-hardening-sha-pinning-permissions-pwn-requests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why should `permissions:` be explicitly scoped instead of relying on the default token? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Broader write access than a job actually needs enlarges the blast radius if anything in that job is later compromised. Explicitly scoping to only what the workflow needs (`contents: read`, `pull-requests: write`) follows minimal-permission principles — a deliberate absence, not an oversight.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-security-hardening-sha-pinning-permissions-pwn-requests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Dependabot group action updates by major vs minor/patch? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A SHA-pinned action bump is a new, unreviewed piece of code until reviewed. Separating breaking-risk bumps (major) from routine ones (minor, patch) lets a maintainer apply a different review bar to each group rather than treating every pin update identically.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-security-hardening-sha-pinning-permissions-pwn-requests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How did the `tj-actions/changed-files` compromise exploit mutable tags? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The tag `@v4` was force-moved to point at different, unreviewed, malicious code. Repos referencing it by tag silently pulled the compromised code on their next run. Pinning to a full commit SHA closes this specific gap because a SHA is immutable — the exact commit can't be repointed without the pinning repo's knowledge.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-security-hardening-sha-pinning-permissions-pwn-requests/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What safe alternative exists when a workflow needs to check out fork PR code for testing? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Use a separate, unprivileged `pull_request`-triggered workflow for the actual build/test, passing results back to the `pull_request_target` workflow via `workflow_run`. This keeps elevated token access and attacker-controlled code on opposite sides of a process boundary.

<p class="qa-link">[Full post →]({{ '/cicd/github-actions-security-hardening-sha-pinning-permissions-pwn-requests/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 73 across CI/CD

[Back to Q&A Index]({{ '/qa/' | relative_url }})

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
  });

  /* Expand all / collapse all */
  var expandBtn = document.getElementById('qa-expand-all');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var items = document.querySelectorAll('.qa-item');
      var allOpen = Array.prototype.every.call(items, function(i){ return i.classList.contains('open'); });
      items.forEach(function (item) {
        if (allOpen) item.classList.remove('open');
        else item.classList.add('open');
      });
      expandBtn.textContent = allOpen ? 'Expand all' : 'Collapse all';
    });
  }

  apply();
})();
</script>
