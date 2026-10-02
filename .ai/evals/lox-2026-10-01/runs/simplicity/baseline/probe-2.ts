import { createHash, randomUUID } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";
const dir = path.resolve("plugins/engineering/skills/codex-agent-team-setup");
const names = ["scout", "builder", "reviewer"];
const assets = new Map();
for (const name of names) assets.set(`${dir}/assets/agents/${name}.toml`, await Bun.file(`${dir}/assets/agents/${name}.toml`).text());
const files = new Map(assets);
let writes = 0;
const fs = {
readFile: async (p) => { if (!files.has(p)) throw Object.assign(new Error("missing"), {code:"ENOENT"}); return files.get(p); },
mkdir: async () => {}, writeFile: async (p,c) => { writes++; files.set(p,c); },
rename: async (p,q) => {files.set(q,files.get(p));files.delete(p);},
rm: async (p) => {files.delete(p);}, unlink: async (p) => {files.delete(p);}
};
let code = await Bun.file(`${dir}/scripts/install.ts`).text();
code = code.replace(/^import .*;$/gm, "").replace(/^export /gm, "").replaceAll("import.meta.dir", JSON.stringify(`${dir}/scripts`)).replaceAll("import.meta.main", "false");
code = new Bun.Transpiler({loader:"ts"}).transformSync(code);
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
const api = await new AsyncFunction("fs", "createHash", "randomUUID", "homedir", "path", "Bun", `const { mkdir, readFile, rename, rm, unlink, writeFile } = fs;\n${code}\nreturn {planProfiles, applyProfiles, inspectStatus, configIssues, uninstallProfiles};`)(fs,createHash,randomUUID,homedir,path,Bun);
const root = "/frozen-review/codex";
const config = `${root}/config.toml`, ledger = `${root}/agent-kit/managed-agents.json`;
const target = (name) => `${root}/agents/${name}.toml`;
const template = (name) => assets.get(`${dir}/assets/agents/${name}.toml`);
const options = {codexHome:root};
const assert = (ok,msg) => {if (!ok) throw new Error(msg);};
const reset = () => { files.clear();for (const [p,c] of assets) files.set(p,c);writes=0;};
const doc = await Bun.file(`${dir}/SKILL.md`).text();
const valid = doc.match(/```toml\n([\s\S]*?)```/)[1];
const roles = Bun.TOML.parse(valid).agents;
files.set(config,valid);
assert((await api.planProfiles(options)).every(a=>a.kind==="create"),"fresh create");
await api.applyProfiles(options);
assert((await api.inspectStatus(options)).healthy,"documented config healthy");
assert(files.get(config)===valid,"apply preserves config");
console.log("PASS: fresh install, unchanged status, documented config unchanged");
reset();
const oldLedger = {version:1,profiles:{}};
for (const name of names) {
const old = template(name).replace(/^model = .*\nmodel_reasoning_effort = .*\n/,`name = "${name}"\ndescription = ${JSON.stringify(roles[name].description)}\n`);
files.set(target(name),old);oldLedger.profiles[name]={checksum:createHash("sha256").update(old).digest("hex")};
}
files.set(ledger,JSON.stringify(oldLedger));files.set(config,valid);
assert((await api.planProfiles(options)).every(a=>a.kind==="update"),"old managed update");
await api.applyProfiles(options);
assert((await api.inspectStatus(options)).healthy,"repaired status healthy");
for (const name of names) assert(files.get(target(name))===template(name),"exact installed bytes");
console.log("PASS: legacy managed TOML repair with old checksum ledger");
for (const managed of [false,true]) {
reset();if(managed)await api.applyProfiles(options);writes=0;
const custom = managed?`${template("scout")}\n# local edit\n`:"custom profile";
files.set(target("scout"),custom);const before=files.get(ledger);
assert((await api.planProfiles(options)).find(a=>a.name==="scout").kind==="conflict","conflict detection");
let refused=false;try{await api.applyProfiles(options);}catch(e){refused=e.message.includes("Refusing to overwrite");}
assert(refused&&writes===0&&files.get(target("scout"))===custom&&files.get(ledger)===before,"conflict preservation");
}
console.log("PASS: unmanaged/edited managed conflicts preserve files and ledger before any write");
reset();files.set(config,valid);await api.applyProfiles(options);
files.set(target("reviewer"),`${template("reviewer")}\n# local edit\n`);
const result=await api.uninstallProfiles(options);
assert(JSON.stringify(result.removed)===JSON.stringify(["scout","builder"])&&JSON.stringify(result.preserved)===JSON.stringify(["reviewer"])&&files.get(config)===valid,"safe uninstall");
console.log("PASS: uninstall preserves edited managed profile and config");
reset();assert((await api.configIssues(options))[0].includes("missing Codex config"),"missing config");
files.set(config,"[agents]\nmax_concurrent_threads_per_session = 4\n[agents.scout]\ndescription = \"custom\"\nconfig_file = \"./agents/scout.toml\"\n");
assert((await api.configIssues(options)).length===4,"scalar, description and role drift");
files.set(config,valid.replace("./agents/builder.toml","./agents/custom.toml"));
assert((await api.configIssues(options))[0].includes("[agents.builder].config_file"),"path drift");
files.set(config,"[agents\n");assert((await api.configIssues(options))[0].includes("invalid Codex config"),"malformed config");
console.log("PASS: missing/malformed config, concurrency/description drift, missing roles, role path drift");

