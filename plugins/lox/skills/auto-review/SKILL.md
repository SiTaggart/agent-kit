---
name: auto-review
description: Iteratively reviews and improves the current PR or branch with adversarial and simplicity passes, fixing grounded issues, validating, and re-reviewing until the local change is review-ready or blocked. Use when asked to auto-review, self-review and fix, harden, polish, or get a PR ready.
disable-model-invocation: true
---

Read [LOX runtime guidance](../../RUNTIME.md) before this workflow.

# Auto Review

Drive a review-fix-validation loop for a current PR or branch. Use `adversarial-code-reviewing` and `simplicity-review` directly as the review engine; unlike a normal review, act on grounded ship-risk and simplicity findings and re-check fixes until confidence is high.

## Review Engine

- Read [adversarial-code-reviewing](../adversarial-code-reviewing/SKILL.md) and [simplicity-review](../simplicity-review/SKILL.md).
- Run both lenses sequentially over the same target in the current agent. Keep both review passes read-only.
- Deduplicate findings that share a root cause. Check disagreements against the code and omit unsupported concerns. Keep distinct material evidence from each lens.
- Each finding must name a file and line, the consequence, and the smallest concrete remedy. Record checked and deferred areas when they affect confidence.
- `auto-review` owns the bounded outer loop, fixes, validation, and targeted rechecks.

Keep final-readiness checks focused:

- For every existing PR target, use [writing-pr-descriptions](../writing-pr-descriptions/SKILL.md) against the final diff after the last code edit. Update stale metadata when the requested workflow authorizes PR updates; otherwise report it as needing attention.
- Inspect whether the final diff changes durable behavior, commands, configuration, APIs, plans, examples, or runbooks. Check the relevant repository docs against the final diff and update them when authorized. Use the owning plan and [drafting-plans](../drafting-plans/SKILL.md) when plan scope or decisions change. Otherwise state briefly why docs are not required.

## Operating Contract

- Treat the current PR or branch diff as the target unless the user names a different PR, commit range, or file set.
- Preserve caller, platform, or connector-required output formats. If a caller requires structured review output, adapt the loop summary to that format.
- Do not spawn sub-agents unless the user explicitly asks for sub-agents, parallel agents, delegated review, or parallel review work. Both review lenses run in the current agent by default.
- Keep review passes read-only. Make edits only after synthesizing findings and deciding which fixes are grounded and in scope.
- Respect user work: inspect `git status` before editing, do not revert unrelated changes, and do not absorb unrelated dirty files into commits.
- Do not claim high confidence while validation is failing or material findings remain unresolved.

## Remote Feedback Boundary

- Perform the review loop locally. Do not request bot reviews, post replies or reactions, or resolve review threads from this skill.
- For existing review feedback, propose accept/reject decisions and return them to the caller before editing or changing remote state.
- A local clean pass does not establish remote CI, review approval, or merge readiness. Report those states separately when relevant.

## Target Discovery

1. Read repository instructions and current state: `AGENTS.md`, `git status`, branch name, remotes, and existing PR metadata when available.
2. Identify the intended base revision. Use an explicit caller-supplied base when present. For a PR, use the fresh PR base SHA from the host. Otherwise fetch remote metadata and use the merge-base with `origin/<default-branch>`. Use another upstream only when it is verified as the intended base; the remote copy of the feature branch is not its review base. Keep the same base through the loop unless the intended base changes.
3. For a PR target, verify that the checked-out branch and `HEAD` match the PR branch and current head SHA before editing. If they do not match, keep inspection read-only and stop with `blocked`. Report the mismatch; do not switch branches, discard work, or push the current checkout as a fix for that PR.
4. Inspect the full target diff plus changed tests and surrounding call sites. If the target cannot be identified, ask one concise question.
5. Record pre-existing dirty files before editing so the loop can keep its own changes separate.

## Review-Fix Loop

Use at most two full review passes. Within each full pass, use at most two fix-and-targeted-recheck rounds.

1. Full review: run the adversarial and simplicity lenses over the exact target, then synthesize their grounded findings. Capture checked and deferred areas. Continue only with findings that meet the evidence bar.
2. Triage: convert findings into actions. Fix critical, high, and medium findings that are grounded, reachable, and in scope. Fix low findings only when they are cheap or clearly quality-relevant. Defer out-of-scope, pre-existing, or speculative concerns with evidence.
3. Patch: make narrow edits following repository patterns. Prefer deleting or simplifying code over adding layers.
4. Validate: run the smallest meaningful tests or lints first, then broader repo validation as needed. Use local project commands such as `mise`, package scripts, and language tooling before inventing new commands.
5. Targeted recheck: review the fixes, original findings, affected call sites, tests, and likely blast radius with the relevant review lenses. Do not rerun the entire broad review merely because the diff changed.
6. Repeat the fix and targeted-recheck round once when material findings remain and another focused fix is justified.
7. Run a second full review only when the fixes materially changed the structure or behavior of the diff, the targeted recheck exposed cross-cutting risk, or material findings remain after the first pass's rounds.

Each recheck must be fresh and read-only. Passing tests alone is not a recheck. If a fix changes the shape of the diff, expand the recheck to affected call sites and tests rather than assuming prior coverage still applies.

## Stop Conditions

Stop with `ready` only when all are true:

- the latest applicable full review and targeted recheck have no material findings after synthesis;
- relevant validation passes, or any skipped validation is explicitly justified;
- no unresolved critical, high, or medium findings remain;
- PR title/body are current when metadata updates are in scope; otherwise stale metadata is explicitly reported as an external follow-up;
- relevant docs/plans are current or explicitly not required;
- low-risk follow-ups are either fixed or clearly documented as non-blocking;
- the final diff has been reviewed after the last edit.

Stop with `needs-attention` when fixable material findings remain but the user-set budget, review budget, or loop limit prevents another useful iteration, or when an in-scope metadata update remains unfinished. Report exactly which findings remain actionable.

Stop with `blocked` when:

- the same finding recurs after two serious fix attempts;
- validation fails for a cause outside the current change and cannot be isolated;
- target or intended base information is unavailable, the checkout does not match the PR target, or credentials required for an in-scope action are unavailable;
- a fix requires product, security, migration, or rollout decisions the user has not supplied.

Apply stop states in this order: `blocked`, then `needs-attention`, then `ready`. A partial approval cannot override a blocker, and reaching the two-pass or per-pass round cap with material findings remaining is `needs-attention`.

## Git and PR Handling

- Commit and push only when the user asked to update a PR, prepare it for review, or otherwise carry the branch forward. Follow repository commit and signing instructions.
- Stage only files changed for this loop.
- If pushing, use the current PR branch and avoid rewriting history unless the user requested it or repository policy permits it.
- Never merge, enable auto-merge, or use a merge queue. Return the verified branch or PR to the user.
- Report remote feedback and CI blockers to the caller. They do not add a dependency on another workflow skill.

## Output

Final response:

1. State `Status: ready | needs-attention | blocked`.
2. Summarize review iterations and fixes briefly.
3. List validation commands and results.
4. Call out residual risks or deferred items.
5. Include branch, commit, and PR details when commits or pushes were made.
