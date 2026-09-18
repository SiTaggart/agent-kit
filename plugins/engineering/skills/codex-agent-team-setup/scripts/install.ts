#!/usr/bin/env bun

import { createHash, randomUUID } from "node:crypto";
import { homedir } from "node:os";
import path from "node:path";
import { mkdir, readFile, rename, rm, unlink, writeFile } from "node:fs/promises";

const PROFILE_NAMES = ["scout", "builder", "reviewer"] as const;
const LEDGER_VERSION = 1;

export type ProfileName = (typeof PROFILE_NAMES)[number];
export type ProfileActionKind = "create" | "update" | "unchanged" | "conflict";

export interface InstallOptions {
  readonly codexHome: string;
  readonly assetsDir?: string;
}

export interface ProfileAction {
  readonly name: ProfileName;
  readonly targetPath: string;
  readonly kind: ProfileActionKind;
  readonly detail: string;
}

export interface StatusResult {
  readonly healthy: boolean;
  readonly profiles: readonly ProfileAction[];
  readonly configIssues: readonly string[];
}

interface Template {
  readonly name: ProfileName;
  readonly content: string;
  readonly checksum: string;
}

interface LedgerProfile {
  readonly checksum: string;
}

interface Ledger {
  readonly version: number;
  readonly profiles: Partial<Record<ProfileName, LedgerProfile>>;
}

interface InstallPaths {
  readonly agentsDir: string;
  readonly configPath: string;
  readonly ledgerPath: string;
  readonly assetsDir: string;
}

const desiredAgentConfig = {
  max_concurrent_threads_per_session: 2,
  scout: {
    description: "Read-only repository scout for bounded discovery, ownership mapping, and evidence gathering before implementation.",
    config_file: "./agents/scout.toml",
  },
  builder: {
    description: "Bounded implementation agent for one accepted change with focused verification.",
    config_file: "./agents/builder.toml",
  },
  reviewer: {
    description: "Read-only independent reviewer for a supplied diff, acceptance criteria, and verification evidence.",
    config_file: "./agents/reviewer.toml",
  },
} as const;

function checksum(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function resolvePaths(options: InstallOptions): InstallPaths {
  const codexHome = path.resolve(options.codexHome);
  return {
    agentsDir: path.join(codexHome, "agents"),
    configPath: path.join(codexHome, "config.toml"),
    ledgerPath: path.join(codexHome, "agent-kit", "managed-agents.json"),
    assetsDir: options.assetsDir
      ? path.resolve(options.assetsDir)
      : path.resolve(import.meta.dir, "../assets/agents"),
  };
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (isRecord(error) && error.code === "ENOENT") return null;
    throw error;
  }
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.${randomUUID()}.tmp`);
  try {
    await writeFile(temporaryPath, content, { encoding: "utf8", mode: 0o600 });
    await rename(temporaryPath, filePath);
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

async function loadTemplates(assetsDir: string): Promise<readonly Template[]> {
  return await Promise.all(
    PROFILE_NAMES.map(async (name) => {
      const assetPath = path.join(assetsDir, `${name}.toml`);
      const content = await readFile(assetPath, "utf8");
      const parsed: unknown = Bun.TOML.parse(content);
      if (!isRecord(parsed)) throw new Error(`${assetPath} must contain a TOML table.`);
      for (const key of ["model", "model_reasoning_effort", "developer_instructions", "sandbox_mode"] as const) {
        if (typeof parsed[key] !== "string" || parsed[key].length === 0) {
          throw new Error(`${assetPath} must define a non-empty ${key}.`);
        }
      }
      return { name, content, checksum: checksum(content) };
    }),
  );
}

async function readLedger(ledgerPath: string): Promise<Ledger> {
  const content = await readOptional(ledgerPath);
  if (content === null) return { version: LEDGER_VERSION, profiles: {} };

  const parsed: unknown = JSON.parse(content);
  if (!isRecord(parsed) || parsed.version !== LEDGER_VERSION || !isRecord(parsed.profiles)) {
    throw new Error(`Invalid Agent Kit profile ledger: ${ledgerPath}`);
  }

  const profiles: Partial<Record<ProfileName, LedgerProfile>> = {};
  for (const name of PROFILE_NAMES) {
    const entry = parsed.profiles[name];
    if (entry === undefined) continue;
    if (!isRecord(entry) || typeof entry.checksum !== "string") {
      throw new Error(`Invalid ${name} entry in Agent Kit profile ledger: ${ledgerPath}`);
    }
    profiles[name] = { checksum: entry.checksum };
  }
  return { version: LEDGER_VERSION, profiles };
}

async function writeLedger(ledgerPath: string, ledger: Ledger): Promise<void> {
  await atomicWrite(ledgerPath, `${JSON.stringify(ledger, null, 2)}\n`);
}

export async function planProfiles(options: InstallOptions): Promise<readonly ProfileAction[]> {
  const paths = resolvePaths(options);
  const [templates, ledger] = await Promise.all([loadTemplates(paths.assetsDir), readLedger(paths.ledgerPath)]);

  return await Promise.all(
    templates.map(async (template): Promise<ProfileAction> => {
      const targetPath = path.join(paths.agentsDir, `${template.name}.toml`);
      const installed = await readOptional(targetPath);
      if (installed === null) {
        return { name: template.name, targetPath, kind: "create", detail: "profile is not installed" };
      }

      const installedChecksum = checksum(installed);
      if (installedChecksum === template.checksum) {
        return { name: template.name, targetPath, kind: "unchanged", detail: "profile matches the plugin" };
      }

      if (installedChecksum === ledger.profiles[template.name]?.checksum) {
        return { name: template.name, targetPath, kind: "update", detail: "previously managed profile has an update" };
      }

      return {
        name: template.name,
        targetPath,
        kind: "conflict",
        detail: "profile is unmanaged or was modified locally",
      };
    }),
  );
}

export async function applyProfiles(options: InstallOptions): Promise<readonly ProfileAction[]> {
  const paths = resolvePaths(options);
  const [actions, templates] = await Promise.all([planProfiles(options), loadTemplates(paths.assetsDir)]);
  const conflicts = actions.filter((action) => action.kind === "conflict");
  if (conflicts.length > 0) {
    throw new Error(`Refusing to overwrite conflicting profiles: ${conflicts.map((action) => action.name).join(", ")}`);
  }

  await mkdir(paths.agentsDir, { recursive: true });
  const profiles: Partial<Record<ProfileName, LedgerProfile>> = {};
  for (const template of templates) {
    const action = actions.find((candidate) => candidate.name === template.name);
    if (action?.kind === "create" || action?.kind === "update") {
      await atomicWrite(action.targetPath, template.content);
    }
    profiles[template.name] = { checksum: template.checksum };
  }
  await writeLedger(paths.ledgerPath, { version: LEDGER_VERSION, profiles });
  return actions;
}

export async function configIssues(options: InstallOptions): Promise<readonly string[]> {
  const { configPath } = resolvePaths(options);
  const content = await readOptional(configPath);
  if (content === null) return [`missing Codex config: ${configPath}`];

  let parsed: unknown;
  try {
    parsed = Bun.TOML.parse(content);
  } catch (error) {
    return [`invalid Codex config: ${error instanceof Error ? error.message : String(error)}`];
  }

  if (!isRecord(parsed) || !isRecord(parsed.agents)) return ["missing [agents] table in Codex config"];

  const issues: string[] = [];
  for (const [key, expected] of Object.entries(desiredAgentConfig)) {
    const actual = parsed.agents[key];
    if (isRecord(expected)) {
      if (!isRecord(actual)) {
        issues.push(`missing [agents.${key}] table in Codex config`);
        continue;
      }
      for (const [roleKey, roleExpected] of Object.entries(expected)) {
        if (actual[roleKey] !== roleExpected) {
          issues.push(`[agents.${key}].${roleKey} must be ${JSON.stringify(roleExpected)}`);
        }
      }
      continue;
    }
    if (actual !== expected) {
      issues.push(`[agents].${key} must be ${JSON.stringify(expected)}`);
    }
  }
  return issues;
}

export async function inspectStatus(options: InstallOptions): Promise<StatusResult> {
  const [profiles, issues] = await Promise.all([planProfiles(options), configIssues(options)]);
  return {
    healthy: profiles.every((profile) => profile.kind === "unchanged") && issues.length === 0,
    profiles,
    configIssues: issues,
  };
}

export async function uninstallProfiles(
  options: InstallOptions,
): Promise<Readonly<{ removed: readonly ProfileName[]; preserved: readonly ProfileName[] }>> {
  const paths = resolvePaths(options);
  const ledger = await readLedger(paths.ledgerPath);
  const remaining: Partial<Record<ProfileName, LedgerProfile>> = {};
  const removed: ProfileName[] = [];
  const preserved: ProfileName[] = [];

  for (const name of PROFILE_NAMES) {
    const managed = ledger.profiles[name];
    if (managed === undefined) continue;
    const targetPath = path.join(paths.agentsDir, `${name}.toml`);
    const installed = await readOptional(targetPath);
    if (installed === null) {
      removed.push(name);
      continue;
    }
    if (checksum(installed) === managed.checksum) {
      await unlink(targetPath);
      removed.push(name);
      continue;
    }
    remaining[name] = managed;
    preserved.push(name);
  }

  if (Object.keys(remaining).length === 0) {
    await rm(paths.ledgerPath, { force: true });
  } else {
    await writeLedger(paths.ledgerPath, { version: LEDGER_VERSION, profiles: remaining });
  }
  return { removed, preserved };
}

function formatActions(actions: readonly ProfileAction[]): string {
  return actions.map((action) => `${action.kind.padEnd(9)} ${action.name}: ${action.detail}`).join("\n");
}

function parseCliArgs(args: readonly string[]): { command: string; options: InstallOptions } {
  const command = args[0] ?? "status";
  const homeIndex = args.indexOf("--codex-home");
  const explicitHome = homeIndex >= 0 ? args[homeIndex + 1] : undefined;
  if (homeIndex >= 0 && explicitHome === undefined) throw new Error("--codex-home requires a path.");
  return {
    command,
    options: { codexHome: explicitHome ?? process.env.CODEX_HOME ?? path.join(homedir(), ".codex") },
  };
}

async function main(): Promise<void> {
  const { command, options } = parseCliArgs(Bun.argv.slice(2));
  if (command === "plan") {
    console.log(formatActions(await planProfiles(options)));
    return;
  }
  if (command === "apply") {
    console.log(formatActions(await applyProfiles(options)));
    console.log("Profiles installed. Update config.toml as described by the setup skill, then run status.");
    return;
  }
  if (command === "status") {
    const status = await inspectStatus(options);
    console.log(formatActions(status.profiles));
    for (const issue of status.configIssues) console.log(`config    ${issue}`);
    if (!status.healthy) process.exitCode = 1;
    return;
  }
  if (command === "uninstall") {
    const result = await uninstallProfiles(options);
    console.log(`removed   ${result.removed.join(", ") || "none"}`);
    console.log(`preserved ${result.preserved.join(", ") || "none"}`);
    return;
  }
  throw new Error(`Unknown command: ${command}. Expected plan, apply, status, or uninstall.`);
}

if (import.meta.main) {
  await main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
