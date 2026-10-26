import { readdir, writeFile } from "fs/promises";
import path from "path";
import { pathExists, readText } from "./fs";

const START = "<!-- counts:start -->";
const END = "<!-- counts:end -->";

interface PluginSkillCount {
  plugin: string;
  count: number;
}

export async function count(repoRoot: string): Promise<PluginSkillCount[]> {
  const pluginsDir = path.join(repoRoot, "plugins");
  const entries = await readdir(pluginsDir, { withFileTypes: true });
  const counts: PluginSkillCount[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillsDir = path.join(pluginsDir, entry.name, "skills");
    let skillCount = 0;
    if (await pathExists(skillsDir)) {
      const skills = await readdir(skillsDir, { withFileTypes: true });
      for (const skill of skills) {
        if (!skill.isDirectory()) {
          continue;
        }
        if (await pathExists(path.join(skillsDir, skill.name, "SKILL.md"))) {
          skillCount += 1;
        }
      }
    }

    counts.push({ plugin: entry.name, count: skillCount });
  }

  counts.sort((left, right) => left.plugin.localeCompare(right.plugin));
  return counts;
}

export function render(counts: readonly PluginSkillCount[]): string {
  const lines = counts.map((row) => {
    const noun = row.count === 1 ? "skill" : "skills";
    return `- ${row.plugin}: ${row.count} ${noun}`;
  });
  return `${START}\n${lines.join("\n")}\n${END}`;
}

export function replace(readme: string, block: string): string {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start < 0 || end < start) {
    throw new Error(`README is missing ${START} and ${END}.`);
  }

  return `${readme.slice(0, start)}${block}${readme.slice(end + END.length)}`;
}

export async function run(root: string, options: { check: boolean }): Promise<number> {
  const readmePath = path.join(root, "README.md");
  const current = await readText(readmePath);
  const next = replace(current, render(await count(root)));
  if (next === current) {
    return 0;
  }

  if (options.check) {
    console.error("README skill counts differ from plugins/*/skills/*/SKILL.md. Run bun run gen:counts.");
    return 1;
  }

  await writeFile(readmePath, next);
  return 0;
}

async function main(): Promise<void> {
  const code = await run(path.resolve(import.meta.dir, ".."), {
    check: process.argv.includes("--check"),
  });
  process.exitCode = code;
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
