# Plan Files and Compatibility

The filename is retained for existing links. There is no required section
structure. Use the guidance in `../SKILL.md` to choose the content.

## Destination and format

Honor an explicit destination. Otherwise use
`.ai/plans/YYYY-MM-DD-NNN-<type>-<descriptive-name>-plan.<md|html>` in the target
repository. Keep the established zero-padded sequence convention, counting both
extensions for the date. Use a searchable title and an appropriate type such
as `fix`, `feat`, or `refactor`. Confirm the saved file with an absolute path
in chat. Use repo-relative references inside the plan for portability.

Use the output-mode resolution in `../../ce-conventions/SKILL.md`: an
`output:` argument overrides the active `plan_output:` key in
`.compound-engineering/config.local.yaml`; otherwise use `md`. Commented config
lines are inactive. Ignore an unknown format with a short note naming the
format used. Consume only flag tokens, preserving descriptions such as
`feat: add rate limiting`. Pipeline and sub-step invocations use Markdown.

Produce one format. Preserve the format of a revised plan unless the user
requests a change or a pipeline requires Markdown. When converting for a
pipeline, write the Markdown sibling without overwriting the HTML source.

## Minimal metadata

For new repository plans, retain `title`, `type`, `status: active`, and the
creation `date` (`YYYY-MM-DD`). These are small compatibility fields, not body
sections. In Markdown, use YAML frontmatter and one title heading. Add `origin`
when an upstream requirements document supplied the intent.

In HTML, use a single self-contained document with readable semantic HTML and
visible metadata. Render status as `<span class="status">active</span>` so
`ce-work` can update it. Keep the plan readable directly in source. Styling
must not require new body sections, cards, ID schemes, or a companion file.
The shared rendering catalogs describe older structured artifacts; their
section and ID prescriptions do not impose a body template on plans.

For non-code plans, use domain-appropriate presentation. Preserve an existing
`execution: knowledge-work` marker when present. No frontmatter is required
for a chat-only plan.

## Existing plans and consumers

When asked to revise a named plan, update it in place. Replace superseded text
and remove repetition or stale review history while preserving agreed scope.

Read the content to understand the task. Missing frontmatter or unit IDs do
not indicate a different execution domain or an incomplete plan.

Keep existing metadata such as `origin`, `execution`, and `deepened` when it
still describes the artifact. No deepening stamp or scoring workflow is needed
for new revisions. Preserve externally referenced R/U/A/F/AE IDs; do not
renumber them or change what they identify. Retaining them does not require
new IDs, implementation units, or a copy of the old template.

`ce-work` accepts plans with or without the older section structure. It reads
the intent and constraints, chooses implementation details, and updates an
existing status marker only after completing the accepted work.
`document-review` reviews meaning and usefulness without requiring sections,
IDs, exhaustive file paths, or implementation units. Its automatic wording
edits support Markdown; do not apply them to HTML source.
