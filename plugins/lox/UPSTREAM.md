# Upstream provenance

Source: [lox/agent-skills](https://github.com/lox/agent-skills).

Pinned revision: `7c71d80df75666fdbae9e712ac491aa86a21baed`.

Imported skills: writing-pr-descriptions, simplicity-review, drafting-plans,
adversarial-code-reviewing, and auto-review.

## Local adaptations

- Add an explicit-invocation flag and a link to LOX runtime guidance to each
  skill. Codex metadata also disables implicit invocation.
- Add Codex and Claude plugin manifests and catalog entries. Display the
  plugin as LOX; its machine identifier is `lox`.
- Keep the PR-description skill focused on metadata. Report repository docs
  changes to the caller instead of loading an excluded companion skill.
- Replace auto's general-review wrapper with direct adversarial and simplicity
  passes. Keep synthesis, evidence checks, loop limits, and targeted rechecks.
- Check documentation inside auto review. Use the selected drafting-plans
  skill only when an owning plan needs maintenance.
- Return external bot reviews, CI blockers, and feedback actions to the caller.
  Preserve user-approved feedback decisions and prohibit merge, auto-merge,
  and queue actions.
- Review the full branch against its intended base, not the remote copy of the
  feature branch. Verify that a PR target matches the checkout before editing.
- Distinguish local readiness from out-of-scope metadata follow-ups. Report an
  unfinished in-scope metadata update as needing attention.
- Include no other upstream skills or helper scripts.

## Permissions

Retain the upstream simplicity-review license and attribution. Its permission
notice covers derived Cursor/Buildkite and Ponytail material. No repository-wide
license exists in this pinned snapshot. Do not label the entire LOX bundle MIT
or infer permission to redistribute the other skills from that notice.
