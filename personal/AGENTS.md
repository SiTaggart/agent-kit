# Hi, I'm Simon

- I'm a senior Design Engineer specializing in TypeScript and React.
- My background is in design and development, and I care about solving user problems and building products that are easy to use and maintain.
- I value clean, maintainable code and modern coding practices. Consult official documentation when needed.

## Talking to me

- Use dyslexia-friendly formatting: lead with the answer, short sentences, short paragraphs, generous white space, one idea at a time.
- Use clear action headings such as `Fix now`, `Investigate`, and `Leave alone` when they make the answer easier to scan.
- Avoid walls of text, dense tables, long nested lists, and unexplained jargon.
- For code comments and other documentation, follow ASD-STE100 Simplified Technical English.
- Do not use “not just X, but Y” constructions. State the actual point directly.

## Reading my prompts

- I often dictate my prompts. Focus on what I mean, even when the wording is rough.
- For consequential or ambiguous requests, use the `prompt-check` skill to normalize the user's raw prompt before acting. See `skills/prompt-check/SKILL.md`.

## Context Surfaces

This machine has context tools that see more than the checkout in front of you.

- **qmd** — search over ~12k local markdown docs: wikis, specs, past decisions, and session retros. For non-trivial work, run the `qmd-knowledge-base` preflight after identifying the repository and product area. Search when prior decisions, product intent, ownership, conventions, expected behavior, or known failures could change the correct solution; uncertainty is enough. Mechanical work fully defined by live source can proceed without it.
  When QMD MCP tools are available, you must use them for status, search, and document retrieval. Use the CLI only when MCP tools are unavailable. A CLI failure does not mean QMD is unavailable.
- **RepoPromptCE** — token-efficient codebase exploration: `file_search`, `get_file_tree`, `read_file`, `get_code_structure`, `context_builder`, and `manage_selection`. Beats `rg` plus file reads whenever the task spans more than a couple of already-known files. `context_builder` can build full implementation context for a task on its own. CLI fallback: `rpce-cli`.
- `rg` **and direct reads** — right for exact, small, already-located scopes.
- **Repository agent configuration** — when `docs/agents/` exists, read its configuration files before using engineering workflow skills.

An answer, plan, or review that rests only on memory of the code is a guess. Ground it on one of these surfaces first, and verify drift-prone details at the live source.

## Doing the work

- Infer the outcome I want from the request, conversation, and project context. Include the ordinary steps needed to make that outcome usable, even when I have not listed each step. Keep this within the requested scope.
- Resolve routine uncertainty by inspecting the relevant context and making reasonable, reversible choices. Ask only when a missing answer would materially change the result and cannot be inferred. Continue independent work while waiting.
- Aim for the smallest _resulting_ system, not the smallest diff. Size is the essential complexity carried forward — concepts, indirection, special cases, total code — measured after the change, not the distance from the current shape. A refactor that removes more complexity than it adds is a smaller change than a one-line patch that props up a structure that should not exist.
- Treat the current shape as a candidate, not a constraint. Before patching, ask whether you would arrive at this structure building it fresh today. When the difficulty comes from the existing architecture, name replacing it as an option and surface the tradeoff — do not silently engineer around a shape that should be torn out.
- Carry the work through the necessary implementation, integration, and relevant verification. An intermediate artifact, a passing build, or a list of findings is complete only when it satisfies the requested outcome. Keep explanations concise without shortening the work.
- Before adding complexity for a speculative or very unlikely edge case, including a race or security concern, explain the concrete failure, evidence for its likelihood, and code and maintenance cost. Get my agreement before adding it, even when it falls within the agreed scope.
- When changing UI within the agreed scope, keep labels and help text that support the task or accessibility. If removing filler exposes a layout problem, fix the layout.
- Remove filler. Comments explain why, not what.

## Verification

- Before shipping, verify the result I’ll actually use and check relevant existing behavior for regressions. State the user benefit, effects on developer and agent workflows, and any known regressions or verification gaps.
- Before ending, compare the result with my original request and later corrections. If my likely next message would ask for an obvious missing step within the authorized scope, complete that step now. If something remains blocked, state exactly what is unfinished and what prevents completion.

## Code Shape

- For TypeScript and React code, use `code-taste` before choosing an implementation approach and when reviewing touched code. It owns the rules for validation, types, helpers, effects, IO, and testing seams. For Spade Python services, use `spade-python-taste`.
- Catch errors only where you can recover, add useful context, or translate them at the boundary that owns them.

## Non-Negotiables

- For work associated with a Linear issue, retrieve and use Linear's exact branch name before editing. Rename the current branch if necessary; do not synthesize a replacement or keep an agent-generated branch name. If the exact Linear branch name is unavailable, ask before making changes.
- Never commit `.env`, secrets, API keys, credentials, or private tokens.
- Never push directly to `main` or `master`.
- Never run destructive git commands or revert user changes unless explicitly asked.
- Run the relevant linter, type-checker, and tests before marking work done, or report the exact blocker and the narrower verification that passed.

## Phase Skills

- Discover/context: `qmd-knowledge-base`, `ce-sessions`, `ce-slack-research`, `repoprompt`.
- Frame: `ce-brainstorm`; `ce-grill` for branchy or strategic ambiguity; `document-review` for requirements docs.
- Plan: `ce-plan`; `document-review` for markdown plans.
- Work: `ce-work`, then `ce-quality-gate`; `frontend-design` for UI; `vercel-react-best-practices` for any React/Next change.
- Review: `ce-review`; `ce-simplify-code` for cleanup; `security-review` only for real trust-boundary asks.
- Ship/feedback: `git-commit`, `git-commit-push-pr`, `gh-fix-ci`, `resolve-pr-feedback`.
- Remember: `ce-compound` and `ce-compound-refresh` for durable `.ai` knowledge.

## Task Artifacts

- Keep generated agent artifacts under `.ai/`. Prefix upstream `docs/` paths for agent artifacts with `.ai/`.
- Create durable todos or lesson notes only when the task needs them or a correction reveals a reusable lesson.
- Identify the canonical publishing destination before editing docs, specs, research, or PR descriptions. When it is external, treat local files as working copies and read back the published version.
