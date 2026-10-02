**Title**

```text
feat(engineering): add a standalone task lead workflow
```

**Body**

```markdown
## Summary

- Add `task-lead` for one bounded task, without requiring a project controller or Linear issue.
- Reuse the scout, builder, and reviewer workflow while `project-control` coordinates project priorities, ticket state, and dependencies.

## Changes

- Move the shared execution loop into `task-lead`: discovery, implementation, integration, review, verification, and draft PR follow-through. Include structural review and optional Ponytail review, with explicit reasons for skipped passes.
- Preserve current-worktree safety: inspect existing state, protect uncommitted work, isolate unrelated changes, use the exact Linear branch when applicable, and keep one writer at a time.
- Keep publication with the task lead. Nested agents cannot publish or mutate tickets. The workflow stops at a verified draft; ready-for-review and merge approval remain with the user.
- Replace the controller’s duplicated execution contract with delegation to `task-lead`. Set new controller-launched task leads to `gpt-6-sol` with `thinking: "high"`.
- Add the Codex task-lead interface, update setup guidance, and bump engineering manifests and marketplace entries to `0.2.9`.

## Testing

- Inspected the complete `pilot-base..pilot-head` diff and relevant test source.
- Updated assertions cover controller delegation, standalone use, agent roles, and draft-only boundaries. Bundle expectations increase to 56 skills, including 34 engineering skills.
- Tests, lint, type-checking, and live workflow verification were not run. These source assertions do not prove agent execution or publication behavior.
- Known documentation inconsistency: launch settings now specify `high`, but the fallback instruction still refers to `xhigh`.
```

No uncommitted work was found. The extra HEAD commit that ignores evaluation artifacts is excluded.