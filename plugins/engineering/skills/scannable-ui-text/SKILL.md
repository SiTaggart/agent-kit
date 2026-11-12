---
name: scannable-ui-text
description: Scannable UI text. Use when writing or reviewing neighboring session titles, feed items, dashboard summaries, or notifications. For collections compared in an interface, not narrative prose.
---

# Scannable UI text

Review the collection as one interface. Optimize for comparison while preserving
what each item means.

## 1. Define the comparison

Identify what the reader needs to distinguish: the task, affected object,
status, outcome, or exception. Inspect the source facts and existing copy
conventions. Account for neighboring fields, width, wrapping, and truncation.
Repeat a badge or column's information only when the string must stand alone.

Resolve missing facts that could change the meaning before rewriting. For
missing display details, use a stated assumption and leave visual fit unverified.

Proceed when you can name the comparison target, point to each item's source,
and list the display constraints or stated assumptions.

## 2. Rewrite the collection

Choose a common pattern around the comparison target. Use an action and object
for task names (`Review billing alerts`), actor and event for activity
(`Mina paused the export`), or an object or status first for triage. Keep
conventional labels as labels. Omit a repeated actor when the interface supplies it.

Put distinguishing words early. If a shared opening hides the difference,
change the collection's pattern. For a reader comparing export status,
`Paused: weekly billing export` is useful. For a reader comparing regions,
`EU invoice export: paused` puts the useful difference first.

Keep structure, terminology, and detail level consistent for equivalent facts.
Vary them to express real differences. Use one term per concept, retaining
separate states such as paused, blocked, and failed.

### Preserve evidence

- Match tense to established state. An imperative title names a task; ongoing
  and completed verbs require evidence of that state. Keep unknown states unknown.
- Preserve scope, negation, uncertainty, conditions, counts, and consequential
  exceptions. Keep `may affect Safari` uncertain and reported defects unconfirmed
  until verified. Use only supported causes, examples, and outcomes.
- Express praise, complaints, requests, and mixed feedback with verbs that match
  their strength. Let the evidence determine sentiment, even on a themed dashboard.
- Include comparable kinds of detail where available. Allow unequal lengths and
  absent details when the evidence differs. Keep decision-changing exceptions
  visible. Move secondary detail only into an existing accessible detail view;
  otherwise retain it or report the space conflict.

For structured strings, preserve keys, interpolation tokens, plural rules,
links, and accessible labels in the existing format.

Finish this pass with a revision for each requested item, mapped to its source.

## 3. Verify and deliver

Compare every revision with its source using the evidence rules above. Then
read neighboring openings together: check that they reveal the useful difference
and that shortening has not created duplicates.

Inspect representative items at their actual displayed width, including the
longest item and an exception. Check wrapping and truncation. When the UI is
unavailable, review the strings together and report visual fit as unverified.
Character counts are a text check, not proof of layout or accessibility.
For repository edits, run the relevant checks defined by the project.

Return proposed replacements mapped to the originals, or apply the requested
edits. Briefly report the common pattern, material exceptions, and unverified
constraints. Keep changes within the requested strings; propose any needed
layout change separately.

Finish when every requested item has been checked for fidelity and comparison,
and every remaining display or validation gap is reported.

## Source

Inspired by Shreya Shankar's [Five Principles for Generating Readable AI Text
in Bulk](https://fsdatalab.github.io/blog/agent-text-at-scale/), Full Stack Data
Lab, October 29, 2026. The examples and validation cases here are original.
