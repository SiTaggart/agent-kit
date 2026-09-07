import { afterEach, expect, test } from "bun:test";
import path from "path";
import { makeTempRoot, removeTempRoot, writeText } from "./helpers";

const tempRoots: string[] = [];
const resolvePortScript = path.join(import.meta.dir, "..", "plugins", "engineering", "skills", "ce-polish", "scripts", "resolve-port.sh");

afterEach(async () => {
  await Promise.all(tempRoots.map(removeTempRoot));
  tempRoots.length = 0;
});

test("resolves inline docker-compose port mappings before env fallback", async () => {
  const root = await makeTempRoot("agents-resolve-port-");
  tempRoots.push(root);

  await writeText(path.join(root, "docker-compose.yml"), [
    "services:",
    "  web:",
    "    ports: [\"4321:3000\"]",
    "",
  ].join("\n"));
  await writeText(path.join(root, ".env"), "PORT=9999\n");

  const result = await Bun.$`bash ${resolvePortScript} ${root}`.text();

  expect(result.trim()).toBe("4321");
});
