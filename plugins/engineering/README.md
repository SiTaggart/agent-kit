# Engineering

Planning, implementation, code review, debugging, and code taste.

Part of the [Agent Kit marketplace](../../README.md). Supports Claude Code,
Codex, Cursor, and Grok. This plugin contains skills only; command safeguards
are provided by the separately enabled [Hooks plugin](../hooks/README.md).

## Install

Add the [marketplace](../../README.md#install), then select this plugin.

Codex:

```bash
codex plugin add engineering@agent-kit
```

Claude Code:

```text
/plugin install engineering@agent-kit
```

In Cursor, enable `engineering` from the private marketplace on the project.
Grok Bot in Cursor uses the same plugin. Prefer project scope.

## Workflows

Keep planning and implementation together:
`ce-brainstorm` → `ce-grill` when needed → `ce-plan` → `ce-work` →
`ce-quality-gate` → `ce-review`.

Use `ce-debug` for failures, `ce-polish` for browser iteration, and
`ce-simplify-code` for cleanup. TypeScript and React work uses `code-taste`;
Spade Python work uses `spade-python-taste`.

Reviewer personas live in `skills/ce-review/references/reviewers/`. Worker
personas live under their owning skill's `references/` directory. Shared
rendering and dispatch guidance lives in `skills/ce-conventions/`.

Git operations and retained knowledge are separate optional companions. Skills
resolve them from the host's installed skill catalog. Missing companions do
not grant permission to install plugins or perform side effects.

## Skills

- [ays](skills/ays/SKILL.md)
- [bro](skills/bro/SKILL.md)
- [ce-brainstorm](skills/ce-brainstorm/SKILL.md)
- [ce-conventions](skills/ce-conventions/SKILL.md)
- [ce-council](skills/ce-council/SKILL.md)
- [ce-debug](skills/ce-debug/SKILL.md)
- [ce-decompose](skills/ce-decompose/SKILL.md)
- [ce-grill](skills/ce-grill/SKILL.md)
- [ce-ideate](skills/ce-ideate/SKILL.md)
- [ce-optimize](skills/ce-optimize/SKILL.md)
- [ce-plan](skills/ce-plan/SKILL.md)
- [ce-polish](skills/ce-polish/SKILL.md)
- [ce-quality-gate](skills/ce-quality-gate/SKILL.md)
- [ce-review](skills/ce-review/SKILL.md)
- [ce-simplify-code](skills/ce-simplify-code/SKILL.md)
- [ce-technical-review](skills/ce-technical-review/SKILL.md)
- [ce-thermo-nuclear-code-quality-review](skills/ce-thermo-nuclear-code-quality-review/SKILL.md)
- [ce-work](skills/ce-work/SKILL.md)
- [code-taste](skills/code-taste/SKILL.md)
- [codiff](skills/codiff/SKILL.md)
- [docs-researcher](skills/docs-researcher/SKILL.md)
- [document-review](skills/document-review/SKILL.md)
- [onboarding](skills/onboarding/SKILL.md)
- [prompt-check](skills/prompt-check/SKILL.md)
- [repo-research-analyst](skills/repo-research-analyst/SKILL.md)
- [repoprompt](skills/repoprompt/SKILL.md)
- [repoprompt-multi-review](skills/repoprompt-multi-review/SKILL.md)
- [spade-python-taste](skills/spade-python-taste/SKILL.md)
- [typescript-advanced-types](skills/typescript-advanced-types/SKILL.md)
- [web-researcher](skills/web-researcher/SKILL.md)

## Maintain and validate

Edit `skills/` within this plugin. Each harness manifest points at the same
tree. Keep references to files inside this plugin relative; resolve optional
skills in other plugins through the host's installed skill catalog.

Run the [repository checks](../../README.md#validate) from the repository root.

## License

MIT.
