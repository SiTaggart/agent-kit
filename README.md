# Agent Kit marketplace

Git-installable plugins for coding agents. Install the workflows you use and
switch command safeguards on or off separately.

## Plugins

- **[Engineering](plugins/engineering/README.md)** — 31 skills for planning,
  implementation, code review, debugging, and code taste. These workflows stay
  together because they share guidance and reviewer personas.
- **[Git](plugins/git/README.md)** — 10 skills for commits, PRs, worktrees,
  history, and feedback.
- **[Knowledge](plugins/knowledge/README.md)** — 11 skills for Obsidian, QMD,
  session research, and retained learnings.
- **[Hooks](plugins/hooks/README.md)** — independently switchable command
  safeguards. Contains no skills.
- **[PStack for Codex](plugins/pstack/README.md)** — a pinned adaptation of
  Lauren Tan's PStack, with its upstream skills, companions, guide, and dormant
  automation pack. See its README for capability requirements and attribution.

Engineering, Git, Knowledge, and Hooks support Claude Code, Codex, Cursor, and
Grok. PStack's adapted package is Codex-only. No skill plugin includes hooks.

## Install

### Codex

```bash
codex plugin marketplace add SiTaggart/agent-kit
```

Install the plugins you want:

```bash
codex plugin add engineering@agent-kit
codex plugin add git@agent-kit
codex plugin add knowledge@agent-kit
codex plugin add hooks@agent-kit
codex plugin add pstack@agent-kit
```

Start a new task after installing. Use `/plugins` to toggle an installed plugin.

For local development, register this checkout's
[Codex marketplace catalog](.agents/plugins/marketplace.json). Remote installs
use published repository content and do not include local edits.

### Claude Code

```text
/plugin marketplace add SiTaggart/agent-kit
/plugin install engineering@agent-kit
/plugin install git@agent-kit
/plugin install knowledge@agent-kit
/plugin install hooks@agent-kit
```

Install only the plugins you want. Choose project scope in the install prompt.
Use `/plugin disable <name>@agent-kit` to disable one plugin.

For shared project setup, add the marketplace under `extraKnownMarketplaces`
in the project's `.claude/settings.json` and enable the selected plugin IDs:

```json
{
  "extraKnownMarketplaces": {
    "agent-kit": {
      "source": { "source": "github", "repo": "SiTaggart/agent-kit" }
    }
  },
  "enabledPlugins": {
    "engineering@agent-kit": true,
    "git@agent-kit": true,
    "knowledge@agent-kit": true,
    "hooks@agent-kit": true
  }
}
```

### Cursor and Grok

Import `https://github.com/SiTaggart/agent-kit` through a Cursor private
marketplace, then enable the selected plugins on the project. Private
marketplaces require Teams. Grok Bot in Cursor uses the same manifests.
Prefer project scope; an account-wide install applies to every cloud agent.

## Migrate from the combined plugin

The marketplace is still named `agent-kit`. The old `agent-kit@agent-kit`
plugin is replaced by `engineering`, `git`, `knowledge`, and `hooks`.

Refresh the marketplace, disable or uninstall the old combined plugin, and
install the new plugins you want. In Codex, refresh with
`codex plugin marketplace upgrade agent-kit`; use the plugin browser for the
old installation. In Claude, use `/plugin marketplace update agent-kit`, then
`/plugin uninstall agent-kit@agent-kit`.

Update any project `enabledPlugins` entries and qualified skill calls that
still use the old plugin ID. Skill names stay the same; their plugin namespaces
change. For example, Claude's `/agent-kit:ce-plan` becomes
`/engineering:ce-plan`.

To retain all previous capabilities, enable Engineering, Git, Knowledge, and
Hooks. Keeping the old plugin enabled can duplicate skills and safeguards.

## Repository layout

```text
.agents/plugins/marketplace.json  Codex catalog
.claude-plugin/marketplace.json   Claude catalog
.cursor-plugin/marketplace.json   Cursor/Grok catalog
plugins/
  engineering/                   Skills, manifests, README
  git/                           Skills, manifests, README
  knowledge/                     Skills, manifests, README
  hooks/                         Hooks, manifests, README
  pstack/                        Codex port and its documentation
src/                             Marketplace validation CLI
tests/                           Plugin and script checks
AGENTS.md                        Repository contributor instructions
```

Each plugin owns its files. Marketplace sources resolve from the repository
root; component paths resolve from each plugin folder. Plugins can be cached
in different directories, so runtime references across plugins use installed
skill lookup rather than relative paths.

`AGENTS.md` is repository guidance and is not an installed plugin component.
Third-party adaptations keep their own license and pinned source attribution.

## Validate

Run from the repository root:

```bash
bun install --frozen-lockfile
bun install --cwd plugins/pstack/skills/poteto-mode/scripts --frozen-lockfile
bun run validate
bun run test
bun run lint
bun run type-check
bun run --cwd plugins/pstack/skills/poteto-mode/scripts typecheck
```

Validation checks the four maintained plugins, their marketplace sources and
manifests, skill and hook ownership, and retired paths. Tests exercise scripts,
packaging boundaries, and PStack's bundle contracts. These checks do not install
plugins into a harness.

## License

MIT. PStack retains its [upstream license](plugins/pstack/LICENSE).
