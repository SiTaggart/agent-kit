import { readdir } from "fs/promises";
import path from "path";
import { pathExists, readText } from "./fs";
import { HARNESSES, MARKETPLACE_ID, PLUGIN_IDS, RETIRED_PATHS, type HarnessAdapter, type PluginId } from "./plugin-bundle";

export interface ValidationFailure {
  path: string;
  message: string;
}

export interface ValidationReport {
  ok: boolean;
  failures: readonly ValidationFailure[];
}

const COMPONENT_KEYS = new Set([
  "skills", "hooks", "rules", "agents", "commands", "mcpServers", "apps", "instructions",
]);

export async function validatePluginBundle(root: string): Promise<ValidationReport> {
  const failures: ValidationFailure[] = [];
  const adapters = [...new Set(Object.values(HARNESSES))];

  for (const relPath of RETIRED_PATHS) {
    if (await pathExists(path.join(root, relPath))) {
      failures.push({ path: relPath, message: "Retired path must be removed." });
    }
  }

  for (const adapter of adapters) {
    await inspectJson(root, adapter.marketplacePath, (document) => {
      return inspectMarketplace(document, adapter);
    }, failures);

    for (const id of adapter.pluginIds) {
      const pluginRoot = `plugins/${id}`;
      const manifestPath = `${pluginRoot}/${adapter.manifestPath}`;
      await inspectJson(root, manifestPath, (document) => {
        return inspectPluginManifest(document, adapter, manifestPath, id);
      }, failures);

      if (id === "hooks") {
        const configPath = `${pluginRoot}/${adapter.hooksPath}`;
        await requirePath(root, configPath, failures);
        if (await pathExists(path.join(root, configPath))) {
          const script = adapter.kind === "cursor-plugin" ? "cursor-shell-hook.sh" : "prevent-main-commit.sh";
          if (!(await readText(path.join(root, configPath))).includes(script)) {
            failures.push({ path: configPath, message: `Hook config must name ${script}.` });
          }
        }
      }
    }
  }

  for (const id of PLUGIN_IDS) {
    const pluginRoot = `plugins/${id}`;
    await requirePath(root, `${pluginRoot}/README.md`, failures);
    if (id === "hooks") {
      if (await pathExists(path.join(root, pluginRoot, "skills"))) {
        failures.push({ path: `${pluginRoot}/skills`, message: "Hooks must not bundle skills." });
      }
    } else {
      await requirePath(root, `${pluginRoot}/skills`, failures);
      if (await pathExists(path.join(root, pluginRoot, "hooks"))) {
        failures.push({ path: `${pluginRoot}/hooks`, message: "Command safeguards belong only in the hooks plugin." });
      }
    }
  }
  for (const script of ["prevent-main-commit.sh", "cursor-shell-hook.sh"]) {
    await requirePath(root, `plugins/hooks/hooks/scripts/${script}`, failures);
  }
  const wrapper = "plugins/hooks/hooks/scripts/cursor-shell-hook.sh";
  if (await pathExists(path.join(root, wrapper)) && !(await readText(path.join(root, wrapper))).includes("prevent-main-commit.sh")) {
    failures.push({ path: wrapper, message: "Cursor wrapper must call the shared policy script." });
  }

  return { ok: failures.length === 0, failures };
}

const HARNESS_COMMANDS = new Set(["loop", "plugin", "plugins", "review"]);
const FILESYSTEM_COMMAND_TOKENS = new Set(["tmp"]);
const COMMAND_NAME = String.raw`[a-z][a-z0-9]*?(?:-[a-z0-9]+)*`;

export async function inspectCommandIndex(root: string): Promise<ValidationReport> {
  const failures: ValidationFailure[] = [];
  const skills = new Map<string, string[]>();
  for (const rel of await skillFiles(root)) {
    const dir = path.basename(path.dirname(rel));
    const owners = skills.get(dir) ?? [];
    owners.push(rel);
    skills.set(dir, owners);
    const frontmatter = frontmatterName(await readText(path.join(root, rel)));
    if (frontmatter !== dir) {
      failures.push({
        path: rel,
        message: `Frontmatter name ${JSON.stringify(frontmatter)} must equal the directory name ${JSON.stringify(dir)}.`,
      });
    }
  }

  for (const rel of await commandSources(root)) {
    const text = await readText(path.join(root, rel));
    for (const name of commandNames(text)) {
      if (HARNESS_COMMANDS.has(name)) continue;
      const owners = skills.get(name) ?? [];
      if (owners.length === 1) continue;
      const message = owners.length === 0
        ? `Slash command /${name} does not resolve to plugins/*/skills/${name}/SKILL.md.`
        : `Slash command /${name} resolves to more than one skill: ${owners.join(", ")}.`;
      failures.push({ path: rel, message });
    }
  }

  failures.sort((left, right) => left.path.localeCompare(right.path) || left.message.localeCompare(right.message));
  return { ok: failures.length === 0, failures };
}

async function commandSources(root: string): Promise<readonly string[]> {
  const sources = ["README.md", ...await pluginReadmes(root), ...await skillFiles(root)];
  const present: string[] = [];
  for (const rel of sources) {
    if (await pathExists(path.join(root, rel))) present.push(rel);
  }
  return present;
}

async function pluginReadmes(root: string): Promise<readonly string[]> {
  const pluginsDir = path.join(root, "plugins");
  if (!(await pathExists(pluginsDir))) return [];
  const names = (await readdir(pluginsDir)).sort();
  const files: string[] = [];
  for (const name of names) {
    const rel = `plugins/${name}/README.md`;
    if (await pathExists(path.join(root, rel))) files.push(rel);
  }
  return files;
}

async function skillFiles(root: string): Promise<readonly string[]> {
  const pluginsDir = path.join(root, "plugins");
  if (!(await pathExists(pluginsDir))) return [];
  const files: string[] = [];
  for (const plugin of (await readdir(pluginsDir)).sort()) {
    const skillsDir = path.join(pluginsDir, plugin, "skills");
    if (!(await pathExists(skillsDir))) continue;
    for (const skill of (await readdir(skillsDir)).sort()) {
      const rel = `plugins/${plugin}/skills/${skill}/SKILL.md`;
      if (await pathExists(path.join(root, rel))) files.push(rel);
    }
  }
  return files;
}

function commandNames(text: string): readonly string[] {
  const commandStart = new RegExp(
    String.raw`^/(?<name>${COMMAND_NAME})(?::(?<skill>${COMMAND_NAME}))?(?:[\s]|$|[.,;:!?])`,
  );
  const lineCommand = new RegExp(
    String.raw`^\s*/(?<name>${COMMAND_NAME})(?::(?<skill>${COMMAND_NAME}))?(?![\w/.-])`,
    "gm",
  );
  const bareCommand = new RegExp(
    String.raw`(?<![\w./<>'"{}])/(?<name>${COMMAND_NAME})(?::(?<skill>${COMMAND_NAME}))?(?![\w/.-])`,
    "g",
  );
  const found = new Set<string>();
  for (const match of text.matchAll(/`([^`]*)`/g)) addSpan(found, commandStart, match[1] ?? "");
  for (const match of text.matchAll(/"([^"\n]*)"/g)) addSpan(found, commandStart, match[1] ?? "");
  for (const match of text.matchAll(lineCommand)) addName(found, match.groups);
  for (const match of text.matchAll(bareCommand)) addName(found, match.groups);
  return [...found].sort();
}

function addSpan(found: Set<string>, commandStart: RegExp, content: string): void {
  const text = content.trim();
  if (/^\/[a-z0-9-]+\//.test(text)) return;
  addName(found, commandStart.exec(text)?.groups);
}

function addName(found: Set<string>, groups: { name?: string; skill?: string } | undefined): void {
  const name = groups?.skill || groups?.name;
  if (!name || FILESYSTEM_COMMAND_TOKENS.has(name)) return;
  found.add(name);
}

function frontmatterName(text: string): string | undefined {
  if (!text.startsWith("---\n") && !text.startsWith("---\r\n")) return undefined;
  const end = text.indexOf("\n---", 3);
  if (end === -1) return undefined;
  const block = text.slice(text.indexOf("\n") + 1, end);
  for (const line of block.split(/\r?\n/)) {
    const match = /^name:\s*(.*?)\s*$/.exec(line);
    if (!match) continue;
    return (match[1] ?? "").replace(/^['"]|['"]$/g, "");
  }
  return undefined;
}

export function namesInstructionFile(value: string): boolean {
  const normalized = value.trim().replace(/\\/g, "/").toLowerCase();
  const base = normalized.split("/").pop();
  return base === "agents.md" || base === "claude.md";
}

export function inspectPluginManifest(
  document: unknown,
  adapter: HarnessAdapter,
  relPath: string,
  id: PluginId,
): readonly ValidationFailure[] {
  const failures: ValidationFailure[] = [];
  const record = asRecord(document);
  if (!record) return [{ path: relPath, message: "Plugin manifest must be a JSON object." }];
  if (record.name !== id) failures.push({ path: relPath, message: `Plugin name must be ${id}.` });

  if (id === "hooks") {
    if ("skills" in record) failures.push({ path: relPath, message: "Hooks must not declare skills." });
    if (adapter.kind === "claude-plugin") {
      if ("hooks" in record) {
        failures.push({ path: relPath, message: "Claude loads hooks/hooks.json automatically; do not declare it again." });
      }
    } else {
      checkPath(record.hooks, adapter.hooksPath, relPath, "hooks", failures);
    }
  } else {
    checkPath(record.skills, "skills/", relPath, "skills", failures);
    if ("hooks" in record) failures.push({ path: relPath, message: "Command safeguards belong only in the hooks plugin." });
  }

  if (adapter.kind === "cursor-plugin" && "rules" in record) {
    failures.push({ path: relPath, message: "Cursor plugin must not declare rules." });
  }
  for (const value of componentStrings(record)) {
    if (namesInstructionFile(value)) {
      failures.push({ path: relPath, message: `Plugin components must not include ${path.basename(value)}.` });
    }
  }
  return failures;
}

function inspectMarketplace(document: unknown, adapter: HarnessAdapter): readonly ValidationFailure[] {
  const relPath = adapter.marketplacePath;
  const record = asRecord(document);
  if (!record) return [{ path: relPath, message: "Marketplace catalog must be a JSON object." }];
  const failures: ValidationFailure[] = [];
  if (record.name !== MARKETPLACE_ID) failures.push({ path: relPath, message: `Marketplace name must be ${MARKETPLACE_ID}.` });
  if (adapter.kind !== "codex-plugin") {
    const owner = asRecord(record.owner);
    if (typeof owner?.name !== "string" || !owner.name) {
      failures.push({ path: relPath, message: "Marketplace must include owner.name." });
    }
  }
  if (!Array.isArray(record.plugins)) return [...failures, { path: relPath, message: "Marketplace must list plugins." }];
  if (record.plugins.some((entry) => asRecord(entry)?.name === "agent-kit")) {
    failures.push({ path: relPath, message: "Replace the retired agent-kit plugin with the four focused plugins." });
  }
  for (const id of adapter.pluginIds) {
    const entries = record.plugins.filter((entry) => asRecord(entry)?.name === id);
    const entry = asRecord(entries[0]);
    if (entries.length !== 1 || !entry) {
      failures.push({ path: relPath, message: `Marketplace must list ${id} exactly once.` });
      continue;
    }
    const expected = `./plugins/${id}`;
    if (adapter.kind === "codex-plugin") {
      const source = asRecord(entry.source);
      if (source?.source !== "local" || source.path !== expected) {
        failures.push({ path: relPath, message: `${id} source.path must be "${expected}" relative to the repo root.` });
      }
      const policy = asRecord(entry.policy);
      if (typeof policy?.installation !== "string" || typeof policy.authentication !== "string") {
        failures.push({ path: relPath, message: `${id} must include policy.installation and policy.authentication.` });
      }
      if (typeof entry.category !== "string" || !entry.category) {
        failures.push({ path: relPath, message: `${id} must include category.` });
      }
    } else if (entry.source !== expected) {
      failures.push({ path: relPath, message: `${id} source must be "${expected}".` });
    }
  }
  return failures;
}

function checkPath(value: unknown, expected: string, relPath: string, field: string, failures: ValidationFailure[]): void {
  const normalize = (text: string) => text.replace(/^\.\//, "").replace(/\/$/, "");
  if (typeof value !== "string" || normalize(value) !== normalize(expected)) {
    failures.push({ path: relPath, message: `${field} must point at ${expected}.` });
  }
}

function componentStrings(value: unknown, parentKey?: string): readonly string[] {
  if (typeof value === "string") return parentKey && COMPONENT_KEYS.has(parentKey) ? [value] : [];
  if (Array.isArray(value)) return value.flatMap((entry) => componentStrings(entry, parentKey));
  const record = asRecord(value);
  return record ? Object.entries(record).flatMap(([key, entry]) => componentStrings(entry, key)) : [];
}

async function requirePath(root: string, relPath: string, failures: ValidationFailure[]): Promise<void> {
  if (!(await pathExists(path.join(root, relPath)))) {
    failures.push({ path: relPath, message: "Required path is missing." });
  }
}

async function inspectJson(
  root: string,
  relPath: string,
  inspect: (document: unknown) => readonly ValidationFailure[],
  failures: ValidationFailure[],
): Promise<void> {
  const file = path.join(root, relPath);
  if (!(await pathExists(file))) {
    failures.push({ path: relPath, message: "Required JSON file is missing." });
    return;
  }
  try {
    failures.push(...inspect(JSON.parse(await readText(file))));
  } catch (error) {
    failures.push({ path: relPath, message: `JSON did not parse. ${error instanceof Error ? error.message : String(error)}` });
  }
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  // SAFETY: The guard excludes null, arrays, and primitives; field values stay unknown.
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}
