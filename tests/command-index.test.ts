import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { makeTempRoot, removeTempRoot, writeText } from "./helpers";

const repoRoot = path.resolve(import.meta.dir, "..");

test("a fixture README naming /nope fails validation", async () => {
  const root = await makeTempRoot("command-index-");
  try {
    await writeText(path.join(root, "README.md"), "Run `/nope` before you continue.\n");
    const cli = spawnSync(process.execPath, ["src/cli.ts", "validate", "--root", root], {
      cwd: repoRoot,
      encoding: "utf8",
    });
    const output = `${cli.stdout}${cli.stderr}`;
    expect(cli.status, output).not.toBe(0);
    expect(output).toContain("/nope");

    const { inspectCommandIndex } = await import("../src/validate");
    expect(typeof inspectCommandIndex).toBe("function");
    const report = await inspectCommandIndex(root);
    expect(report.ok).toBe(false);
    expect(report.failures.some((failure) => failure.path === "README.md" && failure.message.includes("/nope"))).toBe(true);
  } finally {
    await removeTempRoot(root);
  }
});

test("command index accepts this repo", async () => {
  const { inspectCommandIndex } = await import("../src/validate");
  expect(typeof inspectCommandIndex).toBe("function");
  const report = await inspectCommandIndex(repoRoot);
  expect(report.failures).toEqual([]);
  expect(report.ok).toBe(true);
});
