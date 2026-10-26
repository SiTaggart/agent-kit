import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { open, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const dateCopies = [
  "plugins/p3stack/skills/poteto-mode/scripts/lib/date.sh",
];

test("vendored date.sh copies are byte-identical", async () => {
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
    if (/date\s+-[rd]\b/.test(body)) {
      offenders.push(path.relative(repoRoot, script));
    }
  }
  expect(offenders).toEqual([]);
});

test("epoch_to_iso prints the UTC day for an epoch second", () => {
  const epoch = 1_700_000_000;
  const expected = new Date(epoch * 1000).toISOString().slice(0, 10);
  const script = path.join(repoRoot, dateCopies[0] ?? "");
  const actual = spawnSync(
    "bash",
    ["-c", 'source "$1" && epoch_to_iso "$2"', "bash", script, String(epoch)],
    { encoding: "utf8", cwd: tmpdir(), env: { ...process.env, TZ: "UTC" } },
  );
  expect(actual.status, actual.stderr).toBe(0);
  expect(actual.stdout.trim()).toBe(expected);
});

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
