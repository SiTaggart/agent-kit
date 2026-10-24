---
name: design-guide
description: Look up grounded UI, accessibility, component, and design-system guidance with the design-guide MCP tool search_design_guidance. Use when a question is about how an interface should look, behave, or be built.
---

# Design guide

Call `search_design_guidance` for a UI, accessibility, component, or design-system question.

Pass the user's question as `query` in plain language. Keep the words that name what the user wants, such as "error messages after form submission".

Set `system` only when the user names a design system. Use that system's id from the tool schema. If the user does not name a design system, leave `system` unset so the results span every system.

Leave `k` unset for a broad best-practice question. Pass a small `k` only when the user wants a quick single answer.

Read each hit. Keep only hits that answer the question. You may judge a hit by its passage or by opening that hit's own `url`. A `score` only ranks the list. Prefer a guidance page over a props table, an API table, or a token table.

Cite only the `source` and `url` of hits you kept from `search_design_guidance` in this turn. A later turn searches again and cites only that turn's hits. You may say that the passage names outside material, such as "Paste points to the ARIA APG". The citation is still that hit's `source` and `url`. Do not web-search for more sources. Do not cite a url the tool did not return. Do not present outside material, or a fact that comes only from model memory, as grounded guidance.

If no hits are left, say that there is no grounded guidance in the indexed design systems. Leave near-misses out of the answer.

When the kept hits come from more than one system, state where those systems agree and where they differ.
