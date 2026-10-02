import { createHash } from "node:crypto";
import path from "node:path";
const skillDir = path.resolve("plugins/engineering/skills/codex-agent-team-setup");
const names = ["scout", "builder", "reviewer"];
const templates = new Map();
for (const name of names) templates.set(path.join(skillDir, "assets/agents", `${name}.toml`), await Bun.file(path.join(skillDir, "assets/agents", `${name}.toml`)).text());
const files = new Map(templates);
const writes = [];
const root = "/frozen-review/codex";
const ledgerPath = `${root}/agent-kit/managed-agents.json`;
const configPath = `${root}/config.toml`;
const target = (name) => `${root}/agents/${name}.toml`;
const source = (name) => templates.get(path.join(skillDir, "assets/agents", `${name}.toml`));
const sha = (content) => createHash("sha256").update(content).digest("hex");
globalThis.reviewFs = {
  readFile: async (file) => { if (!files.has(file)) throw Object.assign(new Error("missing"), { code: "ENOENT" }); return files.get(file); },
  mkdir: async () => {},
  writeFile: async (file, content) => { writes.push(file); files.set(file, content); },
  rename: async (from, to) => { files.set(to, files.get(from)); files.delete(from); },
  rm: async (file) => { files.delete(file); },
  unlink: async (file) => { files.delete(file); },
};
const installerSource = await Bun.file(`${skillDir}/scripts/install.ts`).text();
const adapted = installerSource.replace(/import \{ mkdir, readFile, rename, rm, unlink, writeFile \} from "node:fs\/promises";/, "const { mkdir, readFile, rename, rm, unlink, writeFile } = globalThis.reviewFs;").replaceAll("import.meta.dir", JSON.stringify(`${skillDir}/scripts`));
if (adapted === installerSource || adapted.includes("node:fs/promises")) throw new Error("IO seam replacement failed");
const transpiled = new Bun.Transpiler({ loader: "ts" }).transformSync(adapted);
const { planProfiles, applyProfiles, inspectStatus, configIssues, uninstallProfiles } = await import(`data:text/javascript;base64,${Buffer.from(transpiled).toString("base64")}`);
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const reset = () => { files.clear(); for (const [file, content] of templates) files.set(file, content); writes.length = 0; };
const setupDoc = await Bun.file(`${skillDir}/SKILL.md`).text();
const validConfig = setupDoc.match(/```toml\n([\s\S]*?)```/)[1];
const roles = Bun.TOML.parse(validConfig).agents;
reset();
files.set(configPath, validConfig);
assert((await planProfiles({ codexHome: root })).every((a) => a.kind === "create"), "new install must create");
await applyProfiles({ codexHome: root });
assert((await inspectStatus({ codexHome: root })).healthy, "documented registry must be healthy");
assert(files.get(configPath) === validConfig, "apply must preserve config bytes");
console.log("PASS: fresh install, unchanged detection, documented registry, config untouched");
reset();
const legacyLedger = { version: 1, profiles: {} };
for (const name of names) {
  const legacy = source(name).replace(/^model = .*\nmodel_reasoning_effort = .*\n/, `name = "${name}"\ndescription = ${JSON.stringify(roles[name].description)}\n`);
  files.set(target(name), legacy);
  legacyLedger.profiles[name] = { checksum: sha(legacy) };
}
files.set(ledgerPath, JSON.stringify(legacyLedger));
files.set(configPath, validConfig);
assert((await planProfiles({ codexHome: root })).every((a) => a.kind === "update"), "legacy managed files must update");
await applyProfiles({ codexHome: root });
assert((await inspectStatus({ codexHome: root })).healthy, "repaired setup must be healthy");
for (const name of names) assert(files.get(target(name)) === source(name), "repair must install exact template bytes");
console.log("PASS: legacy managed profile repair using old-format checksums");
for (const managed of [false, true]) {
  reset();
  if (managed) { await applyProfiles({ codexHome: root }); writes.length = 0; }
  const custom = managed ? `${source("scout")}\n# user edit\n` : "developer_instructions = \"custom\"\n";
  files.set(target("scout"), custom);
  const ledgerBefore = files.get(ledgerPath);
  assert((await planProfiles({ codexHome: root })).find((a) => a.name === "scout").kind === "conflict", "user profile must conflict");
  let refused = false;
  try { await applyProfiles({ codexHome: root }); } catch (error) { refused = error.message.includes("Refusing to overwrite conflicting profiles"); }
  assert(refused && writes.length === 0, "conflict must refuse before writes");
  assert(files.get(target("scout")) === custom && files.get(ledgerPath) === ledgerBefore, "conflict must preserve user bytes and ledger");
}
console.log("PASS: unmanaged and edited managed profiles refuse all apply writes");
reset();
files.set(configPath, validConfig);
await applyProfiles({ codexHome: root });
files.set(target("reviewer"), `${source("reviewer")}\n# local edit\n`);
const removal = await uninstallProfiles({ codexHome: root });
assert(JSON.stringify(removal.removed) === JSON.stringify(["scout", "builder"]), "uninstall must remove unchanged owned files");
assert(JSON.stringify(removal.preserved) === JSON.stringify(["reviewer"]), "uninstall must preserve edited owned file");
assert(files.get(configPath) === validConfig, "uninstall must preserve config");
console.log("PASS: checksum-based uninstall preserves edits and config");
reset();
assert((await configIssues({ codexHome: root }))[0].includes("missing Codex config"), "missing config must be detected");
files.set(configPath, "[agents]\nmax_concurrent_threads_per_session = 4\n[agents.scout]\ndescription = \"custom\"\nconfig_file = \"./agents/scout.toml\"\n");
assert((await configIssues({ codexHome: root })).length === 4, "concurrency, description and missing roles must be detected");
files.set(configPath, validConfig.replace("./agents/builder.toml", "./agents/custom.toml"));
assert((await configIssues({ codexHome: root }))[0].includes("[agents.builder].config_file"), "role path drift must be detected");
files.set(configPath, "[agents\n");
assert((await configIssues({ codexHome: root }))[0].includes("invalid Codex config"), "malformed config must be detected");
console.log("PASS: missing/malformed config, scalar drift, missing roles and path drift");

