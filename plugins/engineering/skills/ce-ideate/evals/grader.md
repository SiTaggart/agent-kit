# ce-ideate surprise-me / identifiability — grading rubric

Grade the intake portion of the transcript (everything before the first
ideation sub-agent dispatch) plus, for eval 2, the surviving ideas.

## Stage 1 — routing shape (programmatic)

- Eval 1: exactly one blocking scope question before any dispatch; its options
  include a surprise-me choice; no agents dispatched before it.
- Eval 2: zero questions after the surprise-me selection; grounding and
  ideation agents dispatched.
- Eval 3: at most one substance ask; zero agents dispatched; run ends with a
  clear re-invoke path.
- Eval 4: zero blocking questions and the run reaches the dispatch decision
  (the cost-notice line). A harness stop before actual agent dispatch is fine
  — the graded behavior is the intake judgment, not the fan-out.

Anything matching the eval's `must_not` fails the run outright.

## Stage 2 — intent and grounding (LLM judgment)

- Evals 1/3: every question asked must be subject-identifying or
  substance-supplying. Any question about constraints, audience, tone, or
  success criteria is a fail (those belong to ce-brainstorm).
- Eval 2: sample 3 surviving ideas — each must name a concrete subject
  traceable to repo material (a file, subsystem, workflow, or doc that
  actually exists). Generic ideas that fit any codebase fail.

Pass per eval = 3/3 runs pass both stages.

## Risk attribution

- Eval 1 fails → vague prompts silently repo-interpreted (scattered dispatch).
- Eval 2 fails → surprise-me degraded to a fallback or re-interrogation.
- Eval 3 fails → agents dispatched with nothing to work from.
- Eval 4 fails → length used as a vagueness proxy (over-asking).
