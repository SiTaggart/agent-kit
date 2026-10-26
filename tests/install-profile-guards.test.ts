import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import type { Dirent } from "node:fs";
import path from "node:path";
import { applyProfiles } from "../plugins/engineering/skills/codex-agent-team-setup/scripts/install";
import { makeTempRoot, removeTempRoot, writeText } from "./helpers";

const realAssets = path.resolve(
  import.meta.dir,
  "../plugins/engineering/skills/codex-agent-team-setup/assets/agents",
);
const installModule = path.resolve(
  import.meta.dir,
  "../plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts",
);

function fingerprint(codexHome: string): string {
  const hash = createHash("sha256");
  const files: string[] = [];
  const walk = (dir: string): void => {
    let entries: Dirent[];
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of [...entries].sort((left, right) => left.name.localeCompare(right.name))) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.isFile()) files.push(full);
    }
  };
  walk(path.join(codexHome, "agents"));
  files.push(path.join(codexHome, "agent-kit", "managed-agents.json"));
  for (const file of files) {
    hash.update(path.relative(codexHome, file));
    hash.update("\0");
    hash.update(existsSync(file) ? readFileSync(file) : "MISSING");
    hash.update("\0");
  }
  return hash.digest("hex");
}

test("a broken template or any profile conflict leaves agents and the ledger byte-identical", async () => {
  const conflictHome = await makeTempRoot("profile-conflict-");
  const brokenHome = await makeTempRoot("profile-broken-");
  const divergeRoot = await makeTempRoot("profile-diverge-");
  try {
    await applyProfiles({ codexHome: conflictHome });
    const reviewer = path.join(conflictHome, "agents", "reviewer.toml");
    await writeText(reviewer, `${readFileSync(reviewer, "utf8")}\n# local\n`);
    await writeText(path.join(conflictHome, "agents", "sentinel.txt"), "keep\n");
    const conflictBefore = fingerprint(conflictHome);
    await expect(applyProfiles({ codexHome: conflictHome })).rejects.toThrow(
      "Refusing to overwrite conflicting profiles: reviewer",
    );
    expect(fingerprint(conflictHome)).toBe(conflictBefore);
    expect(readFileSync(reviewer, "utf8")).toContain("# local\n");

    const assets = path.join(brokenHome, "assets");
    cpSync(realAssets, assets, { recursive: true });
    await applyProfiles({ codexHome: brokenHome, assetsDir: assets });
    writeFileSync(path.join(assets, "scout.toml"), "broken = [\n");
    const brokenBefore = fingerprint(brokenHome);
    await expect(applyProfiles({ codexHome: brokenHome, assetsDir: assets })).rejects.toThrow();
    expect(fingerprint(brokenHome)).toBe(brokenBefore);

    const divergeAssets = path.join(divergeRoot, "assets");
    const divergeHome = path.join(divergeRoot, "home");
    cpSync(realAssets, divergeAssets, { recursive: true });
    mkdirSync(divergeHome);
    const script = path.join(divergeRoot, "diverge.ts");
    writeFileSync(script, divergeScript(installModule));
    const child = spawnSync(process.execPath, [script, divergeAssets, divergeHome], { encoding: "utf8" });
    expect(child.status, `${child.stdout}\n${child.stderr}`).toBe(0);
  } finally {
    await Promise.all([conflictHome, brokenHome, divergeRoot].map(removeTempRoot));
  }
});

function divergeScript(modulePath: string): string {
  return `import { mock } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, rename, rm, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

const assetsDir = process.argv[2];
const codexHome = process.argv[3];
const scoutAsset = path.join(assetsDir, "scout.toml");
let diverge = false;
let scoutReads = 0;

mock.module("node:fs/promises", () => ({
  mkdir,
  rename,
  rm,
  unlink,
  writeFile,
  readFile: async (filePath: string) => {
    const text = readFileSync(filePath, "utf8");
    if (diverge && filePath === scoutAsset) {
      scoutReads += 1;
      if (scoutReads >= 2) return text.replace('model = "', 'model = "second-');
    }
    return text;
  },
}));

const { applyProfiles } = await import(${JSON.stringify(modulePath)});
await applyProfiles({ codexHome, assetsDir });
diverge = true;
await applyProfiles({ codexHome, assetsDir });
const installed = readFileSync(path.join(codexHome, "agents", "scout.toml"), "utf8");
const ledger = JSON.parse(readFileSync(path.join(codexHome, "agent-kit", "managed-agents.json"), "utf8"));
const fileHash = createHash("sha256").update(installed).digest("hex");
const ledgerHash = ledger.profiles.scout.checksum;
console.log(JSON.stringify({ scoutReads, fileHash, ledgerHash, match: fileHash === ledgerHash }));
if (fileHash !== ledgerHash) process.exit(1);
`;
}
