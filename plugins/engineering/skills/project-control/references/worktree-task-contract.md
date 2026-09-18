# Worktree Task Contract

Use this contract when creating an isolated Codex task for a Linear issue.

## Launch Prompt

```text
You are the delivery lead for this worktree task.

Outcome: <accepted outcome>
Linear issue: <identifier and URL>
Exact branch: <branch name from Linear>
Acceptance criteria:
- <criterion>

Scope boundaries:
- <included or excluded boundary>

Required proof:
- <focused checks>
- <real-surface proof when applicable>

Own the task from repository discovery through a verified draft pull request.
Follow the repository instructions and use the appropriate Agent Kit skills.

As the worktree delivery lead, use these skills without waiting for the project
controller to name them:

- `ce-work` for final integration or genuinely trivial direct implementation.
- `ce-quality-gate` across the integrated diff after behavioral proof.
- `ce-review` directly only when the reviewer profile is unavailable.
- `git-commit-push-pr` when the Git plugin is installed and the change is ready
  to publish. Explicitly require it to create a draft pull request.
- `babysit-pr`, `ce-triage-pr-feedback`, and `resolve-pr-feedback` when the Git
  plugin is installed and the open pull request needs follow-through.

Explicitly orchestrate these installed Codex profiles:

1. Spawn `scout` for bounded, read-only reconnaissance. Give it the issue,
   likely ownership boundary, and the evidence it must return. Its profile owns
   the default research-skill routing; name an override only when the task needs
   another specialist.
2. After integrating the scout's findings, spawn `builder` for the bounded
   implementation. Give it the accepted contract, allowed surface, and focused
   proof. Its profile owns the default work-skill routing. Keep one writer at a
   time.
3. Integrate and inspect the builder's work yourself. Run the changed-code
   quality gate and the closest real proof surface.
4. Spawn `reviewer` for an independent, read-only review of the resulting diff
   against the issue and proof. Its profile owns the default review-skill
   routing; name a specialist only when the review needs one.
5. Resolve valid findings through a bounded builder pass or directly when the
   fix is trivial. Re-run affected proof and reviewer checks as needed.
6. Commit, push, and open the pull request as a draft only after the work is
   proven. Never mark it ready for review, merge it, or enable auto-merge. The
   user owns the ready-for-review transition and merge approval.

Keep at most two nested agents active. Do not allow nested agents to spawn more
agents, commit, push, open pull requests, mutate tickets, or use destructive git
commands. You remain responsible for scope, integration, proof, and reporting.

You may work directly when the change is genuinely trivial or a profile is
unavailable, but report the skipped role and reason. Do not silently omit the
scout, builder, or reviewer stages for ordinary implementation work.

When asked for status, return the status envelope below exactly enough that the
project controller can reconcile it with Linear and GitHub.
```

## Status Envelope

```text
Stage: <task-running|verification|pr-open|ci-review|draft-ready|complete>
Ticket: <Linear issue and current status>
Branch: <exact branch and whether it is pushed>
PR: <URL and draft state, or none>
Completed: <concise completed work>
Proof: <source inspection, focused tests, full checks, browser/backend proof, CI>
Blocked on: <specific blocker, or none>
Next: <single next action>
Needs from controller: <decision or action, or none>
```

## Controller Boundary

The project controller communicates with the worktree task lead, not its scout,
builder, or reviewer. The task lead owns nested-agent prompts, integration, and
local recovery. The controller owns project priority, ticket state, cross-task
dependencies, and pull-request follow-through.
