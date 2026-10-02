
import { mock } from "bun:test";
import { readFile as diskRead } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
const files = new Map();
const virtualHome = "/frozen-review-virtual";
const skillDir = path.resolve("plugins/engineering/skills/codex-agent-team-setup");
const document = await diskRead(path.join(skillDir, "SKILL.md"), "utf8");
const validConfig = document.match(/```toml\n([\s\S]*?)\n```/)[1] + "\n";
const templates = {};
for (const name of ["scout", "builder", "reviewer"]) {
  const asset = path.join(skillDir, "assets/agents", name + ".toml");
  templates[name] = await diskRead(asset, "utf8");
  files.set(asset, templates[name]);
}
const missing = p => Object.assign(new Error("missing virtual file: " + p), { code: "ENOENT" });
mock.module("node:fs/promises", () => ({
  readFile: async p => { if (!files.has(p)) throw missing(p); return files.get(p); },
  mkdir: async () => {},
  writeFile: async (p, text) => { files.set(p, text); },
  rename: async (a, b) => { if (!files.has(a)) throw missing(a); files.set(b, files.get(a)); files.delete(a); },
  rm: async p => { files.delete(p); },
  unlink: async p => { if (!files.has(p)) throw missing(p); files.delete(p); },
}));
const installer = await import("./plugins/engineering/skills/codex-agent-team-setup/scripts/install.ts");
const hash = text => createHash("sha256").update(text).digest("hex");
const names = ["scout", "builder", "reviewer"];
const descriptions = Bun.TOML.parse(validConfig).agents;
const oldProfiles = {};
for (const name of names) {
  const old = templates[name].replace(/^model = .*\nmodel_reasoning_effort = .*\n/, "name = " + JSON.stringify(name) + "\ndescription = " + JSON.stringify(descriptions[name].description) + "\n");
  files.set(virtualHome + "/agents/" + name + ".toml", old);
  oldProfiles[name] = { checksum: hash(old) };
}
files.set(virtualHome + "/agent-kit/managed-agents.json", JSON.stringify({ version: 1, profiles: oldProfiles }));
files.set(virtualHome + "/config.toml", validConfig);
console.log("legacy upgrade plan:", (await installer.planProfiles({ codexHome: virtualHome })).map(x => x.kind));
await installer.applyProfiles({ codexHome: virtualHome });
console.log("upgraded healthy:", (await installer.inspectStatus({ codexHome: virtualHome })).healthy);
const customLegacyConfig = validConfig.replace("[agents]\n", '[agents]\nenabled = true\ndefault_subagent_model = "custom-model"\ndefault_subagent_reasoning_effort = "medium"\n');
files.set(virtualHome + "/config.toml", customLegacyConfig);
console.log("custom legacy keys retained:", await installer.inspectStatus({ codexHome: virtualHome }));
files.set(virtualHome + "/config.toml", validConfig.replace("max_concurrent_threads_per_session = 2", "max_concurrent_threads_per_session = 4"));
console.log("user-selected concurrency:", (await installer.inspectStatus({ codexHome: virtualHome })).configIssues);
files.set(virtualHome + "/config.toml", validConfig);
console.log("uninstall:", await installer.uninstallProfiles({ codexHome: virtualHome }));
console.log("post-uninstall registry:", names.map(name => ({ role: name, registered: Bun.TOML.parse(files.get(virtualHome + "/config.toml")).agents[name].config_file, targetExists: files.has(virtualHome + "/agents/" + name + ".toml") })));
console.log("All installer IO was in memory; no fixture or host files written.");

