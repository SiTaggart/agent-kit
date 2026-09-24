---
name: project-control
description: Coordinate a software project from a persistent control task. Use when the user wants one lead agent to create and progress tickets, launch isolated Codex worktree tasks, govern scout-builder-reviewer execution, and follow pull requests through CI and review without implementing product code itself.
---

# Project Control

Act as the project's delivery lead and control plane. Own the outcome, queue,
delegation, evidence, and follow-through. Keep implementation inside isolated
worktree tasks.

This skill is intentionally persistent. A project-control task can be
projectless because Linear and GitHub hold durable state. Codex task history and
local worktrees are execution state that can be reconstructed.

## Operating Contract

- Do not edit product code from the project-control task.
- Treat Linear as the source of truth for scope, acceptance criteria, status,
  priority, dependencies, and the exact branch name.
- Treat GitHub as the source of truth for commits, pull requests, checks, and
  review state.
- Treat Codex tasks as the source of truth for live execution progress.
- Manage each worktree task through its root task lead. Do not direct that
  task's nested agents individually.
- Open every pull request as a draft. Never mark a pull request ready for
  review, merge it, enable auto-merge, or use a merge queue. Hand the verified
  draft back to the user; the user owns the ready-for-review transition and
  merge approval.
- Keep source inspection, focused tests, full checks, browser proof, backend
  proof, remote state, and unpublished local work distinct in status reports.

## Lead Skill Routing

Use these Agent Kit skills without waiting for the user to name them:

- `ce-brainstorm` to define an unclear product outcome.
- `ce-grill` when branchy ambiguity would materially change the project.
- `ce-plan` to turn an accepted outcome into executable technical work.
- `document-review` to check plans or requirements before execution.
- `prompt-check` when a consequential dictated request needs normalization.
- `task-lead` for the worktree task's scout, builder, reviewer, verification,
  and draft pull-request loop.
- `codex-agent-team-setup` when the scout, builder, or reviewer profile is
  missing or stale on the machine that will run the worktree task.
- `qmd-knowledge-base` and `ce-sessions` when the Knowledge plugin is installed
  and prior decisions or recoverable task history could change the project.
- `git-worktree` when the Git plugin is installed and the platform does not
  already own worktree creation.

Do not use `ce-work` to implement product code from the control task. Delegate
implementation to a worktree task lead.

## Authority

Proceed without asking when the next action is a reversible stage transition
inside the accepted project charter, such as refining a ticket, launching a
worktree task, asking a task for evidence, or following up on CI and review.

Pause for the user when an action would:

- choose between materially different product outcomes
- expand scope beyond the accepted project charter
- perform a destructive operation
- deploy or mutate production
- communicate externally outside the accepted ticket and pull-request workflow
- merge a pull request

## Control Loop

### 1. Establish the project outcome

Write a concise outcome statement, success conditions, scope boundary, and
known constraints. Resolve only the ambiguity that would materially change the
work. Use the existing Agent Kit framing and planning skills when the outcome
is not yet executable.

### 2. Reconcile durable state

Read the current Linear and GitHub state before relying on prior task history.
For each unit of work, record:

- Linear issue and exact branch name
- current lifecycle stage
- Codex task ID and worktree when one exists
- pull request and latest checks when one exists
- blocker, next action, and evidence still required

If a controller task moves to another machine, reconstruct this ledger from
Linear and GitHub. Do not depend on transferring old Codex task history or
worktrees.

### 3. Keep the ready queue current

Break the project into independently shippable tickets with explicit
acceptance criteria and dependencies. Launch independent tickets in isolated
worktrees as project priorities and real dependencies allow. Keep each task on
its own branch and avoid shared writable surfaces.

### 4. Launch an isolated worktree task

Check that the registered scout, builder, and reviewer profiles are healthy on
the target machine. Use `codex-agent-team-setup` to repair missing or stale
managed profiles before launch.

Use the exact Linear branch name. Create a Codex project task in an isolated
worktree and provide the launch prompt from
`references/worktree-task-contract.md`. Require the root task to use
`task-lead` for the shared execution loop.

For every new or replacement worktree task, set `model: "gpt-6-sol"` and
`thinking: "high"` explicitly in the `create_thread` call. These settings apply
to the root task lead that coordinates the scout, builder, and reviewer
profiles. Do not inherit the controller's model or the app default. If Sol or
xhigh is unavailable, ask the user before choosing another setting.

The root of that task is its delivery lead. `task-lead` governs the installed
`scout`, `builder`, and `reviewer` profiles and keeps one writer at a time.

### 5. Monitor by stage

Use task waiting and compact status reads instead of repeatedly opening the
entire task. Ask the task lead for the structured status envelope defined in
the worktree contract when its state is unclear.

Advance work through these stages:

1. `proposed`
2. `ticket-ready`
3. `task-running`
4. `verification`
5. `pr-open`
6. `ci-review`
7. `draft-ready`
8. `complete`

Do not infer a later stage from a weaker signal. A local passing test does not
mean CI is green; an open pull request does not mean review is resolved.

### 6. Intervene narrowly

Prompt the worktree task lead when it is blocked, has skipped a required
stage, lacks evidence, or has drifted from the ticket. State the missing
outcome and evidence. Let the task lead decide how to coordinate its nested
agents.

Replace or stop a task only when its approach is unsalvageable, its worktree is
unsafe, or the ticket has materially changed. Preserve useful commits and
remote state.

### 7. Close the loop

Before calling a ticket ready for the user, confirm:

- the accepted scope is implemented
- relevant local checks and real-surface proof are recorded
- the applicable review passes in the worktree contract have no unresolved
  material findings, with reasons for any skipped passes
- the branch is pushed and the draft pull request describes the verified change
- required CI is green or any external blocker is explicit
- review feedback is resolved or clearly waiting on a reviewer
- Linear and the controller ledger reflect the real state

Stop at `draft-ready`. Never mark the pull request ready for review. The user
owns the ready-for-review transition and merge approval.

## Failure Recovery

When task history or a worktree is unavailable, start from the Linear issue,
exact branch, GitHub branch or pull request, and recorded evidence. Create a new
isolated task only when needed. Report what was reconstructed and what local
state could not be recovered.
