Status: drafted

**Title**

```text
feat(engineering): add standalone task lead workflow
```

**Body**

```markdown
## Why

One bounded task needs the existing scout, builder, and reviewer workflow without requiring a project controller or Linear issue. Project-control should coordinate the portfolio while each task lead owns delivery.

## What

Add `task-lead` to guide one task through discovery, implementation, review, verification, and a draft PR. It follows required CI and actionable review feedback, reporting pending work explicitly.

Delegate project-control’s execution loop to this shared skill. Keep project priority, ticket state, and cross-task dependencies with the controller.

Retain current-worktree safety: preserve uncommitted work, isolate unrelated changes, and allow one writer at a time. Nested agents cannot publish or mutate tickets. The user retains approval for ready-for-review and merge transitions; the workflow does not authorize deployment or expanded scope.

Update setup guidance and contract tests, bump Engineering to 0.2.9, and change controller-launched task leads from `xhigh` to `high` thinking.
```

Full `pilot-base..pilot-head` diff and relevant tests inspected. Tests and checks were not run. No host update was made.

Follow-ups: launch fallback wording still references `xhigh`; the root README still lists 33 Engineering skills instead of 34. The skill’s referenced `RUNTIME.md` is absent from the fixture.