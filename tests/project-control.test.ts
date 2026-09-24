import { expect, test } from "bun:test";
import path from "node:path";
import { readText } from "./helpers";

const projectControlDir = path.resolve(import.meta.dir, "../plugins/engineering/skills/project-control");
const taskLeadDir = path.resolve(import.meta.dir, "../plugins/engineering/skills/task-lead");

test("project control launches the reusable task lead workflow", async () => {
  const [skill, worktreeContract, taskLead] = await Promise.all([
    readText(path.join(projectControlDir, "SKILL.md")),
    readText(path.join(projectControlDir, "references/worktree-task-contract.md")),
    readText(path.join(taskLeadDir, "SKILL.md")),
  ]);

  expect(skill).toContain("Require the root task to use\n`task-lead`");
  expect(worktreeContract).toContain("use $task-lead");
  expect(taskLead).toContain("It does not need a\n`project-control` parent or a Linear issue.");
  for (const role of ["scout", "builder", "reviewer"]) {
    expect(taskLead).toContain(`\`${role}\``);
  }
  expect(skill).toContain("Open every pull request as a draft.");
  expect(skill).toContain("Never mark the pull request ready for review.");
  expect(skill).toContain("Stop at `draft-ready`.");
  expect(taskLead).toContain("After proof and review, commit, push, and open or update the draft pull request.");
  expect(taskLead).toContain("Never mark it ready for review, merge it, enable auto-merge");
  expect(worktreeContract).toContain("create a draft pull request");
  expect(`${skill}\n${worktreeContract}\n${taskLead}`).not.toContain("waiting-for-merge");
});
