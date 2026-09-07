# Discoverability Check

Shared by `ce-compound` and `ce-compound-refresh`. Checks whether the
project's instruction files would lead an agent to discover and search
`.ai/solutions/` before starting work in a documented area. Runs every time —
the knowledge store only compounds value when agents can find it. The calling
skill's mode rules govern the interaction shape (consent, silent apply, or
recommend-only) and any commit handling.

1. Identify which root-level instruction files exist (AGENTS.md, CLAUDE.md, or
   both). Read the file(s) and determine which holds the substantive content —
   one may be a shim that `@`-includes the other. The substantive file is the
   assessment and edit target; ignore shims. If neither exists, skip this
   check entirely.
2. Assess whether an agent reading the instruction files would learn three
   things:
   - That a searchable knowledge store of documented solutions exists
   - Enough about its structure to search effectively (category organization,
     YAML frontmatter fields like `module`, `tags`, `problem_type`)
   - When to search it (before implementing features, debugging issues, or
     making decisions in documented areas — learnings may cover bugs, best
     practices, workflow patterns, or other institutional knowledge)

   This is a semantic assessment, not a string match. The information could
   live anywhere in the file and never use the exact path `.ai/solutions/`.
   If an agent would reasonably discover and use the knowledge store after
   reading the file, the check passes.
3. If the spirit is already met, no action needed.
4. If not:
   a. Find where a mention fits naturally. A line added to an existing
      section (architecture tree, directory listing, docs or conventions
      block) is almost always better than a new headed section; add a section
      only as a last resort.
   b. Draft the smallest addition that communicates the three things, matching
      the file's style and density. Describe the knowledge store itself, not
      the plugin. Keep the tone informational, not imperative — "relevant when
      implementing or debugging in documented areas," not "always search
      before implementing" (imperatives cause redundant reads when a workflow
      already includes a search step).

      Calibration examples (adapt, don't template):

      Line in an existing directory listing:
      ```
      .ai/solutions/  # documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (module, tags, problem_type)
      ```

      Small headed section when nothing fits:
      ```
      ## Documented Solutions

      `.ai/solutions/` — documented solutions to past problems (bugs, best practices, workflow patterns), organized by category with YAML frontmatter (`module`, `tags`, `problem_type`). Relevant when implementing or debugging in documented areas.
      ```
   c. Before editing an instruction file, get consent with the platform's
      blocking question tool (fall back to a question in chat when the tool is unavailable), explaining
      that agents without the plugin won't know to check `.ai/solutions/`
      unless the instruction file surfaces it — except where the calling
      skill's mode rules say to apply silently or to only emit a
      recommendation.
5. If `CONCEPTS.md` exists at repo root, run a parallel check for it: same
   target file, same edit-placement judgment, same consent shape. Calibration
   line:
   ```
   CONCEPTS.md  # shared domain vocabulary (entities, named processes, status concepts) — relevant when orienting to the codebase or discussing domain concepts
   ```
   Skip this step entirely if `CONCEPTS.md` does not exist — never nag for an
   artifact the project has not adopted.
