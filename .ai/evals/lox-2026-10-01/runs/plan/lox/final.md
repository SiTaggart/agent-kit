Saved the plan to [`.ai/plans/agent-role-installer-check.md`](/Users/staggart/.codex/worktrees/0afa/agent-kit/.ai/evals/lox-2026-10-01/runs/plan/lox/workspace/.ai/plans/agent-role-installer-check.md).

Source, tests, and README files remain unchanged. No runtime tests were run.

# Add read-only `--check` to the agent-role installer

## Outcome

Add `--check` to `plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts` as an alias for its existing `status` inspection.

- Healthy state exits **0**.
- Drift, conflict, or inspection failure exits **1**.
- Invalid CLI arguments exit **2**, before inspection or mutation.

This is an implementation plan. No source or test changes are authorized by the current task.

## Evidence and boundaries

The source snapshot is `5875aaf54b4797a29650b4ed5274a7935f7912f2`. The frozen fixture represents it as `pilot-head` (`b3d4eedbc8b8e0a07c4d8d110c7ad206cfe2a564`), with `pilot-base` at `212cf609969f375121465c2ef0e4550dd831dba7`.

Inspection used the exact `pilot-base..pilot-head` changeset. The extra HEAD commit changes only evaluation ignores and is outside the target.

No existing owning plan or plan format was found under `.ai/plans`.

- `install.ts:153` defines profile inspection: `create` for missing profiles, `update` when installed content matches its ledger checksum but differs from the template, `unchanged` for template matches, and `conflict` otherwise.
- `install.ts:205` checks `config.toml`: concurrency must be 2. The scout, builder, and reviewer descriptions and relative `config_file` values must match `desiredAgentConfig`.
- `install.ts:241` combines these inspections in `inspectStatus`. Health means all three profiles are `unchanged` and there are no config issues.
- `install.ts:289` parses the first argument and searches for `--codex-home`. It ignores some extra arguments. The CLI boundary currently reports every exception as exit 1.
- The setup workflow invokes `plan`, `apply`, `status`, and `uninstall`, with `--codex-home <path>` after the command. There is no `install` subcommand. The installer does not write config itself.
- `tests/codex-agent-team-setup.test.ts` covers installation, conflict protection, managed updates, uninstall preservation, config issues, and an optional installed-Codex parser probe. It does not cover this installer’s CLI parsing or exit codes.
- `tests/cli.test.ts` covers the separate `src/cli.ts` CLI.

Keep exported inspection/install contracts, bundled roles, config expectations, and existing tests unchanged.

Do not change README files, dependencies, plugin versions, adjacent setup behavior, or the top-level Agent Kit CLI.

## CLI contract

Accept these forms. The optional path is a separate, non-empty argument.

```text
bun <installer>                         # existing default: status
bun <installer> --check [--codex-home <path>]
bun <installer> plan [--codex-home <path>]
bun <installer> apply [--codex-home <path>]
bun <installer> status [--codex-home <path>]
bun <installer> uninstall [--codex-home <path>]
```

Retain home selection: explicit path, then `CODEX_HOME`, then `path.join(homedir(), ".codex")`. Retain existing path resolution.

A nonexistent home is valid input. It produces unhealthy inspection, not a usage error.

Validate the complete argument list. Reject:

- Unknown commands or flags.
- Extra positional arguments.
- Repeated selectors or home flags.
- Missing or empty home values.
- Flag-looking home values. Supply a path starting with `-` as `./-name`.

Do not add `--flag=value`, flag-before-command syntax, a bare `check` subcommand, or new help behavior.

Reject combinations such as `apply --check`, `uninstall --check`, `status --check`, and `--check apply`. They exit 2 without invoking any filesystem operation.

`--codex-home <path>` alone is also invalid. The documented grammar requires a selector first.

Usage failures print a useful diagnostic and the accepted forms to stderr. These rules intentionally replace ignored invalid arguments and the old usage-error exit 1. Valid existing commands retain their output and effects.

## Implementation approach

Keep all production changes in `install.ts`.

1. Give the parser a private command union of `plan | apply | status | uninstall`. Validate the selector and complete optional home pair before returning options. Map the literal `--check` selector to `status`.

2. Use a small private usage-error type. The existing top-level catch selects exit 2 for argument errors and retains exit 1 for inspection or operational errors. Filesystem, TOML, and ledger errors remain operational errors.

3. Keep the existing status branch as the only implementation of status/check output and health. Call `inspectStatus`, print `formatActions(status.profiles)`, then print each config issue with the existing `config` prefix. No separate inspection engine or formatter is needed.

The check call path is:

```text
parser
  → status branch
  → inspectStatus
  → planProfiles / configIssues
```

Their helpers resolve paths, read templates, ledger, profiles, and config, parse content, and calculate checksums. They do not mutate the filesystem.

The check path must never call `applyProfiles`, `uninstallProfiles`, `atomicWrite`, or `writeLedger`.

It must never call `mkdir`, `writeFile`, `rename`, `rm`, or `unlink`, including temporary-file or backup operations. Do not create a home or ledger to inspect it. Do not implement check as an install dry run.

Preserve the current health rules:

- Missing profiles, managed updates, and unmanaged or locally modified conflicts exit 1. Preserve existing profile bytes.
- Missing, malformed, or mismatched config exits 1. Preserve config bytes and unrelated keys.
- Template-matching profiles with correct config can be healthy without a ledger. Check must not adopt them or create a ledger.
- Malformed ledgers, unreadable files, or invalid/missing bundled templates retain the existing error diagnostic and exit 1. Do not repair them.
- Additional config keys and unrelated roles retain their current treatment. Add no legacy-setting or Codex compatibility checks.

## Delivery slices

### 1. Validate arguments and add the alias

Implement the parser contract, usage-error classification, and `--check` → `status` mapping together.

Leave install/uninstall and inspection functions intact. Preserve the no-argument default and all documented command forms.

Review the complete dispatch path before verification. Invalid input must never reach `applyProfiles` or `uninstallProfiles`, even when its first argument names a mutating command.

### 2. Verify the real CLI when implementation is authorized

Keep existing test files and README files unchanged.

During future implementation, add focused coverage in a new `tests/codex-agent-team-setup-check.test.ts`. Use existing temporary-root helpers. Spawn the installer with the running Bun executable, `process.execPath`.

The new coverage must not invoke Codex or inspect a real user home.

Set up fixtures before launching check. Fixture writes belong to test setup. Isolate `CODEX_HOME`, pass alternate homes explicitly where applicable, and clean up after each case.

Cover these cases through subprocess exit status and diagnostics:

- **Healthy installed home:** check exits 0 and prints the same stdout as status. No arguments preserve status behavior.
- **Missing home:** exit 1, three `create` actions, and a missing-config issue. The home and missing parent directories remain absent.
- **Profile drift and conflict:** missing profile, managed update, unmanaged profile, and locally modified managed profile each exit 1 with the correct action.
- **Managed update fixture:** install from a modified copy of bundled assets, then check against unchanged bundled assets. Do not edit repository assets.
- **Config drift:** missing config, invalid TOML, missing role tables, incorrect description or `config_file`, and incorrect concurrency exit 1 with existing diagnostics.
- **Ledger behavior:** correct profiles/config without a ledger exit 0 and create no ledger. Invalid ledger JSON or schema exits 1 with stderr diagnostics and no repair.
- **Home precedence:** explicit home overrides `CODEX_HOME`; environment-only selection works. Never test the default by inspecting the host home.
- **Invalid arguments:** every rejected category exits 2 with stderr usage diagnostics. Include `apply --check`, `uninstall --check`, `apply --unknown`, duplicate flags, missing values, and trailing arguments. Assert no install or uninstall effects.
- **Regression behavior:** valid `plan`, `apply`, `status`, and `uninstall` still behave as documented. Existing direct-function tests remain independent constraints.

For healthy, drift, conflict, invalid-ledger, and invalid-argument cases, compare recursive directory entries, file bytes, modes, and modification times before and after invocation.

Include the ledger, config, managed files, unrelated user files, and existing backups. Assert that no temp or backup entries appear. For absent paths, compare the existing parent and assert continued absence.

Final-state snapshots cannot prove that a file was created and deleted during execution. Pair them with a source audit of the complete check call path, including error paths, to verify that no mutation helper is reachable.

Report this limit if runtime mutation tracing is unavailable. Do not add production IO abstractions solely for this CLI alias.

## Verification and proof gaps

During a later authorized implementation, run:

```sh
bun test tests/codex-agent-team-setup-check.test.ts
bun test tests/codex-agent-team-setup.test.ts
bun run type-check
bun run lint
```

The package lint command covers only `src` and `tests`. Also lint `plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts` with an already available local oxlint executable.

Do not install tooling to obtain a pass. Report a missing executable as a blocker.

TypeScript checks the installer through its existing test imports.

The existing installed-Codex strict-parser test is conditional and depends on a host executable. A skip does not establish Codex compatibility. It is outside this frozen local planning task. New CLI tests must not depend on it.

This planning pass used local source, the exact source diff, documented consumers, tests, package scripts, and TypeScript configuration.

It did not implement the feature, run runtime tests, run lint/type checking, inspect host metadata, or use network services. Exit codes and the no-write guarantee remain unproved at runtime until implementation and verification occur.