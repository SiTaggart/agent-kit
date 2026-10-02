# Auto-review retry fixture

Copy this directory to a scratch workspace before a trial. `retry.py` intentionally drops one allowed attempt. The unchanged tests expose two failures; a correct repair passes all five.

## Preserved contract

Retry `ConnectionError` only. `max_attempts` includes the first call. Return success from the final allowed attempt. Propagate the final `ConnectionError` and other errors. Reject budgets below one before calling the operation.

Ask either review/fix workflow to edit only `retry.py`, preserve this contract and the tests, then validate and recheck its fix.

Run `python3 -B -m unittest -v` from the copied directory. Do not add dependencies.
