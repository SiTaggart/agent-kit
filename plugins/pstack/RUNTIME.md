# PStack runtime

Select the adapter for the host running this conversation, then read it in full:

- **Codex:** [CODEX.md](CODEX.md). Defaults: [models.json](models.json).
- **Claude Code:** [CLAUDE-CODE.md](CLAUDE-CODE.md). Defaults:
  [models.claude.json](models.claude.json).

Read only the matching adapter. It owns tool mappings, model selection, history,
skill authoring, and scheduling. Its rules override upstream host assumptions;
user, system, developer, and repository instructions retain priority. If the host
is unknown, establish it before using host-specific tools or configuration.

Resolve all named PStack skills, principles, personas, and playbooks inside this
installed plugin. Pass this file's absolute path to delegates. Examples using
`$skill-name` are Codex invocations; Claude users invoke `/pstack:skill-name`.
Installation does not activate Poteto Mode. Enter it only when requested and
honor the user's opt-out. Never merge, enable auto-merge, or use a merge queue.

Within an explicitly requested workflow, named dependencies are bundled file
reads. Read them when the workflow requires them; do not try to auto-invoke
user-only slash commands. Respect Skill tool denials and do not bypass them.

In shared authoring instructions, `<project-skills>` and `<personal-skills>` mean
`.agents/skills` and `~/.agents/skills` on Codex, or `.claude/skills` and
`~/.claude/skills` on Claude. Expand these placeholders before file operations.
