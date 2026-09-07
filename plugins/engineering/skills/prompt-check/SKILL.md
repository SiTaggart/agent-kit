---
name: prompt-check
description: Normalize a consequential or ambiguous request when missing context, boundaries, or proof could materially change the work. Explicit invocation previews the improved prompt.
---

# Prompt Check

Normalize the user's latest request into a compact working contract.

1. Preserve the intended outcome and voice.
2. Add only missing information already available in the conversation or
   workspace that could change the approach.
3. Make the material boundary and proof of done explicit.
4. Surface at most one unresolved question, only when its answer would select a
   substantially different path.
5. If the user explicitly invoked `prompt-check`, return the improved prompt in
   one copyable block and stop.
6. Otherwise, state any material assumption briefly and execute the normalized
   request.

Prefer plain prose. Use labels only when they make the prompt easier to scan.
