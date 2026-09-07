# Git

Commits, pull requests, worktrees, Git history, and review feedback.

Part of the [Agent Kit marketplace](../../README.md). Supports Claude Code,
Codex, Cursor, and Grok. This plugin contains skills only; command safeguards
are provided by the separately enabled [Hooks plugin](../hooks/README.md).

## Install

Add the [marketplace](../../README.md#install), then select this plugin.

Codex:

```bash
codex plugin add git@agent-kit
```

Claude Code:

```text
/plugin install git@agent-kit
```

In Cursor, enable `git` from the private marketplace on the project.
Grok Bot in Cursor uses the same plugin. Prefer project scope.

## Workflows

Use `git-commit` to save an authorized change or `git-commit-push-pr` to commit,
push, and open a PR. The latter also supports writing or updating a PR
description without committing.

Use `ce-triage-pr-feedback` to evaluate feedback before edits and
`resolve-pr-feedback` for an authorized resolution. Their comment-fetching
scripts stay together in this plugin. Use `git-worktree` for isolated work and
`resolve-pr-merge-conflicts` when a PR conflicts with its base.

Code review and implementation skills live in the optional Engineering plugin.
Git's scripts and core workflows can run without it. Installing Git does not
authorize a commit, push, reply, merge, or deletion.

## Skills

- [babysit-pr](skills/babysit-pr/SKILL.md)
- [ce-triage-pr-feedback](skills/ce-triage-pr-feedback/SKILL.md)
- [git-clean-gone-branches](skills/git-clean-gone-branches/SKILL.md)
- [git-commit](skills/git-commit/SKILL.md)
- [git-commit-push-pr](skills/git-commit-push-pr/SKILL.md)
- [git-history-analyzer](skills/git-history-analyzer/SKILL.md)
- [git-worktree](skills/git-worktree/SKILL.md)
- [pr-review-canvas](skills/pr-review-canvas/SKILL.md)
- [resolve-pr-feedback](skills/resolve-pr-feedback/SKILL.md)
- [resolve-pr-merge-conflicts](skills/resolve-pr-merge-conflicts/SKILL.md)

## Maintain and validate

Edit `skills/` within this plugin. Each harness manifest points at the same
tree. Keep references to files inside this plugin relative; resolve optional
skills in other plugins through the host's installed skill catalog.

Run the [repository checks](../../README.md#validate) from the repository root.

## License

MIT.
