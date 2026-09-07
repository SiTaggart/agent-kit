#!/usr/bin/env bash
# Discover session files across Claude Code, Codex, and Cursor.
#
# Usage: discover-sessions.sh <repo-name|--all-repos> <days> [--platform claude|codex|cursor]
#
# Outputs one file path per line. Safe in both bash and zsh (all globs guarded).
# Pass output to extract-metadata.py:
#   python3 extract-metadata.py --cwd-filter <repo-name> $(bash discover-sessions.sh <repo-name> 7)
#
# Arguments:
#   repo-name  Folder name of the repo (e.g., "my-repo"), or --all-repos.
#   days       Scan window in days (e.g., 7). Files older than this are skipped.
#   --platform Restrict to a single platform. Omit to search all.

set -euo pipefail

REPO_NAME="${1:?Usage: discover-sessions.sh <repo-name|--all-repos> <days> [--platform claude|codex|cursor]}"
DAYS="${2:?Usage: discover-sessions.sh <repo-name|--all-repos> <days> [--platform claude|codex|cursor]}"
PLATFORM="${4:-all}"

# Parse optional --platform flag
shift 2
while [ $# -gt 0 ]; do
    case "$1" in
        --platform) PLATFORM="$2"; shift 2 ;;
        *) shift ;;
    esac
done

# --- Claude Code ---
discover_claude() {
    local base="$HOME/.claude/projects"
    [ -d "$base" ] || return 0

    local project_dirs=("$base"/*/)
    if [ "$REPO_NAME" != "--all-repos" ]; then
        local encoded_repo_name="${REPO_NAME//./-}"
        project_dirs=("$base"/*"$encoded_repo_name"*/)
    fi

    for dir in "${project_dirs[@]}"; do
        [ -d "$dir" ] || continue
        find "$dir" -maxdepth 1 -name "*.jsonl" -mtime "-${DAYS}" 2>/dev/null
    done
}

# --- Codex ---
discover_codex() {
    for base in \
        "$HOME/.codex/sessions" \
        "$HOME/.agents/sessions" \
        "$HOME/Library/Application Support/orca/codex-runtime-home/home/sessions"; do
        [ -d "$base" ] || continue

        # Use mtime-based discovery (consistent with Claude/Cursor) so that
        # sessions started before the scan window but still active within it
        # are not missed.
        find "$base" -name "*.jsonl" -mtime "-${DAYS}" 2>/dev/null
    done | awk -F/ '!seen[$NF]++'
}

# --- Cursor ---
discover_cursor() {
    local base="$HOME/.cursor/projects"
    [ -d "$base" ] || return 0

    local project_dirs=("$base"/*/)
    if [ "$REPO_NAME" != "--all-repos" ]; then
        local encoded_repo_name="${REPO_NAME//./-}"
        project_dirs=("$base"/*"$encoded_repo_name"*/)
    fi

    for dir in "${project_dirs[@]}"; do
        [ -d "$dir" ] || continue
        local transcripts="${dir}agent-transcripts"
        [ -d "$transcripts" ] || continue
        find "$transcripts" -name "*.jsonl" -mtime "-${DAYS}" 2>/dev/null
    done
}

discover() {
    case "$PLATFORM" in
        claude)  discover_claude ;;
        codex)   discover_codex ;;
        cursor)  discover_cursor ;;
        all)
            discover_claude
            discover_codex
            discover_cursor
            ;;
        *)
            echo "Unknown platform: $PLATFORM" >&2
            exit 1
            ;;
    esac
}

discover
