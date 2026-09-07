# Knowledge

Obsidian, QMD, session research, and retained learnings.

Part of the [Agent Kit marketplace](../../README.md). Supports Claude Code,
Codex, Cursor, and Grok. This plugin contains skills only; command safeguards
are provided by the separately enabled [Hooks plugin](../hooks/README.md).

## Install

Add the [marketplace](../../README.md#install), then select this plugin.

Codex:

```bash
codex plugin add knowledge@agent-kit
```

Claude Code:

```text
/plugin install knowledge@agent-kit
```

In Cursor, enable `knowledge` from the private marketplace on the project.
Grok Bot in Cursor uses the same plugin. Prefer project scope.

## Workflows

Use `qmd-knowledge-base` for indexed context and `obsidian-vault` for vault
operations. Use `ce-sessions` to inspect prior agent work and
`ce-slack-research` only when Slack research is requested.

Use `ce-compound` to retain a solved problem, `ce-compound-refresh` to refresh
stale learnings, and `learnings-researcher` to retrieve applicable lessons.
These skills and their shared schemas, templates, and scripts stay together.

`ce-handoff` preserves task context. `ce-improve-skills` turns verified session
friction into a bounded guidance change. `agents-md` maintains repository agent
instructions. Optional code-example reviews use Engineering when installed.

QMD, Obsidian, session stores, and Slack access come from the host. This plugin
does not install those tools or grant access to them.

## Skills

- [agents-md](skills/agents-md/SKILL.md)
- [ce-compound](skills/ce-compound/SKILL.md)
- [ce-compound-refresh](skills/ce-compound-refresh/SKILL.md)
- [ce-handoff](skills/ce-handoff/SKILL.md)
- [ce-improve-skills](skills/ce-improve-skills/SKILL.md)
- [ce-sessions](skills/ce-sessions/SKILL.md)
- [ce-slack-research](skills/ce-slack-research/SKILL.md)
- [chronicle](skills/chronicle/SKILL.md)
- [learnings-researcher](skills/learnings-researcher/SKILL.md)
- [obsidian-vault](skills/obsidian-vault/SKILL.md)
- [qmd-knowledge-base](skills/qmd-knowledge-base/SKILL.md)

## Maintain and validate

Edit `skills/` within this plugin. Each harness manifest points at the same
tree. Keep references to files inside this plugin relative; resolve optional
skills in other plugins through the host's installed skill catalog.

Run the [repository checks](../../README.md#validate) from the repository root.

## License

MIT.
