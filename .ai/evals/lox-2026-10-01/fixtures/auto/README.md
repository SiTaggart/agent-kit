# Retry fixture
Retry ConnectionError only. max_attempts includes the first call. Call the operation at most that many times. Return success from the final allowed attempt. Propagate the final ConnectionError and all other errors. Reject budgets below one before calling the operation.

Tests: python3 -B -m unittest -v
Compile: python3 -B -c "import ast, pathlib; [ast.parse(p.read_text()) for p in pathlib.Path('.').glob('*.py')]"
No configured linter or formatter. Do not add dependencies.
