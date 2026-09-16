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

Own the task from repository discovery through a ready pull request. Follow the
repository instructions and use the appropriate Agent Kit skills.

Explicitly orchestrate these installed Codex profiles:

1. Spawn `scout` for bounded, read-only reconnaissance. Give it the issue,
   likely ownership boundary, named research skill or persona when useful, and
   the evidence it must return.
2. After integrating the scout's findings, spawn `builder` for the bounded
   implementation. Give it the accepted contract, allowed surface, applicable
   implementation skill, and focused proof. Keep one writer at a time.
3. Integrate and inspect the builder's work yourself. Run the changed-code
   quality gate and the closest real proof surface.
4. Spawn `reviewer` for an independent, read-only review of the resulting diff
   against the issue and proof. Give it the appropriate review skill or persona.
5. Resolve valid findings through a bounded builder pass or directly when the
   fix is trivial. Re-run affected proof and reviewer checks as needed.
6. Commit, push, and open the pull request only after the work is proven. Never
   merge or enable auto-merge.

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
Stage: <task-running|verification|pr-open|ci-review|waiting-for-merge|complete>
Ticket: <Linear issue and current status>
Branch: <exact branch and whether it is pushed>
PR: <URL and state, or none>
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
