# Design guide

UI, accessibility, component, and design-system guidance from a public MCP
server. Part of the [Agent Kit marketplace](../../README.md).

Installing the plugin registers the `design-guide` server and the
`design-guide` skill. The URL in `.mcp.json` is public.

## Install

Add the [marketplace](../../README.md#install), then install this plugin.

Codex:

```bash
codex plugin add design-guide@agent-kit
```

Claude Code:

```text
/plugin install design-guide@agent-kit
```

In Cursor, enable `design-guide` from the private marketplace on the project.
Grok Bot in Cursor uses the same plugin. Prefer project scope.

## What install registers

Claude Code and Codex read `.mcp.json`. Both manifests point at that file with
`mcpServers`. The server name is `design-guide`. The transport `type` is
`http`. The URL is `https://design-guide.me-2c5.workers.dev/mcp`.

Cursor reads `mcp.json`. The manifest points at that file. The entry has the
same URL and no `type` field. Cursor infers the transport from `url`.

The skill tells the agent when to call `search_design_guidance` and how to
cite a hit.

## Maintain and validate

Run the [repository checks](../../README.md#validate) from the repository root.

## License

MIT.
