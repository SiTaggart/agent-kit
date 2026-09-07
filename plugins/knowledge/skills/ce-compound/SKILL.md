---
name: ce-compound
description: Document a recently solved problem into .ai/solutions/ and, when domain terms surface, CONCEPTS.md — the project's shared domain vocabulary.
argument-hint: "[optional: brief context] [mode:headless] "
---

# /ce-compound

Coordinate parallel subagents to document a recently solved problem while
context is fresh, creating structured documentation in `.ai/solutions/` with
YAML frontmatter for searchability. Each documented solution compounds the
team's knowledge: the first solve takes research; the next occurrence takes
minutes.

Subagents return text; the orchestrator writes the one deliverable — the
solution doc. Two maintenance side effects are expected, not extra
deliverables: a `CONCEPTS.md` create/update (Phase 2.4) and a small
instruction-file edit when the Discoverability Check finds a gap.

## Usage

```bash
/ce-compound                            # Document the most recent fix
/ce-compound [brief context]            # Provide additional context hint
/ce-compound mode:headless              # Non-interactive run for automations
/ce-compound mode:headless [context]    # Non-interactive run with context hint
```

## Preconditions

Document only when all hold: the problem is solved (not in progress), the
solution is verified working, and the problem was non-trivial.

## CONCEPTS.md bootstrap requests

If invoked specifically to create `CONCEPTS.md` from scratch rather than to
document a solved problem, redirect to `ce-compound-refresh` (repo-wide
concept-map creation is its bootstrap path) and exit. `ce-compound` populates
`CONCEPTS.md` only as a side effect of documenting a real learning.

## Mode Detection

Check `$ARGUMENTS` for a `mode:headless` token (strip `mode:` flags before
treating the remainder as the context hint).

| Mode | When | Behavior |
|------|------|----------|
| **Interactive** (default) | No mode token | Mode question, session-history question (Full only), discoverability consent, "What's next?" menu |
| **Headless** | `mode:headless` present | See Headless below |

### Headless

For automations and skill-to-skill invocation — no human is present. Once
detected, headless applies for the entire run:

- No blocking questions. Run **Full mode without session history**; the doc
  produced is identical to an interactive Full run's.
- Skip Phase 3 reviews (no one to act on findings).
- Apply the Discoverability Check edit silently; report it under
  "Instruction-file edit".
- Never invoke `ce-compound-refresh`; put any scope hint in the report's
  "Refresh recommendation" line.
- End with the structured terminal report under Success Output — no menu.

## Pre-resolved context

**Git branch (pre-resolved):** !`git rev-parse --abbrev-ref HEAD 2>/dev/null || true`

If the line resolved to a plain branch name, include it in the `ce-sessions`
payload in Phase 1; if empty or unresolved, omit it and let `ce-sessions`
derive it.

## Support Files

The durable contract for the workflow. Read on-demand at the step that needs
them; give subagents the pointers and the goal rather than prescribing their
process:

- `references/schema.yaml` — frontmatter fields, enum values, track rules,
  category mapping, YAML-safety validation rules
- `references/concepts-vocabulary.md` — CONCEPTS.md format and inclusion rules
- `assets/resolution-template.md` — section structure for new docs

## Execution Strategy

**Interactive:** recommend a mode by judgment — Lightweight for a simple fix
or a session near context limits, Full otherwise — and confirm with one
blocking question (fall back to a question in chat when the tool is unavailable):

```
1. Full — researches, cross-references, and reviews the solution.
2. Lightweight — same doc, single pass; no duplicate detection.
```

If the user chooses Full, ask one follow-up: whether to also search harness
session history (it adds time and tokens). Yes → invoke `ce-sessions` in
Phase 1; no → skip it.

---

### Full Mode

#### Phase 0.5: Auto memory

If the system prompt carries an auto-memory block with entries relevant to
this problem, pass them to the Phase 1 subagents as supplementary evidence —
conversation history and the verified fix take priority, and contradictions
are cautionary context. Tag anything that lands in the doc with
"(auto memory [claude])".

#### Phase 1: Research

Launch the three subagents in parallel first, then invoke `ce-sessions` (only
if the user opted in) — the background subagents keep running underneath.
Each subagent returns text to the orchestrator.

1. **Context Analyzer** — classify the problem against
   `references/schema.yaml`: track (bug vs knowledge), problem_type,
   component, track-appropriate fields, and the `category_mapping` directory.
   Suggest a filename `[sanitized-problem-slug].md` — no date suffix; the
   `date:` frontmatter field is the canonical creation date. Read the schema
   rather than inventing enum values. Returns the frontmatter skeleton
   (including `category:`), directory, filename, and track.
2. **Solution Extractor** — extract the problem story and verified fix from
   conversation history, structured for the track's sections in
   `assets/resolution-template.md` (bug: problem, symptoms, what didn't work,
   solution, why it works, prevention; knowledge: context, guidance, why it
   matters, when to apply, examples), with code examples where useful.
3. **Related Docs Finder** — search `.ai/solutions/` for related docs:
   pre-filter by frontmatter (parallel greps on title/tags/module/component),
   read frontmatter to score candidates, fully read only strong matches, and
   return distilled links and relationships — not file contents. Flag stale
   or contradicted docs. **Assess overlap** with the doc being created across
   five dimensions — problem statement, root cause, solution approach,
   referenced files, prevention rules — scored **High** (4–5 match),
   **Moderate** (2–3), or **Low** (0–1). Search related GitHub issues with
   `gh issue list --search "<keywords>" --state all --limit 5` when `gh`
   exists; otherwise note the search was skipped.

4. **Session history via `ce-sessions`** (synchronous skill call, opt-in
   only; skipped in lightweight and headless). Keep the dispatch payload
   tight — a keyword-rich payload licenses ce-sessions to keep widening:
   - Pre-resolved context (repo, branch) when cleanly resolved
   - Time window: explicit `7 days` unless the problem clearly spans longer
   - Problem topic: one sentence naming the concrete issue
   - Filter rule: "Only surface findings directly relevant to this specific
     problem."
   - Output schema: sections `What was tried before / What didn't work /
     Key decisions / Related context`, omitting empty ones

   ce-sessions is the final Phase 1 input, not a workflow stop — when it
   returns (including "no relevant prior sessions"), proceed directly to
   Phase 2.

#### Phase 2: Assembly & Write

Wait for all Phase 1 inputs, then the orchestrator:

1. **Check the overlap assessment** before writing:

   | Overlap | Action |
   |---------|--------|
   | **High** | **Update the existing doc** with fresher context — two docs describing the same problem will inevitably drift apart. Preserve its path, structure, and title; add `last_updated: YYYY-MM-DD`. |
   | **Moderate** | Create the new doc; flag the overlap for Phase 2.5. |
   | **Low / none** | Create the new doc. |

2. **Fold in session findings** when present: dead ends into What Didn't
   Work (bug) or Context (knowledge); cross-session patterns into Prevention
   or Why This Matters. Tag with "(session history)".
3. Assemble the doc per `assets/resolution-template.md` section order and
   validate frontmatter against `references/schema.yaml`, including its
   YAML-safety quoting rules.
4. `mkdir -p .ai/solutions/[category]/` and write the file.
5. Run `python3 scripts/validate-frontmatter.py <output-path>`; fix and
   re-run until exit 0.

#### Phase 2.4: Vocabulary Capture

Read `references/concepts-vocabulary.md`, then scan the new doc **and** the
surrounding conversation for qualifying domain terms. If `CONCEPTS.md` exists
at repo root, add missing qualifying terms and refine entries where new
precision surfaced. If it does not exist and at least one term qualifies,
create it:

- **Seed the learning's area — don't write a lone term.** Also seed the core
  domain nouns of the area this learning touched (per the Seed goal and
  Scope-of-a-seed rules in the reference); repo-wide seeding is
  `ce-compound-refresh`'s job. Hold the qualifying bar conservatively for
  borderline terms at creation.
- Start the file with this preamble under the `# Concepts` heading:

  > Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

- **Refresh the coherence neighborhood of any entry you touch** — cluster
  siblings and cross-referenced terms: fix glossary violations and refresh
  entries this learning's own evidence shows have drifted. Neighborhood only,
  evidence in hand only; flag anything needing new investigation for
  `ce-compound-refresh`.

Record the outcome either way (e.g., "Vocabulary capture: scanned, no
qualifying terms"). Apply edits silently in every mode — vocabulary capture
is a side effect of compounding, not a per-run decision. Lightweight runs the
update-only version (no creation/seeding).

#### Phase 2.5: Selective Refresh Check

`ce-compound-refresh` is not a default follow-up. Invoke it — or recommend it
when context is tight — only when the new learning is evidence an older doc
is now wrong: contradicted guidance, a superseded solution, a
refactor/rename/upgrade that invalidated references, or a moderate-overlap
consolidation candidate. Prefer the narrowest useful scope hint (file,
module, category, or pattern topic — e.g., `/ce-compound-refresh payments`);
never a bare broad sweep unless the user asks. Always capture the new
learning first.

### Discoverability Check

Run the shared check in `references/discoverability-check.md`. Mode-specific
interaction for this skill: **full interactive** — show the proposed change
and get consent via the blocking question tool before editing; **lightweight**
— output a one-liner note and move on; **headless** — apply the edit directly
without prompting and surface it in the terminal report under
"Instruction-file edit".

#### Phase 3: Optional Enhancement (interactive Full only)

After Phase 2 completes, optionally use the installed `ce-review` skill from
Engineering. Resolve its directory from the host's installed skill catalog.
Use `references/reviewers/code-simplicity.md` for code-heavy examples and
`references/reviewers/performance.md` for code-backed performance follow-up.
Pass the resolved absolute persona path to a fresh, read-only sub-agent using
the platform's native delegation tool. Keep the user's permission settings.
If Engineering is unavailable, skip this optional review and state the gap.
Use an installed security companion for security follow-up; keep database
migration/backfill follow-up in the orchestrator.

---

### Lightweight Mode

Single pass, no subagents — same doc, fewer tokens; the overlap check is
skipped (acceptable: `ce-compound-refresh` catches duplicates later). The
orchestrator:

1. Extracts problem and solution from conversation history (plus relevant
   auto-memory notes, tagged as in Phase 0.5).
2. Classifies against `references/schema.yaml`.
3. Writes a minimal doc per the track template: bug — problem, root cause,
   solution with key snippets, one prevention tip; knowledge — context,
   guidance with key examples, one applicability note.
4. Runs update-only vocabulary capture (Phase 2.4 criteria); creation/seeding
   defers to a Full run.
5. Skips Phase 3.

Report: the file path, a discoverability tip if `AGENTS.md`/`CLAUDE.md`
doesn't surface `.ai/solutions/` (lightweight tips — it never edits
instruction files), the vocabulary outcome, and a note that a Full re-run
adds cross-references and reviews.

## Success Output

### Headless mode

Emit this structured terminal report and end the turn — `Documentation
complete` is the terminal signal callers detect:

```
✓ Documentation complete (headless mode)

File: .ai/solutions/<category>/<filename>.md  (created | updated)
Track: <bug | knowledge>
Category: <category>
Overlap: <none | low | moderate — see <path> | high — existing doc updated>
Instruction-file edit: <none needed | applied to <path> | gap noted, not applied>
CONCEPTS.md: <scanned, no qualifying terms | created with N entries (M seeded from the learning's area) | updated — N added, N refined>
Refresh recommendation: <none | scope hint for /ce-compound-refresh>

Documentation complete
```

When no doc was written (e.g., the problem is not yet solved), emit a
structured failure ending with `Documentation skipped`:

```
✗ Documentation skipped (headless mode)

Reason: <one-sentence explanation>

Documentation skipped
```

### Interactive mode

Report what happened — no fixed transcript: the file path(s) written and
whether created or updated (name the matched doc and dimensions when high
overlap triggered an update), track and category, the overlap outcome, what
auto memory or session history contributed (if anything), the vocabulary
capture outcome, and any specialized reviews run. Then present the
"What's next?" options (continue workflow — recommended, link related docs,
view the doc, other) using the platform's blocking question tool (fall back to a question in chat when the tool is unavailable). Do not end the turn without the user's
selection.
