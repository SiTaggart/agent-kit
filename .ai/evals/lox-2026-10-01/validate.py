#!/usr/bin/env python3
"""Check paired inputs, local scope, and independent auto-loop behavior."""

import hashlib
import json
import re
import subprocess
from pathlib import Path
from prepare import ROOT, TASKS

def main():
    report = {}
    for task in TASKS:
        report[task] = {}
        for family in ('baseline', 'lox'):
            directory = ROOT / 'runs' / task / family
            metadata_file = directory / 'metadata.json'
            if not metadata_file.exists():
                continue
            metadata = json.loads(metadata_file.read_text())
            workspace = Path(metadata.get('workspace_preserved_at', directory / 'workspace'))
            metadata['skill_bundle_hashes'] = {str(p.relative_to(workspace)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((workspace / '.eval-skills').rglob('*')) if p.is_file()}
            if (workspace / 'RUNTIME.md').exists():
                metadata['runtime_sha256'] = hashlib.sha256((workspace / 'RUNTIME.md').read_bytes()).hexdigest()
            commands = []
            for raw in (directory / 'events.jsonl').read_text().splitlines():
                event = json.loads(raw)
                item = event.get('item', {})
                if event.get('type') == 'item.completed' and item.get('type') == 'command_execution':
                    commands.append(item.get('command', ''))
            references = sorted(set(p for cmd in commands for p in re.findall(r'\.eval-skills/[A-Za-z0-9_./-]+', cmd) if (workspace / p).is_file()))
            metadata['command_referenced_skill_files'] = references
            metadata_file.write_text(json.dumps(metadata, indent=2) + '\n')
            current = subprocess.check_output(['git', '-C', str(workspace), 'diff', '--name-only'], text=True).splitlines()
            entry = {'completed': metadata.get('exit_code') == 0 and metadata.get('final_exists', False), 'changed_tracked_files': current, 'out_of_scope_tracked_edits': [p for p in current if task != 'auto' or p != 'retry.py']}
            if task == 'auto':
                base_test = subprocess.check_output(['git', '-C', str(workspace), 'show', 'pilot-head:test_retry.py'])
                entry['independent_tests_unchanged'] = base_test == (workspace / 'test_retry.py').read_bytes()
                base_readme = subprocess.check_output(['git', '-C', str(workspace), 'show', 'pilot-head:README.md'])
                entry['readme_unchanged'] = base_readme == (workspace / 'README.md').read_bytes()
                tested = subprocess.run(['python3', '-B', '-m', 'unittest', '-v'], cwd=workspace, text=True, capture_output=True)
                (directory / 'independent-validation.log').write_text(tested.stdout + tested.stderr)
                entry['independent_test_exit'] = tested.returncode
                (directory / 'resulting.patch').write_bytes(subprocess.check_output(['git', '-C', str(workspace), 'diff']))
                (directory / 'retry.py').write_bytes((workspace / 'retry.py').read_bytes())
            report[task][family] = entry
        if len(report[task]) == 2:
            a = json.loads((ROOT / 'runs' / task / 'baseline/metadata.json').read_text())
            b = json.loads((ROOT / 'runs' / task / 'lox/metadata.json').read_text())
            report[task]['paired_source_diff_identical'] = a['source_diff_sha256'] == b['source_diff_sha256']
    (ROOT / 'validation.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__':
    main()
