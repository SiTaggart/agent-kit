# p3stack

> T3 Code port of Lauren Tan's upstream PStack, pinned to `df581122cde17e6e27686b5a448bde23e4ad4318` (v0.15.15). It shares the skills, principles, playbooks, and personas of the [Codex and Claude Code port](https://github.com/SiTaggart/agent-kit/blob/main/plugins/pstack/README.md). Only the runtime differs. [RUNTIME.md](./RUNTIME.md) maps PStack to T3 Code orchestration. This package stops at merge-ready. The user merges.

PStack makes an agent work like a careful engineering team. P3Stack keeps that system, and lets each role use the best model from any provider. The coordinator runs in a Claude Code or Codex thread in T3 Code. Delegates run on Claude, Codex, or Grok through T3's `delegate_task`.

## Requirements

- T3 Code with the `t3-code` MCP server. P3Stack uses `delegate_task`, `t3_thread_launch`, `watch_pull_request`, `schedule_task`, and the thread, preview, and device tools.
- The providers in [models.json](./models.json), signed in to T3 Code: Claude, Codex, and Grok. Run `setup-pstack` to replace any provider that you do not have.

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

Do not install P3Stack and PStack together in Codex. They have the same skill names, and Codex does not add a plugin prefix. Claude Code adds the prefix, so `/p3stack:how` and `/pstack:how` stay separate.

## Use

Start a rigorous task with `/p3stack:poteto-mode` in Claude Code, or `$poteto-mode` in Codex. The mode selects a playbook and runs the other skills when the steps need them. The [PStack README](https://github.com/SiTaggart/agent-kit/blob/main/plugins/pstack/README.md) and [guide](https://github.com/SiTaggart/agent-kit/blob/main/plugins/pstack/docs/guide/README.md) describe every skill and playbook.

## Default models

No role uses `max` reasoning. Grok always uses its fast model. A budget from `setup-pstack` caps effort when a delegate starts. It does not change the stored roles.

| Role | Model | Effort |
|---|---|---|
| feature, refactoring | Claude Opus 5.5 | high |
| bug-fix | GPT-6.1 Sol | high |
| perf-issue, hillclimb | GPT-6.1 Sol | xhigh |
| judgment and prose | Claude Fable 5.1 | high |
| hardest tasks | GPT-6 Astra | high |
| how explainer, why synthesizer | Claude Opus 5.5 | high |
| reflect tooling; reflect judgment, divergent, synthesizer | GPT-6.1 Sol | high |
| how explorer, why investigators, swarm workers | Grok 4.7 Fast | xhigh |
| arena runners, arena cross-judge pool | Opus 5.5, GPT-6.1 Sol, Grok 4.7 Fast | high, high, xhigh |
| architect runners, interrogate reviewers | Fable 5.1, GPT-6 Astra, Grok 4.7 Fast | high, high, xhigh |

`setup-pstack` reads the live T3 model catalog and writes your changes to `~/.agents/p3stack-models.json`.

## What stays out

The PStack guide, the dormant `benny` automation pack, and the Codex session indexer are not part of this package. T3 thread tools replace session history.

## Maintenance

The `sync-pstack` repository skill updates both ports from one upstream sync. The skill tree, personas, and licenses are copies of the PStack port, except `skills/setup-pstack/`. Tests enforce this.

## License

MIT. See [LICENSE](./LICENSE) and [licenses](./licenses/).
