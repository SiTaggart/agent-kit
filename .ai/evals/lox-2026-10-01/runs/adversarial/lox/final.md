Found **two medium ship risks** in `pilot-base..pilot-head`. Tracked files remain unchanged.

1. **Uninstall leaves registered roles pointing to deleted files.**  
   Changed lines 20–30 in [setup SKILL.md](/Users/staggart/.codex/worktrees/0afa/agent-kit/.ai/evals/lox-2026-10-01/runs/adversarial/lox/workspace/plugins/engineering/skills/codex-agent-team-setup/SKILL.md:20) introduce three `config_file` references. `uninstallProfiles()` deletes the managed profiles but leaves those references in `config.toml`.

   **Reproduced with in-memory filesystem IO:** install, then uninstall removes all three profiles while retaining all three registrations. The registered roles no longer have their configuration files. Codex’s exact failure behavior remains unverified.

   Remove matching managed registrations during uninstall, or require registry cleanup before deleting the profiles. Preserve user-modified entries.

2. **Preserving custom concurrency prevents setup from passing verification.**  
   Changed lines 80–82 in [setup SKILL.md](/Users/staggart/.codex/worktrees/0afa/agent-kit/.ai/evals/lox-2026-10-01/runs/adversarial/lox/workspace/plugins/engineering/skills/codex-agent-team-setup/SKILL.md:80) require preserving a different user-selected concurrency value. The verifier still requires exactly `2`.

   **Reproduced with in-memory filesystem IO:** with matching profiles, the documented registry, and `max_concurrent_threads_per_session = 4`, `status` reports “must be 2” and remains unhealthy. The documented preservation path cannot complete successfully.

   Treat `2` as a recommendation when the user has explicitly selected another supported value, or document that choice as a separate policy conflict rather than incomplete installation.

Verification: marketplace validation and the project-control test passed. The in-memory probe also confirmed that checksum-matching legacy profiles upgrade successfully.

Proof gaps: installer filesystem tests require writes prohibited by this read-only fixture. The host-dependent Codex parser and actual role launches were not tested. Lint and type-check were unavailable because local dependencies are absent.