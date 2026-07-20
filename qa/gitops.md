---
layout: page
title: "GitOps Interview Questions: 88 Real-World Q&A from Production Manifests"
description: "88 interview-ready GitOps questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/gitops/
---

Bite-sized, standalone interview questions and answers for GitOps. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">88</span></strong> questions shown. Filter by keyword or difficulty below.</p>

<div class="qa-toolbar" id="qa-toolbar">
  <input type="text" id="qa-search" placeholder="Filter questions by keyword…" aria-label="Filter questions" />
  <div class="qa-diff-buttons" id="qa-diff-buttons">
    <button type="button" data-diff="all" class="active">All</button>
    <button type="button" data-diff="Beginner">Beginner</button>
    <button type="button" data-diff="Intermediate">Intermediate</button>
    <button type="button" data-diff="Expert">Expert</button>
  </div>
</div>

## Topic: Pull-based deployment & the reconciliation loop (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What problem does pull-based GitOps solve that push-based CD does not? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Push-based CD is a one-shot operation — `kubectl apply` runs once and nothing checks the cluster afterward. A manual `kubectl edit` or a partially-failed apply leaves the cluster silently diverged from Git, and nothing notices until the next deploy. Pull-based GitOps has an in-cluster controller that continuously fetches the declared state from Git, diffs it against live state, and re-converges — drift gets caught automatically, not just deploys.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does Argo CD decide *when* to reconcile an Application — is it purely time-based polling? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
No. `needRefreshAppStatus` uses multiple independent triggers: a soft expiry timer, a longer hard-expiry fallback, an explicit user-requested refresh, and a check for whether `spec.source` has changed since the last sync. The hard expiry is a safety net, not the primary mechanism. Real git changes trigger immediate re-resolution without waiting for any timer.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What is the "live side" of the diff in Argo CD's reconcile loop? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
It's not a fresh API call per reconcile. `GetManagedLiveObjs` reads from an in-memory `liveStateCache` kept current by a standing Kubernetes watch (`clusterCache.OnEvent`). This means the controller already knows the live state when reconciliation fires — comparing target-vs-live doesn't hammer the API server on every tick. Many Applications sharing the same cluster share one watch-fed cache.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens if Argo CD loses connectivity to the cluster's API server? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The watch-fed `liveStateCache` stops receiving updates, so the "live side" of the diff becomes stale. The controller will reconcile against outdated cached data, potentially marking an app as `Synced` when it has actually drifted, or `OutOfSync` based on stale information. The reconcile loop itself keeps running, but its correctness depends on the watch being current.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why is holding cluster credentials in a CI pipeline a security concern in GitOps? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
In push-based CD, every pipeline run — and every plugin or dependency it pulls — sits inside the cluster's trust boundary. A credential leak in CI is a credential leak into production. In pull-based GitOps, the CI system never holds cluster credentials; only the in-cluster controller has write access, reducing the attack surface to a single, scoped service account.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What's the difference between `sync.Reconcile` and `argodiff.StateDiffs` in Argo CD? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
`sync.Reconcile` pairs up target objects from Git with live objects from the cache by resource key — distinguishing "target has no live counterpart" (needs creating) from "pair exists but differs" (needs patching). Only after this pairing does `StateDiffs` compute what's actually different between each pair. They are two sequential steps, not one comparison.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does the `syncNeeded` flag relate to the hard-expiry fallback in `needRefreshAppStatus`? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
`syncNeeded` checks whether `spec.source` (repo/path/revision) has changed since the last sync — if it has, the controller re-resolves immediately without waiting for any timer. The hard-expiry is a separate safety net that ensures reconciliation happens eventually even if the fast path (source drift) is missed, such as when a webhook fails to fire. They serve different purposes: one is fast-path, the other is guaranteed eventual correctness.
  </div>
</div>

## Topic: Declarative desired state as the single source of truth (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3>Q: Why does a `kubectl edit` on a label injected by a mutating webhook survive in a GitOps-managed cluster? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Because the three-way merge patch structurally cannot produce a correction for a field it has no declared value for. `strategicpatch.CreateThreeWayMergePatch` compares `orig` (what Git declared last sync), `config` (what Git declares now), and `live` (actual cluster state). A field present in `live` but absent from both `orig` and `config` is invisible to the merge — there's no "before and after" from Git to compare it against.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What are the three inputs to GitOps drift detection, and where does each come from? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
`orig` — the previously applied configuration, read from the live object's `kubectl.kubernetes.io/last-applied-configuration` annotation. `config` — the current desired configuration, freshly rendered from Git. `live` — the object's actual current state in the cluster. `orig` is what makes this a three-way merge instead of a naive two-way diff — it tells the algorithm which direction an earlier change came from.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens if the `last-applied-configuration` annotation is manually deleted from a live resource? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
`GetLastAppliedConfigAnnotation` returns an error, and `Diff()` falls back to `TwoWayDiff` — which effectively treats "no known prior state" as "assume nothing changed since Git last matched live." This weaker comparison can under-detect drift on fields that changed both in Git and in the live object simultaneously, since there's no real prior-state history to reason from.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does `TwoWayDiff` work internally in `argoproj/gitops-engine`? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
It calls `ThreeWayDiff` with `config` standing in for `orig` — effectively treating "current Git state" as "prior applied state." This isn't a different algorithm; it's the three-way algorithm degrading gracefully when there's no real history to compare against. The merge patch it produces is weaker because it can't distinguish "Git removed this field on purpose" from "someone else added this field on purpose."
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why is this three-way merge mechanism more significant for GitOps than for a one-off `kubectl apply`? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
A one-off `kubectl apply` computes the three-way merge once and then nothing checks it again until someone runs `kubectl apply` a second time. A GitOps controller re-runs this exact same computation on every reconcile cycle, turning a one-time merge into a continuously re-evaluated guarantee. The mechanism is identical; the frequency is what makes GitOps drift detection meaningful.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: When you intentionally remove a field from a Git manifest, does the three-way merge remove it from the live object? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Yes — a field present in `orig` but absent from `config` is a real signal to delete it, distinct from a field never in `orig` at all. The merge patch will include a removal instruction for that field. But confirm this against the actual sync result rather than assuming removal always propagates identically to a value change, since edge cases around list merging and patch strategies can differ.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does Server-Side Apply (SSA) differ from the annotation-based three-way merge in drift detection? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
SSA uses Kubernetes' `managedFields` — per-field-manager ownership tracking — instead of the `last-applied-configuration` annotation. Both solve the same problem ("which fields does this applier own"), but SSA is the newer, more precise mechanism. `gitops-engine`'s `Diff()` explicitly branches: when server-side diff is enabled, it calls `ServerSideDiff` instead of the annotation-based path.
  </div>
</div>

## Topic: Sync waves & hooks (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What determines the execution order of resources in Argo CD's sync engine? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
A four-key sort tuple: phase (PreSync, Sync, PostSync, SyncFail), then wave (from `argocd.argoproj.io/sync-wave` annotation, defaulting to Helm hook weight, then 0), then kind (using a built-in Kubernetes ordering table — Namespace before ConfigMap before Deployment, etc.), then name. This produces a total order even when no explicit wave annotations are set.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: How does the sync gate prevent the next wave from starting? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
On each reconcile tick, the loop isolates only the tasks belonging to the current lowest pending `(phase, wave)`. If any task from the current group is still running (`runningTasks.Len() > 0`), it returns immediately — the next wave's tasks are never even filtered or examined. The gate check happens before the next wave's task list is constructed.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: Do sync waves apply to hooks like PreSync and PostSync? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Yes — hooks are tasks tagged with a non-Sync phase. Multiple PreSync hooks with different `sync-wave` annotations are ordered relative to each other exactly the same way regular Sync-phase resources are, via the same wave/kind/name tiebreakers. A PreSync hook at wave 0 runs before a PreSync hook at wave 5.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens if two resources in the same wave have a dependency on each other? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The wave-gating mechanism only enforces ordering *between* waves — resources within the same wave are all submitted together (subject to the kind/name tiebreak for submission order, but without waiting for one to become healthy before the next starts). A genuine same-wave dependency needs to be split into separate waves; this mechanism can't resolve intra-wave ordering.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: When is the sync gate behavior skipped entirely? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
When `multiStep()` returns false — meaning the sync spans only a single phase/wave and contains no hooks. The gate exists specifically for multi-step sequences with real ordering dependencies; a plain one-wave manifest sync is allowed to behave like a non-blocking apply, so sync waves have a real performance cost only when they're actually being used for orchestration.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why is `kindOrder` important even when no explicit wave annotations are used? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
`Namespace` sorts before every other listed kind regardless of wave annotations, which is why "no explicit waves" still doesn't create resources in an unsafe order for common cases. A Namespace sorts before a ConfigMap which sorts before a Deployment, all at wave 0. The built-in table provides a sensible default that prevents most ordering issues without any user configuration.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: Should wave numbers be assigned as 0, 1, 2 or with gaps like 0, 10, 20? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Gaps like 0, 10, 20 are strongly recommended. If a newly-discovered ordering dependency needs to be inserted between two existing waves, gaps let you assign it a wave number (e.g., 5) without renumbering every existing wave annotation across the manifest set. Closely numbered waves leave no headroom for future insertions.
  </div>
</div>

## Topic: Automated sync, self-heal & pruning (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What prevents Argo CD's auto-sync from creating an infinite sync loop? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The `alreadyAttemptedSync` check. If the same revision was already synced successfully and self-heal is disabled, the controller stops. With self-heal enabled, it uses exponential backoff (`selfHealTimeout` / `selfHealBackoff`) with an attempt counter (`SelfHealAttemptsCount`). The backoff duration is computed as `backOff.Step()` run `selfHealAttemptsCount` times, so each retry waits longer than the previous one.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: When auto-sync is enabled but pruning is disabled, what happens if the only change is a resource removal? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The controller skips the sync. Guard 5 checks: if pruning is disabled and all OutOfSync resources `RequirePruning`, it's a prune-only action. Since `prune: false` means you explicitly chose not to delete resources, the controller respects that by not syncing when the only action would be deletion.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: Does self-heal sync the entire application or only the drifted resources? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Only the drifted resources. When self-heal triggers, it appends only the OutOfSync resources to `op.Sync.Resources`, not a full sync of the entire application. This limits the blast radius of each self-heal cycle to the specific fields that actually drifted.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What is the "wipe-out guard" in Argo CD's auto-sync? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
Before executing, if prune is enabled and **every** resource would be deleted, the controller blocks the sync to prevent accidental cluster wipeouts. The guard checks whether all resources `RequirePruning` — if so, it logs a warning and returns a `SyncError` condition instead of proceeding. You must explicitly set `allowEmpty: true` to override this.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What are the five guards in the `autoSync` function before a sync operation is created? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
(1) Is automated sync even enabled? (2) Is another operation already running? (3) Is the app being deleted? (4) Is the app actually OutOfSync? (5) If pruning is disabled, is this a prune-only action? Each must pass before any sync is attempted. These prevent double-sync, deletion-time conflicts, unnecessary syncs when already synced, and prune-only actions when prune is disabled.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why does self-heal only trigger when the Git revision hasn't changed? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
When the revision hasn't changed, the drift is in the cluster, not in Git — someone made a manual cluster-side change. If the revision *has* changed, that's a normal git-driven sync, handled by the standard auto-sync path. Self-heal specifically targets the "Git says one thing, cluster says another, and Git hasn't changed" scenario.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: What are the `*bool` pointer fields in `SyncPolicyAutomated`, and why are they pointers? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
`Prune`, `SelfHeal`, and `AllowEmpty` are all `*bool` (pointer to bool), not plain `bool`. A `nil` pointer defaults to `false` via helper methods like `GetPrune()` and `GetSelfHeal()`. This makes all behaviors strictly opt-in — you must explicitly set `true` to enable any of them, and `nil` (omitted) always means disabled.
  </div>
</div>

## Topic: App-of-Apps & ApplicationSets (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What problem do ApplicationSets solve that manually creating Application resources does not? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
At scale, the number of Applications grows quadratically (components × clusters × environments). Adding a new cluster or environment means editing or creating N manifests by hand. ApplicationSets separate parameter generation from Application rendering — one YAML generates N Applications from generators (list, cluster, git, matrix/merge), and the controller handles creation, updates, and garbage collection with owner references.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does the matrix generator differ from the merge generator? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The matrix generator computes the Cartesian product of two generators — if list A has 3 elements and list B has 2, you get 6 parameter sets. The merge generator combines results from two generators by matching on keys, producing a union rather than a product. You use matrix when you need every combination, merge when you need to enrich one generator's output with data from another.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens when an ApplicationSet generator returns zero results? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
No Applications are created. Existing Applications owned by the ApplicationSet are deleted only if the `syncPolicy` allows deletion. This is a safety behavior — a misconfigured generator that returns empty shouldn't silently delete all managed Applications unless you've explicitly opted into that.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does the ApplicationSet controller handle deletion of the ApplicationSet resource itself? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
It checks the sync policy to see if deletion is allowed. If `progressivesync.IsDeletionOrderReversed` is true (for RollingSync strategies), it performs a reverse-order deletion of Applications before removing the finalizer. If deletion isn't allowed, it removes owner references from the Applications instead, leaving them orphaned but intact.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What's the difference between App-of-Apps and ApplicationSets? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
App-of-Apps uses a parent `Application` whose Helm chart or Kustomize base renders child `Application` manifests. ApplicationSets use a dedicated controller that generates `Application` resources from parameter lists via generators. ApplicationSets are more composable — you can combine generators (matrix, merge) without writing templates — and have a more predictable lifecycle with explicit sync policies and owner references.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does `firstAppError` handle concurrent failures in ApplicationSet reconciliation? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
It returns the error from the lexicographically smallest application name. This gives a deterministic result when multiple goroutines may have recorded errors concurrently, matching the behavior of the original sequential loop where the first application in iteration order determined the returned error.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What annotations are preserved across Application updates by the ApplicationSet controller? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
`NotifiedAnnotationKey`, `AnnotationKeyRefresh`, and `AnnotationKeyHydrate` are preserved by default. Additionally, finalizer names `PreDeleteFinalizerName` and `PostDeleteFinalizerName` are preserved. These survive Application updates to prevent conflicts with user workflows like notifications and manual refreshes.
  </div>
</div>

## Topic: Helm charts: templating, releases & rollback mechanics (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3>Q: What does `helm rollback myapp 3` actually restore? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
The exact manifest, chart, and config from revision 3 — not "the last known good state." Helm's release history is an append-only ledger where every upgrade, rollback, and failed attempt gets its own numbered entry. The rollback reads revision 3's snapshot by version number, copies it into a *new* revision (currentVersion + 1), and applies that stored manifest directly to the cluster.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What's the difference between `Superseded` and `Failed` in Helm release history? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
`Superseded` means a later release was successfully created on top of this one — the release was live at some point but has been replaced. `Failed` means the release's apply step encountered an error and it was never the active `Deployed` release. Both are historical entries; `Superseded` indicates a release that was once live, `Failed` indicates one that never was.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens if you run `helm rollback myapp` without specifying a revision number? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
It defaults to `currentVersion - 1`, which might be the broken upgrade you're trying to escape if that upgrade was marked `Superseded` rather than `Failed`. Always pass an explicit revision number when the intent is to restore a known-good state, and use `helm history myapp` first to confirm which revision corresponds to the state you want.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: Does `helm rollback` re-render the chart from the original template or use the stored manifest? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
It uses the stored manifest directly — `prepareRollback()` copies `previousRelease.Manifest` (the already-rendered YAML) into the new release without re-rendering. This means a rollback restores the exact Kubernetes objects that existed at revision N, including any template rendering quirks or values that were current at that time. No re-rendering occurs.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does `RollbackOnFailure` in `helm upgrade` find its target? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
It searches the full release history for the most recent entry with status `Superseded` or `Deployed` — meaning the last release that actually succeeded — and triggers a rollback to that specific revision. If every previous release is `Failed` (e.g., a brand-new release where the first upgrade failed), `RollbackOnFailure` itself fails with "unable to find a previously successful release."
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How are Helm release revisions stored in Kubernetes? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
As Kubernetes Secrets with type `helm.sh/release.v1`. Each Secret's name is the release name, and labels encode `owner: helm`, `name: <release>`, `status: <status>`, and `version: <revision>`. The `List()` method fetches all Secrets with these labels and base64-decodes each one's `release` data field. The Secret store grows without bound until `MaxHistory` pruning kicks in during the next upgrade.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens to existing revisions when you rollback from revision 7 to revision 3? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Nothing — revisions 4, 5, 6, and 7 remain in the Secret store unchanged. Revision 7 gets marked `Superseded` and a new revision 8 is created containing revision 3's snapshot. Old entries are only pruned if `MaxHistory` is set and the total count exceeds it, in which case the *oldest* revisions are deleted, not the ones between the rollback source and current.
  </div>
</div>

## Topic: Config rendering in a GitOps pipeline: Kustomize overlays vs Helm charts (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3>Q: Why do Kustomize overlays produce cleaner diffs than Helm template conditionals? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Kustomize treats the base manifest as immutable YAML and applies strategic merge patches on top — no `{{ if }}` / `{{ else }}` sprawl. The diff between dev and prod is a small patch file describing only what changes, instead of a whole re-rendered manifest with conditional branches. Templates describe complete desired state for every environment simultaneously; patches describe only the delta.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: How does Kustomize's `PatchTransformerPlugin` prevent ambiguous patch formats? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
If a patch byte slice qualifies as both a strategic merge patch and a JSON 6902 patch, the engine rejects it with an error: "illegally qualifies as both an SM and JSON patch." This forces an unambiguous choice at authoring time, preventing a silently wrong merge when a YAML document could be interpreted as either format.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why does `kustomize build` need OpenAPI schema to apply patches correctly? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
The strategic merge patch format depends on the schema to distinguish between fields that are lists (merge by tag, e.g., `containers` merges by `name`) and fields that are maps (replace by key, e.g., `labels` replaces by key). Without `openapi.SetSchema`, Kustomize has no way to know whether to merge or replace a given field during patch application.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: Can Kustomize and Helm coexist in the same pipeline? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Yes. The `helmCharts` field in `kustomization.yaml` tells Kustomize to inflate a Helm chart at build time, then feed the rendered YAML into the patch pipeline. Helm's `{{ }}` templates resolve at `helm template` time (before Kustomize sees the YAML), while Kustomize's patches resolve at `kustomize build` time (after the base YAML is already pure Kubernetes resources).
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why is the `applySortOrder` pass important in `kustomize build`? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Applying a `Deployment` before its `Namespace` exists causes a transient error in `kubectl apply -f -`. The sort order pass ensures Namespaces appear before Deployments, CRDs before CustomResources. The `--reorder` flag (deprecated in favor of the `sortOptions` field) controls whether output follows legacy Kubernetes apply order or respects the depth-first input order.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: What's the performance tradeoff of Kustomize's overlay DAG vs. Helm's flat values merge? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
For any realistic cluster (under a few thousand resources), there is no meaningful difference. Kustomize's `ResMap` is an in-memory graph; the transform passes are O(n) in resource count. The overhead is dominated by YAML parsing, not patch application. Both tools handle thousands of resources without bottleneck.
  </div>
</div>

## Topic: Progressive delivery via GitOps (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3>Q: How does Flux's `ImageUpdateAutomation` know which image field to rewrite? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
It scans for marker comments (e.g., `# image: myapp`) embedded in the YAML manifests. The developer places a comment above the `image:` field, and the automation uses that marker to locate and replace only the tag portion of the following line. Without the marker, the automation silently skips the manifest — it can't find the field to rewrite.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What prevents the `ImageUpdateAutomation` controller from creating empty commits? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Three independent short-circuit gates: `syncNeeded` (checks if policies or Git repo have changed), `IsConcreteCommit` (a partial/non-concrete commit means the remote hasn't advanced), and `len(policyResult.FileChanges) == 0` (no files were modified by policy application). Any one of these conditions causes the controller to skip the commit entirely.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does Flux's image automation differ from Renovate or Dependabot for container tags? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Renovate and Dependabot update Docker base images and lock files but weren't designed to rewrite Kubernetes manifests in place across multiple services, and they don't integrate with Flux's reconciliation model. Flux's `ImageUpdateAutomation` lives inside the GitOps loop itself — it watches `ImagePolicy` objects, rewrites manifests with marker-based precision, commits, and pushes, all without leaving the Git-as-source-of-truth contract.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does the controller handle a failed Git push due to branch protection rules? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
`CommitAndPush` returns an error, the reconciliation fails, and the object gets a `Ready=False` condition with reason `GitOperationFailed`. The controller retries on its next interval. In practice, you'd configure the automation to push to a branch without protection rules, or use a dedicated bot account with push permissions.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does the `commitTemplate` work for batch image updates? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
It's a Go template — `{{range .Updated.Images}}{{println .}}{{end}}` iterates over all images that were updated in a single reconciliation. A batch update to five services produces one commit with five image references in the message, not five separate commits. This makes `git bisect` useful for finding which image change caused a regression.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why does the controller use a `latestImageChangePredicate` on the ImagePolicy watch instead of reacting to all status updates? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
It ensures the automation only re-reconciles when the resolved image actually changes — not on any status update, metadata change, or annotation. This prevents the controller from thrashing with unnecessary reconciliation loops even when dozens of policies are being reflected, keeping resource usage proportional to actual image changes.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens when two `ImageUpdateAutomation` controllers push to the same branch simultaneously? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The second push fails because the remote has advanced since the automation checked out the source. Flux handles this gracefully — the reconciler returns an error, triggers a requeue with backoff, and on the next tick checks out the now-updated branch (with the first automation's commit) and re-applies its policies. The two automations simply take turns.
  </div>
</div>

## Topic: Multi-cluster & multi-tenancy GitOps (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does Argo CD's cluster generator discover clusters at runtime? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
It queries the Kubernetes API directly for Secrets in the Argo CD namespace with the `argocd.argoproj.io/secret-type: cluster` label. Each matching Secret's `data.name`, `data.server`, and `data.project` fields are extracted into a parameter map. The user's `selector` is merged with this hardcoded label — you can never accidentally query non-cluster Secrets. The generator returns `NoRequeueAfter` and relies on an event handler to trigger re-reconciliation when Secrets change.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens to the local `in-cluster` when a label selector is used? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Any `selector` with `matchLabels` or `matchExpressions` automatically excludes the local cluster because the local `in-cluster` doesn't have a Secret with the `argocd.argoproj.io/secret-type` label. Without a selector, the local cluster is included as a fallback. If you want both local and remote with a selector, you must explicitly create a Secret for the local cluster.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does `flatList` mode differ from the standard cluster generator output? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
In standard mode, the generator produces N Applications — one per cluster. With `flatList: true`, it collapses everything into a single parameter map where `clusters` is an array of all matching cluster objects. This produces one Application that knows about all clusters (useful for multi-cluster services like service mesh control planes or observability collectors), rather than N independent Applications.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What happens if two cluster Secrets have the same `name` field? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
The generator deduplicates by cluster name — `getSecretsByClusterName` returns a map keyed on `name`, so the second Secret silently overwrites the first. Only one parameter set is emitted for that cluster name. Ensure cluster names are unique across Secrets to avoid silent data loss.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why is `nameNormalized` a separate parameter from `name`? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Kubernetes resource names have strict character rules (no underscores, lowercase only, etc.). A cluster named `my_cluster` would produce an invalid Application name `my_cluster-app`. `nameNormalized` sanitizes the name (replacing underscores with hyphens, for example) so template-generated resource names are always valid. Use `{{.nameNormalized}}` where the output goes into a Kubernetes resource name.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does the cluster generator detect new clusters — is it poll-based? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Not on a timer. The generator explicitly returns `NoRequeueAfter` and relies entirely on the `clusterSecretEventHandler` to trigger re-reconciliation when Secrets change. A newly registered cluster is picked up within seconds of its Secret being created, not on any polling interval. This is purely reactive event-driven behavior.
  </div>
</div>

## Topic: Environment promotion workflows (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does environment promotion work with Argo CD's Git generator? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Each file in a directory describes one environment's desired state (cluster, namespace, image tag, replicas). The Git generator reads all matching files and produces one parameter set per entry. Promoting a version means editing a file in `envs/` and committing — the ApplicationSet controller polls the repo, detects the changed file, and syncs only the affected Application.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What triggers Argo CD to re-read the Git repo for the file-based generator? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The ApplicationSet controller polls at a default interval of 3 minutes (`getDefaultRequeueAfter()`). You can override this with `requeueAfterSeconds` in the generator spec. There is no Webhook support for the Git generator — it's purely poll-based, so faster promotion requires lower `requeueAfterSeconds`.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What automatic parameters does the Git file generator inject? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
`path` (directory), `path.basename` (parent directory name), `path.filename` (file name), `path.basenameNormalized`, `path.filenameNormalized`, and `path.segments` (array of path components). For a file at `envs/production.yaml`, you get `path.basename` = `envs` and `path.filename` = `production.yaml` — useful for dynamic destination names or notification titles without custom logic.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does the directory-based Git generator differ from the file-based one? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The directory generator enumerates subdirectories instead of files. Each subdirectory becomes one parameter set. The `path.*` parameters are injected identically. Use directories when each environment has its own Kustomize overlay or Helm values file; use files when each environment is described by a simple YAML parameter file.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What happens if two environment files have the same name under the glob pattern? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
The generator uses `maps.Copy` which overwrites duplicate keys. Ensure each file path is unique under the glob pattern — otherwise the second file's parameters silently replace the first, and the first environment's Application gets updated with the wrong configuration.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why is script-driven promotion inferior to Git-commit-driven promotion? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Script-driven promotion (CI pipeline bumps a version, applies Kustomize overlay, runs `kubectl set image`) makes each step invisible outside the pipeline log — no audit trail, no built-in review, no single place to see who promoted what. Git-commit-driven promotion makes every change a commit with author, message, and full diff, turning promotion into a Git operation with a built-in audit trail.
  </div>
</div>

## Topic: GitOps vs push-based CI/CD (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3>Q: What are the five core problems with push-based CI/CD that Flux's pull-based model solves? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
(1) The CI runner holds cluster credentials — a leak is a production breach. (2) No continuous verification — `kubectl apply` is one-shot, drift goes undetected. (3) No automatic pruning — deleted manifests leave orphaned resources. (4) No built-in health gating — the pipeline applies and moves on without checking rollout success. (5) Multi-cluster is a credential distribution problem — every target cluster needs its own kubeconfig in the CI system.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does Flux's inventory tracking enable pruning? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The controller maintains an inventory — a snapshot of every resource it has applied. On the next reconcile, it diffs the old inventory against the new one. Resources in the old set but not in the new set are candidates for deletion, but only if `prune: true`. This is different from comparing Git to cluster — it compares *this revision's applied set* against *the previous revision's applied set*.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why does Flux use server-side apply (SSA) instead of client-side `kubectl apply`? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
SSA uses server-side field ownership to resolve conflicts — Flux declares which fields it owns via a field manager, and Kubernetes tracks ownership per-field in `managedFields`. Client-side apply uses a `last-applied-configuration` annotation that breaks when multiple controllers manage the same resource. SSA lets Flux own only the fields it declares, leaving other field managers' contributions intact.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does Flux take ownership away from `kubectl` when it applies? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The `fieldManagers` list in the apply options includes the `kubectl` manager for both `Apply` and `Update` operation types, plus `before-first-apply`. This tells Flux to take ownership of fields previously managed by `kubectl`. If someone manually ran `kubectl apply` to change a Deployment, Flux's next reconcile will overwrite those changes with the Git-declared state.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What's the architectural difference between Flux's Source Controller and Kustomization Controller? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
The Source Controller handles authentication to Git, fetches the repository, and stores the artifact. The Kustomization Controller consumes that artifact — it never talks to Git directly. This separation means the Kustomization CRD doesn't need Git credentials at all; it just references the source by name. The trust boundary is the cluster itself, not the CI system.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens to the cluster's state when the Source Controller can't reach Git? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The Kustomization Controller sees no new artifact and requeues at `DependencyRequeueInterval`. The last successfully applied revision continues running — no changes are made to the cluster until a valid artifact is available. This is the safe default: degrade by holding the last known good state, not by applying partial or missing manifests.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: What resource does Flux use to prevent path traversal during Kustomize builds? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
`MakeFsOnDiskSecureBuild(root)` restricts the file system to the artifact root directory, preventing a malicious `kustomization.yaml` from reading files outside the extracted tarball. Additionally, `kustomizeBuildMutex` serializes builds to work around a concurrent map read/write bug in upstream kustomize (`kubernetes-sigs/kustomize#3659`).
  </div>
</div>

## Topic: Secrets in a GitOps repo (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3>Q: Why doesn't External Secrets Operator store secret values in Git? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
A Kubernetes Secret's `data` field is base64-encoded plaintext, not encrypted. Committing raw Secrets commits actual credentials permanently into Git history, visible to anyone with repo read access. Even SealedSecrets encrypts values into ciphertext that still sits in Git forever and creates a second source of truth when the team already uses an external store like AWS Secrets Manager or Vault.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What does an `ExternalSecret` CRD actually contain? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
Zero secret material — it's purely declarative metadata: which store, which key, what refresh interval. It's safe to commit because `remoteRef.key: prod/database/password` is a path, not a credential. The actual plaintext lives in the external store and only reaches the cluster when the controller fetches it on the configured `refreshInterval`.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How does `refreshInterval` bound the latency of credential rotation? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
`getRequeueResult` computes `refreshInterval - timeSinceLastRefresh`, meaning a credential rotated at minute 59 of a 60-minute window propagates within 1 minute, not 60. The interval directly bounds the maximum staleness of a credential in the cluster. Teams designing around credential revocation SLAs need to understand this exact timing.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What's the difference between `CreatedOnce`, `OnChange`, and `Periodic` refresh policies? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
`CreatedOnce` fetches only on first successful sync and never re-fetches — correct for one-time bootstrap secrets, dangerous for database passwords. `OnChange` re-fetches only when the `ExternalSecret` object itself is modified (generation changed), not on a timer. `Periodic` (the default when `refreshInterval` is set) actually watches for store-side rotations on a timer — the only policy that catches credential rotation in the external store.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: What happens to the Kubernetes Secret if the external store is temporarily unreachable? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
The existing Secret stays as-is. The controller's `Reconcile` returns an error on fetch failure, which triggers a requeue with exponential backoff. The Secret isn't deleted or reverted. The `ExternalSecret` status shows a `SecretSynced=False` condition with the error message. Once the store becomes reachable again, the next successful reconcile updates the Secret.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why does the AWS Parameter Store provider use `gjson` for property extraction? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
AWS SSM Parameter Store stores each parameter as a single string. When a team stores a JSON blob (e.g., `{"host": "...", "port": "5432", "password": "..."}`) as one parameter, `gjson` lets the `ExternalSecret`'s `remoteRef.property` field extract just `password` from that blob — avoiding the need for three separate parameters for one logical credential.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What is the blast-radius difference between `SecretStore` and `ClusterSecretStore`? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
`SecretStore` is namespace-scoped — the auth credentials it references (service accounts, IRSA roles) are resolved within that namespace. `ClusterSecretStore` is cluster-wide and grants the controller access to secrets across all namespaces. A `ClusterSecretStore` using an IAM role with broad `secretsmanager:GetSecretValue` on `Resource: *` gives the controller access to every secret in the account, not just the ones referenced by `ExternalSecret` objects.
  </div>
</div>

## Topic: Observability & drift alerting for GitOps controllers (Order 13)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3>Q: Why did Flux v2.6 break teams' drift alerts? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
`gotk_reconcile_condition` was removed from the controller's metric output, and `gotk_reconcile_duration_seconds_count` lost its `result` label. PromQL queries that counted error reconciliations by filtering on `result!="success"` now fire on nothing. The controller still writes status conditions to the Kubernetes API server, but it no longer emits them as Prometheus gauges — you need kube-state-metrics to surface them instead.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What are the three status conditions on a Kustomization CRD that matter for drift alerting? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
`Ready` — transitions to `True` only after apply, prune, and health checks all pass; `False` with reasons like `HealthCheckFailed`, `ReconciliationFailed`, or `BuildFailed`. `Reconciling` — present while a reconcile is in progress, deleted on success. `Healthy` — set only when `spec.healthChecks` or `spec.wait` is configured; `True` when all referenced resources pass health checks.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why should drift alerts use `for:` durations that match the reconciliation interval? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
A single failed reconcile followed by a successful one on the next tick is usually a transient issue (API server hiccup, temporary network partition). Alerting on a single `False` sample creates noise. `for: 15m` with a 5-minute reconciliation interval catches three consecutive `False` samples — persistent drift, not a blip. `for: 30m` catches six consecutive failures for critical severity.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3>Q: How do you surface Flux condition data to Prometheus after v2.6? <span class="qa-badge qa-intermediate">[Intermediate]</span></h3>
  <div class="qa-a" markdown="1">
Configure kube-state-metrics with a `customResourceState` config that reads `status.conditions` from the Kustomization CRD. The config maps `[status, conditions, "[type=Ready]", status]` to a `ready` label on `gotk_resource_info`. This produces metrics like `gotk_resource_info{ready="False", reconciling="True"}` that PromQL can alert on, replacing the removed controller-emitted gauges.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What is the difference between `Ready=False` and `Reconciling=True`? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
`Ready=False` means the last completed reconciliation failed or the resource is unhealthy. `Reconciling=True` means a reconciliation is actively in progress right now. A resource can be `Ready=False` with `Reconciling` deleted (the last reconcile finished, failed, and the next hasn't started yet). A resource that is `Ready=False` AND `Reconciling=True` (reason `ProgressingWithRetry`) is currently being retried.
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3>Q: Why did Flux move conditions from controller-emitted Prometheus gauges to Kubernetes status conditions? <span class="qa-badge qa-expert">[Expert]</span></h3>
  <div class="qa-a" markdown="1">
Controller-emitted Prometheus gauges for conditions created a coupling between the controller's internal state machine and external monitoring. Reading conditions from the API server (via kube-state-metrics) decouples them and works for any consumer — Prometheus, notification controller, `kubectl get`, or any tool that reads the Kubernetes API — not just Prometheus. It's a cleaner separation of concerns.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3>Q: What does it mean when `lastAttemptedRevision` and `lastAppliedRevision` diverge? <span class="qa-badge qa-beginner">[Beginner]</span></h3>
  <div class="qa-a" markdown="1">
The controller attempted a reconciliation (`lastAttemptedRevision` is set) but it didn't succeed (`lastAppliedRevision` wasn't updated). This is a silent indicator of persistent drift — the controller is trying to reconcile to a new revision but failing, likely due to build errors, health check timeouts, or permission issues. Monitoring this divergence catches stuck reconciliations that a simple "Ready" check might miss.
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 88 across GitOps

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
  apply();
})();
</script>
