import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { makeTempRoot, readText, removeTempRoot, writeText } from "./helpers";

const script = path.resolve(
  import.meta.dir,
  "../plugins/engineering/skills/ce-optimize/scripts/experiment-worktree.sh",
);
const gitEnv = {
  ...process.env,
  GIT_AUTHOR_NAME: "Guard Test",
  GIT_AUTHOR_EMAIL: "guard@example.com",
  GIT_COMMITTER_NAME: "Guard Test",
  GIT_COMMITTER_EMAIL: "guard@example.com",
};

function run(command: string, args: readonly string[], cwd: string): string {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", env: gitEnv });
  expect(result.status, `${result.stdout}\n${result.stderr}`).toBe(0);
  return result.stdout;
}

test("rerunning create keeps an ignored .env and snapshots scratch.txt", async () => {
  const repo = await makeTempRoot("exp-worktree-");
  try {
    run("git", ["init", "-b", "main"], repo);
    run("git", ["commit", "--allow-empty", "-m", "init"], repo);
    const created = run(script, ["create", "spec", "1", "main"], repo);
    const worktree = created.trim().split("\n").filter(Boolean).at(-1);
    expect(worktree).toBeTruthy();
    if (!worktree) throw new Error("create did not print a worktree path");
    const envFile = path.join(worktree, ".env");
    await writeText(path.join(worktree, ".gitignore"), ".env\n");
    await writeText(envFile, "TOKEN=local\n");
    await writeText(path.join(worktree, "scratch.txt"), "scratch\n");

    const rerun = spawnSync(script, ["create", "spec", "1", "main"], {
      cwd: repo,
      encoding: "utf8",
      env: gitEnv,
    });
    const output = `${rerun.stdout}\n${rerun.stderr}`;
    expect(rerun.status, output).toBe(0);
    expect(await readText(envFile)).toBe("TOKEN=local\n");
    expect(existsSync(path.join(worktree, "scratch.txt"))).toBe(false);

    const snapshotDir = path.join(repo, ".worktrees", ".snapshots");
    const tars = existsSync(snapshotDir) ? readdirSync(snapshotDir).filter((name) => name.endsWith(".tar")) : [];
    expect(tars.length, output).toBeGreaterThan(0);
    const listed = tars.map((name) => spawnSync("tar", ["-tf", path.join(snapshotDir, name)], { encoding: "utf8" }).stdout);
    expect(listed.some((entry) => entry.split("\n").includes("scratch.txt"))).toBe(true);
  } finally {
    await removeTempRoot(repo);
  }
});
