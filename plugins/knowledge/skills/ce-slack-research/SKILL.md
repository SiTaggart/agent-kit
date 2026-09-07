---
name: ce-slack-research
description: "Use only when the user explicitly asks to search Slack or wants Slack discussions, decisions, or organizational context about a named topic."
---

# /ce-slack-research

Search Slack for organizational context and receive an interpreted research digest.

## Usage

```
/ce-slack-research [topic or question]
/ce-slack-research
```

The input can be a keyword, a natural language question, or include Slack search modifiers like channel hints (`in:#channel`) and date filters (`after:YYYY-MM-DD`). The agent extracts the topic and formulates searches from whatever form the input takes.

## Execution

If no argument is provided, ask what topic to research. Use the platform's blocking question tool (fall back to a question in chat when the tool is unavailable). Never silently skip the question.

Dispatch a fresh, read-only sub-agent using the platform's native delegation tool with a prompt that tells it to read `references/slack-researcher.md` — expanded to an absolute path by the parent — and research the user's topic. Slack digests are context-heavy, so keep the work isolated in the sub-agent; the persona suits a mid-tier model when the platform supports model selection. Do not override the sub-agent's permission mode. The sub-agent handles everything from here — Slack MCP discovery, search execution, thread reads, and synthesis — and returns an interpreted digest. If sub-agents are unavailable, follow the reference file inline and keep the digest short.

If the agent reports that Slack is unavailable (MCP not connected or auth expired), relay the message to the user. Do not attempt alternative research methods.
