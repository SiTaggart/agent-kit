---
name: document-review
description: Review requirements, PRDs, kickoff docs, and implementation plans with taste. Use after ce-plan for markdown plans, before ce-plan for requirements docs that need a quality pass, or whenever a written project artifact needs sharper scope, coherence, and reader utility.
argument-hint: "[mode:headless] [path/to/document.md]"
---

# Document Review

Review a written artifact so the next reader can act with less ambiguity. This
is a document-quality pass, not a work review and not a compliance gauntlet.

## Loop Role

Use `document-review` for requirements docs, PRDs, kickoff docs, and
implementation plans. In the planning loop it runs after `ce-plan` for markdown
plans and can run before `ce-plan` for requirements docs that need tightening.

Use `ce-review` only after work exists as a branch, PR, or local diff.

## Modes

Arguments may include `mode:headless` and a document path.

- **Headless** - apply only trivial-safe fixes, then return a compact envelope
  with counts and remaining findings. No questions.
- **Interactive** - apply trivial-safe fixes, present findings, and ask what to
  do next.

If headless mode has no path, stop with:

```text
Review failed: headless mode requires a document path. Re-invoke with: Skill("document-review", "mode:headless <path>")
```

## Review Contract

Preserve the artifact's job.

- Requirements docs answer **what and why**. Do not push implementation detail
  into them unless the requirement is explicitly technical.
- Plans answer **how**. Do not relitigate settled product direction unless the
  plan contradicts its origin or would make implementation fail.
- Kickoff docs and PRDs answer **who, why, what changes, and how we know**.
  Keep them clear enough for planning without turning them into engineering
  plans.

Prefer concrete reader outcomes over abstract critique. A finding should explain
what a planner, implementer, reviewer, or stakeholder would get wrong.

## What To Look For

Run these passes in the parent thread. Use a focused subagent only when the
document is large, high-stakes, or unfamiliar enough that an independent read
would materially improve judgment. Subagents advise; the parent decides.

### Technical Writing

Review the artifact itself against the documentation writing standard in the
active `AGENTS.md`. If it does not define one, use ASD-STE100 Simplified
Technical English.

- apply trivial-safe wording corrections directly
- report corrections that could change meaning or product intent as proposed
  fixes
- ignore personal style preferences that the selected standard does not require

### Coherence

- contradictory scope, terminology, counts, examples, or section references
- summaries that say something different from the detailed sections
- missing definitions for terms that carry project-specific meaning
- duplicated requirements that will make implementers choose between versions

### Scope And Priority

- required behavior hidden in nice-to-have sections
- goals that do not map to requirements or implementation units
- unresolved decisions that would change the plan or build
- over-specified future work that distracts from the current contract

### Feasibility And Handoff

- plan units that cannot be built or verified independently
- requirements that lack acceptance evidence or testable outcomes
- dependencies, data sources, or ownership boundaries that are named but not
  resolved enough for the next loop
- missing verification surface for the artifact's promised outcome

### Product And Design

Use an installed design companion's taste bar when the artifact describes a UI, workflow,
screen, dashboard, or interaction.

- unclear target user or primary workflow
- UI states, empty/error/loading paths, accessibility, or responsive behavior
  missing where they affect the product contract
- visual polish proposed as decoration rather than supporting the task
- operational tools described like marketing pages instead of work surfaces

### Security And Data Boundaries

Review only concrete trust-boundary issues. Do not add generic rollout,
support, or compliance concerns unless the document changes auth, permissions,
payments, privacy, credentials, external APIs, migrations, or persisted data.

## Fix Policy

Apply trivial-safe fixes directly:

- typo or obvious grammar fix
- stale internal section reference
- count mismatch where the authoritative list is in the same document
- terminology drift where the document clearly establishes one term
- broken markdown formatting

Do not silently apply meaning changes. Anything that changes scope, priority,
behavior, sequencing, data contracts, or product intent becomes a finding.

After edits, read back the changed lines.

## Finding Shape

Keep findings few and high-signal. Drop style preferences and anything that
does not affect a reader's next action.

Use these buckets:

- **Proposed fixes** - one concrete fix is probably right, but it changes
  meaning enough to need confirmation.
- **Decisions** - the document exposes a real fork or unresolved choice.
- **FYI observations** - useful context that should not block the next loop.

Severity:

- `P1` - likely to cause wrong build, wrong product decision, or serious rework
- `P2` - meaningful ambiguity, missing handoff detail, or avoidable confusion
- `P3` - minor clarity issue worth knowing but not worth blocking on

Avoid `P0` unless the document would actively direct unsafe or destructive work.

Each finding should include:

- file and section or line
- issue in one sentence
- consequence for the next reader
- concrete fix direction

## Headless Output

When invoked with `mode:headless`, return this compact shape:

```markdown
Review complete
fixes_applied: <number>
proposed_fixes_count: <number>
decisions_count: <number>
fyi_count: <number>
p1_count: <number>

## Proposed fixes
- `path:line` - ...

## Decisions
- `path:line` - ...

## FYI observations
- `path:line` - ...
```

Omit empty sections. The caller uses these counts to decide whether to show a
deeper review option.

## Interactive Output

Start with the same findings, then ask one blocking question when available:

```text
Document review complete. What should I do with the remaining findings?
```

Options:

1. Apply proposed fixes
2. Walk through decisions
3. Append unresolved decisions to Open Questions
4. Report only
5. Proceed to the next loop

Use the platform's blocking question tool when available. Fall back to a
numbered list only when the tool is unavailable or errors.

Apply only the option the user selects. If edits are made, read back the changed
lines and re-run the short review pass on the edited sections before returning.
