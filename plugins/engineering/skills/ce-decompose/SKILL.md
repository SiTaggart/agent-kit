---
name: ce-decompose
description: "Split or rebuild oversized diffs into reviewable pieces. Use for 'too big to review', 'break this down', 'decompose this', or 'split this up'."
argument-hint: "[optional: branch/PR/path to the diff] [optional: threshold:<lines>]"
---

# Decompose An Oversized Change

A large diff is not a unit of work — it is a signal that the change was never split. This skill takes over **after** your normal loop has produced such a diff and carves it into pieces small enough that a human can review each one with real confidence.

You arrive here with code already written. Your ideate → brainstorm → plan → work loop ran up front; it produced a change that is correct (or close) but too big to review in one pass. This skill does not re-open the product contract or re-plan the feature — it operates on the diff that loop produced and turns it into reviewable increments.

`ce-plan` defines **HOW** to build from settled requirements. `ce-work` executes a scoped task. `ce-decompose` sits downstream of both: it is the back-half tool you reach for when the work is done but the diff is too large to ship as one reviewable chunk.

## When To Reach For This

- A change in your working tree, on a branch, or in an open PR is too big to review with confidence.
- The user says "this diff is too big", "break this down", "decompose this", "split this up", or "too big to review".

Do **not** reach for this at the front of the funnel. If requirements are unresolved, use `ce-brainstorm`; if the work isn't built yet, use `ce-plan` → `ce-work`. Decomposition operates on an existing diff — there must be code to carve.

## The Review-Ability Threshold

The core heuristic: **any change large enough that you cannot hold it in your head and review it line-by-line is too big.**

- The default tripwire is **~1500 changed lines**, taken from the originating heuristic. It is a signal, not a law.
- Lower it hard for high-risk surfaces — auth, payments, migrations, data mutations, external API contracts, security boundaries. A 400-line auth change can blow past review-ability long before a 1500-line styling sweep does.
- Raise it only when the change is genuinely mechanical and uniform (a wide rename, a generated-file regen) and a reviewer can verify the *transform* rather than every line.
- A `threshold:<lines>` argument overrides the default for this run.

The number is a proxy. Every step returns to the real question: *can a careful human review this piece and be confident it is correct?* If no, it is still too big.

This loop is **human-in-the-loop by default**: confirm the carve strategy and the seams before executing (ask via the platform's blocking question tool — see `../ce-conventions/SKILL.md`). Do not run the full loop autonomously unless the user explicitly asks. Launch independent pieces as concurrent subagents in one batch; dependent pieces run in sequence.

## The Loop

### Step 1: Locate And Measure The Diff

Pin down exactly what change is being decomposed, then size it.

- **Working tree** vs the base commit: `git diff <base>...HEAD` plus `git diff HEAD` for uncommitted work.
- **A branch**: `git diff <merge-base>..<branch>`.
- **A PR**: the PR's diff against its base.

Size it. Measure the **whole** surface you're decomposing — for a working tree that means committed *and* uncommitted *and* untracked work, or the in-progress sprawl will read as under-threshold and skip decomposition:

```bash
# Working tree (committed + uncommitted tracked changes vs base):
git diff <base> --numstat | awk '{a+=$1; d+=$2} END {print a+d " tracked lines"}'
# ...plus untracked new files, which git diff never shows:
git ls-files --others --exclude-standard -z | xargs -0r wc -l | tail -1

# Branch or PR (the committed range is the whole change). Use the requested
# head ref — the branch name or PR head SHA — not HEAD, which measures whatever
# happens to be checked out:
git diff <base>...<head> --numstat | awk '{a+=$1; d+=$2} END {print a+d " changed lines"}'
```

Note the three-dot `<base>...HEAD` form covers only committed changes; use `git diff <base>` (no dots) when uncommitted working-tree edits are part of the change. If the total is **under threshold** (after the risk adjustments above), the change is already reviewable — hand it to normal review via `ce-quality-gate` → `ce-review` and stop. There is nothing to decompose. Otherwise continue.

### Step 2: Assess — Split Or Rebuild?

Decide what to do with the code that's already written. This gate routes the rest of the loop.

Read enough of the diff to judge its quality, then choose:

- **Split & keep** — the code is sound. It is coherent, follows conventions, has (or can quickly get) passing tests, and is large only because the feature is large. This is the common case when the diff came from a deliberate plan/work loop. Carve the *existing code* into an ordered stack of smaller commits/PRs (Step 3 → Step 4a). Default here when the diff came from a real plan/work loop — preserve work that's already correct.
- **Reference & rebuild** — the code is tangled. Concerns are interleaved with no clean seams, it drifts from conventions, or splitting it would be more work than rebuilding. Treat the diff as a throwaway *reference*: learn the shape, then discard it and rebuild each piece cleanly with fresh agents (Step 3 → Step 4b).

A single diff can be mixed — most of it sound and one region tangled. Split the sound majority and flag the tangled region for rebuild. Confirm the strategy with the user before executing (see Interaction Method).

### Step 3: Find The Seams

Both paths need the same thing: the set of atomic, incremental, reviewable units the change naturally breaks into. Each unit should be:

- **Atomic** — one meaningful change, landable as a single reviewable commit/PR.
- **Incremental** — ordered so each unit leaves the system working; later units build on earlier ones.
- **Reviewable** — comfortably beneath the threshold on its own.

Find the seams **twice, independently, then reconcile:**

1. Ask a fresh agent to break the change into atomic, incremental, reviewable units.
2. Do the same yourself, from the problem's natural seams — components, ownership boundaries, data-flow stages, contract surfaces.
3. Compare. Where the two agree, you have found a real seam. Where they diverge, you have found a judgment call worth making deliberately.

**Massage the units into the right *general* shape.** Agents will very often make units too specific to the shape the diff happened to take — pinned to incidental file names, the diff's accidental ordering, or one-off helpers. Re-derive units from the change's durable boundaries, not its incidental layout. The unit list should read like it describes the *feature*, not the diff.

Capture the result as an ordered list of units with one-line goals and explicit dependencies (cite units by name). Hand off to `ce-plan` when the set warrants a durable plan — its implementation-unit structure (stable U-IDs, per-unit files, test scenarios, dependency ordering) is exactly this artifact.

### Step 4a: Split Into A Reviewable Stack (keep path)

Carve the existing code into the units from Step 3, preserving the work. The output is an ordered stack of commits or PRs, each self-contained and each leaving the system green.

- **Map changes to units.** Assign each changed file (or region) to exactly one unit. Prefer **file-level grouping** — it is clean and matches the house commit convention. When a single file genuinely mixes concerns across units, split that file's changes by hunk; if the file *is* the seam, keep it as one unit.
- **Order by dependency.** A unit that others build on lands first. Each commit/PR in the stack must build and pass its own tests on its own — no unit may depend on code that lands later.
- **Mechanics.** Build the stack by re-applying the existing changes in grouped commits, or as a branch/PR per unit. To group commits, `git reset --mixed <base>` first — a `--soft` reset leaves the whole diff staged in the index, so the first `git-commit` would sweep in every sibling unit's files and collapse the stack; `--mixed` keeps the changes in the working tree but unstages them, so each unit stages cleanly. For **file-level** units, use `git-commit` once each unit's files are grouped. For **partial-file (hunk-split)** units, do **not** hand off to `git-commit` — it stages whole files by name and would re-stage the sibling units' hunks in the same file, collapsing the split back together. Instead stage the hunks directly (`git add -p`) and commit in place, then move to the next unit.
- **Publish PR stacks with an installed `gh-stack` companion when available.** It owns non-interactive branch, submit, rebase, and verification mechanics. If `gh stack` is unavailable or the repository is not enabled for GitHub Stacked PRs, fall back to creating each PR manually with its base set to the previous unit's branch (`gh pr create --base <prev-unit-branch>`). A later PR based on the repo default re-includes earlier units and is not independently reviewable.
- **Recurse.** If a unit's own diff is still over threshold, it was not atomic. Run Step 3 on that unit and split again. Decomposition is recursive until every piece is reviewable.

### Step 4b: Reference & Rebuild (discard path)

When the existing code isn't worth preserving, rebuild each unit cleanly.

- **Snapshot before discarding.** The discarded diff is your rebuild reference, so never destroy the only copy. Before any reset or close, capture a recoverable snapshot **that includes untracked files** — a WIP commit on a throwaway branch (`git add -A && git commit`) or `git stash -u`. Plain `git stash` and `git diff > patch` both omit untracked paths, so a bare patch must be paired with an archive of the untracked files. Confirm with the user before the destructive step, especially when the change is an uncommitted working tree.
- **Then discard the working copy.** With the snapshot safe, reset the branch / close the throwaway so the clean rebuild starts from base. Keep only what you learned about the shape in Step 3; carrying the tangled code forward re-imports the sprawl you set out to remove.
- **Dispatch fresh agents** on the units, each starting clean from the unit's goal and the surrounding real code — not from the discarded diff.
- **Parallelize by the dependency graph.** Units with no dependency between them launch concurrently in one batch; dependent units run in sequence. When parallel agents would edit overlapping files, isolate each in its own worktree (`git-worktree` / `isolation: "worktree"`).
- **Recurse.** Each rebuilt unit is itself subject to the threshold — if one comes back over the line, decompose it again.

### Step 5: Review Incrementally

Each unit — whether split off or rebuilt — goes through normal review as it lands: `ce-quality-gate` on touched files, then `ce-review` for substantial or risky units. Review the stack piece by piece; you do not wait for the whole set.

The loop terminates when every remaining piece is something a careful human can review with confidence. That is the exit condition — not a fully-specified plan, and not a green test suite alone.

## Output

Keep the user oriented with a compact status:

- The carve strategy chosen at Step 2 (split / rebuild / mixed) and why.
- The decomposition — the ordered list of units, their dependencies, and which are reviewable as-is.
- The stack or dispatch state — which commits/PRs exist or which agents are running, in parallel vs sequence, and where each piece stands.
- Any unit that came back over threshold and is being decomposed recursively.
- The exit signal: the point at which every remaining piece is small enough to review with confidence.

## Next Step

Recommend the next step for the current carve state and fire it (see `../ce-conventions/SKILL.md` for menu conventions): `ce-plan` when the unit set warrants a durable plan, `ce-work` for an incomplete or rebuild-path unit, `ce-quality-gate` → `ce-review` per landed unit, and `git-commit` / an installed `gh-stack` companion / `git-commit-push-pr` to land reviewed units (stacked units use the companion; only independent PRs ship via `git-commit-push-pr`).
