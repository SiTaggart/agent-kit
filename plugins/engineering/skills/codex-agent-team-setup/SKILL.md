---
name: codex-agent-team-setup
description: Install or update Agent Kit's portable Codex scout, builder, and reviewer profiles and configure sensible global subagent defaults. Use when setting up the project-control agent team on a machine or checking that its Codex configuration is healthy.
---

# Codex Agent Team Setup

Install the execution profiles that `project-control` worktree tasks use. The
installer derives every source path from this skill's installed directory, so
the same plugin works from any Agent Kit cache location.

## Desired Codex Defaults

Maintain these keys in the user's existing Codex `config.toml`:

```toml
[agents]
enabled = true
default_subagent_model = "gpt-5.6-sol"
default_subagent_reasoning_effort = "high"
max_concurrent_threads_per_session = 2
```

Profiles omit model and reasoning settings so they inherit these defaults.

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
the existing `[agents]` table. Preserve comments, formatting, unrelated tables,
and unrelated keys.

### 2. Configure Codex

Use `apply_patch` to add or update the four desired keys. Never replace the
whole config file.

- Reuse an existing `[agents]` table; do not create a duplicate.
- If legacy `max_threads` is the only concurrency key, replace it with
  `max_concurrent_threads_per_session`.
- Preserve keys such as `interrupt_message` and any unknown future settings.
- If the file is absent, create it with only the desired table.

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

`status` validates the installed profiles and the four `[agents]` defaults. A
non-zero exit means setup is incomplete or a managed file has drifted.

Start a new Codex task after setup so the new profiles and defaults are loaded.

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
