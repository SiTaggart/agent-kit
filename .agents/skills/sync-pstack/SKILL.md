---
name: sync-pstack
description: "Sync this repository's Codex and Claude port of PStack, and its T3 Code port P3Stack, from the canonical upstream pin. Bring in the upstream delta since the recorded pin and keep host adapters, install docs, and model assignments. Use when a maintainer working in this repository asks to update the pstack or p3stack port."
disable-model-invocation: true
---

# Sync pstack

Bring the upstream delta since the recorded pin into this Codex and Claude port, then mirror it into the T3 Code port in `plugins/p3stack/`. Do not rewrite either port.

This skill belongs to the agent-kit repository at `.agents/skills/sync-pstack/`. It is not a skill in the pstack or p3stack plugin, and it must not be copied into either plugin's `skills/`.

## Intent

The port tracks Lauren Tan's PStack. A sync copies behavior that landed upstream after the pin, then adapts it so this package still runs on Codex and Claude Code. The result is that delta, plus the adaptation required to keep the invariants.

## Where the pin lives

The recorded pin is the commit and version in the first blockquote of [plugins/pstack/README.md](../../../plugins/pstack/README.md). The package version in both plugin manifests and both marketplace catalogs tracks that upstream version.

Confirm the upstream tree from that README and the plugin manifests. Today that tree is `pstack/` on `main` of `https://github.com/cursor/plugins`. If those docs and the tree disagree, follow the repo.

## Done

- The diff is the upstream delta since the previous pin, plus the port adaptation that keeps the invariants below.
- The recorded pin is the revision you actually synced, commit and version.
- A pull request is open against the default branch. It names the upstream range, what stayed port-local, and this skill. The user merges.

## Invariants

The invariants in this section apply to `plugins/pstack/`. The P3Stack paragraph below sets the rules for `plugins/p3stack/`.

Keep the host adapters and install docs: `CODEX.md`, `CLAUDE-CODE.md`, `RUNTIME.md`, `.codex-plugin/`, `.claude-plugin/`, and the install sections of the README and guide.

Codex and Claude model assignments stay. `models.json` and `models.claude.json` change only when upstream renames a role. Map that role onto the existing assignment for the same job. Do not copy Cursor model ids into this port.

The user merges. Translate upstream land or merge steps into a merge-ready handoff.

Host tools come from `RUNTIME.md`. New upstream skills get the runtime preamble and resolve roles the same way existing skills do. They do not grow a second model table.

Upstream agent personas land in `references/agents/`. This port's plugin manifests stay. Only their version and skill counts move with the pin.

P3Stack mirrors the PStack port. After the PStack sync, copy `skills/`, `references/`, `licenses/`, `assets/`, and `LICENSE` from `plugins/pstack/` to `plugins/p3stack/`, except `skills/setup-pstack/`. P3Stack has no `CODEX.md`, `CLAUDE-CODE.md`, `models.claude.json`, or `scripts/codex-sessions.py`. Do not copy them. Keep P3Stack's own `RUNTIME.md`, `models.json`, `skills/setup-pstack/`, README, and manifests. Move its pin, manifest versions, and catalog versions with PStack's. When upstream renames a role, rename it in P3Stack's `models.json` too, and keep its provider, model, and effort. When upstream adds a host mechanism, map it to a T3 tool in P3Stack's `RUNTIME.md`. `tests/p3stack-plugin.test.ts` fails when the mirror drifts, or when the P3Stack version or pin differs from PStack's.

Preserve port-local files upstream does not have. That includes `scripts/codex-sessions.py` and the bundled companions `browser-use`, `control-cli`, `deslop`, and `verify-this`.

## Proof

In `plugins/pstack/`, `models.json` is unchanged unless a role-key mapping is explained in the pull request. In `plugins/p3stack/`, each role keeps its provider, model, and effort unless the pull request explains the change. The pin commit exists upstream, and its plugin version matches the recorded pin. Host sections still name roles. Neither plugin contains this skill. `bun test tests/p3stack-plugin.test.ts` passes.
