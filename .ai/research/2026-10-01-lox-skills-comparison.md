# Lox skills comparison

Recommendation: trial Lox as a separate, explicitly invoked plugin. Keep the current Agent Kit and SESCo skills. The best initial trials are PR descriptions, simplicity review, and drafting plans.

This is a source comparison, not an execution benchmark. “Better” means a better written contract or a better fit for Simon's workflow. It does not mean the skill has produced better results in controlled runs.

## Evidence

- Lox source: [lox/agent-skills at 7c71d80](https://github.com/lox/agent-skills/tree/7c71d80df75666fdbae9e712ac491aa86a21baed). Read all eight requested skills, the two workflow companions, Codex metadata, README, simplicity license, and the PR helper script.
- Installed comparison: Agent Kit Engineering 0.2.10, Git 0.2.2, PStack 0.15.2, SESCo test-audit 0.2.0, Termpower 0.2.0, Ponytail 4.10.0, and Matt Pocock skills 1.2.3+codex.84fdeffd. Read the relevant installed skill files directly.
- Packaging comparison: this Agent Kit checkout at `dfbeebd98af8e6752f3c8c7f9b23d59ae6df9d3d`. Inspected manifests, catalogs, plugin inventory, and packaging tests. The checkout was clean before this report.
- QMD has no Agent Kit collection. RepoPromptCE has no workspace matching this checkout. Used live, exact-path source reads.
- The upstream PR helper passed `bash -n`. No live PR workflow, GitHub mutation, skill benchmark, or installation was performed.

## 1. Writing PR descriptions — stronger candidate

[Upstream skill](https://github.com/lox/agent-skills/blob/7c71d80df75666fdbae9e712ac491aa86a21baed/writing-pr-descriptions/SKILL.md) compared with `git:pr-description`.

Lox has a more complete metadata contract. It checks fresh host metadata, repository templates, the final diff, user-supplied intent, stale claims, and still-accurate human prose. It reads metadata back after an authorized update. It uses closing keywords only when the PR fully resolves the issue. Your installed skill adds a closing reference when the branch or commits identify a ticket, which is a weaker condition.

Lox defaults to brief Why/What prose. Your skill permits a short paragraph but also offers Summary/Changes/Testing. Lox better matches the desired concise style. Its important tradeoff is that routine validation stays out of the public body unless required or unusually useful. Keep verification evidence in the handoff, and preserve repository-required validation sections.

Your current skill is more explicit about Conventional Commit title syntax and ticket IDs. Lox defers to repository conventions, so those rules can remain in the repo instructions. Lox also asks for current UI screenshots when practical, but does not provide your current skill's attachment choreography.

Verdict: trial first. Likely a better base prompt for drafting and refreshing descriptions. Screenshot publication still needs the host's supported upload workflow.

## 2. Writing tests — useful general guidance; keep the stronger local gate

[Upstream skill](https://github.com/lox/agent-skills/blob/7c71d80df75666fdbae9e712ac491aa86a21baed/writing-tests/SKILL.md) compared with `sitaggart:test-audit`, Matt Pocock TDD, and PStack TDD.

Lox covers when a test is worth adding, independent expected values, failed-test diagnosis, assertion changes, consolidation, and proportionate verification in a short prompt. It explicitly protects security, persistence, concurrency, compatibility, boundary, and numerical guarantees. It distinguishes existing behavior from correct behavior and prohibits weakening tests to obtain green checks.

Your test-audit is stronger for Spade and Termpower. It requires a credible failure, missing existing coverage, a real owner boundary, and evidence before deletion. It catches false positives such as mocks that supply the behavior under test and negative controls that fail for the wrong reason. It also specifies local validation and CI selection.

Lox is not a TDD replacement: failing-before evidence is requested “where practical,” rather than a defined red/green loop. Matt Pocock TDD requires confirmation of test seams; Lox carries less interaction overhead. PStack already has a practical bug-focused red/green workflow with explicit evidence reporting.

Verdict: broadly aligned, with better brevity. Useful outside Spade/Termpower or as general guidance. Do not replace the local authoring gate.

## 3. Simplicity review — strongest new review trial

[Upstream skill](https://github.com/lox/agent-skills/blob/7c71d80df75666fdbae9e712ac491aa86a21baed/simplicity-review/SKILL.md) compared with thermo review, Ponytail, `ce-simplify-code`, and PStack deslop.

The remedy ladder is useful: delete speculative work, reuse existing code, use standard or platform features, and add structure only when it reduces the concepts a reader must hold. Each finding must name a concrete smaller replacement and protect required behavior.

Lox is better calibrated than a fixed file-size threshold or net line-count target. It treats file size as a reason to inspect cohesion. It explicitly protects validation, data-loss prevention, accessibility, calibration, and useful observability. This fits the smallest-resulting-system principle particularly well.

It is not wholly new material: upstream attributes this skill to Buildkite/Cursor and Ponytail. Its value is the synthesis and grounding. It also has a useful “already simple” stop condition.

`ce-simplify-code` remains the better execution workflow when changes are authorized: it names preserved timing, ordering, errors, persistence, and UI behavior, then verifies them. PStack deslop also edits code. Lox simplicity review reports findings.

Verdict: preferred candidate for a standalone simplicity lens. Keep the implementation and verification workflow separate.

## 4. General code review — leaner alternative, less explicit verification

[Upstream skill](https://github.com/lox/agent-skills/blob/7c71d80df75666fdbae9e712ac491aa86a21baed/general-code-reviewing/SKILL.md) compared with `ce-review`, Termpower review, and Matt Pocock code review.

Lox composes two clear lenses: ship risk and simplicity. Both read the same target, then findings are deduplicated and checked. It defaults to sequential passes and delegates only when the user requests agents. This is simpler to operate than the installed review orchestration.

Two sequential passes in one agent are separate lenses, not independent reviewer contexts. Do not infer model diversity from that wording.

Your review skills provide stronger explicit verification. `ce-review` includes product intent, taste gates, caller tracing, and attempted functional reproduction. Termpower review tracks eight-pass coverage and asks the parent to prove functional findings. Matt Pocock separates spec compliance from standards, which can expose a clean implementation of the wrong requirement.

Verdict: good fast-review challenger. Keep the current project-aware review for substantial changes until a trial proves equivalent coverage.

## 5. Drafting plans — better fit for bounded work

[Upstream skill](https://github.com/lox/agent-skills/blob/7c71d80df75666fdbae9e712ac491aa86a21baed/drafting-plans/SKILL.md) compared with `ce-plan`.

Lox is compact and evidence-led. It follows existing conventions, updates the owning plan, chooses useful delivery slices, removes stale questions, and adds sections only when needed. Pressure testing scales with risk. This should produce less planning ceremony for ordinary scoped work.

`ce-plan` has stronger large-project handoff machinery: stable unit IDs, requirement and acceptance-example traceability, per-unit test scenarios, context research, and document review. Those contracts support the `ce-work` pipeline. Its root prompt is much longer and invokes several reference workflows.

Verdict: trial as the default for small and medium standalone plans. Keep `ce-plan` where its execution pipeline or cross-cutting traceability is useful. A Lox plan is not automatically a valid `ce-work` plan.

## 6. Auto review — useful new bounded loop

[Upstream skill](https://github.com/lox/agent-skills/blob/7c71d80df75666fdbae9e712ac491aa86a21baed/auto-review/SKILL.md) compared with `ce-quality-gate` plus review and fix workflows.

Lox combines review, triage, fixes, validation, targeted rechecks, and final metadata/docs checks. It caps full reviews at two and fix/recheck rounds at two per pass. A second full review needs a material reason. It does not introduce external Codex review automatically.

This fills a real gap: your quality gate fixes mechanical and taste failures, but explicitly does not replace product review. Your normal review is read-only. Lox provides a compact owner for the review/fix loop.

The tradeoff is authority. Auto review authorizes edits within the requested scope. It can commit and push when asked to carry a PR forward, and its wording permits merging on explicit ship/land/queue requests. Simon's standing no-merge policy and approved-feedback workflow must override that behavior in a local adaptation. Preserve browser/backend proof and taste gates.

Verdict: worth a later opt-in trial. Use local self-review first, before introducing remote PR writes.

## 7. Adversarial code review — useful cheaper lens, not proven stronger

[Upstream skill](https://github.com/lox/agent-skills/blob/7c71d80df75666fdbae9e712ac491aa86a21baed/adversarial-code-reviewing/SKILL.md) compared with the adversarial pass in `ce-review`, Termpower review, and PStack interrogate.

Lox has a strong evidence bar and focuses on reachable production failure: retries, rollback, authorization, data integrity, ordering, concurrency, schema skew, and degraded dependencies. It requests targeted verification when useful and withdraws unsupported findings.

It offers one clear, inexpensive adversarial pass. Your multi-review tools add independent contexts or models, and your local review asks for stronger reproduction evidence. Those are different capabilities, not wording improvements that Lox can replace.

Verdict: aligned and worth trialing as a single focused risk lens. No evidence yet that it catches more bugs.

## 8. Babysitting PRs — more implementation detail, worse fit unchanged

[Upstream skill](https://github.com/lox/agent-skills/blob/7c71d80df75666fdbae9e712ac491aa86a21baed/babysitting-prs/SKILL.md) compared with `git:babysit-pr` and its triage/resolve companions.

Lox handles publication, metadata, CI, conflicts, feedback, current-head review, and Codex state. Its helper paginates review threads and checks reactions and review triggers against the current head. Its bounded fix cycles are useful.

Your babysitter deliberately delegates feedback triage and executes resolutions approved by the user. It leaves merging to the author and continues monitoring until close or merge. Lox can fix, reply, react, resolve, re-request review, and optionally merge within a broader PR request. It is a branch-to-PR workflow as well as a babysitter.

The helper has readiness limits visible in source:

- It counts skipped checks as acceptable and an empty check array yields `all_passed: true`. It does not independently enumerate the expected required checks.
- Top-level Codex actionability uses text patterns; inline Codex actionability treats a non-Codex reply as acknowledgement. These summaries are not proof that feedback was accepted or the defect fixed.
- It uses several API requests, so a final head refresh remains necessary for a consistent handoff.

The skill itself describes the helper as a summary that still needs judgement. These are adoption cautions, not observed incidents. Syntax passed; live behavior was not exercised.

Verdict: retain the current babysitter. Consider selected helper improvements later. Any Lox adaptation must retain no merge/auto-merge/queue and accept/reject decisions before remote feedback writes.

## Concrete trial plugin

Use a separately installable `lox` plugin under `plugins/lox/`, with no global hooks, sticky mode, or change to current skill routing.

First package the six guidance/review skills: writing-pr-descriptions, writing-tests, simplicity-review, general-code-reviewing, drafting-plans, and adversarial-code-reviewing. Include check-docs-updated as a seventh companion because PR-description guidance references it. Add auto-review only when testing the edit loop. Add babysitting-prs and handling-codex-reviews together only for the later PR-workflow trial.

Use explicit invocation metadata (`policy.allow_implicit_invocation: false`) as in the current PStack package. Keep all skill references inside the Lox plugin so its review engine does not silently route into Agent Kit. Distinct plugin identity and descriptions help select the intended skill. Separate installation alone does not prevent overlapping skills from activating.

Preserve upstream names and prompt bodies where possible. Add only small, recorded adaptations for host behavior, project instructions, and authorization. Record the upstream commit and exact local differences. Keep the simplicity-review license and attribution.

There is no repository-wide LICENSE in this snapshot. The README attributes specific derived skills and simplicity-review has its own license. That does not establish a license for every skill. Establish the terms for the remaining material before publishing a redistributed plugin; do not label the whole bundle MIT by inference.

Codex packaging follows `.codex-plugin/plugin.json` plus `.agents/plugins/marketplace.json`. Claude packaging can use its existing manifest/catalog pair. `src/plugin-bundle.ts` and packaging tests enumerate plugin IDs, so adding a directory and catalog entry alone is insufficient. Cursor can be a later host-specific addition.

## Fair comparison

Start with three frozen real examples: one PR description, one bounded implementation plan, and one diff needing simplicity review. Run the current skill and Lox on identical inputs in fresh, isolated sessions with the same model and budget. Keep repository rules equal. Avoid prior findings and automatic companion-skill activation contaminating the comparison.

Judge description accuracy and reviewer usefulness; plan actionability and unnecessary structure; review-supported findings, missed defects, and the quality of the smaller replacement. Track time and interaction overhead. More findings and fewer words are not success metrics by themselves.

Test writing needs a real retained test and independent expected behavior. Auto review needs a disposable local branch and passing checks after the final edit. Babysitting needs representative helper fixtures before any live PR trial.

If results tie, Simon's trust in the author is a reasonable reason to prefer the upstream prompt. Keep specialized local gates where they add demonstrable proof.
