import { expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const pluginRoot = path.join(repoRoot, "plugins/pstack");
const read = (file: string) => readFileSync(path.join(pluginRoot, file), "utf8");

test("Codex exposes the four focused plugins and PStack separately", () => {
  const catalog = JSON.parse(readFileSync(path.join(repoRoot, ".agents/plugins/marketplace.json"), "utf8"));
  expect(catalog.plugins.map((entry: { name: string }) => entry.name)).toEqual(["engineering", "git", "knowledge", "hooks", "pstack"]);
  expect(catalog.plugins[0].source.path).toBe("./plugins/engineering");
  expect(catalog.plugins[4].source.path).toBe("./plugins/pstack");
  expect(catalog.plugins[4].policy.installation).toBe("AVAILABLE");

  const manifest = JSON.parse(read(".codex-plugin/plugin.json"));
  expect(manifest.name).toBe("pstack");
  expect(manifest.skills).toBe("./skills/");
  expect(manifest.author.name).toBe("Lauren Tan");
  expect(manifest.license).toBe("MIT");
  for (const component of ["hooks", "rules", "apps", "mcpServers", "agents"]) {
    expect(manifest[component]).toBeUndefined();
  }
  expect(read("LICENSE")).toContain("Copyright (c) 2026 Lauren Tan");
});

test("all 47 upstream skills and four companions resolve the host adapter and preserve activation policy", () => {
  const skills = readdirSync(path.join(pluginRoot, "skills"));
  expect(skills).toHaveLength(51);
  const implicitSkills = new Set(["setup-pstack", "deslop", "control-cli", "verify-this", "browser-use"]);

  for (const skill of skills) {
    const body = read(`skills/${skill}/SKILL.md`);
    const frontmatter = Bun.YAML.parse(body.split("---")[1] ?? "");
    expect(frontmatter).toMatchObject({ name: skill, description: expect.any(String) });
    expect(body).toContain(`name: ${skill}\n`);
    expect(body).toContain("../../RUNTIME.md");
    expect(body).not.toMatch(/\.cursor\/|claude-fable-|grok-4\.|gpt-5\.6-sol-max|subagent_type/);
    if (!implicitSkills.has(skill)) {
      expect(read(`skills/${skill}/agents/openai.yaml`)).toContain("allow_implicit_invocation: false");
      expect(frontmatter).toHaveProperty("disable-model-invocation", true);
    } else {
      expect(frontmatter).not.toHaveProperty("disable-model-invocation");
    }
    for (const link of body.matchAll(/\]\(([^)]+)\)/g)) {
      const target = link[1];
      if (!target || target.includes(":") || target.startsWith("#")) continue;
      expect(existsSync(path.resolve(pluginRoot, "skills", skill, target.split("#")[0] ?? ""))).toBe(true);
    }
  }
  expect(read("CODEX.md")).toContain("Never merge, enable auto-merge, or use a merge queue.");
  expect(read("CLAUDE-CODE.md")).toContain("Never merge, enable auto-merge, or use a merge queue.");
});

test("Claude publishes the same skill tree with a matching release version; Cursor keeps upstream PStack", () => {
  const catalog = JSON.parse(readFileSync(path.join(repoRoot, ".claude-plugin/marketplace.json"), "utf8"));
  const entries = catalog.plugins.filter((entry: { name: string }) => entry.name === "pstack");
  expect(entries).toHaveLength(1);
  const manifest = JSON.parse(read(".claude-plugin/plugin.json"));
  const codex = JSON.parse(read(".codex-plugin/plugin.json"));
  expect(entries[0].source).toBe("./plugins/pstack");
  expect(entries[0].version).toBe(manifest.version);
  expect(manifest.version).toMatch(/^\d+\.\d+\.\d+$/);
  expect(codex.version.split("+")[0]).toBe(manifest.version);
  expect(manifest.skills).toBe(codex.skills);
  for (const component of ["hooks", "rules", "apps", "mcpServers", "agents"]) {
    expect(manifest[component]).toBeUndefined();
  }
  const cursor = JSON.parse(readFileSync(path.join(repoRoot, ".cursor-plugin/marketplace.json"), "utf8"));
  expect(cursor.plugins.some((entry: { name: string }) => entry.name === "pstack")).toBe(false);
});

test("Claude defaults cover every role with native model aliases and inherit effort", () => {
  const claude = JSON.parse(read("models.claude.json"));
  const codex = JSON.parse(read("models.json"));
  expect(Object.keys(claude).sort()).toEqual(Object.keys(codex).sort());
  for (const [role, value] of Object.entries(claude)) {
    expect(Array.isArray(value)).toBe(Array.isArray(codex[role]));
    const choices = Array.isArray(value) ? value : [value];
    expect(choices.length).toBeGreaterThan(0);
    expect(new Set(choices).size).toBe(choices.length);
    for (const model of choices) expect(["opus", "sonnet", "fable"]).toContain(model);
  }
});

test("Claude worktree audit leaves history unknown instead of consulting Codex sessions", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "pstack-worktrees-"));
  try {
    const repository = path.join(directory, "repo");
    const worktree = path.join(directory, "child");
    const bin = path.join(directory, "bin");
    mkdirSync(bin);
    writeFileSync(path.join(bin, "gh"), "#!/bin/sh\nexit 1\n", { mode: 0o755 });
    writeFileSync(path.join(bin, "python3"), "#!/bin/sh\necho CODEX_HISTORY_READ >&2\nexit 1\n", { mode: 0o755 });
    const git = (...args: string[]) => {
      const result = spawnSync("git", args, { encoding: "utf8" });
      expect(result.status, result.stderr).toBe(0);
    };
    git("init", "--initial-branch=main", repository);
    git("-C", repository, "-c", "user.name=Fixture", "-c", "user.email=fixture@example.com", "-c", "commit.gpgsign=false", "commit", "--allow-empty", "-m", "fixture");
    git("-C", repository, "worktree", "add", "--detach", worktree);
    const result = spawnSync("bash", [path.join(pluginRoot, "skills/poteto-mode/scripts/worktree-audit.sh"), repository, "claude"], {
      encoding: "utf8",
      env: { ...process.env, PATH: `${bin}:${process.env.PATH}` },
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain(`\tunknown\treview\t${worktree}`);
    expect(result.stderr).toContain("Claude session history is unknown");
    expect(result.stderr).not.toContain("CODEX_HISTORY_READ");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("native plan template keeps the ten-lane and performance verification gates", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "pstack-plan-"));
  try {
    const template = read("skills/poteto-mode/playbooks/multi-phase-plan.md").split("````markdown\n")[1]?.split("````")[0];
    if (!template) throw new Error("Missing upstream plan template");
    const file = path.join(directory, "plan.md");
    const checker = path.join(pluginRoot, "skills/poteto-mode/scripts/check-plan.mjs");
    writeFileSync(file, template);
    expect(spawnSync("node", [checker, file]).status).toBe(0);
    writeFileSync(file, template.replace(/^- \[ \] Lane 10\..*\n/m, ""));
    const missingLane = spawnSync("node", [checker, file], { encoding: "utf8" });
    expect(missingLane.status).toBe(1);
    expect(missingLane.stderr).toContain("expected 1 to 10");
    writeFileSync(file, template.replace(/^- \[ \] Baseline\..*\n/m, ""));
    const missingBaseline = spawnSync("node", [checker, file], { encoding: "utf8" });
    expect(missingBaseline.status).toBe(1);
    expect(missingBaseline.stderr).toContain("perf boxes");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("Codex history indexing isolates exact workspace metadata without reading messages", () => {
  const directory = mkdtempSync(path.join(tmpdir(), "pstack-history-"));
  try {
    const workspace = path.join(directory, "my project");
    const session = (cwd: string, id: string) => JSON.stringify({ type: "session_meta", payload: { cwd, id } });
    writeFileSync(path.join(directory, "matching.jsonl"), session(workspace, "matching") + "\nnot a valid message\n");
    writeFileSync(path.join(directory, "neighbor.jsonl"), session(workspace + "-other", "neighbor"));
    writeFileSync(path.join(directory, "invalid.jsonl"), '{"type":"session_meta","payload":null}');
    const result = spawnSync("python3", [path.join(pluginRoot, "scripts/codex-sessions.py"), "--sessions-root", directory, "--workspace", workspace], { encoding: "utf8" });
    expect(result.status).toBe(0);
    const found = JSON.parse(result.stdout);
    expect(found).toHaveLength(1);
    expect(found[0].id).toBe("matching");
    expect(found[0].cwd).toBe(workspace);
    expect(found[0].path).toBe(path.join(directory, "matching.jsonl"));
    expect(result.stdout).not.toContain("not a valid message");
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("bundled model roles use native Codex IDs and separate reasoning settings", () => {
  const roles = JSON.parse(read("models.json"));
  const panels = new Set([
    "arena runners", "arena cross-judge pool", "architect runners", "interrogate reviewers",
  ]);
  // This snapshot checks packaged defaults; CODEX.md requires live capability checks at dispatch.
  const supportedModels = new Set(["gpt-6-astra", "gpt-5.6-sol", "gpt-5.6-terra"]);
  const supportedEfforts = new Set(["low", "medium", "high", "xhigh", "max", "ultra"]);
  expect(Object.keys(roles)).toHaveLength(17);
  expect(roles["how critics"]).toBeUndefined();
  for (const [role, value] of Object.entries(roles)) {
    expect(Array.isArray(value)).toBe(panels.has(role));
    const choices = Array.isArray(value) ? value : [value];
    expect(choices.length).toBeGreaterThan(0);
    for (const choice of choices) {
      expect(Object.keys(choice).sort()).toEqual(["model", "reasoning_effort"]);
      expect(supportedModels.has(choice.model)).toBe(true);
      expect(supportedEfforts.has(choice.reasoning_effort)).toBe(true);
    }
    if (panels.has(role)) {
      expect(new Set(choices.map((choice) => choice.model)).size).toBe(choices.length);
    }
  }
});
