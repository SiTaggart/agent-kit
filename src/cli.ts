#!/usr/bin/env bun
import path from "path";
import { validatePluginBundle } from "./validate";

type CliCommand = "validate" | "help";

interface CliOptions {
  command: CliCommand;
  root: string;
}

const COMMANDS: readonly CliCommand[] = ["validate", "help"];

async function main(): Promise<void> {
  const options = parseCliArgs(process.argv.slice(2));
  if (options.command === "help") {
    printHelp();
    return;
  }

  const report = await validatePluginBundle(options.root);
  if (!report.ok) {
    for (const failure of report.failures) {
      console.error(`${failure.path}: ${failure.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log("agent-kit marketplace plugins are valid");
}

export function parseCliArgs(args: readonly string[]): CliOptions {
  return {
    command: parseCommand(args[0]),
    root: path.resolve(getFlagValue(args.slice(1), "--root") ?? process.cwd()),
  };
}

function parseCommand(value: string | undefined): CliCommand {
  if (!value) {
    return "help";
  }

  if (isCommand(value)) {
    return value;
  }

  throw new Error(`Unknown command: ${value}`);
}

function getFlagValue(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

function isCommand(value: string): value is CliCommand {
  return COMMANDS.some((command) => command === value);
}

function printHelp(): void {
  console.log([
    "Usage: bun src/cli.ts validate [options]",
    "",
    "Options:",
    "  --root <path>   Marketplace repo root (defaults to cwd)",
    "",
    "validate   Check manifests, skills/, and hook files.",
  ].join("\n"));
}

if (import.meta.main) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exitCode = 1;
  });
}
