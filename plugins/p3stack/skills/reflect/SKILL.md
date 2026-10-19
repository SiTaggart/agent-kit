---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

Read [PStack runtime guidance](../../RUNTIME.md) before this workflow. It defines tool mappings and overrides upstream host assumptions.

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Use the host history workflow in RUNTIME.md. Identify this project and the exact task before reading messages. If the transcript is unavailable, use a labeled session digest and report the missing evidence.

## 2. Spawn three reviewers in parallel

One message, three native subagent calls, a general-purpose native subagent, explicit `model:` on each, a read-only brief. Use the tools exposed to the child; the parent applies edits. Pick each subagent's reasoning level for the job, per the Subagents section of `$poteto-mode`.

| Lens | `model` | Prompt template |
|---|---|---|
| Judgment | the `reflect judgment, divergent, synthesizer` role resolved per RUNTIME.md | `references/judgment-reviewer.md` |
| Tooling | the `reflect tooling` role resolved per RUNTIME.md | `references/tooling-reviewer.md` |
| Divergent | the `reflect judgment, divergent, synthesizer` role resolved per RUNTIME.md | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Reviewers return findings in their completion messages; background spawning returns a handle; a foreground call may return the result directly. Follow the native tool’s documented completion contract.

## 3. Synthesize

One native subagent call, a general-purpose native subagent, using the `reflect judgment, divergent, synthesizer` role resolved per RUNTIME.md, a read-only brief. Use available tools to spot-check citations. Use `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. The synthesizer returns a structured Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. The user picks the subset and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

List backlog items locally. File tickets only if the user has authorized publication to that tracker.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): parent does directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): follow the selected adapter’s skill-authoring workflow and its draft / test / iterate loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): hand to `skill-creator` and check its description and invocation policy against realistic trigger examples.
- `new skill via skill-creator: <kebab-name>`: hand creation to `skill-creator`. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
