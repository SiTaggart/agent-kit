import { readdir, writeFile } from "fs/promises";
import path from "path";
import { pathExists, readText } from "./fs";

const START = "<!-- counts:start -->";
const END = "<!-- counts:end -->";

interface PluginSkillCount {
  plugin: string;
  count: number;
}

async function countPluginSkills(repoRoot: string): Promise<PluginSkillCount[]> {
  const pluginsDir = path.join(repoRoot, "plugins");
  const entries = await readdir(pluginsDir, { withFileTypes: true });
  const counts: PluginSkillCount[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const skillsDir = path.join(pluginsDir, entry.name, "skills");
    let count = 0;
    if (await pathExists(skillsDir)) {
      const skills = await readdir(skillsDir, { withFileTypes: true });
      for (const skill of skills) {
        if (!skill.isDirectory()) {
          continue;
        }
        if (await pathExists(path.join(skillsDir, skill.name, "SKILL.md"))) {
          count += 1;
        }
      }
    }

    counts.push({ plugin: entry.name, count });
  }

  counts.sort((left, right) => left.plugin.localeCompare(right.plugin));
  return counts;
}

function renderCountsBlock(counts: readonly PluginSkillCount[]): string {
  const lines = counts.map((row) => {
    const noun = row.count === 1 ? "skill" : "skills";
    return `- ${row.plugin}: ${row.count} ${noun}`;
  });
  return `${START}\n${lines.join("\n")}\n${END}`;
}

function replaceCountsBlock(readme: string, block: string): string {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start < 0 || end < start) {
    throw new Error(`README is missing ${START} and ${END}.`);
  }

  return `${readme.slice(0, start)}${block}${readme.slice(end + END.length)}`;
}

async function main(): Promise<void> {
  const repoRoot = path.resolve(import.meta.dir, "..");
  const readmePath = path.join(repoRoot, "README.md");
  const current = await readText(readmePath);
  const next = replaceCountsBlock(current, renderCountsBlock(await countPluginSkills(repoRoot)));
  if (next === current) {
    return;
  }

  if (process.argv.includes("--check")) {
    console.error("README skill counts differ from plugins/*/skills/*/SKILL.md. Run bun run gen:counts.");
    process.exitCode = 1;
    return;
  }

  await writeFile(readmePath, next);
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
