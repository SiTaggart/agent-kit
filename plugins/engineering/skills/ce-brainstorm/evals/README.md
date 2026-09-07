# ce-brainstorm Path A/B gate evals

Guards the Phase 2.5 synthesis-routing gate through the context-engineering
cleanup: the gate fires on **two signals** (any blocking question fired? AND
scope tier), not on question-count alone.

The defect this encodes: Deep-tier pre-loaded prompts (rich opening context,
zero questions needed) once routed to Path A and got a one-sentence checkpoint
for 20+ items of scope. The prose explaining this in
`references/synthesis-summary.md` may be compressed; this suite is the durable
regression test.

Run via the skill-creator framework like `skills/ce-sessions/evals/` — one
subagent dispatch per eval per run (3 runs each), capture the transcript,
grade per `grader.md`. Eval 1 is the load-bearing case; run it first when
smoke-testing a synthesis-related change.
