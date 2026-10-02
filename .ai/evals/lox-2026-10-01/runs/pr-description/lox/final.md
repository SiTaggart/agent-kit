Status: drafted. No files or PR metadata changed.

**Title**

```text
feat(engineering): add standalone task-lead workflow
```

**Body**

```markdown
## Why

One bounded task should be able to use the existing scout, builder, and reviewer workflow without requiring a project controller or Linear issue. Project-control should coordinate the portfolio while each task lead owns delivery.

## What

Add `task-lead` to own discovery, implementation, review, verification, and draft PR follow-through. Project-control delegates to this shared workflow and retains responsibility for priorities, ticket state, and cross-task dependencies.

The workflow checks whether the current worktree is suitable, preserves unrelated changes, and keeps one writer at a time. Nested agents cannot publish changes or mutate tickets. The user retains approval for ready-for-review and merge transitions.

Set controller-launched task leads to `gpt-6-sol` with `high` reasoning. Update setup guidance, workflow and bundle assertions, and engineering manifests/catalogs to version `0.2.9`.
```

Reviewed the complete `pilot-base..pilot-head` diff and relevant tests. Tests were not run; execution remains unverified.

Two documentation inconsistencies remain: the launch fallback still references `xhigh`, and the root README lists 33 engineering skills instead of 34.