# Full Mode

Read this reference when Mode Detection (in SKILL.md) routes to **Full Mode** — no argument given, or a PR number was provided. Full mode processes all unresolved threads on the PR.

Use the platform's native delegation tool and keep the user's permission
settings. If delegation is unavailable, apply the resolver persona inline.

## 1. Fetch Unresolved Threads

If no PR number was provided, detect from the current branch:
```bash
gh pr view --json number -q .number
```

Then fetch all feedback using the GraphQL script at [scripts/get-pr-comments](../scripts/get-pr-comments):

```bash
bash scripts/get-pr-comments PR_NUMBER
```

Returns a JSON object with three keys:

| Key | Contents | Has file/line? | Resolvable? |
|-----|----------|---------------|-------------|
| `review_threads` | Unresolved inline code review threads (includes outdated; each carries its `isOutdated` flag so the resolver can account for line drift) | Yes | Yes (GraphQL) |
| `pr_comments` | Top-level PR conversation comments (excludes PR author) | No | No |
| `review_bodies` | Review submission bodies with non-empty text (excludes PR author) | No | No |

If the script fails, fall back to:
```bash
gh pr view PR_NUMBER --json reviews,comments
gh api repos/{owner}/{repo}/pulls/PR_NUMBER/comments
```

## 2. Triage: Separate New from Pending

Before processing, classify each piece of feedback as **new** or **already handled**.

If the caller supplied an approved feedback allowlist, filter to those IDs or
URLs first. Ignore all other feedback for this run, including newly arrived
threads. The allowlist is the user's accepted implementation scope.

**Review threads**: Read the thread's comments. If there's a substantive reply that acknowledges the concern but defers action (e.g., "need to align on this", "going to think through this", or a reply that presents options without resolving), it's a **pending decision** -- don't re-process. If there's only the original reviewer comment(s) with no substantive response, it's **new**.

**PR comments and review bodies**: These have no resolve mechanism, so they reappear on every run. Apply two filters in order:

1. **Actionability**: Skip items that contain no actionable feedback or questions to answer. Examples: review wrapper text ("Here are some automated review suggestions..."), approvals ("this looks great!"), status badges ("Validated"), CI summaries with no follow-up asks. If there's nothing to fix, answer, or decide, it's not actionable -- drop it from the count entirely.
2. **Already replied**: For actionable items, check the PR conversation for an existing reply that quotes and addresses the feedback. If a reply already exists, skip. If not, it's new.

The distinction is about content, not who posted what. A deferral from a teammate, a previous skill run, or a manual reply all count. Similarly, actionability is about content -- bot feedback that requests a specific code change is actionable; a bot's boilerplate header wrapping those requests is not.

**Silent drop.** Non-actionable items are dropped without narration. Do not announce, list, or count dropped items in conversation, the task list, or the step 9 summary. Review-bot wrappers from CodeRabbit, Codex, Gemini Code Assist, and Copilot (bodies like "Here are some automated review suggestions...") commonly appear here -- recognize them by their boilerplate content, drop silently. Only CI/status bot summaries (Codecov) are pre-filtered at the script level; everything else relies on this content-aware check so bot format changes cannot silently hide actionable findings.

If there are no new items across all feedback types, skip steps 3-8 and go straight to step 9.

## 3. Plan

Create a task list of all **new** unresolved items (e.g., `TaskCreate` in Claude Code, `update_plan` in Codex) -- one entry per thread or comment to resolve.

## 4. Implement (PARALLEL)

Process all three feedback types. Review threads are the primary type; PR comments and review bodies are secondary but should not be ignored.

### Dispatch

**For review threads** (`review_threads`): Spawn a fresh resolver sub-agent for each new thread, with a prompt telling it to read the `pr-comment-resolver.md` persona (in this skill's `references/` directory — expand to an absolute path from the installed skill directory) and follow it.

Each agent receives:
- The thread ID
- The file path and location fields: `line`, `originalLine`, `startLine`, `originalStartLine` (any can be null; outdated and file-level threads often have `line == null` and must fall back to `originalLine`)
- The full comment text (all comments in the thread)
- The PR number (for context)
- The feedback type (`review_thread`)
- The `isOutdated` flag from the thread node (tells the agent the reported line may have drifted)
- The runtime-provided harness and model identity for the visible bot footer

**For PR comments and review bodies** (`pr_comments`, `review_bodies`): These lack file/line context. Spawn a fresh resolver sub-agent (same `pr-comment-resolver.md` persona, absolute path) for each actionable item. The agent receives the comment ID, body text, PR number, and feedback type (`pr_comment` or `review_body`). The agent must identify the relevant files from the comment text and the PR diff.

Before posting any returned `reply_text`, verify that it ends with the bot
identity footer required by `SKILL.md`. Append the footer if the resolver did
not include it.

### Agent return format

Each agent returns a short summary:
- **verdict**: `fixed`, `fixed-differently`, `replied`, `not-addressing`, `declined`, or `needs-human`
- **feedback_id**: the thread ID or comment ID it handled
- **feedback_type**: `review_thread`, `pr_comment`, or `review_body`
- **reply_text**: the markdown reply to post (quoting the relevant part of the original feedback)
- **files_changed**: list of files modified (empty if replied/not-addressing)
- **reason**: brief explanation of what was done or why it was skipped

Verdict meanings:
- `fixed` -- code change made as requested
- `fixed-differently` -- code change made, but with a better approach than suggested
- `replied` -- no code change needed; answered a question, explained a design decision, or judged a correct point not worth a change
- `not-addressing` -- feedback is factually wrong about the code; skip with evidence
- `declined` -- observation may be valid, but implementing the suggested fix would actively make the code worse; reply cites the specific harm
- `needs-human` -- cannot determine the right action; needs user decision

### Batching and conflict avoidance

**Batching**: If there are 1-4 items total, dispatch all in parallel. For 5+ items, batch in groups of 4.

**Conflict avoidance**: No two agents that touch the same file should run in parallel. Before dispatching, check for file overlaps across items. If two items reference the same file, serialize them -- dispatch one, wait for it to complete, then dispatch the next. Non-overlapping items run in parallel. When one agent handles multiple threads on the same file, it addresses them sequentially.

**Sequential fallback**: Platforms that do not support parallel dispatch should run agents sequentially.

Fixes can occasionally expand beyond their referenced file (e.g., renaming a method updates callers elsewhere). This is rare but can cause parallel agents to collide. Step 5 (combined validation) catches test breakage; step 8 (verify) catches unresolved threads. If either surfaces inconsistent changes from parallel fixes, re-run the affected agents sequentially.

## 5. Validate Combined State

After all agents complete, aggregate `files_changed` across every returned summary. If it's empty -- all verdicts are `replied`, `not-addressing`, `declined`, or `needs-human` -- skip steps 5 and 6 entirely and proceed to step 7.

Resolvers run only targeted tests on their own changes. This step runs the project's full validation **once** against the combined diff to catch cross-agent interactions that targeted runs can't see.

1. **Run the project's validation command** (test suite, type check, or whatever the repo's AGENTS.md/CLAUDE.md specifies). Run once, not per-agent.

2. **Green** -> proceed to step 6.

3. **Red, failures touch files resolvers changed** -> one inline diagnose-and-fix pass. Re-run validation. If still red, escalate with a `needs-human` item containing the test output; do **not** commit.

4. **Red, failures touch only files no resolver changed** -> treat as pre-existing. Proceed to step 6, but add a footer to the commit message: `Note: pre-existing failure in <test> not addressed by this PR.`

Record the validation outcome (command run, pass/fail counts, any pre-existing failures noted) for the step 9 summary.

## 6. Commit and Push

1. Stage only files reported by sub-agents and commit with a Conventional
   Commit message referencing the PR:

```bash
git add [files from agent summaries]
git commit -m "fix(pr-feedback): address review feedback

PR: #PR_NUMBER

- [list changes from agent summaries]"
```

2. Push to remote:
```bash
git push
```

## 7. Reply and Resolve

After the push succeeds, post replies and resolve where applicable. The mechanism depends on the feedback type.

For every inline reply, retain the returned comment ID plus its associated
`pullRequestReview` ID and state. The reply helper returns these fields so step
8 can prove which pending review owns the reply.

### Reply format

All replies should quote the relevant part of the original feedback for continuity. Quote the specific sentence or passage being addressed, not the entire comment if it's long.

For fixed items:
```markdown
> [quoted relevant part of original feedback]

Addressed: [brief description of the fix]
```

For items not addressed:
```markdown
> [quoted relevant part of original feedback]

Not addressing: [reason with evidence, e.g., "null check already exists at line 85"]
```

For declined items:
```markdown
> [quoted relevant part of original feedback]

Declined: [specific harm cited, e.g., "this would add a defensive null check the type system already guarantees" or "violates the no-premature-abstraction guidance in CLAUDE.md"]
```

For `needs-human` verdicts, post the reply but do NOT resolve the thread. Leave it open for human input.

### Review threads

1. **Reply** using [scripts/reply-to-pr-thread](../scripts/reply-to-pr-thread):
```bash
echo "REPLY_TEXT" | bash scripts/reply-to-pr-thread THREAD_ID
```

2. **Resolve** using [scripts/resolve-pr-thread](../scripts/resolve-pr-thread):
```bash
bash scripts/resolve-pr-thread THREAD_ID
```

### PR comments and review bodies

These cannot be resolved via GitHub's API. Reply with a top-level PR comment referencing the original:

```bash
gh pr comment PR_NUMBER --body "REPLY_TEXT"
```

Include enough quoted context in the reply so the reader can follow which comment is being addressed without scrolling.

## 8. Verify

Re-fetch feedback to confirm resolution:

```bash
bash scripts/get-pr-comments PR_NUMBER
```

In full mode, the `review_threads` array should be empty except for
`needs-human` items. Approved-subset mode is checked against its allowlist
below.

For each unique `PENDING` review ID returned by the reply mutations, query that
review's comment IDs. Submit it only when every comment in the review is one of
the exact reply comment IDs created by this run and the comment connection was
fully inspected. This prevents publishing unrelated draft review comments.

Submit each proven review as comment-only so its thread replies become visible:

```bash
gh api -X POST repos/{owner}/{repo}/pulls/PR_NUMBER/reviews/REVIEW_ID/events \
  -f event=COMMENT
```

If a returned review contains any other comment, or its full comment set cannot
be inspected, leave it pending and surface it as `needs-human`. Re-fetch the
exact returned review IDs until none of the proven reviews remain pending before
reporting success.

In approved-subset mode, verify only the allowlisted feedback. Other unresolved
threads are outside this run and must not trigger another fix cycle or count as
a failure. In full mode, the `review_threads` array should be empty except for
`needs-human` items.

**If in-scope threads remain**, check the iteration count for this run:

- **First or second fix-verify cycle**: Repeat from step 2 for the remaining threads.

- **After the second fix-verify cycle** (3rd pass would begin): Stop looping. Surface remaining issues to the user with context about the recurring pattern: "Multiple rounds of feedback on [area/theme] suggest a deeper issue. Here's what we've fixed so far and what keeps appearing." Use the same `needs-human` escalation pattern -- leave threads open and present the pattern for the user to decide.

PR comments and review bodies have no resolve mechanism, so they will still appear in the output. Verify they were replied to by checking the PR conversation.

## 9. Summary

Present a concise summary of all work done. Group by verdict, one line per item describing *what was done* not just *where*. This is the primary output the user sees.

Format:

```
Resolved N of M new items on PR #NUMBER:

Fixed (count): [brief description of each fix]
Fixed differently (count): [what was changed and why the approach differed]
Replied (count): [what questions were answered]
Not addressing (count): [what was skipped and why]
Declined (count): [what was declined and the harm cited]

Validation: [one line -- e.g., "bun test passed (893/893)" or "bun test passed with pre-existing failure in X noted"; omit when no code changes were committed]
```

If any agent returned `needs-human`, append a decisions section. These are rare but high-signal. Each `needs-human` agent returns a `decision_context` field with a structured analysis: what the reviewer said, what the agent investigated, why it needs a decision, concrete options with tradeoffs, and the agent's lean if it has one.

Present the `decision_context` directly -- it's already structured for the user to read and decide quickly:

```
Needs your input (count):

1. [decision_context from the agent -- includes quoted feedback,
   investigation findings, why it needs a decision, options with
   tradeoffs, and the agent's recommendation if any]
```

The `needs-human` threads already have a natural-sounding acknowledgment reply posted and remain open on the PR.

If there are **pending decisions from a previous run** (threads detected in step 2 as already responded to but still unresolved), surface them after the new work:

```
Still pending from a previous run (count):

1. [Thread path:line] -- [brief description of what's pending]
   Previous reply: [link to the existing reply]
   [Re-present the decision options if the original context is available,
   or summarize what was asked]
```

If a blocking question tool is available, use it to ask about all pending decisions (both new `needs-human` and previous-run pending) together. If there are only pending decisions and no new work was done, the summary is just the pending items.

Use the platform's blocking question tool (fall back to a question in chat when the tool is unavailable). Use it to present the decisions and wait for the user's response. After they decide, process the remaining items: fix the code, compose the reply, post it, and resolve the thread.

If the user doesn't respond, the items remain open on the PR for later handling.
