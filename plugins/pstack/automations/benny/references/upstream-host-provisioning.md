# Upstream host provisioning reference

Historical source, not executable Codex instructions. These sections used Cursor-only project settings and automation creation. The operational replacement is [the runtime preflight](../CODEX.md). Original source: `cursor/plugins` commit `93b00b89ef425a9c1bac0d0b317dfc49c930ac99`.

## README.md

~~~~text
3. let setup enable pstack in the target repository's `.cursor/settings.json` for shared dependencies:

```json
{
	"plugins": {
		"pstack": { "enabled": true }
	}
}
```

~~~~

## FOR_AGENTS.md

~~~~text
i want you to merge this entry into the target repository's `.cursor/settings.json`:

```json
{
	"plugins": {
		"pstack": { "enabled": true }
	}
}
```

preserve every unrelated setting and plugin. preserve comments and valid jsonc syntax when the existing file uses jsonc.

~~~~

## FOR_AGENTS.md

~~~~text
for first-time creation, use built-in `/automate` once for triage and once for repro and fix. complete the draft review, approval, readiness check, and Automations editor handoff for the first automation before starting the second.

paraphrase this intent and the finished configuration into each draft. the triage prompt must read and follow `.cursor/automations/benny/skills/triage-issue-reports/SKILL.md`. the repro prompt must read and follow `.cursor/automations/benny/skills/reproduce-and-fix-issues/SKILL.md`. use these repo-relative paths only after `/automate` confirms they are committed in the repository where the automation will run.

~~~~

## skills/setup-benny/SKILL.md

~~~~text
Add pstack to the target repository's `.cursor/settings.json`. If the file or `.cursor` directory does not exist, create it.

Merge this entry into the existing JSON or JSONC:

```json
{
	"plugins": {
		"pstack": { "enabled": true }
	}
}
```

Preserve every unrelated top-level setting and every other plugin entry. If `plugins.pstack` already exists, change only its `enabled` value. Preserve comments and valid JSONC syntax when the file uses JSONC. Validate the file after editing it.

~~~~

## skills/setup-benny/SKILL.md

~~~~text
For each automation:

1. Read the matching copied prompt template as secondary internal source material.
2. Turn `FOR_AGENTS.md`, the finished Benny configuration, and the template intent into a complete natural-language request.
3. Tell the live prompt to read and follow its exact committed operational file under `.cursor/automations/benny/`.
4. Use the stable repository-relative path, not a plugin source or cache path. Do not copy the operational file contents into the live prompt.
5. Read and follow the built-in `automate` skill.
6. Let `automate` discover Slack channels, the repository, and connected integrations.
7. Let `automate` confirm that the copied pack and any referenced configuration files are committed in the same repository where the automation will run.
8. Let `automate` show its draft table, obtain approval, ask readiness, and open the Automations editor.
9. Finish the editor handoff for this automation before starting the next one.

~~~~

## skills/setup-benny/SKILL.md

~~~~text
Never call a direct automation backend service or backend automation tool. Never use a browser URL that carries draft fields. Never build or open a Cursor protocol deep link. For new automations, the only finish path is the built-in `automate` skill's reviewed Automations editor handoff.

~~~~

