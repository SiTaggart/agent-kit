# ce-plan output-mode resolution — grading rubric

Almost fully programmatic. Per run:

1. Locate the plan file written under `.ai/plans/` during the run.
2. Check its extension against the eval's `expected_behavior`.
3. Eval 4 only: the transcript must contain a one-line ignored-value note that
   names the format actually resolved (not hardcoded "md" — with HTML config it
   would say html).
4. Eval 6 only: LLM check that the plan's subject matches the full description
   including the `feat:` prefix semantics (rate limiting on the public API),
   and that no token was reported as ignored.

Pass per eval = all runs produce the expected extension (and note/description
condition where specified). Eval 5 may be `inconclusive` if a pipeline context
could not be staged — never mark it passed without an actual pipeline run.

## Risk attribution

- Eval 1 fails → comment lines matched as active config (silent HTML forcing).
- Eval 2/3 fail → precedence chain broken.
- Eval 4 fails → unknown-value handling lost.
- Eval 6 fails → token parser consuming non-flag `word:` tokens.
