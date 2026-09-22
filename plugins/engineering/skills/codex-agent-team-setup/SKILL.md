---
name: codex-agent-team-setup
description: Install or update Agent Kit's portable Codex scout, builder, and reviewer profiles and register them in Codex. Use when setting up the project-control agent team on a machine or checking that its Codex configuration is healthy.
---

# Codex Agent Team Setup

Install the execution profiles that `project-control` worktree tasks use. The
installer derives every source path from this skill's installed directory, so
the same plugin works from any Agent Kit cache location.

## Desired Codex Configuration

Maintain this registry in the user's existing Codex `config.toml`:

```toml
[agents]

[agents.scout]
description = "Read-only repository scout for bounded discovery, ownership mapping, and evidence gathering before implementation."
config_file = "./agents/scout.toml"

[agents.builder]
description = "Bounded implementation agent for one accepted change with focused verification."
config_file = "./agents/builder.toml"

[agents.reviewer]
description = "Read-only independent reviewer for a supplied diff, acceptance criteria, and verification evidence."
config_file = "./agents/reviewer.toml"
```

Each registered profile owns its model and reasoning settings. Relative
`config_file` paths resolve from the directory that contains `config.toml`.
The scout uses GPT-6 Luna at high effort for bounded research. The builder and
reviewer use GPT-6 Sol at high effort for implementation and independent review.

## Role Skill Maps

Each installed profile names its default Agent Kit skills directly in
`developer_instructions`. Skill names are portable because the Engineering
plugin installs them into the host skill catalog; no plugin-cache path is
embedded in the profile.

- `scout` routes repository, documentation, web, and retained-knowledge
  research to the relevant research skills.
- `builder` routes implementation, debugging, language taste, and changed-code
  validation to the relevant work skills.
- `reviewer` uses `ce-review` for the baseline pass and its deep alias when
  requested. The worktree task lead names separate structural and deletion
  passes. The reviewer follows each skill's own subagent dispatch rules.
- The worktree task lead owns explicitly requested multi-provider reviews.

Knowledge-plugin skills are conditional because Engineering and Knowledge can
be installed separately. The Engineering-owned routes are always available
with this setup skill.

## Workflow

Resolve this skill's absolute directory as `SKILL_DIR`. Do not assume a fixed
plugin cache path.

### 1. Inspect before changing anything

Run:

```sh
bun "$SKILL_DIR/scripts/install.ts" plan
```

The command reports creates, managed updates, unchanged files, and conflicts
under `${CODEX_HOME:-~/.codex}/agents`.

Read `${CODEX_HOME:-~/.codex}/config.toml` if it exists. Plan a narrow edit to
the existing `[agents]` table and its role tables. Preserve comments,
formatting, unrelated tables, and unrelated keys.

### 2. Configure Codex

Use `apply_patch` to add or update the role tables.
Never replace the whole config file.

- Reuse an existing `[agents]` table; do not create a duplicate.
- Do not set an Agent Kit concurrency limit. Preserve any user-selected
  concurrency setting; Codex chooses its default when none is set.
- Remove `enabled`, `default_subagent_model`, and
  `default_subagent_reasoning_effort` only when they exactly match the earlier
  Agent Kit defaults. Preserve different user-selected values.
- Add the three role tables exactly as shown. If one already exists with
  different values, report the conflict instead of overwriting it.
- Preserve settings such as `interrupt_message`, comments, formatting,
  unrelated tables, and unknown future keys.
- If the file is absent, create it with only the desired registry.

### 3. Install profiles

Run:

```sh
bun "$SKILL_DIR/scripts/install.ts" apply
```

The installer copies `scout.toml`, `builder.toml`, and `reviewer.toml`, then
records checksums in `${CODEX_HOME:-~/.codex}/agent-kit/managed-agents.json`.
It stops rather than overwriting an unmanaged or locally modified profile.

### 4. Verify

Run:

```sh
bun "$SKILL_DIR/scripts/install.ts" status
```

`status` validates the installed profiles and role registry. A non-zero exit
means setup is incomplete or a managed file has drifted.

Start a new Codex task after setup so the new role registry is loaded.

## Removal

Run:

```sh
bun "$SKILL_DIR/scripts/install.ts" uninstall
```

Removal deletes only profiles whose content still matches the install ledger.
It preserves changed or unknown files and leaves `config.toml` untouched. This
prevents setup from erasing user configuration it does not own.

## Test Roots

The installer accepts `--codex-home <path>` after the command. Use this only
for tests or an explicit alternate Codex home:

```sh
bun "$SKILL_DIR/scripts/install.ts" apply --codex-home /tmp/codex-home
```
