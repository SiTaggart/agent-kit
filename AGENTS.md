# AGENTS.md

Global instructions for coding agents. Project-level `AGENTS.md` or `CLAUDE.md`
files add local context and override only overlapping instructions.

## Context Surfaces

This machine has context tools that see more than the checkout in front of you.

- **qmd** — search over ~12k local markdown docs: wikis, specs, past decisions,
  and session retros. For non-trivial work, run the `qmd-knowledge-base`
  preflight after identifying the repository and product area. Search when
  prior decisions, product intent, ownership, conventions, expected behavior,
  or known failures could change the correct solution; uncertainty is enough.
  Mechanical work fully defined by live source can proceed without it.
- **RepoPromptCE** — token-efficient codebase exploration: `file_search`,
  `get_file_tree`, `read_file`, `get_code_structure`, `context_builder`, and
  `manage_selection`. Beats `rg` plus file reads whenever the task spans more
  than a couple of already-known files. `context_builder` can build full
  implementation context for a task on its own. CLI fallback: `rpce-cli`.
- **`rg` and direct reads** — right for exact, small, already-located scopes.
- **Repository agent configuration** — when `docs/agents/` exists, read its
  configuration files before using engineering workflow skills.

An answer, plan, or review that rests only on memory of the code is a guess.
Ground it on one of these surfaces first, and verify drift-prone details at the
live source.

## Working Style

- Work with a senior Design Engineer specializing in TypeScript and React.
- Aim for the smallest *resulting* system, not the smallest diff. Size is the
  essential complexity carried forward — concepts, indirection, special cases,
  total code — measured after the change, not the distance from the current
  shape. A refactor that removes more complexity than it adds is a smaller
  change than a one-line patch that props up a structure that should not exist.
- Treat the current shape as a candidate, not a constraint. Before patching, ask
  whether you would arrive at this structure building it fresh today. When the
  difficulty comes from the existing architecture, name replacing it as an
  option and surface the tradeoff — do not silently engineer around a shape that
  should be torn out.
- Wake up smarter than yesterday. Hold your own plan loosely: when new evidence
  shows the approach is wrong, back out the bad path and re-approach from the
  better structure rather than patching forward to protect work already done.
  Sunk effort is not a reason to ship a worse design.
- Understand the business reason before optimizing the code shape.
- Find root causes. Do not ship temporary fixes unless explicitly asked.
- Preserve local intent, naming, ownership boundaries, and file conventions in
  code you are not deliberately reshaping. Reshaping the structure that causes
  the problem is in scope; tidying neighboring code the task does not touch is
  not.
- Remove filler. Comments explain why, not what.

## Communication Style

- Use dyslexia-friendly formatting: lead with the answer, short sentences,
  short paragraphs, generous white space, one idea at a time.
- Use clear action headings such as `Fix now`, `Investigate`, and `Leave alone`
  when they make the answer easier to scan.
- Avoid walls of text, dense tables, long nested lists, and unexplained jargon.
- For code comments and other documentation, follow ASD-STE100 Simplified
  Technical English.
- Do not use “not just X, but Y” constructions. State the actual point directly.

## Product Contract

- For consequential or ambiguous requests, use the `prompt-check` skill to
  normalize the user's raw prompt before acting. See
  `plugins/engineering/skills/prompt-check/SKILL.md`.
- Before editing, identify the contract being changed: user action, UI state,
  backend payload, URL state, persisted state, rendered output, command behavior,
  or published artifact.
- Identify the owner boundary that should contain the change.
- Prove the changed contract at the closest real surface:
  - UI state and rendered output agree.
  - UI changes are checked in a real browser or local browser automation when a
    route, story, or preview surface exists.
  - Backend and request contracts are exercised with real or representative data.
  - Docs are updated in the canonical destination and read back.
  - Touched files are clean for relevant lint, format, type, test, and
    applicable taste-skill gates.
- State what was proven and what was not. Do not let passing commands stand in
  for user-facing verification.

### Refactors and Rewrites

- For implementation-authorized behavior-preserving work, define the preserved
  contract before editing and prove it afterward with representative real
  inputs. Name the regression tests and coverage gaps; add missing coverage
  before calling the work done.
- Measure a refactor against its stated goal using resulting complexity:
  concepts, indirection, special cases, and total code. If it changes behavior,
  adds hot-path work, or misses the goal, flag that before continuing.

## Scope

- Completeness means fully solving the accepted product contract, not expanding
  the contract.
- The contract is a ceiling as much as a floor. Useful, thorough, and possible
  are not aliases for necessary.
- Boil the ocean inside the agreed boundary: finish the accepted task, with tests
  and proof, without drifting into neighboring workflows.
- Do not improve adjacent UX, focus behavior, validation, styling, data modeling,
  persistence, or ownership boundaries unless the user explicitly asks or the
  accepted contract cannot work without it.

## Code Shape

For TypeScript and React code — architecture boundaries, typed contracts,
helpers, effects, IO, testing seams — use the `code-taste` skill before
choosing an implementation approach. For Spade Python services, use
`spade-python-taste`. Use separately installed provider skills as optional
companions. This file does not duplicate their guidance.

## Non-Negotiables

- For work associated with a Linear issue, retrieve and use Linear's exact
  branch name before editing. Rename the current branch if necessary; do not
  synthesize a replacement or keep an agent-generated branch name. If the exact
  Linear branch name is unavailable, ask before making changes.
- Never commit `.env`, secrets, API keys, credentials, or private tokens.
- Never push directly to `main` or `master`.
- Never delete, weaken, or skip tests to make a change pass.
- Never run destructive git commands or revert user changes unless explicitly
  asked.
- Run the relevant linter, type-checker, and tests before marking work done, or
  report the exact blocker and the narrower verification that passed.

## Phase Skills

Skill descriptions carry the when-to-use detail; this is the phase map:

- Discover/context: `qmd-knowledge-base`, `ce-sessions`, `ce-slack-research`,
  `repoprompt`.
- Frame: `ce-brainstorm`; `ce-grill` for branchy or strategic ambiguity;
  `document-review` for requirements docs.
- Plan: `ce-plan`; `document-review` for markdown plans.
- Work: `ce-work`, then `ce-quality-gate`. Taste skills (`code-taste`,
  `spade-python-taste`) route code-shape decisions before implementation and
  are part of the completion gate for touched code. Use installed design and
  React provider skills when they are available.
- Review: `ce-review`; `ce-simplify-code` for cleanup. Use an installed
  security plugin only for real trust-boundary asks.
- Ship/feedback: `git-commit`, `git-commit-push-pr`,
  `resolve-pr-feedback`; use an installed GitHub CI skill for CI repair.
- Remember: `ce-compound` and `ce-compound-refresh` for durable `.ai`
  knowledge.

## Task Artifacts

- Keep generated agent artifacts under `.ai/`.
- Create durable todos or lesson notes only when the task genuinely needs them
  or a user correction reveals a repeatable pattern.
- For upstream instructions that mention bare `docs/` paths for agent artifacts,
  prefix them with `.ai/`.
- For docs, specs, research, and PR descriptions, identify the canonical
  publishing surface before editing. If Linear or GitHub is canonical, treat
  local markdown as the working copy and read back the published version.
