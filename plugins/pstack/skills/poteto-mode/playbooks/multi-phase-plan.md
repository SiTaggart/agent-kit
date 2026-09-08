### Multi-phase or multi-PR plan

Read the installed plugin's [CODEX.md](../../../CODEX.md) first. Its native tool, model, path, and session-authorization rules apply. The user merges; this port never merges, enables auto-merge, or enters a merge queue.

**You own the plan, not the code. The plan is a checklist an owner runs box by box and the operator audits from the evidence.** The plan is the deliverable. Do not implement.

1. When the change is one or two files with an obvious approach, skip the plan. Say so and stop.
2. Settle open questions by prototype before you write. Run `playbooks/prototype.md` for each. Keep the branch, the SHA, and the screenshots for Appendix A. Ask the operator only about a product or preference call that no run can settle. Give options (the **never-block-on-the-human** principle skill).
3. Explore in native Codex subagents, passing the absolute installed `references/agents/poteto-agent.md` persona path and the adapter path in each brief, and resolve the `swarm workers` model role per CODEX.md (the **guard-the-context-window** principle skill). Each returns file pointers, conventions, test commands, and entry points. No inlined dumps.
4. Copy the skeleton below into the plan file and fill every placeholder. Unless the operator names a path, write the file under the consuming repository's `.ai/plans/`. Keep every heading and every sub-block in the order shown. One section per PR. One PR is one change with its own evidence (the **sequence-verifiable-units** principle skill). Name the execution playbook in **How to read this**. Pick between `playbooks/autopilot-full.md` and `playbooks/autopilot-stack.md` per the rule at the end of `playbooks/autopilot-stack.md`. A standing program takes `playbooks/orchestrate.md`.
5. Write under `/technical-writing` in full, then `/unslop`. The body is one Diátaxis mode, how-to. Appendices hold explanation and reference. Each heading states the task or the finding. No long dashes. No mid-sentence colons.
6. Run `node pstack/skills/poteto-mode/scripts/check-plan.mjs <plan.md>` and fix every line it prints (the **encode-lessons-in-structure** principle skill).
7. Hand back. Post the plan path and the script's output, then stop. Execution starts on the operator's explicit go, under the execution playbook the plan names.

**Verification.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked (the **prove-it-works** principle skill). That sentence is the verification rule. Every verification block opens with it. The live block is mandatory. Ten lanes using the `swarm workers` role at the PR head, scheduled within the current native concurrency limit, drive the real surface through its control skill, per the **swarm** skill. Each lane is one box with a concrete scenario, the screenshot it saves, and its pass predicate. One lane is the **Regression lane against trunk.** It runs the same load-bearing scenario on trunk and head. If trunk does not have the feature, the lane records that fact and gates the behavior the diff adds plus the end state the user waits for instead of inventing a trunk result. The perf gate is dual-sided. Trunk and head must both produce the named metric. If trunk lacks the feature, also isolate the work the diff adds and set an absolute budget for that work plus the end-to-end state the user waits for. Do not claim a ratio between unlike scenarios. The perf block names the metric, the interleaved probe, the trunk baseline measured first, and the rule with the number that fails. A PR that changes an interaction is review-gated. The operator reviews it in chat with screenshots and a video before merge. A PR that changes no interaction writes `**Review gate.** None. <PR id> is not review-gated.` and no boxes under it.

**Control skill.** Pick it by surface. Browser, Electron, and web UIs use `browser-use` bundled with this plugin. CLIs and TUIs use `control-cli` bundled with this plugin. Native mobile uses whatever simulator-driving skill the repo has. A PR that touches two surfaces gets lanes on both. A surface with no control skill is a risk in Appendix C, and its live block still names how each lane drives it.

````markdown
# <Program> plan

<Under ten lines. What changes, for whom, the rule the program enforces, and the PR ids in order.>

## How to read this

One box is one unit of work. Every box names the evidence that checks it. A nested box is a sub-step of the box above it. Check a box only when its evidence exists, a file, a log line, a screenshot, a test run, or a SHA. The body is a how-to. The appendices explain and record.

The program runs `<absolute-plugin-root>/skills/poteto-mode/playbooks/<execution playbook>.md`. The operator merges every PR. <Which PR ids are the operator's review items.>

Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

## Program checklist

### Arm the program

- [ ] State the protocol and this plan to the operator, then stop. Start execution only on her explicit go.
- [ ] On her go, record the program objective with this exact text. "<The plan path, the PR ids in order, the verification rule, who merges, and the done condition.>" Use the native goal tool only when the operator explicitly requested a goal; otherwise keep this objective in the program store.
- [ ] Read these from the installed plugin at program start. Resolve every placeholder to the actual absolute path. Re-read them at every tick.
  - [ ] `<absolute-plugin-root>/skills/poteto-mode/playbooks/<execution playbook>.md`
  - [ ] `<absolute-plugin-root>/skills/swarm/SKILL.md`
  - [ ] `<absolute-control-skill-path>/SKILL.md`
  - [ ] `<absolute-plugin-root>/skills/poteto-mode/playbooks/opening-a-pr.md`
  - [ ] `<absolute-plugin-root>/skills/<each other leaf skill the program uses>/SKILL.md`
- [ ] Arm the 30-minute audit tick through native Codex scheduling for the requested recurring program and confirm success. During the active turn, use bounded waits. If no scheduler is available, name the unattended-wakeup gap and keep a durable resume point. Never leave the cadence to memory.
- [ ] Use this tick prompt, verbatim. "Re-read the installed execution playbook and the active native goal or stored program objective. Audit the operation against both and fix drift in this tick. Probe every active lane and judge progress by side effects only. Revalidate a suspect lane through its current native status and live tool handle. Interrupt and replace a terminal or missing lane with its durable evidence. An observation timeout is not terminal. Then send the operator a status message on meaningful change or at the cadence she explicitly requested, keeping unchanged scheduled checks quiet otherwise, with the queue table of PR, owner, state, and head SHA, the verdicts since the last tick, what merged, open operator gates, and blockers."
- [ ] On the operator's hold or stand-down, send every owner a zero-writes order at once.

### Spawn owners

- [ ] Spawn one owner per PR with the full lifecycle the execution playbook names.
- [ ] Follow this dependency graph. Start dependent work only after its parent merges, or base it on the parent branch when the execution playbook stacks.
  - [ ] <PR id> and <PR id> are independent and first. Both branch from `main`.
  - [ ] <PR id> after <PR id>.
- [ ] Hold the file boundaries. <PR id or class> touches only `<glob>`.
- [ ] Hold the review gate. <PR ids> change an interaction. They wait for the operator's review in chat with screenshots and a video before merge.

### PR mechanics, for every PR

- [ ] Resolve the forge once. Default to `gh`; if `command -v origin` succeeds and Origin can resolve the repository, use `origin pr` for every PR operation. Record any fallback to `gh`. Never require `gt`.
- [ ] Open the PR ready, never draft, with `origin pr create --status open --base <base-branch>` or `gh pr create --base <base-branch>` according to the resolved forge. A stack child targets its parent branch.
- [ ] Run the repo's lint and typecheck once before the PR-facing push. Push with hooks on.
- [ ] Run `/deslop` before each commit and `/no-comments` before review.
- [ ] Triage every Bugbot and security-reviewer comment per `../references/bugbot-triage.md`.
- [ ] Rebase onto current trunk before babysit and again before the merge-ready report.

### Verdict and merge, for every PR

- [ ] At the merge-ready head SHA, run the swarm per `pstack/skills/swarm/SKILL.md`. One gates lane. The ten live lanes from the PR's **Verify, live** block. The perf lane from its **Verify, perf** block. One audit lane that reads the diff and the receipts and distrusts the PR body.
- [ ] Clean only when every lane is `PASS`. Findings go back to the owner. A new head gets a fresh swarm and a fresh verdict.
- [ ] <The merge or append rule from the execution playbook, with the patch-id rule from `playbooks/shipping.md`.>

### Boot recipe, for every live lane

Each live lane runs in its own local worktree at the PR head. Resolve its model through CODEX.md, keep all ten lanes, and dispatch only as native concurrency slots become available. Give each lane separate runtime data, output paths, and ports. Drive through `browser-use` or `control-cli` bundled with this plugin. Remote VM isolation has no direct native equivalent here; if the scenario needs it, record the blocked lane rather than claiming local isolation is equivalent.

- [ ] Fetch `<head-branch>` and create the lane's exclusive worktree at `<head SHA>`. Do not switch a shared checkout.
- [ ] <Start the backend and the surface. Wait for ready.>
- [ ] <Deliver input only through the control skill's commands. Name the read-only diagnostics.>
- [ ] Save every screenshot to `<absolute-consuming-repo>/.ai/swarm-<pr-id>/worker-<n>/<slug>.png` and return the paths with the report.

## <Task as a verb phrase> (<PR id>)

**Depends on.** <PR id, or None.>

**Files.**

- [ ] Edit `<path>`.
- [ ] Create `<path>`.
- [ ] Delete `<path>`.

**Build.**

- [ ] <One change. Name the symbol and the file.>

**You see.**

- [ ] <One observable result, with the exact log line or screen state.>

**Verify, unit.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] <Test file and the case it gains.> Run `<command>`.

**Verify, live.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked. Ten lanes using the `swarm workers` role at the PR head, per the boot recipe.

- [ ] Lane 1. Regression lane against trunk. Run <the same load-bearing scenario> at trunk and head. If trunk lacks the feature, record that and gate <the behavior the diff adds plus the end state the user waits for>. Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 2. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 3. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 4. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 5. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 6. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 7. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 8. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 9. <Scenario.> Save `<slug>.png`. Pass when <predicate>.
- [ ] Lane 10. <Scenario.> Save `<slug>.png`. Pass when <predicate>.

**Verify, perf.** Tests alone are not sufficient verification. A PR is verified only when its unit, live, and perf boxes are all checked.

- [ ] Metric. <What is measured at both trunk and head. If trunk lacks the feature, also name the diff-added work and the end-to-end state the user waits for.>
- [ ] Probe. <The command or procedure, run at trunk and at the head, interleaved. Both sides must produce the metric.>
- [ ] Baseline. Record the trunk <value> first.
- [ ] Rule. <Head against trunk, with the number that fails. If the scenarios differ, add absolute budgets for the diff-added work and the user-visible end state instead of an invalid ratio.>

**Review gate.** The operator reviews before merge.

- [ ] Copy lane <n> screenshots into `<media path>/<pr-id>-review-<slug>.png`.
- [ ] Record a 30 to 60 second video of the change in a lane's runtime. Save it as `<media path>/<pr-id>-review.mp4`.
- [ ] Post the screenshots and the video in chat. Stop at merge-ready. Wait for the operator's click.

**Merge.**

- [ ] Root's clean verdict at the exact head SHA.
- [ ] Bugbot triage done.
- [ ] Rebased onto current trunk after the verdict, patch-id unchanged.
- [ ] <The owner hands off its independent merge-ready PR, or the root appends it to the base-branch stack and the operator lands it bottom-up.>

## Close the program

- [ ] Every box above is checked with its evidence.
- [ ] Reply to the operator with the report the execution playbook names.

## Appendix A. Prototype evidence

<Each open question a prototype answered, with the branch, the SHA, and the artifact links. Each question that stays unproven.>

## Appendix B. Alternatives rejected

<Each approach weighed and why it lost.>

## Appendix C. Risks

<Each risk with the PR it lands in and what the owner watches.>

## Appendix D. Links and reading list

<Docs to read before editing. Which PRs get `pstack/skills/how/SKILL.md` and `pstack/skills/interrogate/SKILL.md`. The trail per `pstack/skills/show-me-your-work/SKILL.md`.>
````

**Reply:** the plan path, the PR ids with their dependencies and the review-gated set, what the prototypes proved and what stays unproven, and the check script's output.
