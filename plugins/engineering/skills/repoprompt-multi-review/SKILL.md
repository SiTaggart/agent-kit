---
name: repoprompt-multi-review
description: Use when a code change needs a higher-confidence review in RepoPrompt, especially before merge or after substantial, subtle, or high-risk changes. Produces one evidence-checked CE report from independent model reviews.
---

# RepoPrompt Multi Review

Use RepoPrompt as the review harness. The calling agent prepares the target and
kickoff prompt; RepoPrompt owns the review and orchestration after handoff.

## Start the review in RepoPrompt

1. Bind RepoPrompt to a context containing the exact repository or worktree.
2. Resolve the absolute path to `../ce-review/SKILL.md` from this skill.
3. Start a top-level `claudeCode:claude-fable-5:high` RepoPrompt session with
   the `Orchestrate` workflow. If that is the current session, reuse it instead
   of starting another Fable session.
4. Send this kickoff prompt, filling in the target and original review request:

```text
You are Fable, the controlling reviewer inside RepoPrompt. Run a multi-model
code review of the target below.

Target: {{absolute repository or worktree path and review target}}
Review request: {{the user's original review request and arguments}}
Review mode: {{the user's requested mode, or deep}}
CE review skill for reviewer agents: {{absolute path to ce-review/SKILL.md}}

Use RepoPrompt tools such as `git`, `context_builder`, `read_file`,
`file_search`, `get_file_tree`, `agent_manage`, and `agent_run` as useful to
understand the target and orchestrate the review. Decide the session tree,
prompts, parallelism, context building, retries, and use of native sub-agents.

Commission independent CE reviews from these exact reviewer agents:
- claudeCode:claude-opus-5:high
- codexExec:gpt-5.6-sol-fast-high
- cursor:grok-4.6[effort=high,fast=true]

In every reviewer brief, tell the reviewer to run the CE review skill against
the same resolved target. Each reviewer may organize the CE personas using its
own available capabilities. Do not reveal one reviewer's findings to another
before its report is complete.

After the independent reports return, validate every candidate against the diff
and live source. Deduplicate findings and apply the CE reproduction rule for
functional claims. Agreement between models is not proof.

This is review-only. Leave the target worktree unchanged; do not commit, push,
post comments, or apply fixes. Clean up sessions and temporary files created by
the run.

Synthesize the validated findings and return your CE-shaped report. Include a
Checks line for Opus, Sol, and Grok. If a required reviewer is unavailable or
fails, report partial coverage rather than silently substituting a model or
presenting an incomplete run as a full multi-model verdict.
```

## After handoff

Let RepoPrompt and its Fable orchestrator run the review. The calling agent may
surface required approvals and wait for completion, but it does not recreate or
override Fable's orchestration. Return Fable's final report to the user.
