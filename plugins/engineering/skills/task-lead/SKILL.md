---
name: task-lead
description: Lead one scoped software task through scout, builder, reviewer, verification, and a draft pull request. Use when the user requests a task lead or this full workflow, or when project-control delegates a worktree task.
---

# Task Lead

Own one accepted task from repository discovery through a verified draft pull
request. This skill runs in the current Codex task. It does not need a
`project-control` parent or a Linear issue.

## Establish the task

- Identify the outcome, acceptance criteria, scope boundary, and closest real
  proof surface. Read repository instructions and current worktree state.
- If the task has a Linear issue, read its current scope and exact branch name
  before editing. Use that branch. Without an issue, use a suitable feature
  branch for the draft pull request; do not invent a Linear issue.
- Keep the work isolated from unrelated changes. Use the current worktree when
  it is suitable, or establish an isolated worktree before implementation.
  Preserve uncommitted work, inspect any existing pull request for this branch,
  and never push to the default branch.
- Check that the Codex `scout`, `builder`, and `reviewer` profiles are available.
  Use `codex-agent-team-setup` when installed profiles need repair. If a role
  cannot run, do its work directly and report the skipped role and reason.

Use `ce-work` for final integration or a genuinely trivial direct edit, and
`ce-quality-gate` on the integrated diff. Use `git-commit-push-pr` when the Git
plugin is installed and explicitly require a **draft** pull request. These
steps are authorized by the user's request to run the task-lead workflow to a
draft PR; do not infer authority to deploy, merge, or expand the task.
Run `repoprompt-multi-review` from the lead task only when explicitly requested;
it commissions its own independent reviewers.

## Run the agent loop

1. Spawn `scout` for bounded, read-only reconnaissance. Give it the task,
   likely owner boundary, and evidence to return. Its profile chooses the
   relevant research skills.
2. Use the scout's findings to give `builder` the accepted contract, allowed
   files or owner boundary, and focused proof. Its profile chooses the work
   skills and applicable language taste. Keep one writer at a time.
3. Inspect and integrate the builder's work yourself. Run the changed-code
   quality gate and the closest real proof surface before review.
4. Ask `reviewer` to run `ce-review` on the integrated diff, acceptance
   criteria, and proof. Let `ce-review` choose its own review lenses. Send
   material findings to `builder` in a bounded fix pass, rerun affected proof,
   and ask `reviewer` to check the fixes. Repeat until no material finding
   remains unresolved.
5. For substantive code changes, ask `reviewer` for a separate
   `ce-thermo-nuclear-code-quality-review` pass. Resolve structural findings
   through `builder`, then recheck this pass. Revisit `ce-review` when a fix
   changes behavior or ownership boundaries.
6. After the structural pass, ask `reviewer` for a separate
   `ponytail:ponytail-review` pass when installed. Apply cuts through `builder`
   only when they preserve the contract and make the result smaller. Recheck
   the cuts and affected proof.
7. Run the final quality gate, including `code-taste` for touched TypeScript or
   React and `spade-python-taste` for touched Spade Python services. Repeat the
   closest real proof after the last fix. Revisit any review pass affected by
   final changes.

For a genuinely trivial change without structural or deletion risk, you may
skip the thermo or Ponytail pass and state why. Classify each finding as a fix,
an evidence-backed rejection, or an out-of-scope deferral. A pass is satisfied
when no accepted finding remains unresolved on the current diff. Do not rerun
an unaffected pass merely because another pass found a local fix.

Nested agents do not commit, push, open pull requests, mutate tickets, or use
destructive Git commands. The task lead owns scope, integration, proof, Git
publication, and reporting. Work directly only for a genuinely trivial change
or when a profile is unavailable; use `ce-review` directly if the reviewer
profile cannot run, and explain any skipped role.

## Publish and follow through

After proof and review, commit, push, and open or update the draft pull request.
Never mark it ready for review, merge it, enable auto-merge, or use a merge
queue. The user owns the ready-for-review transition and merge approval.

Check required CI and actionable review feedback on the draft. Use
`ce-triage-pr-feedback` and `resolve-pr-feedback` when installed and applicable.
Route fixes through the builder, recheck affected proof and review, then push
the updated branch. Stop at a verified draft with green required checks and no
unresolved material findings. If CI or external review is still pending, report
the exact state and next action without calling the task complete.

Keep source inspection, focused tests, full checks, browser or backend proof,
remote CI, and unpublished local work distinct in the final report. Include
the branch, draft PR URL, completed scope, proof, review passes, and any blocker.
When a project controller exists, also use its requested status envelope; the
controller owns project priority, ticket state, and cross-task dependencies.
