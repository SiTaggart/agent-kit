---
name: resolve-pr-feedback
description: Publish approved PR review changes, reply to review comments, and resolve completed threads. Use when the user asks to resolve PR feedback, address approved review comments, or close review threads.
argument-hint: "[PR number, comment URL, or approved feedback IDs or URLs]"
---

# Resolve PR Feedback

Publish approved feedback changes and close out their review threads.

## Preconditions

Confirm that every in-scope comment has already been triaged and has an agreed
resolution, any required code changes, validation results, and a reply draft.
If this handoff is missing or incomplete, stop and ask the user to run
`ce-triage-pr-feedback` first. Do not triage feedback or edit code here.

## Bot identity

Preserve the implementation identity from triage and determine the posting
harness and model from runtime-provided context. Never guess. End every visible
reply with:

```markdown
_Bot reply — harness: <harness>; model: <model>._
```

Use `unavailable` when the runtime does not expose a value. If implementation
and posting used different agents, identify both in the footer. This footer is
required for inline replies and top-level comments.

## Workflow

1. Re-fetch only the allowlisted feedback. Never process newly arrived or
   unapproved comments.
2. Compare the working-tree diff and validation results with the approved
   resolutions. If work is missing, differs materially, includes unrelated
   changes, or is no longer valid, stop and return the item to triage.
3. Run `git-commit` for the approved changed files when a commit is needed.
4. Push the current feature branch. Verify the local commit, upstream commit,
   and PR head commit match before resolving anything.
5. Reply to each allowlisted thread with the agreed outcome. Use
   `scripts/reply-to-pr-thread` for inline review threads and `gh pr comment`
   when GitHub does not provide a resolvable thread.
6. Resolve each completed inline thread with `scripts/resolve-pr-thread`. Leave
   a `Needs decision` item open.
7. Re-fetch the allowlisted feedback and verify every expected reply is visible
   and every completed inline thread is resolved.

Do not edit code, re-evaluate decisions, commit unrelated files, force-push,
or touch feedback outside the allowlist.

Report the pushed commit, resolved items, intentionally open items, and any
publication or verification failure.
