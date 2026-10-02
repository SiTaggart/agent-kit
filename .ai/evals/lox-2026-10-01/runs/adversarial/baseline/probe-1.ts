
import { mock } from "bun:test";
import * as fs from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { strict as assert } from "node:assert";
import path from "node:path";
const assetDir = path.resolve("plugins/engineering/skills/codex-agent-team-setup/assets/agents");
const files = new Map();
const ledger = { version: 1, profiles: {} };
for (const name of ["scout", "builder", "reviewer"]) {
  files.set(path.join(assetDir, name + ".toml"), await fs.readFile(path.join(assetDir, name + ".toml"), "utf8"));
  const old = execFileSync("git", ["show", "pilot-base:plugins/engineering/skills/codex-agent-team-setup/assets/agents/" + name + ".toml"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  files.set("/fixture/agents/" + name + ".toml", old);
  ledger.profiles[name] = { checksum: createHash("sha256").update(old).digest("hex") };
}
files.set("/fixture/agent-kit/managed-agents.json", JSON.stringify(ledger));
const skill = await fs.readFile("plugins/engineering/skills/codex-agent-team-setup/SKILL.md", "utf8");
files.set("/fixture/config.toml", skill.match(/```toml\n([\s\S]*?)```/)[1]);
mock.module("node:fs/promises", () => ({
  readFile: async file => {
    if (!files.has(String(file))) throw Object.assign(new Error("missing"), { code: "ENOENT" });
    return files.get(String(file));
  },
  mkdir: async () => {},
  writeFile: async (file, content) => { files.set(String(file), content); },
  rename: async (from, to) => { assert(files.has(String(from))); files.set(String(to), files.get(String(from))); files.delete(String(from)); },
  rm: async file => { files.delete(String(file)); },
  unlink: async file => { assert(files.has(String(file))); files.delete(String(file)); },
}));
const { planProfiles, applyProfiles, inspectStatus, uninstallProfiles } = await import("./plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts");
const options = { codexHome: "/fixture" };
assert.deepEqual((await planProfiles(options)).map(action => action.kind), ["update", "update", "update"]);
await applyProfiles(options);
assert.equal((await inspectStatus(options)).healthy, true);
console.log("PASS: parent-revision managed profiles repair to healthy current profiles");
files.set("/fixture/agents/scout.toml", "model = \"user-owned\"\n");
assert.equal((await planProfiles(options))[0].kind, "conflict");
const before = JSON.stringify([...files]);
await assert.rejects(applyProfiles(options), /Refusing to overwrite conflicting profiles: scout/);
assert.equal(JSON.stringify([...files]), before);
console.log("PASS: locally modified profile blocks apply without changing any virtual file");
assert.deepEqual(await uninstallProfiles(options), { removed: ["builder", "reviewer"], preserved: ["scout"] });
console.log("PASS: uninstall preserves modified profile and removes managed profiles");

