#!/bin/bash
#
# Cursor beforeShellExecution adapter for prevent-main-commit.sh.
# Always prints Cursor hook JSON on stdout.
#

policy="$(cd "$(dirname "$0")" && pwd)/prevent-main-commit.sh"
input=$(cat)
stderr_file=$(mktemp)
trap 'rm -f "$stderr_file"' EXIT

set +e
printf '%s' "$input" | /bin/bash "$policy" >/dev/null 2>"$stderr_file"
status=$?
set -e

if ! command -v python3 >/dev/null 2>&1; then
  printf '%s\n' '{"permission":"deny","agent_message":"python3 is required to format Cursor hook output.","user_message":"python3 is required to format Cursor hook output."}'
  exit 2
fi

CURSOR_HOOK_STATUS="$status" python3 -c '
import json
import os
import sys

status = int(os.environ["CURSOR_HOOK_STATUS"])
message = sys.stdin.read().strip() or "Blocked by agent-kit hook"
if status == 0:
    print(json.dumps({"permission": "allow"}))
    raise SystemExit(0)
print(json.dumps({
    "permission": "deny",
    "agent_message": message,
    "user_message": message,
}))
' <"$stderr_file"
