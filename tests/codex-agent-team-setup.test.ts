import { expect, test } from "bun:test";
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

const validConfig = `[agents]
enabled = true
default_subagent_model = "gpt-5.6-sol"
default_subagent_reasoning_effort = "high"
max_concurrent_threads_per_session = 2
`;

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

    for (const name of ["scout", "builder", "reviewer"]) {
      const installed = Bun.TOML.parse(await readFile(path.join(root, "agents", `${name}.toml`), "utf8"));
      expect(installed).toMatchObject({ name });
      expect("model" in installed).toBe(false);
      expect("model_reasoning_effort" in installed).toBe(false);
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

test("status reports missing or incorrect agent defaults", async () => {
  const root = await makeTempRoot("agent-team-config-");
  try {
    await mkdir(root, { recursive: true });
    await applyProfiles({ codexHome: root });
    expect((await inspectStatus({ codexHome: root })).configIssues).toEqual([
      `missing Codex config: ${path.join(root, "config.toml")}`,
    ]);

    await writeText(
      path.join(root, "config.toml"),
      `[agents]\nenabled = true\ndefault_subagent_model = "gpt-5.6-sol"\ndefault_subagent_reasoning_effort = "medium"\nmax_concurrent_threads_per_session = 4\n`,
    );
    expect((await inspectStatus({ codexHome: root })).configIssues).toEqual([
      '[agents].default_subagent_reasoning_effort must be "high"',
      "[agents].max_concurrent_threads_per_session must be 2",
    ]);
  } finally {
    await removeTempRoot(root);
  }
});
