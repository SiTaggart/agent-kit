# Scoping Synthesis

**Scoping synthesis ≠ plan doc.** The synthesis is the scope/decisions checkpoint that plan-write (Phase 5.2) consumes. It surfaces decisions the agent CAN make at synthesis time — scope coverage, posture (extend vs. introduce), test approach. It does NOT surface plan-write outputs: PR count, commit/branch sequencing, effort estimates, Implementation Unit lists, exact file paths, test commands. If the synthesis claims any of those, re-cut to scope-decisions only — even when the agent has already formed plan-write opinions.

**Two-stage shape.** Stage 1 is an internal three-bucket draft the agent thinks with; stage 2 is the compressed chat output the user sees. The comprehensive audit shape pasted verbatim produced too much detail to weigh in on — that is why the split exists.

## Stage 1: internal three-bucket draft

- **Stated** — what the user said directly (prompt, dialogue answers, upstream brainstorm doc). Explicit user-language anchors.
- **Inferred** — the agent's bets that fill gaps: scope boundaries never named, extrapolated success criteria, technical assumptions. The most actionable bucket.
- **Out of scope** — deliberately excluded items: adjacent work, refactors, nice-to-haves.

Compose internally; never paste it into chat.

## Stage 2: chat-time synthesis

**Solo variant (Phase 0.7)** — no upstream doc, so the synthesis IS the scope claim: what the plan will target and not target, at affirm-or-redirect level, plus call-outs. Fires pre-research so scope errors are caught before sub-agent dispatch is spent. Stays at the higher level ("the rule entity", not "syncRules table") since the WHAT hasn't been validated. When rich in-session context exists, the granularity rules tighten, not loosen — validated upstream bets are Stated, and detail compresses harder.

**Brainstorm-sourced variant (Phase 5.1.5)** — fires post-research, pre-write. Two paragraphs plus call-outs: (1) a 1-2 sentence restatement of the brainstorm's scope in its own vocabulary — orientation, not enumeration; (2) plan-specific scoping decisions the brainstorm did not make: full coverage vs. narrowed subset, adjacent refactors in or out, test scope at scenario level. Derive plan-time decisions from the brainstorm doc's body sections (Summary, Problem Frame, Requirements, Key Decisions, Scope Boundaries) plus research. File/module/pattern/column names are allowed when those ARE the plan-time decisions; implementation-flow specifics never are.

**Required content of the confirmation message** (phrase it naturally; don't template): the scope claim (or restatement + plan-specific decisions), a `**Call outs:**` list when any survive (omit the header at zero), and an explicit confirm request that names what happens next ("Confirm and I'll proceed to research…" / "…write the plan next"). Solo confirmations also offer the `/ce-brainstorm` redirect for scope that grew.

**Auto-proceed** (Lightweight depth AND zero call-outs only): a 1-3 line announcement — "Planning: [scope claim]. No open decisions to weigh in on — proceeding. Interrupt if I have the scope wrong." — then continue without blocking. The announcement is mandatory; silent proceeding is not allowed. Standard and Deep always fire the confirmation gate, even with zero call-outs — substance earns the checkpoint, not interaction history. Responses to auto-proceed arrive as prose (no question menu — an option menu would bias the feedback).

### The keep test (per call-out)

First the **affirmability test**: would the user need to read code to evaluate this? If yes, it is plan-body content — cut. If no, keep only when one of these holds:

- **Real fork** — another reasonable agent might choose differently on this dimension
- **Non-obvious behavioral choice** — a default the user would not infer from the summary but that materially affects the plan
- **Non-obvious exclusion** — something deliberately excluded the user might want back
- **Cheap-now-expensive-later correction** — a bet best redirected before research or plan-write

Cut mechanical items with no real alternative, implementation choices settled during the work, and items already implied by the summary.

### The detail test (per surviving item)

1-2 lines, conversational not documentary: name the choice plus at most a one-clause trade-off — no multi-sentence rationale, no "my default is X" pitch (those belong in Key Technical Decisions). A 4+-line call-out is naming an implementation consequence, not a decision — re-cut at higher abstraction.

### Sizing

Budgets are ceilings, not targets: summaries run 1-3 lines (Lightweight) up to ~6 lines or bullets (Deep); call-outs typically 0-2 (Lightweight) up to ~5 with a cap of 6 (Deep). When a pass exceeds its ceiling, don't raise the cap — collapse related call-outs into the single decision the user actually weighs in on. Read them aloud: two that sound like "and also" extensions of the same idea belong as one.

### Shared rules

- Summary leads, call-outs follow — no framing block above them.
- Source-document vocabulary; no agent-coded shorthand; plain names instead of bare IDs.
- **Pre-emit scan:** replace bare ID references (`AE\d+`, `R\d+`, `F\d+`, `A\d+`, `U\d+`) with plain names; cut file paths unless the path IS the topic of an explicit fork.
- **No plan-pitch.** File paths, code shapes, JSON/response formats, HTTP codes, exact error wording, method signatures, SQL, "Recommendation"/"Why this shape" rationale — plan-body content anywhere in chat output, including nested inside a call-out.
- **No numerical attestation.** "All nine requirements covered" is showing work, not naming a decision. Keep the scope claim, cut the counts.
- **A revision is not a confirmation.** After any user revision, integrate, re-present the revised synthesis, and wait for explicit confirmation. Plan-write fires only on explicit confirm or the soft-cut's "proceed".
- **No floating questions beside the synthesis.** Resolve genuine blockers before presenting; every scope-shaping question is by then Stated, Inferred, or Out.

### Bad-vs-good granularity

| Plan-body in call-out (wrong) | Decision-level (right) |
|---|---|
| Timezone source: `users.timezone` (IANA), fallback to destination calendar TZ if null. Research found `useTimezoneSync` establishes the pattern. | Timezone source: user-TZ (reverses brainstorm's tentative lean — research found established infra) |
| Skip filter goes in `RuleMatcher.eventMatchesRule` at the top, before include/exclude evaluation, using the existing `filteredReason` mechanism. | Skip filter extends the existing event-skip pattern in the matcher (vs. introducing a new mechanism) |
| Partial cleanup failure response: `{pause, cleanup: {eventsDeleted, eventsFailed, errors}}`; pause window persists regardless. | Partial cleanup failure: pause window persists; response mirrors the existing rule-edit precedent |

The test: a scanner should affirm or reject each call-out without looking up a column name, method, or call graph.

### Worked example: compression

For a PII redaction gate where the internal draft had 4 Stated, 7 Inferred, and 3 Out-of-scope items, stage 2 compressed to:

```
Planning a mechanical PII redaction gate before promote (the unguarded leak path from the amazon-orders retro) and alongside the existing vendor-prefix scanner at publish. Phase-1 detectors are shape-only — card last-4, postal address, JSON person names. Default halts; per-finding ack via flag.

**Call outs:**
- Person-name filter works by JSON key (allowlist of attribution keys), not by name value.
- Promote scans the working-dir snapshot before the copy step, not the staged copy.
- Publish combines PII + vendor-prefix findings into one report, not fail-fast on first.

Confirm and I'll proceed to research, drawing on this scope.
```

Cut: the module path and exact flag string (fail affirmability), "no new dependencies" (mechanical), regex precision (deferred-impl), all three Out-of-scope items (restated in prose or implicitly excluded). Survived: three real forks, each affirmable in one sentence.

## Soft-cut on circularity

Track which call-outs the user touched per round. When the same call-out is revised twice, fire a blocking question — `Proceed and continue` vs `Hold off — keep discussing`. Identity is by decision dimension, not surface wording: a rephrased, merged, or split call-out inherits the "touched" status of its constituents. New-call-out revisions proceed without limit.

## Headless mode

No synchronous user, so stage 2 is moot: compose the internal draft and continue (solo: to research; brainstorm-sourced: to plan-write). Route the draft into the plan body: **Stated** → Requirements; **Out of scope** → Scope Boundaries; **Inferred** → a `## Assumptions` section explicitly labeled as un-validated agent bets — never into Key Technical Decisions or Implementation Units, where they would be indistinguishable from user-confirmed decisions. `## Assumptions` appears in non-interactive plans only.

## Self-redirect

If the user's response signals the wrong skill — "bigger than I thought" (`/ce-brainstorm`), "just a fix" (`/ce-work`), "need to investigate first" (`/ce-debug`) — stop, suggest the alternative, offer to load it. Don't argue.

## Doc shape after confirmation

The internal draft does not carry into the plan as a `## Synthesis` section. The stage-2 summary embeds as `## Summary` (1-3 lines, forward-looking); Stated informs Requirements and Problem Frame; Inferred informs Key Technical Decisions and units (interactive) or `## Assumptions` (headless); Out-of-scope informs Scope Boundaries. No provenance notes ("Captured at Phase 0.7…"). Summary answers "what is this plan proposing?"; Problem Frame answers "why does this proposal exist?" — don't restate one in the other.
