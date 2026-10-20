# ce-plan output-mode resolution evals

`evals.json` covers output-mode resolution: argument/config/default precedence,
inactive comments, pipeline Markdown, unknown values, and literal conventional
commit prefixes. It does not assess plan quality or repository discovery.

Run in a scratch repository with each case's declared
`.compound-engineering/config.local.yaml` content. See `grader.md` for grading.
Keep generated results under `.ai/evals/`.
