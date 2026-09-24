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
Follow the repository instructions and use $task-lead for the scout, builder,
reviewer, verification, and draft pull-request loop. Explicitly require
`git-commit-push-pr` to create a draft pull request when that skill is used.
Use `repoprompt-multi-review` only when explicitly requested; it commissions
its own independent reviewers from this lead task.

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
Proof: <source inspection, focused tests, final quality gate including applicable taste, browser/backend proof, CI>
Review: <ce-review, thermo, Ponytail: passed, pending, or skipped with reason>
Blocked on: <specific blocker, or none>
Next: <single next action>
Needs from controller: <decision or action, or none>
```

## Controller Boundary

The project controller communicates with the worktree task lead, not its scout,
builder, or reviewer. The task lead owns nested-agent prompts, integration, and
local recovery. The controller owns project priority, ticket state, and
cross-task dependencies. Both read the same draft pull-request state; the task
lead owns fixes and proof in its worktree.
