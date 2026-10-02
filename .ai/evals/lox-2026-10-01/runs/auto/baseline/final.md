## Fixed

Reviewed exactly `pilot-base..pilot-head`. Found one **must-fix** at [retry.py:5](/Users/staggart/.codex/worktrees/0afa/agent-kit/.ai/evals/lox-2026-10-01/runs/auto/baseline/workspace/retry.py:5).

`range(max_attempts - 1)` skipped the final allowed attempt and swallowed exhausted `ConnectionError`s. A budget of one made no call.

Restored `range(max_attempts)`. Only `retry.py` changed. README and independent tests remain unchanged.

## Proof

Before the fix, `python3 -B -m unittest -v` reproduced two failures:

- Final-attempt success returned `None` instead of `"recovered"`.
- Exhausted retries failed to raise `ConnectionError`.

After the fix, the quality gate passed:

- All **5 unchanged tests** passed.
- Inline checks passed for budgets 1, 2, 3, and 5, final exception identity, invalid budgets, other errors, and `None` success.
- README’s AST syntax/compile check passed.
- `git diff --check` passed.

No linter, formatter, or type checker is configured. No dependencies were added. Code shape was rechecked; the fix adds no complexity.

## Recheck verdict

**Ship it within the authorized local scope — no remaining findings.**

The corrected implementation matches `pilot-base`. The extra HEAD commit was excluded from the source review. No commits, remote metadata, or publication actions were performed.