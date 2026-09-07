---
name: ce-work
description: Execute implementation work with a compact product-contract loop. Use when the user asks to build, fix, implement, polish, or finish a scoped task. Favor reasoning, prior art, smallest correct changes, focused tests, and real-surface proof. Do not run autonomous PR, CI, ticket, or residual-work pipelines.
argument-hint: "[task description, issue/PR reference, or plan path]"
---

# Focused Work Execution

Ship the accepted task without turning the work into a ceremony.

## Core Contract

Before editing, identify:

- **Product contract** - the user action, UI state, backend payload, URL state, persisted state, rendered output, command behavior, or artifact that should change
- **Business reason** - why this matters to the user or product, inferred when obvious and asked when behavior would otherwise be ambiguous
- **Owner boundary** - the component, hook, helper, schema, endpoint, command, or document surface that should contain the fix
- **Proof surface** - the closest real place where the changed contract can be verified

Keep that contract visible while working. Completeness means finishing that contract, not expanding into neighboring workflows.

## Non-Goals

Do not do these from this skill unless the user explicitly asks:

- create or switch branches
- commit, push, open PRs, edit PR bodies, watch CI, or file tickets
- run old autonomous shipping pipelines
- create residual-work artifacts
- force `ce-plan`, `ce-review`, `ce-simplify-code`, or broad process stages as
  required phases; `ce-quality-gate` is the exception for code-writing tasks
  because it owns touched-file mechanical quality
- split a narrow product fix into broad process stages
- route work to many subagents when the parent agent can reason through it directly

## Context Delegation

`ce-work` owns the accepted product contract, scope control, final integration,
proof surface, and final report. Use subagents to keep bulky specialist context
out of the parent thread, not to outsource product judgment. Delegate when a
subtask is independently bounded, has low file overlap with other slices, and
would require loading substantial specialty context; keep the handoff narrow
(contract, owner boundary, allowed files, local patterns, expected proof, what
to return) and let the parent integrate, read changed lines, and run the gate.
Skip delegation for tiny edits, single obvious files, product decisions, final
integration, and proof that must be interpreted against the accepted contract.

Parallel writing subagents share one physical checkout unless each gets its own
worktree. When more than one dispatched subagent will write files, either give
each writer an isolated worktree (`git-worktree`) or put shared-tree discipline
in every handoff: write only the assigned files, never run `git stash`,
`git checkout`, or `git reset`, and re-read a file immediately before editing
it. Dispatch a slice that others import from (shared types, schemas, foundation
modules) first and wait for it to finish before starting dependents.

Dispatch map — per `../ce-conventions/SKILL.md` §Sub-agent dispatch: spawn a
sub-agent that loads the named skill (or reads its SKILL.md by absolute path
where sub-agents cannot load skills) or reads the named persona file, expanded
to an absolute path by the parent; run inline when sub-agents are unavailable:

- `references/frontend-implementation-expert.md` for non-trivial React or UI
  slices; it owns taste routing inside its slice, the parent keeps visual
  proof and the gate.
- `../ce-review/references/reviewers/testing.md` (test-strategy mode) when the
  main work is designing or reshaping a test suite.
- the `repo-research-analyst` skill for scoped repo reconnaissance (first
  prompt line: `Scope: <comma-separated scopes>` — see its SKILL.md for the
  scope names); `repoprompt` when the parent needs curated file context to
  reason directly.
- the `docs-researcher` skill when current framework/API behavior materially
  affects the approach.
- `references/documentation-specialist.md` for substantial documentation
  artifacts.
- `ce-debug` is the canonical loop for bugs, failing tests, regressions, and
  stack traces — do not recreate it here.

## Step 1: Understand The Task

Read the prompt, relevant plan or issue, recent conversation, and current repository state. A plan document is context, not an execution script — preserve its scope boundaries without mechanically mirroring every section as a task. For a bare request, infer the likely files and behavior from the repository; ask only when the answer would materially change product behavior, ownership boundary, data model, or risk. State the contract and owner boundary before editing when the change affects product behavior.

## Step 2: Find Prior Art

Use local knowledge and repository context in this order:

1. Existing code in the affected area
2. Nearby tests and fixtures
3. Project instructions such as `AGENTS.md` and `CLAUDE.md`
4. `qmd-knowledge-base` when intent, expected behavior, ownership, convention,
   or history is unclear
5. Official external docs only when the task depends on current external API behavior

Look for the mature local pattern, not just the first similar file. If the area is prototype-like, use it to understand the contract but set the quality bar from the best nearby production code.

## Step 3: Choose The Smallest Sound Approach

Prefer a direct fix at the owner boundary.

1. Can an existing owner component, hook, helper, schema, or command already represent the behavior?
2. Can the fix be a focused change to a pure helper, selector, parser, reducer, state transition, schema, or adapter?
3. Does this need UI behavior, backend/request behavior, URL/persistence behavior, or test harness changes?
4. Would a proposed abstraction remove real complexity, or is it only packaging?

Weigh the clean-slate option alongside the direct fix and compare by resulting complexity, not diff size; when the larger-surface change is the simpler end state, surface both options and the tradeoff. Pause before crossing into adjacent UX, validation, styling, data modeling, or infrastructure — ask whether that broader contract is actually desired.

Route TypeScript/React shape decisions through `code-taste` and Spade Python service decisions through `spade-python-taste` while choosing the approach, not after the fact. For frontend work in the parent thread, use an installed design companion when available, match the existing design system, and verify the changed route, story, or preview visually when one exists.

## Step 4: Implement In Tight Loops

Work in small enough steps that failures stay local, running the most relevant focused check before moving far from a file.

If a loop reveals the approach is wrong — the seam fights you, the fix needs growing special cases, or a simpler structure becomes visible — stop and back out rather than patching forward. Re-approach from the better structure; work already done is not a reason to keep a worse design.

## Step 5: Test The Right Seam

Test the lowest meaningful seam that proves the behavior.

Good proof surfaces include:

- parser, schema, selector, reducer, hydrator, compiler, or validator tests
- hook or command tests when the behavior lives at an effect boundary
- integration tests when layers interact
- request/response tests for backend contracts
- browser or local preview proof for UI state and rendered output
- readback of published docs or generated artifacts when the output is a document

Avoid tests that only prove mocked wiring. If the change affects what a user does in the UI, try those exact actions in the browser after the last code change — passing tests are not a substitute.

If full-repo checks are noisy, make the touched surface clean and report unrelated baseline noise separately.

## Step 6: Run The Quality Gate

After code edits, use `ce-quality-gate` on the current diff or explicit touched file list. Completion requires this gate. It does not replace product proof, browser proof, or review of substantial work.

## Step 7: Review The Diff

Before calling the task done, review your own diff with the same taste bar as `ce-review`:

- Does the implementation satisfy the product contract?
- Is the data flow traceable?
- Is there less code that would do the same thing as clearly?
- Did the fix stay inside the right owner boundary?
- Are tests and real-surface proof proportional to risk?

Invoke `ce-review` only when the change is substantial, risky, or the user asks for a review. Treat its output as advice to reason about, not a machine queue to apply blindly.

## Step 8: Finish Clearly

If the input was a plan artifact and the accepted work is complete, update the
plan status before reporting:

- Markdown plans: change the YAML frontmatter field from `status: active` to
  `status: completed`.
- HTML plans: change the visible `<span class="status">active</span>` value to
  `completed`.
- Do not edit plan body content, implementation units, checkboxes, or
  retrospective notes as part of this flip.
- Do not mark a plan completed when work is blocked, partially shipped, or
  intentionally deferred to the user.

Finish with a concise report: what changed, what product contract is now true, what checks or proof passed, what was not verified and why, and any narrow follow-up genuinely outside the accepted contract.

Then recommend the next step for what the work actually produced and fire it via the platform's blocking question tool (see `../ce-conventions/SKILL.md`): `ce-review` for substantial or risky unreviewed change (`deep` for a stricter audit), `git-commit-push-pr` or `git-commit` when clean and proven, `ce-simplify-code` when a non-trivial simplification remains, `ce-compound` when a durable lesson surfaced. Never route to ship while behavior is unproven. If `ce-quality-gate` already routed forward in this session, defer to that handoff.

## Non-Code Work

For documents, research, specs, and generated artifacts, the same loop applies: identify the artifact contract and canonical destination, gather prior art, produce the artifact, read it back or inspect the rendered output, and report what was verified. When the canonical surface is an external system (Linear, GitHub, Google Docs, Obsidian), treat local markdown as a working copy until the published version is read back.

## Failure Handling

When blocked, report the exact command, route, API, file, or dependency that blocked verification, what narrower proof did pass, and the next action that would unblock the accepted contract. Do not convert a blocker into a workaround when the real fix is within reach.
