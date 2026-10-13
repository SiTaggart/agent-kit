# p3stack

> T3 Code port of Lauren Tan's upstream PStack, pinned to `1b6d44ff26d4e242f4e8f68c391e6d2f7ca16def` (v0.15.20). It carries the upstream skills, principles, playbooks, personas, and guide. [RUNTIME.md](./RUNTIME.md) maps PStack to T3 Code orchestration. This package stops at merge-ready. The user merges.

PStack makes an agent work like a careful engineering team. P3Stack keeps that system, and lets each role use the best model from any provider. The coordinator runs in a Claude Code or Codex thread in T3 Code. Delegates run on Claude, Codex, or Muse through T3's `delegate_task`.

## Requirements

- T3 Code with the `t3-code` MCP server. P3Stack uses `delegate_task`, `t3_thread_launch`, `watch_pull_request`, `schedule_task`, and the thread, preview, and device tools.
- The providers in [models.json](./models.json), signed in to T3 Code: Claude, Codex, and Muse. Run `setup-pstack` to replace any provider that you do not have.

Delegates do not need P3Stack installed. Each brief gives absolute paths to the skill files that the delegate must read.

## Install

Install P3Stack in the hosts that you use as the coordinator.

Claude Code:

```text
/plugin marketplace add SiTaggart/agent-kit
/plugin install p3stack@agent-kit
/p3stack:setup-pstack
```

Codex:

```bash
codex plugin marketplace add SiTaggart/agent-kit
codex plugin add p3stack@agent-kit
```

## Use

Start a rigorous task with `/p3stack:poteto-mode` in Claude Code, or `$poteto-mode` in Codex. The mode selects a playbook and runs the other skills when the steps need them. The [guide](./docs/guide/README.md) walks through a first task and describes the skills and playbooks. When you are not sure which skill fits, type `$poteto-help` with your question.

## Default models

No role uses `max` reasoning. If you pick Grok in `setup-pstack`, it always uses its fast model. A budget from `setup-pstack` caps effort when a delegate starts. It does not change the stored roles.

| Role | Model | Effort |
|---|---|---|
| feature, refactoring | Claude Opus 5.5 | high |
| bug-fix | GPT-6.1 Sol | high |
| perf-issue, hillclimb | GPT-6.1 Sol | xhigh |
| judgment and prose | Claude Fable 5.1 | high |
| hardest tasks | GPT-6 Astra | high |
| how explainer, why synthesizer | Claude Opus 5.5 | high |
| reflect tooling; reflect judgment, divergent, synthesizer | GPT-6.1 Sol | high |
| how explorer, why investigators, swarm workers | Muse Wonder 1.0 | high |
| arena runners, arena cross-judge pool | Opus 5.5, GPT-6.1 Sol, Muse Wonder 1.0 | high, high, high |
| architect runners, interrogate reviewers | Fable 5.1, GPT-6 Astra, Muse Wonder 1.0 | high, high, high |

`setup-pstack` reads the live T3 model catalog and writes your changes to `~/.agents/p3stack-models.json`.

## What stays out

The upstream `benny` automation pack is not part of this package. T3 thread tools give session history, and `schedule_task` and `watch_pull_request` replace event automations. For sessions outside T3, the poteto-mode `harness-sessions.py` script reads the Codex, Claude Code, and Grok Build session stores.

## Maintenance

P3Stack is the maintained PStack port in this repository. The [`sync-p3stack`](../../.agents/skills/sync-p3stack/SKILL.md) repository skill merges each upstream release into it. That skill is not part of this plugin. `tests/p3stack-plugin.test.ts` checks the pin, the versions, the skill contracts, and the model defaults.

## License

MIT. See [LICENSE](./LICENSE) and [licenses](./licenses/).
