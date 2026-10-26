import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { makeTempRoot, removeTempRoot } from "./helpers";

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

test("rerunning create keeps an untracked worktree file in a snapshot or refuses to discard it", async () => {
  const repo = await makeTempRoot("exp-worktree-");
  try {
    run("git", ["init", "-b", "main"], repo);
    run("git", ["commit", "--allow-empty", "-m", "init"], repo);
    const created = run(script, ["create", "spec", "1", "main"], repo);
    const worktree = created.trim().split("\n").filter(Boolean).at(-1);
    expect(worktree).toBeTruthy();
    if (!worktree) throw new Error("create did not print a worktree path");
    const untracked = path.join(worktree, "notes.txt");
    await writeFile(untracked, "keep me\n");

    const rerun = spawnSync(script, ["create", "spec", "1", "main"], {
      cwd: repo,
      encoding: "utf8",
      env: gitEnv,
    });
    if (rerun.status !== 0) {
      expect(existsSync(untracked), `${rerun.stdout}\n${rerun.stderr}`).toBe(true);
      expect(`${rerun.stdout}\n${rerun.stderr}`).toContain("notes.txt");
      return;
    }

    const snapshotDir = path.join(repo, ".worktrees", ".snapshots");
    const tars = existsSync(snapshotDir) ? readdirSync(snapshotDir).filter((name) => name.endsWith(".tar")) : [];
    expect(tars.length, `${rerun.stdout}\n${rerun.stderr}`).toBeGreaterThan(0);
    const listed = tars.map((name) => spawnSync("tar", ["-tf", path.join(snapshotDir, name)], { encoding: "utf8" }).stdout);
    expect(listed.some((entry) => entry.split("\n").includes("notes.txt"))).toBe(true);
  } finally {
    await removeTempRoot(repo);
  }
});
