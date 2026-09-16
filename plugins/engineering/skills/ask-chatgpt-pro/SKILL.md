---
name: ask-chatgpt-pro
description: Build a focused repository context package with RepoPrompt CE, send it to a Pro model in the ChatGPT website, and return an Oracle-style second opinion. Use when the user explicitly asks to consult ChatGPT Pro, use ChatGPT's website, or use a named Pro model there; do not use for a generic request to consult an external model.
---

# Ask ChatGPT Pro

Use RepoPrompt CE to select and package the smallest sufficient codebase context. Use the authenticated ChatGPT website for reasoning. Return the answer to the current conversation with the source scope and any limits made clear.

## Boundaries

- Treat this as a read-only consultation unless the user separately asks to apply changes.
- Send context only when the user selected ChatGPT's website as the destination. If the requested external provider is ambiguous, resolve it before sending.
- Sending the prompt to ChatGPT is an external disclosure. Include only repositories and files the user placed in scope.
- Never include secrets, credentials, `.env` contents, private tokens, or unrelated personal data.
- Do not claim that the website model avoids Codex usage unless the current ChatGPT product UI or official OpenAI documentation confirms it. Describe it as using the user's ChatGPT plan rather than the Codex task's model.
- Do not silently fall back to an API, Codex CLI, or RepoPrompt's in-app Oracle. If ChatGPT Pro or the requested website model is unavailable, report that exact limitation.

## Workflow

1. Normalize the real question. Remove meta-instructions such as "ask the Oracle" while preserving the requested outcome, constraints, and desired answer form.
2. Identify the correct RepoPrompt compose context with `rpce-cli -e 'windows'`. Match the repository or working directory and record that tab's `context_id`. Do not guess when more than one plausible target exists. Use this `context_id` for every later RepoPrompt command so selection and export cannot drift to another tab.
3. Ask Context Builder to curate the necessary files:

   ```bash
   rpce-cli --context-id <context_id> -e 'builder "Prepare context for: <real question>" --response-type clarify'
   ```

   Allow several minutes. If the result explicitly reports a replacement compose context, adopt its `context_id` and use only that identifier for the remaining steps. If RepoPrompt is unavailable, use direct repository inspection and build a bounded handoff manually. State that fallback.
4. Inspect the resulting selection and prompt. Add only material gaps. For a code review, include the relevant Git diff artifact. Do not send broad folders merely for completeness.
5. Export the package to a temporary file outside the repository. Select the preset that matches the task:

   - `standard` for questions and diagnosis
   - `plan` for architecture or implementation planning
   - `codeReview` for review

   ```bash
   rpce-cli --context-id <context_id> -e 'prompt export "<temporary-path>" --copy-preset <preset>'
   ```

6. Read the export before sending. Confirm that it came from the pinned compose context and contains the real question, enough source context, and no sensitive or unrelated content. If it is too large for the website input, reduce the RepoPrompt selection and export again. Do not truncate files blindly.
7. Open or reuse an authenticated `chatgpt.com` browser tab through the available computer-use browser tool. Start a new chat unless the user explicitly asks to continue an existing consultation. Retain the conversation URL after ChatGPT assigns it.
8. Select the strongest Pro model the user's ChatGPT UI currently exposes. Prefer the exact model the user named. Verify the visible model label after selection. Do not infer it from memory.
9. Put the question first, followed by the exported context. Ask for an evidence-led answer that cites repository paths and distinguishes confirmed facts from assumptions. Send once the model label and prompt are verified.
10. Wait while the UI shows active generation. Capture the complete answer only after generation stops. If the answer visibly ends because of a length limit, ask it to continue in the same chat. Do not send a continuation merely because generation is slow.
11. If submission outcome is uncertain, inspect the existing conversation before retrying so the prompt is not sent twice. Retry an uncertain submission at most once. Stop and report authentication, rate-limit, unavailable-model, or persistent generation failures; do not switch providers or models silently.
12. Return a concise synthesis plus the important technical conclusions. Identify:

    - the ChatGPT model label shown in the UI;
    - the repository and scope sent;
    - the answer or recommendation;
    - uncertainty, missing context, and suggested verification;
    - that no local code was changed, unless the user separately requested implementation.

## Follow-ups

Reuse the same ChatGPT conversation for follow-up questions about the same package. Rebuild and resend context when the working tree, selected files, or task scope materially changes.

Do not treat the external answer as proof. For implementation or review, verify its claims against the live repository before acting.
