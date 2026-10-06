import { expect, test } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const pluginRoot = path.join(repoRoot, "plugins/p3stack");
const LEGACY_PSTACK_ROOT = path.join(repoRoot, "plugins/pstack") + path.sep;
const read = (file: string) => readFileSync(path.join(pluginRoot, file), "utf8");

// Mirrors the plugin .gitignore so local installs are not checked.
const IGNORED = new Set(["node_modules", ".DS_Store"]);
const PORT_LOCAL_SKILL = "skills/setup-pstack/";
const IMPLICIT_SKILLS = new Set(["setup-pstack", "deslop", "control-cli", "verify-this", "browser-use"]);
const PANEL_ROLES = ["arena runners", "arena cross-judge pool", "architect runners", "interrogate reviewers"];
const SINGLE_ROLES = [
  "feature, refactoring",
  "bug-fix",
  "perf-issue",
  "hillclimb",
  "judgment and prose",
  "hardest tasks",
  "how explorer",
  "how explainer",
  "why investigators",
  "why synthesizer",
  "reflect tooling",
  "reflect judgment, divergent, synthesizer",
  "swarm workers",
];
const EFFORT_LADDER = ["low", "medium", "high", "xhigh"];
const BUDGET_CAPS: Record<string, string> = { unlimited: "xhigh", large: "xhigh", medium: "high", small: "medium" };
const EFFORT_KEYS: Record<string, string> = { claudeAgent: "effort", codex: "reasoningEffort", grok: "reasoningEffort" };

interface Choice {
  providerInstanceId: string;
  model: string;
  options: Record<string, string>;
}

function expectValidChoice(choice: Choice, label: string, cap = "xhigh"): void {
  expect(Object.keys(choice).sort(), label).toEqual(["model", "options", "providerInstanceId"]);
  const key = EFFORT_KEYS[choice.providerInstanceId];
  if (!key) throw new Error(`${label} uses unsupported provider ${choice.providerInstanceId}`);
  expect(Object.keys(choice.options), label).toEqual([key]);
  const rank = EFFORT_LADDER.indexOf(choice.options[key] ?? "");
  expect(rank, label).toBeGreaterThanOrEqual(0);
  expect(rank, label).toBeLessThanOrEqual(EFFORT_LADDER.indexOf(cap));
  if (choice.providerInstanceId === "grok") expect(choice.model, label).toBe("grok-4.7-build-fast");
}

const pinOf = (readme: string) => readme.match(/pinned to `([0-9a-f]{40})` \((v[\d.]+)\)/)?.slice(1);

function listFiles(root: string, relative: string): string[] {
  const absolute = path.join(root, relative);
  if (!statSync(absolute).isDirectory()) return [relative];
  return readdirSync(absolute)
    .filter((name) => !IGNORED.has(name) && !name.endsWith(".log"))
    .flatMap((name) => listFiles(root, path.join(relative, name)));
}

function expectLinksResolve(file: string): void {
  for (const link of read(file).matchAll(/\]\(([^)\s]+)\)/g)) {
    const target = link[1] ?? "";
    if (target.includes(":") || target.startsWith("#")) continue;
    const resolved = path.resolve(pluginRoot, path.dirname(file), target.split("#")[0] ?? "");
    expect(existsSync(resolved), `${file} -> ${target}`).toBe(true);
    expect(resolved.startsWith(LEGACY_PSTACK_ROOT), `${file} links into the legacy PStack port`).toBe(false);
  }
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
  const pin = pinOf(read("README.md"));
  expect(pin?.[1]).toBe(`v${claudeManifest.version}`);
  expect(existsSync(path.join(pluginRoot, codexManifest.interface.logo))).toBe(true);

  const cursor = JSON.parse(readFileSync(path.join(repoRoot, ".cursor-plugin/marketplace.json"), "utf8"));
  expect(cursor.plugins.some((entry: { name: string }) => entry.name === "p3stack")).toBe(false);
});

test("every skill resolves the runtime adapter and keeps its activation policy", () => {
  const skills = readdirSync(path.join(pluginRoot, "skills")).filter((name) => !IGNORED.has(name));
  expect(skills).toHaveLength(55);
  expect(skills).not.toContain("sync-p3stack");
  expect(skills).not.toContain("sync-pstack");

  for (const skill of skills) {
    const file = `skills/${skill}/SKILL.md`;
    const body = read(file);
    const frontmatter = Bun.YAML.parse(body.split("---")[1] ?? "");
    expect(frontmatter, skill).toMatchObject({ name: skill, description: expect.any(String) });
    expect(body, skill).toContain("../../RUNTIME.md");
    if (skill !== "setup-pstack") {
      expect(body, skill).not.toMatch(/\.cursor\/|claude-fable-|grok-4\.|gpt-5\.6-sol-max|subagent_type/);
    }
    if (IMPLICIT_SKILLS.has(skill)) {
      expect(frontmatter, skill).not.toHaveProperty("disable-model-invocation");
    } else {
      expect(read(`skills/${skill}/agents/openai.yaml`), skill).toContain("allow_implicit_invocation: false");
      expect(frontmatter, skill).toHaveProperty("disable-model-invocation", true);
    }
    expectLinksResolve(file);
  }
  expect(listFiles(pluginRoot, PORT_LOCAL_SKILL)).toEqual([`${PORT_LOCAL_SKILL}SKILL.md`]);
});

test("the guide and README ship with the plugin and resolve their links", () => {
  const pages = listFiles(pluginRoot, "docs/guide").filter((file) => file.endsWith(".md"));
  expect(pages).toHaveLength(11);
  for (const file of ["README.md", ...pages]) {
    expectLinksResolve(file);
    expect(read(file), file).not.toMatch(/plugins\/pstack|CODEX\.md|CLAUDE-CODE\.md|models\.claude\.json|pstack-models\.json|\/pstack:/);
  }
});

test("the T3 setup skill resolves its links and keeps the effort ceiling", () => {
  const body = read(`${PORT_LOCAL_SKILL}SKILL.md`);
  const frontmatter = Bun.YAML.parse(body.split("---")[1] ?? "");
  expect(frontmatter).toMatchObject({ name: "setup-pstack", description: expect.any(String) });
  expect(frontmatter).not.toHaveProperty("disable-model-invocation");
  expect(body).toContain("orchestrator_capabilities");
  expect(body).toContain("~/.agents/p3stack-models.json");
  const example = JSON.parse(body.split("```json\n")[1]?.split("```")[0] ?? "null");
  const cap = BUDGET_CAPS[example.budget];
  if (!cap) throw new Error(`setup example has unknown budget ${example.budget}`);
  const roles = Object.keys(JSON.parse(read("models.json")));
  for (const [role, value] of Object.entries(example)) {
    if (role === "budget") continue;
    expect(roles).toContain(role);
    if (typeof value === "string") expect(["inherit-parent", "auto"]).toContain(value);
    else for (const choice of [value].flat() as Choice[]) expectValidChoice(choice, `setup example ${role}`, cap);
  }
  for (const link of body.matchAll(/\]\(([^)]+)\)/g)) {
    const target = link[1] ?? "";
    expect(existsSync(path.resolve(pluginRoot, PORT_LOCAL_SKILL, target))).toBe(true);
  }
});

test("model defaults cover every PStack role with delegate_task targets on the effort ladder", () => {
  const models: Record<string, Choice | Choice[]> = JSON.parse(read("models.json"));
  expect(Object.keys(models).sort()).toEqual([...SINGLE_ROLES, ...PANEL_ROLES].sort());

  for (const [role, value] of Object.entries(models)) {
    expect(Array.isArray(value), role).toBe(PANEL_ROLES.includes(role));
    const choices = Array.isArray(value) ? value : [value];
    if (Array.isArray(value)) {
      expect(new Set(choices.map((choice) => choice.providerInstanceId)).size, role).toBe(choices.length);
    }
    for (const choice of choices) expectValidChoice(choice, role);
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
