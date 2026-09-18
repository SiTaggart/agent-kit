import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  applyProfiles,
  inspectStatus,
  planProfiles,
  uninstallProfiles,
} from "../plugins/engineering/skills/codex-agent-team-setup/scripts/install";
import { makeTempRoot, removeTempRoot, writeText } from "./helpers";

const assetsDir = path.resolve(
  import.meta.dir,
  "../plugins/engineering/skills/codex-agent-team-setup/assets/agents",
);
const codexPath = Bun.which("codex");

const validConfig = `[agents]
max_concurrent_threads_per_session = 2

[agents.scout]
description = "Read-only repository scout for bounded discovery, ownership mapping, and evidence gathering before implementation."
config_file = "./agents/scout.toml"

[agents.builder]
description = "Bounded implementation agent for one accepted change with focused verification."
config_file = "./agents/builder.toml"

[agents.reviewer]
description = "Read-only independent reviewer for a supplied diff, acceptance criteria, and verification evidence."
config_file = "./agents/reviewer.toml"
`;

const expectedSkillRoutes = {
  scout: [
    "repo-research-analyst",
    "repoprompt",
    "docs-researcher",
    "web-researcher",
    "qmd-knowledge-base",
    "learnings-researcher",
  ],
  builder: [
    "ce-work",
    "ce-debug",
    "code-taste",
    "spade-python-taste",
    "typescript-advanced-types",
    "ce-quality-gate",
  ],
  reviewer: [
    "ce-review",
    "ce-technical-review",
    "ce-thermo-nuclear-code-quality-review",
    "repoprompt-multi-review",
  ],
} as const;

test("installer applies portable profiles and reports healthy status", async () => {
  const root = await makeTempRoot("agent-team-setup-");
  try {
    await writeText(path.join(root, "config.toml"), validConfig);
    expect((await planProfiles({ codexHome: root })).map((action) => action.kind)).toEqual([
      "create",
      "create",
      "create",
    ]);

    await applyProfiles({ codexHome: root });
    const status = await inspectStatus({ codexHome: root });
    expect(status.healthy).toBe(true);
    expect(status.profiles.map((profile) => profile.kind)).toEqual(["unchanged", "unchanged", "unchanged"]);

    for (const [name, expectedSkills] of Object.entries(expectedSkillRoutes)) {
      const installed = Bun.TOML.parse(await readFile(path.join(root, "agents", `${name}.toml`), "utf8"));
      expect(installed).toMatchObject({
        model: "gpt-5.6-sol",
        model_reasoning_effort: "high",
      });
      expect("name" in installed).toBe(false);
      expect("description" in installed).toBe(false);
      const instructions = "developer_instructions" in installed ? installed.developer_instructions : undefined;
      expect(typeof instructions).toBe("string");
      if (typeof instructions !== "string") throw new Error(`${name} has no developer instructions`);
      for (const skill of expectedSkills) expect(instructions).toContain(`\`${skill}\``);
    }
  } finally {
    await removeTempRoot(root);
  }
});

test("installer refuses to overwrite an unmanaged profile", async () => {
  const root = await makeTempRoot("agent-team-conflict-");
  try {
    await writeText(path.join(root, "agents", "scout.toml"), 'name = "my-scout"\n');
    const plan = await planProfiles({ codexHome: root });
    expect(plan.find((action) => action.name === "scout")?.kind).toBe("conflict");
    await expect(applyProfiles({ codexHome: root })).rejects.toThrow("Refusing to overwrite conflicting profiles: scout");
    expect(await readFile(path.join(root, "agents", "scout.toml"), "utf8")).toBe('name = "my-scout"\n');
  } finally {
    await removeTempRoot(root);
  }
});

test("installer updates a profile that still matches its managed checksum", async () => {
  const root = await makeTempRoot("agent-team-update-");
  const copiedAssets = path.join(root, "plugin-assets");
  try {
    await cp(assetsDir, copiedAssets, { recursive: true });
    await applyProfiles({ codexHome: root, assetsDir: copiedAssets });
    await writeFile(path.join(copiedAssets, "builder.toml"), `${await readFile(path.join(copiedAssets, "builder.toml"), "utf8")}\n# updated\n`);

    const plan = await planProfiles({ codexHome: root, assetsDir: copiedAssets });
    expect(plan.find((action) => action.name === "builder")?.kind).toBe("update");
    await applyProfiles({ codexHome: root, assetsDir: copiedAssets });
    expect(await readFile(path.join(root, "agents", "builder.toml"), "utf8")).toEndWith("# updated\n");
  } finally {
    await removeTempRoot(root);
  }
});

test("uninstall preserves a locally modified managed profile", async () => {
  const root = await makeTempRoot("agent-team-uninstall-");
  try {
    await applyProfiles({ codexHome: root });
    const reviewerPath = path.join(root, "agents", "reviewer.toml");
    await writeFile(reviewerPath, `${await readFile(reviewerPath, "utf8")}\n# local change\n`);

    const result = await uninstallProfiles({ codexHome: root });
    expect(result.removed).toEqual(["scout", "builder"]);
    expect(result.preserved).toEqual(["reviewer"]);
    expect(await readFile(reviewerPath, "utf8")).toEndWith("# local change\n");
  } finally {
    await removeTempRoot(root);
  }
});

test("status reports missing or incorrect agent role configuration", async () => {
  const root = await makeTempRoot("agent-team-config-");
  try {
    await mkdir(root, { recursive: true });
    await applyProfiles({ codexHome: root });
    expect((await inspectStatus({ codexHome: root })).configIssues).toEqual([
      `missing Codex config: ${path.join(root, "config.toml")}`,
    ]);

    await writeText(
      path.join(root, "config.toml"),
      `[agents]\nmax_concurrent_threads_per_session = 4\n\n[agents.scout]\ndescription = "custom"\nconfig_file = "./agents/scout.toml"\n`,
    );
    expect((await inspectStatus({ codexHome: root })).configIssues).toEqual([
      "[agents].max_concurrent_threads_per_session must be 2",
      '[agents.scout].description must be "Read-only repository scout for bounded discovery, ownership mapping, and evidence gathering before implementation."',
      "missing [agents.builder] table in Codex config",
      "missing [agents.reviewer] table in Codex config",
    ]);
  } finally {
    await removeTempRoot(root);
  }
});

test.skipIf(codexPath === null)("registered agent configuration passes the installed Codex strict parser", async () => {
  if (codexPath === null) throw new Error("Codex CLI is unavailable");
  const root = await makeTempRoot("agent-team-strict-config-");
  try {
    await writeText(path.join(root, "config.toml"), validConfig);
    await applyProfiles({ codexHome: root });

    const result = spawnSync(
      codexPath,
      [
        "exec",
        "--strict-config",
        "--ephemeral",
        "--skip-git-repo-check",
        "--config",
        'model_provider="__strict_config_probe__"',
        "probe",
      ],
      {
        encoding: "utf8",
        env: { ...process.env, CODEX_HOME: root, NO_COLOR: "1" },
      },
    );
    const output = `${result.stdout}${result.stderr}`;

    expect(result.status).toBe(1);
    expect(output).toContain("Model provider `__strict_config_probe__` not found");
    expect(output).not.toContain("unknown field");
  } finally {
    await removeTempRoot(root);
  }
});
