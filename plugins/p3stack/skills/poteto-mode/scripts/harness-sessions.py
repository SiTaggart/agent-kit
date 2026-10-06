#!/usr/bin/env python3
"""List local Codex, Claude Code, and Grok Build sessions for exact workspaces.

T3 Code runs every coordinator and delegate inside one of these harnesses, so a
worktree can hold a session from any of them. This reads only the metadata that
names a session's working directory. It never prints message content.
"""
import argparse
import json
import os
import re
import sys
from pathlib import Path
from urllib.parse import unquote

# Claude Code writes the working directory on each record, after a few header records.
CLAUDE_HEADER_LINES = 50


def owning_workspace(cwd, workspaces):
    """Return the deepest workspace that contains cwd, so nested worktrees stay separate."""
    owners = [ws for ws in workspaces if cwd == ws or cwd.startswith(ws + os.sep)]
    return max(owners, key=len) if owners else None


def resolved(path):
    return str(Path(path).resolve())


def codex_sessions(root, workspaces):
    for path in root.rglob('*.jsonl'):
        try:
            with path.open() as stream:
                entry = json.loads(stream.readline())
            meta = entry.get('payload') if isinstance(entry, dict) and entry.get('type') == 'session_meta' else None
            if not isinstance(meta, dict) or not isinstance(meta.get('cwd'), str) or not isinstance(meta.get('id'), str):
                continue
            yield meta['id'], resolved(meta['cwd']), path, path.stat().st_mtime
        except (OSError, ValueError, UnicodeError):
            continue


def claude_project_name(workspace):
    return re.sub(r'[^A-Za-z0-9]', '-', workspace)


def claude_sessions(root, workspaces):
    prefixes = [claude_project_name(ws) for ws in workspaces]
    for project in root.iterdir():
        if not project.is_dir() or not any(project.name == p or project.name.startswith(p + '-') for p in prefixes):
            continue
        for path in project.rglob('*.jsonl'):
            try:
                with path.open() as stream:
                    for _, line in zip(range(CLAUDE_HEADER_LINES), stream):
                        entry = json.loads(line)
                        if isinstance(entry, dict) and isinstance(entry.get('cwd'), str):
                            yield entry.get('sessionId') or path.stem, resolved(entry['cwd']), path, path.stat().st_mtime
                            break
            except (OSError, ValueError, UnicodeError):
                continue


def grok_sessions(root, workspaces):
    for directory in root.iterdir():
        if not directory.is_dir():
            continue
        cwd = resolved(unquote(directory.name))
        if owning_workspace(cwd, workspaces) is None:
            continue
        for session in directory.iterdir():
            if not session.is_dir():
                continue
            try:
                mtime = max((item.stat().st_mtime for item in session.iterdir()), default=session.stat().st_mtime)
            except OSError:
                continue
            yield session.name, cwd, session, mtime


HARNESSES = {
    'codex': (codex_sessions, lambda: Path(os.environ.get('CODEX_HOME', Path.home() / '.codex')) / 'sessions'),
    'claude': (claude_sessions, lambda: Path(os.environ.get('CLAUDE_CONFIG_DIR', Path.home() / '.claude')) / 'projects'),
    'grok': (grok_sessions, lambda: Path(os.environ.get('GROK_HOME', Path.home() / '.grok')) / 'sessions'),
}


def find_sessions(workspaces):
    allowed = [resolved(ws) for ws in workspaces]
    # Harnesses can record the unresolved path, such as /var instead of /private/var.
    spellings = sorted(set(allowed) | {os.path.abspath(ws) for ws in workspaces})
    sessions, unavailable = [], []
    for harness, (scan, default_root) in HARNESSES.items():
        root = default_root()
        if not root.is_dir():
            unavailable.append({'harness': harness, 'root': str(root)})
            continue
        for session_id, cwd, path, mtime in scan(root, spellings):
            workspace = owning_workspace(cwd, allowed)
            if workspace is not None:
                sessions.append({'harness': harness, 'id': session_id, 'workspace': workspace, 'cwd': cwd,
                                 'path': str(path.resolve()), 'mtime': mtime})
    sessions.sort(key=lambda item: item['mtime'], reverse=True)
    return {'sessions': sessions, 'unavailable': unavailable}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--workspace', action='append', required=True)
    result = find_sessions(parser.parse_args().workspace)
    for store in result['unavailable']:
        print(f"{store['harness']} sessions are unavailable at {store['root']}", file=sys.stderr)
    print(json.dumps(result, indent=2))
