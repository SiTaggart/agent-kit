---
name: sync-p3stack
description: "Sync this repository's T3 Code port of PStack, P3Stack, from the recorded upstream pin to the latest upstream PStack. Bring in the upstream delta since the pin and keep the T3 runtime, model assignments, and install docs. Use when a maintainer working in this repository asks to update the p3stack port."
disable-model-invocation: true
---

# Sync p3stack

Bring the upstream delta since the recorded pin into `plugins/p3stack/`. Do not rewrite the port.

This skill belongs to the agent-kit repository at `.agents/skills/sync-p3stack/`. It is not a skill in the p3stack plugin. Do not copy it into the plugin's `skills/`.

## Intent

P3Stack tracks Lauren Tan's PStack. A sync copies behavior that landed upstream after the pin, then adapts it so the package still runs as a T3 Code coordinator on Claude Code and Codex. The result is that delta, plus the adaptation required to keep the invariants.

P3Stack is the only maintained port. `plugins/pstack/` is a legacy port that is frozen at its last pin and will be removed. Do not sync into it.

## Where the pin lives

The recorded pin is the commit and version in the first blockquote of [plugins/p3stack/README.md](../../../plugins/p3stack/README.md). The package version in both plugin manifests and both marketplace catalogs tracks that upstream version.

Today the upstream tree is `pstack/` on `main` of `https://github.com/cursor/plugins`. Its version is in `pstack/.cursor-plugin/plugin.json`. If that changes, follow the upstream repository.

## Method

For each file that upstream changed since the pin, do a three-way merge. The base is the file at the old pin. One side is the port file. The other side is the file at the new upstream commit. `git merge-file <port file> <base> <upstream>` does this. Resolve each conflict to keep the invariants. Then read the merged text that had no conflict, because upstream wording that is Cursor-specific merges in cleanly.

## Done

- The diff is the upstream delta since the previous pin, plus the port adaptation that keeps the invariants below.
- The recorded pin is the revision you actually synced, commit and version.
- A pull request is open against the default branch. It names the upstream range, what stayed port-local, and this skill. The user merges.

## Invariants

Keep the T3 runtime and install docs: `RUNTIME.md`, `.codex-plugin/`, `.claude-plugin/`, the README, and the install and model sections of `docs/guide/01-setup.md`.

Keep the model assignments. `models.json` changes only when upstream renames a role. Rename the key and keep its provider, model, and effort. Do not copy Cursor model ids into this port. Upstream changes that only swap default Cursor model ids are no-ops here.

When upstream adds a host mechanism, map it to a T3 tool in `RUNTIME.md`. Upstream Task subagents, cloud agents, Custom Modes, `/loop`, `.mdc` rules, and Cursor Projects have T3 equivalents or are reported as unavailable. They do not appear as Cursor instructions in this port.

The user merges. Translate upstream land or merge steps into a merge-ready handoff.

New upstream skills get the runtime preamble that links `../../RUNTIME.md`, and resolve roles the same way existing skills do. They do not grow a second model table. A typed-only skill gets `disable-model-invocation: true` and an `agents/openai.yaml` with `allow_implicit_invocation: false`. Write skill names in the Codex `$name` form. Update the skill count in `tests/p3stack-plugin.test.ts`, and skill or playbook counts where the README and guide state them.

Upstream agent personas land in `references/agents/`. The plugin manifests stay. Only their version moves with the pin.

Preserve port-local files that upstream does not have: `skills/setup-pstack/` (the T3 setup skill), `models.json`, and the bundled companions `browser-use`, `control-cli`, `deslop`, and `verify-this`. Do not add `CODEX.md`, `CLAUDE-CODE.md`, `models.claude.json`, `scripts/codex-sessions.py`, or the upstream `automations/` pack.

## Proof

`models.json` keeps each role's provider, model, and effort unless the pull request explains the change. The pin commit exists upstream, and its plugin version matches the recorded pin. Every markdown link in the plugin resolves. The plugin does not contain this skill. These pass from the repository root: `bun install --frozen-lockfile`, `bun run validate`, `bun run test`, `bun run lint`, and `bun run type-check`.
