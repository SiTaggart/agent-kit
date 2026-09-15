---
name: git-commit
description: Create a git commit with a concise Conventional Commit message that accurately describes the current changes. Use when the user asks to commit or save work.
---

# Git Commit

Commit the requested working-tree changes with a clear Conventional Commit
message.

## Workflow

1. Read the repository instructions, status, diff, branch, and recent commit
   subjects.
2. Stop if there is nothing to commit.
3. If HEAD is detached or the branch is the default branch, ask before
   committing.
4. Stage only the requested files. Exclude unrelated changes, generated output,
   secrets, and credentials.
5. Create the commit, then verify it with `git status` and `git log -1`.

## Commit message

Use:

```text
type(scope): description
```

- Use a valid Conventional Commit type such as `feat`, `fix`, `refactor`,
  `docs`, `test`, `chore`, `perf`, `ci`, `style`, or `build`.
- Add a narrow scope only when it improves clarity.
- Describe the change made. Use an imperative, lowercase subject with no
  trailing period.
- Keep the subject under 72 characters.
- Add a body only when the reason, constraint, or important consequence is not
  clear from the subject.
- Never use `!` or `BREAKING CHANGE:` without explicit user confirmation.

Create one commit unless the user asks to split the work or the repository
instructions require it. Report the commit hash and subject.
