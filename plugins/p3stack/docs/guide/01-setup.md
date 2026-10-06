# Set up P3Stack

In this page you install the plugin, pick which models P3Stack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

P3Stack runs inside T3 Code. The coordinator is a Claude Code or Codex thread, and it needs the `t3-code` MCP server. Install the plugin in each host that you use as the coordinator.

Claude Code:

```text
/plugin marketplace add SiTaggart/agent-kit
/plugin install p3stack@agent-kit
```

Codex:

```bash
codex plugin marketplace add SiTaggart/agent-kit
codex plugin add p3stack@agent-kit
```

Start a fresh thread after installation. In Claude Code, the skills have the `p3stack:` prefix, so translate the guide's `$name` examples to `/p3stack:name`. Codex uses `$name` as written. For local testing from the Agent Kit repository root, use `codex plugin marketplace add .`, or start `claude --plugin-dir <absolute-p3stack-directory>`.

Delegates do not need P3Stack installed. Each brief gives them the absolute paths of the skill files they must read.

## Pick your models

Run:

```text
$setup-pstack
```

[`$setup-pstack`](../../skills/setup-pstack/SKILL.md) reads the live T3 model catalog, asks for a reasoning budget, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It writes optional `~/.agents/p3stack-models.json` overrides that every P3Stack skill reads over the bundled [models.json](../../models.json). No global rule or main-chat model setting changes. The budget caps effort when a delegate starts. It does not replace which model a role uses, and no role uses `max`.

The defaults spread each job across providers. Claude, Codex, and Grok models each take the roles they do best, and the review and design panels run one model from each provider. [The P3Stack README](../../README.md#default-models) lists every role. Each provider must be signed in to T3 Code. Setup replaces any provider that you do not have.

You only override what you care about. A role with no entry in the overrides keeps the bundled default. To restore a default later, delete that role's entry, or just run `$setup-pstack` again. When a bundled default changes, an override written before the change still pins the old value, so delete that role's entry, or delete the file, then run `$setup-pstack` again.

You might be wondering what happens if you want a role on your own chat model. Set it to `inherit-parent` or `auto`, and P3Stack sends that delegate to the coordinator's provider and model. Both values mean the same thing, and neither is a model ID. For a panel role the value is a list, and one delegate runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `$swarm` worker unless a race names a model for each arm.

## Accept the verification offer, or don't

At the end of setup, `$setup-pstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`$create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.agents/skills/verify-<app>/` on Codex or `.claude/skills/verify-<app>/` on Claude, a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `$create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to pstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

The next P3Stack invocation reads the updated model overrides. A new task is needed when installing or changing plugin files, not when editing this separate role configuration.

## Keep the cost in check

pstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Rerun `$setup-pstack` and pick a smaller reasoning budget or cheaper models. A strong model in the main chat with cheaper, faster models in the code roles is a good split.
- Set a role to `auto` or `inherit-parent` so it runs on the coordinator's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `$poteto-mode` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
$poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `$poteto-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. `$poteto-mode` is sticky. It stays on for the conversation until you opt out by saying so.

Next: [Route work through `$poteto-mode`](./02-poteto-mode.md).
