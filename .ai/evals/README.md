# Skill evals — where everything lives

Three layers, from durable to disposable:

1. **Definitions — `plugins/<plugin>/skills/<skill>/evals/`** (`evals.json`, `grader.md`,
   `README.md`). The tests themselves: prompts, fixtures, rubrics, and a
   one-line run history appended after each campaign. They live inside each
   skill directory so they ship and sync with the skill they guard.
   Engineering owns ce-brainstorm, ce-plan, and ce-ideate. Knowledge owns
   ce-sessions.

2. **Campaign docs — `.ai/evals/`** (this directory).
   - `RUNBOOK.md` — how to execute a full campaign (runner protocol, fixture
     setup, grading, smoke list). Self-contained; hand it to any agent.
   - `results/<date>/` — one file per suite plus `summary.md` per campaign,
     with adjudications appended below the raw grades. `captures/` holds the
     surviving verbatim run evidence (capture.md + grader reports only).

3. **Scratch — `/tmp/ce-evals/` and session scratchpads.** Fixture repos and
   in-flight captures. Disposable and NOT durable — a /tmp reset wiped the
   2026-07-25 and early 2026-07-26 captures. Rule adopted since: copy
   captures into `results/<date>/captures/` as soon as a suite finishes.

## Reading order for a past campaign

`results/<date>/summary.md` → per-suite file (raw grade + any adjudication)
→ `captures/` when you need the verbatim evidence.
