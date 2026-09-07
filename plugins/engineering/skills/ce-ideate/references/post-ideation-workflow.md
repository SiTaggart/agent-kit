# Post-Ideation Workflow

Read this file after Phase 2 ideation agents return and their outputs are merged and deduped. It carries the critique rubric, artifact contract, and wrap-up menu for all modes.

## Phase 3: Adversarial Filtering

Critique every candidate directly in the orchestrator — no critique sub-agents, and no replacement ideas unless explicitly refining. Every rejection gets a one-line reason.

Rejection criteria: too vague; not actionable; duplicates a stronger idea; not grounded in the stated context; too expensive relative to likely value; already covered by existing workflows or docs; better handled as a brainstorm variant; **unjustified** (no articulated basis, or the stated basis does not actually support the claimed move); **below ambition floor** (fails the meeting-test — waived under tactical scope); **subject-replacement** (abandons the subject rather than operating on it); **scope overrun** (expands beyond the asked slice without a basis that justifies it).

Score survivors weighing: groundedness, **basis strength** (`direct:` > `external:` > `reasoned:`; none excluded), expected value, novelty, pragmatism, leverage on future work, implementation burden, overlap with stronger ideas, and **axis spread** when axes exist — spread is a list-level concern applied after per-idea filtering: prefer borderline candidates on under-represented axes, and record any axis with zero survivors as a deliberate gap in the rejection summary.

Keep 5-7 survivors by default. Too many → a second, stricter pass. Fewer than 5 → report that honestly rather than lowering the bar.

## Phase 4: Present the Survivors

First write `<scratch-dir>/survivors.md` (survivor list + focus hint, grounding summary, rejection summary) — best-effort checkpoint; warn and proceed on failure.

Present each survivor: title, description, axis (when axes exist), basis (tagged, with the quoted evidence, cited source, or written-out argument), rationale, downsides, confidence score, estimated complexity. Follow with a brief rejection summary so the user sees what was considered and cut. Keep it concise; allow lightweight follow-up.

## Phase 5: Persistence (Opt-In)

The terminal review loop is a complete ideation cycle — persistence triggers only when the user chooses Brainstorm or Save in Phase 6 (which need a durable record first) or asks directly. Honor explicit path overrides.

Save to `.ai/ideation/YYYY-MM-DD-<topic>-ideation.md` (`-open-ideation` when no focus), creating the directory if needed. When resuming, update the existing file in place and preserve explored markers. Structure:

```markdown
---
date: YYYY-MM-DD
topic: <kebab-case-topic>
focus: <optional focus hint>
mode: <repo-grounded | elsewhere-software | elsewhere-non-software>
---

# Ideation: <Title>

## Grounding Context
[Grounding summary from Phase 1]

## Topic Axes
[Axis list, or the skip line recorded in Phase 1.5. Omit when not applicable.]

## Ranked Ideas

### 1. <Idea Title>
**Description:** / **Axis:** / **Basis:** / **Rationale:** / **Downsides:** / **Confidence:** / **Complexity:** / **Status:** [Unexplored / Explored]

## Rejection Summary

| # | Idea | Reason Rejected |
|---|------|-----------------|
[Include unrecovered axis gaps as rows: `axis: <name> — recovery skipped (cap reached)`]
```

## Phase 6: Refine or Hand Off

Ask what should happen next with the platform's blocking question tool (see `../ce-conventions/SKILL.md`). Offer three options:

1. **Refine the ideation in conversation (or stop here — no save)** — add ideas (return to Phase 2), re-evaluate or raise the bar (return to Phase 3), or dig deeper on one idea. No file or network side effects; ending the conversation here is a valid no-save exit.
2. **Brainstorm a selected idea** — write the durable record via Phase 5, mark the chosen idea `Explored`, then load `ce-brainstorm` with it as the seed. In repo mode, never skip brainstorming and go straight to `ce-plan`. In elsewhere modes, ideation is a legitimate terminal state and brainstorm develops the idea further rather than starting an implementation chain.
3. **Save and end** — persist via Phase 5, then end. Offer to commit only the ideation doc (no branch, no push); leave uncommitted if declined.

Leave `<scratch-dir>` in place on completion — checkpoints are cheap, session-scoped artifacts later invocations can find.

## Quality Bar

Before finishing, confirm: the set is grounded in the stated context; every survivor carries a basis that actually supports its move and passes the meeting-test (unless waived); no survivor replaces the subject; axis spread was applied and zero-survivor axes are recorded as deliberate gaps; the full candidate list existed before filtering and every rejection has a reason; survivors are materially better than a naive "give me ideas" list; persistence followed user choice; and acting on an idea routes to `ce-brainstorm`, not directly to implementation.
