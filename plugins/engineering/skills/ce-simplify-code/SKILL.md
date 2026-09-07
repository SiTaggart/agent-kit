---
name: ce-simplify-code
description: "Use when the user asks to simplify, refactor, clean up, reduce duplication, or remove unnecessary complexity from recently changed code. Also use after a substantial refactor or rewrite to check behavior preservation, reuse, and resulting complexity before completion."
argument-hint: "[blank to simplify current branch changes, or describe what to simplify]"
---

You are the simplification lead. Your job is to make changed code easier to
understand, maintain, and trust while preserving exact behavior.

Simplification is not line-count golf. Prefer readable, explicit code over dense
cleverness. Preserve outputs, errors, side effects, timing, ordering,
persistence, IO, and public contracts unless the user explicitly asks for a
behavior change.

## Non-Goals

Do not:

- redesign adjacent product behavior
- broaden the scope beyond what the user named or the current diff requires
- add abstractions just to make the code look organized
- inline helpers that give a real domain concept a useful name
- remove testability, type safety, observability, or ownership boundaries
- weaken or delete tests to make simplification pass

## Step 1: Identify Scope

Resolve the simplification scope in this order:

1. If the user explicitly named a scope, use that scope. Treat it as
   authoritative and do not widen it.
2. Otherwise, in a git repository, default to the current branch diff against
   its base branch, such as `git diff origin/main...`. If there is no clear base
   ref, fall back to staged plus unstaged changes.
3. Outside a git repository, review the most recently modified files mentioned
   by the user or edited earlier in the conversation.

If the scope is empty, ask what to simplify rather than guessing.

## Step 2: Identify The Behavior Contract

Before editing, state the behavior that must remain identical:

- inputs and outputs
- error behavior
- side effects and ordering
- persisted state, URL state, backend payloads, or rendered output
- public API, exported type, component, hook, command, or CLI behavior

If you cannot explain what behavior is being preserved, do more local reading
before editing.

## Step 3: Use Focused Readers When Useful

For tiny scopes, you may do the read yourself. For non-trivial diffs, broad file
sets, unfamiliar domains, or changes with subtle behavior, hand context to one
or more focused subagents and fold their reads back into the main thread.

Subagents are advisors, not owners. The parent thread keeps taste, decides which
findings matter, makes the edits, and verifies behavior.

Useful reader lenses:

- **Local Prior Art** — did the changed code miss an existing local primitive,
  convention, type, or trusted utility it should reuse?
- **Clarity And Shape** — honest boundaries, derived-not-duplicated state,
  flatter control flow, dead-code removal. Do not collapse meaningful concepts:
  a helper that names a real business rule, boundary, or invariant may be
  clearer than inlining it.
- **Runtime And Side Effects** — preserved cost, concurrency, ordering,
  cleanup, and persistence; no new hot-path work or check-then-use races.

Each reader returns only actionable findings with file/line evidence, why the
simplification helps, and any behavior-preservation risk. Readers do not edit
files.

## Step 4: Decide And Edit

Fold the reader findings into your own judgment. Accept changes that improve
comprehension, remove real duplication, align with local patterns, or reduce
meaningful waste while preserving the behavior contract.

Skip or reject findings when they:

- optimize for fewer lines over faster comprehension
- require a behavior change
- cross an ownership boundary outside the accepted scope
- remove an abstraction whose purpose is still real
- depend on uncertainty that would need product input

Good simplification moves include:

- replacing duplicate logic with an established local helper
- naming intermediate values when it clarifies intent
- moving deterministic shaping into a named helper, selector, parser, or reducer
- flattening control flow with guard clauses or explicit state transitions
- deleting comments that narrate obvious code
- tightening helper signatures so dependencies are honest
- consolidating near-duplicate logic when one shared concept truly exists

Before applying each edit, confirm it preserves the same output, errors, side
effects, and ordering for the relevant inputs.

## Step 5: Verify

After edits:

1. Read back the changed lines.
2. Run the relevant typecheck and lint checks for the touched surface.
3. Run tests scoped to the changed behavior. Broaden tests when a shared helper,
   public API, or hot path changed.
4. If the simplification affects UI behavior or rendered output, verify the
   closest real route, story, or preview surface in a browser when available.

If no test, lint, or typecheck surface exists, state that explicitly. Do not
pretend command success proves user-facing behavior when the changed contract
needs a real surface.

## Step 6: Summarize

Briefly report:

- what stayed unchanged behaviorally
- what was simplified
- what checks or real surfaces were verified
- any skipped findings and why they were not worth changing

If the code was already clean, say so and list the checks performed.

## Step 7: Recommend The Next Step

After the summary, recommend what to run next and fire it, following the
shared menu conventions (see `../ce-conventions/SKILL.md`) — including the
sub-step guard: when `ce-quality-gate`, `ce-work`, or another skill invoked
this as a sub-step, return the summary and let the caller route.

Gate the options on the outcome: changed-but-ungated code → `ce-quality-gate`
on the touched files (recommended); already gated or substantial/risky →
`ce-review`, or `git-commit-push-pr` / `git-commit` for a narrow,
already-clean change; a surfaced behavior risk or product question →
`ce-debug`, or pause for product input rather than shipping.
