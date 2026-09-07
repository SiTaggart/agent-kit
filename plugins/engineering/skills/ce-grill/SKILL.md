---
name: ce-grill
description: "Clarify and stress-test a requirements doc, plan, design, or rough approach through a focused interview. Use when the user wants to be grilled, or before ce-plan when the requirements are too branchy, ambiguous, or strategically important to plan cleanly."
argument-hint: "[requirements doc path, plan path, or topic to stress-test]"
---

# Planning Clarity Gate

Interview me relentlessly about every aspect of this plan until every branch of the design tree has a resolved decision or an explicit deferral — the same readiness bar the Handoff section applies below. Walk down each branch, resolving dependencies between decisions one-by-one. For each question, provide your recommended answer.

Ask the questions one at a time.

If a question can be answered by exploring the codebase, explore the codebase instead. Use `repoprompt` when that codebase question is broad, unfamiliar, or crosses multiple owner boundaries; keep the result as context for sharper questions, not as a plan.

## Loop Role

`ce-grill` is the clarity gate before planning, not a replacement for it. Use it before `ce-plan` for unresolved scope or success criteria, competing product directions, hidden stakeholder or user-flow assumptions, broad work where the next decision affects many downstream units, a requirements doc that feels technically plannable but product-shaky, or a chosen approach that may itself be the constraint. Do not use it for narrow, already-clear tasks — `ce-plan` handles one or two ordinary clarifying questions directly.

## Stress the Frame, Not Just the Details

Apply the global candidate-not-constraint principle to the plan itself: put settled decisions back on the table. If the difficulty traces to an existing structure or prior decision, ask whether you would arrive here building fresh today, and weigh replacement by resulting complexity — a wrong turn already taken is not a reason to keep walking.

## Handoff

When the interview is done, return a compact handoff:

- **Resolved decisions** — what is now settled
- **Remaining open questions** — only blockers that still prevent planning
- **Recommended planning input** — the exact summary or requirements path to pass to `ce-plan`
- **Ready for `ce-plan`** — yes/no, with the reason

Do not write the implementation plan here. Route on the verdict:

- **Ready: yes.** When the caller asked to continue the loop, invoke `ce-plan` directly with the recommended input. When standalone, offer the choice via the platform's blocking question tool (see `../ce-conventions/SKILL.md`) and fire the selection.
- **Ready: no.** Return to the remaining blocker rather than forcing planning.

Always leave a `Done for now` path that ends the turn without planning.
