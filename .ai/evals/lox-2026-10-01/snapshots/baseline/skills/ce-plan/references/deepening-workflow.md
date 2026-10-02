# Deepening Workflow

The confidence-check execution path (5.3.3–5.3.7). Load only when the 5.3.2 gate determines deepening is warranted.

## 5.3.3 Score Confidence Gaps

Checklist-first, risk-weighted. Per section: count checklist triggers, +1 when the topic is high-risk and the section is materially relevant, +1 for critical sections (Key Technical Decisions, Implementation Units, System-Wide Impact, Risks & Dependencies, Open Questions) in Standard/Deep plans. A section is a candidate at 2+ points, or 1+ in a high-risk domain when materially important. Strengthen only the top few sections; on an already-`deepened:` plan, prefer sections not yet strengthened.

**Section checklists (rubrics — hand these to the verifier agents):**

**Requirements**
- Vague or disconnected from implementation units; success criteria missing or not reflected downstream
- Units don't clearly advance the traced requirements; origin requirements not carried forward
- Origin A/F/AE IDs (when supplied) not preserved where planning decisions touch them, or referenced inconsistently

**Context & Research / Sources**
- Cited patterns, learnings, or references never shape a decision or unit
- High-risk work lacks appropriate grounding; research is generic rather than tied to this repo and plan

**Key Technical Decisions**
- A decision stated without rationale, or rationale without tradeoffs and rejected alternatives
- The decision doesn't connect to scope, requirements, or origin context; an obvious fork is never addressed

**Open Questions**
- Product blockers hidden as assumptions; planning-owned questions wrongly deferred to implementation
- Resolved questions with no basis; deferred items too vague to be useful later

**High-Level Technical Design (present)**
- Wrong medium; implementation code instead of pseudo-code; missing non-prescriptive framing; disconnected from KTDs and units

**High-Level Technical Design (absent — Standard/Deep only)**
- The work involves DSL/API-surface design, multi-component integration, complex data flow, or state-heavy lifecycle that a sketch would make easier to validate

**Implementation Units**
- Dependency order unclear or wrong; file/test paths missing; units too large, too vague, or micro-stepped
- Approach notes thin or pattern-less; test scenarios vague, category-skipping, or disproportionate; feature-bearing units without real scenarios
- Verification not expressed as observable results; U-IDs renumbered (stability rule violated); origin F/AE IDs uncited where a unit realizes them

**System-Wide Impact**
- Missing affected interfaces, callbacks, entry points, or parity surfaces; underexplored failure propagation; absent state-lifecycle/caching/data-integrity risks; weak integration coverage for cross-layer work

**Risks & Dependencies / Documentation / Operational Notes**
- Risks without mitigation; missing rollout/monitoring/migration/support implications where warranted; unstated dependency assumptions; obviously applicable security/privacy/performance/data risks absent

Use the plan's own Context & Research and Sources as evidence: a cited pattern that never affects a decision, unit, or verification is itself a confidence gap.

## 5.3.4 Report and Dispatch Targeted Research

Report what is being strengthened and why in one line ("Strengthening [sections] — [reason each]"). Then hand each selected section's checklist — with the section text, why it fired, the plan depth and risk profile, and a specific question to answer — to a verifier sub-agent of your choosing; scale the agent count to plan size and gap severity. Match the persona to the information need — spawn a sub-agent per `../../ce-conventions/SKILL.md` §Sub-agent dispatch that loads the named skill or reads the named persona file (expanded to an absolute path by the parent): repo grounding (the `repo-research-analyst` skill, scoped), institutional knowledge (the `learnings-researcher` skill), external docs or patterns (the `docs-researcher` skill), landscape/prior art (the `web-researcher` skill), flow completeness (`spec-flow-analyzer.md` in this directory), design integrity (`../../ce-review/references/reviewers/architecture-strategist.md`), consistency/duplication (`../../ce-review/references/reviewers/maintainability.md`), history (the `git-history-analyzer` skill); use an installed security companion when available for security guidance and keep migration/persistent-data analysis in the parent. Instruct each agent to return findings that change planning quality — stronger rationale, sequencing, verification, risk treatment, or references — with no implementation code and no shell commands.

## 5.3.5 Execution Mode

Default to direct returns. Use artifact-backed mode only when inline returns would create real context pressure (many agents with meaningful findings, long section excerpts, bulky source-backed analysis). For artifact-backed mode, create one per-run OS-temp scratch dir (`mktemp -d -t plan-deepen-XXXXXX`), pass the resolved absolute path to each agent, and have each write one compact artifact (target section, why selected, 3-7 findings with source-backed rationale and the plan change each implies) plus a short completion summary. Re-run or fall back to direct reasoning for missing/malformed artifacts.

## 5.3.6 Run Targeted Research

Launch selected agents in parallel (sequential if the platform can't); do not override the sub-agents' permission mode — the user's permission settings apply. Prefer local repo and institutional evidence first; read the origin document more carefully before dispatching external agents when that would close the gap. On conflicts: repo/origin-grounded evidence beats generic advice; official docs beat secondary summaries for library behavior; record real remaining tradeoffs explicitly in the plan.

## 5.3.6b Interactive Finding Review (Interactive Mode Only)

Skip in auto mode. Present each agent's findings concisely — target section, what it found, the evidence, the implied plan change — one agent at a time so the user decides independently. Ask Accept / Reject / Discuss via the blocking question tool (see `../ce-conventions/SKILL.md`); after discussion, get a deliberate accept-or-reject. Carry only accepted findings to 5.3.7.

If nothing was accepted, report "No findings accepted — plan unchanged", skip 5.3.7, and still return to SKILL.md 5.3.8 — markdown plans pass through document-review even when deepening changed nothing.

## 5.3.7 Synthesize and Update the Plan

Strengthen only the selected sections; keep the plan coherent. Deepening may tighten as well as grow — collapse multi-idea sentences, drop hedges, delete superseded text in place. Allowed: stronger rationale, tighter requirements trace, reordering/splitting units (**never renumbering existing U-IDs** — that breaks ce-work references), added pattern references and file/test paths, expanded impact/risk treatment where justified, reclassified open questions, strengthened or added HTD and per-unit design fields, and a `deepened: YYYY-MM-DD` frontmatter stamp on substantive improvement.

Do not: add implementation code (pseudo-code sketches allowed), git/test command choreography, or generic "Research Insights" subsections; rewrite the plan from scratch; or invent product requirements or scope changes silently. If research reveals a product-level ambiguity, record it under Open Questions and recommend `ce-brainstorm` when it is truly product-defining.
