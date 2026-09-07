import { expect, test } from "bun:test";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const script = path.join(import.meta.dir, "..", "plugins", "knowledge", "skills", "ce-sessions", "scripts", "discover-sessions.sh");
const metadataScript = path.join(
  import.meta.dir,
  "..",
  "plugins",
  "knowledge",
  "skills",
  "ce-sessions",
  "scripts",
  "extract-metadata.py",
);
const skeletonScript = path.join(
  import.meta.dir,
  "..",
  "plugins",
  "knowledge",
  "skills",
  "ce-sessions",
  "scripts",
  "extract-skeleton.py",
);

test("discovers Claude sessions globally and in a dot-prefixed repo", async () => {
  const home = await mkdtemp(path.join(os.tmpdir(), "ce-sessions-"));
  const agents = path.join(home, ".claude", "projects", "-Users-test--agents");
  const spade = path.join(home, ".claude", "projects", "-Users-test-spade");
  const agentsSession = path.join(agents, "agents.jsonl");
  const spadeSession = path.join(spade, "spade.jsonl");
  const codexSession = path.join(home, ".codex", "sessions", "shared.jsonl");
  const mirroredOrcaSession = path.join(
    home,
    "Library",
    "Application Support",
    "orca",
    "codex-runtime-home",
    "home",
    "sessions",
    "shared.jsonl",
  );
  const orcaSession = path.join(path.dirname(mirroredOrcaSession), "orca.jsonl");
  const cursorTranscripts = path.join(home, ".cursor", "projects", "-Users-test-spade", "agent-transcripts");
  const cursorSessionA = path.join(cursorTranscripts, "a", "transcript.jsonl");
  const cursorSessionB = path.join(cursorTranscripts, "b", "transcript.jsonl");

  await mkdir(agents, { recursive: true });
  await mkdir(spade, { recursive: true });
  await mkdir(path.dirname(codexSession), { recursive: true });
  await mkdir(path.dirname(mirroredOrcaSession), { recursive: true });
  await mkdir(path.dirname(cursorSessionA), { recursive: true });
  await mkdir(path.dirname(cursorSessionB), { recursive: true });
  await writeFile(agentsSession, "{}\n");
  await writeFile(spadeSession, "{}\n");
  await writeFile(codexSession, "{}\n");
  await writeFile(mirroredOrcaSession, "{}\n");
  await writeFile(orcaSession, "{}\n");
  await writeFile(cursorSessionA, "{}\n");
  await writeFile(cursorSessionB, "{}\n");

  const run = async (scope: string, platform?: string) => {
    const args = ["bash", script, scope, "7"];
    if (platform) args.push("--platform", platform);

    const process = Bun.spawn(args, {
      env: { ...Bun.env, HOME: home },
      stdout: "pipe",
    });
    const output = await new Response(process.stdout).text();
    expect(await process.exited).toBe(0);
    return output.trim().split("\n").sort();
  };

  expect(await run("--all-repos")).toEqual(
    [agentsSession, codexSession, cursorSessionA, cursorSessionB, orcaSession, spadeSession].sort(),
  );
  expect(await run(".agents", "claude")).toEqual([agentsSession]);
});

test("extracts Hermes sessions without reasoning or tool output", async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "ce-sessions-hermes-"));
  const input = path.join(directory, "session.jsonl");
  const output = path.join(directory, "skeleton.txt");
  const session = {
    id: "hermes-test",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Please inspect the skill behavior in this repository." },
          { type: "image_url", image_url: { url: "SECRET_IMAGE" } },
        ],
        timestamp: 1783962346.49,
      },
      {
        role: "assistant",
        content: [{ type: "text", text: "I will inspect the relevant source before deciding." }],
        reasoning: "SECRET_REASONING",
        timestamp: 1783962346.49,
        tool_calls: [
          {
            function: {
              name: "exec_command",
              arguments: JSON.stringify({ cmd: "git status", secret: "SECRET_ARGUMENT" }),
            },
          },
          { name: "terminal", arguments: JSON.stringify({ command: "pwd" }) },
        ],
      },
      { role: "tool", tool_name: "exec_command", content: "SECRET_TOOL_OUTPUT", timestamp: 1783962346.49 },
      { role: "tool", tool_name: "terminal", content: "Error: SECRET_FAILURE", timestamp: 1783962346.49 },
    ],
  };
  await writeFile(input, `${JSON.stringify(session)}\n`);

  const process = Bun.spawn(["python3", skeletonScript, "--output", output], {
    stdin: Bun.file(input),
    stdout: "pipe",
  });
  await new Response(process.stdout).text();
  expect(await process.exited).toBe(0);

  const skeleton = await Bun.file(output).text();
  expect(skeleton).toContain("[2026-07-13T17:05:46Z]");
  expect(skeleton).toContain("[user] Please inspect the skill behavior");
  expect(skeleton).toContain("[assistant] I will inspect the relevant source");
  expect(skeleton).toContain("[tool] exec_command git status");
  expect(skeleton).toContain("[tool] terminal pwd");
  expect(skeleton).not.toContain("-> ok");
  expect(skeleton).not.toContain("SECRET_IMAGE");
  expect(skeleton).not.toContain("SECRET_REASONING");
  expect(skeleton).not.toContain("SECRET_ARGUMENT");
  expect(skeleton).not.toContain("SECRET_TOOL_OUTPUT");
  expect(skeleton).not.toContain("SECRET_FAILURE");
});

test("Claude metadata carries exact event-level cwd", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "ce-meta-"));
  const input = path.join(dir, "session.jsonl");
  const cwd = "/Users/test/Library/Caches/user-tmp/review-wt-yne6i_u1";
  await writeFile(
    input,
    `${JSON.stringify({ type: "queue-operation" })}\n${JSON.stringify({
      type: "user",
      gitBranch: "feat/x",
      cwd,
      sessionId: "abc-123",
      timestamp: "2026-08-10T12:00:00.000Z",
    })}\n`,
  );

  const process = Bun.spawn(["python3", metadataScript, input], { stdout: "pipe" });
  const out = await new Response(process.stdout).text();
  expect(await process.exited).toBe(0);

  const [firstLine = ""] = out.trim().split("\n");
  const row = JSON.parse(firstLine);
  expect(row.platform).toBe("claude");
  // Hyphens in real path segments must survive; folder-name decoding mangles them.
  expect(row.cwd).toBe(cwd);
});
