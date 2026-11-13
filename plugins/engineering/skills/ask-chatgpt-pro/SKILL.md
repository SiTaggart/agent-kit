---
name: ask-chatgpt-pro
description: Build a focused repository context package, send it to a Pro model in the ChatGPT website, and return an Oracle-style second opinion. Use when the user explicitly asks to consult ChatGPT Pro, use ChatGPT's website, or use a named Pro model there; do not use for a generic request to consult an external model.
---

# Ask ChatGPT Pro

Select and package the smallest sufficient codebase context. Use the authenticated ChatGPT website for reasoning. Return the answer to the current conversation with the source scope and any limits made clear.

## Boundaries

- Treat this as a read-only consultation unless the user separately asks to apply changes.
- Send context only when the user selected ChatGPT's website as the destination. If the requested external provider is ambiguous, resolve it before sending.
- Sending the prompt to ChatGPT is an external disclosure. Include only repositories and files the user placed in scope.
- Never include secrets, credentials, `.env` contents, private tokens, or unrelated personal data.
- Do not claim that the website model avoids Codex usage unless the current ChatGPT product UI or official OpenAI documentation confirms it. Describe it as using the user's ChatGPT plan rather than the Codex task's model.
- Do not silently fall back to an API or Codex CLI. If ChatGPT Pro or the requested website model is unavailable, report that exact limitation.

## Workflow

1. Normalize the real question. Remove meta-instructions such as "ask the Oracle" while preserving the requested outcome, constraints, and desired answer form.
2. Find the smallest sufficient context. Use search, direct reads, and LSP tools. For a broad or unfamiliar area, use the `repo-research-analyst` skill or a read-only exploration sub-agent to find the files that matter. For a code review, include the relevant Git diff. Do not send broad folders merely for completeness.
3. Write the package to a temporary file outside the repository. Put the real question first. Then state the task type (question, plan, or review), the scope, and the answer form you want. Then add each file under a heading with its repository path, in a fenced code block. For a large file, include only the relevant line ranges and state each range in its heading.
4. Read the package before sending. Confirm that it contains the real question, enough source context, and no sensitive or unrelated content. If it is too large for the website input, remove the least relevant files or narrow the line ranges, then write it again. Do not truncate files blindly.
5. Open or reuse an authenticated `chatgpt.com` browser tab through the available computer-use browser tool. Start a new chat unless the user explicitly asks to continue an existing consultation. Retain the conversation URL after ChatGPT assigns it.
6. Select the strongest Pro model the user's ChatGPT UI currently exposes. Prefer the exact model the user named. Verify the visible model label after selection. Do not infer it from memory.
7. Ask for an evidence-led answer that cites repository paths and distinguishes confirmed facts from assumptions. Send the package once the model label and prompt are verified.
8. Wait while the UI shows active generation. Capture the complete answer only after generation stops. If the answer visibly ends because of a length limit, ask it to continue in the same chat. Do not send a continuation merely because generation is slow.
9. If submission outcome is uncertain, inspect the existing conversation before retrying so the prompt is not sent twice. Retry an uncertain submission at most once. Stop and report authentication, rate-limit, unavailable-model, or persistent generation failures; do not switch providers or models silently.
10. Return a concise synthesis plus the important technical conclusions. Identify:

    - the ChatGPT model label shown in the UI;
    - the repository and scope sent;
    - the answer or recommendation;
    - uncertainty, missing context, and suggested verification;
    - that no local code was changed, unless the user separately requested implementation.

## Follow-ups

Reuse the same ChatGPT conversation for follow-up questions about the same package. Rebuild and resend context when the working tree, selected files, or task scope materially changes.

Do not treat the external answer as proof. For implementation or review, verify its claims against the live repository before acting.
