---
name: ce-review
description: "Use when the user asks for a code review, PR review, pre-commit audit, or review of a branch or local diff after implementation exists. Review-only; use document-review for plans and requirements."
argument-hint: "[quick|deep] [base:<ref>] [plan:<path>] [PR number, PR URL, branch name, or blank for current branch]"
---

# First-Principles Code Review

Review the current changeset like a senior engineer who cares about product outcome and code taste. The goal is not maximum findings. The goal is to help the user ship a clean, correct, elegant implementation.

This skill is review-only. It never edits tracked files, commits, pushes, opens PRs, files tickets, writes durable run artifacts, or applies fixes.

For a `current-checkout` target, the parent may create one untracked temporary
test file at a time solely to verify functional findings. Record each created
path, never modify an existing file, and remove created files on every exit. If
the user wants fixes after the review, handle that as a separate task.

## Loop Role

`ce-review` is a work-review skill. Use it after implementation exists as a
branch, PR, or local diff. It may read a plan via `plan:<path>` for intent, but
the review target is still the changed work.

Do not use `ce-review` to review requirements docs, plans, PRDs, or kickoff
docs. Use `document-review` for those artifacts.

## Review Philosophy

- Start from the product contract: what user action, UI state, backend payload, URL state, persisted state, rendered output, or artifact is this change trying to improve?
- Prefer first-principles reasoning over checklist compliance.
- Taste matters. If the implementation works but is needlessly tangled, indirect, broad, or hard to read, say so with a concrete simpler direction.
- Use `code-taste` for TypeScript or React helper-boundary, effect, test-shape,
  and maintainability concerns.
- Use `spade-python-taste` for Spade Python service, FastAPI, Pydantic-boundary,
  router, dependency, runtime-cost, and deployed-seam concerns.
- Use both taste skills only when the diff crosses those language surfaces.
- Guardrail concerns are conditional. Migration, deployment, rollout, support, and observability issues matter only when the diff actually touches those surfaces or creates a concrete product risk.

## Non-Goals

Do not do any of these:

- Do not run a compliance gauntlet.
- Do not spawn agents for migration, deployment, support, automation parity, or knowledge capture unless the changed code truly needs that review.
- Do not review requirements documents or implementation plans as the primary target.
- Do not flag pre-existing issues unless a changed line directly depends on them or makes them worse.
- Do not report speculative future-work concerns.
- Do not route findings to owners, create JSON contracts, or produce machine-actionable artifact payloads.
- Do not praise the work or add filler.

## Functional finding reproduction

For a bug, regression, or other claim that behavior is functionally wrong,
reviewer passes propose the smallest focused reproduction. The parent attempts
it only for a `current-checkout` target.

- A faithful red test verifies the finding.
- A faithful green test disproves it; drop the finding.
- When the exact reviewed revision cannot be tested, the result is
  `Not reproduced`, not disproven. Retain the finding only when concrete
  code-path evidence supports it.

## Step 0: Pre-Flight

Before substantive review, establish that the changeset is reviewable.

Parse arguments before resolving the target:

- `quick` means run the passes in the parent agent and keep the report short.
- `deep` means prefer thoroughness over speed: use context-building and
  specialist reviewers more readily, inspect relevant callers/importers for
  changed contracts, and run every applicable pass even when the diff is small.
  If both `quick` and `deep` are present, prefer `deep` and note the conflict.
- `base:<ref>` selects the diff base for the current checkout.
- `plan:<path>` is an optional intent source; read it for requirements context when it exists.

1. Determine the review target.
   - `base:<ref>` means review the current checkout against that base. Use `git merge-base HEAD <ref>` when possible; otherwise use `<ref>` directly. Mark the target as `current-checkout`.
   - A PR number or URL means review that PR without checking it out. Use `gh pr view` and `gh pr diff --color=never` when available. Mark the target as `remote-readonly`.
   - A branch name means review that branch without switching branches. If the branch name resolves to the current checkout (`HEAD` or the current branch name), mark the target as `current-checkout`; otherwise prefer an open PR for the branch when one exists, or diff the resolved branch ref against the default branch, and mark the target as `remote-readonly`.
   - No argument means review the current branch against its PR base if an open PR exists; otherwise review against the default branch. Mark the target as `current-checkout`.
2. Collect the changed file list and full diff.
3. Exclude submodules, generated files, lockfiles, and vendored/minified assets unless the change is specifically about them.
4. Include staged and unstaged tracked changes for current-checkout reviews. In `quick` mode, list untracked files as excluded unless the user explicitly asked to include them. In `deep` mode (and whenever the user asks), include untracked files in scope — surface each via `git diff --no-index -- /dev/null <file> || true` (exit 1 is expected when the file has content) — but first exclude likely secret or local-config paths such as `.env*`, `.npmrc`, `.pypirc`, `*.pem`, `*.key`, `*.p12`, `*.pfx`, `id_rsa*`, `*_rsa`, `*credentials*`, `*secret*`, `*.local.*`, and `config.local.*` unless the review is specifically about that file and the sensitive values are redacted.
5. Find project instruction files that govern the changed files, especially `AGENTS.md` and `CLAUDE.md` ancestors.
6. If an obvious fast lint, typecheck, or touched-surface test command exists, run it once here in the parent before any fan-out, and carry the output into Step 3 so reviewers reason from it. If basics fail, report those failures before deeper review. Continue only when the user explicitly wants conceptual review despite red checks.

When command output is unavailable, continue with the closest reliable source and state the limitation in the review.

## Step 1: Understand Intent

Write a two- or three-line intent summary before judging the code.

Use the conversation, branch name, commit messages, PR title/body, linked issue text, plan snippets, and the diff itself. If intent is uncertain, say what you inferred and review against that inferred contract.

The intent summary should answer:

- What product or engineering outcome is this change trying to create?
- What behavior must not regress?
- Which files or modules own the change?

## Step 2: Read For Context

Read changed files in full when they are reasonably sized. Use the diff to distinguish new or modified behavior from existing code.

For exported functions, public components, API handlers, hooks, schemas, commands, or shared utilities, inspect the nearest callers/importers when the changed contract may affect them.

Do not let caller spelunking become an unrelated repo audit. Follow blast radius only as far as needed to decide whether this change is correct.

When intent, conventions, or a historical decision remains unclear after
reading the diff and live files, use `qmd-knowledge-base`. Keep the current diff,
working tree, and tests as the review's implementation evidence.

When the review starts cold — a standalone diff or PR with no context built upstream this session — use a RepoPromptCE `context_builder` review-mode pass (see the `repoprompt` skill) to map blast radius and cross-module impact independently. Within a session that already ran brainstorm, plan, or work, reuse that context instead of rebuilding it. Fold the result into the main review; do not mechanically forward findings that lack file/line evidence.

In `deep` mode, use the context-builder for any non-trivial diff unless enough
equivalent context is already loaded. Inspect callers/importers for changed
contracts more aggressively, but keep the search tied to real behavior,
ownership boundaries, public APIs, shared state, or test fixtures touched by the
change.

## Step 3: Review Passes

For small changes, run these passes yourself. For medium or large changes, use parallel read-only sub-agents when the platform supports them, one pass per agent. If sub-agents are unavailable, run the passes sequentially.

In `deep` mode, bias toward parallel specialist reviewers for all applicable
passes, including small diffs with subtle state, data-flow, contract, security,
performance, or test-proof risk. Deep mode should increase scrutiny and caller
coverage; it should not lower the evidence bar or add speculative findings.

In `deep` mode, when implementation shape is a primary risk — large or
1000-line-crossing files, sprawling new conditionals, major refactors or
changed ownership boundaries, new abstractions or shared helpers, cast-heavy
or optionality-heavy code — add the
`ce-thermo-nuclear-code-quality-review` rubric as an extra maintainability
pass. Label its findings separately and deduplicate them against the normal
passes; skip it for small, direct changes where correctness, contracts, or
tests are the main questions.

If the current repository provides its own pass prompt files (e.g.,
`.claude/review/prompts/passes/*.md`), use those as the detailed pass
definitions in place of the lens summaries below.

Each pass returns at most five findings, ranked by impact — suppress the tail rather than raising the cap. A pass with no issues says `No issues.`

Every pass uses this shared bar:

- Only flag issues introduced or materially affected by this changeset.
- Cite a specific file and line.
- Explain the concrete consequence.
- Give a specific fix direction.
- Apply the functional-finding reproduction rule above.
- Suppress anything that is merely preference, unsupported speculation, or a duplicate of another pass.

### Mandatory Code-Taste Gate

For every TypeScript or React diff, Pass 3 applies `code-taste` as a mandatory
gate. Complete it with either `No issues.` or concrete findings that meet the
shared bar.

Every code-taste finding that meets the shared bar survives synthesis. Severity
controls ordering and verdict, not inclusion. Omit a finding only when it
duplicates a retained finding, is pre-existing and unaffected by the diff, or
fails the shared bar; merge duplicates into the retained finding.

### Context-Isolated Reviewer Routing

For medium or large reviews, and for `deep` reviews, delegate the context-heavy
passes to sub-agents instead of loading every lens into the parent thread. The
parent keeps review intent, severity, deduplication, and final verdict
ownership.

Reviewer personas live in `references/reviewers/`. Dispatch each selected lens
per `../ce-conventions/SKILL.md` §Sub-agent dispatch: a sub-agent — read-only
where the platform offers one — whose prompt names the absolute path of the
persona file (expand it from this skill's own directory; a bare relative path
resolves to nothing in the sub-agent's working directory) and the diff scope.
If sub-agents are unavailable, run the pass inline and keep the report short.

Reviewers reason from the diff, source, tests, and the check output the parent
already produced in Step 0; they do not rerun lint, typecheck, or Vitest
themselves, because a read-only review sandbox rejects the temp files and IPC
sockets that tsx, Vite, and Vitest create at startup. When a check never ran,
report it as blocked rather than logging the sandbox error as a product test
failure. A reviewer may propose a minimal reproducer for a suspected functional
issue. The parent applies the functional-finding reproduction rule before
synthesis.

Dispatch the smallest useful set of lenses; do not dispatch a lens solely
because it exists. Evaluate small concerns inline in the parent. Deduplicate
returned findings and re-check them against this skill's evidence bar before
including them in the final review.

#### Reviewer Index

Always-on for medium, large, and deep reviews:

- `correctness.md` — logic errors, edge cases, state bugs, error propagation.
- `maintainability.md` — complexity, coupling, naming, dead code, abstraction
  debt.
- `testing.md` — coverage gaps, weak assertions, brittle tests; also handles
  test-strategy asks.
- `project-standards.md` — the repo's own CLAUDE.md/AGENTS.md standards.

Conditional — dispatch when the diff matches:

- `adversarial.md` — large diffs (>=50 changed lines) or high-risk domains:
  auth, payments, data mutations, external APIs.
- `api-contract.md` — API routes, request/response types, serialization,
  versioning, exported type signatures.
- `architecture-strategist.md` — structural refactors, new services, pattern
  compliance.
- `code-simplicity.md` — final YAGNI and minimalism pass after implementation
  completes.
- `design-implementation.md` — UI implemented against Figma designs; needs the
  `agent-browser` CLI.
- `julik-frontend-races.md` — async UI, Stimulus/Turbo lifecycles,
  DOM-timing-sensitive frontend code.
- `kieran-python.md` — Python diffs.
- `kieran-typescript.md` — TypeScript diffs.
- `performance.md` — database queries, loop-heavy transforms, caching, or
  I/O-intensive paths.
- `previous-comments.md` — the PR has existing review comments or threads.
- `reliability.md` — error handling, retries, timeouts, background jobs, async
  handlers.

### Pass 1: Product Intent And Correctness

Ask whether the implementation actually satisfies the intended product
contract — conditions, state transitions, async ordering, error propagation,
and edge cases, judged against the stated or inferred requirement. If the code
is clean but solves the wrong problem, that is a must-fix.

### Pass 2: Traceability And Data Flow

Ask whether a reader can follow what the code does without holding the whole
system in their head — honest helper signatures, explicit dependencies, flat
data flow, names that describe intent. Do not demand extraction for its own
sake.

### Pass 3: Elegance And Minimalism

Ask whether less code would do the same thing just as clearly — dead code,
unnecessary indirection, over-generalization, duplicated logic, undisclosed
broad refactors hiding inside a narrow product change. This is the taste pass.
It should improve the shape of the implementation, not make it clever.

For UI diffs, include an installed design companion's taste bar when available: the implementation should
match the existing system, expose expected states, avoid generic AI chrome, and
prove the rendered surface when a route, story, or preview exists.

### Pass 4: Project Conventions

Read the governing `AGENTS.md` and `CLAUDE.md` files and check only rules
relevant to the changed files — ownership boundaries, local patterns, and
forbidden shortcuts. Project conventions are evidence, not bureaucracy. If the
local pattern is bad but entrenched, name the tradeoff instead of blindly
enforcing it.

### Pass 5: Tests And Proof

Ask whether the changed contract is proven at the lowest meaningful seam —
real assertions for changed behavior, browser/runtime proof for UI when a
route, story, or preview surface exists, representative data for
backend/request contracts. Do not demand tests for non-behavioral churn. Do
not treat passing commands as product proof when the product surface still
needs checking. Apply the functional-finding reproduction rule to every
candidate functional finding from any pass.

### Pass 6: Performance And Operational Cost

Run this pass proportionally — query shapes, repeated expensive work,
avoidable rerenders, bundle impact. Flag only when the cost is likely to
matter for this product surface; this pass is not a license to invent scale
concerns.

### Pass 7: Security And Robustness

Run this pass on real trust boundaries, not every line of code. When the diff
touches a boundary, map what crosses it, then judge validation, auth/authz,
injection and leakage risks, and failure paths that leave persistent state
inconsistent. Before reporting a finding, check whether the local owner
already validates, guards, escapes, or tests that path — report the real gap,
not the checklist item. If the diff does not touch a trust boundary, this pass
should usually have no findings.

### Pass 8: Blast Radius

Ask whether changed public behavior has affected callers. Early exit when no
exported symbol, API shape, schema, shared state, public component contract,
config default, or externally observable behavior changed. Otherwise inspect
likely callers/importers for stale assumptions and for fixtures, mocks,
schemas, or tests that should have changed. Stay tied to changed contracts.

## Step 4: Synthesize

Collect findings from the passes, deduplicate them, and drop anything that does
not meet the bar. Account for every applicable code-taste gate before choosing
a verdict.

Severity:

- `must-fix` - correctness, security, data integrity, or product-contract issue that should block shipping
- `should-fix` - meaningful maintainability, traceability, test, performance, or convention issue worth fixing before review/merge
- `nit` - small style or cleanup issue that is safe to ignore

Verdict:

- `Ship it` - every applicable pass completed, with no findings or only ignorable nits
- `Minor nits` - only nits remain
- `Needs changes` - any `should-fix` or one contained `must-fix`
- `Rethink approach` - multiple `must-fix` findings, or one must-fix that undermines the core design
- `Review incomplete` - an applicable mandatory pass did not complete

## Output

Start with findings. Keep the report dense and useful.

Use this shape:

```markdown
## Findings

### must-fix

| File | Issue | Repro | Fix |
| --- | --- | --- | --- |
| `path/file.ts:42` | The changed resolver drops saved filters when the URL has no tab param. | Red | Preserve the existing tab state before applying URL defaults. |

### should-fix

| File | Issue | Repro | Fix |
| --- | --- | --- | --- |
| `path/file.ts:88` | The helper takes the whole chart but only reads `dateMode`. | Not applicable | Pass `dateMode` directly so the dependency is honest. |

## Reproductions

Include this section only for verified functional findings. Give the test
source, exact command, and relevant failure.

## Verdict

Needs changes.

## Checks

- Code taste: completed - 1 finding reported
- Typecheck: passed
- Touched tests: not run - no focused test command found
- Browser proof: not applicable
```

Rules:

- If there are no issues, say `No findings.` clearly.
- Always include a verdict.
- Always include checks/proof status, including what was not run.
- For TypeScript or React diffs, report `Code taste` as `passed - no issues`,
  `completed - N findings reported`, or `incomplete - <reason>`. Report
  `not applicable - no TypeScript or React changes` for other diffs. An
  incomplete applicable taste gate requires the `Review incomplete` verdict.
- For each functional finding, state its reproduction status. When verified,
  use `Red` and include its proof under `Reproductions`. When no valid test was
  available, use `Not reproduced` and say why in the issue text.
- Keep issue text specific and short.
- Do not include time estimates.
- Do not include separate support, migration, deployment, or residual-risk sections unless the changed contract genuinely requires them.
- Do not apply fixes in this skill.

## Final Quality Gate

Before delivering, re-read every finding and ask:

- Is this introduced or materially affected by the changeset?
- Did I cite the right file and line?
- What actually breaks, gets worse, or becomes harder to maintain?
- For a `current-checkout` claim of functionally wrong behavior, did I apply
  the reproduction rule? For a remote target, did I use `Not reproduced`?
- Is the suggested fix concrete?
- Am I flagging this because it matters to the product/code, or because a checklist told me to?

Drop anything that fails those questions.

## Next Step

After the verdict, recommend what to run next and fire it — do not end on a
bare report. Follow the shared menu conventions (see
`../ce-conventions/SKILL.md`), including the sub-step guard: when another
skill invoked this as a sub-step, return the verdict and findings and let the
caller route.

Gate the routes on the target marker from Step 0. Mutating or apply routes
(`git-commit-push-pr`, `git-commit`, `ce-work`, `ce-debug`,
`ce-simplify-code`, or any fix workflow) are visible only when the reviewed
target is `current-checkout`. For `remote-readonly` targets, render guidance
only — the review response or fix list tied to the remote diff — and tell the
user to check out the target before asking for commits or fixes.

For `current-checkout` targets, route by verdict: `Ship it` / `Minor nits` →
`git-commit-push-pr` (recommended) or `git-commit`, adding `ce-simplify-code`
only when nits worth cleaning remain; `Needs changes` → `ce-work`
(or `ce-debug` when the findings are bugs, regressions, or failing tests),
then re-review the changed surface; `Rethink approach` → `ce-plan`
(or `ce-brainstorm` / `ce-grill` when the product framing itself is in
question). Routing to `ce-work` or `ce-debug` is the apply path — never apply
fixes from here.
