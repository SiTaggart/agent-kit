---
name: ce-ideate
description: "Generate and evaluate grounded ideas. Use for 'what should I improve', 'give me ideas', 'ideate', 'surprise me', or 'what would you change'."
argument-hint: "[feature, focus area, or constraint]"

---

# Generate Improvement Ideas

`ce-ideate` precedes `ce-brainstorm`.

- `ce-ideate` answers: "What are the strongest ideas worth exploring?"
- `ce-brainstorm` answers: "What exactly should one chosen idea mean?"
- `ce-plan` answers: "How should it be built?"

This workflow produces a ranked ideation artifact in `.ai/ideation/`. It does **not** produce requirements, plans, or code.

## Interaction Method

Use the platform's blocking question tool (see `../ce-conventions/SKILL.md`). Ask one question at a time; prefer concise single-select choices when natural options exist.

## Focus Hint

<focus_hint> #$ARGUMENTS </focus_hint>

Interpret any provided argument as optional context: a concept (`DX improvements`), a path, a constraint (`low-complexity quick wins`), or a volume hint (`top 3`, `100 ideas`, `raise the bar`). If no argument is provided, proceed with open-ended ideation.

## Core Principles

1. **Ground before ideating** - Scan the actual context first. Do not generate abstract advice detached from the subject.
2. **Generate many -> critique all -> explain survivors only** - The quality mechanism is explicit rejection with reasons, not optimistic ranking.
3. **Route action into brainstorming** - Ideation identifies promising directions; `ce-brainstorm` defines the selected one precisely enough for planning.

## Execution Flow

### Phase 0: Resume and Scope

#### 0.1 Check for Recent Ideation Work

Look in `.ai/ideation/` for ideation documents from the last 30 days whose topic, path, or subsystem matches the requested focus (issue-grounded and non-issue ideations are distinct topics). If one exists, ask whether to continue from it or start fresh. If continuing: read it, summarize what was explored, preserve idea statuses, and update the file instead of creating a duplicate.

#### 0.2 Subject-Identification Gate

Downstream agents need to know what they are working on. The test: would a reader, seeing only this prompt, know what subject to ideate on? Judge by what the words *refer to*, not their length — a two-word phrase can name a feature (identifiable) or a catch-all quality like "quick wins" (vague). Being inside a repo does not settle vagueness: "improvements" is still scattered across DX, reliability, features, and docs — the repo supplies grounding after a subject is settled, not the subject itself. When judgment leaves real doubt on a short phrase in repo mode, a cheap Glob/Grep for the phrase settles it: repo footprint means identifiable.

Questions exist only to supply what sub-agents need: an identifiable subject here, and substance in 0.4. Never ask about solution direction, constraints, audience, tone, or success criteria — those belong to `ce-brainstorm`. If a question or two doesn't settle the subject, suggest `ce-brainstorm` instead.

**Issue-tracker intent (repo mode only).** Trigger only on an explicit reference to the tracker or reports filed in it (`open issues`, `issue themes`, `what users are reporting`, `bug reports`). Mentions of a bug as a focus (`bug in auth`, `top 3 bugs in authentication`) are focus hints on regular ideation, not tracker intent. When combined, tracker intent sets the mode, the volume override goes to 0.5, and the remainder narrows which issues matter.

**When the subject is vague, ask the scope question** with options: specify a subject / "Surprise me — let the agent decide what to focus on" / cancel. On specify, re-apply the test once (keep Surprise me on the retry menu). On cancel, exit cleanly.

**Surprise-me mode** — a first-class mode, never a fallback for users who can't name a subject; ideation is allowed to be greenfield by design. Its whole contract:

- Repo CWD → repo-grounded. Agents discover their own subjects from Phase 1 grounding, so grounding must be richer than specified mode (sample representative files per area, recent PR/commit activity, issue themes as first-class input) and each agent explores more deeply through its frame's lens. Different frames finding different subjects is the feature; cross-cutting synthesis is the magic layer (expect 5-8 combinations). An idea's basis may include why the subject itself is worth ideating on, citing the grounding signal.
- Non-repo CWD → elsewhere-software, and at least one piece of substance (URL, description, draft, paste) is required before dispatch — after one refused ask, say the run needs material and end cleanly.
- Skip mode classification (0.3), topic decomposition (1.5, note `Decomposition skipped — surprise-me mode`), and the axis-coverage machinery — there is no settled subject. The user corrects by re-invoking with a named subject.

#### 0.3 Mode Classification

Classify the settled subject for dispatch routing — a user in any repo can ideate about something unrelated to it:

- **Repo-grounded** when the topic lives in this codebase (repo files, architecture, workflows; issue-tracker intent is always repo-grounded).
- **Elsewhere-software** when the subject is a software artifact outside this repo — product, app, page, flow — even when the ideas are about copy, UX, or pricing *for* it.
- **Elsewhere-non-software** for topics with no software surface: naming, narrative, personal decisions, non-digital business, physical products.

State the inferred approach in one plain-language sentence (never print these internal labels); the user corrects in their own words if wrong. Ask a confirmation question only on genuine ambiguity ("our docs": repo docs vs public marketing docs), with two plain-language options.

For non-software: run Phase 1 elsewhere grounding (skip learnings-researcher — `.ai/solutions/` engineering patterns rarely transfer to non-digital topics), then follow `references/universal-ideation.md`, which adapts generation and wrap-up for non-software domains. Never run the codebase scan.

#### 0.4 Context-Substance Gate (Elsewhere Modes Only)

Skip in repo mode. Elsewhere, apply the discrimination test: would swapping one piece of the user's stated context for a contrasting alternative change which ideas survive? If yes, context is load-bearing — proceed. If no, ask 1-3 questions supplying substance (a URL or file, a description of current state, a paste), re-applying the test after each answer. Stop on dismissive responses — treat "no context" as a real answer and note thin context so Phase 2 compensates with broader generation. Rich up-front context: confirm in one line and skip. If intake shifts the subject (not just adds context), re-run 0.2/0.3 before dispatching.

#### 0.5 Focus and Volume

Infer the focus context (concept, path, constraint, or open-ended) and any volume override (`top 3`, `100 ideas`, `go deep`, `raise the bar`) by reasonable interpretation, not formal parsing. **Tactical scope:** signals like `polish`, `typos`, `quick wins`, `cleanup` mean the user opted into tactical scope — lower the Phase 2 ambition floor.

#### 0.6 Cost Notice

Before dispatching, state the agent count and skip phrases in one informational line (no acknowledgment needed), computed from the actual dispatch decision.

### Phase 1: Mode-Aware Grounding

Set up per-run scratch once: `SCRATCH_DIR="/tmp/compound-engineering/ce-ideate/<run-id>"` (8-hex run-id; use `/tmp`, not `$TMPDIR`, so artifacts stay findable across sessions), `mkdir -p` it, and use the echoed absolute path for checkpoints. Leave it in place at the end of the run.

Run grounding sub-agents in parallel in the foreground; `learnings-researcher` and `web-researcher` are skills the sub-agent loads (or reads as SKILL.md files by absolute path when sub-agents cannot load skills; see `../ce-conventions/SKILL.md` §Sub-agent dispatch). Failures never block: warn ("... unavailable: {reason}. Proceeding.") and continue.

**Repo mode:** (1) a quick context scan by a cheap general-purpose sub-agent — read AGENTS.md/CLAUDE.md/README.md and STRATEGY.md when present, discover top-level layout, return a concise summary of project shape, patterns, pain points, leverage points, and strategy tracks. When the focus hint names root-level `*.md` files, the scan reads those fully and returns them under `User-named references` (Phase 2 treats them as constraint); other root-level markdown gets one-line gists under `Additional context` (background). Keep the scan shallow otherwise. (2) `learnings-researcher` with a brief focus summary. (3) `web-researcher` (below). (4) Issue intelligence, only when tracker intent fired and the repository provides an issue-intelligence persona or tool — on error or fewer than 5 issues, note it and fall back to default frames.

**Elsewhere modes:** (1) user-context synthesis by a cheap sub-agent — structure the user-supplied context to mirror the codebase-scan shape (topic shape, stated constraints, named pain points, opportunity hooks) so Phase 2 stays agnostic to grounding source. (2) `learnings-researcher` (elsewhere-software only). (3) `web-researcher`.

**Web research** is always-on in every mode; honor skip phrases ("no external research") and note the skip. If web research already ran this session for this topic or repo, reuse it instead of re-dispatching and note "(reused from earlier dispatch)". Pass the focus hint, a one-sentence context summary, and the mode — no codebase content.

**Slack context** is opt-in in every mode — never auto-dispatch. When Slack tools exist but the user didn't ask, mention availability; when asked but unreachable, surface the install hint.

Consolidate results into a short grounding summary with sections (omit empty ones): Codebase/Topic context, User-named references, Additional context, Past learnings, Issue intelligence, External context, Slack context.

### Phase 1.5: Topic-Surface Decomposition

Decompose the topic into 3-5 orthogonal **axes** naming *what aspects of the subject to think about*. Frames determine *how to think* (the lens); axes determine *what to think on* (the surface) — lens diversity alone does not produce surface coverage, because parallel frames converge on whichever interpretation is most salient. This is orchestrator-side analysis of the grounding summary: no sub-agent, no user question.

Axes must be orthogonal (one idea falls on one axis), derived from the grounding rather than a generic template, at the same level of granularity, and named in the topic's language ("send mechanics", not "outbound flow optimization"). Example: "dark mode for our app" → visual surfaces; toggle UX; system-preference detection; asset variants; third-party content edge cases.

**Skip when atomic** — the deliverable is a single string (a name, a tagline), a tactical fix, or the candidate axes *are* the deliverable. When 3+ qualifying axes don't emerge, note `Decomposition skipped — atomic subject`. (Surprise-me always skips, per 0.2.) Append the axis list or skip-reason to the grounding summary under `Topic axes`.

### Phase 2: Divergent Ideation

Generate the full candidate list before critiquing any idea. Dispatch parallel ideation sub-agents on the inherited model (creative ideation needs the orchestrator's reasoning level; do not override the sub-agent's permission mode). Six sub-agents by default; four when issue-tracker intent fired AND issue intelligence returned usable themes. Each generates ~6-8 ideas; volume overrides adjust per-agent targets or survivor counts.

Give each sub-agent: the grounding summary, the focus hint, the volume target, the axis list when one exists, and an instruction to generate raw candidates only — the first few ideas tend to be obvious, push past them.

**Constraint vs background.** Mark the user's prompt, focus hint, and User-named references as *constraints* — ideas violating them are out regardless of basis. Mark the rest of the grounding as *background* — it can support a basis but must not pull ideation toward whatever was loudest in the corpus when the user named a different focus.

**Axis spread.** When axes exist, each idea is tagged with the one axis it most centrally targets, and each agent distributes ideas across the axes its frame plausibly reaches. When decomposition was skipped, omit axis instructions entirely.

Assign each sub-agent a different frame as a **starting bias, not a constraint** — begin from the assigned perspective, follow promising threads, and value cross-cutting ideas:

1. **Pain and friction** — what is consistently slow, broken, or annoying.
2. **Inversion, removal, or automation** — invert a painful step, remove it, or automate it away.
3. **Assumption-breaking and reframing** — what is treated as fixed that is actually a choice.
4. **Leverage and compounding** — choices that make many future moves cheaper or stronger.
5. **Cross-domain analogy** — how structurally analogous problems are solved anywhere else; push past the obvious analogy.
6. **Constraint-flipping** — invert the obvious constraint to its opposite or extreme; the resulting design is a candidate even when the flip isn't realistic.

**Issue-tracker override:** each high/medium-confidence theme becomes a frame; pad from the default pool to at least 3, cap at 4 total.

**Per-idea contract (uniform everywhere):** title; summary (2-4 sentences); axis (when axes exist); **basis** (required, tagged): `direct:` quoted line / specific file / named issue / explicit user context, `external:` named prior art or research with source, or `reasoned:` a written-out first-principles argument, not a gesture; why_it_matters connecting basis to significance; meeting_test — one line confirming this would warrant team discussion (waived under tactical scope). An idea without an articulable basis does not surface — the failure mode to prevent is plausible-sounding AI slop the user cannot verify.

**Generation rules:** bias toward the basis type the frame naturally produces without excluding others; apply the meeting-test floor unless tactical scope waived it; stay within the subject's identity (expansions and pivots are fair game with basis; subject-replacement is out regardless); honor the asked scope — when the focus names a slice, ideate at full ambition *within* it rather than widening the surface.

After sub-agents return: merge and dedupe; synthesize cross-cutting combinations (3-5 additions in specified mode); when axes exist, check per-axis coverage and dispatch at most 2 recovery sub-agents (~3-5 ideas each) for empty axes, noting unrecovered gaps in the rejection summary; weight toward the focus without excluding stronger adjacent ideas. Then write `<scratch-dir>/raw-candidates.md` with the full attributed candidate list (best-effort checkpoint — warn and proceed on failure).

Then load `references/post-ideation-workflow.md` — it carries the critique rubric, artifact contract, and wrap-up menu for both modes (universal-ideation delegates persistence here). Do not load it before dispatch completes.
