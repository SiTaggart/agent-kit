#!/usr/bin/env python3
"""List local Codex sessions by exact workspace metadata, without reading messages."""
import argparse
import json
import os
from pathlib import Path


def find_sessions(root, workspaces):
    allowed = {str(Path(workspace).resolve()) for workspace in workspaces}
    matches = []
    for path in root.rglob('*.jsonl'):
        try:
            with path.open() as stream:
                entry = json.loads(stream.readline())
            if not isinstance(entry, dict) or entry.get('type') != 'session_meta':
                continue
            meta = entry.get('payload')
            if not isinstance(meta, dict) or not isinstance(meta.get('cwd'), str):
                continue
            cwd = str(Path(meta['cwd']).resolve())
            if cwd not in allowed or not isinstance(meta.get('id'), str):
                continue
            matches.append({'id': meta['id'], 'cwd': cwd, 'path': str(path.resolve()),
                            'mtime': path.stat().st_mtime})
        except (OSError, ValueError, UnicodeError):
            continue
    return sorted(matches, key=lambda item: item['mtime'], reverse=True)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--workspace', action='append', required=True)
    parser.add_argument('--sessions-root', type=Path,
                        default=Path(os.environ.get('CODEX_HOME', str(Path.home() / '.codex'))) / 'sessions')
    args = parser.parse_args()
    if not args.sessions_root.is_dir():
        parser.error(f'Codex sessions directory is unavailable: {args.sessions_root}')
    print(json.dumps(find_sessions(args.sessions_root, args.workspace), indent=2))
