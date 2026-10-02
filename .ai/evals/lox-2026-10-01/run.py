#!/usr/bin/env python3
"""Run fresh paired skill sessions. Model tools remain sandboxed."""

import argparse
import hashlib
import json
import os
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from prepare import ROOT, SCRATCH, TASKS

COMMON = '''Work on this frozen local fixture only. This is a headless user request.
Read the explicitly named skill and its required local companions under .eval-skills. Follow it faithfully; do not load other installed skills, memories, or unrelated repository skills.
The fixture contains sufficient local context. No host metadata, network calls, PR writes, commits, installation, or publication are authorized. Do not request remote metadata for this frozen local task. No external tools or delegation are available; use sequential local passes if required.
Use pilot-base..pilot-head as the exact source changeset. The extra HEAD commit only ignores evaluation artifacts and is outside the target. Base/head source commit identity is given below; do not infer a real PR number from local history.
Do not change source or tests unless this task explicitly authorizes fixes. Resolve routine choices from source. If a blocking answer is genuinely required, ask it and stop. Skip end menus in this headless caller-owned workflow. State proof gaps honestly.
Return the full usable deliverable in your final response. Artifacts may be written only under .ai/ for the planning task. Auto-review may edit retry.py only; tests and README are independent constraints and must remain unchanged.
'''

REQUESTS = {
    'pr-description': '''Draft a copy-ready Conventional Commit PR title and body for the frozen Agent Kit change 646e2e144ccc521bbd711d0a4ea230fbcbbefef4 relative to its parent. Author intent: introduce a standalone task lead for one bounded task, using the existing scout/builder/reviewer roles, while project-control coordinates the portfolio. Retain current-worktree safety and approval boundaries. Use the complete final diff and relevant tests. No tests were run by the caller for this frozen change; do not claim they passed. There is no linked Linear issue or screenshot. Return draft only.''',
    'plan': '''Draft an implementation-ready plan for adding a --check CLI mode to the existing Agent Kit agent-role installer at plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts. Source snapshot is 5875aaf54b4797a29650b4ed5274a7935f7912f2. The user wants a read-only check of the same managed profiles and config that install/status currently inspect. Healthy state exits 0; drift or conflict exits 1; invalid CLI arguments exit 2. Reuse existing status/inspection behavior where suitable. --check must never write roles, config, ledger, directories, temp files, or backups. Preserve install/status behavior and user-owned conflicting profiles. No new dependency or adjacent setup changes. Inspect existing CLI parsing, consumers and tests. Planning only: do not implement or run runtime tests. Write a Markdown plan under .ai/plans and include it in your final response.''',
    'simplicity': '''Perform a review-only simplicity/maintainability review of frozen Agent Kit change 5875aaf54b4797a29650b4ed5274a7935f7912f2 against its parent. Author intent: repair project-control role setup so agent TOML/config is compatible, existing managed installations can be repaired, user-owned profiles are protected, and documented behavior matches the setup tool. Inspect changed installer, assets, docs, tests and direct consumers. Preserve required drift detection, checksum ownership and config safety. Suggest concrete smaller replacements only when they reduce resulting complexity and preserve this contract; an already-simple verdict is acceptable. Cite changed lines. Do not apply fixes.''',
    'adversarial': '''Perform a quick, review-only ship-risk review of frozen Agent Kit change 5875aaf54b4797a29650b4ed5274a7935f7912f2 against its parent. Author intent: repair project-control role setup so agent TOML/config is compatible, existing managed installations can be repaired, user-owned profiles are protected, and documented behavior matches the setup tool. Inspect changed installer, assets, docs, tests and direct consumers. Prioritize concrete bugs introduced or worsened by this diff. Cite changed lines, realistic failing conditions and consequences. Distinguish reproduced findings from source-only concerns. No issue verdict is acceptable. Do not change tracked files.''',
    'auto': '''Review and fix the candidate retry cleanup in pilot-base..pilot-head. The README defines the preserved user contract. Existing independent tests must stay unchanged. You may fix retry.py only, run relevant tests and compile checks, then recheck the changed code. Resolve verified faults and make the result usable within that scope. No host review, commit, PR, publication or metadata workflow is requested. Stop after the authorized local review/fix/validation loop and report what was proven.''',
}

def hash_source(workspace):
    raw = subprocess.check_output(['git', '-C', str(workspace), 'diff', 'pilot-base..pilot-head'])
    return hashlib.sha256(raw).hexdigest()

def run_one(task, family, timeout):
    directory = ROOT / 'runs' / task / family
    directory.mkdir(parents=True, exist_ok=True)
    if (directory / 'events.jsonl').exists():
        raise RuntimeError(f'Refuse to overwrite recorded pilot evidence: {directory}. Copy the pilot directory before a new campaign.')
    workspace = SCRATCH / task / family / 'workspace'
    selected = TASKS[task][1 if family == 'baseline' else 2]
    primary = workspace / '.eval-skills' / selected / 'SKILL.md'
    if not primary.exists():
        raise RuntimeError(f'Missing skill snapshot: {primary}')
    prefix = f'Read .eval-skills/{selected}/SKILL.md and apply it to the request below.\n'
    if task == 'auto' and family == 'baseline':
        prefix += 'This baseline has no single auto-review skill. Use ce-review quick for the review-only phase; after its report, apply verified fixes under the explicit authorization below, then run ce-quality-gate as a sub-step and do a focused ce-review recheck. Read .eval-skills/ce-quality-gate/SKILL.md as well. This is a composed workflow, not a directly equivalent packaged skill.\n'
    prompt = prefix + COMMON + '\nREQUEST\n' + REQUESTS[task]
    (directory / 'prompt.txt').write_text(prompt)
    argv = ['codex', 'exec', '--ignore-user-config', '--ephemeral', '--json', '--color', 'never', '--cd', str(workspace), '--sandbox', 'workspace-write' if task in ('plan', 'auto') else 'read-only', '-m', 'gpt-6.1-sol', '-c', 'model_reasoning_effort="high"', '-c', 'project_doc_max_bytes=0', '-c', 'mcp_servers={}', '-c', 'web_search="disabled"', '-c', 'memories.generate_memories=false', '-c', 'memories.use_memories=false', '--enable', 'skip_host_skill_discovery']
    for feature in ('memories', 'plugins', 'apps', 'hooks', 'multi_agent', 'multi_agent_v2', 'skill_search'):
        argv.extend(['--disable', feature])
    argv += ['--output-last-message', str(directory / 'final.md'), '-']
    metadata = {'task': task, 'family': family, 'selected_skill': selected, 'model': 'gpt-6.1-sol', 'effort': 'high', 'argv': argv, 'prompt_sha256': hashlib.sha256(prompt.encode()).hexdigest(), 'source_diff_sha256': hash_source(workspace), 'skill_sha256': hashlib.sha256(primary.read_bytes()).hexdigest(), 'timeout_seconds': timeout}
    metadata['skill_bundle_hashes'] = {str(p.relative_to(workspace)): hashlib.sha256(p.read_bytes()).hexdigest() for p in sorted((workspace / '.eval-skills').rglob('*')) if p.is_file()}
    if (workspace / 'RUNTIME.md').exists():
        metadata['runtime_sha256'] = hashlib.sha256((workspace / 'RUNTIME.md').read_bytes()).hexdigest()
    environment = os.environ.copy()
    environment['RUST_LOG'] = 'error'
    started = time.monotonic()
    try:
        with (directory / 'events.jsonl').open('w') as out, (directory / 'stderr.log').open('w') as err:
            result = subprocess.run(argv, input=prompt, text=True, stdout=out, stderr=err, env=environment, timeout=timeout)
        metadata['exit_code'] = result.returncode
    except subprocess.TimeoutExpired:
        metadata['exit_code'] = None
        metadata['timed_out'] = True
    metadata['wall_seconds'] = round(time.monotonic() - started, 2)
    metadata['final_exists'] = (directory / 'final.md').exists()
    events = []
    for line in (directory / 'events.jsonl').read_text().splitlines():
        try:
            events.append(json.loads(line))
        except ValueError:
            pass
    metadata['usage'] = next((e.get('usage') for e in reversed(events) if e.get('type') == 'turn.completed'), None)
    metadata['startup_errors'] = [e['item'].get('message', '') for e in events if e.get('type') == 'item.completed' and e.get('item', {}).get('type') == 'error']
    metadata['command_count'] = sum(e.get('type') == 'item.completed' and e.get('item', {}).get('type') == 'command_execution' for e in events)
    metadata['working_tree_after'] = subprocess.check_output(['git', '-C', str(workspace), 'status', '--short'], text=True)
    (directory / 'metadata.json').write_text(json.dumps(metadata, indent=2) + '\n')
    print(f'{task}/{family}: exit={metadata["exit_code"]}, seconds={metadata["wall_seconds"]}, final={metadata["final_exists"]}', flush=True)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--task', choices=TASKS, action='append')
    parser.add_argument('--family', choices=('baseline', 'lox'), action='append')
    parser.add_argument('--timeout', type=int, default=300)
    parser.add_argument('--jobs', type=int, default=2)
    args = parser.parse_args()
    with ThreadPoolExecutor(max_workers=args.jobs) as executor:
        futures = [executor.submit(run_one, task, family, args.timeout) for task in (args.task or TASKS) for family in (args.family or ('baseline', 'lox'))]
        for future in futures:
            future.result()

if __name__ == '__main__':
    main()
