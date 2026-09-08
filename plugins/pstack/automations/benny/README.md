# benny

benny provides the sources for two host automations for slack issue reports. Native Slack event triggers are currently unavailable; the pack stays dormant until the runtime preflight passes. one triages each report. the other reproduces confirmed bugs and may prepare a small draft fix.

the files in this directory are dormant setup and automation sources. they do not appear as slash skills.

## set it up

1. point the agent at [`FOR_AGENTS.md`](./FOR_AGENTS.md) and name the target repository.
2. let setup merge this whole directory into the target at `.agents/automations/benny/`. it must preserve destination-only files and review conflicts instead of overwriting local edits.
3. read [the host runtime preflight](./RUNTIME.md). Install PStack through the selected host’s native plugin controls, then verify its shared skills in the exact fresh automation runtime. A local installation alone does not prove that guarantee.

4. keep user-owned configuration outside the copied pack, for example in `.agents/benny/`. adapt [`configuration.example.yaml`](./templates/configuration.example.yaml) and [`feature-map.example.md`](./skills/reproduce-and-fix-issues/references/feature-map.example.md).
5. commit `.agents/automations/benny/` and any secret-free configuration before enabling either automation.
6. stop before live provisioning unless the runtime preflight passes. Scheduled timers alone cannot supply the Slack trigger. If the native host supplies it, review each draft, then send a harmless test report and verify every source-channel post stays in the original thread.
