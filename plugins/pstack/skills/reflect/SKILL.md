---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
---

Read [Codex runtime guidance](../../CODEX.md) before this workflow. It defines tool mappings and overrides upstream host assumptions.

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

## When to invoke

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## Process

### 1. Locate the active transcript

Use the Codex history workflow in CODEX.md. Identify this project and the exact task before reading messages. If the transcript is unavailable, use a labeled session digest and report the missing evidence.

### 2. Spawn three reviewers in parallel

One message, three `spawn_agent` calls, a general-purpose Codex subagent, explicit `model:` on each, a read-only brief. Use the tools exposed to the child; the parent applies edits.

| Lens | `model` | Prompt template |
|---|---|---|
| Judgment | the `reflect judgment, divergent, synthesizer` role resolved per CODEX.md | `references/judgment-reviewer.md` |
| Tooling | the `reflect tooling` role resolved per CODEX.md | `references/tooling-reviewer.md` |
| Divergent | the `reflect judgment, divergent, synthesizer` role resolved per CODEX.md | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their completion messages; spawning itself returns an agent handle, not their finished findings.

### 3. Synthesize

One `spawn_agent` call, a general-purpose Codex subagent, using the `reflect judgment, divergent, synthesizer` role resolved per CODEX.md, a read-only brief. Use available tools to spot-check citations. Use `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. The synthesizer returns a structured Accepted / Rejected / Backlog list.

### 4. Structural enforcement check

Sanity-check the synthesizer's Accepted list. For any item that would be enforced more reliably by a lint rule, script, metadata flag, or runtime check, move it from Accepted to Backlog. See the **encode-lessons-in-structure** principle skill.

### 5. Apply

Before applying any Accepted edit, present the synthesizer's full Accepted/Rejected/Backlog output to the user and wait for explicit approval. The user picks which subset to apply and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

List backlog items locally. File tickets only if the user has authorized publication to that tracker.

For each approved Accepted item, follow the Routing field exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): parent does directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): hand to the installed `skill-creator` skill and run its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand to `skill-creator` and check its description and invocation policy against realistic trigger examples.
- `new skill via skill-creator: <kebab-name>`: hand creation to `skill-creator`. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done. Skip this step if it doesn't.

### 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
