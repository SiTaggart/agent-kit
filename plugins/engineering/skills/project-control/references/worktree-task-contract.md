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
- `ce-quality-gate` across the integrated diff after the final review fix.
- `ce-review` directly only when the reviewer profile is unavailable.
- `repoprompt-multi-review` only when explicitly requested; run it from this
  lead task because it commissions its own independent reviewers.
- `git-commit-push-pr` when the Git plugin is installed and the change is ready
  to publish. Explicitly require it to create a draft pull request.
- `ce-triage-pr-feedback` and `resolve-pr-feedback` when the Git plugin is
  installed and the open pull request needs approved feedback addressed.

Explicitly orchestrate these installed Codex profiles:

1. Spawn `scout` for bounded, read-only reconnaissance. Give it the issue,
   likely ownership boundary, and the evidence it must return. Its profile owns
   the default research-skill routing; name an override only when the task needs
   another specialist.
2. After integrating the scout's findings, spawn `builder` for the bounded
   implementation. Give it the accepted contract, allowed surface, and focused
   proof. Its profile owns the default work-skill routing, including applicable
   language taste before code-shape decisions. Keep one writer at a time.
3. Integrate and inspect the builder's work yourself. Run the changed-code
   quality gate and the closest real proof surface before review.
4. Ask `reviewer` to run `ce-review` on the integrated diff against the issue
   and proof. Let it select and dispatch review lenses under `ce-review`'s own
   instructions. Give material findings to `builder` in a bounded pass. Re-run
   affected proof and ask the reviewer to check the fixes. Repeat until the
   current diff has no unresolved material findings.
5. For substantive code changes, ask `reviewer` for a separate
   `ce-thermo-nuclear-code-quality-review` pass. Resolve structural findings
   through `builder`, then recheck this pass. Revisit `ce-review` when a fix
   changes behavior or ownership boundaries.
6. After the structural pass, ask `reviewer` for a separate
   `ponytail:ponytail-review` pass when that plugin is installed. Apply cuts
   through `builder` only when they preserve the contract and make the result
   smaller. Recheck the cuts and affected proof.
7. Run the final quality gate, including applicable `code-taste` for TypeScript
   or React and `spade-python-taste` for Spade Python services, and the closest
   real proof after the last fix. Revisit any earlier review pass affected by
   the final fixes. Commit, push, and open the pull request as a draft only
   after the work is proven. Never mark it ready for review, merge it, or enable
   auto-merge. The user owns the ready-for-review transition and merge approval.

For a genuinely trivial change without structural or deletion risk, the task
lead may skip the thermo or Ponytail pass and state why. Do not run a taste
skill for a language the diff does not touch. Classify each finding as a fix,
an evidence-backed rejection, or an out-of-scope deferral. A pass is satisfied
when no accepted finding remains unresolved and the current diff and affected
proof support that result. Do not restart every pass for a local fix that
cannot affect its verdict.

Do not allow nested agents to commit, push, open pull requests, mutate tickets,
or use destructive git commands. You remain responsible for scope, integration,
proof, and reporting.

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
Proof: <source inspection, focused tests, final quality gate including applicable taste, browser/backend proof, CI>
Review: <ce-review, thermo, Ponytail: passed, pending, or skipped with reason>
Blocked on: <specific blocker, or none>
Next: <single next action>
Needs from controller: <decision or action, or none>
```

## Controller Boundary

The project controller communicates with the worktree task lead, not its scout,
builder, or reviewer. The task lead owns nested-agent prompts, integration, and
local recovery. The controller owns project priority, ticket state, cross-task
dependencies, and pull-request follow-through.
