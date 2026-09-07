# agent-kit

Git-installable marketplace for coding-agent plugins.

The Codex marketplace contains two independently installable plugins:

- `agent-kit`: the locally maintained skills and hooks described below.
- `pstack`: [PStack for Codex](plugins/pstack/README.md), a pinned adaptation of
  Lauren Tan's PStack. It includes all 45 upstream skills, four companion skills,
  the complete guide, and the dormant automation pack. Native capability gates
  identify the hosted features Codex cannot currently provide.

Claude and Cursor continue to expose the original `agent-kit` plugin. PStack's
adapted package is currently Codex-only.

The plugin id is `agent-kit`.

One `PluginBundle` owns the tree.

```
{
  id: "agent-kit",
  skillsDir: "skills/",
  hooksDir: "hooks/",
  manifests: { cursor, claude, codex, grok }
}
```

Harness adapters are thin JSON manifests over that one tree. Skills are not copied per harness.

`AGENTS.md` is repo documentation. Plugin install does not copy it into Claude, Codex, or Cursor as always-on rules.

Prefer project-scoped install. An account-wide Cursor install applies this plugin to every cloud agent.

## Install

### Claude Code

```text
/plugin marketplace add SiTaggart/agent-kit
/plugin install agent-kit@agent-kit
```

Choose project scope in the install prompt.

To add the marketplace for everyone who trusts the project folder, put this in that project's `.claude/settings.json`.

```json
{
  "extraKnownMarketplaces": {
    "agent-kit": {
      "source": {
        "source": "github",
        "repo": "SiTaggart/agent-kit"
      }
    }
  },
  "enabledPlugins": {
    "agent-kit@agent-kit": true
  }
}
```

Turn it off for a native-harness A/B with `/plugin disable agent-kit@agent-kit` or `/plugin uninstall agent-kit@agent-kit`.

### Codex

```bash
codex plugin marketplace add SiTaggart/agent-kit
```

Then install `agent-kit` from that marketplace. Codex caches the plugin under `~/.codex/plugins`. The clone does not need to live at `~/.agents`.

Turn it off in the Codex plugin directory, or run `codex plugin marketplace remove agent-kit`.

After updating the marketplace to a revision containing PStack, install it separately:

```bash
codex plugin marketplace upgrade agent-kit
codex plugin add pstack@agent-kit
```

Start a new Codex task and invoke `$poteto-mode`. `$setup-pstack` is optional;
PStack includes [native Codex model roles](plugins/pstack/models.json).
In Codex CLI, `/plugins` opens the
plugin browser and Space toggles an installed plugin. Removing the marketplace
is not needed to disable just one plugin.

For local development, use the checkout's `.agents/plugins/marketplace.json`
as the marketplace source. The remote catalog does not include unpublished
working-tree changes.

### Cursor and Grok

Grok Bot in Cursor uses the Cursor plugin. There is no second skills tree.

The official Cursor marketplace is review-gated and is not part of this repo. Public GitHub is the source.

Cursor private marketplaces are a Teams feature. Import `https://github.com/SiTaggart/agent-kit` there and enable `agent-kit` on the project. Prefer project scope. Account-wide install hits every cloud agent.

Turn it off in Cursor plugin settings for a native-harness A/B.

## Edit skills

Edit files under `skills/` once.

Claude, Cursor, Codex, and Grok consume those files as-is through the plugin manifests.

Do not add a second copy of a skill folder under a harness directory.

## Hooks

`hooks/scripts/prevent-main-commit.sh` is the shared policy script.

Claude loads `hooks/hooks.json` automatically. Codex names the same file in its manifest (`PreToolUse` / `Bash|Shell`).

Cursor loads `hooks/cursor.json` (`beforeShellExecution`). That file points at `hooks/scripts/cursor-shell-hook.sh`, which turns the shared script's exit code into Cursor permission JSON.

## Validate

Reviewers can rerun this without installing a harness.

```bash
bun install --frozen-lockfile
bun install --cwd plugins/pstack/skills/poteto-mode/scripts --frozen-lockfile
bun run validate
bun run test
bun run lint
bun run type-check
bun run --cwd plugins/pstack/skills/poteto-mode/scripts typecheck
```

The validator checks that manifests parse, required fields exist, `skills/` and named hook files exist, `AGENTS.md` is not a plugin component, and retired catalogs or third-party provenance lockfiles are gone.

## Third-party skills

The `agent-kit` plugin contains locally maintained skills only. Do not copy
third-party skills into the root `skills/` tree. Separately packaged adaptations
live under `plugins/<name>/` with their license and pinned source attribution.

Install provider plugins separately in each harness. Common companions include Cloudflare, Vercel or Build Web Apps, Remotion, Matt Pocock Skills, RepoPrompt, GitHub, Linear, and Anthropic's frontend design plugin. Host-provided skills such as image generation and computer use also stay outside Agent Kit.

Agent Kit skills may use an installed companion when it is available. They must keep a local fallback when that companion is absent.

## Operating Loops

The shelf is organized around a few tight loops rather than standalone skills:

| Loop | Route |
| ---- | ----- |
| Explore and decide | `qmd-knowledge-base` / Obsidian when prior context may affect the frame -> `repoprompt` when broad codebase context matters -> `ce-brainstorm` -> `ce-grill` when branchy -> `document-review` when a requirements doc needs polish -> `ce-plan` |
| Plan and build | `qmd-knowledge-base` when prior context could affect the plan -> `ce-plan` with `repo-research-analyst` / `repoprompt` when broad -> `document-review` for markdown plans -> `ce-work` with early `code-taste` routing; delegate non-trivial frontend slices via `skills/ce-work/references/frontend-implementation-expert.md`; finish with `ce-quality-gate` |
| Review and ship | `ce-review` on changed work, delegating medium/large passes to reviewer personas -> `ce-triage-pr-feedback` when comments arrive -> approved fixes and proof -> git skills for authorized ops; `ce-simplify-code` when shape needs cleanup; `pr-review-canvas` for an interactive walkthrough of someone else's PR; `ce-thermo-nuclear-code-quality-review` when the change needs an unusually strict maintainability pass |
| Remember and reuse | `ce-compound` / `ce-compound-refresh` -> `.ai` -> QMD retrieval in a later discovery pass |
| Debug and investigate | `ce-debug` -> `repoprompt` when broad context is needed -> `ce-work` -> `ce-review` |
| Improve the agent shelf | QMD retros / focused `ce-sessions` evidence -> `ce-improve-skills` -> one owner-skill patch or proposal -> later retro measurement |

## Context Delegation

Skills own loops. Bounded, context-heavy phase work goes to sub-agents spawned
with a persona — a plain markdown file the sub-agent reads and applies.
Personas ship inside skills (reviewer and worker personas as `references/`
files, researchers as their own skills). Claude, Cursor, Codex, and Grok load
the same files through the plugin.

Examples:

- `ce-work` owns product contract, scope, final integration, proof, and final
  report; it delegates React/UI slices via
  `skills/ce-work/references/frontend-implementation-expert.md`.
- `ce-plan` owns the plan artifact and delegates codebase, Slack, web,
  documentation, and flow research to the researcher skills below.
- `ce-review` owns severity, deduplication, and verdict, while reviewer
  personas isolate correctness, TypeScript, testing, reliability, performance,
  API, and standards context for medium/large diffs.

## Personas

Reviewer personas (15) live in `skills/ce-review/references/reviewers/`; the
Reviewer Index in `skills/ce-review/SKILL.md` says when each lens applies.

Researchers are standalone skills, dispatchable from any loop:
`repo-research-analyst`, `web-researcher`, `docs-researcher`,
`learnings-researcher`, and `git-history-analyzer`.

Single-owner worker personas live under their loop skill's `references/`:

| Persona | Home |
| --- | --- |
| `slack-researcher` | `skills/ce-slack-research/references/` |
| `session-historian` | `skills/ce-sessions/references/` |
| `pr-comment-resolver` | `skills/resolve-pr-feedback/references/` |
| `spec-flow-analyzer` | `skills/ce-plan/references/` |
| `frontend-implementation-expert`, `documentation-specialist` | `skills/ce-work/references/` |
| `design-iterator` | `skills/ce-polish/references/` |

## Skills

### Architecture and Design

| Skill                          | Description                                            |
| ------------------------------ | ------------------------------------------------------ |
| `code-taste`                   | TypeScript, React, and code-shape guidance             |

### Code Quality

| Skill              | Description                                                  |
| ------------------ | ------------------------------------------------------------ |
| `ce-quality-gate`  | Make touched code clean for lint, format, type, and tests    |
| `ce-thermo-nuclear-code-quality-review` | Unusually strict maintainability review hunting for code-judo restructuring moves |

### Development Tools

| Skill                       | Description                                          |
| --------------------------- | ---------------------------------------------------- |
| `docs-researcher`           | Research official docs and version constraints       |
| `git-history-analyzer`      | Trace git history to explain code evolution          |
| `learnings-researcher`      | Search `.ai/solutions/` for past learnings           |
| `onboarding`                | Generate ONBOARDING.md for new contributors          |
| `repo-research-analyst`     | Scoped repo reconnaissance with inline summary       |
| `typescript-advanced-types` | Master TypeScript's advanced type system             |
| `web-researcher`            | Iterative web research with structured grounding     |

### Codebase Exploration

| Skill                  | Description                                           |
| ---------------------- | ----------------------------------------------------- |
| `repoprompt`           | Use RepoPromptCE / rpce-cli for token-efficient context |

### Documentation

| Skill              | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `agents-md`        | Create and maintain AGENTS.md / CLAUDE.md files      |
| `document-review`  | Review requirements and plan documents before handoff |

### Knowledge Search

| Skill | Description |
| ----- | ----------- |
| `qmd-knowledge-base` | Route this machine's project collections and interpret their evidence |

### Obsidian

| Skill               | Description                                              |
| -------------------- | -------------------------------------------------------- |
| `obsidian-vault`     | Manage Obsidian vaults via CLI (notes, tasks, properties)|

### Workflow and Git

| Skill                        | Description                                              |
| ---------------------------- | -------------------------------------------------------- |
| `git-clean-gone-branches`    | Clean up local branches whose remote is gone             |
| `git-commit`                 | Create value-led Conventional Commits                    |
| `git-commit-push-pr`         | Commit, push, and open a PR with a conventional title    |
| `git-worktree`               | Manage Git worktrees for parallel development            |
| `resolve-pr-feedback`        | Resolve PR review feedback by evaluating and fixing in parallel |

### Workflow Skills

| Skill                  | Description                                                    |
| ---------------------- | -------------------------------------------------------------- |
| `ce-brainstorm`        | Explore requirements through collaborative dialogue            |
| `ce-compound`          | Document solved problems to compound team knowledge            |
| `ce-compound-refresh`  | Refresh stale learnings and pattern docs against current codebase |
| `ce-debug`             | Systematic debugging with anti-patterns and investigation techniques |
| `ce-decompose`         | Carve an oversized diff into a reviewable stack, or rebuild it in increments |
| `ce-grill`             | Clarify branchy requirements before planning                   |
| `ce-handoff`           | Compact current work into a continuation brief                 |
| `ce-ideate`            | Generate and evaluate grounded improvement ideas for a project |
| `ce-optimize`          | Auto-research loop for tuning prompts and evaluating solutions |
| `ce-plan`              | Transform requirements into structured implementation plans    |
| `ce-review`            | Review branch, PR, or local work before shipping               |
| `ce-triage-pr-feedback` | Evaluate PR comments before fixing, rejecting, or deferring them |
| `pr-review-canvas`     | Generate an interactive HTML PR walkthrough from `gh api` data |
| `ce-simplify-code`     | Simplify recent code changes while preserving behavior         |
| `ce-sessions`          | Cross-platform session history analysis                        |
| `ce-slack-research`    | Research organizational context from Slack                     |
| `ce-work`              | Execute work efficiently while maintaining quality             |

> **Browser automation:** install the standalone `vercel-labs/agent-browser` plugin when using design workflows that still depend on it. The `design-iterator` persona (`skills/ce-polish/references/`) and the `design-implementation` reviewer persona (`skills/ce-review/references/reviewers/`) expect the `agent-browser` CLI to be on your `$PATH`.

## Key files

- `skills/` is the canonical skill tree.
- `hooks/` holds the shared policy script plus harness hook JSON.
- `AGENTS.md` is human documentation for this repo. It is not a plugin component.
- `.cursor-plugin/`, `.claude-plugin/`, `.codex-plugin/`, and `.agents/plugins/` are harness adapters.

## License

MIT
