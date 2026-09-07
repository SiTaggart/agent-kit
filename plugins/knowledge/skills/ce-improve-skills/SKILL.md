---
name: ce-improve-skills
description: "Improve agent guidance from evidence. Use for continual-improvement loops that patch skills, AGENTS.md, or CLAUDE.md from recurring corrections and verified session friction across local coding agents."
---

# Agent Guidance Improvement Loop

Turn session evidence into small, measured patches to the guidance that owned
the failed behavior.

This is guidance reinforcement, not model training. The reward signal is
whether later independent sessions need less steering.

## Default Scope

If the user names a skill, instruction file, gotcha, proposal, error, or time
window, use that. Otherwise use the last 7 days across all repositories and
worktrees.

Do not bulk-read raw session files. Use QMD retros to seed terms, then run
`ce-sessions` in global mode across every available agent store for the
requested window.

Breadth and depth are separate dials. Discovery breadth is always machine-wide:
most work happens outside `.agents`, across many repositories and worktrees, so
a scan scoped to one project measures the wrong population. Extraction depth
stays selective: inventory every root session, then extract only likely
correction or failure candidates. "Focused" narrows depth, never breadth.
Report the machine-wide root-session count before naming a signal recurring.

## Evidence Sources

Gather the smallest evidence set that can justify a change:

1. Read the candidate owner file and any references it says are part of its
   contract. For shared skills, also read the canonical `.agents` `AGENTS.md`
   and `README.md`.
2. Query QMD, usually collection `ai`, for exact terms first:
   - `lex: <skill-name> gotcha proposal correction retry failure`
   - `vec: how has <skill-name> caused friction or needed improvement`
3. Read the matching gotchas, proposals, digests, or other actual results with
   `qmd get`; do not assume every evidence category exists. Treat retro counts
   and `top_friction` lists as pointers to sessions worth inspecting. The
   collector matches transcript text, so prompts, skill documentation, file
   reads, and quoted output inflate its totals. Confirm each signal at an
   executed event — a failed command, a real user correction, a reproducible
   failure — before it counts as friction.
4. Run `ce-sessions` in global mode for the requested window. Inventory every
   available store: Claude Code, standard and Orca-managed Codex, Cursor,
   and OpenCode. For an automated weekly audit, dispatch one bounded
   analysis subagent per available platform; each receives only selected
   skeleton paths and returns candidate corrections with root-session
   provenance. The parent deduplicates and owns the final routing decision.
5. Check coverage before deciding. Report unavailable or empty stores rather
   than silently treating the scanned platforms as machine-wide coverage. QMD
   plus session evidence must overlap the requested window and address the
   candidate guidance behavior.

## Correction Evidence

The evidence unit is an independent human/root session. Group descendants under
their parent and count the same correction once per lineage.

Count a correction only when a human follow-up redirects agent behavior.
Exclude initial requests, approvals, system or developer text, automation
prompts, tool output, quoted or forwarded transcripts, and worker prompts.
Paraphrase corrections in reports; do not reproduce personal transcript text.

## Reward Signals

Treat these as evidence that guidance may need reinforcement:

- repeated user corrections
- repeated retries or abandoned paths
- repeated test, type, sandbox, auth, or timeout failures
- repeated over-widening, over-delegation, or scope creep
- missing proof after a skill says proof is required
- a successful pattern that appears in multiple sessions but is not yet in the
  owning guidance

Reading the target skill itself surfaces a second evidence class — textual
failure modes independent of session friction: **no-op** lines the model
already obeys by default, **sediment** (stale layers never cleared), **sprawl**
(too long even when every line is live), **duplication** (one meaning in more
than one place), and **premature completion** invited by a vague completion
criterion. Consult an installed skill-writing companion for its taxonomy and
cures when one is available.

Do not optimize vanity metrics such as fewer tool calls if the result becomes
less correct.

## Decision Rule

Use the first outcome that fits:

1. **Direct patch** - the same correction appears in at least two independent
   root sessions, or one new session confirms an already verified current
   gotcha; it maps cleanly to one owner; and current guidance has a real gap.
2. **Proposal** - the signal is cross-cutting, risky, based only on aggregate
   metrics, or needs more than one owner file.
3. **No change** - the evidence is one-off, stale, contradicted, or already
   covered by the current owner. A defect in the evidence pipeline itself is
   also no change: record it against the existing paydown proposal rather than
   reshaping a skill to absorb measurement error.

An automated run applies at most one file per signal. A wider change is a
proposal.

## Owner Resolution

Choose one owner in this order:

1. The personal or project skill actually invoked for skill-specific behavior.
2. The nearest tracked `AGENTS.md` or `CLAUDE.md` ancestor covering the touched
   files for repository-local rules.
3. The canonical shared `/Users/staggart/.agents/skills/<name>/SKILL.md` or root
   `AGENTS.md` only for genuinely cross-project behavior.

Resolve symlinks and generated mirrors to their canonical source. Never patch
`.generated/`, `~/.claude`, `~/.config/opencode`, or mirrored Codex copies.

For common shared-skill behavior, use this owner map:

| Signal | Owner |
| --- | --- |
| session discovery, extraction, widening, privacy | `ce-sessions` |
| implementation scope, product contract, proof | `ce-work` |
| mechanical checks, touched-surface quality | `ce-quality-gate` |
| review severity, deduplication, verdicts | `ce-review` |
| solved-problem docs, lessons, stale learnings | `ce-compound` / `ce-compound-refresh` |
| plan artifacts, plan depth, handoff quality | `ce-plan` |
| root-cause debugging behavior | `ce-debug` |
| browser/manual UI proof | `ce-polish` |

For cross-cutting behavior, prefer one root `AGENTS.md` or a proposal only when
one owner skill cannot honestly contain the fix.

## Patch Discipline

Before editing, state:

- the behavior being reinforced
- the owner guidance
- the expected future signal that should improve

Record `git status --short` and `HEAD` for every target repository. When the
owner file is already dirty or the canonical checkout is unavailable, leave it
byte-for-byte unchanged and return an exact proposal.

Then make the smallest durable change, reaching for an installed skill-writing
companion's levers first when available:

- prefer replacing or deleting one misleading instruction over adding a new
  phase
- prune **no-ops** and **sediment**; collapse **duplication** into a **single
  source of truth** or a **leading word**; cure **sprawl** by **progressive
  disclosure**, adding a new reference file only when the SKILL.md branch would
  otherwise become noisy
- steer with the **positive** target, not prohibition (**negation**); sharpen a
  vague **completion criterion** before splitting to hide later steps
- keep examples concrete and short
- reuse the existing session adapters; add one only when a platform store lacks
  a safe extraction boundary
- preserve cross-platform tool wording when a skill runs across Codex, Claude
  Code, Cursor, OpenCode, Gemini, or Pi

Leave every applied patch uncommitted for human review. Do not commit, push,
sync generated targets, resolve review threads, or touch unrelated files.

## Verification

After editing:

1. Read back every changed line.
2. Run `git diff --check` in every edited repository.
3. Render shared skill changes with `bun run render` from the `.agents` root.
4. Run `bun run test` only when source code, render behavior, hooks, or scripts
   changed. For a SKILL.md-only patch, render plus readback is enough.
5. If the behavior is non-trivial and cheap to exercise, forward-test the skill
   on one realistic prompt. Skip forward-testing for tiny wording patches and
   say so.
6. Finish with `git status --short` and prove `HEAD` did not change.

## Output

Return a compact report:

```markdown
Coverage: <root-session count per available platform and explicit gaps>
Evidence: <paraphrased correction, agent/session/cwd/time, independent count>
Guidance gap: <what the current owner failed to say clearly>
Owner: <canonical file and why it owns the behavior>
Decision: direct patch | proposal | no change
Changed: <uncommitted files or exact proposal>
Verified: <commands/readback/forward-test>
Next measurement: <what to check in future retros>
```

Do not claim the loop worked until a later retro or session search shows the
target signal dropped.
