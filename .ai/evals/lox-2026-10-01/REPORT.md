# LOX side-by-side pilot

LOX is worth testing separately. This pilot does not support replacing the current skills as a group.

Five paired tasks used the same source inputs and model. Eight runs completed their final handoff. CEPlan and thermo review reached the five-minute cap. Completion and artifact quality are assessed separately.

The existing-skill baselines were:

- PR descriptions: Git `pr-description` 0.2.2.
- Planning: Engineering `ce-plan` 0.2.10.
- Simplicity: Engineering `ce-thermo-nuclear-code-quality-review` 0.2.10.
- Adversarial: Engineering `ce-review` 0.2.10 in quick mode.
- Auto: Engineering `ce-review` and `ce-quality-gate` 0.2.10, composed as described below.

The LOX runs use the local adaptation of upstream revision `7c71d80df75666fdbae9e712ac491aa86a21baed`. The [provenance note](../../../plugins/lox/UPSTREAM.md) records the changes. This pilot tests that package, including its adapted auto loop. It does not compare PStack or `ce-simplify-code` directly.

## Supported observations

- **PR descriptions:** both drafts describe the change accurately and avoid unsupported testing claims. LOX produces a shorter Why/What body (124 words versus 235). Its unrun-test gap appears outside the copy-ready body; the baseline includes Testing in the body. That is a modest completeness tradeoff, with no fabricated validation. LOX is a useful concise alternative; this task does not test live PR refresh, issue closure, screenshots, or publication.
- **Planning:** both saved plans reuse `inspectStatus` and cover exit codes, ownership, and read-only checks. LOX is shorter, but it carries caller restrictions into future implementation and omits a delivery slice documenting the public flag. CEPlan includes focused canonical setup documentation and stronger mutation-attempt proof. Shorter is not automatically more useful. CEPlan wrote its artifact but timed out before the final handoff.
- **Simplicity:** LOX completed a grounded no-findings report and explained why the added structure earns its place. Thermo's transcript also reports no material regression, but its final report was capped. There is no completed paired quality comparison here.
- **Adversarial:** LOX found one actionable lifecycle gap missed by the baseline: new `config_file` registrations remain after managed profiles are removed, and the removal instructions give no registry cleanup step. Source and virtual filesystem evidence support the gap. Actual Codex startup/role-launch consequences remain unverified. Its second claim overstates the concurrency instructions: they require confirmation before overriding a user choice, and the strict verifier already existed. That claim is rejected as a demonstrated introduced bug. This is useful sensitivity with a precision tradeoff, not a blanket winner.
- **Auto review:** both loops repaired exactly the same retry bound. Each reproduced two red tests, kept the independent tests and README unchanged, and finished with all five tests green. Independent checks confirmed the same resulting source and no out-of-scope tracked edits. The baseline is an explicit review → authorized fix → quality gate → recheck composition; there is no equivalent single baseline auto skill.

The parent independently inspected the planning artifacts and adjudicated both risk claims. The remaining grading is contract-based self-assessment. There was no blind independent grader.

## Controls and limits

The model was `gpt-6.1-sol`, with `high` reasoning. Each run used a fresh ephemeral CLI session. User config, memories, plugins, apps, hooks, delegation, host skill discovery, and skill search were disabled. Project instruction loading was set to zero bytes; no MCP servers were configured. Skills were loaded through explicit frozen files. Review/drafting sessions used a read-only model sandbox; planning and auto sessions used workspace-write. No publication or root-repository commit occurred.

[Validation](validation.json) confirms identical source diff hashes within every pair. No review or planning session edited tracked fixture source. The auto loops changed only `retry.py`.

Isolation has limits. Host role definitions were parsed and rejected as malformed; warnings appeared in startup events. No plugin or MCP startup was observed, but the CLI events do not expose the entire hidden prompt. Original fixtures were nested under the checkout, so `bun run type-check` could resolve enclosing dependencies while direct executable paths failed. Dependency isolation was incomplete. Write-requiring installer tests and the host Codex parser were outside the read-only review proof. These gaps are not product failures or proof of skill superiority.

One LOX PR setup attempt omitted runtime guidance. It is preserved under `excluded-attempts` and excluded. The corrected run has its own fresh final and completed metadata. Final LOX auto uses the shipped snapshot, not an earlier draft. Two capped runs have no final usage record. [Metrics](metrics.json) preserve observed time and reported token usage; no reliable monetary cost is available. One run per task, concurrent execution, and a cap do not support general latency conclusions.

## Evidence

- [PR drafts](runs/pr-description): paired prompts, events, metadata, and final responses.
- [Planning artifacts](runs/plan): both saved plans; CEPlan's artifact survives its capped handoff.
- [Simplicity evidence](runs/simplicity) and [adversarial evidence](runs/adversarial): exact commands/output and inert extracted probes.
- [Auto evidence](runs/auto): exact checks, independent test output, patches, and resulting source.
- [Frozen source diffs and fault](fixtures), [skill/runtime snapshots](snapshots), and [run controls](controls.json).

Completed nested workspaces were moved to `/private/tmp/agent-kit-lox-pilot-2026-10-01-0afa`. Their locations are recorded in metadata. Historical paths in raw outputs are preserved verbatim.
