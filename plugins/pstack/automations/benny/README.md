# benny

benny provides the sources for two Codex automations for slack issue reports. Native Slack event triggers are currently unavailable; the pack stays dormant until the runtime preflight passes. one triages each report. the other reproduces confirmed bugs and may prepare a small draft fix.

the files in this directory are dormant setup and automation sources. they do not appear as slash skills.

## set it up

1. point Codex at [`FOR_AGENTS.md`](./FOR_AGENTS.md) and name the target repository.
2. let setup merge this whole directory into the target at `.agents/automations/benny/`. it must preserve destination-only files and review conflicts instead of overwriting local edits.
3. read [the Codex runtime preflight](./CODEX.md). Install PStack through Codex's native plugin controls, then verify its shared skills in the exact fresh automation runtime. Codex has no verified equivalent of Cursor's committed project plugin setting. Do not claim that guarantee.

4. keep user-owned configuration outside the copied pack, for example in `.agents/benny/`. adapt [`configuration.example.yaml`](./templates/configuration.example.yaml) and [`feature-map.example.md`](./skills/reproduce-and-fix-issues/references/feature-map.example.md).
5. commit `.agents/automations/benny/` and any secret-free configuration before enabling either automation.
6. stop before live provisioning unless the runtime preflight passes. The current Codex scheduler has no native Slack message trigger. If a future native host supplies it, review each draft, then send a harmless test report and verify every source-channel post stays in the original thread.
