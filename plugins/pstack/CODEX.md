# PStack on Codex

Read this file once when entering any PStack skill. It is the runtime adapter for
this port and takes precedence over the upstream workflow wording. User, system,
developer, and repository instructions still take precedence over this file.

## Scope and permissions

- Installing PStack does not activate Poteto Mode. Enter it only when requested.
  To stop the mode, honor the user's opt-out. To disable the plugin, use Codex's
  plugin controls. Do not write always-on rules or change Agent Kit.
- A workflow is not authorization. Stay inside the user's task. Do not send
  messages, post comments, create tickets, commit, push, publish, or deploy unless
  the session authorizes that action. Reuse authorization already given.
- Never merge, enable auto-merge, or use a merge queue. Interpret upstream
  "ship", "land", "merged", and "full autopilot" steps as preparing verified
  work for the user to merge. Report merge-ready and merged as different states.
- Do not discard edits or delete worktrees based on age, cleanliness, branch
  status, or a heuristic bucket. Preserve user work. Cleanup needs authorization
  for the concrete paths. Never run an upstream reset or forced cleanup recipe.
- Follow the host's rules for durable memory and skill edits. Do not edit an
  installed plugin cache to retain a lesson; edit its source when authorized.

## Skill and tool resolution

Resolve every named PStack skill inside this plugin's `skills/` directory first.
This keeps names such as `tdd` and `how` separate from similarly named plugins.
Use the actual installed absolute path, not a path guessed from the active repo.
Resolve a skill's `references/`, `scripts/`, and `playbooks/` from that skill's
folder. References beginning `pstack/skills/` mean this plugin's root. Do not
read plugin playbooks from the consuming project's `origin/main`.

Use the current tool schema. Upstream field names describe intent, not arguments
that can be passed to a Codex tool.

- Subagents: use the available `spawn_agent`, message, status, and wait tools.
  Never create sidebar tasks as a substitute for subagents. Honor the current
  concurrency limit and run remaining panel members as slots become available.
- Personas: general-purpose means a normal child. For poteto-agent, pass the
  absolute path to `references/agents/poteto-agent.md`; for Comment Sicko, pass
  `references/agents/comment-sicko.md`. Tell the child to read this file too.
  These are prompt references, not registered Codex agent types. Comment Sicko
  edits comments within its scoped files; its ban is on application-code edits,
  not all writes. How/why/reflect reviewers instead receive read-only briefs.
- Read-only means forbid writes in the brief. Do not assume it removes MCP
  access. Use only the tools exposed to that child and report unavailable sources.
- Cloud/environment/base-branch fields have no portable Codex equivalent here.
  Use local subagents with separate worktrees or output paths for writers. They
  share this machine. Never claim VM isolation. If remote execution is required,
  report that gap instead of launching a different kind of task.
- If delegation is unavailable, perform distinct passes serially and label the
  missing independent review. Do not claim a multi-agent result.
- Questions: use the available user-input tool and its actual schema. Plain chat
  is the fallback. A plan tool is optional; a short checklist is sufficient.
- `deslop`, `control-cli`, and `verify-this` are bundled from cursor-team-kit.
  `unslop` is upstream PStack. Resolve these inside this plugin first.
- `browser-use` replaces `control-ui` and uses Codex's native browser tools.
  Read its bundled skill and the current native tool documentation. Desktop or
  Electron targets need an exposed native app surface or the repo's supported
  harness. Browser access does not imply raw CDP, profiling, hot-patch, or video
  recording support; verify each capability before promising that evidence.
- `skill-creator` means the installed Codex authoring skill. Mode frontmatter
  becomes `agents/openai.yaml` with `policy.allow_implicit_invocation: false`.
  Codex has no Cursor mode badge/reminder field; keep Poteto active in the current
  conversation, carry it into handoff context, and honor explicit opt-out.
- Discover connectors from the available tool catalog or tool search. Do not
  inspect a Cursor MCP directory or add connectors merely to complete a checklist.

## Models

Read [models.json](models.json) in this plugin for the default role assignments.
All PStack skills use this one mapping. It selects native Codex subagent models;
it does not change the main conversation's model or use a provider SDK.

- Sol with high reasoning handles routine implementation, exploration, tooling,
  and verification workers.
- Astra with high reasoning handles debugging, performance work, explanation,
  and judgment. The hardest tasks use Astra with xhigh reasoning.
- Review and design panels use Astra, Sol, and Terra with high reasoning. These
  are three OpenAI models, not three providers. Model agreement is supporting
  evidence, not proof of correctness or independent model-family coverage.

These are starting choices based on the host's model descriptions, not measured
PStack benchmark results. Keep the current conversation model as the coordinator.

### Resolve a role before spawning

1. Read the bundled role, then replace it with the same key from optional
   `~/.codex/pstack-models.json` if present. That file is PStack data, not native
   Codex configuration. A session's explicit model choice takes precedence.
   Missing overrides retain the bundled role. Unnamed code/helpers use
   `feature, refactoring`; difficult changes use `hardest tasks`; unnamed prose
   and judgment delegates (including Comment Sicko) use `judgment and prose`.
   History/source miners use `how explorer`. Unknown role keys are errors, not
   permission to invent another model default.
2. A single choice is an object with `model` and optional `reasoning_effort`.
   A model string is also valid and leaves reasoning at the host default. A
   panel is a non-empty list of choices. Use exact keys from `models.json`;
   feature and refactoring share `feature, refactoring`, and reflect's judgment,
   divergent, and synthesizer share `reflect judgment, divergent, synthesizer`.
   Report malformed JSON or invalid role values, use that role's bundled
   default, and leave the user's file untouched.
3. Validate each model and effort against the current **subagent tool** schema.
   A model available for sidebar tasks is not necessarily available to subagents.
   `inherit-parent` and `auto` mean omit both model and effort. If a model is
   unavailable, inherit and report the substitution. If only effort is
   unsupported, omit effort and report that fallback. Never guess a provider
   slug or encode effort into the model ID.
4. Pass supported `model` and `reasoning_effort` as separate arguments. When
   overriding either, use `fork_turns="none"` and a self-contained brief with the
   task, relevant context, artifact paths, and this adapter's absolute path.
   Full-history forks inherit settings and cannot take these overrides. If the
   host cannot select a model, inherit and label the limitation.
5. Preserve the configured panel length within the host's concurrency limit.
   For a cross-judge, pick one entry from `arena cross-judge pool`, preferring a
   model different from the coordinator when its identity is known. If none is
   distinct, use a separate pass and report that limitation. Record actual model
   and effort choices, fallbacks, and any repeated models in the result.

Setup is optional. Use `$setup-pstack` to change roles; never install another
provider or alter global Codex settings to satisfy a role.

## History, scheduling, and artifacts

Use Codex task history tools when available. Filter to the active project, named
task, topic, and time window before reading messages. Task summaries do not prove
which tools ran. When full history is required, use the local session index:

```bash
python3 <installed-pstack-root>/scripts/codex-sessions.py --workspace <absolute-workspace>
```

This reads only each file's first `session_meta` record and returns paths, IDs,
and modification times for exact matching workspace metadata. The sessions root
is `${CODEX_HOME:-~/.codex}/sessions`; pass `--sessions-root` when the host uses
another verified location. Repeat `--workspace` only for workspaces explicitly
in scope. Filter the returned paths by the requested window and topic before
reading their messages. Exclude the active task and known eval/subagent sessions
when mining prior work. Match exact IDs for reflect and session pickup.

Codex JSONL has `session_meta` for identity/cwd, `turn_context` for turn settings,
`response_item` for actual messages and tool calls/results, and `event_msg` for
status. Inspect the observed shape rather than assuming every line is a chat
message. Preserve timestamps, call IDs, and source paths in evidence. If no exact
transcript is available, use a clearly labeled current-session digest and report
that tool-level or historical claims remain unverified.

Upstream `/loop`, monitored-shell sentinels, and cloud-sleeper chains mean the
host's native scheduling capability. Use it only when the user requested a
reminder, monitor, or recurring run. Keep unchanged checks quiet unless periodic
reports were requested. Do not promise a future wake until scheduling succeeds.
For work in the current turn, use bounded waits and normal progress updates.
A goal tool also requires an explicit goal request; a playbook cannot supply it.

Put working artifacts under the consuming project's `.ai/` directory unless the
user names another destination. Keep mutable logs and orchestration state outside
the installed plugin. Bundled Bun/Node scripts are optional helpers; inspect their
requirements before running them. The upstream orchestration frontier requires
Graphite (`gt`); do not install it or invent a replacement just to use the helper.
