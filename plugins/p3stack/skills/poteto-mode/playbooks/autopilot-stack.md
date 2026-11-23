### Autopilot-stack

Read the installed plugin's [RUNTIME.md](../../../RUNTIME.md) first. Its native tool, model, path, and session-authorization rules apply. The user merges; this port never merges, enables auto-merge, or enters a merge queue.

Run the Autopilot-full playbook, but do not merge.

1. **In place of step 5's handoff, stop at verified.** Run that step's checks against the branch the PR would land on. The branch is trunk, or the parent PR's branch when this PR is stacked. Then stop and hand the PRs to the operator. Do not merge. After the handoff, nobody pushes without the operator's go. Every loop tick prompt names this file, so each tick sees the no-merge rule.
2. **Stack a PR only when it builds on another PR.** This is the one exception to step 3. Base the PR on the other PR's branch in place of trunk, per `playbooks/opening-a-pr.md`. In place of step 2's rebase onto trunk, each PR rebases onto its parent PR's branch, and the stack root rebases onto trunk. A new head on the lower PR restacks the PRs above it, and a PR whose `git patch-id` the restack leaves unchanged keeps its verdict.

**Reply:** list each PR with its verdict, in place of what is ready for the user to merge.
