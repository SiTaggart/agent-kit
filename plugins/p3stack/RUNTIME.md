# P3Stack runtime

P3Stack is the PStack port for T3 Code. The coordinator runs in a Claude Code or
Codex thread inside T3 Code. Delegates run on any provider that T3 exposes.

Read this file in full before a P3Stack workflow. It overrides upstream host
assumptions. User, system, developer, and repository instructions keep priority.
The skills say "PStack". In this plugin, that name means P3Stack.

## Scope and permissions

- Installation does not activate Poteto Mode. Enter it only when the user asks.
  Honor the user's opt-out. Do not write always-on rules or global settings.
- A workflow does not give authorization. Stay inside the user's task. Messages,
  comments, tickets, commits, pushes, publishing, and deploys need authorization
  in the session. Reuse authorization that the user already gave.
- Never merge, enable auto-merge, or use a merge queue. Upstream "ship", "land",
  and "full autopilot" steps end at verified work that the user merges. Report
  merge-ready and merged as different states.
- Preserve user edits and worktrees. Age, cleanliness, branch status, and audit
  buckets do not authorize deletion. Cleanup needs authorization for each path.
- Do not edit an installed plugin cache to keep a lesson. Edit the source when
  the user authorizes it.

## Required tools

P3Stack needs the T3 Code MCP server. Tool names can have a host prefix, such as
`mcp__t3-code__delegate_task` or `t3-code__delegate_task`. The meaning is the same.
If the tools do not show in the first tool scan, call `orchestrator_capabilities`
once by its known name before you decide that they are missing.

If that call fails and `T3_ACP_MCP_NODE` is set, call the same T3 tools through
T3's supported terminal transport:
`ELECTRON_RUN_AS_NODE=1 "$T3_ACP_MCP_NODE" ${T3_ACP_MCP_ENTRYPOINT:+"$T3_ACP_MCP_ENTRYPOINT"} acp-mcp-call <tool> '<json arguments>'`.
If both paths fail, do not use another provider's SDK or CLI. Use the host's
native subagents, or do the passes in series. Tell the user that the result has
no cross-provider independence.

## Skills and references

The plugin root is the folder that contains this file. Resolve every named skill
from the plugin root first. A skill or principle name, such as `how` or
`principle-fix-root-causes`, means `<plugin root>/skills/<name>/SKILL.md`. Resolve
`references/`, `scripts/`, and `playbooks/` from the folder of that skill.
Resolve a relative link from the folder of the file that contains it. Use the
installed absolute path. Do not use a path from the consuming repository. These
rules apply to delegates too, so a delegate that has no P3Stack skills installed
can still read every skill, principle, and reference by path.
`$skill-name` examples are Codex calls. In Claude Code, use `/p3stack:skill-name`.
`$setup-pstack` means this plugin's `setup-pstack` skill.

A delegate gets only its brief. It does not get the parent conversation, and its
provider can have no P3Stack skills installed. Thus every brief must give:

- the task, the scope, and the done condition;
- the context that the delegate needs, as file pointers, not bulk text;
- the absolute path of this file, and the absolute path of each skill, persona,
  or reference file that the delegate must read;
- the paths that the delegate can write, or "read-only";
- the report that you expect back.

Personas are prompt files, not agent types. For poteto-agent, give the absolute
path of `references/agents/poteto-agent.md`. For Comment Sicko, give
`references/agents/comment-sicko.md`. Comment Sicko can edit comments in its
scoped files. It cannot edit application code. How, why, and reflect reviewers
get read-only briefs.

## Tool map

| Upstream mechanism | T3 Code mechanism |
|---|---|
| Task subagent, `spawn_agent`, `Agent` | `delegate_task` with the resolved role as `target` |
| Background subagent, poll, wait | `mode: "async"`. End the turn. T3 wakes this thread when the child finishes. Use `task_status` only when this turn needs the result. |
| Stop a subagent | `task_cancel` |
| Resume or follow-up round | A new `delegate_task` call with the original brief, prior findings, responses, and open objections. Do not use `t3_thread_send` on a `childThreadId`. |
| Cloud agent, own branch, own worktree | `t3_thread_launch` with `workspaceStrategy` |
| `/loop`, poll loops, CI watchers | `watch_pull_request`. End the turn. T3 wakes this thread on checks, comments, or conflicts. |
| Recurring run, heartbeat | `schedule_task` with a structured `schedule` object |
| PR and stack bookkeeping | `link_pull_request` for every PR and every stack layer. `list_thread_pull_requests` to read them back. |
| Transcript mining, session history | `t3_thread_search`, `t3_thread_list`, `t3_thread_read` |
| Questions in another thread | `t3_pending_request_list`, `t3_pending_request_read`, `t3_pending_request_respond` |
| `control-ui`, browser proof | `preview_*` tools. Use `preview_recording_start` and `preview_recording_stop` for video evidence. |
| Simulator proof | `device_*` tools |

Ask the user with the host's question tool. Plain chat is the fallback.

## Delegation rules

- **Async fan-out.** Start all members of a panel in the same turn with
  `mode: "async"`. Then end the turn. Use `mode: "wait"` only when the next step
  needs one result and nothing else can run.
- **One request ID per seat and round.** Set `clientRequestId` to a stable value,
  such as `<workflow>-<role>-<seat>-r<round>`. Use the same value when you retry
  that call. Set `title` to the role and the seat. Set `role` to the closest of
  `implementation`, `research`, `review`, `design`, `test`, or `general`.
- **Depth.** Only the coordinator delegates. Delegates have the T3 tools too, so
  every brief must say: "Do not call `delegate_task`, `t3_thread_launch`, or
  `create_threads`." A brief can permit nested delegation only when the workflow
  names a sub-coordinator. Then the brief must give a fan-out limit.
- **Panels belong to the coordinator.** The poteto-agent persona can tell a
  delegate to run a skill that starts a panel, such as `how`, `architect`, or
  `interrogate`. A delegate without permission to delegate does not run that
  panel. It stops at that step and reports which skill it needs and why. The
  coordinator runs the panel and then gives the result to a fresh delegate.
- **Permissions.** Leave `runtimeMode` and `interactionMode` to inherit. Do not
  raise permissions to make a workflow run. A runtime mode is not a sandbox.
  Write "read-only" in the brief when the delegate must not write.
- **Writers.** A delegate runs in the coordinator's checkout. Two writers must
  never share a checkout.
  - For parallel writers in one workflow, such as arena candidates or swarm
    slices, give each writer its own worktree. Use
    `git worktree add --detach <unique absolute path> <base ref>`, or `-b` with a
    branch name that is unique to the writer. The brief gives that path, says to
    run every command from it, and says "Do not write under
    `<coordinator checkout>`." The T3 thread binding does not change. This is
    expected.
  - After each writer returns, run `git status --porcelain` in the coordinator
    checkout. A change that the coordinator did not make means that the writer
    failed its brief. Do not use its result until you resolve the change.
  - For long lanes that own a branch or a PR, such as orchestrate and autopilot
    tracks, use `t3_thread_launch`. Commit the base first, because uncommitted
    changes are not copied. Send
    `{"type":"worktree","baseRef":...,"branch":...,"startFromOrigin":false}` as
    `workspaceStrategy`. Send the lane's resolved role as `modelSelection`, with
    `instanceId` set to the role's `providerInstanceId`, plus `model` and
    `options`. Without `modelSelection`, the lane runs on the coordinator's
    model. Put the brief in `message`, and set `title`. Keep the returned
    `threadId`. Follow the lane with `t3_thread_wait` and `t3_thread_read`. Stop
    it with `t3_thread_interrupt`. Check `t3_thread_list` before you retry a
    launch that failed. A launch needs a full-access or default coordinator. If
    the coordinator does not have that, tell the user. Do not raise permissions.
  - Local delegates share this machine. Do not claim VM or credential isolation.
- **Ownership.** You own every delegate's work. Read the diff or the artifact.
  Write your own summary. Agreement between models is evidence. It is not proof.

## Models

Read [models.json](models.json). Then read the optional user overrides in
`~/.agents/p3stack-models.json`. A choice the user makes in the session has the
highest priority. An override replaces the whole bundled value for its role.

1. **Shape.** A choice is a `delegate_task` target:
   `{"providerInstanceId": ..., "model": ..., "options": {...}}`. A panel is a
   non-empty list of choices. `"inherit-parent"` and its synonym `"auto"` mean
   the coordinator's provider and model. Resolve them to an explicit target from
   `inheritedProviderInstanceId` and `inheritedModel` in
   `orchestrator_capabilities`, with effort `high` and the rule 5 budget. Do not omit
   `target`, because an omitted target also copies the coordinator's options.
   The override file can also have a top-level `budget` string.
2. **Roles.** Use the exact 17 role keys in `models.json`. Unnamed code and
   helpers use `feature, refactoring`. Difficult changes use `hardest tasks`.
   Prose, judgment, and Comment Sicko use `judgment and prose`. History and
   source miners use `how explorer`. An unknown role key is an error.
3. **Validate.** Call `orchestrator_capabilities` once per workflow. A choice is
   valid when its provider has `canRunChildTask: true`, the provider lists the
   model, and the model lists each option ID and value. Option IDs differ by
   provider. Claude uses `effort`. Codex and Grok use `reasoningEffort`. Pass
   `options` exactly as written. Do not rename an option or put effort in the
   model ID.
4. **Fallback.** If only an effort value is not supported, step down the ladder
   in rule 5 to the next value that the model lists, and report the change. If
   no value on the ladder is listed, omit the effort option and report it. If
   the provider or model is not available, use `inherit-parent` and report the
   change. Report a malformed override file, use the bundled value for that
   role, and do not change the user's file.
5. **Effort.** The ladder is `xhigh` > `high` > `medium` > `low`. Never send a
   value that is not on the ladder, such as `max`, `ultra`, `ultracode`, or
   `ultrathink`. These values cost too much for this setup. Apply the budget
   when you send a delegate: `large` allows at most `xhigh`, `medium` at most
   `high`, and `small` at most `medium`. `unlimited` or no budget keeps the
   role's effort. A budget never raises effort. When the model lists
   `serviceTier`, send `"default"`. When it lists `fastMode`, send `false`.
6. **Grok.** Every Grok seat uses `grok-4.7-build-fast`, which is Grok's fast
   model. Treat another Grok model in an override as unavailable.
7. **Panels.** Run one delegate for each entry. The list length sets the count.
   For a cross-judge, select one entry from `arena cross-judge pool` whose
   provider is different from the coordinator's provider. If no entry is
   different, run the judge as a separate pass on the first entry, and report
   that it has no provider independence. Report the models that ran, each
   fallback, and any provider that is missing.

Keep the current conversation model as the coordinator. Use `$setup-pstack` to
change role assignments.

## History, scheduling, and artifacts

Use T3 thread tools for history. Search with `t3_thread_search`. Filter to the
project, topic, and time window before you read. Read with `t3_thread_read`, and
use incremental reads for long threads. Keep thread IDs and timestamps in the
evidence. Thread summaries do not prove which tools ran. If no thread matches,
use a labeled digest of the current session. Report that historical evidence is
missing.

T3 Code runs each thread inside a Codex, Claude Code, or Grok Build harness, and
a session started outside T3 is not a T3 thread. To find those sessions for a
workspace, run `scripts/harness-sessions.py --workspace <path>` from the
installed poteto-mode skill. It reads the session stores of all three harnesses
(`$CODEX_HOME`, `$CLAUDE_CONFIG_DIR`, and `$GROK_HOME`, or their `~/.codex`,
`~/.claude`, and `~/.grok` defaults). It returns paths and times, not message
content, and names each store that is missing.

For the worktree audit, run `scripts/worktree-audit.sh <repo>` from the
installed poteto-mode skill. It reads all three harness session stores, whichever
harness runs the coordinator, because delegates and lanes can run in the others.
Then use `t3_worktree_list` and `t3_thread_list` to find the threads that use
each worktree. A worktree without a session or a thread is not proof that it is
unused.

Use `schedule_task` only for a reminder, monitor, or recurring run that the user
asked for. Report the cadence and the next run time. A skill with
`disable-model-invocation` cannot run from a schedule. Do not use a schedule to
avoid that limit. For work in the current turn, use `watch_pull_request`, async
delegates, and bounded waits. Do not make shell sentinels or webhook relays.

`scripts/watch-pr/watch-pr` still gives the readiness verdict for a GitHub PR.
Run it when a playbook needs the verdict. Use `watch_pull_request` to wait for
a change.

Store working artifacts under the consuming project's `.ai/`, unless the user
names a different location. Keep logs and orchestration state outside the
installed plugin. Inspect a bundled helper's requirements before you run it.
The orchestration frontier needs Graphite (`gt`). Do not install it only to run
a helper.

## Skill authoring

Use an installed skill-creator when one is available. Project skills go in
`.claude/skills/` for Claude Code and `.agents/skills/` for Codex. Personal
skills go in `~/.claude/skills/` or `~/.agents/skills/`. Write `name` and
`description` frontmatter. Add `disable-model-invocation: true` for entry points
that only the user starts. For Codex, also add `agents/openai.yaml` with
`policy.allow_implicit_invocation: false`. Expand `<project-skills>` and
`<personal-skills>` to the paths for the coordinator's host.
