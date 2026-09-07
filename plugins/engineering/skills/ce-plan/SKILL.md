---
name: ce-plan
description: "Create structured plans for multi-step tasks once the goal is clear enough to plan. Use after ce-brainstorm or ce-grill, or directly for clear planning requests. If the request has branchy product/scope ambiguity, run ce-grill first."
argument-hint: "[optional: feature description, requirements doc path, plan path to deepen, or any task to plan] [output:html]"
---

# Create Technical Plan

`ce-brainstorm` defines **WHAT** to build. `ce-plan` defines **HOW** to build it. `ce-work` executes the plan. A prior brainstorm is useful context but never required — `ce-plan` works from any input: a requirements doc, a bug report, a feature idea, or a rough description.

If invoked, plan; ask rather than exit. This workflow produces a durable implementation plan. It does **not** implement code, run tests, or learn from execution-time results — if the answer depends on changing code and seeing what happens, that belongs in `ce-work`.

## Loop Contract

1. **Clarify with `ce-grill` when needed** — branchy, strategically important, or product-shaky input that would produce materially different plans. One or two ordinary missing facts are asked inside this workflow instead.
2. **Plan with `ce-plan`** — produce the technical implementation plan.
3. **Review with `document-review`** — markdown plans run the headless document-review gate before handoff (see `references/plan-handoff.md`).

Use `ce-review` only after work exists as a branch, PR, or local diff — it reviews work, not plans.

For UI work, use an installed design companion when available while planning states, layout ownership, accessibility, responsive behavior, and browser proof. When prior context could change the plan, use `qmd-knowledge-base` before treating missing background as an assumption. Build curated codebase context with RepoPromptCE `context_builder` (see the `repoprompt` skill) before finalizing a non-trivial plan; do not let it widen the accepted product contract.

## Interaction Method

When asking the user a question, use the platform's blocking question tool (see `../ce-conventions/SKILL.md`). Ask one question at a time; prefer a concise single-select choice when natural options exist.

## Feature Description

<feature_description> #$ARGUMENTS </feature_description>

**If the feature description above is empty, ask the user:** "What would you like to plan? Describe the task, goal, or project you have in mind." Then wait for their response before continuing.

All file references in plan content are repo-relative (`src/models/user.rb`), never absolute — absolute paths break portability across machines, worktrees, and teammates.

## Core Principles

1. **Use requirements as the source of truth** — if `ce-brainstorm` produced a requirements document, build from it rather than re-inventing behavior.
2. **Decisions, not code** — capture approach, boundaries, files, dependencies, risks, and test scenarios. Do not pre-write implementation code or shell choreography. Pseudo-code sketches or DSL grammars that communicate high-level design are welcome when framed as directional guidance, not implementation specification.
3. **Research before structuring** — explore the codebase, institutional learnings, and external guidance when warranted before finalizing the plan.
4. **Right-size the artifact** — small work gets a compact plan; large work gets more structure. The philosophy stays the same at every depth.
5. **Separate planning from execution discovery** — resolve planning-time questions here; explicitly defer execution-time unknowns to implementation.
6. **Keep the plan portable** — a living document, review artifact, or issue body without tool-specific executor instructions.
7. **Carry execution posture lightly when it matters** — if test-first or characterization-first posture is clearly implied, reflect it as a lightweight signal, not choreography.
8. **Honor user-named resources** — a named CLI, MCP server, URL, file, or prior artifact is authoritative input. Discover it before assuming it's unavailable; if it fails, say so rather than silently substituting.
9. **The current architecture is a candidate, not a constraint** — the global candidate-not-constraint principle applies to planning: aim for the smallest resulting system, keep replacement of a problematic structure on the table, and surface the reframe and tradeoff rather than choosing unilaterally.

## Plan Quality Bar

Every plan should contain: a clear problem frame and scope boundary; requirements traceability back to the request or origin document; repo-relative file paths; explicit test file paths for feature-bearing units; decisions with rationale; existing patterns to follow; enumerated test scenarios specific enough that an implementer knows exactly what to test; clear dependencies and sequencing.

A plan is ready when an implementer can start confidently without needing the plan to write the code for them.

## Workflow

### Phase 0: Resume, Source, and Scope

#### 0.0 Resolve Output Mode

Output mode is exclusive — the plan is written as either markdown (`.md`) OR HTML (`.html`), never both.

**Read config (pre-resolved at skill load):**
!`cat "$(git rev-parse --show-toplevel 2>/dev/null)/.compound-engineering/config.local.yaml" 2>/dev/null || echo '__NO_CONFIG__'`

Resolve `OUTPUT_FORMAT` per `../ce-conventions/SKILL.md` §"Output-mode resolution": `output:` arg > active `plan_output:` config key above > `md`; pipeline and sub-step invocations force `md`. Strip consumed flag tokens from the arguments before treating the remainder as the feature description.

Load the format-rendering reference for the resolved value — `../ce-conventions/references/markdown-rendering.md` or `../ce-conventions/references/html-rendering.md`. Both pair with `references/plan-sections.md`, which describes what the plan contains regardless of format.

#### 0.1 Resume Existing Plan Work When Appropriate

If the user references an existing plan file or there is an obvious recent matching plan in `.ai/plans/`: read it, confirm update-in-place vs new plan, and revise only the still-relevant sections. Plans carry no per-unit progress state — progress is derived from git by `ce-work`.

**Deepen intent:** "deepen" targets a plan in `.ai/plans/` and triggers the deepening fast path. Deepen = a holistic strengthening pass on an existing plan; confirm when ambiguous, and treat section-specific editing requests ("strengthen the risk section") as normal edits, not deepening.

Once the plan is identified and complete (`status: active`), route by file extension first, then frontmatter:

- **`.html` plan:** short-circuit to Phase 5.3 in **interactive mode** (HTML plans are always software plans — the html-rendering invariant forbids YAML frontmatter, so its absence is not a non-software signal).
- **`.md` plan WITH YAML frontmatter:** short-circuit to Phase 5.3 in **interactive mode**.
- **`.md` plan WITHOUT frontmatter** (non-software plans use `# Title` + `Created:` instead): route to `references/universal-planning.md`.

**Resume preserves the existing artifact's format**, except: an explicit `output:` argument overrides, and pipeline mode always forces `md` (writing the markdown to the parallel `<plan-basename>.md`, leaving the original `.html` untouched).

#### 0.1a Recognize Approach-Altitude Requests

Some requests are better answered one level up: a grounded **approach-plan** for *how the deliverable will be made*, held at a checkpoint. Runs after 0.1's fast paths, before 0.1b's domain split.

- **Explicit (always honored):** "plan for a plan", "plan the approach", "don't do it yet — just plan how you'd approach it" → enter approach altitude; do not begin the deliverable.
- **Proactive (rare):** offer an approach-plan only when the method itself is genuinely unsettled AND the deliverable is expensive to redo. When in doubt, just plan — the failure mode to avoid is opening every turn with "want me to plan the approach first?". The offer is a single dismissible line, never a blocking question.

On entry, read `references/approach-altitude.md` and follow it. Otherwise continue.

#### 0.1b Classify Task Domain

If the task builds, modifies, refactors, deploys, or architects software (code, schemas, infrastructure), continue to Phase 0.2. Classify by task-type, not topic: investigating or analyzing code is an answer-seeking question, not software work. If genuinely ambiguous, ask before routing. Otherwise read `references/universal-planning.md` and follow that workflow instead, skipping all subsequent phases.

#### 0.2 Find Upstream Requirements Document

Search `.ai/brainstorms/` for `*-requirements.md` or `*-requirements.html` that semantically matches the feature description, is recent (~30 days, judgment overrides), and covers the same user problem. If multiple match, ask which one to use.

#### 0.3 Use the Source Document as Primary Input

If a relevant requirements document exists: read it thoroughly, announce it as the origin document, and carry forward the problem frame; Actors/Key Flows/Acceptance Examples (A/F/AE-IDs) as constraints when present; requirements and success criteria; scope boundaries (including "Deferred for later" and "Outside this product's identity"); key decisions and rationale; dependencies; and outstanding questions with their blocking/deferred status. Reference carried decisions with `(see origin: <source-path>)`. Do not silently omit source content — before finalizing, scan each origin section to verify nothing was dropped.

#### 0.4 Planning Bootstrap (No Requirements Doc or Unclear Input)

If the request is already clear enough, continue to Phase 0.5. If the ambiguity is mainly product framing, recommend `ce-brainstorm` while always offering to continue here. Otherwise run a brief bootstrap establishing: problem frame, intended behavior, scope boundaries, success criteria, and blocking questions or assumptions. If major product questions remain, recommend `ce-brainstorm` again; if the user continues anyway, require explicit assumptions.

Route-outs the bootstrap may surface:

- **Bug-shaped prompt** (broken behavior, error message, regression): offer `ce-debug` alongside continuing, whenever the bug surface is reachable locally. When the bug lives at another local path, announce the target repo and where plan outputs will land (default: the target repo's `.ai/plans/`) before cross-repo investigation, then offer the same ce-debug choice. Stay silently in `ce-plan` when the named code can't be found anywhere local. Headless mode skips the suggestion menu and continues with `ce-plan`.
- **Clear task ready to execute** (known root cause, no architectural decisions): suggest `ce-work` as a faster alternative. The user decides.

#### 0.5 Classify Outstanding Questions Before Planning

For `Resolve Before Planning` questions in the origin document: reclassify into planning-owned work only if genuinely technical/architectural/research; keep as blockers if they would change product behavior, scope, or success criteria. If true product blockers remain, ask whether to resume `ce-brainstorm` or convert them into explicit assumptions — do not plan past unresolved blockers.

#### 0.6 Assess Plan Depth

Classify as **Lightweight** (small, bounded, low ambiguity), **Standard** (normal feature with decisions to document), or **Deep** (cross-cutting, strategic, high-risk, or highly ambiguous). If unclear, ask one targeted question.

#### 0.7 Solo-Mode Scoping Synthesis

Surface the forks where user input materially changes the plan — before Phase 1 research is spent. Fires only in solo invocation: no upstream doc (0.2), stayed in ce-plan (0.4), no unresolved blockers (0.5), and not on a 0.1 fast path. Brainstorm-sourced invocations defer to Phase 5.1.5 instead.

Read `references/synthesis-summary.md` and follow the solo variant: compose the internal three-bucket draft, derive call-outs via the keep and detail tests, and emit the scope claim with confirmation gate. Auto-proceed (announce and continue) only for Lightweight depth with zero call-outs. In headless mode, compose the internal draft only and continue — Inferred bets route to `## Assumptions` at plan-write.

### Phase 1: Gather Context

#### 1.1 Local Research (Always Runs)

Prepare a concise planning context summary (a paragraph or two): origin-document problem frame and decisions when present, otherwise the feature description; relevant `STRATEGY.md` pieces when that file exists; and `CONCEPTS.md` vocabulary when present (plan with the canonical terms).

Gather, in parallel, the information the plan needs — repo technology/architecture/patterns (`repo-research-analyst`; its prompt's first line must be the literal scope syntax, e.g. `Scope: technology, architecture, patterns`) and institutional learnings from `.ai/solutions/` (`learnings-researcher`) are the usual research personas. Each is a standalone skill: dispatch per `../ce-conventions/SKILL.md` §Sub-agent dispatch — a sub-agent that loads it, or reads its SKILL.md by absolute path when the platform's sub-agents cannot load skills. Adjust the set to the task. Collect: stack and versions; architectural patterns and conventions; relevant files, modules, and tests; AGENTS.md guidance that materially affects the plan; institutional learnings; and strategy alignment flags when `STRATEGY.md` is present.

**Slack context** is opt-in per `../ce-conventions/SKILL.md`. When tools are available but unrequested, note once that Slack search is available; when requested but unavailable, say so.

#### 1.1b Detect Execution Posture Signals

If the user, origin document, or research clearly signals test-first, characterization-first, or similar posture (e.g., legacy weakly-tested target area), carry it forward silently in the relevant units. Ask only if the posture would materially change sequencing or risk and cannot be responsibly inferred.

#### 1.2 Decide on External Research

Judgment, not a gauntlet:

- **An explicit ask wins.** If the user or origin doc points outside the repo (competitor comparison, "best practices", "official docs", a named external technology), external research is required — key on the signal, not exact phrases. Only an explicit opt-out ("skip external research") overrides; honor it and note it. When a settled local choice already exists, narrow the research to that choice's current docs and pitfalls rather than re-surveying options.
- **Classify the intent** so 1.3 routes correctly: *implementation-guidance* (approach settled; how to build it well), *landscape* (what options or prior art exist), or *mixed*.
- **Otherwise use the implicit signals:** lean toward research for high-risk topics (security, payments, migrations, compliance), thin or absent local patterns (including adjacent-domain-only matches — frame the query around the domain gap), unfamiliar territory, or a genuinely external unsettled option set that materially shapes the plan. Skip when strong recent local patterns exist, the user knows the intended shape, or external context adds little. Use repo-research-analyst's technology summary to sharpen the call (exact versions → pass to `docs-researcher`; monorepo → scope to the relevant service).

Announce the decision and intent in one line.

#### 1.3 External Research (Conditional)

Dispatch by intent per `../ce-conventions/SKILL.md` §Sub-agent dispatch; each researcher below is a skill the sub-agent loads, and when sub-agents are unavailable, run the selected researcher inline rather than skipping it. **Implementation-guidance:** `docs-researcher` with the planning context summary and exact frameworks/versions. **Landscape:** `web-researcher` with a focus hint plus the planning context summary (no codebase content — it operates externally); for code-host scans, name the discovery dimensions (activity, UX shape, docs, issue themes, license — star counts are weak signal). **Mixed:** sequential — `web-researcher` maps the landscape and shortlists, then `docs-researcher` covers shortlisted technologies only when their details materially shape the plan.

Never block on missing tools: if a researcher fails or web tools are unavailable, warn, proceed, and carry the gap into 1.4 so the plan records it honestly.

#### 1.4 Consolidate Research

Summarize: codebase patterns and file paths; QMD findings that changed a decision; institutional learnings; Slack context if gathered; external references if gathered; related issues/PRs; and constraints that materially shape the plan.

**Land external findings in decisions, not an appendix** — KTD rationale, Alternatives, Risks, or Sources. If a finding shaped nothing, drop it. **Mark whether external research was load-bearing** (materially shaped a KTD, Alternative, Scope boundary, or Risk) — Phase 5.3.2 reads this flag. **Record requested-but-unavailable research** as an assumption or open question rather than presenting the plan as externally grounded.

#### 1.4b Reclassify Depth on External Contract Surfaces

If a Lightweight plan turns out to touch external contract surfaces — env vars consumed elsewhere, exported public APIs or CLI contracts, CI/CD config, shared types with downstream consumers, externally linked docs — reclassify to Standard and announce it briefly.

#### 1.5 Flow and Edge-Case Analysis (Conditional)

For Standard or Deep plans, or when flow completeness is unclear, dispatch a sub-agent that reads `references/spec-flow-analyzer.md` — expanded to an absolute path by the parent, per `../ce-conventions/SKILL.md` §Sub-agent dispatch — and applies it to the planning context and research findings. Use the output to close edge-case and handoff gaps and tighten requirements trace — add only what materially improves the plan.

### Phase 2: Resolve Planning Questions

Build the question list from origin-doc deferrals, research gaps, and required technical decisions. Resolve during planning what is knowable from repo context, documentation, or user choice; defer to implementation what depends on code changes or runtime behavior. Ask the user only when the answer materially affects architecture, scope, sequencing, or risk and cannot be responsibly inferred. Do not run tests or probe runtime behavior here.

### Phase 3: Structure the Plan

#### 3.1 Title and File Naming

Draft a searchable conventional title (`feat: Add user authentication`), determine the type (`feat`/`fix`/`refactor`), and build the filename: `.ai/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.md` — create `.ai/plans/` if missing, derive the next zero-padded sequence number from today's existing files, keep the name concise kebab-case.

#### 3.2 Stakeholder Awareness

For Standard/Deep plans, briefly consider who is affected — users, developers, operations, other teams — and note affected parties in System-Wide Impact for cross-cutting work.

#### 3.3 Break Work into Implementation Units

Each unit is one meaningful change an implementer could land as an atomic commit: focused on one component or seam, touching a small cluster of related files, dependency-ordered, concrete without pre-writing code. Avoid micro-steps, multi-concern units, and units so vague the implementer must re-plan.

**U-ID stability (authoritative statement).** Each unit carries a stable plan-local U-ID (`U1`, `U2`, …). Once assigned, never renumbered: reordering preserves IDs in their new order, splitting keeps the original ID on the original concept and assigns the next unused number, deletion leaves gaps. This lets `ce-work` reference units unambiguously across plan edits; deepening is the most likely accidental-renumber vector.

#### 3.4 High-Level Technical Design

Include an HTD section when the approach has shape prose doesn't carry well — architecture across components, sequencing, state machines, branching gates, lifecycles, quantitative comparisons. Pick the medium that lands fastest (see `references/plan-sections.md` and the format-rendering reference for how visualizations render). Skip it when prose conveys the approach directly — HTD should earn its keep. Plan diagrams are authoritative content; do not add hedging captions.

#### 3.4b Output Structure (Optional)

For greenfield plans creating 3+ files in a new directory hierarchy where the layout is itself a design decision, include an `## Output Structure` file tree as a scope declaration (not a constraint — per-unit `**Files:**` lists stay authoritative). Skip when only modifying existing files.

#### 3.5 Define Each Implementation Unit

Each unit is a level-3 heading `### U1. [Name]` — never a checkbox list item (flush-left fields terminate list continuation and fragment in every standard renderer; headings render everywhere and give anchor links).

For each unit include:

- **Goal** — what this unit accomplishes
- **Requirements** — R-IDs advanced (and A/F/AE IDs when origin supplies them)
- **Dependencies** — cite by U-ID
- **Files** — repo-relative paths to create, modify, or test
- **Approach** — key decisions, data flow, boundaries, integration notes
- **Execution note** — optional, only for non-default posture (e.g., `Start with a failing integration test for the request/response contract.`). Never expand into RED/GREEN/REFACTOR substeps.
- **Technical design** — optional pseudo-code or diagram when the approach is non-obvious; directional guidance, not specification
- **Patterns to follow** — existing code or conventions to mirror
- **Test scenarios** — enumerate the specific cases, right-sized to complexity and risk, covering every applicable category: happy paths, edge cases (boundaries, empty/nil, concurrency), error and failure paths, and integration scenarios that mocks alone won't prove (callbacks, middleware, multi-layer). Each scenario names input, action, and expected outcome. Non-behavioral units use `Test expectation: none -- [reason]`. When a scenario directly enforces an origin Acceptance Example, prefix `Covers AE<N>.` — sparse by design; don't force links onto finer-grained tests.
- **Verification** — completion expressed as observable outcomes, not shell scripts

Every feature-bearing unit includes its test file path in **Files**.

#### 3.6 Keep Planning-Time and Implementation-Time Unknowns Separate

If something is important but not knowable yet (exact helper names, final SQL, runtime behavior, refactors that may become unnecessary), record it explicitly under deferred implementation notes rather than pretending to resolve it.

#### 3.7 Anti-Expansion

Known-but-tangential work noticed during planning — adjacent refactors, "while we're here" cleanups, scope-adjacent nice-to-haves — routes to `### Deferred to Follow-Up Work` in Scope Boundaries, not active units. The user's explicit ask overrides (a requested refactor is in scope).

### Phase 4: Write the Plan

**NEVER CODE during this skill.**

Depth changes the amount of detail, not the planning/execution boundary: **Lightweight** — compact, usually 2-4 units, omit low-value optional sections. **Standard** — full core template, usually 3-6 units, include risks/deferred/system-wide impact when relevant. **Deep** — core template plus warranted analysis sections, usually 4-8 units, phase-grouped when clearer.

**Optional Deep extensions** (only when they genuinely help, never boilerplate): Alternative Approaches Considered, Success Metrics, Dependencies/Prerequisites, Risk Analysis & Mitigation, Phased Delivery, Documentation Plan, Operational/Rollout Notes, Future Considerations. **Alternatives vary the HOW** — architecture, sequencing, boundaries, rollout. Tiny implementation variants belong in KTDs; product-shape alternatives belong upstream in `ce-brainstorm`.

**Section contract and rendering.** Compose from `references/plan-sections.md` (the section contract: hard floor, include-when-material catalog, agency escape hatch, ID/content rules) plus the format-rendering reference loaded at Phase 0.0. Omit immaterial sections — placeholder prose is worse than omission.

**Planning rules:** horizontal rules between top-level sections in Standard/Deep plans; repo-relative paths (state the target repo once when planning for another repo); prefer path+pattern references over line numbers; no implementation code (directional pseudo-code/DSL sketches allowed, framed as such); mermaid diagrams encouraged where they clarify; no git commands or test command recipes; no fake certainty about execution-time questions.

### Phase 5: Final Review, Write File, and Handoff

#### 5.1 Review Before Writing

Check that: the plan invents no product behavior that belonged in `ce-brainstorm`; major decisions are grounded in origin or research; units are concrete, dependency-ordered, and implementation-ready; posture signals carry forward as Execution notes; every feature-bearing unit has real test scenarios from each applicable category (the `none` annotation is only valid for non-feature-bearing units); deferred items are explicit; U-IDs follow the stability rule; and a visual aid is present where it would beat prose.

If the plan originated from a requirements document, re-read it and verify: the approach still matches product intent; scope boundaries and success criteria are preserved; blockers were resolved, assumed, or sent back; no origin section was silently dropped; origin R/F/AE IDs that affect implementation are referenced or explicitly deferred (preservation of intent, not ID spam); and a Deep-product origin's three-way scope split is preserved verbatim.

#### 5.1.5 Brainstorm-Sourced Scoping Synthesis

The latest cheap moment to catch plan-time scope errors, before 5.2 commits the plan to disk. Fires only when Phase 0.2 found an upstream requirements doc and not on 0.1 fast paths (solo invocations handled this at 0.7).

Read `references/synthesis-summary.md` and follow the brainstorm-sourced variant: internal three-bucket draft, call-outs via the keep and detail tests, two-paragraph summary (brainstorm restatement + plan-specific scoping decisions), confirmation gate. Auto-proceed only for Lightweight with zero call-outs. Headless: internal draft only; Inferred bets route to `## Assumptions`.

#### 5.2 Write Plan File

**Write the plan file to disk before presenting any options**: `.ai/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.<md|html>` (extension follows `OUTPUT_FORMAT`; sequence counts both extensions). Compose from `references/plan-sections.md` plus the loaded rendering reference. **Write tight** per the prose-economy discipline in plan-sections — before declaring it written, run the named test there.

Confirm with the absolute path so the reference is clickable: `Plan written to <absolute path>`.

**CONCEPTS.md gap-fill** (only if the file exists): add missing definitions for domain terms the plan uses — domain entities, named processes, status concepts only; follow existing entry format; apply silently.

#### 5.3 Confidence Check and Deepening

After writing, evaluate whether the plan needs strengthening. Two modes: **auto** (default during generation — findings synthesize directly into the plan) and **interactive** (the 0.1 re-deepen fast path — findings are reviewed with the user before integration). Pipeline runs are always auto.

`document-review` checks clarity, coherence, and scope; this confidence check strengthens rationale, sequencing, risk treatment, and grounding — both run.

**5.3.1 Classify:** confirm plan depth and build a risk profile (auth/security, payments, migrations and persistent data, external APIs, privacy/compliance, cross-surface parity, significant rollout/operational concerns are high-risk signals).

**5.3.2 Gate:** Lightweight plans usually skip deepening unless high-risk; Standard plans deepen when important sections look thin; Deep or high-risk plans usually benefit. Two overrides always send the plan to scoring: **thin local grounding** (1.2 triggered research because local patterns were thin — unfamiliar-territory claims are more likely assumptions) and **load-bearing external research** (the 1.4 flag — external findings can shape what local code cannot verify). If no deepening is needed, report "Confidence check passed — no sections need strengthening" and go directly to 5.3.8.

**5.3.3–5.3.7:** when deepening is warranted, read `references/deepening-workflow.md` and execute it, then return here.

#### 5.3.8–5.4 Document Review, Final Checks, and Handoff

Load `references/plan-handoff.md` for 5.3.8 (document review — mandatory for markdown plans regardless of the confidence check; HTML plans skip it per the format gate there), 5.3.9 (final checks and cleanup), and 5.4 (post-generation menu, routing, and Issue Creation).

This skill is complete only when the post-generation menu has been presented, the user selected an action, and the routed action was fired — not merely announced. Pipeline runs skip the menu and return to the caller after plan write + confidence check + headless document-review.
