---
name: ce-handoff
description: "Compact the current conversation into a durable handoff document for another agent or future session. Use when the user asks to hand off, pause with context, summarize work for the next session, or prepare a continuation brief."
argument-hint: "[what the next session will focus on]"
---

# Handoff

Write a compact continuation brief so a fresh agent can pick up the work without
reconstructing the session.

## Input

<handoff_focus> #$ARGUMENTS </handoff_focus>

If `<handoff_focus>` is present, treat it as the next session's intended focus.
If it is blank, infer the focus from the current conversation and current
checkout state.

## Contract

The output is one markdown file that preserves decision context, current state,
and the next useful move. It should reduce steering in the next session.

Do not duplicate content already captured in canonical artifacts (PRDs, plans,
ADRs, issues, PRs, commits, review reports, diffs) — reference them by path,
URL, branch, commit, or command instead. Keep the business reason and changed
product contract visible, prefer exact paths and verification evidence over
prose memory, mark uncertainty explicitly instead of smoothing it over, and
suggest only the skills that should actually be used next.

## Destination

Write to `.ai/handoffs/YYYY-MM-DD-<topic>-handoff.md` at the workspace root
(repo root when inside a git repo; create the directory if needed; if the path
exists, update it only when it is clearly the same handoff). Use an OS temp
file only when there is no sensible workspace-local home, and say why.

## Context Scan

Gather only the context a useful handoff needs — repo state, matching `.ai/`
artifacts, referenced docs and PRs — and above all **the latest user
correction or scope boundary that the next session must not lose**.

## Document Shape

Use this structure unless the task clearly needs a smaller one:

```markdown
---
created: YYYY-MM-DD
status: ready|paused|blocked
focus: <next-session focus>
repo: <repo name or path>
branch: <branch if known>
---

# Handoff: <topic>

## Next Session Goal

<The one outcome the next agent should drive toward.>

## Business / Contract Frame

- Business reason:
- Contract being changed or protected:
- Scope boundaries:

## Current State

- What is already done:
- What is partially done:
- What is not started:

## Key Decisions

- <Decision, rationale, and source path/URL if one exists.>

## Files And Artifacts To Read

- `<path or URL>` - why it matters

## Remaining Work

1. <Concrete next step.>
2. <Concrete next step.>

## Verification

- Passed:
- Not run:
- Blocked:

## Risks / Open Questions

- <Only real blockers, uncertainties, or traps.>

## Suggested Skills

- `<skill-name>` - why this is the right next tool

## Starter Prompt

<A short prompt the next session can use verbatim.>
```

For a tiny handoff, keep only `Next Session Goal`, `Current State`,
`Remaining Work`, `Verification`, `Suggested Skills`, and `Starter Prompt`.

## Quality Bar

Read the written file back. The bar: the next session must be able to start
without asking "what happened?"

## Final Response

Keep the user-facing response brief:

```text
Handoff written: <absolute path>
Status: <ready|paused|blocked>
Best next skill: <skill or "none">
```
