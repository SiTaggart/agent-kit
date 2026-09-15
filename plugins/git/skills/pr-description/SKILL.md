---
name: pr-description
description: Write a reviewer-focused pull request title and body from the current branch or a specified PR. Use when drafting, creating, or rewriting a PR description.
---

# PR Description

Write a clear PR title and body from the full change, not from one commit or a
file list.

## Gather context

For the current branch, compare `HEAD` with the remote default branch. For a PR
number or URL, use that PR's base and head. Read:

- the branch name and commits in the range, including commit bodies;
- the diff and diff stat;
- staged, unstaged, and untracked work; and
- the most important changed source and test files.

If there are no commits to describe, stop. Keep uncommitted work separate from
the PR description because it is not part of the published change.

## Write the title

Use `type(scope): description`.

- Choose the Conventional Commit type from the dominant change.
- Add a narrow scope only when it improves clarity.
- Describe what changed in imperative, lowercase language.
- Keep the title under 70 characters with no trailing period.
- Include a ticket ID from the branch name when one exists.
- Never use `!` or `BREAKING CHANGE:` without explicit user confirmation.

## Write the body

Write for the reviewer. Explain the motivation, resulting behavior, important
design decisions, and proof. Do not narrate filenames or restate a diff the
reviewer can already see.

Use this structure when each section has useful content:

```markdown
## Summary

- <why this change was needed and what is now better>
- <important behavior or system-level result>

## Changes

<grouped, selective explanation of the meaningful changes>

## Testing

<tests run, manual verification, and any relevant gaps>
```

Scale the body to the change. A small fix may need only a short paragraph.
Group larger work by reviewer-relevant area. Add `Closes PROJ-123` when the
branch or commits identify the linked ticket.

When the caller provides a screenshot path, add a `## Screenshots` section with
a local Markdown image reference and useful alt text. The creating or editing
workflow must pass the same path through `gh pr create --attach` or
`gh pr edit --attach` so GitHub uploads the image and rewrites that reference.

## Return

Return a copy-ready title and Markdown body. Also report any uncommitted work
that is excluded. Do not create or edit a PR unless the caller requested it.
