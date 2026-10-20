---
name: ce-plan
description: "Create grounded technical plans at the depth the work needs. Use after ce-brainstorm or ce-grill, or directly for planning requests. Capture intent, useful context, constraints, and direction while leaving implementation judgment with the engineer."
argument-hint: "[task description or requirements doc] [output:md|html]"
---

# Plan the Work

Create a plan that helps a capable engineer understand the intended outcome
and make good decisions. Include as much useful information as the work needs.
A small change may need a few paragraphs; a large feature may need substantial
context, rationale, diagrams, and dependencies across systems. Completeness
matters more than brevity. Do not use length targets or cut necessary detail
to keep a plan short.

This skill produces a plan. It does not implement the change, create tickets,
or publish artifacts unless the user has also requested those actions.

## Loop connections

`ce-brainstorm` explores what to build and why. `ce-grill` resolves unclear or
competing scope, success criteria, and consequential design choices. `ce-plan`
turns settled intent into grounded technical direction. `ce-work` implements
and verifies the result.

A prior brainstorm is optional. Plan directly when the goal is clear. Use
`ce-brainstorm` when product intent needs exploration, and `ce-grill` when
unsettled choices need a focused interview before the plan can be sound. If
planning exposes such a gap, resolve it through the relevant skill, then
resume planning from the resulting decisions. Handle ordinary missing facts
here without requiring the full loop.

## Ground the plan

Read the request, applicable project guidance, and any named source or existing
plan. Use a relevant requirements document as the source of product intent.
Resolve ordinary uncertainty from the available context. Ask only when a
missing answer would materially change scope or safety/correctness and cannot
be inferred.

Inspect enough of the current system and its direct consumers to understand
what already works, what must remain true, and which capabilities can help.
Similar responsibilities do not establish equivalent behavior. When the
proposed direction depends on that equivalence, verify it or keep the design
conditional until implementation resolves the material differences.
Use `repoprompt` for broad codebase context and `qmd-knowledge-base` when prior
decisions could change the approach. Use current official sources when an
external contract matters. Research should inform direction; routine discovery
can continue during implementation. State a material evidence gap honestly.

## Write the plan

Outcome, constraints, useful context, and direction are ingredients, not
required headings or quotas. Choose prose, bullets, or a diagram when it helps
the reader. Make the intended change and its reason clear early.

Preserve explicit user requirements and real contracts imposed by consumers,
storage, protocols, or other external boundaries. Keep them distinct from
recommendations and unknowns. An agent's assumption does not become a
requirement because it appears in a plan. Link to the origin when useful
instead of copying its entire requirements list. Retain source IDs where
needed for traceability; do not invent IDs for new requirements or work units.

Explain the current capabilities and constraints that change the engineer's
choices. Include the references needed to understand important contracts and
design choices. Avoid exhaustive file lists, repeated code links, and research
transcripts. Detailed evidence can live separately when that makes it easier
to use; the plan itself must contain the context needed to act.

Offer direction and its reason without fixing helper names, types, modules,
file edits, or implementation units in advance. Leave routine investigation,
implementation details, sequencing, and appropriate verification to the
implementer. Include a specific proof obligation only when it protects a real
contract or addresses a consequential uncertainty.

Treat the current architecture and any proposed replacement as candidates.
Where feasibility is unproven, say so. Do not make adopting a proposed design
an acceptance criterion. Keep unresolved choices only when they change scope
or safety/correctness; ordinary engineering choices need no question catalog,
investigation-strategy section, or decision-criteria framework.

Keep concrete migration constraints when this change needs them: for example,
old readers may need to read new writes during a mixed-version deployment.
Do not add generic rollout, rollback, stakeholder, or approval sections. A
specific operational dependency can be stated directly without a new framework.

## Review for usefulness

Check the plan against the request and its sources. Can a capable engineer
tell what must be true, why it matters, and where judgment remains open?
Remove content that does not change their decisions.

Use `document-review` when requested or when an independent document pass would
resolve a material concern. Review findings are advice: verify them and retain
only what changes the accepted outcome, a real constraint, or consequential
uncertainty. Do not append every concern as a permanent requirement or add
sections merely to satisfy a review rubric. Report a scope-changing decision
to the user rather than silently settling it.

## Save and hand off

For a repository planning request, save the plan in `.ai/plans/` unless the
user requested chat-only output or another destination. Read
[plan-sections.md](references/plan-sections.md) for file naming,
format selection, and compatibility with existing plans. Read the result back
before reporting it ready.

Finish with the path and any consequential unresolved choice or evidence gap.
Planning is complete when the usable plan is delivered. A next-step menu,
approval checkpoint, automatic deepening pass, or implementation handoff is
not required. If the user already asked to continue into implementation, pass
the plan to `ce-work`; otherwise leave that decision with the user.

For non-code planning, use the same judgment with a form suited to the task,
such as an itinerary or research brief. If the user asks for an answer, inspect
the relevant sources and answer instead of saving a planning scaffold. If they
ask only for an approach before doing the work, deliver that approach and hold
at the requested boundary.
