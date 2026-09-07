---
name: orca-multi-review
description: Run a repository's existing cross-provider multi-model review through visible Orca-managed Claude, Codex, and OpenCode terminals. Use when the user asks for orca-multi-review, an Orca-based multi-model review, or wants to watch the repository review agents and progress instead of launching hidden coding CLIs.
---

# Orca Multi Review

Act only as the Orca transport and coordinator for the repository's review
system. Reuse its skills, prompts, schemas, scope rules, tiers, and synthesis
contract. Do not copy or replace them.

## Load The Repository Contract

From the repository root, require and read:

- `.claude/skills/tp-multi-review/SKILL.md`
- `.claude/review/README.md`
- `.claude/review/prompts/contract.md`
- the prompt and schema files used by the selected tier

The repository contract wins on review scope, tier topology, prompts, schemas,
model chain, voting, severity, and output. This skill overrides only how model
workers are launched and observed. Never run the repository skill's headless
model command.

## Plan The Review

1. Run `orca status --json` and `orca worktree current --json`. Stop if the
   current checkout is not an Orca-managed worktree.
2. Run `python3 .claude/review/review.py --plan` to reuse the repository's
   deterministic scope, risk, model, and automatic-tier selection without
   calling a model. Never run `review.py` without `--plan`.
3. Translate every model call in the selected repository tier into an explicit
   Orca task. Preserve the provider, prompt, schema, independence, and
   dependencies of every stage. Pin Claude primaries to Fable at `high` effort
   and Codex primaries to GPT-5.6 Sol at `high` effort.
4. Add one independent OpenCode whole-changeset finder using the selected tier's
   applicable review lenses. Its candidates enter the same repository
   deduplication, refutation, arbitration, and distillation pipeline; do not add
   OpenCode voters or arbiters.
5. Create one parent task for the review and child tasks with concise titles and
   display names such as `Find · Claude · Correctness`.

## Launch Visible Workers

Run every reviewer in a fresh pane in the active worktree so it sees staged,
unstaged, and untracked changes. Do not create child worktrees or reuse a pane
for independent votes. Capture the coordinator handle with `orca terminal show
--json`; lifecycle messages arrive there, not on worker handles.

Keep the coordinating agent in the left half of its current terminal tab. Put
each active wave in a right-hand column by splitting the coordinator pane
vertically once, then splitting only right-hand panes horizontally. Capture each
command's `.result.split.handle`; use those handles for later splits, renames,
waits, orchestration dispatches, and cleanup.
Orca's `vertical` split creates left/right panes; `horizontal` creates top/bottom.

Create the Claude pane first through the user's permission-free alias. Omitting
`--terminal` targets the coordinating agent's current pane:

```bash
orca terminal split --direction vertical \
  --command "zsh -ic 'ccc --model fable --effort high'" --json
```

Split the returned Claude pane horizontally to add Codex below it:

```bash
orca terminal split --terminal <claude handle> --direction horizontal \
  --command "zsh -ic 'cdx -m gpt-5.6-sol -c model_reasoning_effort=high'" --json
```

Split the returned Codex pane horizontally to add the OpenCode finder below it.
Run the foreground TUI, not `opencode run`, so the pane remains visible and ready
for task injection:

```bash
orca terminal split --terminal <codex handle> --direction horizontal \
  --command "opencode --model opencode-go/glm-5.2 --auto" --json
```

Rename each returned handle to its task title with `orca terminal rename`. This
produces one inspectable review tab with the coordinator on the left and the
three initial workers stacked on the right. Orca's CLI does not expose pane
ratios or resizing, so do not claim the three worker panes have equal heights;
the user can drag the dividers if needed.

When a stage needs more workers than fit usefully in the right-hand column, run
ready tasks in visible waves. Close a completed wave after capturing its
artifacts, then split the coordinator pane again to create fresh right-hand panes
for the next wave or stage. Never launch review workers as background processes
or background tabs.

OpenCode's `--auto` is its permission-bypass mode. Do not replace `ccc` with
`claude` or `cdx` with `codex`; those aliases carry the user's approval settings.
Use the repository's fallback models at the same effort only after a primary
worker fails. After OpenCode reaches `tui-idle`, dispatch its exact repository
review prompt with `orca orchestration dispatch --inject`, just like Claude and
Codex. If Orca rejects injection because it does not recognize OpenCode, confirm
the pane still shows the foreground OpenCode TUI, dispatch with
`--return-preamble` and no `--inject`, then send that returned preamble to the
same pane with `orca terminal send --enter`. Never send into a shell prompt.

For each worker:

1. Wait for `tui-idle`, then inspect `orca terminal show --json`. A worker is
   ready only when its agent prompt is idle and MCP startup is finished. If an
   unrelated MCP startup stalls, interrupt it before dispatch and wait for idle
   again.
2. Create its orchestration task with the exact repository prompt path, scope,
   stage input, output schema, and a review-only instruction. Once dependencies
   complete, explicitly mark the task `ready` before dispatch.
3. Tell the worker to write its exact schema-shaped result to
   `/tmp/orca-review-<task-id>.json`, validate that it parses, and include the
   path as `reportPath` in `worker_done`.
4. Dispatch with `orca orchestration dispatch --inject` and require the final
   response to contain only the same schema-shaped result. The injected preamble
   still owns the `worker_done` lifecycle message.
5. Wait on the coordinator handle with `orca orchestration check --terminal
   <coordinator handle> --wait --types worker_done,escalation,decision_gate
   --timeout-ms <n>`. A timeout is a liveness checkpoint, not failure.
6. Read and validate `reportPath` against the stage schema. The artifact, not
   terminal scrollback or the lifecycle summary, is the stage output.
7. After capturing valid output, close the pane with `orca terminal close
   --terminal <worker handle> --json`. On failure, capture the terminal tail and
   any artifact first, then close the pane before retrying in a fresh right-hand
   pane.

## Preserve The Pipeline

Dispatch ready tasks in parallel and later stages only after their inputs are
complete. Follow the selected tier topology in the repository README exactly.

- Finder tasks receive the shared contract, their pass or full-review prompt,
  changed files, diff, and applicable repository instructions.
- Refuters receive the repository refute prompt, full candidate set, changed
  files, and diff. Keep the threshold based on planned voters.
- Arbiters receive the repository arbitrate prompt, survivors, changed files,
  and diff. Preserve the repository's cross-provider keep and severity rules.
- The distiller receives only confirmed findings and the repository distill
  prompt.

Treat missing, malformed, or failed output as a failed worker, never as review
evidence. Retry once in a fresh right-hand pane at the same model, then follow
the repository provider fallback chain in another fresh right-hand pane. Report
degraded coverage if the chain fails.

## Finish

Return the selected tier, coverage, degraded workers, verdict, summary, and
findings using the repository skill's output contract. Do not post GitHub
comments unless the user explicitly asks. Every worker pane should already be
closed; leave the coordinator pane open and do not reset runtime-global
orchestration state.
