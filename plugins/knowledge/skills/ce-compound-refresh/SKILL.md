---
name: ce-compound-refresh
description: Refresh stale .ai/solutions learnings against current code. Use for "refresh my learnings", audit stale learnings, or consolidate overlapping docs.
argument-hint: "[optional: scope hint — directory, filename, module, or keyword] [mode:headless] "
---

# Compound Refresh

Maintain the quality of `.ai/solutions/` over time. Review existing learnings
against the current codebase, then refresh any derived pattern docs that
depend on them.

## Mode Detection

Check `$ARGUMENTS` for `mode:headless`. If present, strip it (the remainder is
the scope hint) and run headless.

### Headless

No user interaction, ever — these rules own all headless behavior for the run:

- **Never pause for input.** Apply all safe actions directly: Keep, Update,
  Consolidate, auto-Delete, and Replace with sufficient evidence. If a write
  succeeds, record it as **applied**; if it fails (e.g., permission denied),
  record it as **recommended** and continue.
- **Mark stale when uncertain.** Genuinely ambiguous classification,
  insufficient Replace evidence, memory-only drift with no codebase
  corroboration, or substantive inbound citations → add `status: stale`,
  `stale_reason`, `stale_date` to the frontmatter instead of acting. Err
  toward stale-marking over incorrect action.
- **Scope:** no hint → process everything; a hint that matches nothing →
  report the miss and exit without widening.
- **Bootstrap requests** default to the refresh cycle (vocabulary is seeded
  within Phase 4.5); note in the report that a standalone repo-wide bootstrap
  was not run.
- **The report is the sole deliverable** — self-contained, printed in full,
  with **Applied** and **Recommended** sections (see Output Format).

## CONCEPTS.md bootstrap requests

If invoked specifically to create `CONCEPTS.md` ("build the concept map",
"set up shared vocabulary"), disambiguate with one blocking question (fall back to a question in chat when the tool is unavailable):

1. **Create CONCEPTS.md** — skip the classification phases. Read
   `../ce-compound/references/concepts-vocabulary.md` and follow its Seed
   goal and Scope-of-a-seed (repo-wide) rules: seed the project's core domain
   nouns from the declared domain model, each meeting the qualifying bar.
   Write the preamble (Phase 4.5), cluster per the organization rules, run
   the Discoverability Check, then enter Phase 5 to commit — do not leave the
   bootstrap uncommitted.
2. **Run a refresh cycle** — proceed normally; `CONCEPTS.md` is seeded (if
   absent) and reconciled in Phase 4.5.

## Interaction Principles (interactive mode)

Ask questions one at a time with the platform's blocking question tool (fall back to a question in chat when the tool is unavailable), prefer multiple choice, lead with a
recommendation and one sentence of rationale, and never ask before you have
evidence. The goal is a good maintenance decision with the least friction,
not a checklist march.

## Refresh Order

Learnings first, then the pattern docs that depend on them — learning docs
are the primary evidence and stale learnings can make a pattern look more
valid than it is. If the user names a pattern doc, start there to understand
the concern, but inspect its supporting learnings before changing it.

## Maintenance Model

Classify each candidate into one of five outcomes:

| Outcome | Meaning | Default action |
|---------|---------|----------------|
| **Keep** | Still accurate and useful | No file edit; report it was reviewed and remains trustworthy |
| **Update** | Core solution correct, references drifted | Apply evidence-backed in-place edits |
| **Consolidate** | Docs overlap heavily, both correct | Merge unique content into the canonical doc, delete the subsumed doc |
| **Replace** | Now misleading, better replacement known | Write a trustworthy successor, delete the old |
| **Delete** | No longer useful, applicable, or distinct | Delete — git history is the archive |

## Core Rules

1. **Evidence informs judgment.** Signals are inputs, not a mechanical
   scorecard.
2. **Prefer no-write Keep** — no review breadcrumbs.
3. **Match docs to reality, not the reverse.** When code and doc disagree,
   update the doc. This skill does doc accuracy, not code review — never ask
   whether code changes were "intentional."
4. **Be decisive, minimize questions.** Clear evidence → act. Interactive:
   ask only on genuine ambiguity. Headless: stale-mark instead.
5. **Avoid low-value churn** — no typo-polish or cosmetic edits.
6. **Update only for meaningful, evidence-backed drift** — paths, module
   names, links, snippets, metadata, clearly stale wording.
7. **Replace only with a real replacement**: a verified fix in the current
   conversation, concrete user-supplied context, a codebase investigation
   that can document the current approach, or strong successor evidence in
   newer docs/PRs/issues.
8. **Delete when the code is gone — after the two Delete checks in Phase 2.**
   Don't default to Keep because the general advice is still "sound."
9. **Evaluate document-set design, not just accuracy.** Redundant docs drift
   silently — two docs saying the same thing will eventually say different
   things.
10. **Delete, don't archive.** No `_archived/` directory. Git history
    preserves every deleted file (`git log --diff-filter=D -- .ai/solutions/`).
    An archive directory accumulates, pollutes search, and nobody reads it.

## Scope Selection

Discover `.md` files under `.ai/solutions/`, excluding `README.md` and
anything under `_archived/` (if that legacy directory exists, flag it for
cleanup in the report).

If `$ARGUMENTS` provides a scope hint, narrow with the first strategy that
produces results: directory name → frontmatter (`module`, `component`,
`tags`) → filename (partial ok) → content keyword. No matches: ask the user
to clarify (interactive) or report and exit (headless).

If no candidate docs exist at all, report that and suggest running
`ce-compound` after solving problems.

## Phase 0: Assess and Route

Estimate scope and choose the lightest path by judgment: a named doc or two
→ investigate directly and present a recommendation; a batch of mostly
independent docs → investigate first, present grouped recommendations; a
broad or repo-wide sweep → triage before deep investigation: read candidate
frontmatter, cluster by module/area, spot-check whether each cluster's
primary referenced files still exist, and start with the highest-impact
cluster (dense cluster + missing references = strongest signal). Interactive:
confirm the starting area with one question. Headless: process clusters in
impact order. Gather evidence before asking any action-selection question.

## Phase 1: Investigate Candidate Learnings

For each learning in scope, read it, cross-reference its claims against the
current codebase, and form a recommendation. Staleness hides in independent
dimensions:

- **References** — do mentioned paths, classes, modules still exist?
- **Recommended solution** — does the fix still match how the code works
  today? A renamed file with a different implementation pattern is not a
  path update.
- **Code examples** — do snippets reflect the current implementation?
- **Related docs** — are cross-references still present and consistent?
- **Auto memory** (Claude Code only) — do injected auto-memory entries in the
  same problem domain describe a different approach? Supplementary signal
  only.
- **Overlap** — note when another in-scope doc covers the same problem,
  files, or solution; record the paths, overlapping dimensions, and which
  doc looks broader or more current (feeds Phase 1.75).
- **Vocabulary** — note cited domain terms: present in `CONCEPTS.md`? Still
  accurate there? Collect centrally for Phase 4.5; don't edit during
  investigation.

Match investigation depth to the learning's specificity — exact paths and
snippets need more verification than a general principle.

### Drift Classification: Update vs Replace

Cosmetic drift (references moved, solution unchanged) is **Update** — fix
directly. Substantive drift (the solution itself changed, the architecture
shifted, the pattern is no longer preferred) is **Replace** — a replacement
subagent writes the successor in `ce-compound`'s document format from the
evidence already gathered; the orchestrator never rewrites learnings inline.

**The boundary:** if you find yourself rewriting the solution section or
changing what the learning recommends, stop — that is Replace, not Update.

Memory-sourced drift signals are supplementary: use them to corroborate
codebase drift, prompt deeper investigation, or annotate evidence
("(auto memory [claude])") — never as the sole basis for Replace or Delete.

### Judgment Guidelines

1. **Contradiction = strong Replace signal.** Guidance that conflicts with
   current code is actively misleading, not minor drift.
2. **Age alone is not staleness.** Old-but-accurate is fine; age only prompts
   closer inspection.
3. **Check for successors before deleting.** If newer docs/PRs/issues cover
   the same space, prefer Replace so readers reach the newer guidance.

## Phase 1.5: Investigate Pattern Docs

Patterns are high-leverage derived guidance — a stale pattern misleads more
than a stale learning. Evaluate whether the generalized rule still holds
given the refreshed learnings. A pattern with no clear supporting learnings
is itself a stale signal.

## Phase 1.75: Document-Set Analysis

Step back and evaluate the set — problems visible only when comparing docs
to each other.

- **Overlap:** for docs sharing a module/domain, compare problem statement,
  solution shape, referenced files, prevention rules, root cause. High
  overlap on 3+ dimensions is a strong Consolidate signal: would a future
  maintainer need both docs, or is one repeating the other?
- **Supersession:** an older narrow precursor subsumed by a newer, broader,
  more current doc is a consolidation candidate — merge its unique content,
  delete it.
- **Canonical doc per cluster:** identify the doc a maintainer should find
  first (usually newest, broadest, most accurate). Every other doc is
  **distinct** (independent retrieval value — keep), **subsumed**
  (consolidate), or **redundant** (delete).
- **Retrieval-Value Test:** separate docs earn their keep only when they
  cover sub-problems someone would search for independently, target
  different audiences, or merging would harm navigation more than drift
  risk harms accuracy. Otherwise consolidate — drift-prone twins are worse
  than one longer doc.
- **Conflicts:** outright contradictions between docs are more urgent than
  staleness — resolve immediately via Consolidate or targeted
  Update/Replace.

## Subagent Strategy

Use subagents for context isolation when investigating multiple artifacts;
run the main thread for small scopes. Two roles:

1. **Investigation subagents** — read-only; never edit, create, or delete.
   Each returns: path, evidence, recommended action, confidence, open
   questions. Parallelize freely across independent artifacts; investigate
   overlapping docs together.
2. **Replacement subagents** — each writes one successor learning (pass the
   `../ce-compound` contract-file pointers). Parallelize independent
   candidates. The orchestrator owns all deletions and metadata edits.

When spawning, do not override the sub-agent's permission mode (the user's
permission settings apply), tell subagents to use dedicated file tools rather
than shell for file operations, and have them scan the auto-memory block
(when present) for domain-relevant notes, reporting memory-sourced signals
separately tagged "(auto memory [claude])".

## Phase 2: Classify the Right Maintenance Action

Assign one recommended action per candidate.

- **Keep** — accurate and useful; no edit. Add `last_refreshed` only if
  already making a meaningful update.
- **Update** — apply the reference fixes directly.
- **Consolidate** — Phase 1.75 found heavy overlap with both docs correct:
  merge unique content into the canonical doc, then delete the subsumed doc.
  Nothing unique → skip straight to Delete.
- **Replace** — core guidance is misleading. Don't ask the user for context
  they won't have months later — investigate and synthesize. Sufficient
  evidence (you understand both the old recommendation and the current
  approach) → write the successor (Phase 4). Insufficient → mark stale with
  `stale_reason` and recommend `ce-compound` after the user's next encounter
  with that area.
- **Delete** — code and problem domain are gone, or the doc is fully
  redundant with no successor evidence. Two checks first:
  - **Is the problem domain still active?** Missing files prove the
    *implementation* is gone, not the problem. Session tokens handled by a
    new module after `auth_token.rb` disappeared is Replace, not Delete; a
    fully removed feature is Delete. Don't search mechanically for old
    keywords — understand the concept and look for where the problem lives
    now.
  - **Inbound links.** Search the repo's markdown (not source code) for
    citations of the filename slug. **Decorative** (principle stated inline,
    "see also") → Delete is fine, clean citations in the same commit;
    **substantive** (citing doc relies on it for content not stated inline)
    → Replace at the same path, or Keep with narrowed scope;
    **mixed/unclear** → stale-mark. Citations inform classification, not
    cleanup — cleanup is always mechanical.

  **Auto-delete only when all three hold:** implementation gone (or clearly
  superseded / plainly redundant), problem domain gone, and inbound links
  absent or unambiguously decorative.

## Pattern Guidance

Apply the same five outcomes to pattern docs as derived guidance: Keep when
the underlying learnings still support the rule; Update when examples or
references drifted; Consolidate when two patterns generalize the same
learnings; Replace when the refreshed learning set supports a different
synthesis (never invent rules from guesswork); Delete when no longer valid,
recurring, or distinct.

## Phase 3: Ask for Decisions (interactive only)

Apply most Updates and Consolidations directly. Ask only when:

- the right action is genuinely ambiguous (Update vs Replace vs Consolidate
  vs Delete)
- a Delete does not meet the auto-delete criteria
- the canonical doc for a Consolidate is not clear-cut
- a Replace successor is about to be created

Present the evidence (path, 2–4 bullets, recommended action + rationale) and
ask one question at a time, recommendation first, offering only the plausible
actions plus "skip for now". For batches, group the obvious Keeps and Updates
and handle Replace/Delete individually. Never ask about code intent — stay
in the doc-accuracy lane. Headless: skip this phase entirely; execute
classifications directly, stale-marking the ambiguous.

## Phase 4: Execute the Chosen Action

For each candidate, read `references/per-action-flows.md` and follow the
matching section — it holds the per-action criteria, examples, and steps:

- **Keep** — no edit; summarize why it remains trustworthy.
- **Update** — in-place edits.
- **Consolidate** — merge into canonical, delete subsumed, update
  cross-references (orchestrator-owned).
- **Replace** — successor via subagent, validate frontmatter, delete the old;
  stale-mark when evidence is insufficient.
- **Delete** — final inbound-link check, then remove; reclassify on
  late-discovered substantive citations.

## Phase 4.5: Vocabulary Capture

Read `../ce-compound/references/concepts-vocabulary.md`, then reconcile the
domain terms flagged in Phase 1 with `CONCEPTS.md`, applying the reference's
criteria and organization rules:

- **Aggregate** qualifying terms across the scope; union shades of the same
  term into one entry.
- **Existing file:** add missing terms, refine entries where new precision
  surfaced, then backfill any central-but-missing core nouns of the area in
  scope (re-derived per the Seed goal) — bounded to the scope, never a
  repo-wide sweep. Scrub entries violating the reference's criteria
  (implementation specifics, config values that drift, metadata, duplicates,
  undefined siblings) — the full-file scrub is appropriate here because
  refresh is an audit.
- **No file and a qualifying term surfaced:** bootstrap — seed the area's
  core nouns alongside it (conservative bar for borderline terms), start
  with the standard preamble under `# Concepts` (see the reference and
  ce-compound Phase 2.4), and let term count drive shape.
- Apply edits silently in every mode; record the outcome in the report's
  `CONCEPTS.md` line (including "scanned, no qualifying terms").

## Output Format

Print the full report as markdown — it is the deliverable, never a one-line
summary:

```text
Compound Refresh Summary
========================
Scanned: N learnings

Kept: X
Updated: Y
Consolidated: C
Replaced: Z
Deleted: W
Skipped: V
Marked stale: S

CONCEPTS.md: <scanned, no qualifying terms | created with N entries (M seeded) | updated — N added, N refined, N reconciled, N scrubbed | repo-wide map created with N entries>
```

Then for every file processed: path, classification, evidence found (tag
memory-sourced findings "(auto memory [claude])"), and the action taken or
recommended. For Consolidate: the canonical doc, what was merged, what was
deleted. List Keeps under a reviewed-without-edits section.

**Headless report:** split actions into **Applied** (writes that succeeded)
and **Recommended** (writes that failed — same detail, framed so a human can
apply them or re-run interactively). All writes failing turns the report
into a maintenance plan. If `.ai/solutions/_archived/` exists, list its
files and recommend disposition (restore, delete, or consolidate).

## Phase 5: Commit Changes

Skip if no files were modified. Check the current branch, other uncommitted
changes, and recent commit style first. Stage only the files this refresh
modified.

**Headless defaults:** on main/master — create a branch named for what was
refreshed (e.g., `.ai/refresh-auth-learnings`), commit, attempt a PR
(report the branch if PR creation fails); on a feature branch — separate
commit on the current branch; git failures — include the recommended
commands in the report and continue.

**Interactive:** offer the options that fit the detected state — on
main/master: branch + commit + PR (recommended), commit here, or don't
commit; on a clean feature branch: separate commit here (recommended), new
branch, or don't commit; on a dirty feature branch: selective-stage commit
here, or don't commit.

Commit message: summarize what was refreshed (e.g., "update 3 stale
learnings, consolidate 2 overlapping docs"), matching the repo's conventions.

## Relationship to ce-compound

`ce-compound` captures a newly solved, verified problem; this skill maintains
older learnings — individual accuracy and collective document-set design.
Replace only with real evidence; otherwise stale-mark and recommend
`ce-compound` for the next encounter. Consolidate proactively — every
capture adds a doc, and periodic consolidation keeps the set lean.

## Discoverability Check

After the refresh report is generated, run the shared check in
`../ce-compound/references/discoverability-check.md`. Mode-specific
interaction for this skill: **interactive** — show the proposed change and get
consent via the blocking question tool before editing; **headless** — do not
edit instruction files (headless scope is doc maintenance, not project
config); include a "Discoverability recommendation" line in the report
instead.

**Commit handling when the check produces edits:** if Phase 5 already
committed the refresh changes, stage the edited instruction file and amend
(same branch, not pushed) or create a small follow-up commit (e.g., `docs: add
.ai/solutions/ discoverability to AGENTS.md`); if Phase 5 pushed, push the
follow-up too so the open PR includes it. If the user chose "Don't commit" in
Phase 5, leave the edits unstaged alongside the other uncommitted changes.
