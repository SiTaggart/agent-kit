Saved [the implementation plan](/Users/staggart/.codex/worktrees/0afa/agent-kit/.ai/evals/lox-2026-10-01/runs/plan/baseline/workspace/.ai/plans/2026-10-01-001-feat-agent-role-check-mode-plan.md).

Headless document review passed. Source, tests, and README files remain unchanged. No runtime tests ran.

# feat: Add read-only agent-role check mode

## Summary and Problem Frame

Add `--check` to the agent-role installer for automation that needs a read-only health result. Reuse the existing status inspection and diagnostics. Exit 0 for healthy state, 1 for drift or conflict, and 2 for invalid CLI arguments.

The current CLI has a read-only `status` command but does not accept `--check`. Its parser ignores extra arguments and reports all failures with exit code 1. A check request must never reach installation or removal.

---

## Source and Existing Behavior

The requested source snapshot is `5875aaf54b4797a29650b4ed5274a7935f7912f2`. The frozen fixture represents it with `pilot-head` at `bb13b2481d1956fb5d22680fe0cfcab358f3bda3`. Research used the exact changeset `pilot-base..pilot-head`, starting at `0ef372a2a0290478cccd33b9be7369158ff63786`.

The additional HEAD commit changes only `.gitignore`. It is outside the target. The original snapshot hash is a label in this fixture and is not a resolvable local Git object.

- `plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts`: `inspectStatus` combines `planProfiles` and `configIssues`. It is healthy only when all three profiles are `unchanged` and config has no issues.
- `planProfiles`: compares `scout`, `builder`, and `reviewer` with packaged templates and ledger checksums. Its results are `create`, `update`, `unchanged`, or `conflict`.
- `configIssues`: checks concurrency value 2 and each role’s description and relative `config_file` path. Missing or malformed TOML is unhealthy. Unrelated config keys are ignored.
- `readLedger`: a missing ledger is allowed. Invalid ledger JSON, schema, or entries throw. Matching profile content can be healthy without a ledger.
- `main`: `plan`, `apply`, `status`, and `uninstall` are the existing modes. No arguments defaults to `status`. Home selection is explicit `--codex-home`, then `CODEX_HOME`, then the user’s `.codex` directory.
- `plugins/engineering/skills/codex-agent-team-setup/SKILL.md`: documents those commands and `--codex-home <path>` after the mode. This is a consumer document, not an instruction to execute setup.
- `tests/codex-agent-team-setup.test.ts`: covers exported operations, conflicts, managed updates, removal, and config issues. It does not test this installer’s CLI parsing or exit codes. Its existing `spawnSync` use provides a subprocess pattern.
- `tests/helpers.ts`: provides disposable roots and fixture writes. `package.json` defines Bun tests, Oxlint, and TypeScript checks. Default lint targets only `src` and `tests`; the installer needs explicit lint coverage.

Repository search found no other callers of this installer’s CLI or exports. The root `src/cli.ts` is a separate marketplace CLI and stays unchanged.

---

## Requirements

**Check contract**

- R1. Accept `--check` as a read-only CLI mode with the existing home selection rules.
- R2. Check exactly the managed profiles and config that `inspectStatus` checks; return 0 only for healthy state and 1 for drift or conflict.
- R3. Report profile actions and config issues through the existing status output.

**Safety and compatibility**

- R4. Check mode must never write profiles, config, ledger, directories, temporary files, or backups, including on failure.
- R5. Preserve valid install, status, plan, and uninstall behavior and preserve user-owned conflicting profiles.
- R6. Reject invalid CLI arguments with exit code 2 before inspection or mutation.
- R7. Add no dependency and make no adjacent setup changes.

---

## Assumptions

These are unvalidated choices made for the headless request.

- A1. `--check` is a standalone mode selector. Combining it with any explicit command, including `status`, is invalid. No positional `check` alias is added.
- A2. Keep the documented mode-first argument order. Valid check syntax is `--check` with an optional following `--codex-home <path>`. New option-order variants and `--flag=value` syntax are outside scope.
- A3. Check output matches status output. JSON, quiet output, and new success messages are outside scope.
- A4. Inspection failures, such as an unreadable file or invalid ledger, retain exit code 1 and an stderr diagnostic. Exit code 2 is reserved for argument validation.

---

## Key Technical Decisions

- KTD1. **Share the status branch:** normalize the check selector to a distinct CLI mode, then let status and check call `inspectStatus` and render the same result. This retains one definition of health and one diagnostic format.
- KTD2. **Validate before dispatch:** parse one optional mode and at most one `--codex-home` pair. Use a bounded command type and a distinguishable argument-error category so the outer handler returns 2 for CLI errors and 1 for execution failures. Do not classify errors by message text.
- KTD3. **Keep inspection separate from mutation:** leave `inspectStatus`, `planProfiles`, `configIssues`, and ledger ownership rules unchanged. Check must not call `applyProfiles`, `uninstallProfiles`, `atomicWrite`, or `writeLedger`. Even an unchanged `applyProfiles` call writes a ledger.
- KTD4. **Use the existing module and suite:** keep this small CLI change in `install.ts`. Add behavior assertions to its existing test suite. A generic command framework or new inspection abstraction would add complexity without removing duplication.
- KTD5. **Prove absence of write attempts:** combine subprocess results and file snapshots with an isolated test guard that rejects filesystem mutations. Snapshots alone cannot detect temporary writes that are later removed.

---

## Scope Boundaries

Future implementation may touch `install.ts`, its existing test suite, and the setup skill’s check-mode documentation. Existing test assertions must remain intact. This planning task changes only this plan under `.ai/plans`.

Do not change templates, config expectations, ledger schema, manifests, dependency files, root CLI, README files, or project-control setup. Do not add automatic repair, config editing, migration, remote checks, or Codex invocation to check mode.

### Deferred to Follow-Up Work

Help-system improvements, machine-readable output, wider CLI syntax, broader TOML validation, and unrelated documentation cleanup are separate work.

---

## Implementation Units

### U1. Add check dispatch and argument exit codes

**Goal:** expose the existing read-only inspection through `--check` and reject invalid input before work starts.

**Requirements:** R1, R2, R3, R5, R6, R7. **Dependencies:** none.

**Files:**

- Modify `plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts`.
- Extend `tests/codex-agent-team-setup.test.ts`.

**Approach:** replace the permissive positional lookup with complete validation of the accepted arguments. Retain the no-argument status default and home precedence. Reject unknown modes or flags, extra operands, repeated selectors, repeated home options, empty explicit home values, and a missing home value. A following option token must not be consumed as a home path. Apply exit code 2 to invalid arguments in every mode; previously ignored arguments become errors by design.

Route check and status through the existing inspection and formatting branch. Keep the mutation branches and exported operation signatures unchanged. Retain the existing stderr and exit-code-1 handling for operational failures.

**Patterns to follow:** `formatActions`, the status branch, `import.meta.main`, fixture roots from `tests/helpers.ts`, and `spawnSync` in the existing suite. Use a Bun subprocess for public exit-code assertions and isolate its environment from the user’s home.

**Test scenarios:**

1. Matching profiles plus valid config: invoke check; expect exit 0 and the same diagnostics as status. Repeat with matching profiles but no ledger; expect exit 0 without creating a ledger.
2. Missing home or one missing profile: invoke check; expect exit 1 and the corresponding `create` diagnostics.
3. A profile differs from the current template but matches its ledger checksum: invoke check; expect `update` and exit 1. Build this state with old profile bytes and their checksum; no CLI asset override is needed.
4. An unmanaged profile or a locally modified managed profile: invoke check; expect `conflict` and exit 1. Preserve its exact bytes.
5. Healthy profiles with missing config, malformed TOML, missing agents or role tables, wrong concurrency, wrong description, or wrong `config_file`: invoke check; expect exit 1 and existing config diagnostics. Extra unrelated config keys alone remain healthy.
6. Explicit home and `CODEX_HOME` point at different fixtures: invoke check; prove explicit home wins. Without the override, prove `CODEX_HOME` is used. Preserve the source’s final home fallback.
7. Unknown command or flag, extra operand, duplicate check or home option, absent or empty home value, and `--codex-home --check`: invoke CLI; expect exit 2 and an stderr argument diagnostic.
8. Combine check with each existing command, especially `apply` and `uninstall`: expect exit 2 before any operation.
9. Invalid ledger JSON or schema: invoke check; expect exit 1 and stderr diagnostics, without repair. A deterministic non-ENOENT read failure also returns 1 rather than 2.
10. Invoke no-argument status, explicit status, plan, apply, and uninstall with valid arguments against isolated fixtures; retain their current output, exit behavior, conflict refusal, and removal rules. Keep all existing exported-operation tests.

**Verification:** public subprocess behavior satisfies the 0/1/2 contract. Valid existing invocations preserve behavior. Existing inspection results and diagnostics remain authoritative.

### U2. Prove check cannot mutate filesystem state

**Goal:** prove the read-only guarantee on success, drift, conflict, and failure.

**Requirements:** R4, R5, R6. **Dependencies:** U1.

**Files:** extend `tests/codex-agent-team-setup.test.ts`. No production helper or dependency is required.

**Approach:** prepare fixtures before launching each child. Snapshot directory entries, file bytes, modification times, and permissions around the invocation. Include config, ledger, roles, unrelated files, and the disposable home parent. Do not compare access times, which reads can change.

In a separate isolated Bun child, load a test-owned filesystem guard before importing the installer. Reject mutating calls on the Node filesystem APIs used by the script, including directory creation, file writes, renames, and removal. Cover synchronous and promise variants exposed by the guard. The harness can prepare a preload module in its disposable test root; check mode cannot create it.

Validate the guard with a positive control that attempts a write and must be rejected. Keep the guard out of the shared Bun test process. A missing guard interception is a failed proof, not a passing check.

**Patterns to follow:** disposable fixture setup and `try/finally` cleanup in the existing suite. Test preparation and cleanup are outside the check invocation being measured.

**Test scenarios:**

1. Healthy home with a ledger and healthy home without a ledger: check exits 0 under the guard; snapshots remain equal. This catches accidental ledger refreshes.
2. A nonexistent nested home: check exits 1; the home and its missing ancestors remain absent. No directory, temp file, or backup appears.
3. Missing or outdated profiles, local conflicts, and invalid config: check exits 1; snapshots remain equal and the guard records no mutation attempt.
4. Invalid ledger or another inspection error: check exits 1 without mutation. Mixed mutating-command/check arguments exit 2 with unchanged fixtures.
5. The guard’s positive control attempts a filesystem write: it fails. Check itself succeeds or fails only for its health or argument result, never because it tried to write.

**Verification:** demonstrate unchanged state and zero mutating filesystem calls. Review the complete check call chain to confirm it reaches only reads, parsing, hashing, formatting, and console output.

### U3. Document the public check contract

**Goal:** make the new mode usable without changing setup instructions.

**Requirements:** R1, R2, R3, R4, R6, R7. **Dependencies:** U1 and U2.

**Files:** modify `plugins/engineering/skills/codex-agent-team-setup/SKILL.md` only.

**Approach:** add a short verification note for `--check`, its optional home override, read-only guarantee, mutually exclusive mode syntax, and exit codes. Keep existing status and installation instructions. Do not edit README files or adjacent setup consumers.

**Patterns to follow:** the existing Verify and Test Roots sections and their portable `SKILL_DIR` references.

**Test expectation:** none for prose alone. Review examples against the CLI assertions from U1.

**Verification:** documentation matches the accepted syntax and verified behavior. Existing setup commands remain usable.

---

## Risks and Verification Gaps

The largest implementation risk is routing check through an install path that writes the ledger even when profiles match. U2’s guard and missing-ledger case address that risk.

Stricter parsing changes the treatment of formerly ignored arguments. Preserve documented valid invocations; treat invalid inputs as the requested exit-code-2 behavior.

The filesystem guard’s interception of Bun’s Node imports needs verification during implementation. Use its positive control before claiming zero-write proof. File snapshots alone are insufficient.

Inspecting multiple files is a point-in-time check, not a transactional snapshot. Concurrent external edits can change state during inspection. Locks or consistency mechanisms are outside scope because they would widen the contract and can introduce writes.

No runtime tests, installer commands, linter, or type-checker ran during planning. Future implementation must pass the relevant Bun suite, the TypeScript no-emit check, and lint that includes the installer and touched tests. The existing optional Codex strict-parser test is separate from check-mode proof and must remain unchanged; do not require a host Codex installation for the new tests.

Research used sequential local source and document reads. External research, RepoPrompt, QMD, host metadata, and delegation were excluded by the frozen-fixture contract. No upstream requirements document or local institutional learnings were present. This plan is grounded in static inspection, not observed runtime behavior.