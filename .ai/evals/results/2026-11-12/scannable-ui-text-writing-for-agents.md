# Scannable UI text after Writing for Agents

Applied Matt Pocock's `writing-for-agents` skill and its `SKILL-MECHANICS.md`
reference to the PR107 draft. Both files were read from the installed
`mattpocock-skills` package, version `1.2.3+codex.84fdeffd`. The corresponding
[upstream writing guidance](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/writing-for-agents/SKILL.md)
and [skill mechanics](https://github.com/mattpocock/skills/blob/4ae2317ddb22b046e26455e4f9c9b3aaaf62212d/skills/productivity/writing-for-agents/SKILL-MECHANICS.md)
were also read. This records an explicit application, not inferred consistency.

## Authoring changes

- Shortened the description and put `Scannable UI text` first. Kept automatic
  discovery because the skill should apply during UI work without a separate
  manual invocation.
- Organized the work into three steps, each ending with a checkable completion
  criterion. The final criterion accounts for every requested item and every
  remaining validation gap.
- Collected evidence rules under one heading. The verification step refers back
  to those rules instead of repeating them.
- Replaced prohibitions with positive instructions where possible. Unknown
  states stay unknown; absent detail stays absent; factual conflicts are reported.
- Removed repeated scope and safety reminders and compressed the example.
  `SKILL.md` went from 918 to 597 words, measured with `wc -w`.
- Kept the small workflow in one file. No extra reference file or runtime
  dependency was needed. Evaluation instructions remain separate from the skill.

## Verification

Repeated the five unchanged evaluation prompts in fresh sessions. Responses
are preserved in [the follow-up capture](captures/scannable-ui-text-after-writing-for-agents.md).
All five passed independent grading against the unchanged rubric. A separate
review of the rewrite against Matt's guidance found no concrete defects.

- Case 1 preserves task scope and unknown state. Titles contain 26, 22, and
  18 characters. The conventional label remains unchanged where its action
  is unspecified.
- Case 2 keeps failed, owner-paused, and unknown states distinct. Labels contain
  25, 25, and 28 characters, with supporting facts in visible secondary lines.
- Case 3 preserves overlapping counts, mixed feedback, the export threshold,
  pending reproduction, and the missing request rationale.
- Case 4 parses as JSON. Exact keys and per-key interpolation tokens match the
  input. The actor, no-files condition, and saved count remain intact.
- Case 5 changes only the requested typo.

All documented local checks passed: marketplace validation, 145 Bun tests,
2 Python tests, lint, root type-check, and P3Stack script type-check.
Skill Creator validation and Git whitespace checks also passed.

## Limits

One fresh run per case is a regression smoke check, not a repeated-run study
or a comparison against an agent without the skill. No rendered UI,
accessibility, runtime text generator, or installed-plugin integration was
verified. Character counts are not evidence of visual fit.
