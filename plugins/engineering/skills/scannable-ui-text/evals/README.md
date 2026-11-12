# Scannable UI text evaluations

Use these cases to check meaning and comparison across a collection.
They follow the repository's skill-local evaluation convention.
They are behavioral checks, separate from `bun run test`.

Run each `prompt` from `evals.json` in a fresh agent session with `SKILL.md`
and no other evaluation files. Do not give the runner `expected_behavior`,
`must_not`, or the grading rubric. The prompts need no external services or
repository edits. For case 5, provide only the skill's name and description
alongside the prompt to test selection rather than explicit invocation.

Save each complete response under `.ai/evals/results/<date>/captures/`.
Give a separate grader the prompt, response, and `grader.md`. Record a pass,
fail, or inconclusive result with the supporting text. One run per case is a
smoke check; use three fresh runs per case to assess consistency. A smoke
pass does not establish a general improvement over an agent without the skill.

Do not grade against exact wording. No model output can prove visual fit
without the UI. Cases deliberately use text-only constraints to check that
the runner reports that limit.
