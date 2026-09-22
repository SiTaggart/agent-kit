import { expect, test } from "bun:test";
import path from "node:path";
import { readText } from "./helpers";

const projectControlDir = path.resolve(import.meta.dir, "../plugins/engineering/skills/project-control");

test("project control only publishes draft pull requests", async () => {
  const [skill, worktreeContract] = await Promise.all([
    readText(path.join(projectControlDir, "SKILL.md")),
    readText(path.join(projectControlDir, "references/worktree-task-contract.md")),
  ]);

  expect(skill).toContain("Open every pull request as a draft.");
  expect(skill).toContain("Never mark the pull request ready for review.");
  expect(skill).toContain("Stop at `draft-ready`.");
  expect(worktreeContract).toMatch(/open the pull request as a draft only\s+after the work is proven/);
  expect(worktreeContract).toContain("Explicitly require it to create a draft pull request.");
  expect(worktreeContract).toContain("Never mark it ready for review");
  expect(`${skill}\n${worktreeContract}`).not.toContain("waiting-for-merge");
  expect(`${skill}\n${worktreeContract}`).not.toContain("ready pull request");
});
