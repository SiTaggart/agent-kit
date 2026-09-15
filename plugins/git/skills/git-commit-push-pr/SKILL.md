---
name: git-commit-push-pr
description: Commit the requested changes, push the branch, and open a pull request. Use when the user asks to commit and create a PR, open a PR, or ship changes for review.
---

# Commit, Push, and Open a PR

This skill coordinates existing owners. Do not duplicate their commit-message
or PR-writing guidance.

## Workflow

1. Confirm the work is on a feature branch. Never push the default branch. If
   necessary, create a feature branch before continuing.
2. If the working tree has requested changes, run `git-commit`.
3. If the branch already has an open PR, push the current branch, report the PR
   URL, and stop. Do not rewrite its title or body unless the user asked for
   that.
4. If the change is predominantly UI-related, read the project's documented
   development-server instructions, run that surface, and capture a screenshot
   that clearly shows the change. If the documented surface cannot run, report
   the blocker and ask whether to continue without visual evidence.
5. Run `pr-description` to generate the PR title and body. Pass it the
   screenshot path and useful alt text when one was captured.
6. Push the current branch with `git push -u origin HEAD`.
7. Create the PR with the generated title and body. Use a temporary body file
   with `gh pr create --title <title> --body-file <file>`. For a screenshot,
   also pass `--attach '<path>#<alt text>'` so GitHub CLI uploads it and rewrites
   the matching local Markdown image reference. If the installed `gh` does not
   support `--attach`, report that blocker and ask whether to continue without
   the screenshot. Create a draft only when the user requested one.
8. Report the commit, pushed branch, and PR URL.

Preserve the user's requested scope throughout. Do not stage unrelated files,
force-push, merge, or enable auto-merge.
