import { expect, test } from "bun:test";
import path from "path";
import { HARNESSES } from "../src/plugin-bundle";
import { validatePluginBundle } from "../src/validate";
import { readText } from "./helpers";

const repoRoot = path.resolve(import.meta.dir, "..");
const pluginRoot = path.join(repoRoot, "plugins/design-guide");
const serverUrl = "https://design-guide.me-2c5.workers.dev/mcp";

test("design-guide install files point Claude and Codex at one remote http server", async () => {
  const report = await validatePluginBundle(repoRoot);
  expect(report.failures).toEqual([]);

  const claudeManifest = JSON.parse(await readText(path.join(pluginRoot, HARNESSES.claude.manifestPath)));
  const codexManifest = JSON.parse(await readText(path.join(pluginRoot, HARNESSES.codex.manifestPath)));
  expect(claudeManifest.mcpServers).toBe("./.mcp.json");
  expect(codexManifest.mcpServers).toBe("./.mcp.json");

  const mcpPath = path.join(pluginRoot, claudeManifest.mcpServers);
  expect(path.join(pluginRoot, codexManifest.mcpServers)).toBe(mcpPath);
  const mcp = JSON.parse(await readText(mcpPath));
  expect(mcp.mcp_servers).toBeUndefined();
  expect(mcp).toEqual({
    mcpServers: {
      "design-guide": {
        type: "http",
        url: serverUrl,
      },
    },
  });

  for (const adapter of [HARNESSES.claude, HARNESSES.codex, HARNESSES.cursor]) {
    const catalog = JSON.parse(await readText(path.join(repoRoot, adapter.marketplacePath)));
    const entries = catalog.plugins.filter((entry: { name: string }) => entry.name === "design-guide");
    expect(entries).toHaveLength(1);
    if (adapter.kind === "codex-plugin") {
      expect(entries[0].source).toEqual({ source: "local", path: "./plugins/design-guide" });
    } else {
      expect(entries[0].source).toBe("./plugins/design-guide");
    }
  }

  const cursorManifest = JSON.parse(await readText(path.join(pluginRoot, HARNESSES.cursor.manifestPath)));
  expect(cursorManifest.mcpServers).toBe("./mcp.json");
  const cursorMcp = JSON.parse(await readText(path.join(pluginRoot, cursorManifest.mcpServers)));
  expect(cursorMcp.mcpServers["design-guide"].url).toBe(serverUrl);
  expect(cursorMcp.mcpServers["design-guide"].type).toBeUndefined();

  const skill = await readText(path.join(pluginRoot, "skills/design-guide/SKILL.md"));
  const frontmatter = Bun.YAML.parse(skill.split("---")[1] ?? "");
  expect(frontmatter).toMatchObject({ name: "design-guide" });
  expect(skill).toContain("search_design_guidance");
  expect(skill).toContain('{"results": []}');
});
