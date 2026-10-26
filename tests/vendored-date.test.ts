import { expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { open, readdir, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");
const dateCopies = [
  "plugins/p3stack/skills/poteto-mode/scripts/lib/date.sh",
  "plugins/p3stack/skills/show-me-your-work/scripts/lib/date.sh",
];

test("vendored date.sh copies are byte-identical", async () => {
  for (const relative of dateCopies) {
    expect(await Bun.file(path.join(repoRoot, relative)).exists(), relative).toBe(true);
  }
  const bodies = await Promise.all(dateCopies.map(async (relative) => {
    return await readFile(path.join(repoRoot, relative));
  }));
  const [first, ...rest] = bodies;
  expect(first).toBeDefined();
  for (const body of rest) {
    expect(Buffer.compare(first ?? Buffer.alloc(0), body)).toBe(0);
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

test("epoch_to_iso matches GNU date for an epoch second", () => {
  const epoch = "1700000000";
  const expected = spawnSync("date", ["-d", `@${epoch}`, "+%Y-%m-%d"], { encoding: "utf8" });
  expect(expected.status, expected.stderr).toBe(0);
  const script = path.join(repoRoot, dateCopies[0] ?? "");
  const actual = spawnSync(
    "bash",
    ["-c", 'source "$1" && epoch_to_iso "$2"', "bash", script, epoch],
    { encoding: "utf8", cwd: tmpdir() },
  );
  expect(actual.status, actual.stderr).toBe(0);
  expect(actual.stdout.trim()).toBe(expected.stdout.trim());
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
