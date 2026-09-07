# ce-brainstorm Path A/B gate — grading rubric

Grade the transcript turn where Phase 2.5 fires (the last assistant turn before a
requirements doc is written, or the final turn if no doc is written).

## Stage 1 — shape (programmatic)

Classify the turn as Path A or Path B:

- **Path B shape:** a scoping synthesis with more than one section or 3+
  substantive bullets, ending in an explicit confirmation question
  ("Confirm and I'll write the requirements doc… or tell me what to change"
  or equivalent), and no doc written in that turn.
- **Path A shape:** 1–3 sentences of "what we're building" prose, no
  confirmation question, and the doc written (or explicitly skipped) in the
  same turn.

Pass = the shape matches the eval's `expected_behavior`. Anything matching
`must_not` fails regardless of other quality.

## Stage 2 — substance (LLM judgment)

For Path B passes only: does the synthesis reflect the actual scope substance?

- Eval 1: the synthesis must surface real content from the pre-loaded
  decisions (e.g., policy-wins-over-personal-mute, snooze migration/410
  deprecation, server-side push suppression) as shape/trade-off/call-out
  material — not generic filler that could describe any feature.
- Eval 3: the synthesis must incorporate the user's dialogue answers, and
  call-outs (if any) must be forward-looking consequences, not restatements
  of Q&A turns.

Verdict per run: `pass` / `fail` + one-line reason. Aggregate per eval:
pass requires 3/3 runs passing Stage 1 and all Path B runs passing Stage 2.

## Risk attribution

- Eval 1 fails → tier signal lost (the original regression).
- Eval 2 fails → gate collapsed to always-confirm; over-gating.
- Eval 3 fails → question signal lost.
