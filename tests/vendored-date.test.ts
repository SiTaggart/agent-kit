import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { open, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const dateCopies = [
  "plugins/p3stack/skills/poteto-mode/scripts/lib/date.sh",
];

test("only the listed date.sh copies exist", async () => {
  const copies = (await pluginScripts(path.join(repoRoot, "plugins")))
    .filter((file) => file.endsWith(`${path.sep}scripts${path.sep}lib${path.sep}date.sh`))
    .map((file) => path.relative(repoRoot, file))
    .sort();
  expect(copies).toEqual([...dateCopies].sort());
  const bodies = await Promise.all(copies.map(async (relative) => readFile(path.join(repoRoot, relative))));
  const [first, ...rest] = bodies;
  expect(first).toBeDefined();
  for (const body of rest) {
    expect(body.equals(first ?? Buffer.alloc(0))).toBe(true);
  }
});

test("no plugin script calls date -r or date -d outside scripts/lib/date.sh", async () => {
  const scripts = await pluginScripts(path.join(repoRoot, "plugins"));
  const offenders: string[] = [];
  for (const script of scripts) {
    if (script.endsWith(`${path.sep}scripts${path.sep}lib${path.sep}date.sh`)) {
      continue;
    }
    const body = await readFile(script, "utf8");
    if (body.split("\n").some((line) => flagsEpochDate(line))) {
      offenders.push(path.relative(repoRoot, script));
    }
  }
  expect(offenders).toEqual([]);
});

test("epoch date scans catch combined and long flags", () => {
  for (const line of ["date -d @0", "date -r 0", "date -u -d @0", "date --date=@0", "date -ud @0", "date --reference=0"]) {
    expect(flagsEpochDate(line), line).toBe(true);
  }
  for (const line of ["date -u +%Y-%m-%dT%H:%M:%SZ", "date +%s", "date --version", "candidate"]) {
    expect(flagsEpochDate(line), line).toBe(false);
  }
});

test("epoch_to_iso prints the UTC day with GNU date", () => {
  expectUtcDay();
});

test("epoch_to_iso prints the UTC day with the BSD date shim", () => {
  expectUtcDay(path.join(repoRoot, "tests/fixtures/date/bsd"));
});

test("epoch_to_iso prints the UTC day with the BusyBox date shim", () => {
  expectUtcDay(path.join(repoRoot, "tests/fixtures/date/busybox"));
});

function expectUtcDay(pathPrefix?: string): void {
  const epoch = 1_700_000_000;
  const expected = new Date(epoch * 1000).toISOString().slice(0, 10);
  const script = path.join(repoRoot, dateCopies[0] ?? "");
  const env = { ...process.env, TZ: "UTC" };
  if (pathPrefix) env.PATH = `${pathPrefix}${path.delimiter}${env.PATH ?? ""}`;
  const actual = spawnSync(
    "bash",
    ["-c", 'source "$1" && epoch_to_iso "$2"', "bash", script, String(epoch)],
    { encoding: "utf8", cwd: tmpdir(), env },
  );
  expect(actual.status, actual.stderr).toBe(0);
  expect(actual.stdout.trim()).toBe(expected);
}

function flagsEpochDate(line: string): boolean {
  return /date\s+-[rd]\b/.test(line);
}

async function pluginScripts(directory: string): Promise<string[]> {
  const found: string[] = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") {
        continue;
      }
      found.push(...await pluginScripts(full));
      continue;
    }
    if (entry.name.endsWith(".sh") || await hasShebang(full)) {
      found.push(full);
    }
  }
  return found;
}

async function hasShebang(file: string): Promise<boolean> {
  const handle = await open(file, "r");
  try {
    const buffer = Buffer.alloc(2);
    const { bytesRead } = await handle.read(buffer, 0, 2, 0);
    return bytesRead === 2 && buffer.toString() === "#!";
  } finally {
    await handle.close();
  }
}
