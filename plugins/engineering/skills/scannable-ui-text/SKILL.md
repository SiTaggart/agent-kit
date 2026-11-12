---
name: scannable-ui-text
description: Write or review collections of short UI text that people scan together, such as session titles, activity feeds, dashboard cards, issue summaries, and notifications. Use when neighboring items are hard to distinguish or inconsistent. Not a general prose, documentation, or marketing-copy skill.
---

# Scannable UI text

Make a collection easy to compare without changing what its items mean.
Judge the strings together in their UI, not only as individual sentences.

## Establish the reading task

Inspect the requested strings, their source facts, and the UI context available.
Identify what the reader needs to find or compare: a task, an affected object,
a change, an outcome, or an exception.

Use the product's existing copy conventions. Note the visible neighboring
fields, available width, wrapping, and truncation. Do not repeat information
already clear from a column or badge unless the string must stand alone.

When context is missing, state a reasonable assumption and draft the text.
Ask only when the missing answer could change the meaning. Do not infer that
a session is active, a task succeeded, or a reported cause is confirmed.

## Choose a pattern for the collection

Use a grammatical shape that fits the reading task. These are options, not
templates to impose on every screen:

- Task titles can use an action and its object: `Review billing alerts`.
- Activity items can name the actor and event: `Mina paused the export`.
- Triage items can lead with the affected object or status when that is how
  readers choose what to inspect.

Keep structure, tense, terminology, and detail level consistent where the
meaning is the same. Use a different status or tense when the facts differ.
An imperative task title names work; it does not claim the work is underway.
Use ongoing or completed verbs only when the source establishes that state.

Prefer a subject followed by its action for sentences. Omit a repeated actor
when the UI makes it clear. Keep conventional labels as labels; do not turn
every noun phrase into a sentence.

Use the same term for the same concept. Avoid synonym changes for variety.
Keep different concepts distinct, including paused, blocked, and failed work.

## Put the useful difference early

Compare neighboring items and find the words that distinguish them. Move those
words toward the start without making the sentence hard to parse.

Remove shared filler such as `The report says that`. If a repeated verb hides
the important difference, choose a more useful structure for the collection.
Do not sacrifice a necessary qualifier or change the item to force a pattern.

For example, a status list without separate status badges could change from:

- `The weekly billing export has been paused`
- `The daily billing export has been completed`

To:

- `Paused: weekly billing export`
- `Completed: daily billing export`

If the reader instead searches by export name and status already has a column,
use that context to choose the text order.

## Preserve the evidence

Treat wording differences as information. Extra detail should help the reader
understand a real distinction, rather than reflect arbitrary writing choices.
Do not force equal length or fill absent fields to make items look uniform.

Keep negation, uncertainty, conditions, scope, and consequential exceptions.
`May affect Safari` must not become `Breaks Safari`. Missing evidence does not
mean no problem. Do not upgrade a complaint into a confirmed defect or invent
a cause, count, example, or outcome.

Choose verbs that convey the source's meaning and the screen's purpose. For
feedback, make praise, complaints, requests, and mixed reactions clear without
inflating their strength. Do not make all cards sound positive or negative just
because the dashboard has that theme.

Use the same kinds of detail for comparable cards when the evidence supports
them. Keep an exception visible when it changes the reader's decision. Move
secondary detail only to an existing accessible detail view, or propose that
UI change separately. Do not silently delete it to fit a word budget.

## Check the collection in context

- Compare every revision with its source. Check status, certainty, quantities,
  sentiment, and any qualifiers before judging style.
- Read the first few words of neighboring items. Can the reader tell them
  apart? Check for duplicates introduced by shortening.
- Inspect representative items at the actual displayed width when possible,
  including the longest item and an exception. Check wrapping and truncation.
  A character limit is only a proxy for visual fit, not proof of it.
- If the UI is unavailable, show the strings together and state that visual
  fit is unverified. Do not claim a browser or accessibility check ran.

For repository edits, preserve string keys, interpolation tokens, plural
rules, links, and accessible labels. Follow the existing localization format
and run relevant checks. If the width cannot preserve the meaning, explain
the conflict rather than hiding the qualifier or changing the facts.

## Return the useful result

For a review, show proposed replacements with enough mapping to identify each
original item. For an edit, change only the requested strings and report the
pattern used, important exceptions, and any unverified UI constraints.
Keep the explanation shorter than the work it explains.

This skill owns comparison across UI items. Leave document structure and
general prose editing to the project's writing guidance. It does not require
another plugin or authorize publishing changes.

## Source

Inspired by Shreya Shankar's [Five Principles for Generating Readable AI Text
in Bulk](https://fsdatalab.github.io/blog/agent-text-at-scale/), Full Stack Data
Lab, October 29, 2026. The examples and validation cases here are original.
