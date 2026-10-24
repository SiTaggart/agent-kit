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
  expect(claudeManifest.version).toBe("0.1.1");
  expect(codexManifest.version).toBe(claudeManifest.version);
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
    expect(entries[0].version).toBe("0.1.1");
    if (adapter.kind === "codex-plugin") {
      expect(entries[0].source).toEqual({ source: "local", path: "./plugins/design-guide" });
    } else {
      expect(entries[0].source).toBe("./plugins/design-guide");
    }
  }

  const cursorManifest = JSON.parse(await readText(path.join(pluginRoot, HARNESSES.cursor.manifestPath)));
  expect(cursorManifest.version).toBe("0.1.1");
  expect(cursorManifest.mcpServers).toBe("./mcp.json");
  const cursorMcp = JSON.parse(await readText(path.join(pluginRoot, cursorManifest.mcpServers)));
  expect(cursorMcp.mcpServers["design-guide"].url).toBe(serverUrl);
  expect(cursorMcp.mcpServers["design-guide"].type).toBeUndefined();

  const skill = await readText(path.join(pluginRoot, "skills/design-guide/SKILL.md"));
  const frontmatter = Bun.YAML.parse(skill.split("---")[1] ?? "");
  expect(frontmatter).toMatchObject({ name: "design-guide" });
  expect(skill).toContain("search_design_guidance");
  expect(skill).toContain("error messages after form submission");
  expect(skill).toContain("leave `system` unset");
  expect(skill).toContain("Leave `k` unset");
  expect(skill).toContain("A `score` only ranks the list.");
  expect(skill).toContain("no grounded guidance in the indexed design systems");
  expect(skill).toContain("Keep only hits that answer the question.");
  expect(skill).toContain("You may judge a hit by its passage or by opening that hit's own `url`.");
  expect(skill).toContain("Cite only the `source` and `url` of hits you kept");
  expect(skill).not.toContain("only when its text answers the question");
  expect(skill).toContain("Do not cite a url the tool did not return.");
  expect(skill).toContain("Paste points to the ARIA APG");
  expect(skill).toContain("A later turn searches again and cites only that turn's hits.");
  expect(skill).toContain("a fact that comes only from model memory");
  expect(skill.replaceAll("Do not web-search for more sources.", "")).not.toContain("web-search");

  const readme = await readText(path.join(pluginRoot, "README.md"));
  expect(readme).toContain("codex mcp add design-guide --url https://design-guide.me-2c5.workers.dev/mcp");
  expect(readme).toContain('default_tools_approval_mode = "approve"');
  expect(readme.match(/default_tools_approval_mode = "approve"/g)).toEqual([
    'default_tools_approval_mode = "approve"',
  ]);
  expect(readme).toContain("only for headless `codex exec`");
  expect(readme).toContain("under the `url =` line");
  expect(readme).toContain("still leave one server");
  expect(readme).not.toMatch(/\[mcp_servers\.["']?design-guide/);
});
