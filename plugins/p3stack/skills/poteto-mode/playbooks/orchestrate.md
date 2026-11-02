### Orchestrate

Read the installed plugin's [RUNTIME.md](../../../RUNTIME.md) first. Its native tool, model, path, and session-authorization rules apply. The user merges; this port never merges, enables auto-merge, or enters a merge queue.

**You run the program, never the code. Decide which agent does each piece of work, then check what each one produces.** For a standing project handed to one coordinator chat: multi-day, many stacked PRs, dozens to hundreds of subagents, few human turns. One task driven to a predicate is Autonomous run. One ambitious run that needs a bespoke workflow is figure-it-out. Work that one agent could finish inside the session's budget is not a program.

Run it with the tools in RUNTIME.md. Spawn workers with `delegate_task`. Launch an owner that holds a branch or a PR with `t3_thread_launch` and a worktree workspace strategy. Keep the program's notes under `.ai/orchestrate/<project-slug>/` in the consuming repository. Watch each PR with `watch_pull_request`, and record it with `link_pull_request`. Call no bookkeeping scripts, run no polling loops, and never relay messages or status between agents.

#### Topology

- **One owner per PR.** The owner is the only writer of its branch and carries the PR from build to merge-ready. Only the owner pushes, rebases, or retargets it. Closing or retargeting a base PR orphans every PR above it, so the owner does that only on your call. You never author or edit code. Conflicted merges, chain rebases, and fixes go to owners. The user merges.
- **A fresh worker for each independent task.** Its kickoff carries everything it needs, including each upstream report it depends on, pasted in full. Workers can't see their siblings. Run workers as local native subagents, each in its own worktree. Do not claim VM isolation. Browser, CLI, transcript, simulator, and local-auth checks run on this machine. Resolve workers through the `swarm workers` role. Pick each subagent's reasoning level for the job, per the Subagents section of `$poteto-mode`.
- **A sub-coordinator only when one area has many parallel workers.** It owns that area's workers and kickoffs and sends you one rollup, never raw worker reports. Spawn one only when the current tool permits nested delegation. Stop at three levels: you, sub-coordinators, and workers. Keep about ten workers in flight per coordinator, and start the next one as each finishes instead of waiting on a whole batch.
- **Fork when new work needs a worker's built state,** such as its checkout, uncommitted changes, or a running process. Give that work a new `delegate_task` that includes the prior findings, or launch from a committed base. Message a worker only for a follow-up on the same work. Never message one to check on it, because a message restarts an idle agent. Do not use `t3_thread_send` on a child thread.
- **Each PR gets a verifier that is not its author.** Pick the verifier from `arena cross-judge pool` with a provider different from the owner's, per RUNTIME.md. The owner reports merge-ready only on that verifier's pass at the current head. The user merges.
- **Start with one unit.** Take it through kickoff, owner, verifier, and a merge-ready handoff before you fan out, so a flaw in the kickoff costs one agent instead of fifty. On near-identical cheap units, the first unit is that test.

#### Supervision

- **Each kickoff names the evidence that proves the work is done,** such as a command and its expected output, a control-skill check, or an artifact. It also names the goal, the paths the worker may and may not write, and the actions it must not take. If you can't name the evidence, the unit isn't scoped yet.
- **Read the diff or the artifact, not only the worker's summary.** Green CI is an input to a verdict, not a verdict. Behavioral work needs more than a type check. A verdict covers one head SHA, so a new push needs a new verdict. Read a sample of each sub-coordinator's kickoffs while its workers run, and fix its instructions when one fails.
- **Send back work that drifts from scope or grows past what was asked.** Keep only the fixes that block the program, and park the rest as follow-ups.
- **Check a PR's live state before you report on it,** with `gh pr view` and `gh pr checks` or the resolved forge's equivalents, not the worker's last report. Account for every worker you spawned as done, replaced, or absorbed into another worker's scope.
- **Stop or replace a worker that stalls or loops.** Judge it by its pushes and PR activity, not its status text. Retry by cause: a smaller scope after a context or memory limit, the same kickoff after a dropped connection, and a different model after a tool error. After two retries, drop the unit and replan around it. When a stopped worker returns late, check its result against the PR's current state, and hand any unique findings to a fresh worker.
- **Ask the user only for a real decision or a blocker,** such as an irreversible action, a product or preference call that no experiment settles, or a dead end that survived a replan. Rebase mechanics, retries, CI flakes, review triage, and "should I keep going" never reach the user.

**Reply:** what is merge-ready against the goal, each PR's live state and verdict with its link, what was dropped and why, and the decisions waiting on the user.
