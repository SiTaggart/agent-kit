---
name: qmd-knowledge-base
description: Preflight non-trivial tasks against this machine's indexed knowledge base (~12k markdown docs of wikis, specs, decisions, prior plans, and session retros) when prior decisions, product intent, ownership, conventions, expected behavior, or known failures could change the correct solution—even when the prompt does not request history. Skip only mechanical work fully defined by live source. Routes searches to relevant collections and classifies evidence authority; use the installed QMD surface for query mechanics.
---

# QMD Knowledge Base Router

## Purpose

Route machine-specific QMD context by deciding whether indexed knowledge is relevant, which collections fit the task, and how to interpret the evidence returned.

Use the installed QMD CLI or its companion skill for query construction, search modes, retrieval commands, retries, setup, and health checks. This skill does not duplicate that tool contract.

Read [`references/collections.md`](references/collections.md) when working in a mapped project or when specialized evidence such as tests, SQL, descriptors, tooling, or prior plans may matter.

## Routing Workflow

### 1. Identify the evidence needed

Start from the task, not its wording. Identify the repository, product area,
symbols, and decision before selecting collections. Use QMD when indexed
context could change what correct means; uncertainty is enough. Mechanical work
fully defined by live source can proceed without it.

Classify the evidence needed:

| Need | Evidence to seek |
|---|---|
| Product intent, architecture, or usage | Current docs and curated wikis |
| Current implementation | Live source and configuration |
| Expected behavior | Tests plus live implementation |
| Database structure | SQL plus the code that consumes it |
| Integration metadata | Descriptors plus consuming source |
| Shared dependency behavior | Local-library source and call sites |
| Historical reasoning | `.ai` or prior-agent material, verified against current sources |

### 2. Select only relevant collections

For Spade and Termpower work, use the catalog's task routes and start with the smallest set that can answer the question. Add specialized opt-in collections only when the task crosses that evidence boundary.

For an unmapped repository:

1. Use the installed QMD CLI or its companion skill to inspect the live collection inventory.
2. Select a collection only when its source clearly matches the current project or supplies shared organizational context relevant to the task.
3. If no collection clearly matches, skip QMD and continue with live files and RepoPromptCE.

Never search unrelated Spade or Termpower collections merely because they are available.

### 3. Search and retrieve through `qmd`

Hand the selected collections and evidence need to the installed QMD surface. Treat snippets as leads, not complete evidence. Retrieve the full relevant result before relying on it for a substantive claim.

If the first result is weak, let `qmd` vary the query or search mode before broadening the collection set. Expand collection scope only when the missing evidence has a concrete reason to live elsewhere.

### 4. Verify at the owner source

QMD is an index and may lag behind uncommitted work or the latest source update. Verify drift-prone and implementation-level details against the live owner before planning, editing, or reporting them.

Authority depends on the claim:

| Claim | Owner source |
|---|---|
| Current implementation or configuration | Live working-tree source and config |
| Asserted behavior | Tests, checked against the implementation they exercise |
| Schema or query contract | SQL and its consuming code |
| Descriptor or static metadata contract | Descriptor files and their consumers |
| Product intent and supported usage | Current docs, decisions, and curated wikis |
| Historical reasoning | `.ai` and prior-agent material, never current authority by itself |

There is no single global ranking that makes one evidence type authoritative for every claim.

## Boundaries

- Do not administer, create, repair, or auto-index collections from this skill.
- Do not restate QMD commands, query syntax, search-mode selection, or retry mechanics here or in the collection catalog.
- Do not treat generated snippets or historical plans as proof of current behavior.
- Do not block an otherwise grounded task when no relevant collection exists.

## Completion Check

Before relying on QMD context:

- The selected collections match the current project and evidence need.
- Specialized opt-in evidence was included only when relevant.
- The full relevant result was retrieved.
- Drift-prone details were verified against the live owner source.
- Historical context was labeled as historical.
