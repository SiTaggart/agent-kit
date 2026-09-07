# Handoff

Loaded when Phase 4 begins — after the requirements document is written (or skipped).

## 4.1 Present Next-Step Options

Present the applicable options with the platform's blocking question tool; show only what applies and renumber so visible options stay contiguous from 1 (menu conventions: `../ce-conventions/SKILL.md`). When more than four options are visible, fall back to a numbered chat list with a "Pick a number or describe what you want." hint so the open-endedness survives.

State gating:

- No requirements doc → hide the review option.
- `OUTPUT_FORMAT=html` → hide the review option (document-review is markdown-only today); note once: `Agent review unavailable in output:html mode — switch to output:md if you want a review pass.`
- Unresolved `Resolve Before Planning` items → hide `Plan implementation` and `Build it now`. Ask the blocking questions now, one at a time, by default. If the user wants to proceed anyway, first convert each remaining item into an explicit decision, assumption, or `Deferred to Planning` question; if they pause instead, present the handoff as paused, not complete.
- Failing direct-to-work gate → hide `Build it now`.

Lead with a one-line status ("Brainstorm complete." / "Brainstorm paused — planning is blocked until the remaining questions are resolved.") plus the requirements doc's **absolute path** when one exists (relative paths aren't clickable in most terminals; inside the doc itself paths stay repo-relative).

Options:

1. **Plan implementation with `ce-plan` (Recommended)** — run the planning-readiness gate below first. Shown only when `Resolve Before Planning` is empty.
2. **Agent review of requirements doc with `document-review`** — coherence, feasibility, scope, next-loop usefulness; applies trivial-safe fixes. Shown only when a markdown doc exists.
3. **Open in browser** — shown only when `OUTPUT_FORMAT=html` and a doc exists.
4. **Build it now with `ce-work` (skip planning)** — for lightweight, well-defined work: clear success criteria and scope boundaries, no meaningful open technical or research questions (the "direct-to-work gate"), and `Resolve Before Planning` empty.
5. **More clarifying questions to sharpen the doc** — always shown.
6. **Done for now** — always shown.

**Post-review nudge (subsequent rounds only):** if `document-review` already ran this session and residual P0/P1 findings remain, add a one-line nudge above the menu referencing the review option **by label, not number** (the menu renumbers). Suppress under HTML mode, where that option is hidden.

## 4.2 Handle the Selected Option

Match selections by label or number against the currently-rendered list. Free-form input that matches neither is clarification — ask a follow-up rather than guessing.

**Planning-readiness gate.** Before invoking `ce-plan`, inspect the finalized requirements. Invoke `ce-grill` first — passing the requirements path or a concise summary, then handing its recommended planning input to `ce-plan` — when any of these hold:

- multiple viable product directions remain and the chosen one is not explicit
- success criteria, target user, or scope boundary are still fuzzy
- standard/deep scope with one unresolved decision that would materially change the implementation units
- the doc is plannable but product intent, interaction shape, or priority tradeoff still feels shaky
- the user asked to be grilled or to pressure-test before planning

Do not run `ce-grill` for narrow, clear tasks or one-off missing facts `ce-plan` can ask directly. If `ce-grill` returns `Ready for ce-plan: no`, return to the options or ask the remaining blocker; do not force `ce-plan`.

- **Plan implementation** → run the gate; on pass, load `ce-plan` immediately, passing the doc path (or a concise summary of the decisions). No closing summary first.
- **Agent review** → load `document-review` with the doc path. When it returns, re-render the menu (re-evaluate `Resolve Before Planning`, the direct-to-work gate, and residual findings; include the nudge if P0/P1 findings remain).
- **Build it now** → load `ce-work` immediately with the finalized brainstorm output (doc path if one exists). No closing summary first.
- **More clarifying questions** → return to Phase 1.3 and continue one question at a time; when the user is satisfied, return to Phase 4.
- **Open in browser** → open via the platform's primitive (`open`/`xdg-open`/`start`) or print the absolute path, then return to the options.
- **Done for now** → show the closing summary and end the turn.

## 4.3 Closing Summary

Only when the run is ending or handing off, not when returning to the options. State: completion status ("Brainstorm complete!" or "Brainstorm paused."), the doc's absolute path with the extension actually written (omit the line if no doc), the key decisions as short bullets, and the recommended next step (`ce-plan`). A paused summary lists the blocking questions and notes the brainstorm resumes with `ce-brainstorm`.
