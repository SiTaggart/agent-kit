# Plan Handoff

This file contains post-plan-writing instructions: document review, post-generation options, and issue creation. Load it after the plan file has been written and the confidence check (5.3.1-5.3.7) is complete.

## 5.3.8 Document Review

**Format gate.** This phase runs only when `OUTPUT_FORMAT=md` (resolved in SKILL.md Phase 0.0). `document-review` edits markdown directly for trivial-safe fixes and optional interactive changes. Running those edits against an HTML artifact would produce malformed output. Until document-review gains HTML-aware editing, HTML plans skip this phase entirely.

**When `OUTPUT_FORMAT=html`:** Skip the document-review invocation. Capture a synthetic "skipped" envelope so the menu summary line in 5.4 can name the limitation explicitly:
- `fixes_applied = 0`
- `proposed_fixes_count = 0`, `decisions_count = 0`, `fyi_count = 0`
- `skipped_reason = "output_format_html"`

Then proceed directly to Final Checks (5.3.9). Do not block on this — the confidence check at 5.3 already strengthened the plan. Free-form requests for review in the post-generation menu will be declined for HTML runs with a prompt to switch to `output:md` (see 5.4); review is not available for HTML plans until document-review gains HTML-aware editing.

**When `OUTPUT_FORMAT=md`:** Run the `document-review` skill with `mode:headless` on the plan file. Pass `mode:headless <plan-path>` as the skill arguments. When this step is reached for a markdown plan, it is mandatory — do not skip it because the confidence check already ran. The two tools catch different classes of issues.

Headless is the default at this phase because most users want to start work after planning, not adjudicate every reviewer concern up front. Headless applies trivial-safe fixes silently and returns structured findings text — no per-finding routing, no blocking prompts. The post-generation menu (see 5.4) offers `Run deeper doc review` as a first-class option so users can opt into the interactive review when they want it.

The confidence check and document-review are complementary:
- The confidence check strengthens rationale, sequencing, risk treatment, and grounding
- Document-review checks coherence, feasibility, scope alignment, and reader-specific issues

Capture the headless envelope so it can drive the contextual summary above the post-generation menu:
- The number of fixes auto-applied
- The count of remaining findings, broken out by user-facing bucket (proposed fixes, decisions, FYI observations)
- The severity breakdown of decisions and proposed fixes (specifically the P0/P1 count, since those benefit from explicit user attention)

When document-review returns "Review complete", proceed to Final Checks.

**Pipeline mode:** pipeline runs force `OUTPUT_FORMAT=md` at Phase 0.0, so the HTML skip path never fires; they always invoke `document-review` with `mode:headless`, address any P0/P1 findings, and return control to the caller without further routing.

## 5.3.9 Final Checks and Cleanup

Before proceeding to post-generation options:
- Confirm the plan is stronger in specific ways, not merely longer
- Confirm the planning boundary is intact
- Confirm origin decisions were preserved when an origin document exists

If artifact-backed mode was used:
- Clean up the temporary scratch directory after the plan is safely updated
- If cleanup is not practical on the current platform, note where the artifacts were left

**Format-specific composition.** When `OUTPUT_FORMAT=html` (resolved in SKILL.md Phase 0.0), the plan is written as a single self-contained `.html` file — there is no markdown sibling. Read `../ce-conventions/references/html-rendering.md` for composition rules: invariants, precedence stack, format principles, agent-consumability rules, and the post-compose audit. The `.html` file is the artifact downstream consumers (ce-work, human readers) read. `document-review` is not a current HTML consumer — its editing mechanics are markdown-only today, and HTML plans skip the 5.3.8 doc-review pass until that gap closes.

When `OUTPUT_FORMAT=md`, write the markdown directly per `../ce-conventions/references/markdown-rendering.md`. No HTML is composed.

After all mutations in this run have settled (initial write, deepening synthesis, document-review trivial-safe fixes when `OUTPUT_FORMAT=md`), the artifact at its single path reflects the final state. HTML runs skip the document-review autofix step (see 5.3.8 format gate).

## 5.4 Post-Generation Options

**Pipeline mode:** If invoked from an automated workflow or any `disable-model-invocation` context, skip the interactive menu below and return control to the caller immediately. The plan file has already been written, the confidence check has already run, and document-review has already run — the caller determines the next step.

**Path format:** Use absolute paths for chat-output file references — relative paths are not auto-linked as clickable in most terminals.

**Summary line above the menu (always):** Print a single concise line summarizing the headless review state — e.g., `Doc review applied 3 fixes. 2 decisions, 1 proposed fix, 4 FYI observations remain (1 at P1).` When no fixes were applied and no findings remain, print `Doc review clean — no fixes needed.` When the envelope carries `skipped_reason: output_format_html` (HTML run, per Phase 5.3.8 format gate), print `Doc review skipped — document-review is markdown-only today; the HTML plan was not reviewed.` so the user knows the autofix pass did not run on this artifact. This line establishes what the autofix pass did (or didn't) so the user has the context to choose between the menu options below.

**Question:** "Plan ready at `<absolute path to plan>`. What would you like to do next?"

**Options:**
1. **Start `/ce-work`** (recommended) - Begin implementing this plan in the current session
2. **Run deeper doc review** - Review the remaining findings interactively
3. **Create Issue** - Create a tracked issue from this plan in your configured issue tracker (GitHub or Linear)
4. **Open in browser** - Open the HTML plan file locally for review and sharing. **Render only when `OUTPUT_FORMAT=html`.**
5. **Done for now** - Pause; the plan file is saved and can be resumed later

**Option visibility.** Show `Run deeper doc review` only when the headless envelope reports `proposed_fixes_count + decisions_count > 0`. Drop it for FYI-only state and when the envelope carries `skipped_reason: output_format_html`. Show `Open in browser` only when `OUTPUT_FORMAT=html`. Renumber the visible options so users see a clean sequence. The summary line above the menu still names FYI counts when present (`Doc review applied 3 fixes. 2 FYI observations remain.`) so the user sees what was found, even though there is no menu action attached to FYI-only output.

**Menu rendering:** Use the platform's blocking question tool where available. If the current visible option count exceeds a platform cap, or if the blocking tool is unavailable/errors, render a numbered list in chat with the hint "Pick a number or describe what you want." Never silently skip the question.

Based on selection:
- **Start `/ce-work`** -> Invoke the `ce-work` skill via the platform's skill-invocation primitive (`Skill` in Claude Code, `Skill` in Codex, the equivalent on Gemini/Pi), passing the plan path as the skill argument. Do not merely tell the user to type `/ce-work` — fire the invocation now so the plan executes in this session.
- **Run deeper doc review** -> Re-invoke the `document-review` skill on the plan path **without** `mode:headless` so the interactive routing question fires. The headless pass already applied trivial-safe fixes and recorded its findings in the session, so the interactive pass should focus on remaining proposed fixes and decisions. After it returns, re-render this menu with refreshed counts so the user can pick what to do next.
- **Create Issue** -> Follow the Issue Creation section below
- **Open in browser** -> Display the absolute path to the `.html` plan file so the user can open it locally. Where the platform exposes a browser-opening primitive (e.g., `open` on macOS, `xdg-open` on Linux, `start` on Windows), the agent may invoke it directly; otherwise print the absolute path and let the user open it. After the path is displayed (or the browser is opened), return to the post-generation options so the user can pick a follow-up action.
- **Done for now** -> Display a brief confirmation that the plan file is saved and end the turn. Do not start follow-up work without an explicit further user prompt.
- **Free-form prompts that target the findings** (e.g., the user types "review", "walk through", "deep review" instead of picking a numbered option) -> route as if they had picked `Run deeper doc review`. Do not loop back to the menu without firing the deeper review. **Exception:** when the envelope carries `skipped_reason: output_format_html`, do not fire document-review — instead, reply once with `document-review is markdown-only today; the HTML plan can't be reviewed without HTML-aware mutation support. Switch to /ce-plan output:md to regenerate as markdown if you want a review pass.` and loop back to the menu.
- **Other free-form input** -> Accept revisions to the plan and loop back to options.

## Issue Creation

When the user selects "Create Issue", detect their project tracker:

1. Read `AGENTS.md` (or `CLAUDE.md` for compatibility) at the repo root and look for `project_tracker: github` or `project_tracker: linear`.
2. If `project_tracker: github`:

   ```bash
   gh issue create --title "<type>: <title>" --body-file <plan_path>
   ```

3. If `project_tracker: linear`:

   ```bash
   linear issue create --title "<title>" --description "$(cat <plan_path>)"
   ```

4. If no tracker is configured, ask the user which tracker they use with the platform's blocking question tool (see `../ce-conventions/SKILL.md`). Never silently skip. Options: `GitHub`, `Linear`, `Skip`. Then:
   - Proceed with the chosen tracker's command above
   - Offer to persist the choice by adding `project_tracker: <value>` to `AGENTS.md`, where `<value>` is the lowercase tracker key (`github` or `linear`) — not the display label — so future runs match the detector in step 1 and skip this prompt
   - If `Skip`, return to the options without creating an issue

5. If the detected tracker's CLI is not installed or not authenticated, surface a clear error (e.g., "`gh` CLI not found — install it or create the issue manually") and return to the options.

After issue creation:
- Display the issue URL
- Ask whether to proceed to `/ce-work` using the platform's blocking question tool
