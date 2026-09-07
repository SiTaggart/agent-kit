---
name: ce-brainstorm
description: 'Explore requirements and approaches through collaborative dialogue, then write a right-sized requirements document. Use when the user says "let''s brainstorm", "what should we build", or "help me think through X", presents a vague or ambitious feature request, or seems unsure about scope or direction -- even without explicitly asking to brainstorm.'
argument-hint: "[feature idea or problem to explore] [output:html]"
---

# Brainstorm a Feature or Improvement

Brainstorming helps answer **WHAT** to build through collaborative dialogue. It precedes `/ce-plan`, which answers **HOW** to build it.

The durable output of this workflow is a **requirements document**. In other workflows this might be called a lightweight PRD or feature brief. In compound engineering, keep the workflow name `brainstorm`, but make the written artifact strong enough that planning does not need to invent product behavior, scope boundaries, or success criteria.

## Loop Connections

- Use `qmd-knowledge-base` or Obsidian before inventing product history when
  prior context could affect the product frame.
- For Standard or Deep software brainstorms, build context with RepoPromptCE
  `context_builder` (see the `repoprompt` skill) to ground the product frame in
  existing constraints and ownership. Skip it only for non-software framing or a
  quick brainstorm over already-known code. It is context, not implementation
  planning.
- Use an installed design companion when available as a lens when the brainstorm touches UI,
  workflows, dashboards, components, accessibility, responsive behavior, or
  visual polish. Fold the guidance into the brainstorm; do not make design a
  separate side quest.
- Hand branchy requirements to `ce-grill` before `ce-plan`.
- Use `document-review` for requirements-doc quality, not `ce-review`.

## Core Principles

1. **Assess scope first** - Match the amount of ceremony to the size and ambiguity of the work.
2. **Be a thinking partner** - Suggest alternatives, challenge assumptions, and explore what-ifs instead of only extracting requirements.
3. **Resolve product decisions here** - User-facing behavior, scope boundaries, and success criteria belong in this workflow. Detailed implementation belongs in planning.
4. **Keep implementation out of the requirements doc by default** - Do not include libraries, schemas, endpoints, file layouts, or code-level design unless the brainstorm itself is inherently about a technical or architectural change.
5. **Right-size the artifact** - Simple work gets a compact requirements document or brief alignment. Larger work gets a fuller document. Do not add ceremony that does not help planning.
6. **Apply YAGNI to carrying cost, not coding effort** - Prefer the simplest approach that delivers meaningful value. Avoid speculative complexity and hypothetical future-proofing, but low-cost polish or delight is worth including when its ongoing cost is small and easy to maintain.
7. **Question the frame, not just fill it in** - When the idea builds on an existing system or a prior decision, treat that base as a candidate, not a fixed constraint. If the existing shape is the source of the difficulty, put replacing it on the table and weigh it by resulting complexity, not by how much already exists. A prior decision — even one the user or an earlier session made — can be reopened when evidence says it was wrong. Surface the reframe; do not quietly plan around a base you suspect is broken.

## Interaction Rules

These rules apply to every brainstorm, including the universal (non-software) flow routed to `references/universal-brainstorming.md`.

1. **Ask one question at a time** - One question per turn, even when sub-questions feel related. Stacking several questions in a single message produces diluted answers; pick the single most useful one and ask it.
2. **Prefer single-select multiple choice** - Use single-select when choosing one direction, one priority, or one next step.
3. **Use multi-select rarely and intentionally** - Use it only for compatible sets such as goals, constraints, non-goals, or success criteria that can all coexist. If prioritization matters, follow up by asking which selected item is primary.
4. **Default to the platform's blocking question tool** (see `../ce-conventions/SKILL.md`) - These tools include a free-text fallback (e.g., "Other" in Claude Code), so options scaffold the answer without confining it — well-chosen options surface dimensions the user may not have separated, and pick-plus-optional-note is lower activation energy than composing prose from scratch. This default holds for opening and elicitation questions too, not only narrowing.
5. **Use an open-ended question only when the question is genuinely open** - Drop the blocking tool only when (a) the answer is inherently narrative ("walk me through how you got here"), (b) the question is diagnostic or introspective and presented options would unintentionally influence the user's answer (e.g., "what concerns you most?" — a 4-option menu would nudge them toward those axes rather than the ones actually on their mind), or (c) you cannot write 3-4 genuinely distinct, plausibly-correct options that cover the space without padding or strawmen. The test: if you'd be straining to fill the option slots, the question is open — ask it open-ended. Rule 1 still applies: still one question per turn.
6. **Open-ended questions earn their place only when they're specific enough to elicit a substantive answer** - Apply Rule 5 silently: just ask the question, do not narrate the form choice. The question itself must give the user something concrete to anchor on. Good: *"What's the most concrete thing someone's already done about this — paid for it, built a workaround, quit a tool over it?"* (this is one of Phase 1.2's rigor probes — it earns its open-endedness by naming what counts as an answer). Too thin: *"What's your take?"* (nothing to bite into; user defaults to a one-liner that wastes the open question). Avoid (a) narrating the form choice ("the most useful question I can ask here is..."), (b) framings that imply a short answer ("briefly", "in one sentence"), (c) yes/no traps, and (d) AI-slop warmth wrappers ("take it wherever feels relevant").

## Output Guidance

- **Keep outputs concise** - Prefer short sections, brief bullets, and only enough detail to support the next decision.
- **Use repo-relative paths** - When referencing files inside generated documents, use paths relative to the repo root (e.g., `src/models/user.rb`), never absolute paths. Absolute paths break portability across machines, worktrees, and teammates.

## Feature Description

<feature_description> #$ARGUMENTS </feature_description>

**If the feature description above is empty, ask the user:** "What would you like to explore? Please describe the feature, problem, or improvement you're thinking about."

Do not proceed until you have a feature description from the user.

## Execution Flow

### Phase 0: Resume, Assess, and Route

#### 0.0 Resolve Output Mode

**Read config (pre-resolved at skill load):**
!`cat "$(git rev-parse --show-toplevel 2>/dev/null)/.compound-engineering/config.local.yaml" 2>/dev/null || echo '__NO_CONFIG__'`

Resolve `OUTPUT_FORMAT` per the output-mode rules in `../ce-conventions/SKILL.md`: `output:` arg > active `brainstorm_output:` key in the config above > `md`. Pipeline and `disable-model-invocation` invocations force `md`. Output mode is exclusive — the doc is `.md` OR `.html`, never both.

Load the rendering reference for the resolved format — `../ce-conventions/references/markdown-rendering.md` or `../ce-conventions/references/html-rendering.md`. Both pair with `references/brainstorm-sections.md`, which describes what the brainstorm contains regardless of format.

The `output:` preference does NOT auto-propagate to `ce-plan` on handoff — ce-plan re-resolves its own `plan_output` config independently. Asymmetric output (`requirements.html` + `plan.md`) is acceptable.

#### 0.1 Resume Existing Work When Appropriate

If the user references an existing brainstorm topic, or an obvious recent matching `*-requirements.{md,html}` file exists in `.ai/brainstorms/`: read it, confirm with the user ("Found an existing requirements doc for [topic]. Continue from this, or start fresh?"), and on resume summarize the current state, continue from its decisions and outstanding questions, and update the existing document instead of creating a duplicate.

Resume preserves the existing artifact's format. An explicit `output:` argument on this run overrides. Pipeline mode still forces `md` per Phase 0.0 — the resume writes the markdown file at the parallel path and leaves the original `.html` untouched.

#### 0.1b Classify Task Domain

Before proceeding, classify whether this is a software task: **does the task involve building, modifying, or architecting software?** — not whether it merely *mentions* software.

- **Software** — references code, repositories, APIs, databases, or asks to build/modify/debug/deploy software. Continue to Phase 0.2.
- **Non-software brainstorming** — no software signals, and the user wants to explore, decide, or think through something in a non-software domain. Read `references/universal-brainstorming.md` and use those facilitation principles; skip Phases 0.2–4. The Core Principles and Interaction Rules above still apply unchanged.
- **Neither** — a quick-help request, error message, factual question, or single-step task. Respond directly; skip all brainstorming phases.

#### 0.2 Assess Whether Brainstorming Is Needed

If requirements are already clear (specific acceptance criteria, referenced existing patterns, exact expected behavior, well-bounded scope): keep the interaction brief. Confirm understanding and present concise next-step options rather than forcing a long brainstorm. Only write a short requirements document when a durable handoff to planning or later review would be valuable. Skip Phases 1.1 and 1.2 entirely — go straight to Phase 1.3 or Phase 2.5, then Phase 3.

#### 0.3 Assess Scope

Use the feature description plus a light repo scan to classify the work:

- **Lightweight** - small, well-bounded, low ambiguity
- **Standard** - normal feature or bounded refactor with some decisions to make
- **Deep** - cross-cutting, strategic, or highly ambiguous

If the scope is unclear, ask one targeted question to disambiguate and then proceed.

**Deep sub-mode: feature vs product.** For Deep scope, also classify whether the brainstorm must establish product shape or inherit it:

- **Deep — feature** (default): primary actors, core outcome, positioning, and primary flows are already established in the product or repo. The brainstorm extends or refines within that shape.
- **Deep — product**: the brainstorm must establish product shape rather than inherit it — actors, core outcome, positioning, or primary end-to-end flows are materially unresolved. Existing code lowers the odds of product-tier but does not rule it out; a half-built tool with ambiguous shape is still product-tier.

Product-tier triggers additional Phase 1.2 questions and additional requirements-doc sections. Feature-tier uses the standard Deep behavior.

### Phase 1: Understand the Idea

#### 1.1 Existing Context Scan

Scan the repo before substantive brainstorming. Match depth to scope.

**Lightweight** — search for the topic, check if something similar already exists, move on.

**Standard and Deep**:

- *Constraints* — check `AGENTS.md`/`CLAUDE.md` for workflow, product, or scope constraints. Read `STRATEGY.md` if it exists — target problem, persona, and active tracks shape scope, success criteria, and which approaches are aligned. Read `CONCEPTS.md` if it exists — use its vocabulary in dialogue and the doc, mapping user synonyms back.
- *Topic scan* — search for relevant terms; read the most relevant existing artifact (brainstorm, plan, spec, skill) and skim adjacent examples.
- *Knowledge scan* — apply the prior-context route from Loop Connections when interviews, research, PRDs, meeting notes, or prior sessions could change scope, framing, constraints, or success criteria. Pull only what can change those.

If nothing obvious appears after a short scan, say so and continue. Two rules govern technical depth:

1. **Verify before claiming** — When the brainstorm touches checkable infrastructure (database tables, routes, config files, dependencies, model definitions), read the relevant source to confirm what actually exists. Any claim that something is absent must be verified against the codebase first; if not verified, label it an unverified assumption.
2. **Defer design decisions to planning** — Schemas, migration strategies, endpoint structure, and deployment topology belong in planning — unless the brainstorm is itself about a technical or architectural decision, in which case they are the subject.

**Slack context** (opt-in, Standard and Deep only) — never auto-dispatch; follow the Slack convention in `../ce-conventions/SKILL.md`. When Slack tools are available and the user hasn't asked, note once that Slack research is available on request.

#### 1.2 Product Pressure Test

Before generating approaches, scan the user's opening for rigor gaps. Match depth to scope.

This is agent-internal analysis, not a user-facing checklist. Read the opening, note which gaps actually exist, and raise only those as questions during Phase 1.3 — folded into the normal flow of dialogue, not fired as a pre-flight gauntlet. A fuzzy opening may earn three or four probes; a concrete, well-framed one may earn zero because no scope-appropriate gaps were found.

**Lightweight:**
- Is this solving the real user problem?
- Are we duplicating something that already covers this?
- Is there a clearly better framing with near-zero extra cost?

**Standard — scan for these gaps:**

- **Evidence gap.** The opening asserts want or need, but doesn't point to anything the would-be user has already done — time spent, money paid, workarounds built — that would make the want observable. When present, ask for the most concrete thing someone has already done about this.

- **Specificity gap.** The opening describes the beneficiary at a level of abstraction where the agent couldn't design without silently inventing who they are and what changes for them. When present, ask the user to name a specific person or narrow segment, and what changes for that person when this ships.

- **Counterfactual gap.** The opening doesn't make visible what users do today when this problem arises, nor what changes if nothing ships. When present, ask what the current workaround is, even if it's messy — and what it costs them.

- **Attachment gap.** The opening treats a particular solution shape as the thing being built, rather than the value that shape is supposed to deliver, and hasn't been examined against smaller forms that might deliver the same value. When present, ask what the smallest version that still delivers real value would look like.

Plus these synthesis questions — not gap lenses, product-judgment the agent weighs in its own reasoning:
- Is there a nearby framing that creates more user value without more carrying cost? If so, what complexity does it add?
- Given the current project state, user goal, and constraints, what is the single highest-leverage move right now: the request as framed, a reframing, one adjacent addition, a simplification, or doing nothing?

Favor moves that compound value, reduce future carrying cost, or make the product meaningfully more useful or compelling. Use the result to sharpen the conversation, not to bulldoze the user's intent.

**Deep** — Standard lenses and synthesis questions plus:
- Is this a local patch, or does it move the broader system toward where it wants to be?

**Deep — product** — Deep plus:

- **Durability gap.** The opening's value proposition rests on a current state of the world that may shift in predictable ways within the horizon the user cares about. When present, ask how the idea fares under the most plausible near-term shifts — and push past rising-tide answers every competitor could make.

- What adjacent product could we accidentally build instead, and why is that the wrong one?
- What would have to be true in the world for this to fail?

These questions force an explicit product thesis and feed the Scope Boundaries subsections ("Deferred for later" and "Outside this product's identity") and Dependencies / Assumptions in the requirements document.

#### 1.3 Collaborative Dialogue

Follow the Interaction Rules above.

- Ask what the user is already thinking before offering your own ideas — this surfaces hidden context and prevents fixation on AI-generated framings.
- Start broad (problem, users, value) then narrow (constraints, exclusions, edge cases).
- **Probe every scope-appropriate rigor gap from Phase 1.2 open-ended before Phase 2, attachment last.** One probe per gap, interleaved naturally with narrowing moves. Open-ended per Interaction Rule 5(b): a menu signals which kinds of evidence count and lets the user pick rather than produce. If an answer reveals genuine uncertainty, record it as an explicit assumption in the requirements document rather than skipping the probe.
- Clarify the problem frame, validate assumptions, and ask about success criteria.
- Make requirements concrete enough that planning will not need to invent behavior.
- Surface dependencies or prerequisites only when they materially affect scope.
- Resolve product decisions here; leave technical implementation choices for planning.
- Bring ideas, alternatives, and challenges instead of only interviewing.

**Before exiting Phase 1.3: integration check.** Mentally combine what the user has said so far and surface any non-obvious consequences the dialogue hasn't probed. If user-stated X plus user-stated Y plus your-default-Z produces a downstream effect the user is unlikely to have tracked through one-question-at-a-time dialogue, probe it now — one open-ended probe per genuine combination effect. Phase 2.5's call-outs are a safety net for residuals, NOT a punt list for consequences you could have asked about now.

**Exit condition:** Continue until the idea is clear AND no integration-check questions are pending, OR the user explicitly wants to proceed.

### Phase 2: Explore Approaches

If multiple plausible directions remain, propose **2-3 concrete approaches** based on research and conversation. Otherwise state the recommended direction directly.

Use at least one non-obvious angle — inversion (what if we did the opposite?), constraint removal (what if X weren't a limitation?), or analogy from how another domain solves this. The first approaches that come to mind are usually variations on the same axis.

Present approaches first, then evaluate. Let the user see all options before hearing which one is recommended — leading with a recommendation anchors the conversation prematurely.

When useful, include one deliberately higher-upside alternative: the adjacent addition or reframing that would most increase usefulness, compounding value, or durability without disproportionate carrying cost. Present it as a challenger option, not the default. Omit it when the work is already over-scoped or the baseline request is clearly right.

At product tier, alternatives should differ on *what* is built (product shape, actor set, positioning), not *how* it is built. Implementation-variant alternatives belong at feature tier.

For each approach, provide: a brief description (2-3 sentences), pros and cons, key risks or unknowns, and when it's best suited.

**Approach granularity: mechanism / product shape, not architecture.** Approach descriptions name mechanism-level distinctions ("pause as a rule property" vs "pause as an event filter" vs "pause as a separate entity") and product-relevant trade-offs (plan-tier coupling, complexity surface, migration difficulty). They do NOT name implementation specifics — column names, table names, file paths, service classes, JSON shapes, exact method names. Those are ce-plan's job. Bringing architecture forward forces the user to make architectural decisions on intentionally-shallow research, and the synthesis then has to filter out the leak.

After presenting all approaches, state your recommendation and explain why. Prefer simpler solutions when added complexity creates real carrying cost, but do not reject low-cost, high-value polish just because it is not strictly necessary.

If one approach is clearly best and alternatives are not meaningful, skip the menu and state the recommendation directly. If relevant, call out whether the choice reuses an existing pattern, extends an existing capability, or builds something net new.

### Phase 2.5: Synthesis Summary

Before composing the synthesis, read `references/synthesis-summary.md` — the two-stage shape (internal three-bucket draft → chat-time scoping synthesis), the Path A / Path B gate, the section keep tests, detail discipline, soft-cut behavior, and doc routing all live there.

Surface a scoping synthesis to the user before Phase 3 writes the requirements doc — the user's last opportunity to correct scope before the artifact lands. It is shaped like what two product collaborators would confirm before writing a PRD, not a comprehensive audit or a one-line preview. Every bullet must pass the affirmability test (can the user evaluate this without reading code?) and the detail test (1–2 lines, conversational not documentary).

Fires for **all tiers** including Lightweight. Skip entirely on the Phase 0.1b non-software route.

Presentation follows the Path A / Path B gate in the reference: announce-and-write for Lightweight scope with no blocking questions; full synthesis with a confirmation gate whenever real dialogue happened or the tier is Standard/Deep.

### Phase 3: Capture the Requirements

Write or update a requirements document only when the conversation produced durable decisions worth preserving — see `references/brainstorm-sections.md` "Decide whether a doc is warranted at all" for the criteria and the bug-fix stress test. Skip document creation when the user only needs brief alignment and the decisions can flow downstream (ce-plan, commit message, .ai/solutions/) without a brainstorm artifact in the middle.

When a doc is warranted, compose it using:

- `references/brainstorm-sections.md` — section contract (outcomes, hard floor, include-when-material catalog, agency rules, ID conventions).
- The format-specific rendering reference loaded at Phase 0.0 — how the resolved format presents the sections.

**Write tight.** A section being material is not license to pad it. Hold every kept section to the prose-economy discipline in `references/brainstorm-sections.md`: one idea per sentence, a requirement is intent plus at most one qualifier, defer forks to Outstanding Questions rather than specifying both arms, resolve superseded text in place rather than stacking strata. Before declaring the doc written, run the named test there — could a reader find a contradiction in each section in one pass?

Write to `.ai/brainstorms/YYYY-MM-DD-<topic>-requirements.<md|html>` — extension follows `OUTPUT_FORMAT`. Confirm with the absolute path so the reference is clickable.

#### Vocabulary Capture — after the requirements doc (only if CONCEPTS.md already exists)

**Skip entirely if `CONCEPTS.md` does not exist at repo root** — creation is owned by ce-compound and ce-compound-refresh.

Run this after the approaches, the scope synthesis, and the requirements doc — that is where the canonical term gets chosen or corrected. Scan the dialogue and doc for **resolved** domain terms — terms the conversation actively pinned to a precise local meaning, not terms mentioned in passing or still under discussion. For each: add if missing, refine if new precision surfaced, no action if consistent. Domain entities, named processes, and status concepts with project-specific meaning only — not file paths, class names, or implementation decisions. Follow the format of existing entries; apply edits silently. (If Phase 3 skipped the doc, still run this against the resolved dialogue.)

### Phase 4: Handoff

Present next-step options and execute the user's selection. Read `references/handoff.md` for the option logic, dispatch instructions, and closing summary format.
