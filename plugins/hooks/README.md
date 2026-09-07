# Hooks

Independently switchable shell command safeguards for Claude Code, Codex,
Cursor, and Grok. Part of the [Agent Kit marketplace](../../README.md).

This plugin contains no skills. Enable or disable it independently of
Engineering, Git, and Knowledge.

## Install

Add the [marketplace](../../README.md#install), then install Hooks explicitly.

Codex:

```bash
codex plugin add hooks@agent-kit
```

Claude Code:

```text
/plugin install hooks@agent-kit
```

In Cursor, enable `hooks` from the private marketplace on the project.
Grok Bot in Cursor uses the same plugin. Prefer project scope.

## Safeguards

The shared policy script blocks direct commits on `main` and `master`, and
recognizes destructive shell commands. It fails closed when hook input cannot
be parsed. These are command checks, not a sandbox or a complete shell parser.

- Claude automatically loads `hooks/hooks.json` for `PreToolUse` on `Bash|Shell`.
- Codex's manifest names that same hook configuration.
- Cursor loads `hooks/cursor.json` for `beforeShellExecution`. Its wrapper
  converts the shared policy's exit code to Cursor permission JSON.

The scripts require Bash and Python 3. The policy can parse input without jq.

## Disable

In Codex CLI, open `/plugins` and toggle Hooks. In Claude Code, run:

```text
/plugin disable hooks@agent-kit
```

In Cursor, disable `hooks` in the project's plugin settings. The skill plugins
remain enabled.

## Maintain and validate

- [Shared policy](hooks/scripts/prevent-main-commit.sh)
- [Cursor wrapper](hooks/scripts/cursor-shell-hook.sh)
- [Claude and Codex configuration](hooks/hooks.json)
- [Cursor configuration](hooks/cursor.json)

Run the [repository checks](../../README.md#validate) from the repository root.
Tests exercise representative allowed and blocked commands and packaged paths.

## License

MIT.
