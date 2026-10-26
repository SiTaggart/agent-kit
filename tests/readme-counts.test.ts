import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { run } from "../src/gen-counts";
import { pathExists, readText } from "../src/fs";
import { makeTempRoot, removeTempRoot, writeText } from "./helpers";

const repoRoot = path.resolve(import.meta.dir, "..");
const START = "<!-- counts:start -->";
const END = "<!-- counts:end -->";

test("README counts match the skill tree and gen:counts", async () => {
  const readme = await readText(path.join(repoRoot, "README.md"));
  const block = countsBlock(readme);
  const lines = block.split("\n").filter((line) => line.startsWith("- "));
  const tree = await skillCounts(repoRoot);

  expect(lines.map((line) => line.match(/^- ([a-z0-9-]+): (\d+) skills?$/)?.[1])).toEqual(
    [...tree.keys()].sort((left, right) => left.localeCompare(right)),
  );
  for (const line of lines) {
    const match = line.match(/^- ([a-z0-9-]+): (\d+) skills?$/);
    expect(match, line).not.toBeNull();
    const plugin = match?.[1] ?? "";
    const count = Number(match?.[2]);
    const expectedCount = tree.get(plugin);
    if (expectedCount === undefined) {
      throw new Error(`missing skill count for ${plugin}`);
    }
    expect(count, plugin).toBe(expectedCount);
    const noun = count === 1 ? "skill" : "skills";
    expect(line).toBe(`- ${plugin}: ${count} ${noun}`);
  }

  const check = spawnSync("bun", ["src/gen-counts.ts", "--check"], {
    cwd: repoRoot,
    encoding: "utf8",
  });
  expect(check.status, check.stderr).toBe(0);
});

test("gen:counts --check rejects a stale block and write mode rewrites only that block", async () => {
  const root = await makeTempRoot("agent-kit-counts-");
  const readmePath = path.join(root, "README.md");
  const before = [
    "# Fixture",
    "",
    "keep this intro",
    "",
    "<!-- counts:start -->",
    "- demo: 0 skills",
    "<!-- counts:end -->",
    "",
    "keep this ending",
    "",
  ].join("\n");
  try {
    await writeText(readmePath, before);
    await writeText(path.join(root, "plugins/demo/skills/one/SKILL.md"), "---\nname: one\n---\n");

    const check = await run(root, { check: true });
    expect(check).not.toBe(0);
    expect(await readFile(readmePath, "utf8")).toBe(before);

    const write = await run(root, { check: false });
    expect(write).toBe(0);
    const after = await readFile(readmePath, "utf8");
    expect(after.startsWith("# Fixture\n\nkeep this intro\n\n")).toBe(true);
    expect(after.endsWith("\n\nkeep this ending\n")).toBe(true);
    expect(after).toContain("<!-- counts:start -->\n- demo: 1 skill\n<!-- counts:end -->");
    expect(after).not.toContain("- demo: 0 skills");
  } finally {
    await removeTempRoot(root);
  }
});

function countsBlock(readme: string): string {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  expect(start, "README is missing the counts block").toBeGreaterThanOrEqual(0);
  expect(end, "README is missing the counts block").toBeGreaterThan(start);
  return readme.slice(start + START.length, end).trim();
}

async function skillCounts(repoRoot: string): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const pluginsDir = path.join(repoRoot, "plugins");
  const plugins = await readdir(pluginsDir, { withFileTypes: true });
  for (const plugin of plugins) {
    if (!plugin.isDirectory()) {
      continue;
    }
    const skillsDir = path.join(pluginsDir, plugin.name, "skills");
    let count = 0;
    if (await pathExists(skillsDir)) {
      const skills = await readdir(skillsDir, { withFileTypes: true });
      for (const skill of skills) {
        if (skill.isDirectory() && await pathExists(path.join(skillsDir, skill.name, "SKILL.md"))) {
          count += 1;
        }
      }
    }
    counts.set(plugin.name, count);
  }
  return counts;
}
