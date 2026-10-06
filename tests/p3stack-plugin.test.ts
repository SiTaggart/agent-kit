import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const pluginRoot = path.join(repoRoot, "plugins/p3stack");
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
    expect(existsSync(path.resolve(pluginRoot, path.dirname(file), target.split("#")[0] ?? "")), `${file} -> ${target}`).toBe(true);
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
  for (const file of ["README.md", ...pages]) expectLinksResolve(file);
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

const SCRIPTS = path.join(pluginRoot, "skills/poteto-mode/scripts");

interface HarnessStores {
  env: Record<string, string>;
  codex: string;
  claude: string;
  grok: string;
}

function harnessStores(directory: string): HarnessStores {
  const stores = {
    codex: path.join(directory, "codex-home", "sessions"),
    claude: path.join(directory, "claude-home", "projects"),
    grok: path.join(directory, "grok-home", "sessions"),
  };
  for (const store of Object.values(stores)) mkdirSync(store, { recursive: true });
  return {
    ...stores,
    env: {
      CODEX_HOME: path.join(directory, "codex-home"),
      CLAUDE_CONFIG_DIR: path.join(directory, "claude-home"),
      GROK_HOME: path.join(directory, "grok-home"),
    },
  };
}

function writeCodexSession(stores: HarnessStores, id: string, cwd: string): string {
  const file = path.join(stores.codex, "2026", `${id}.jsonl`);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify({ type: "session_meta", payload: { id, cwd } })}\n{"type":"response_item","payload":"SECRET MESSAGE"}\n`);
  return file;
}

function writeClaudeSession(stores: HarnessStores, id: string, cwd: string): string {
  const file = path.join(stores.claude, cwd.replace(/[^A-Za-z0-9]/g, "-"), `${id}.jsonl`);
  mkdirSync(path.dirname(file), { recursive: true });
  const header = JSON.stringify({ type: "queue-operation", content: "SECRET MESSAGE" });
  writeFileSync(file, `${header}\n${JSON.stringify({ type: "user", cwd, sessionId: id, message: "SECRET MESSAGE" })}\n`);
  return file;
}

function writeGrokSession(stores: HarnessStores, id: string, cwd: string): string {
  const session = path.join(stores.grok, encodeURIComponent(cwd), id);
  mkdirSync(session, { recursive: true });
  writeFileSync(path.join(session, "chat_history.jsonl"), '{"content":"SECRET MESSAGE"}\n');
  return path.join(session, "chat_history.jsonl");
}

function indexSessions(stores: HarnessStores, workspaces: string[]) {
  const args = workspaces.flatMap((workspace) => ["--workspace", workspace]);
  return spawnSync("python3", [path.join(SCRIPTS, "harness-sessions.py"), ...args], {
    encoding: "utf8",
    env: { ...process.env, ...stores.env },
  });
}

test("the session indexer reads Codex, Claude Code, and Grok Build stores for exact workspaces", () => {
  const directory = realpathSync(mkdtempSync(path.join(tmpdir(), "p3stack-sessions-")));
  try {
    const stores = harnessStores(directory);
    const workspace = path.join(directory, "repo");
    const nested = path.join(workspace, "nested-worktree");
    const neighbor = `${workspace}-other`;
    writeCodexSession(stores, "codex-root", workspace);
    writeCodexSession(stores, "codex-neighbor", neighbor);
    writeClaudeSession(stores, "claude-subdir", path.join(workspace, "src"));
    writeClaudeSession(stores, "claude-neighbor", neighbor);
    writeGrokSession(stores, "grok-nested", nested);
    writeGrokSession(stores, "grok-neighbor", neighbor);

    const result = indexSessions(stores, [workspace, nested]);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).not.toContain("SECRET MESSAGE");
    const { sessions, unavailable } = JSON.parse(result.stdout);
    expect(unavailable).toEqual([]);
    const found = Object.fromEntries(sessions.map((s: { id: string; harness: string; workspace: string }) => [s.id, [s.harness, s.workspace]]));
    expect(found).toEqual({
      "codex-root": ["codex", workspace],
      "claude-subdir": ["claude", workspace],
      "grok-nested": ["grok", nested],
    });

    rmSync(path.join(directory, "grok-home"), { recursive: true });
    const missing = indexSessions(stores, [workspace]);
    expect(missing.status).toBe(0);
    expect(JSON.parse(missing.stdout).unavailable).toEqual([{ harness: "grok", root: stores.grok }]);
    expect(missing.stderr).toContain("grok sessions are unavailable");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("the worktree audit reports the newest session from any harness", () => {
  const directory = realpathSync(mkdtempSync(path.join(tmpdir(), "p3stack-audit-")));
  try {
    const stores = harnessStores(directory);
    const repository = path.join(directory, "repository");
    const codexTree = path.join(directory, "codex-tree");
    const grokTree = path.join(directory, "grok-tree");
    const idleTree = path.join(directory, "idle-tree");
    const bin = path.join(directory, "bin");
    mkdirSync(bin);
    writeFileSync(path.join(bin, "gh"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    const git = (...args: string[]) => {
      const result = spawnSync("git", args, { encoding: "utf8" });
      expect(result.status, result.stderr).toBe(0);
    };
    git("init", "--initial-branch=main", repository);
    git("-C", repository, "-c", "user.name=Fixture", "-c", "user.email=fixture@example.com", "-c", "commit.gpgsign=false", "commit", "--allow-empty", "-m", "fixture");
    for (const tree of [codexTree, grokTree, idleTree]) git("-C", repository, "worktree", "add", "--detach", tree);

    const old = new Date("2026-01-02T12:00:00Z");
    const codexFile = writeCodexSession(stores, "codex-old", codexTree);
    utimesSync(codexFile, old, old);
    writeClaudeSession(stores, "claude-new", codexTree);
    writeGrokSession(stores, "grok-only", grokTree);

    const result = spawnSync("bash", [path.join(SCRIPTS, "worktree-audit.sh"), repository], {
      encoding: "utf8",
      env: { ...process.env, ...stores.env, PATH: `${bin}:${process.env.PATH}` },
    });
    expect(result.status, result.stderr).toBe(0);
    const today = spawnSync("date", ["+%Y-%m-%d"], { encoding: "utf8" }).stdout.trim();
    expect(result.stdout).toContain(`\t${today}/claude\tverify-recent-chat\t${codexTree}`);
    expect(result.stdout).toContain(`\t${today}/grok\tverify-recent-chat\t${grokTree}`);
    expect(result.stdout).toContain(`\tunknown\treview\t${idleTree}`);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
