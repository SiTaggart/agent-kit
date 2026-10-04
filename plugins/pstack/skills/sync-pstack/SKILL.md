---
name: sync-pstack
description: "Sync this Codex and Claude port of PStack from the canonical upstream pin. Bring in the upstream delta since the recorded pin and keep host adapters, install docs, and model assignments. Use for /sync-pstack or when a maintainer asks to update the pstack port."
disable-model-invocation: true
---

Read [PStack runtime guidance](../../RUNTIME.md) before this workflow. It defines tool mappings and overrides upstream host assumptions.

# Sync pstack

Bring the upstream delta since the recorded pin into this Codex and Claude port. Do not rewrite the port.

## Intent

The port tracks Lauren Tan's PStack. A sync copies behavior that landed upstream after the pin, then adapts it so this package still runs on Codex and Claude Code. The result is that delta, the adaptation required to keep the invariants, and this skill when it is new.

## Where the pin lives

The recorded pin is the commit and version in the first blockquote of [README.md](../../README.md). The package version in both plugin manifests and both marketplace catalogs tracks that upstream version.

Confirm the upstream tree from this plugin's README and manifests. Today that tree is `pstack/` on `main` of `https://github.com/cursor/plugins`. If those docs and the tree disagree, follow the repo.

## Done

- The diff is the upstream delta since the previous pin, plus the port adaptation that keeps the invariants below.
- The recorded pin is the revision you actually synced, commit and version.
- A pull request is open against the default branch. It names the upstream range, what stayed port-local, and this skill. The user merges.

## Invariants

Keep the host adapters and install docs: `CODEX.md`, `CLAUDE-CODE.md`, `RUNTIME.md`, `.codex-plugin/`, `.claude-plugin/`, and the install sections of the README and guide.

Codex and Claude model assignments stay. `models.json` and `models.claude.json` change only when upstream renames a role. Map that role onto the existing assignment for the same job. Do not copy Cursor model ids into this port.

The user merges. Translate upstream land or merge steps into a merge-ready handoff.

Host tools come from `RUNTIME.md`. New upstream skills get the runtime preamble and resolve roles the same way existing skills do. They do not grow a second model table.

Upstream agent personas land in `references/agents/`. This port's plugin manifests stay. Only their version and skill counts move with the pin.

Preserve port-local files upstream does not have. That includes this skill, `scripts/codex-sessions.py`, and the bundled companions `browser-use`, `control-cli`, `deslop`, and `verify-this`.

## Proof

`models.json` is unchanged unless a role-key mapping is explained in the pull request. The pin commit exists upstream, and its plugin version matches the recorded pin. Host sections still name roles.
