### Opening a PR

Read the installed plugin's [RUNTIME.md](../../../RUNTIME.md) first. Its native tool, model, path, and session-authorization rules apply. The user merges; this port never merges, enables auto-merge, or enters a merge queue.

Invoked at the end of every other playbook.

Work from a git worktree off trunk, and keep unrelated work out of it. A native subagent that writes gets an exclusive worktree. Preserve user edits. Rebase into small, landable commits. Run the bundled `$deslop` over the diff before commit.

Title: `type(scope): subject`, naming a real symbol when one carries the change. Body: a one-minute briefing under 40 lines with these `##` headings in order, dropping empty ones: `## Why`, `## What changed`, `## Scope`, `## Tradeoffs` (only rejected alternatives a reviewer would otherwise ask about), `## Blast Radius`, `## Verification`.

Stack follow-ups by base branch. Open PRs ready, never as a draft. When the run provides a PR tool, use it and request ready status with the argument its schema documents. Without one, use `gh pr create` without `--draft`, or `origin pr create --status open` when Origin's CLI resolves the repository. Opening a PR does not start a babysit.
