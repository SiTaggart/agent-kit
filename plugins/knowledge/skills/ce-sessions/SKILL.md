---
name: ce-sessions
description: "Search coding agent session history across Claude Code, Codex, Cursor, OpenCode, and Hermes. Use for past work, previous attempts, or prior investigations."
---

# /ce-sessions

Search session history across Claude Code, Codex, Cursor, OpenCode, and Hermes and synthesize findings about what was worked on, tried, decided, or learned in prior sessions.

## Usage

```
/ce-sessions [question or topic]
/ce-sessions
```

## Pre-resolved context

**Git branch (pre-resolved):** !`git rev-parse --abbrev-ref HEAD 2>/dev/null || true`

**Repo root (pre-resolved):** !`git rev-parse --show-toplevel 2>/dev/null || true`

**Today (pre-resolved):** !`date +%Y-%m-%d`

Use the branch for filtering (pass it to the synthesis subagent), the repo
root's last path component for session discovery, and today's date for
recency windows. If any line above is empty or still contains a backtick
command string, derive that value at runtime instead.

## Guardrails

These rules apply at all times during orchestration and synthesis.

- **Never read entire session files into context.** Session files can be 1-7MB. Always use the extraction scripts to filter first, then reason over the filtered output.
- **Never extract or reproduce tool call inputs/outputs verbatim.** Summarize what was attempted and what happened.
- **Never include thinking or reasoning block content.** Claude Code thinking blocks are internal reasoning; Codex reasoning blocks are encrypted. Neither is actionable.
- **Never analyze the current session.** Its conversation history is already available to the caller.
- **Keep OpenCode read-only.** Query only `session`, `message`, and `part` through `scripts/opencode-sessions.py`; never inspect account, credential, or authentication tables.
- **Surface technical content, not personal content.** Sessions contain everything — credentials, frustration, half-formed opinions. Use judgment about what belongs in a technical summary and what doesn't.
- **Fail fast on access errors.** If session discovery fails on permissions, report the issue immediately. Do not retry the same operation with different tools or approaches — repeated retries waste tokens without changing the outcome.
- **Default to the current project.** Use global mode only when the user explicitly asks across projects or a caller such as `ce-improve-skills` requires machine-wide evidence.

## Execution

If no question argument is provided, ask what the user wants to know about their session history. Use the platform's blocking question tool (fall back to a question in chat when the tool is unavailable). Never silently skip the question.

### Step 1 — Determine scan window

Infer a window from the question; default 7 days, widen only if a narrow scan
finds nothing relevant. Claude Code retains session history for ~30 days by
default, so wider windows may find nothing there unless the user has extended
retention.

### Step 2 — Discover sessions and extract metadata

Create the per-run scratch directory before inventorying any platform:

```bash
SCRATCH=$(mktemp -d -t ce-sessions-XXXXXX)
```

Run the discovery + metadata pipeline (preserving the null-delimited xargs hardening that lets `extract-metadata.py` run in batch mode):

```bash
bash scripts/discover-sessions.sh <repo> <days> | tr '\n' '\0' | xargs -0 python3 scripts/extract-metadata.py --cwd-filter <repo>
```

For an explicitly cross-repository question, discover every project and omit the cwd filter:

```bash
bash scripts/discover-sessions.sh --all-repos <days> | tr '\n' '\0' | xargs -0 python3 scripts/extract-metadata.py
```

Each output line is a JSON object describing a session (platform, file, size, ts, session, plus platform-specific fields). The final `_meta` line carries `files_processed` and `parse_errors`.

If the inventory's `_meta` line shows `files_processed: 0`, record that the
file-backed inventory is empty and continue to OpenCode and Hermes.

If `parse_errors > 0`, note that some sessions could not be parsed and proceed with what was returned.

To narrow the file-backed platform set, add `--platform claude`, `--platform codex`, or `--platform cursor` to the `discover-sessions.sh` invocation. Default to all three.

OpenCode keeps current sessions in SQLite. Inventory it separately with the
read-only adapter; omit `--cwd-filter` only in explicit global mode:

```bash
python3 scripts/opencode-sessions.py inventory --days <days> --cwd-filter <repo-root>
```

Add `--keyword K1,K2,...` to rank candidates. The adapter searches only
user/assistant text, excludes empty generated sessions, and returns
`parent_session` so descendants can be grouped under their root before
counting. Store the inventory under `$SCRATCH`; do not print its dialogue into
model context.

Hermes keeps current sessions in SQLite rather than per-session JSONL files.
Inventory it separately with a redacted prompt-only export. Keep the current
repo filter by default; omit `--cwd` only in explicit global mode:

```bash
hermes sessions export --cwd <repo-root> --only user-prompts --format jsonl --redact --yes "$SCRATCH/hermes-prompts.jsonl"
```

Use `created_at` to identify session IDs with at least one prompt in the
requested window, so sessions that started earlier but remained active are
included. Rank those sessions using all of their prompt records, including
older prompts that establish the topic. Do not print the prompt inventory into
model context. Export only selected sessions, then pass each export through the
skeleton extractor:

```bash
hermes sessions export --session-id <session-id> --format jsonl --redact --yes "$SCRATCH/<session-id>.hermes.jsonl"
python3 scripts/extract-skeleton.py --output "$SCRATCH/<session-id>.skeleton.txt" < "$SCRATCH/<session-id>.hermes.jsonl"
```

If OpenCode or Hermes is unavailable, report that coverage gap and continue
with the available stores.

Return "no relevant prior sessions" only when the file-backed, OpenCode, and
Hermes inventories contain no relevant sessions.

### Step 3 — Filter and rank

Pick the sessions worth deep-diving under three constraints: take at most
**5 root sessions total across all platforms**, exclude the current session (its
history is already available to the caller), and prefer relevance — current-
branch matches first, then keyword relevance and recency within the scan
window. To keyword-filter, derive a few keywords from the question's topic and
re-invoke the discovery pipeline with `--keyword K1,K2,...` appended to the
`extract-metadata.py` invocation; it returns matching sessions with
`match_count` and per-keyword counts. Return "no relevant prior sessions" and
stop only when none of the inventories has a relevant candidate. Group child
sessions under their root before applying the cap and deduplicate the same
signal within one lineage.

**Note: `gitBranch` is captured at the first user message only.** A session
that began on `main` and did substantive work on a feature branch via
mid-session `git checkout` records `branch: "main"`. Branch-match returning
nothing is not conclusive evidence — fall back to keyword filtering before
concluding nothing is relevant.

### Step 4 — Extract per-session content (file-mediated)

Reuse `$SCRATCH` from Step 2 (create it now if a caller provided
already-filtered candidates and inventory was skipped). For each selected
session, run the skeleton extractor with `--output` so content writes directly
to the scratch file — extraction bytes never round-trip through the
orchestrator's tool results:

```bash
python3 scripts/extract-skeleton.py --output "$SCRATCH/<session-id>.skeleton.txt" < <session-file>
```

Stdout receives only a one-line JSON status (`{"_meta": true, "wrote": "...", "bytes": N, ...}`). Capture `bytes` and `parse_errors` from each status line.

**Conditional errors-mode** — for sessions where investigation dead-ends are likely valuable:

```bash
python3 scripts/extract-errors.py --output "$SCRATCH/<session-id>.errors.txt" < <session-file>
```

Use selectively — only when understanding what went wrong adds value. Cursor agent transcripts don't log tool results, so errors-mode produces nothing for Cursor sessions.

For each selected OpenCode session, pipe the safe normalized export directly
into the skeleton extractor. This excludes reasoning, patches, file content,
and raw tool inputs/outputs:

```bash
python3 scripts/opencode-sessions.py export <session-id> \
  | python3 scripts/extract-skeleton.py --output "$SCRATCH/<session-id>.skeleton.txt"
```

OpenCode error extraction is unavailable. Report that gap when errors-mode is
material to the question.

### Step 5 — Dispatch synthesis subagent

Dispatch a fresh, read-only synthesis sub-agent using the platform's native delegation tool, with a prompt telling it to read `references/session-historian.md` — expanded to an absolute path by the parent — and follow it. Do not override the sub-agent's permission mode. Run on the mid-tier model where the platform supports model selection — the synthesizer doesn't need frontier reasoning.

If sub-agents are unavailable, read the persona and perform synthesis inline.

The dispatch prompt passes the fields the persona's input contract documents:
`problem_topic` (one sentence naming the concrete question), `scratch_dir`,
one entry per extracted root session (skeleton `path`, optional `errors_path`,
`platform`, root/parent identity, `branch`/`cwd`, timestamps, match counts), a filter rule to
surface only findings relevant to the topic, and `output_schema`. Default
schema (a caller-supplied schema passes through verbatim):

```
Structure your response with these sections (omit any with no findings):
- What was tried before
- What didn't work
- Key decisions
- Related context
```

The agent reads each path via the platform's native file-read tool and returns prose findings. Bulk extraction content lives only in the agent's subagent context — the orchestrator's working state stays at file paths plus small inventory metadata.

### Step 6 — Return findings

Return the synthesizer's output text to the caller verbatim. If no candidates
remain after filtering, return the literal string
`no relevant prior sessions` instead. Optionally `rm -rf "$SCRATCH"` — the OS
cleans up eventually regardless.

## Output

When the caller (typically a user typing `/ce-sessions`, or another skill invoking ce-sessions via the platform's skill-invocation primitive) does not specify an output format, include a brief header noting what was searched:

```
**Sessions searched**: [count] ([N] Claude Code, [N] Codex, [N] Cursor, [N] OpenCode, [N] Hermes) | [date range]
```

Then the synthesizer's prose findings. When the caller supplies a schema, honor it verbatim and omit the default header.

## Time budget

Stop as soon as a complete answer is available. A confident "no relevant prior sessions" within seconds is a complete answer; do not extend the search to fill time. The structural caps in Step 3 (max 5 sessions deep-dived) and Step 4 (conditional errors extraction) bound runtime by construction.

## Error handling

If the discovery pipeline fails (e.g., unreadable home directory, permission failure), surface the error to the caller. Do not substitute git log, file listings, or other sources — this skill's contract is session metadata and synthesis.

If extraction `--output` write fails (disk full, permission), surface a clear error and do not dispatch the synthesizer with partial paths.

If `_meta` reports `parse_errors > 0` from any script, note partial extraction in the dispatch prompt and proceed; the synthesizer flags partial in findings.
