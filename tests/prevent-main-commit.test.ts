import { afterEach, expect, test } from "bun:test";
import { cp, symlink } from "fs/promises";
import path from "path";
import { makeTempRoot, removeTempRoot } from "./helpers";

const tempRoots: string[] = [];
const hookPath = path.resolve(import.meta.dir, "..", "plugins", "hooks", "hooks", "scripts", "prevent-main-commit.sh");
const cursorWrapperPath = path.resolve(import.meta.dir, "..", "plugins", "hooks", "hooks", "scripts", "cursor-shell-hook.sh");

afterEach(async () => {
  await Promise.all(tempRoots.map(removeTempRoot));
  tempRoots.length = 0;
});

test("hook commands run with only the Hooks plugin installed", async () => {
  const installedRoot = await makeTempRoot("installed-hooks-");
  tempRoots.push(installedRoot);
  await cp(path.resolve(import.meta.dir, "..", "plugins", "hooks"), installedRoot, { recursive: true });
  const claudeConfig = await Bun.file(path.join(installedRoot, "hooks/hooks.json")).json();
  const cursorConfig = await Bun.file(path.join(installedRoot, "hooks/cursor.json")).json();
  const commands = [
    claudeConfig.hooks.PreToolUse[0].hooks[0].command,
    cursorConfig.hooks.beforeShellExecution[0].command,
  ];
  for (const command of commands) {
    const child = Bun.spawn(["/bin/bash", "-c", command], {
      cwd: installedRoot,
      env: { ...process.env, CLAUDE_PLUGIN_ROOT: installedRoot },
      stdin: new Blob([JSON.stringify({ command: "git status", cwd: installedRoot })]),
      stdout: "pipe",
      stderr: "pipe",
    });
    expect(await child.exited).toBe(0);
    expect(await new Response(child.stderr).text()).toBe("");
  }
});

test("fails closed when hook input cannot be parsed", async () => {
  const result = await runHook({ input: "not json" });

  expect(result.exitCode).toBe(2);
  expect(result.stderr).toContain("Could not parse hook input");
});

test("blocks commit operations on main", async () => {
  const repo = await makeTempRoot("agents-hook-main-");
  tempRoots.push(repo);
  await Bun.$`git -C ${repo} init -b main`.quiet();

  const result = await runHook({
    cwd: repo,
    input: JSON.stringify({ tool_input: { command: "git commit -m test" } }),
  });

  expect(result.exitCode).toBe(2);
  expect(result.stderr).toContain("Cannot commit directly to 'main'");
});

test.each([
  "rm -rf build",
  "rm -r build",
  "find . -delete",
  "truncate -s 0 data.db",
  "git reset --hard HEAD",
  "git clean -fd",
  "git checkout -- .",
  "git restore file.txt",
  "git stash clear",
  "git push --force origin main",
  "terraform destroy",
  "docker system prune -af",
  "docker volume prune",
  "docker compose down -v",
  "kubectl delete namespace production",
  "kubectl delete pods --all",
  "chmod -R 000 .",
  "sudo chown -R root /tmp/example",
  "dd if=/dev/zero of=/dev/disk1",
  "mkfs.ext4 /dev/disk1",
  "diskutil eraseDisk APFS Empty /dev/disk4",
])(
  "blocks destructive command: %s",
  async (command) => {
    const result = await runHook({
      input: JSON.stringify({ tool_input: { command } }),
    });

    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Blocked:");
  },
);

test("allows non-commit commands", async () => {
  const result = await runHook({
    input: JSON.stringify({ tool_input: { command: "git status" } }),
  });

  expect(result.exitCode).toBe(0);
});

test("reads Cursor beforeShellExecution payloads", async () => {
  const result = await runHook({
    input: JSON.stringify({ command: "rm -rf build", cwd: "/tmp", sandbox: false }),
  });

  expect(result.exitCode).toBe(2);
  expect(result.stderr).toContain("Blocked:");
});

test("allows push with force-with-lease", async () => {
  const result = await runHook({
    input: JSON.stringify({ tool_input: { command: "git push --force-with-lease" } }),
  });

  expect(result.exitCode).toBe(0);
});

test("extracts commands without jq on PATH", async () => {
  const pathWithoutJq = await makePathWithoutJq();
  const allowed = await runHook({
    env: { PATH: pathWithoutJq },
    input: JSON.stringify({ tool_input: { command: "git status" } }),
  });
  const blocked = await runHook({
    env: { PATH: pathWithoutJq },
    input: JSON.stringify({ command: "rm -rf build", cwd: "/tmp", sandbox: false }),
  });

  expect(allowed.exitCode).toBe(0);
  expect(blocked.exitCode).toBe(2);
  expect(blocked.stderr).toContain("Blocked:");
});

test("Cursor wrapper prints allow JSON for git status", async () => {
  const result = await runCursorWrapper({
    input: JSON.stringify({ command: "git status", cwd: "/tmp", sandbox: false }),
  });

  expect(JSON.parse(result.stdout)).toEqual({ permission: "allow" });
});

test("Cursor wrapper prints deny JSON for rm -rf build", async () => {
  const result = await runCursorWrapper({
    input: JSON.stringify({ command: "rm -rf build", cwd: "/tmp", sandbox: false }),
  });
  const body = JSON.parse(result.stdout) as {
    permission: string;
    agent_message?: string;
    user_message?: string;
  };

  expect(body.permission).toBe("deny");
  expect(body.agent_message).toContain("Blocked:");
  expect(body.user_message).toContain("Blocked:");
});

interface HookRunOptions {
  cwd?: string;
  env?: Record<string, string>;
  input: string;
}

async function runHook(options: HookRunOptions): Promise<{ exitCode: number; stderr: string }> {
  return await runScript(hookPath, options);
}

async function runCursorWrapper(
  options: HookRunOptions,
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  return await runScript(cursorWrapperPath, options);
}

async function runScript(
  scriptPath: string,
  options: HookRunOptions,
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const child = Bun.spawn(["/bin/bash", scriptPath], {
    cwd: options.cwd,
    env: {
      ...process.env,
      ...options.env,
    },
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });

  child.stdin.write(options.input);
  child.stdin.end();

  return {
    exitCode: await child.exited,
    stdout: await new Response(child.stdout).text(),
    stderr: await new Response(child.stderr).text(),
  };
}

async function makePathWithoutJq(): Promise<string> {
  const bin = await makeTempRoot("hook-path-");
  tempRoots.push(bin);
  const python3 = Bun.which("python3");
  const grep = Bun.which("grep");
  const cat = Bun.which("cat");
  if (!python3 || !grep || !cat) {
    throw new Error("python3, grep, and cat are required for the jq-free hook test");
  }

  await Promise.all([
    symlink(python3, path.join(bin, "python3")),
    symlink(grep, path.join(bin, "grep")),
    symlink(cat, path.join(bin, "cat")),
  ]);

  return bin;
}
