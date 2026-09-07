---
name: resolve-pr-merge-conflicts
description: Resolve a PR that conflicts with its base branch by rebasing onto the base and force-pushing with lease — never a merge commit. Use when a PR is out of date or has conflicts with main, when GitHub shows "This branch has conflicts that must be resolved", or when the user asks to rebase a branch, update a branch against main, or resolve PR conflicts.
allowed-tools: Bash(git *), Bash(gh *), Read, Edit
---

# Resolve PR Merge Conflicts

> **Rebase-only. Never a merge commit.**
> A PR that conflicts with its base is fixed by replaying this branch's commits on top of the updated base (`git rebase`), then `git push --force-with-lease`. `git merge <base>`, `git pull` without `--rebase`, and any move that lands a **merge commit** on the branch are forbidden — the goal is linear history. When a rebase gets hard, the only escape is `git rebase --abort`, never a merge. Plain `git push --force` is also forbidden; always `--force-with-lease`.

**Asking the user:** where a step says "ask the user", use the platform's blocking question tool (fall back to a question in chat when the tool is unavailable).

## Context

**In Claude Code** the labeled sections below are pre-populated — use them directly. **On other platforms** run the fallback block.

**Current branch:**
!`git branch --show-current`

**Working tree + in-progress state:**
!`git status`

**Remote default branch:**
!`git rev-parse --abbrev-ref origin/HEAD 2>/dev/null || echo 'DEFAULT_BRANCH_UNRESOLVED'`

**PR state:**
!`gh pr view --json url,title,state,baseRefName,mergeable 2>/dev/null || echo 'NO_OPEN_PR'`

### Context fallback

```bash
printf '=== BRANCH ===\n'; git branch --show-current; printf '\n=== STATUS ===\n'; git status; printf '\n=== DEFAULT_BRANCH ===\n'; git rev-parse --abbrev-ref origin/HEAD 2>/dev/null || echo 'DEFAULT_BRANCH_UNRESOLVED'; printf '\n=== PR ===\n'; gh pr view --json url,title,state,baseRefName,mergeable 2>/dev/null || echo 'NO_OPEN_PR'
```

---

## Step 1: Preflight

Resolve the base branch from the PR's `baseRefName`. If there is no PR, use the default branch (strip the `origin/` prefix; if it returned `DEFAULT_BRANCH_UNRESOLVED` or bare `HEAD`, try `gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'`, else fall back to `main`).

Stop conditions — report and stop rather than improvise:

- **On the base branch itself** (not a feature branch) — nothing to rebase.
- **A `merge` is already in progress** (status shows "You have unmerged paths"
  from a merge, or a `MERGE_HEAD` exists) — stop and show the user the current
  state. Ask whether to abort that merge and restart with a rebase. Never abort
  automatically; the in-progress resolution may contain user work.
- **A `rebase` is already in progress** — you are resuming; skip to Step 3.
- **Dirty working tree** with uncommitted changes — a rebase requires a clean tree. Ask the user whether to commit the changes first or `git stash` them (and reapply after). Do not proceed until clean.

Then fetch the latest base:

```bash
git fetch origin
```

If `git merge-base --is-ancestor origin/<base> HEAD` succeeds, the branch is already on top of the base — there is nothing to rebase. Report and stop.

## Step 2: Rebase onto the base

```bash
git rebase origin/<base>
```

If it completes with no conflicts, go to Step 4.

## Step 3: Resolve conflicts, then continue

For each conflicted file: open it, resolve every conflict marker by hand so the result is correct (keep both intents where both are needed — do not blindly take one side), then `git add <file>`. When all conflicts in the current step are staged:

```bash
git rebase --continue
```

Repeat for each replayed commit until the rebase finishes.

If a step is genuinely unresolvable, or the same conflicts keep recurring across commits, or you are not confident the resolution is correct — **abort and re-approach**:

```bash
git rebase --abort
```

`--abort` returns the branch to exactly where it started, losing nothing. From there, either retry (e.g. `git rebase origin/<base> -X ...`, or interactively drop/reorder) or ask the user how to resolve. Never resolve a hard rebase by merging.

## Step 4: Force-push with lease

The rebase rewrote this branch's commits, so its history diverges from the remote. Push with lease so a teammate's concurrent push is not clobbered:

```bash
git push --force-with-lease
```

If it is rejected because the remote moved, `git fetch origin` and inspect what changed before re-attempting — do not fall back to plain `--force`.

## Step 5: Verify and report

Confirm the branch is now on top of the base with linear history and no merge commit introduced:

```bash
git log --oneline --graph -15
git merge-base --is-ancestor origin/<base> HEAD && echo "on top of base"
```

The graph must be a straight line (no fork/merge nodes) and the ancestor check must pass. Report the branch, the base it was rebased onto, how many commits were replayed, and the PR URL. If a PR is open, note that it should now show no conflicts.
