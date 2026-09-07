# Synthesis Summary

**Synthesis ≠ requirements doc.** The synthesis is the scope checkpoint that doc-write consumes as input — not a preview, draft, or substitute for the doc. Both stay scope-only; implementation detail (file paths, code shapes, exact error wording) is ce-plan's job.

Loaded when Phase 2.5 fires — after approaches are chosen, before the doc is written. It is the user's last opportunity to correct the agent's interpretation before the artifact lands: the user agreed to many individual things in dialogue but never saw the whole.

**Two-stage shape.** Stage 1 is an internal three-bucket draft the agent uses to think comprehensively about scope. Stage 2 is the scoping synthesis the user sees — shaped like what two product collaborators would confirm before writing a PRD. The user never sees stage 1 verbatim; the comprehensive-audit shape produced too much detail to weigh in on. The internal draft still informs the doc body via the routing at the end of this file.

Fires for **all tiers** including Lightweight; skip entirely on the non-software (universal-brainstorming) route. The skill is interactive by design — if an automated workflow needs a requirements doc without dialogue, write the doc from context directly instead of invoking `ce-brainstorm`.

## Stage 1: internal three-bucket draft

- **Stated** — what the user said directly (prompt, prior conversation, dialogue answers, approach selection). Explicit user-language anchors.
- **Inferred** — what the agent assumed to fill gaps: unstated scope boundaries, extrapolated success criteria, unprobed technical assumptions. The most actionable surface for correction — these are the agent's bets.
- **Out of scope** — deliberately excluded items: adjacent work considered and dropped, refactors, nice-to-haves. Explicit exclusions let the agent spot anything that should actually be included.

Items may appear in two buckets when meaningfully both — flag inclusion-then-exclusion as Inferred so the reasoning is captured. Do not paste this draft into chat.

## Stage 2: the chat-time scoping synthesis

Up to four named sections, each **render-conditional** on having something to say — empty sections are omitted, never padded:

1. **What we're building** (always) — 1–3 sentences. The shape that emerged, forward-looking, plain words, no qualifiers ("comprehensive", "thoughtful"), no re-stating dialogue the user just lived through. If it can't be said in 1–3 sentences without filler, the synthesis isn't ready.
2. **Key trade-offs** (conditional) — 1–3 bullets, each with a brief why. Only when real trade-offs were made in dialogue.
3. **What's not in scope** (conditional) — 1–3 bullets or a single sentence. Only when deferred items would surprise a downstream reader.
4. **Call outs** (conditional) — 0–3 bullets. Residual forks the dialogue didn't resolve: post-dialogue consequences, silent agent inferences, or — in pre-loaded contexts — scope bets the user is seeing for the first time. **Not "questions the agent could have asked in Phase 1.3 but didn't"** — that reads as a failed integration check; flag the gap rather than padding the section.

Close Path B with the confirmation: *"Confirm and I'll write the requirements doc next, drawing on our dialogue and this synthesis. Or tell me what to change."* — the phrasing sets the expectation that confirm → doc-write. Ask it open-ended, no option menu (Interaction Rule 5(a): a menu would steer feedback toward the parts it lists).

### The Path A / Path B gate

Two signals decide the presentation: (1) did any blocking question fire before Phase 2.5 — Phase 0.3 scope disambiguation, Phase 1.3 dialogue probes, or a Phase 2 approach menu (internal classification and the Phase 1.1/1.2 scans don't count) — AND (2) what tier Phase 0.3 classified the scope as.

- **Path A — Lightweight tier AND no blocking questions fired:** announce-mode. Emit the "What we're building" prose only (1–3 sentences, no other sections, no confirmation), then write the doc in the same turn — do NOT end the turn waiting for acknowledgment. State that you're writing now and the user can interrupt or revise after it lands; Lightweight docs are short and post-hoc revision is cheap.
- **Path B — anything else:** full tier-aware scoping synthesis with the confirmation gate, unconditional even when zero call-outs survive the keep tests. Substance earns the checkpoint, not interaction history — a richly pre-loaded opening that needed no dialogue classifies as Standard/Deep at Phase 0.3 and gets the full synthesis its substance deserves.

Zero call-outs on Path B is normal for Lightweight, sometimes Standard, almost never Deep. A Deep synthesis with zero call-outs after rich content deserves a double-check that consequence-class call-outs weren't filtered as "already implied."

### Keep tests per section

**Trade-offs:** would the user be surprised if I didn't surface this acknowledgment? Real trade-offs are choices the user explicitly weighed in dialogue, or structural choices the agent made that the user would expect to see named. Mechanical or inevitable choices ("uses the existing rule entity") fail and dissolve into the doc body.

**Deferred:** is a reasonable downstream reader likely to ask "why isn't X here?" Items the user explicitly deferred, or items adjacent enough that a reader will look for them. Mechanical excludes ("no rate limiting because it's not in scope") fail and stay internal.

**Call-outs (the affirmability test):** would the user need to read code to evaluate this? If yes, it's doc-body content — cut. If no, one of these must be true:

- **Real scope fork** — another reasonable agent might choose a different scope on this dimension (primary actor, case X in/out, in-scope vs deferred)
- **Non-obvious scope inclusion** — a behavior the agent assumed in scope that the user might want excluded
- **Non-obvious scope exclusion** — an item moved to deferred that the user might want in scope
- **Cheap-now-expensive-later correction** — a scope bet cheap to fix now, expensive after the doc lands and ce-plan consumes it
- **Non-obvious consequence of multi-turn answers** — a downstream effect of combining user answers the user is unlikely to have tracked. Surfaced forward-looking ("X means Y for the doc"), not retrospectively ("you said X"). This category is why call-outs exist in ce-brainstorm at all; do not filter these as "already implied by Stated"

Cut anything that doesn't match a category: mechanical items with no real alternative, implementation choices planning will settle, items already implied by the prose, re-statements of Q&A turns, re-statements of the approach the user already picked.

### Detail discipline

Each bullet is 1 line ideally, 2 maximum — what collaborators would *say*, not what a spec would *write*. When the sections overflow, do not raise the count — **re-cut at a higher level of abstraction**: multiple bullets in a section are usually sub-decisions of one larger named decision; collapse to the level the user actually weighs in on. If two bullets read aloud like "and also" extensions of the same idea, they are one.

- **Read-aloud test:** would two product collaborators say this bullet, or write it in a spec? Say = right. Write = re-cut or cut.
- **Single-sentence test:** if a bullet needs semicolons or an inner list, it's two decisions sharing a bullet — split or cut to the higher-level one.

| Too detailed (wrong) | Conversational (right) |
|---|---|
| Per-channel mute scoped to notification rules; mute applies to all events through that rule including @mentions, DMs forwarded as notifications, and bot messages; persists 24h with extension | Per-channel over per-user — support team isn't a single user |
| Rule-delete loss path is silent and could surprise users who configured extended mutes; consider a confirmation dialog, soft-delete with state preservation, or a 7-day undo window | Rule-delete silently loses pause state — confirm no warning needed |

Before emitting, re-read the draft as the user would. Two failure modes: the synthesis reads like a doc preview (documentary bullets, in/out enumeration — Phase 2.5 and 3 have collapsed into one step), or the bullet count fits while each bullet bloats to a paragraph (horizontal compression without vertical). Revise before emitting if either fires.

### Anti-patterns

- Implementation detail in any bullet (file paths, JSON keys, status codes, error wording, SQL) — scope-only.
- Re-stating a Q&A turn ("you said you wanted X") — reframe forward-looking or cut.
- Re-stating the chosen Phase 2 approach as a call-out — one sentence of "What we're building" at most.
- Padding a section to hit a count — omit it instead.
- Pasting the internal three-bucket draft into chat — that volume problem is why stage 2 exists.
- Floating questions adjacent to the synthesis — if a question can't be defaulted, pause, resolve it (blocking tool for bounded options, open-ended per Rule 5(a) otherwise), integrate, then present. Never present with unresolved side-questions.

### Worked example: compression from internal draft to scoping synthesis (Standard tier)

For a notification-mute feature whose internal draft had 5 Stated, 4 Inferred, and 3 Out-of-scope items:

```
Based on our dialogue, here's the scope I'm proposing for the requirements doc:

**What we're building:** Per-channel mute on notification rules, with a 24h preset for the support team's 3 AM ping problem. Mute lives on the rule itself and survives rule edits.

**Key trade-offs:**
- Per-channel over per-user — support team isn't a single user
- Mute on the rule, not a separate entity — pause state survives edits

**What's not in scope:**
- Presence-based mute and quiet-hours schedules — deferred for later
- Cross-rule mute groups — would force a rule-grouping concept we don't have

**Call outs:**
- Rule-delete silently loses pause state — confirm no warning needed

Confirm and I'll write the requirements doc next, drawing on our dialogue and this synthesis. Or tell me what to change.
```

What got cut from the 12-item draft: Stated items covered by the prose dissolved silently; "use existing rule entity" (mechanical); "use Postgres" (implementation — ce-plan's job); "no rate limiting" (mechanical exclude); three Inferred items rolled into Trade-offs as the explicit choices behind them.

## Re-present after revision; write only on confirm

A revision is not a confirmation. After any user revision — even a trivially-understood swap — integrate the change, re-present the revised synthesis, and wait for explicit confirmation before writing the doc. Doc-write fires only on explicit confirm or the soft-cut question's "proceed" option. Never write immediately after a revision, even when it feels understood.

## Soft-cut on circularity (not iteration count)

Track which synthesis items the user touched per round. The soft-cut fires **only when the same item is revised twice** — new-item revisions across rounds proceed without limit. "Same item" means the same underlying decision regardless of wording or section: a revision may cause stage 2 to re-derive, and a Trade-off in round one may return as a Call-out in round two. A bullet formed by collapsing prior bullets inherits the "touched" status of its constituents.

When the soft-cut fires, ask with the platform's blocking question tool (see `../ce-conventions/SKILL.md`), two options: `Proceed and write the requirements doc` / `Hold off — keep discussing before the doc`.

## Self-redirect

If the user's response signals they're in the wrong skill ("this is too small, just /ce-work it"): stop ce-brainstorm, suggest the skill they appear to want, offer to load it in-session, and don't argue. The scoping synthesis is an honest checkpoint — discovering the skill choice was wrong by reading it is a legitimate outcome.

## Doc shape after confirmation

The internal draft does NOT carry into the doc as a `## Synthesis` section. Only the "What we're building" prose embeds, as `## Summary`. The rest dissolves:

| Internal-draft element | Where it goes in the doc |
|---|---|
| "What we're building" prose | `## Summary` (1–3 lines, forward-looking) |
| Stated bullets | `## Requirements` (numbered R-IDs) and, for narrative context, `## Problem Frame` |
| Inferred bullets | `## Key Decisions` (with rationale) — accepted bets become decisions |
| Out-of-scope bullets | `## Scope Boundaries` |

The chat-time Trade-offs section dissolves into `## Key Decisions`; What's-not-in-scope into `## Scope Boundaries`. No capture-context note ("Captured at Phase 2.5...") — process metadata doesn't belong in the artifact. `## Summary` and `## Problem Frame` must serve distinct purposes — see `references/brainstorm-sections.md`.
