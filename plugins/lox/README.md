# LOX

Five selected skills from [Lox's agent-skills](https://github.com/lox/agent-skills),
packaged separately for Codex and Claude Code. Each skill requires explicit
invocation. LOX adds no hooks, automatic routing, or persistent mode.

## Skills

- **writing-pr-descriptions** — concise titles and bodies grounded in the final
  diff, repository conventions, and author intent.
- **simplicity-review** — grounded ways to remove unnecessary concepts and code.
- **drafting-plans** — concise plans with useful delivery slices.
- **adversarial-code-reviewing** — material production risks and failure paths.
- **auto-review** — a bounded review, fix, validate, and recheck loop.

Auto review runs the adversarial and simplicity lenses directly. It does not
require general-code-reviewing, writing-tests, check-docs-updated,
handling-codex-reviews, or babysitting-prs. Documentation checks stay inside the
loop; plan maintenance uses drafting-plans when needed.

## Use

Install from a marketplace that includes this version:

```bash
codex plugin add lox@agent-kit
```

In Codex, select the named LOX skill through the skill picker. For example:

```text
Use $simplicity-review from LOX on the current branch.
Use $auto-review from LOX to review and fix this local change.
```

In Claude Code:

```text
/plugin install lox@agent-kit
/lox:drafting-plans
/lox:auto-review
```

Local source edits are available only through a registered local marketplace
until published. Start a new task after installation. This package does not
change the other plugins or the host's model settings.

## Scope and attribution

Read [runtime guidance](RUNTIME.md) for local editing and remote feedback
boundaries. Existing PR feedback needs accept/reject decisions. The user owns
merging.

See [upstream provenance](UPSTREAM.md) for the pinned revision and adaptations.
The simplicity-review permission notice is retained in
[its license](skills/simplicity-review/LICENSE). The source snapshot has no
repository-wide license. The remaining upstream material does not acquire this
repository's MIT license by being copied here. Establish redistribution terms
before publishing this trial bundle.
