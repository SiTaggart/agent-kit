#!/bin/bash
#
# Blocks destructive agent commands.
# Prevents commits on main/master and forced recursive deletion.
#

input=$(cat)

if [ -z "$input" ]; then
  exit 0
fi

if ! command -v python3 >/dev/null 2>&1; then
  echo "Blocked: python3 is required to parse hook input for branch protection." >&2
  exit 2
fi

if ! command=$(printf '%s' "$input" | python3 -c '
import json
import sys

data = json.loads(sys.stdin.read())
command = ""
if isinstance(data, dict):
    tool_input = data.get("tool_input")
    if isinstance(tool_input, dict) and isinstance(tool_input.get("command"), str):
        command = tool_input["command"]
    elif isinstance(data.get("command"), str):
        command = data["command"]
sys.stdout.write(command)
'); then
  echo "Blocked: Could not parse hook input for branch protection." >&2
  exit 2
fi

if [ -z "$command" ]; then
  exit 0
fi

if echo "$command" | grep -qE '\brm[[:space:]]+(-[^[:space:];|&]*[rR][^[:space:];|&]*|--recursive)([[:space:];|&]|$)|\bfind\b[^;|&]*[[:space:]]-delete([[:space:];|&]|$)|\btruncate[[:space:]]'; then
  echo "Blocked: Destructive filesystem command is disabled for coding agents." >&2
  exit 2
fi

if echo "$command" | grep -qE '\bgit[[:space:]]+(reset[[:space:]]+--hard|clean[[:space:]]+-[^[:space:];|&]*f|checkout[[:space:]]+--|restore([[:space:]]|$)|stash[[:space:]]+(drop|clear)|push\b[^;|&]*--force([[:space:];|&]|$)|branch[[:space:]]+-[dD]|tag[[:space:]]+-d)'; then
  echo "Blocked: Destructive git command is disabled for coding agents." >&2
  exit 2
fi

if echo "$command" | grep -qE '\b(terraform|pulumi|cdk)[[:space:]]+destroy\b|\bdocker[[:space:]]+(system[[:space:]]+prune|volume[[:space:]]+(rm|prune)|compose\b[^;|&]*down\b[^;|&]*[[:space:]]-v([[:space:];|&]|$))|\bkubectl[[:space:]]+delete[[:space:]]+(namespace\b|[^;|&]*--all\b)'; then
  echo "Blocked: Destructive infrastructure command is disabled for coding agents." >&2
  exit 2
fi

if echo "$command" | grep -qE '\b(chmod|chown)[[:space:]]+-[^[:space:];|&]*[rR]\b|(^|[;&|][[:space:]]*)(sudo[[:space:]]+)?(dd|mkfs(\.[^[:space:]]+)?|diskutil[[:space:]]+(eraseDisk|partitionDisk))\b'; then
  echo "Blocked: Destructive system command is disabled for coding agents." >&2
  exit 2
fi

if echo "$command" | grep -qE '\bgit\s+(commit|merge|rebase|cherry-pick)'; then
  current_branch=$(git branch --show-current 2>/dev/null)

  if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "Blocked: Cannot commit directly to '$current_branch' branch. Create a feature branch first using 'git checkout -b <branch-name>'." >&2
    exit 2
  fi
fi

exit 0
