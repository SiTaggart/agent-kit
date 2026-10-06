import { expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const pstackRoot = path.join(repoRoot, "plugins/pstack");
const pluginRoot = path.join(repoRoot, "plugins/p3stack");
const read = (file: string) => readFileSync(path.join(pluginRoot, file), "utf8");

// Mirrors the plugin .gitignore so local installs do not count as drift.
const IGNORED = new Set(["node_modules", ".DS_Store"]);
const MIRRORED = ["skills", "references", "licenses", "LICENSE"];
const PORT_LOCAL_SKILL = "skills/setup-pstack/";
const FORBIDDEN_EFFORTS = new Set(["max", "ultra", "ultracode", "ultrathink"]);

interface Choice {
  providerInstanceId: string;
  model: string;
  options: Record<string, string>;
}

function listFiles(root: string, relative: string): string[] {
  const absolute = path.join(root, relative);
  if (!statSync(absolute).isDirectory()) return [relative];
  return readdirSync(absolute)
    .filter((name) => !IGNORED.has(name) && !name.endsWith(".log"))
    .flatMap((name) => listFiles(root, path.join(relative, name)));
}

function mirroredFiles(root: string): string[] {
  return MIRRORED.flatMap((entry) => listFiles(root, entry))
    .filter((file) => !file.startsWith(PORT_LOCAL_SKILL))
    .sort();
}

test("both catalogs publish P3Stack with manifests that match its release", () => {
  const claude = JSON.parse(readFileSync(path.join(repoRoot, ".claude-plugin/marketplace.json"), "utf8"));
  const codex = JSON.parse(readFileSync(path.join(repoRoot, ".agents/plugins/marketplace.json"), "utf8"));
  const claudeEntry = claude.plugins.find((entry: { name: string }) => entry.name === "p3stack");
  const codexEntry = codex.plugins.find((entry: { name: string }) => entry.name === "p3stack");
  const claudeManifest = JSON.parse(read(".claude-plugin/plugin.json"));
  const codexManifest = JSON.parse(read(".codex-plugin/plugin.json"));

  expect(claudeEntry.source).toBe("./plugins/p3stack");
  expect(codexEntry.source.path).toBe("./plugins/p3stack");
  for (const manifest of [claudeManifest, codexManifest]) {
    expect(manifest.name).toBe("p3stack");
    expect(manifest.version).toBe(claudeEntry.version);
    expect(manifest.skills).toBe("./skills/");
    for (const component of ["hooks", "rules", "apps", "mcpServers", "agents"]) {
      expect(manifest[component]).toBeUndefined();
    }
  }
  expect(codexEntry.version).toBe(claudeEntry.version);
  expect(existsSync(path.join(pluginRoot, codexManifest.interface.logo))).toBe(true);

  const cursor = JSON.parse(readFileSync(path.join(repoRoot, ".cursor-plugin/marketplace.json"), "utf8"));
  expect(cursor.plugins.some((entry: { name: string }) => entry.name === "p3stack")).toBe(false);
});

test("skills, personas, and licenses mirror the PStack port except the T3 setup skill", () => {
  const expected = mirroredFiles(pstackRoot);
  expect(mirroredFiles(pluginRoot)).toEqual(expected);
  for (const file of expected) {
    expect(readFileSync(path.join(pluginRoot, file)).equals(readFileSync(path.join(pstackRoot, file))), file).toBe(true);
  }
  expect(listFiles(pluginRoot, PORT_LOCAL_SKILL)).toEqual([`${PORT_LOCAL_SKILL}SKILL.md`]);
});

test("the T3 setup skill resolves its links and keeps the effort ceiling", () => {
  const body = read(`${PORT_LOCAL_SKILL}SKILL.md`);
  const frontmatter = Bun.YAML.parse(body.split("---")[1] ?? "");
  expect(frontmatter).toMatchObject({ name: "setup-pstack", description: expect.any(String) });
  expect(frontmatter).not.toHaveProperty("disable-model-invocation");
  expect(body).toContain("orchestrator_capabilities");
  expect(body).toContain("~/.agents/p3stack-models.json");
  expect(body).toContain("Never write `max`, `ultra`, `ultracode`, or `ultrathink`");
  for (const link of body.matchAll(/\]\(([^)]+)\)/g)) {
    const target = link[1] ?? "";
    expect(existsSync(path.resolve(pluginRoot, PORT_LOCAL_SKILL, target))).toBe(true);
  }
});

test("model defaults cover every PStack role with delegate_task targets under the effort ceiling", () => {
  const models: Record<string, Choice | Choice[]> = JSON.parse(read("models.json"));
  const pstackRoles: Record<string, unknown> = JSON.parse(readFileSync(path.join(pstackRoot, "models.json"), "utf8"));
  expect(Object.keys(models).sort()).toEqual(Object.keys(pstackRoles).sort());

  const effortKey: Record<string, string> = { claudeAgent: "effort", codex: "reasoningEffort", grok: "reasoningEffort" };
  for (const [role, value] of Object.entries(models)) {
    expect(Array.isArray(value)).toBe(Array.isArray(pstackRoles[role]));
    const choices = Array.isArray(value) ? value : [value];
    if (Array.isArray(value)) {
      expect(new Set(choices.map((choice) => choice.providerInstanceId)).size, role).toBe(choices.length);
    }
    for (const choice of choices) {
      expect(Object.keys(choice).sort()).toEqual(["model", "options", "providerInstanceId"]);
      const key = effortKey[choice.providerInstanceId];
      if (!key) throw new Error(`${role} uses unsupported provider ${choice.providerInstanceId}`);
      expect(Object.keys(choice.options)).toEqual([key]);
      expect(FORBIDDEN_EFFORTS.has(choice.options[key] ?? "")).toBe(false);
      if (choice.providerInstanceId === "grok") expect(choice.model).toBe("grok-4.7-build-fast");
    }
  }
});

test("the runtime adapter maps upstream mechanisms to T3 tools and keeps the merge rule", () => {
  const runtime = read("RUNTIME.md");
  expect(runtime).toContain("Never merge, enable auto-merge, or use a merge queue.");
  for (const tool of ["delegate_task", "task_status", "t3_thread_launch", "watch_pull_request", "schedule_task", "link_pull_request", "t3_thread_search", "orchestrator_capabilities"]) {
    expect(runtime).toContain(`\`${tool}\``);
  }
  expect(runtime).toContain("~/.agents/p3stack-models.json");
  expect(runtime).not.toMatch(/spawn_agent\(|fork_turns|codex-sessions\.py/);
  for (const file of ["CODEX.md", "CLAUDE-CODE.md", "models.claude.json", "scripts/codex-sessions.py"]) {
    expect(existsSync(path.join(pluginRoot, file)), file).toBe(false);
  }
});
