# LOX runtime guidance

LOX contains five explicitly invoked skills. Repository instructions and the
user's accepted scope take precedence over these prompts.

- Load only the selected skill and its named LOX companions. Do not require
  another plugin, a test-writing skill, or a general-review wrapper.
- Keep review-only passes read-only. Auto review may fix grounded local
  findings when the user requested that loop.
- Identify the changed contract and owner before editing. Run the repository's
  relevant lint, type checks, tests, and real-surface proof before declaring the
  changed work ready. Do not weaken tests or checks to obtain a pass.
- Preserve unrelated user work. Commit, push, or update PR metadata only when
  the requested workflow authorizes that action.
- Propose accept/reject decisions for existing PR feedback before editing,
  replying, reacting, or resolving threads. Return remote feedback actions to
  the caller; this plugin does not run a bot-review or babysitting loop.
- Never merge, enable auto-merge, or use a merge queue. A clean local review
  does not establish remote CI or reviewer approval.
- Keep generated agent artifacts under `.ai/` unless the user names another
  destination. Update the existing owning plan instead of creating a duplicate.
- Use the active host's supported tools. When a proof surface is unavailable,
  report what remains unverified and why.
