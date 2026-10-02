# Reproduce the LOX pilot

Read [REPORT.md](REPORT.md) for findings and limits. This is a five-pair exploratory comparison. Do not run the old full campaign from the parent eval runbook.

## Inputs

- PR description: Agent Kit commit `646e2e144ccc521bbd711d0a4ea230fbcbbefef4` and its parent.
- Planning, simplicity, and adversarial review: commit `5875aaf54b4797a29650b4ed5274a7935f7912f2` and its parent.
- Auto review: the independent retry fixture under `fixtures/auto`; the candidate drops one allowed attempt.
- Baselines: installed Git 0.2.2 and Engineering 0.2.10 skill snapshots. LOX: final adapted five-skill package and runtime guidance.

The tracked source diffs are preserved. Fixture creation strips instruction/config surfaces to prevent ambient activation; it retains the source `.agents/plugins/marketplace.json` catalog. Replay uses frozen skill snapshots rather than the current installed prompts.

## Replay

Use a copy of this directory at the same repository depth. The runner refuses to overwrite existing recorded events. Choose a fresh task-specific scratch path with `LOX_PILOT_SCRATCH_ROOT`; do not point it at a user checkout. The default is under `/private/tmp`.

```sh
python3 prepare.py
python3 run.py --jobs 2 --timeout 300
python3 validate.py
```

Pass `--task pr-description` or another task key, and `--family baseline` or `lox`, to restrict runs. Use the same controls for both members of a pair. The scripts pass prompts on stdin and construct subprocess argument arrays.

Codex CLI startup required scoped desktop sandbox escalation during this pilot. Model tool sandboxes remain enforced. Never use sandbox or approval bypass flags. Authentication uses the existing Codex installation; no credential is copied into these artifacts.

Replay does not promise identical timing, outputs, or available check tooling. Original type checking could use enclosing checkout dependencies; replay scratch roots do not have that ancestor. Use exact frozen dependencies if full mechanical checks are needed and disclose any setup gap. Do not treat a missing tool, denied temporary write, or capped final handoff as a skill-quality verdict.

`events.jsonl` and `checks.log` preserve command evidence. Extracted `probe-*.ts` files are inert model-produced code for inspection, not automatically trusted executables. Metadata contains input hashes, runtime/companion hashes, historical arguments, and relocated workspace locations.
