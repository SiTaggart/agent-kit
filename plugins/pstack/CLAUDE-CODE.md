# PStack on Claude Code

Read this adapter in full before a PStack workflow. It overrides upstream host
assumptions; user, system, developer, and repository instructions take precedence.

## Scope and permissions

- Installing PStack does not activate Poteto Mode. Enter it only when requested,
  keep it in the current conversation, and honor opt-out. Use `/plugin` to disable
  the plugin. Do not install an always-on rule or change global instructions.
- A workflow does not grant authorization. Stay inside the user's task. Sending
  messages, posting comments, creating tickets, committing, pushing, publishing,
  and deploying require authorization in the session. Reuse authorization given.
- Never merge, enable auto-merge, or use a merge queue. Upstream shipping and
  autopilot steps end with verified work ready for the user to merge.
- Preserve user edits and worktrees. Age, cleanliness, branch status, and audit
  buckets do not authorize deletion. Cleanup requires concrete authorized paths.
- Follow the host's rules for durable memory and skill edits. Do not edit plugin
  caches to retain a lesson; edit the source when authorized.

## Skills and tools

Use `/pstack:<name>` for user invocations. Resolve bundled dependencies from the
installed `skills/` directory, with references relative to their skill folder.
Read the files a requested workflow names; do not search the consuming project's
Git history for plugin playbooks. Respect `disable-model-invocation` and Skill
tool denials. Never reproduce a denied skill's workflow to bypass that denial.

- Subagents: use Claude's native `Agent` tool (`Task` in older versions) and its
  actual schema. Use an exposed general-purpose agent type, such as `claude` or
  `general-purpose`, with a self-contained brief. Do not pass Codex's
  `spawn_agent`, `fork_turns`, or `reasoning_effort` fields.
- Personas are prompt references, not registered agent types. For poteto-agent,
  pass the absolute path to `references/agents/poteto-agent.md` and require its
  read; for Comment Sicko, use `references/agents/comment-sicko.md`. Require this
  adapter too. Comment Sicko may edit comments in its scoped files, but may not
  edit application code. How/why/reflect reviewers get read-only briefs.
- Use native background execution, status, messaging, and resume only when the
  live tool exposes them. Honor concurrency and nesting limits. Wait for active
  children; resume an idle child only to continue assigned work. If delegation
  is unavailable, use separate serial passes and report missing independence.
- Local children share the host. Each writer needs an exclusive worktree and
  separate runtime data, output paths, and ports. Native worktree isolation, when
  exposed, isolates source files only. Do not claim VM or credential isolation.
- Use `Read`, `Glob`, `Grep`, `Bash`, edit tools, and `AskUserQuestion` according
  to the live schema and permission settings. Never change permission mode or
  install an MCP server to make a workflow run. Plain chat is the question fallback.
- Browser proof uses available Claude browser tools or the repo's existing
  harness, per `skills/browser-use/SKILL.md`. Chrome tools require an enabled
  integration. Do not call Codex's CUA API. Check desktop/CDP/profiling/recording
  support separately; report gaps when the target cannot be reached.
- For skill authoring, use an installed skill-creator if available; otherwise use
  Claude's documented skill format. Project skills live in `.claude/skills/`,
  personal skills in `~/.claude/skills/`, and plugin skills in `skills/`. Use
  `name` and `description` frontmatter, and `disable-model-invocation: true` for
  user-only entry points. There is no Cursor mode badge/reminder. Do not write
  Codex's `agents/openai.yaml` for a Claude-only skill.

## Model roles

Read [models.claude.json](models.claude.json), then optional
`~/.claude/pstack-models.json`. Never read or write Codex's overrides on Claude.
These files are PStack data, not Claude settings. They select delegates only;
keep the current conversation model as coordinator. Sonnet defaults cover routine
work; Opus covers difficult reasoning and judgment. Panels use Opus, Sonnet, and
Fable. These are Anthropic models, not independent providers, and these defaults
are starting choices, not benchmark results.

1. Use the exact 17 role keys in the defaults. A session's explicit choice wins;
   otherwise an override replaces the whole bundled value for that role. Unnamed
   code/helpers use `feature, refactoring`, hard work uses `hardest tasks`, prose
   and Comment Sicko use `judgment and prose`, and history miners use `how explorer`.
2. A choice is a model string or an object with `model` and optional `effort`.
   Panels are non-empty lists of choices. Reject unknown roles, extra fields,
   invalid JSON, or wrong single/panel shapes. Report the error, use the affected
   role's bundled default, and preserve the user's file.
3. Validate choices against the current Agent tool's models and effort support.
   A CLI model alias does not establish Agent availability. `inherit-parent` and
   `auto` mean omit model and effort. If the tool requires a model, use its
   documented inheritance value. If a configured model is unavailable, inherit
   and report it; if only effort is unsupported, omit effort and report it.
   Never put effort into a model name or substitute a guessed provider ID.
4. Pass supported `model` and `effort` separately. Bundled string choices leave
   effort inherited. Do not use an SDK, shell out to another provider, or alter
   global Claude settings to satisfy a role. If model selection is unavailable,
   inherit and label the limitation.
5. Preserve panel length within available concurrency. Cross-judges select one
   entry from `arena cross-judge pool`, preferring a model different from the
   coordinator when known. Report actual models, fallbacks, repetitions, and
   missing diversity. Agreement alone is not proof.

Setup is optional. Use `/pstack:setup-pstack` to change assignments.

## History, scheduling, and artifacts

Use available project-scoped session tools or an exact transcript supplied by the
user. For local transcripts, establish the project directory and session ID from
Claude's session metadata before reading messages. Claude stores project sessions
under `~/.claude/projects/`; a sanitized directory name alone does not prove a
workspace match. Validate `cwd` and `sessionId` metadata for the selected file,
then limit reads to the requested topic and time window. Do not glob unrelated
chat contents. Follow only subagent transcripts belonging to the selected session.
Inspect the observed JSONL schema and preserve timestamps, tool IDs, and file paths.
If no scoped transcript is available, use a labeled current-session digest and
report missing historical or tool-level evidence. Never use `codex-sessions.py`.

For the worktree audit, run `scripts/worktree-audit.sh <repo> claude` from the
installed poteto-mode skill. It reports Git state with history marked unknown;
verify Claude session usage separately before any authorized cleanup.

Use native scheduling only for a requested reminder, monitor, or recurring run.
When available, `/loop` and Cron tools operate in a live Claude session; they do
not establish an unattended service after exit. Confirm creation, report the
actual lifetime/expiry, and keep unchanged checks quiet unless requested. A
`disable-model-invocation` skill cannot be invoked by a scheduled task. Never
use a timer to bypass that restriction. Goals also need explicit user intent.
If the current host has no suitable scheduler, leave a durable resume point and
report the gap. During active work, use bounded waits and normal progress updates.
Do not invent shell sentinels, webhook relays, or cloud-sleeper chains.

Store working artifacts under the consuming project's `.ai/` unless the user
names another destination. Keep mutable logs and orchestration state outside the
installed plugin. Inspect bundled helper requirements first. The orchestration
frontier requires Graphite (`gt`); do not install it merely to run a helper.

Reference: [Claude skills](https://code.claude.com/docs/en/skills),
[subagents](https://code.claude.com/docs/en/sub-agents), and
[scheduling](https://code.claude.com/docs/en/scheduled-tasks).
