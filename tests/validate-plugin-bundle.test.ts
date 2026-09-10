import { expect, test } from "bun:test";
import { cp, readdir } from "fs/promises";
import path from "path";
import { HARNESSES, PLUGIN_IDS } from "../src/plugin-bundle";
import { inspectPluginManifest, namesInstructionFile, validatePluginBundle } from "../src/validate";
import { makeTempRoot, readText, removeTempRoot, writeText } from "./helpers";

const repoRoot = path.resolve(import.meta.dir, "..");
const claudeAdapter = HARNESSES.claude;
const codexAdapter = HARNESSES.codex;

test("plugin bundle validator accepts this repo", async () => {
  const report = await validatePluginBundle(repoRoot);

  expect(report.failures).toEqual([]);
  expect(report.ok).toBe(true);
});

test("validator requires every supported plugin and rejects repository-root sources", async () => {
  const root = await makeTempRoot("agent-kit-marketplace-");
  const adapters = [claudeAdapter, codexAdapter, HARNESSES.cursor];
  try {
    for (const id of PLUGIN_IDS) {
      await cp(path.join(repoRoot, "plugins", id), path.join(root, "plugins", id), { recursive: true });
    }
    for (const adapter of adapters) {
      await writeText(path.join(root, adapter.marketplacePath), await readText(path.join(repoRoot, adapter.marketplacePath)));
    }
    expect((await validatePluginBundle(root)).failures).toEqual([]);

    const claudeCatalogPath = path.join(root, claudeAdapter.marketplacePath);
    const claudeCatalog = await readText(claudeCatalogPath);
    const missingPstack = JSON.parse(claudeCatalog);
    missingPstack.plugins = missingPstack.plugins.filter((entry: { name: string }) => entry.name !== "pstack");
    await writeText(claudeCatalogPath, JSON.stringify(missingPstack));
    expect((await validatePluginBundle(root)).failures).toContainEqual({
      path: claudeAdapter.marketplacePath,
      message: "Marketplace must list pstack exactly once.",
    });
    await writeText(claudeCatalogPath, claudeCatalog);

    for (const adapter of adapters) {
      const catalogPath = path.join(root, adapter.marketplacePath);
      const original = await readText(catalogPath);
      await writeText(catalogPath, original.replace("./plugins/engineering", "./"));
      const report = await validatePluginBundle(root);
      expect(report.ok).toBe(false);
      expect(report.failures).toContainEqual({
        path: adapter.marketplacePath,
        message: expect.stringContaining("source"),
      });
      await writeText(catalogPath, original);
    }
  } finally {
    await removeTempRoot(root);
  }
});

test("Grok reuses the Cursor plugin files", () => {
  expect(HARNESSES.grok.manifestPath).toBe(HARNESSES.cursor.manifestPath);
  expect(HARNESSES.grok.hooksPath).toBe(HARNESSES.cursor.hooksPath);
  expect(HARNESSES.grok.kind).toBe("cursor-plugin");
});

test("all 51 skills have one owner and relative skill references stay inside that plugin", async () => {
  const owners = new Map<string, string>();
  for (const [id, count] of [["engineering", 30], ["git", 10], ["knowledge", 11]] as const) {
    const skills = await readdir(path.join(repoRoot, "plugins", id, "skills"));
    expect(skills).toHaveLength(count);
    for (const name of skills) {
      expect(owners.has(name)).toBe(false);
      owners.set(name, id);
      expect(await Bun.file(path.join(repoRoot, "plugins", id, "skills", name, "SKILL.md")).exists()).toBe(true);
    }
  }
  expect(owners.has("orca-multi-review")).toBe(false);
  const markdown = new Bun.Glob("plugins/{engineering,git,knowledge}/skills/**/*.md");
  for await (const file of markdown.scan(repoRoot)) {
    const body = await readText(path.join(repoRoot, file));
    for (const match of body.matchAll(/(?:\.\.\/)+([a-z][a-z0-9-]+)(?:\/|`)/g)) {
      const targetOwner = owners.get(match[1] ?? "");
      if (targetOwner) expect(file, match[0]).toStartWith(`plugins/${targetOwner}/`);
    }
  }
});

test.each(["engineering", "git", "knowledge"] as const)("%s cannot register command safeguards", (id) => {
  for (const adapter of [HARNESSES.claude, HARNESSES.codex, HARNESSES.cursor]) {
    const failures = inspectPluginManifest(
      { name: id, skills: "./skills/", hooks: `./${adapter.hooksPath}` },
      adapter,
      `plugins/${id}/${adapter.manifestPath}`,
      id,
    );
    expect(failures).toContainEqual({
      path: `plugins/${id}/${adapter.manifestPath}`,
      message: "Command safeguards belong only in the hooks plugin.",
    });
  }
});

test("retired mattpocock catalog is gone", async () => {
  expect(await Bun.file(path.join(repoRoot, "plugins", "marketplace.json")).exists()).toBe(false);
});

test("third-party skill provenance files are gone", async () => {
  expect(await Bun.file(path.join(repoRoot, "skills-lock.json")).exists()).toBe(false);
  expect(await Bun.file(path.join(repoRoot, ".skill-lock.json")).exists()).toBe(false);
});

test("AGENTS.md is not a plugin component path", () => {
  expect(namesInstructionFile("AGENTS.md")).toBe(true);
  expect(namesInstructionFile("./AGENTS.md")).toBe(true);
  expect(namesInstructionFile("CLAUDE.md")).toBe(true);
  expect(namesInstructionFile("./skills/")).toBe(false);
});

test("validator fails when a manifest omits skills", () => {
  const failures = inspectPluginManifest(
    {
      name: "engineering",
      hooks: "./hooks/hooks.json",
    },
    claudeAdapter,
    "plugins/engineering/.claude-plugin/plugin.json",
    "engineering",
  );

  expect(failures.some((failure) => failure.message.includes("skills"))).toBe(true);
});

test("validator accepts Claude's automatically loaded hooks", () => {
  const failures = inspectPluginManifest(
    {
      name: "hooks",
    },
    claudeAdapter,
    "plugins/hooks/.claude-plugin/plugin.json",
    "hooks",
  );

  expect(failures).toEqual([]);
});

test("validator rejects Claude's standard hooks path in the manifest", () => {
  const failures = inspectPluginManifest(
    {
      name: "hooks",
      hooks: "./hooks/hooks.json",
    },
    claudeAdapter,
    "plugins/hooks/.claude-plugin/plugin.json",
    "hooks",
  );

  expect(failures.some((failure) => failure.message.includes("automatically"))).toBe(true);
});

test("validator still requires Codex's hooks path", () => {
  const failures = inspectPluginManifest(
    {
      name: "hooks",
    },
    codexAdapter,
    "plugins/hooks/.codex-plugin/plugin.json",
    "hooks",
  );

  expect(failures.some((failure) => failure.message.includes("hooks"))).toBe(true);
});

test("validator reports AGENTS.md when it is listed as a component", () => {
  const failures = inspectPluginManifest(
    {
      name: "engineering",
      skills: "./AGENTS.md",
      hooks: "./hooks/hooks.json",
    },
    claudeAdapter,
    "plugins/engineering/.claude-plugin/plugin.json",
    "engineering",
  );

  expect(failures.some((failure) => /AGENTS\.md/i.test(failure.message))).toBe(true);
});
