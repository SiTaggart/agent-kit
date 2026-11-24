---
name: llm-wiki
description: Maintain an existing Markdown wiki from source evidence. Use for incremental wiki updates, source ingestion, and wiki health checks that follow the wiki's schema and write boundaries.
---

# LLM Wiki

Use the wiki's schema to turn read-only source material into durable, linked
pages. Work directly with local Markdown files.

## Establish the write scope

1. Identify the wiki root from the request or the project's instructions. If
   the root is ambiguous, resolve it before writing.
2. Read the wiki's maintenance instructions and schema, such as `AGENTS.md`
   and `SCHEMA.md`, and inspect the relevant index and pages. Use their page
   types, locations, frontmatter, link style, and validation rules. If no
   schema file exists, use documented local conventions. Keep the run
   read-only if those conventions leave the write scope unclear.
3. Limit writes to the resolved wiki root and to paths the task and wiki
   rules allow. Preserve source files, schema files, human-maintained pages,
   and locked pages. For protected pages, report the proposed change or use
   the wiki's designated proposal path when the task permits it.

## Apply the update

1. Find the changed sources and the pages they affect. Use an existing
   manifest or watermark when the wiki has one. Read the evidence for each
   claim you plan to add or revise.
2. Update the relevant writable pages in place. Create a page only if it
   meets the wiki's rules for new pages. Preserve unrelated content and
   metadata. Record provenance in the wiki's format and flag conflicts or
   uncertainty that the sources leave unresolved.
3. Update affected links and index entries when the schema calls for them.
   Keep queries and health checks read-only unless the user requests fixes.
   Apply the same write scope to every fix.
4. Read back the changed files. Check required fields, source references,
   changed links, and the write scope. Run the wiki's applicable validation
   if it is available. Record the result in the existing log when required.
   Advance a manifest or watermark only for work covered by its checkpoint
   rules that passed the required validation. Report deferred work and any
   check that could not run.

## Attribution

Based on [Andrej Karpathy's LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f).
Agent Kit adapts the source, wiki, and schema model from
[Ar9av's `obsidian-wiki` skill at revision `e3fae12`](https://github.com/Ar9av/obsidian-wiki/blob/e3fae12fbaf0a8296868d5ecbe7a27c3f7240762/skills/llm-wiki/SKILL.md).
See the [MIT license](LICENSE).
