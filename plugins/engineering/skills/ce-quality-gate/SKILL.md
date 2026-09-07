---
name: ce-quality-gate
description: "Run the changed-code quality gate after implementation: touched-file lint, format, type-check, tests, and code-shape checks. Use after ce-work writes code, before review or shipping, and when the user asks to make changed files clean."
argument-hint: "[optional touched file list, diff scope, or quality concern]"
---

# Changed-Code Quality Gate

Use this after code has been written. It makes the touched surface mechanically
clean and checks that the code shape matches the project's standards.

This is not a product review and does not replace real-surface proof. It answers
"is the changed code complete enough to review or ship?"

`ce-work` calls this after implementation and behavioral proof. `ce-review` may
still run after this when the work is substantial, risky, or explicitly under
review.

## Contract

For the touched surface: formatting, lint, and type checks are clean, relevant
tests pass, relevant taste-skill issues are fixed, warnings count when the
project treats warnings as failures, and local `AGENTS.md`, `CLAUDE.md`, and
nearby code conventions are followed.

If broad repo checks are noisy, separate unrelated baseline failures from
touched-file failures. Do not hide them and do not claim the whole repo is clean.

## Workflow

### 1. Resolve Scope

Use the provided file list when present; otherwise derive the touched surface
from the current diff. Include edited source, tests and fixtures, generated
files that are part of the accepted contract, and package/config/schema/lockfile
changes that affect checks.

### 2. Choose The Check Bundle

Read the closest applicable instructions (project `AGENTS.md`/`CLAUDE.md`,
package scripts, CI config, local examples) and find the narrowest trustworthy
bundle for the touched surface: formatter, touched-file or package lint,
type/compile check, and focused tests for the lowest meaningful behavior. Do
not invent commands when the repo already has scripts. If no suitable command
exists, say which proof is unavailable and use the closest representative check.

### 3. Iterate Until Clean

Run checks and fix failures caused by the changed surface. Treat relevant
taste-skill violations like lint failures for touched code. Never make a check
pass by weakening it (the global Non-Negotiables apply), and do not expand
scope into unrelated cleanup. If a check fails from unrelated baseline noise,
capture the exact failure and prove the touched surface with the narrower
available command.

Sandbox write denials are environment failures, not code failures: even
nominally read-only checks write caches, temp files, and sockets, so a
restricted sandbox can kill Vitest, Vite, Ruff, uv, tsx, or pnpm at startup
with `EPERM`/`Operation not permitted`. Classify that check as sandbox-blocked
and report the exact command and error alongside the narrower checks that did
run — a denied startup is neither a test failure nor a pass, and retrying the
same command against other unverified cache or temp directories only repeats
the denial.

### 4. Code-Shape Pass

Review the changed code for local taste: `code-taste` for TypeScript/React,
`spade-python-taste` for Spade Python services, both only when the change
crosses those surfaces. No dead code, duplicate branches, or speculative
abstractions; behavior still lives at the owner boundary accepted by `ce-work`;
comments explain why, not what. Fix relevant violations or report a necessary
exception with the accepted-contract reason — do not turn the gate into the
main architecture phase.

Use `ce-simplify-code` only when simplification is non-trivial or the user asks
for it. Do not turn simplification into a mandatory ritual.

### 5. Report Proof

Return a compact status: touched files checked, commands run and results,
code-shape issues fixed or still present, unrelated baseline failures if any,
and what this gate did not prove — especially product/browser behavior.

### 6. Recommend The Next Step

Recommend what to run next based on the result and risk, and fire it via the
platform's blocking question tool (see `../ce-conventions/SKILL.md`). Missing
or inconclusive product/browser proof wins over every clean branch: route back
to `ce-work` to complete the proof, and never offer shipping from a
mechanically clean but behaviorally unproven gate. Otherwise: `ce-review` for
substantial or risky work, `git-commit-push-pr` / `git-commit` for narrow
low-risk proven work, `ce-simplify-code` when a non-trivial simplification or
reported exception remains, `ce-debug` when a touched-file failure persists —
never review or ship while the surface is failing.

**Sub-step guard:** when `ce-work` (or another skill) invoked this gate as a
sub-step, skip the menu — return the report and let the caller own the routing.
