---
layout: page
title: "Git Interview Questions: 35 Real-World Q&A from Production Manifests"
description: "35 interview-ready Git questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/git/
---

Bite-sized, standalone interview questions and answers for Git. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">35</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: The object model (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Beginner] What is Git fundamentally — a folder of file versions, or something else? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Git is a content-addressed object database with a DAG of commits and a layer of movable refs (pointers) on top, not a folder of file versions. Every object — blob, tree, commit, tag — is addressed by its SHA-1 hash, and history is the set of objects reachable by following parent pointers. Those three ideas (objects, refs, DAG) explain every Git command.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Beginner] What happens internally when you run `git commit`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Git writes each changed file as a blob (zlib-compressed bytes named by `SHA-1("blob <size>\0" + content)`), writes a tree listing every path and its blob/subtree hash, then writes a commit object holding that tree hash, the parent hash(es), author/committer, and message. Finally it moves the current branch ref to point at the new commit. The snapshot is reconstructed later by walking those hashes.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Concept — What is the difference between a blob, a tree, and a commit? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A blob is the raw zlib-compressed bytes of one file with no name or path; a tree lists (mode, filename, object-hash) entries pointing at blobs or subtrees, capturing one commit's directory structure; a commit holds a tree hash, zero-or-more parent hashes, author/committer, and a message. A commit points to one top-level tree, which recursively references every file in the repo at that moment.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Concept — What makes Git's object store "content-addressed" and tamper-evident? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Every object is named by the SHA-1 of its content, so identical content always yields the same hash and is stored once, and any byte change produces a different hash. Because a commit's hash also covers its parent hash, editing an old commit changes its hash and ripples forward to every descendant. The DAG is therefore tamper-evident: you cannot silently alter history.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] What is a "DAG" in Git and why does that shape matter? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A DAG (directed acyclic graph) is Git's history: each commit points back to its parent(s) via hashes, edges run child-to-parent, and there are no cycles. A commit with two parents is a merge commit; the root commit has none. This shape is what makes branching cheap (a branch is just a pointer into the graph) and rebase possible (replaying commits re-roots subtrees).

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Concept — Why are Git objects immutable while branches are not? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Objects are immutable and content-addressed: once written, a blob, tree, or commit never changes, and its hash is its identity. Refs, by contrast, are mutable pointers into the object graph — moving a branch just rewrites a 40-character file under `refs/heads/`. That separation is the whole game: history is the set of objects reachable from a ref, and "history" changes when the ref moves, not when objects change.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Branching & history (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Beginner] What is a Git branch, really? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A branch is not a copy of files — it is a plain ref file under `refs/heads/` whose contents are the 40-char hash of the commit it points to. Creating a branch writes one tiny file; moving a branch just rewrites that file to a new commit hash, so branches are cheap. The branch "grows" because every new commit updates the ref to the new commit's hash.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Concept — What is HEAD and what does it mean for HEAD to be "detached"? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
HEAD is a special ref saying where you are: normally it points at a branch name (e.g. `ref: refs/heads/main`), so new commits advance that branch. When HEAD points directly at a commit hash instead of a branch, you are in detached HEAD state — commits still get created as objects but no branch ref moves to track them.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Beginner] What is a detached HEAD and why is it dangerous for new work? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A detached HEAD means HEAD holds a raw commit hash rather than a branch, which happens when you check out a tag, a past commit, or a remote ref. Commits made in this state exist as objects but are on no branch, so the tip ref does not move — unless you create a branch from them, they become unreachable and are eventually pruned. Fix it with `git switch -c save-my-work` before you lose the tip.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Concept — What's the difference between a lightweight tag and an annotated tag? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A lightweight tag is just a ref file pointing straight at a commit, storing no extra metadata. An annotated tag is a full Git object (like a commit) holding a target hash, tagger name/date, and an optional message, addressed by its own SHA-1. Use annotated tags for releases so the tag itself records who created it and when.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Expert] How do the three "trees" — working tree, index, and HEAD — relate? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The working tree is the checked-out files on disk where you edit; the index (staging area) holds the next tree to be committed as a flattened path→blob-hash map; and HEAD points at the current commit. `git add` moves content from working tree into the index, `git commit` snapshots whatever is in the index, and `git reset`/`checkout` move content between them. Understanding these three splits is what makes `add`/`reset`/`checkout` predictable.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Remotes & collaboration (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Beginner] Concept — What is the difference between `git fetch` and `git pull`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`fetch` only downloads objects and updates remote-tracking refs (`origin/main`) — it never touches your branches or working tree. `pull` is `fetch` plus an integration step (merge or rebase) onto your current branch, which can rewrite your working tree and surface conflicts. Fetch is safe and read-only; pull is the operation most likely to surprise you.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Concept — What is a remote, and what are remote-tracking refs? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A remote is a named, bookmarked URL (default `origin`) for another repository you fetch from or push to. Git stores remotes under `refs/remotes/<remote>/` as read-only tracking refs that mirror the remote's branches after a fetch. The remote is just a pointer to a location; the actual data lives in your local object database once fetched.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Scenario — You ran `git pull` and got a conflict. What happened and what do you do? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`pull` is fetch plus integration, and a conflict means the same region of a file changed differently on both sides so Git couldn't auto-pick a winner. Git wrote both versions into the file with `<<<<<<<` / `=======` / `>>>>>>>` markers and paused in a MERGING state. Edit the file to the correct result, `git add` it to clear the marker, then continue — don't abort blindly.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Concept — What is the difference between a remote-tracking ref and a tracking branch? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A remote-tracking ref (`origin/main`) is a read-only mirror updated by fetch — you never commit to it directly. A tracking branch is a local branch configured to follow that remote-tracking ref, so ahead/behind counts and default push/pull targets work automatically. Upstream is the linked remote-tracking ref, stored as `branch.<name>.remote` and `branch.<name>.merge` — purely local metadata.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Tradeoff — Why is a push sometimes rejected as non-fast-forward, and what's the rule about force-push? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A remote accepts a push only if it is a fast-forward — your history must contain the remote's current tip — so it never silently clobbers others' work. A non-fast-forward is rejected, and force-push (`--force`, or safer `--force-with-lease`) overrides this and can discard the remote's commits. The rule: never rewrite commits that have left your machine; only force-push history nobody else has pulled.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] Scenario — You need to switch branches but have uncommitted work. What tool helps? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`git stash` temporarily shelves your working-tree and index changes onto a stack (the ref `refs/stash`) without committing, so you can switch branches and reapply later. Under the hood Git creates objects for the working-tree and index states, sometimes as a merge commit to capture untracked files. `git stash pop` reapplies and drops the entry; `git stash list` shows what is saved.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: Rebase vs merge (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Beginner] Concept — What does `git merge` do, and what is a merge commit? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Merge combines two divergent histories by creating a commit with two parents — the tips of the branches being joined. The merge commit's tree is the result of a three-way merge using the two tips and their nearest common ancestor (the merge base). Because the branch refs are untouched, merge preserves the original DAG exactly as it happened.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] Concept — What is a fast-forward, and when does it happen? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A fast-forward happens when the target branch has no commits the current branch lacks and the current branch is an ancestor of the target; instead of creating a merge commit, Git simply moves the ref forward to the same commit. The history stays linear and no new object is created. Pass `--no-ff` to force a real merge commit even when a fast-forward is possible, preserving a record that a feature branch existed.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] Concept — What does `git rebase` actually do under the hood? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Rebase replays a sequence of commits onto a new base by computing each commit's diff against its parent, then applying that diff in order onto the new base and creating new commits with new hashes. The old commits still exist in the object database (reachable via reflog) until pruned, but the branch ref now points at the rewritten chain. The history is rewritten, not moved.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Tradeoff — Why do commit hashes change after a rebase? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A commit's hash covers its parent hash, so replaying a commit onto a new base changes its parent, which changes its hash. The content diff is preserved but the object identity is not — the same logical edits get fresh SHA-1s. This is the root of the "never rebase a shared branch" rule: teammates' old hashes no longer exist on your branch.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Tradeoff — When should you rebase versus merge? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Prefer merge for shared history and rebase to tidy local work. Rebase rewrites history with new hashes, so doing it on a branch teammates already pulled makes their history diverge and pushes get rejected as non-fast-forward. Rebase private feature branches onto `main` to get a clean linear history; merge shared branches to preserve the actual divergence that happened.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] Comparison — How is `git cherry-pick` related to rebase? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Cherry-pick applies the diff introduced by a single existing commit onto the current HEAD as a brand-new commit with a new hash — effectively a one-commit rebase. Git computes the change between that commit and its parent, then replays it. The result is the same logical edit but a different object with its own author/committer timestamps.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Expert] Scenario — You rebased a feature branch that a teammate already pulled. What breaks? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Because rebase creates new commit hashes, your branch's history now diverges from theirs: their old hashes are "missing" from your branch and a push is rejected as non-fast-forward. Your teammate's local history no longer lines up with the rewritten chain, so they must reconcile. The rule is absolute: never rebase commits that have left your machine.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

## Topic: Internals & recovery (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] Concept — What is the reflog and why is it your safety net? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The reflog is a per-ref (and global HEAD) append-only log of every place a ref has pointed, with a timestamp and the command that moved it. It is local to your repository and is what makes "lost" commits recoverable — a hard reset or rebase leaves the old tips in HEAD's reflog for 30–90 days. `git reflog` is the standard escape hatch when you think you destroyed commits.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] Scenario — You ran `git reset --hard <commit>` and lost commits. Can you get them back? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`reset --hard` moves the branch ref and overwrites your index and working tree to match that commit, discarding later edits and commits. Those commits aren't deleted immediately — they linger in the reflog for weeks but are no longer on any branch, so they look gone. Recover with `git reset --hard HEAD@{1}` or by branching from the old hash before they expire and get pruned.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Comparison — What's the difference between `reset --soft`, `--mixed`, and `--hard`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Soft moves only HEAD's branch ref, leaving index and working tree untouched; mixed (the default) moves the ref and resets the index to match the target but keeps working-tree files; hard resets all three, discarding working-tree changes. The target commit is unchanged in every mode — what moves is where the branch points and what the index/tree contain. Hard mode is how commits get "lost" until recovered from the reflog.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] Concept — What happens during a merge conflict and how do you resolve it? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
When the same region of a file changed differently on both sides, Git cannot auto-pick a winner and writes both versions into the file wrapped in `<<<<<<<` / `=======` / `>>>>>>>` markers, then stops in a "MERGING" state. You edit the file to the correct result, `git add` the resolved file to tell Git the conflict is cleared, then continue the merge or rebase. Conflicts mean the two histories genuinely diverged at that spot.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Expert] Concept — What is `git bisect` and why is it efficient? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Bisect is a binary-search tool over the commit DAG to find which commit introduced a bug: you mark a known-good and a known-bad commit, and Git checks out the midpoint for you to test. Each "good" or "bad" answer halves the remaining suspect range, so N commits need only ~log2(N) tests. `git bisect run` automates the whole loop with a test script.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Concept — What are Git hooks and what can they do? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A hook is a script placed in `.git/hooks/` (or configured centrally) that Git executes at a lifecycle point — `pre-commit`, `commit-msg`, `pre-push`, `post-checkout`, and others. Hooks let you enforce linting, block bad commit messages, or trigger deploys, but they are local and not transferred with the repo unless you commit them into a hooks directory and install them. They are the in-repo extension point for policy and automation.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

## Topic: Revert, recovery & advanced (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] What is the difference between `git revert` and `git reset`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`git reset` moves the branch pointer backward, potentially discarding commits (with `--hard`) and rewriting history. It's safe only on local branches no one else has pulled. `git revert` creates a new commit that undoes the changes from a previous commit — the original commit stays in the history, and the branch pointer only moves forward. Use revert on shared branches (main, develop) because it doesn't rewrite history; use reset on local feature branches where you want to clean up.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] How do you recover a deleted branch? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Run `git reflog` to find the hash of the last commit on the deleted branch — reflog records every HEAD movement for about 90 days. Then either `git checkout -b recovered-branch <hash>` to recreate the branch, or `git reset --hard <hash>` to move the current branch to that point. The key insight: Git doesn't immediately delete commit objects when a branch is deleted; they become unreachable but remain in the object store until garbage collection runs.

<p class="qa-link">[Full post →]({{ '/git/git-101/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Expert] What is `rerere` and when would you use it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`rerere` (Reuse Recorded Resolution) is a Git feature that remembers how you resolved a merge conflict and auto-resolves the same conflict the next time it appears. Enable it with `git config rerere.enabled true`. It's most useful for long-lived feature branches that rebase frequently onto main — each time you rebase, the same conflicts recur, and rerere applies your previous resolution automatically. It records resolutions in `.git/rr-cache/` and can be trained on complex conflicts.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Intermediate] What is a refspec and how does push/pull use it? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A refspec maps a local ref to a remote ref, formatted as `+<src>:<dst>` (the `+` allows non-fast-forward). When you run `git push origin main`, Git uses the default refspec to map your local `main` to `origin/main`. You can customize this for advanced workflows: `git push origin main:refs/heads/production` pushes your main to a different remote branch. Fetch refspecs control which remote branches are downloaded and under what local names.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: [Beginner] What is `git submodule` and when should you use it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A submodule embeds one Git repository inside another at a specific commit. The parent repo records the submodule's commit hash (not its contents), so you must run `git submodule update --init` after cloning to fetch the submodule's code. Use submodules for vendoring a dependency you don't control, or sharing code across repos without merging. The downside: every clone requires an extra step, and updating the submodule is a manual process. Modern alternatives include monorepos or package managers.

<p class="qa-link">[Full post →]({{ '/git/git-key-terms/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 35 across Git

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
