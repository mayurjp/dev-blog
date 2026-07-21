---
layout: post
title: "Git Key Terms: Commits, Branches, and the Object-Model Vocabulary Behind Every Post"
description: "A standalone glossary of Git terms used across this blog's version-control posts — the object model, refs, rebase, merge, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: git
order: 99
tags: [git, glossary, version-control]
---

**TL;DR:** This is the vocabulary behind every Git post on this blog — what a commit actually *is* (a content-addressed object), what a branch actually *is* (a movable ref), and the machinery of DAGs, refs, rebase, and remotes. Each term stands alone; jump to whichever one you hit in another post.

## Object model

### commit
A commit is a content-addressed object in Git's object database (`objects/`), addressed by the SHA-1 hash of its own contents — not by a name or a sequence number. Its content contains a pointer to exactly one tree (the snapshot), zero or more parent commit hashes, an author, a committer, and a message. Because the hash covers the parents, changing history changes the hash, which is why history edits ripple forward.

### tree
A tree object stores the directory structure of a single commit snapshot: a list of (mode, filename, object-hash) entries, where each entry points either to a blob (a file) or to another tree (a subdirectory). A commit points to one top-level tree, and that tree recursively references every file in the repository at that moment. Trees are themselves content-addressed, so unchanged subtrees are shared across commits by hash.

### blob
A blob is the lowest-level object: the raw bytes of a file's contents (the object itself is zlib-compressed on disk), with no name, no path, and no metadata. Git hashes the content (with a small header, `blob <size>\0`) to get the blob's SHA-1, so two identical files anywhere in history collapse to one blob. Git stores blobs in `objects/` and never stores deltas at this layer — delta compression is a later packfile optimization.

### annotated tag
An annotated tag is a full Git object (like a commit) holding a target object hash, a tagger name/date, and an optional message; it is addressed by its own SHA-1. A lightweight tag, by contrast, is just a ref file pointing straight at a commit and stores no extra metadata. Use annotated tags for releases so the tag itself carries who created it and when.

### SHA-1 / object hash
Every object — blob, tree, commit, tag — is named by the SHA-1 of its content, a 40-hex-character string such as `e7d7...`. This makes the object store content-addressed: identical content always yields the same hash and is stored once, and any byte change produces a different hash. Git uses the first few characters (the "short hash") as a human abbreviation, relying on uniqueness within the repo.

### DAG
A Directed Acyclic Graph is the shape of Git's history: each commit points back to its parent(s) via hashes, edges point from child to parent, and there are no cycles. A commit with two parents is a merge commit; the root commit has none. The DAG is what makes branching cheap (a branch is just a pointer into this graph) and rebase possible (replaying commits is re-rooting subtrees).

## Branching & history

### branch (ref)
A branch is not a copy of files — it is a plain ref file under `refs/heads/` whose contents are the 40-char hash of the commit it currently points to. Creating a branch writes one tiny file; moving a branch just rewrites that file to a new commit hash. The branch "grows" automatically because every new commit updates the ref to the new commit's hash.

### HEAD
HEAD is a special ref that says *where you are*: normally it points at a branch name (e.g. `ref: refs/heads/main`), so new commits advance that branch. When HEAD points directly at a commit hash instead of a branch, you are in detached HEAD state. Reading `HEAD` is how Git knows which ref to update when you commit.

### detached HEAD
A detached HEAD means HEAD holds a raw commit hash rather than a branch reference, which happens when you check out a tag, a past commit, or a remote ref. Commits made in this state still exist as objects but are not on any branch, so the tip ref does not move — unless you create a branch from them, they become unreachable and are eventually pruned. Useful for read-only inspection but a trap for new work.

### merge (merge commit)
A merge combines two divergent histories by creating a commit with two parents — the tips of the branches being joined. The merge commit's tree is the result of a three-way merge using the two tips and their nearest common ancestor (the merge base). Because the branch refs are untouched, merge preserves the original DAG exactly as it happened.

### fast-forward
A fast-forward is what happens when the target branch has no commits the current branch lacks and the current branch is an ancestor of the target; instead of creating a merge commit, Git simply moves the ref forward to point at the same commit. The history stays linear and no new object is created. Pass `--no-ff` to force a real merge commit even when a fast-forward is possible, to keep a record that a feature branch existed.

### rebase
Rebase replays a sequence of commits onto a new base commit by computing each commit's diff against its parent, then applying that diff in order onto the new base and creating *new* commits with new hashes. The old commits still exist in the object database (reachable via reflog) until pruned, but the branch ref now points at the rewritten chain. This rewrites history, so rebasing commits that others have already pulled causes divergence.

### cherry-pick
Cherry-pick applies the diff introduced by a single existing commit onto the current HEAD as a brand-new commit with a new hash. It is effectively a one-commit rebase: Git computes the change between that commit and its parent, then replays it. The result is the same logical edit but a different object, with its own author/committer timestamps.

### revert
`git revert` creates a new commit that undoes the changes from a previous commit. Unlike `reset`, it doesn't rewrite history — safe for shared branches. The undone commit remains in the history. This is the standard way to undo on shared branches.

### reflog
The reflog is a per-ref (and global HEAD) append-only log of every place that ref has pointed, with a timestamp and the command that moved it. It is local to your repository and is what makes "lost" commits recoverable — a hard reset or rebase leaves the old tips in `HEAD`'s reflog for 30–90 days. `git reflog` is the standard escape hatch when you think you destroyed commits.

## Remotes & collaboration

### staging area / index
The index (or staging area) is a file, `.git/index`, that holds the next tree to be committed: a flattened snapshot of every path mapped to a blob hash. `git add` updates the index to match working-tree files; `git commit` snapshots whatever is currently in the index. This is why Git has a three-way split — working tree, index, and committed tree — rather than committing files directly.

### working tree
The working tree is the checked-out set of files on disk where you actually edit — the materialized version of one commit plus your uncommitted changes. Git compares the working tree against the index to compute what `git add` would stage, and against HEAD to show `git status`/`git diff` output. Everything outside `.git/` is the working tree.

### remote
A remote is a named, bookmarked URL (default `origin`) for another Git repository you fetch from or push to. Git stores remotes under `refs/remotes/<remote>/` as read-only tracking refs that mirror the remote's branches. A remote is just a pointer to a location; the actual data lives in your local object database after a fetch.

### fetch
Fetch downloads objects and refs from a remote into your local database without touching your working tree or branches. It updates remote-tracking refs (e.g. `origin/main`) to match the remote but never moves your own branches. Fetch is safe and read-only — it is the first half of `pull` and the recommended way to see what others changed before integrating.

### pull
Pull is `fetch` followed by a second integration step — usually `merge`, or `rebase` if configured. It brings the remote's commits into your local branch by fast-forwarding or creating a merge commit (or replaying your work on top, in rebase mode). Because it can rewrite your working tree, `pull` is the operation most likely to surface conflicts.

### push
Push uploads your local objects to a remote and asks the remote to update its refs to match yours. The remote accepts a push only if it is a fast-forward (your history contains the remote's current tip); a non-fast-forward is rejected to avoid clobbering others' work. Force-push (`--force`, or safer `--force-with-lease`) overrides this and can discard the remote's commits.

### upstream
An upstream is the remote-tracking ref a local branch is linked to — set with `--set-upstream` or `-u` on first push — so `git pull`/`git push` know where to fetch from and push to without extra arguments. It is stored in the branch's config as `branch.<name>.remote` and `branch.<name>.merge`. Upstream is purely local metadata; it does not exist on the remote itself.

### tracking branch
A tracking branch is a local branch configured to follow a remote-tracking ref, so ahead/behind counts and default push/pull targets work automatically. The remote-tracking ref (`origin/main`) is itself a read-only mirror updated by fetch, not a branch you commit to directly. When you check out `main` and it tracks `origin/main`, Git reports "Your branch is ahead by 2 commits."

### stash
Stash temporarily shelves your working-tree and index changes onto a stack (the ref `refs/stash`) without committing, so you can switch branches and reapply later. Under the hood Git creates objects for the working-tree and index states, sometimes as a merge commit to capture untracked files. `git stash pop` reapplies and drops the entry; `git stash list` shows what is saved.

## Internals

### conflict
A conflict occurs during merge, rebase, or cherry-pick when the same region of a file was changed differently on both sides and Git cannot pick one automatically. Git writes both versions into the file wrapped in `<<<<<<<` / `=======` / `>>>>>>>` markers and stops the operation in a "MERGING" state until you resolve it manually. After editing, `git add` the resolved file to tell Git the conflict is cleared.

### reset (soft / mixed / hard)
Reset moves the current branch ref (and, depending on mode, the index and working tree) to a given commit. Soft moves only HEAD's branch ref, leaving index and working tree untouched; mixed (the default) moves the ref and resets the index to match the target, but keeps working-tree files; hard resets all three, discarding working-tree changes — which is how commits get "lost" until recovered from the reflog. The target commit is unchanged; what moves is where the branch points and what the index/tree contain.

### bisect
Bisect is a binary-search tool over the commit DAG to find which commit introduced a bug: you mark a known-good and a known-bad commit, and Git checks out the midpoint for you to test. Each "good" or "bad" answer halves the remaining suspect range, so N commits need only ~log2(N) tests. `git bisect run` automates the whole loop with a test script.

### hook
A hook is a script placed in `.git/hooks/` (or configured centrally) that Git executes at a lifecycle point — `pre-commit`, `commit-msg`, `pre-push`, `post-checkout`, and others. Hooks let you enforce linting, block bad commit messages, or trigger deploys, but they are local and not transferred with the repo unless you commit them into a `hooks` directory and install them. They are the in-repo extension point for custom policy and automation.

### submodule
A git repository embedded inside another repository at a specific commit. The parent repo records the submodule's commit hash, not its contents. Useful for vendoring dependencies or sharing code across repos, but adds operational complexity (must `git submodule update` after clone).

### worktree
`git worktree` lets you check out multiple branches simultaneously in separate directories. Useful for working on a hotfix while keeping your feature branch intact, or for running CI on one branch while developing on another. Less disruptive than stashing.

### rerere
"Reuse Recorded Resolution" — when enabled (`git config rerere.enabled true`), Git remembers how you resolved a merge conflict and auto-resolves the same conflict the next time it appears. Useful for long-lived feature branches that rebase frequently.

---

*This glossary is grounded in Git's actual internals as implemented in the [git/git](https://github.com/git/git) repository — the object store, refs, and DAG mechanics described here are the same ones the `git` command operates on.*
