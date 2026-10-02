# Add read-only `--check` to the agent-role installer

## Outcome

Add `--check` to `plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts` as an alias for its existing `status` inspection. Healthy state exits **0**. Drift, conflict, or inspection failure exits **1**. Invalid CLI arguments exit **2** before inspection or mutation.

This is an implementation plan. No source or test changes are authorized by the current task.

## Evidence and boundaries

The source snapshot is `5875aaf54b4797a29650b4ed5274a7935f7912f2`. The frozen fixture represents it as `pilot-head` (`b3d4eedbc8b8e0a07c4d8d110c7ad206cfe2a564`), with `pilot-base` at `212cf609969f375121465c2ef0e4550dd831dba7`. Inspection used the exact `pilot-base..pilot-head` changeset. The extra HEAD commit changes only evaluation ignores and is outside the target.

No existing owning plan or plan format was found under `.ai/plans` in this fixture.

- `install.ts:153` defines profile inspection: `create` for missing profiles, `update` for changed templates whose installed content matches the ledger, `unchanged` for template matches, and `conflict` otherwise.
- `install.ts:205` checks `config.toml`: concurrency must be 2, and the scout, builder, and reviewer descriptions and relative `config_file` values must match `desiredAgentConfig`.
- `install.ts:241` combines those inspections in `inspectStatus`. Health means all three profiles are `unchanged` and there are no config issues.
- `install.ts:289` parses only the first argument and searches for `--codex-home`. It ignores some extra arguments. The CLI boundary currently reports every exception as exit 1.
- The setup workflow's documented consumers invoke `plan`, `apply`, `status`, and `uninstall`, with `--codex-home <path>` after the command. The installer does not have an `install` subcommand and does not write config itself.
- `tests/codex-agent-team-setup.test.ts` imports the installer functions directly. It covers installation, unmanaged conflict protection, managed updates, uninstall preservation, config issues, and an optional installed-Codex parser probe. It does not test this installer's CLI argument handling or exit codes. `tests/cli.test.ts` covers the separate `src/cli.ts` CLI.

Keep exported inspection/install contracts, bundled roles, config expectations, and existing tests unchanged. Do not change README files, dependencies, plugin versions, adjacent setup behavior, or the top-level Agent Kit CLI.

## CLI contract

Accept these forms, where the optional path is a separate, non-empty argument:

```text
bun <installer>                         # existing default: status
bun <installer> --check [--codex-home <path>]
bun <installer> plan [--codex-home <path>]
bun <installer> apply [--codex-home <path>]
bun <installer> status [--codex-home <path>]
bun <installer> uninstall [--codex-home <path>]
```

Retain home selection: explicit path, then `CODEX_HOME`, then `path.join(homedir(), ".codex")`. Retain existing path resolution. A nonexistent home is valid input and produces unhealthy inspection, not a usage error.

Validate the complete argument list. Reject unknown commands or flags, extra positional arguments, repeated selectors or home flags, missing/empty home values, and flag-looking home values. A path that starts with `-` can be supplied as `./-name`. Do not add `--flag=value`, flag-before-command syntax, a bare `check` subcommand, or new help behavior.

Reject combinations such as `apply --check`, `uninstall --check`, `status --check`, and `--check apply`. These exit 2 without invoking any filesystem operation. `--codex-home <path>` alone is also invalid; the documented grammar requires a selector first.

Usage failures print a useful diagnostic and the accepted forms to stderr. These rules intentionally replace ignored invalid arguments and the old usage-error exit 1. Valid existing commands retain their output and effects.

## Implementation approach

Keep all production changes in `install.ts`.

1. Give the parser a private command union of `plan | apply | status | uninstall`. Validate the selector and complete optional home pair before returning options. Map the literal `--check` selector to `status`.
2. Use a small private usage-error type so the existing top-level catch can choose exit 2 for argument errors and retain exit 1 for inspection or operational errors. Do not classify filesystem, TOML, or ledger errors as argument failures.
3. Keep the existing status branch as the only implementation of status/check output and health. Continue to call `inspectStatus`, print `formatActions(status.profiles)`, then print each config issue with the existing `config` prefix. No separate inspection engine or formatter is needed.

The check call path is parser → status branch → `inspectStatus` → `planProfiles` / `configIssues`. Their helpers resolve paths, read templates/ledger/profiles/config, parse, and calculate checksums. They do not mutate the filesystem.

The check path must never call `applyProfiles`, `uninstallProfiles`, `atomicWrite`, or `writeLedger`. It must never call `mkdir`, `writeFile`, `rename`, `rm`, or `unlink`, including temporary-file or backup operations. Do not create a home or ledger to inspect it. Do not implement check as an install dry run.

Preserve the current health rules:

- Missing profiles, managed updates, and unmanaged or locally modified conflicts exit 1. Preserve all existing profile bytes.
- Missing, malformed, or mismatched config exits 1. Preserve config bytes and unrelated keys.
- Template-matching profiles with correct config can be healthy without a ledger. Check must not adopt them or create a ledger.
- Malformed ledgers, unreadable files, or invalid/missing bundled templates retain the existing error diagnostic and exit 1. Do not repair them or redefine inspection results.
- Additional config keys and unrelated roles retain their current treatment. No new legacy-setting or Codex compatibility checks are introduced.

## Delivery slices

### 1. Validate arguments and add the alias

Implement the parser contract, usage-error classification, and `--check` → `status` mapping together. Leave install/uninstall and inspection functions intact. Preserve the no-argument default and all documented command forms.

Review the complete dispatch path before verification. No invalid input may reach `applyProfiles` or `uninstallProfiles`, even when its first argument names a mutating command.

### 2. Verify the real CLI when implementation is authorized

Keep existing test files and README files unchanged. Add focused coverage in a new `tests/codex-agent-team-setup-check.test.ts` during future implementation. Use the existing temporary-root helpers and spawn the installer with the running Bun executable (`process.execPath`). Do not invoke Codex or a real user home for the new coverage.

Set up fixtures before launching check. Any fixture writes belong to test setup, not to check. Always isolate `CODEX_HOME`, pass alternate homes explicitly where applicable, and clean up after each case.

Cover these cases through the subprocess exit status and diagnostics:

- Healthy installed home: check exits 0 and has the same stdout as status. No arguments also preserve status behavior.
- Missing home: exit 1, three `create` actions, and a missing-config issue; the home and its missing parent directories remain absent.
- Missing profile, managed update, unmanaged profile, and locally modified managed profile: each exits 1 with the correct action. For the update fixture, install from a modified copy of bundled assets and check against the unchanged bundled assets; do not edit repository assets.
- Missing config, invalid TOML, missing role tables, incorrect description or `config_file`, and incorrect concurrency: exit 1 with the existing config diagnostics.
- Correct profiles/config without a ledger: exit 0 and no new ledger. Invalid ledger JSON or schema: exit 1 with stderr diagnostics and no repair.
- Explicit home overrides `CODEX_HOME`; environment-only home selection works. Never test the default by inspecting the host home.
- Each invalid argument category above: exit 2 with stderr usage diagnostics. Include `apply --check`, `uninstall --check`, `apply --unknown`, duplicate flags, missing values, and trailing arguments. Assert no install or uninstall effects.
- Valid `plan`, `apply`, `status`, and `uninstall` still behave as documented. Keep the existing direct-function regression tests as independent constraints.

For healthy, drift, conflict, invalid-ledger, and invalid-argument cases, compare recursive directory entries, file bytes, modes, and modification times before and after the child invocation. Include the ledger, config, managed files, unrelated user files, and existing backup files. Assert that no temp or backup entries appear. For absent paths, compare the existing parent and assert continued absence.

Final-state snapshots cannot prove that a file was created and deleted during execution. Pair them with a source audit of the complete check call path, including error paths, to verify that no mutation helper is reachable. Report this limit if runtime mutation tracing is unavailable. Do not add production IO abstractions solely for this small CLI alias.

## Verification and proof gaps

During a later authorized implementation, run:

```sh
bun test tests/codex-agent-team-setup-check.test.ts
bun test tests/codex-agent-team-setup.test.ts
bun run type-check
bun run lint
```

The package lint command covers only `src` and `tests`. Also lint `plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts` with an already available local oxlint executable. Do not install tooling to obtain a pass; report a missing executable as a blocker. The installer is checked by TypeScript through its existing test imports.

The existing installed-Codex strict-parser test is conditional and depends on a host executable. A skip does not establish Codex compatibility. It is outside this frozen local planning task, and the new CLI tests must not depend on it.

This planning pass used local source, the exact source diff, documented consumers, tests, package scripts, and TypeScript configuration. It did not implement the feature, run runtime tests, run lint/type checking, inspect host metadata, or use network services. Exit codes and the no-write guarantee remain unproved at runtime until implementation and verification occur.
