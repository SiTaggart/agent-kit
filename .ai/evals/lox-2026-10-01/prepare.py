#!/usr/bin/env python3
"""Create independent fixtures and explicit skill snapshots for the LOX pilot."""

import io
import json
import os
import shutil
import subprocess
import tarfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
SCRATCH = Path(os.environ.get('LOX_PILOT_SCRATCH_ROOT', '/private/tmp/agent-kit-lox-replay-2026-10-01-0afa'))
BASELINE = Path('/Users/staggart/.codex/plugins/cache/agent-kit')
TASKS = {
    'pr-description': ('646e2e144ccc521bbd711d0a4ea230fbcbbefef4', 'pr-description', 'writing-pr-descriptions'),
    'plan': ('5875aaf54b4797a29650b4ed5274a7935f7912f2', 'ce-plan', 'drafting-plans'),
    'simplicity': ('5875aaf54b4797a29650b4ed5274a7935f7912f2', 'ce-thermo-nuclear-code-quality-review', 'simplicity-review'),
    'adversarial': ('5875aaf54b4797a29650b4ed5274a7935f7912f2', 'ce-review', 'adversarial-code-reviewing'),
    'auto': (None, 'ce-review', 'auto-review'),
}

def git(cwd, *args):
    return subprocess.check_output(['git', '-C', str(cwd), *args], text=True)

def archive(rev, dest):
    data = subprocess.check_output(['git', '-C', str(REPO), 'archive', rev])
    with tarfile.open(fileobj=io.BytesIO(data)) as tar:
        for member in tar.getmembers():
            if not member.isfile():
                continue
            parts = Path(member.name).parts
            source_catalog = member.name == '.agents/plugins/marketplace.json'
            if member.name.endswith(('AGENTS.md', 'CLAUDE.md')) or (parts[0] in ('.codex', '.agents', '.claude', '.cursor', '.ai') and not source_catalog):
                continue
            target = dest / member.name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(tar.extractfile(member).read())

def commit(cwd, message):
    git(cwd, 'add', '.')
    git(cwd, '-c', 'user.name=LOX Pilot', '-c', 'user.email=pilot@example.invalid', 'commit', '-qm', message)

def setup(task, family, revision):
    dest = SCRATCH / task / family / 'workspace'
    if dest.exists():
        raise RuntimeError(f'Refuse to reuse an existing fixture: {dest}. Select a fresh LOX_PILOT_SCRATCH_ROOT.')
    dest.mkdir(parents=True)
    git(dest, 'init', '-q', '-b', 'pilot')
    if revision:
        archive(f'{revision}^', dest)
        commit(dest, f'Frozen parent of {revision}')
        git(dest, 'branch', 'pilot-base')
        shutil.rmtree(dest / 'plugins')
        archive(revision, dest)
        # Source snapshots deliberately do not contain host/project instructions.
        commit(dest, f'Frozen source snapshot {revision}')
    else:
        (dest / 'retry.py').write_text('''def retry(operation, max_attempts):
    """Call operation at most max_attempts times after transient failure."""
    if max_attempts < 1:
        raise ValueError("max_attempts must be positive")
    for attempt in range(max_attempts):
        try:
            return operation()
        except ConnectionError:
            if attempt == max_attempts - 1:
                raise
''')
        (dest / 'test_retry.py').write_text('''import unittest
from retry import retry

class RetryTests(unittest.TestCase):
    def test_first_attempt_success(self):
        self.assertEqual(retry(lambda: "ok", 3), "ok")

    def test_last_allowed_attempt_can_succeed(self):
        calls = []
        def operation():
            calls.append(1)
            if len(calls) < 3:
                raise ConnectionError("transient")
            return "recovered"
        self.assertEqual(retry(operation, 3), "recovered")
        self.assertEqual(len(calls), 3)

    def test_failure_exhausts_exact_budget(self):
        calls = []
        def operation():
            calls.append(1)
            raise ConnectionError("offline")
        with self.assertRaisesRegex(ConnectionError, "offline"):
            retry(operation, 3)
        self.assertEqual(len(calls), 3)

    def test_invalid_budget_never_calls_operation(self):
        calls = []
        with self.assertRaises(ValueError):
            retry(lambda: calls.append(1), 0)
        self.assertEqual(calls, [])

    def test_other_errors_do_not_retry(self):
        calls = []
        def operation():
            calls.append(1)
            raise RuntimeError("permanent")
        with self.assertRaisesRegex(RuntimeError, "permanent"):
            retry(operation, 3)
        self.assertEqual(len(calls), 1)

if __name__ == "__main__":
    unittest.main()
''')
        (dest / 'README.md').write_text('''# Retry fixture
Retry ConnectionError only. max_attempts includes the first call. Call the operation at most that many times. Return success from the final allowed attempt. Propagate the final ConnectionError and all other errors. Reject budgets below one before calling the operation.

Tests: python3 -B -m unittest -v
Compile: python3 -B -c "import ast, pathlib; [ast.parse(p.read_text()) for p in pathlib.Path('.').glob('*.py')]"
No configured linter or formatter. Do not add dependencies.
''')
        commit(dest, 'Correct retry implementation with existing independent tests')
        git(dest, 'branch', 'pilot-base')
        retry = dest / 'retry.py'
        retry.write_text(retry.read_text().replace('range(max_attempts)', 'range(max_attempts - 1)'))
        commit(dest, 'Candidate retry cleanup')
    git(dest, 'branch', 'pilot-head')
    ignore = dest / '.gitignore'
    ignore.write_text((ignore.read_text() if ignore.exists() else '') + '\n.eval-skills/\n.ai/\n__pycache__/\n')
    skill_root = dest / '.eval-skills'
    if family == 'baseline':
        snapshot = ROOT / 'snapshots/baseline/skills'
        if snapshot.exists():
            shutil.copytree(snapshot, skill_root)
        else:
            for name in ('ce-plan', 'ce-review', 'ce-quality-gate', 'ce-conventions', 'code-taste', 'document-review', 'repo-research-analyst', 'repoprompt', 'docs-researcher', 'web-researcher', 'typescript-advanced-types', 'ce-thermo-nuclear-code-quality-review'):
                shutil.copytree(BASELINE / 'engineering/0.2.10/skills' / name, skill_root / name)
            shutil.copytree(BASELINE / 'git/0.2.2/skills/pr-description', skill_root / 'pr-description')
    else:
        lo = ROOT / 'snapshots/lox/skills'
        if not lo.exists():
            lo = REPO / 'plugins/lox/skills'
        if lo.exists():
            for path in lo.iterdir():
                if path.is_dir():
                    shutil.copytree(path, skill_root / path.name)
        runtime = ROOT / 'snapshots/lox/RUNTIME.md'
        if not runtime.exists():
            runtime = REPO / 'plugins/lox/RUNTIME.md'
        (dest / 'RUNTIME.md').write_bytes(runtime.read_bytes())
        with (dest / '.git/info/exclude').open('a') as handle:
            handle.write('\n/RUNTIME.md\n')
    git(dest, 'add', '.gitignore')
    commit(dest, 'Ignore evaluation artifacts and explicit skill bundle')

def main():
    for task, (revision, baseline, lox) in TASKS.items():
        for family in ('baseline', 'lox'):
            setup(task, family, revision)
    (ROOT / 'fixture-metadata.json').write_text(json.dumps(TASKS, indent=2) + '\n')
    print('Fixtures prepared under', SCRATCH)

if __name__ == '__main__':
    main()
