---
name: setup-pstack
description: Configure which T3 provider, model, and reasoning level P3Stack uses for each role. Reads the live T3 model catalog and writes user overrides for the bundled defaults. Use for /setup-pstack, "configure p3stack models", "p3stack budget", or changing P3Stack's model choices.
---

# Setup P3Stack

Read [P3Stack runtime guidance](../../RUNTIME.md) before this workflow.

The bundled defaults are in [models.json](../../models.json). User overrides are in `~/.agents/p3stack-models.json`. A role that the override file does not name keeps its bundled default. This file is P3Stack data. It is not a T3, Claude, or Codex setting.

## Steps

### 1. Detect available models

Call `orchestrator_capabilities`. It is the only source of truth. Keep each provider that has `canRunChildTask: true`. For each model, record its option IDs and allowed values. Option IDs differ by provider: Claude uses `effort`, and Codex and Grok use `reasoningEffort`. If no provider can run a child task, stop and tell the user. `inherit-parent` is always valid.

### 2. Load current state

Start from the bundled defaults. If the override file exists, read it and apply its values. Report invalid JSON, and do not overwrite the file. Drop each key that is not `budget` and not a bundled role, such as the retired `how critics`. Tell the user which keys you dropped.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Use the host's question tool. Offer these options with these labels. Name the current budget when the file records one.

- `unlimited — keep bundled effort`
- `large — at most xhigh`
- `medium — at most high`
- `small — at most medium`

**(b) Apply it as a limit.** A budget only lowers effort. It never raises effort. For each real choice, panel entries included, lower its effort option to the budget limit when the current value is higher. The ladder is `xhigh` > `high` > `medium` > `low`. Never write `max`, `ultra`, `ultracode`, or `ultrathink`, at any budget. Keep each option ID exactly as the catalog names it. Do not change the model to apply a budget. `inherit-parent` does not change. On a re-run, keep each role that the user changed.

**(c) Show the roles and confirm.** Show each role with its provider, model, and effort. Mark each choice that is not in the detected catalog as "needs a choice". List the keys that step 2 dropped. Ask the user to accept the table or change roles. Offer the detected models and `inherit-parent`. For panel roles (`arena runners`, `architect runners`, `interrogate reviewers`), the value is a list, and one delegate runs for each entry. Thus the list length sets the count. Keep one entry per provider when possible, because different providers give independent review. `arena cross-judge pool` is also a list. Arena selects one entry from it, with a provider that is different from the coordinator's. `swarm workers` is the model for every worker, unless a race assigns a model to each arm. Reuse choices that the user already gave.

### 4. Validate

Each real choice must have a provider, model, option ID, and option value from step 1. `inherit-parent` always passes. If a choice is not available, stop and ask again.

### 5. Write the overrides

Write `~/.agents/p3stack-models.json`. Include only the roles that are different from the bundled defaults, plus a top-level `budget` string (`unlimited`, `large`, `medium`, or `small`). Each choice is `{"providerInstanceId": ..., "model": ..., "options": {...}}` or `"inherit-parent"`. A panel is a non-empty list of choices. Reject extra fields. Write the complete merged object so that a re-run gives the same result. To return a role to its default, delete its key.

Example:

```json
{
  "budget": "medium",
  "hardest tasks": {"providerInstanceId": "claudeAgent", "model": "claude-fable-5-1", "options": {"effort": "xhigh"}},
  "swarm workers": "inherit-parent"
}
```

### 6. Confirm

Parse the saved file and read it back. Tell the user that P3Stack workflows started after this point use it. Re-run this skill to change it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof, such as a `verify-*` skill or an existing harness. If not, offer this once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /create-verification-skill." On yes, invoke `create-verification-skill`. On no, continue and do not ask again.
