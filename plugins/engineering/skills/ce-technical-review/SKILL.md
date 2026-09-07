---
name: ce-technical-review
description: Run a rigorous multi-pass technical code review of recent changes. Use when the user asks for ce-technical-review, a technical review, a deep code review, or a strict pre-commit audit.
---

# Technical Review (alias)

This skill is an alias for `ce-review` in `deep` mode — the deep review now
owns the full multi-pass flow, including untracked-file scoping with secrets
exclusion and the optional thermo-nuclear maintainability pass.

Load `../ce-review/SKILL.md` and run it in `deep` mode, passing through any
arguments (`base:<ref>`, `plan:<path>`, PR/branch target) supplied here.
