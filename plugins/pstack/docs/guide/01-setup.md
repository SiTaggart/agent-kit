# Set up pstack

In this page you install the plugin, pick which models pstack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

From the Agent Kit repository root containing this port, run:

```bash
codex plugin marketplace add .
codex plugin add pstack@agent-kit
```

Codex confirms the plugin is installed. Start a fresh task after installation. PStack installs alongside Agent Kit and can be enabled or disabled independently through Codex plugin controls.

For a published revision, use `codex plugin marketplace add SiTaggart/agent-kit` instead of the local path. An existing Git marketplace needs `codex plugin marketplace upgrade agent-kit` to fetch a newly published revision; unpublished working-tree changes are available only from the local source.

## Pick your models

Run:

```text
$setup-pstack
```

[`$setup-pstack`](../../skills/setup-pstack/SKILL.md) detects the models you have access to, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It writes optional `~/.codex/pstack-models.json` overrides that every pstack skill reads over the bundled [models.json](../../models.json). No global rule or main-chat model setting changes. The quality-first defaults use Astra with high effort for hard reasoning, xhigh for the hardest tasks, and Sol with high effort for routine work. Panels use Astra, Sol, and Terra with high effort; all three are OpenAI models.

You only override what you care about. A role with no entry in the overrides keeps the bundled default. To restore a default later, delete that role's entry, or just run `$setup-pstack` again.

You might be wondering what happens if you use Auto. Set a role to `inherit-parent` or `auto` and pstack omits the subagent `model` field, so the subagent inherits your parent chat model. Both values mean the same thing, and neither is a model slug. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `$swarm` worker unless a race names a model for each arm.

## Accept the verification offer, or don't

At the end of setup, `$setup-pstack` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`$create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.agents/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `$create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers when it earns its place.

The next PStack invocation reads the updated model overrides. A new task is needed when installing or changing plugin files, not when editing this separate role configuration.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
$poteto-mode add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the todo list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `$poteto-mode` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. `$poteto-mode` is sticky. It stays on for the conversation until you opt out by saying so.

Next: [Route work through `$poteto-mode`](./02-poteto-mode.md).
