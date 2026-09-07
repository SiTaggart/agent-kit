---
name: babysit-pr
description: Keep an open pull request green and ready for its author to merge. Use when asked to babysit, watch, shepherd, or maintain a PR after it opens.
---

# Babysit a PR

Continuously monitor the pull request associated with this worktree and task
until it closes or merges.

Keep the PR mergeable. Keep CI green, triage and resolve code review comments,
and rebase merge conflicts. The PR author performs the merge.

## Workflow

1. Check the PR state, CI, unresolved review comments, and mergeability.
2. For CI failures, use an installed GitHub CI-fix companion.
3. For new unresolved review comments, run `ce-triage-pr-feedback`.
4. For triaged resolutions approved by the user, run `resolve-pr-feedback` with
   the approved comment IDs or URLs.
5. For merge conflicts, run `resolve-pr-merge-conflicts`.
6. Check the PR again and repeat from step 2.

## Wait and monitor

Use the host's wait mechanism to schedule the next check. Stop when the PR
closes or merges.
