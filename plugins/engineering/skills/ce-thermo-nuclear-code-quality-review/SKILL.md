---
name: ce-thermo-nuclear-code-quality-review
description: Run an extremely strict maintainability review for abstraction quality, giant files, and spaghetti-condition growth. Use for a thermo-nuclear code quality review or an especially harsh maintainability audit.
disable-model-invocation: true
---

# Thermo-Nuclear Code Quality Review

An unusually strict review of implementation quality, maintainability, and
codebase health. Above all, be **ambitious** about structure: do not stop at
local cleanup — actively search for "code judo" moves, restructurings that
preserve behavior while making the implementation dramatically simpler,
smaller, and more direct.

## Core Prompt

> Perform a deep code quality audit of the current branch's changes.
> Rethink how to structure / implement the changes to meaningfully improve code quality without impacting behavior.
> Work to improve abstractions, modularity, reduce Spaghetti code, improve succinctness and legibility.
> Be ambitious, if there is a clear path to improving the implementation that involves restructuring some of the codebase, go for it.
> Be extremely thorough and rigorous. Measure twice, cut once.

## Standards

- **Structural ambition.** Look for reframings that make whole branches,
  helpers, modes, or layers disappear. Prefer the solution that feels
  inevitable in hindsight, and prefer deleting complexity over rearranging it.
- **The 1k-line rule (hard).** Do not let a PR push a file from under 1,000
  lines to over 1,000 without a very strong reason. Ask for decomposition
  first; waive only for a compelling structural reason with the file still
  clearly organized.
- **No spaghetti growth.** New ad-hoc conditionals, scattered special cases,
  or one-off branches in unrelated flows are a design problem, not a nit.
  Push the logic into a dedicated abstraction, state machine, or module
  instead of tangling an existing path.
- **Clean the design, not just the diff.** If behavior can stay the same
  while the structure gets meaningfully cleaner, push for the cleaner
  version. Removing moving pieces beats spreading the same complexity around.
- **Direct and boring beats hacky and magical.** Flag thin wrappers, identity
  abstractions, and generic mechanisms that hide simple data-shape
  assumptions.
- **Type and boundary cleanliness.** Question unnecessary optionality,
  casts, `any`/`unknown`, and ad-hoc object shapes. A silent fallback papering
  over an unclear invariant means the boundary should be explicit.
- **Canonical layer and helper reuse.** No feature logic leaking into shared
  paths, no bespoke near-duplicates of existing canonical utilities, no
  normalizing architectural drift.
- **Orchestration shape.** Unnecessarily serialized independent work and
  non-atomic related updates are design smells when the cleaner structure is
  obvious. Don't micro-optimize; do flag avoidable brittleness.

## Tone

Be direct, serious, and demanding about quality — never rude, never softening
a major maintainability issue into a mild suggestion. Calibration phrases:

- `this pushes the file past 1k lines. can we decompose this first?`
- `this adds another special-case branch into an already busy flow. can we move this behind its own abstraction?`
- `this works, but it makes the surrounding code more spaghetti. let's keep the behavior and restructure the implementation.`
- `this abstraction seems unnecessary. can we just keep the direct flow?`
- `i think there's a code-judo move here that makes this much simpler. can we reframe this so these branches disappear?`
- `this refactor moves complexity around, but doesn't really delete it. is there a way to make the model itself simpler?`

## Reporting and approval bar

Lead with structural regressions and missed opportunities for dramatic
simplification; a few high-conviction comments beat a long list of cosmetic
notes. Do not approve merely because behavior seems correct. Presumptive
blockers: preserved incidental complexity when a plausible code-judo move
would delete it, a file crossing 1k lines, ad-hoc branching that tangles an
existing flow, feature checks scattered across shared code, unnecessary
wrapper/cast/optionality churn, and duplication of a canonical helper or logic
landing in the wrong layer.

A presumptive blocker clears in one of two ways: change the code, or name the
caller, constraint, or measurement in this repository that makes the current
shape necessary. When you wrote the reviewed code in this session, you are the
author and the reviewer, so your own design rationale is not that
justification. Describe the cleaner replacement and apply it in the same pass.
