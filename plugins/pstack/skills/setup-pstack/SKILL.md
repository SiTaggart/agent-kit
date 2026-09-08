---
name: setup-pstack
description: Configure which models pstack uses per role. Detects your available models and writes host-specific model overrides for the bundled defaults. Use for /setup-pstack, "configure pstack models", or changing pstack's model choices.
---

# Setup pstack

Read [PStack runtime guidance](../../RUNTIME.md) before this workflow.

Select the host through RUNTIME.md. Codex uses [models.json](../../models.json) and `~/.codex/pstack-models.json`; Claude Code uses [models.claude.json](../../models.claude.json) and `~/.claude/pstack-models.json`. Read and write only that host’s override file. Missing roles keep the bundled default. These are PStack data, not global host settings.

## Steps

### 1. Detect available models

Enumerate the model slugs you can pass to a native subagent in this session. That is the dependable source. Use the current subagent tool schema, including supported reasoning levels; a sidebar-task model list does not establish subagent availability. If you cannot detect any, ask the user to paste the slugs they have access to. Never write a real slug you have not confirmed is available. The aliases `inherit-parent` and `auto` are always valid even though they are not detected slugs.

### 2. Load current state

Use the selected host’s bundled mapping. If its override file already exists, read it and treat its values as the current choices over those defaults. Report invalid JSON rather than overwriting it.

### 3. Map and confirm

Show every role with its current model, marking any real slug not in the detected set as needing a choice. Ask whether to accept as-is or change specific roles, offering the detected models plus `inherit-parent` and `auto` (both mean: this role runs on the parent chat model, which is how Auto users stay on Auto) as the options. Prefer the available user-input tool over free text, within its supported schema. Reuse choices already supplied by the user. For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, alias entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena selects one value from it that differs from the parent model when possible, per RUNTIME.md; each host’s defaults use models from one provider. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

### 4. Validate

Every real slug written must be in the detected set. `inherit-parent` and `auto` always pass. If a chosen real slug is not available, stop and ask again.

### 5. Write the overrides

Write the selected host’s override file using its exact bundled role labels. Preserve existing choices the user did not change. Overwrite the complete merged JSON object so re-runs stay idempotent. Delete a role to return it to the bundled default. Each choice is a model string or an object with `model` and the host’s optional effort field (`reasoning_effort` for Codex, `effort` for Claude); panel roles take a non-empty list of choices. Validate role keys, single versus panel shape, supported models and reasoning levels before writing. Reject extra object fields. `inherit-parent` and `auto` omit both model and effort. Follow RUNTIME.md for runtime fallback and dispatch.

Example shape for two overrides (leave other roles at their existing or bundled values):

```json
{
  "feature, refactoring": "inherit-parent",
  "hardest tasks": "inherit-parent"
}
```

### 6. Confirm

Parse and read back the saved JSON. Tell the user the overrides were written and that subsequent PStack invocations read them. Re-running this skill updates them.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `/create-verification-skill` (resolves wherever pstack is installed: workspace, user, or plugin). On no, move on without pushing.
