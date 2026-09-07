# ce-* Skill Eval Campaign — Runbook

Self-contained instructions for running the skill regression evals. Written
for a headless agent (Codex or Claude Code) with no prior context. Run from the
marketplace checkout. Engineering owns the planning and ideation suites;
Knowledge owns the session research suite under `plugins/knowledge/skills/ce-sessions/`.

## What this campaign is

The ce-* skills were heavily trimmed on 2026-07-25 (see
`.ai/plans/ce-suite-context-engineering-cleanup.md`). Prose that guarded
known past defects was deleted in favor of behavioral evals. This campaign
runs those evals plus a smoke pass over the other trimmed skills.

**Ground rules: never edit files under `plugins/<plugin>/skills/` except the two documented
result-recording edits at the end. Never commit. All scratch work goes under
`/tmp/ce-evals/`. Results go to `.ai/evals/results/<YYYY-MM-DD>/`.**

## Tier 1 — full suites (must run)

Suites live at `plugins/<plugin>/skills/<skill>/evals/{evals.json,grader.md,README.md}`.
Status: ce-brainstorm eval 1 already ran 2026-07-25 — PASS on the regression
dimension, 12/12; see the run-history note in its evals.json. Still to run:
ce-brainstorm evals 2–3, all of ce-plan (6 evals × 2 runs), all of ce-ideate
(4 evals × 3 runs). ce-sessions' suite is older and optional (it needs real
session history on this machine; mark inconclusive if history is absent).

### Runner protocol (per eval × per run)

Each run must be a FRESH agent session with no memory of other runs.
With Codex: `codex exec --cd <scratch-repo> "<runner prompt>"`.
With Claude Code: `claude -p "<runner prompt>"` from the scratch repo.

Runner prompt template (fill the <>):

> You are an eval runner testing the <skill> skill. Work entirely inside
> <scratch-repo> (a git repo — treat it as the user's project).
> 1. Invoke the <skill> skill with this input exactly: "<eval prompt from
>    evals.json, without the /skill prefix>".
> 2. Follow the skill faithfully, exactly as for a real user — no shortcuts
>    because this is a test. Where the skill needs a blocking user answer and
>    no blocking tool is available, present the question as chat text, then
>    STOP — unless this eval's script says how the user answers, in which
>    case answer AS the user with exactly that script and continue.
> 3. Stop at this eval's stop condition: <from expected_behavior — e.g.,
>    "synthesis + confirmation presented, or a doc written, whichever first">.
> 4. Write a capture file at <run-dir>/capture.md with sections:
>    `## QUESTIONS FIRED` (verbatim, in order, or `none`), `## FINAL TURN`
>    (complete verbatim final skill-following turn), `## DOC STATE` (ls of
>    the artifact directory the eval checks), `## TIMELINE` (one line per
>    event). Final message: "capture written" + the path.

### Fixture setup per suite

- **ce-brainstorm** (`plugins/engineering/skills/ce-brainstorm/evals/evals.json`): scratch repo
  must not contradict the pre-loaded decisions — see the `setup` field.
  A known-good fixture: README for a "Chatter" team-chat app plus
  `src/snooze.ts` with `export type Snooze = { userId: string; channelId:
  string; untilTs: number };` and a notifications fan-out stub. Lesson from
  the first execution (recorded in evals.json `notes`): with 10+ interacting
  decisions the skill will legitimately find a composition gap and ask —
  grade that Path-B-via-question, inconclusive for the tier signal, not a
  fail. Eval 2 needs a trivial one-liner task; eval 3 needs an underspecified
  prompt plus a scripted user answer to whatever the skill asks.
- **ce-plan** (`plugins/engineering/skills/ce-plan/evals/evals.json`): each eval declares
  `setup_config` — write it to `<scratch-repo>/.compound-engineering/
  config.local.yaml` before the run (null = ensure the file is absent).
  Grading is programmatic: the plan file's extension under `.ai/plans/`,
  plus the ignored-value note for eval 4 and description integrity for
  eval 6. Eval 5 (pipeline-forces-md) may be marked inconclusive if a
  pipeline context cannot be staged — never pass it vacuously.
- **ce-ideate** (`plugins/engineering/skills/ce-ideate/evals/evals.json`): evals 1/2/4 need a
  repo CWD (reuse the Chatter fixture); eval 3 needs a non-repo CWD.
  Eval 1 stop: the scope question (runner then answers "Cancel"). Eval 2:
  runner answers "Surprise me" and lets the full run finish (this one is
  expensive — it fans out ~9 agents; budget for it). Eval 3: runner answers
  dismissively ("idk just go") and expects a clean exit. Eval 4 stop: the
  dispatch decision (cost-notice line printed without a scope question).

### Grading and aggregation

After each suite's runs: apply `plugins/<plugin>/skills/<skill>/evals/grader.md` to the
captures (a fresh grader session per suite is cleaner than self-grading).
Write per-suite results to `.ai/evals/results/<date>/<skill>.md`: table of
eval × run × stage-1 shape × stage-2 verdict × pass/fail/inconclusive, with
one quoted line of evidence per verdict. Then aggregate to
`.ai/evals/results/<date>/summary.md`.

## Tier 2 — smoke pass (one run each)

One fresh session each, same runner protocol, toy fixture, single shape
check. Skill → scenario → pass condition:

- **ce-work**: "add a --version flag to this CLI" in a tiny Node fixture →
  implements, runs ce-quality-gate, final report names contract/proof, and
  the next-step menu never offers shipping if proof was skipped.
- **ce-quality-gate**: invoke after a deliberate lint error in a touched
  file → reports the touched-file failure, does not claim repo-wide health,
  never offers shipping from an unproven gate.
- **ce-review**: run against a small diff with one planted off-by-one → the
  finding cites file+line with a concrete consequence and states either the red
  test command + failure or `Not reproduced` + reason; any new untracked test
  is removed and existing files stay unchanged; report ends with verdict +
  checks.
- **ce-debug**: a failing test with an obvious one-line cause → fast path
  offers cause + fix with the user-choice gate, no doc ceremony.
- **ce-decompose**: point at a 2-commit mixed diff → measures with the
  documented git semantics and confirms the carve strategy before executing.
- **ce-compound**: "document this fix" after a toy fix → asks at most one
  mode question, writes one doc to .ai/solutions/ matching schema.yaml,
  validate-frontmatter.py exits 0.
- **ce-compound-refresh**: run against two overlapping planted learnings →
  proposes Consolidate with a recommendation, does not delete without the
  documented interaction.
- **ce-handoff / ce-grill / ce-council / ce-simplify-code / ce-slack-research /
  ce-sessions**: invoke once with a minimal valid input; pass = the skill's
  core shape appears (template sections / interview questions / 5 advisors +
  anonymized review / behavior-preserving suggestions only / opt-in dispatch /
  guardrails respected).
- **ce-optimize**: skip in smoke (multi-hour by design); instead verify only
  Phase 0: given the example spec, it validates against the schema and writes
  spec.yaml + CP-0 before any experiment.

Record each smoke result in the same results directory, one file
(`smoke.md`), one row per skill with a quoted evidence line.

## Recording results (the only skill-file edits allowed)

1. Append a one-sentence run-history line to the `notes` of each eval that
   ran, in its `evals.json` (mirror the existing ce-brainstorm eval-1 note).
2. If a suite FAILS: do not patch the skill. Write the failure into the
   results file with the capture path and stop — a human decides the fix.

## Cost expectations

Tier 1 remaining: ~26 runner sessions + 3 graders (ce-ideate eval 2 is the
one heavy run). Tier 2: ~14 sessions. Most runs stop at a question or a
small artifact and are cheap.
