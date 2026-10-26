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
    expect(listed.some((entry) => entry.split("\n").includes(".env"))).toBe(false);
  } finally {
    await removeTempRoot(repo);
  }
});

test("cleanup archives an ignored .env and leaves node_modules out of the tar", async () => {
  const repo = await makeTempRoot("exp-worktree-cleanup-");
  try {
    run("git", ["init", "-b", "main"], repo);
    run("git", ["commit", "--allow-empty", "-m", "init"], repo);
    const created = run(script, ["create", "spec", "1", "main"], repo);
    const worktree = created.trim().split("\n").filter(Boolean).at(-1);
    expect(worktree).toBeTruthy();
    if (!worktree) throw new Error("create did not print a worktree path");
    await writeText(path.join(worktree, ".gitignore"), ".env\nnode_modules/\n");
    await writeText(path.join(worktree, ".env"), "TOKEN=local\n");
    await writeText(path.join(worktree, "node_modules", "pkg.js"), "skip\n");

    const cleaned = spawnSync(script, ["cleanup", "spec", "1"], {
      cwd: repo,
      encoding: "utf8",
      env: gitEnv,
    });
    const output = `${cleaned.stdout}\n${cleaned.stderr}`;
    expect(cleaned.status, output).toBe(0);
    expect(existsSync(worktree)).toBe(false);

    const snapshotDir = path.join(repo, ".worktrees", ".snapshots");
    const tars = readdirSync(snapshotDir).filter((name) => name.endsWith(".tar"));
    expect(tars.length, output).toBeGreaterThan(0);
    const archive = tars
      .map((name) => path.join(snapshotDir, name))
      .find((file) => spawnSync("tar", ["-tf", file], { encoding: "utf8" }).stdout.split("\n").includes(".env"));
    expect(archive, output).toBeTruthy();
    if (!archive) throw new Error("cleanup did not archive .env");
    const names = spawnSync("tar", ["-tf", archive], { encoding: "utf8" }).stdout.split("\n");
    expect(names.some((name) => name.split("/").includes("node_modules"))).toBe(false);
    const envFile = spawnSync("tar", ["-xOf", archive, ".env"], { encoding: "utf8" });
    expect(envFile.status, envFile.stderr).toBe(0);
    expect(envFile.stdout).toBe("TOKEN=local\n");
  } finally {
    await removeTempRoot(repo);
  }
});
