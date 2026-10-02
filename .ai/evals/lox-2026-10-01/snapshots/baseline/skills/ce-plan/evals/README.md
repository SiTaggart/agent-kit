# ce-plan output-mode resolution evals

Guards Phase 0.0's format-resolution contract through the context-engineering
cleanup: `output:` arg > active `plan_output:` config > `md` default, pipeline
always md, commented YAML never matched, `feat:`-style prefixes never consumed.

The Phase 0.0 prose (including the YAML-comment warning and the
`output:pdf` edge case) may be compressed to a few judgment-level lines; this
suite is the durable regression test for the behaviors that prose guarded.

Run via the skill-creator framework like `skills/ce-sessions/evals/`, in a
scratch repo. Each eval declares its `setup_config` for
`.compound-engineering/config.local.yaml` (null = ensure the file is absent).
Grading is programmatic (file extension + note presence) — see `grader.md`.
