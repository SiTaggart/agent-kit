# Targeted Mode

Read this reference when Mode Detection (in SKILL.md) routes to **Targeted Mode** — a specific comment or thread URL was provided. Targeted mode addresses only that thread.

Use the platform's native delegation tool and keep the user's permission
settings. If delegation is unavailable, apply the resolver persona inline.

## 1. Extract Thread Context

Parse the URL to extract OWNER, REPO, PR number, and comment REST ID:
```
https://github.com/OWNER/REPO/pull/NUMBER#discussion_rCOMMENT_ID
```

**Step 1** -- Get comment details and GraphQL node ID via REST (cheap, single comment):
```bash
gh api repos/OWNER/REPO/pulls/comments/COMMENT_ID \
  --jq '{node_id, path, line, body}'
```

**Step 2** -- Map comment to its thread ID. Use [scripts/get-thread-for-comment](../scripts/get-thread-for-comment):
```bash
bash scripts/get-thread-for-comment PR_NUMBER COMMENT_NODE_ID [OWNER/REPO]
```

This fetches thread IDs and their first comment IDs (minimal fields, no bodies) and returns the matching thread with full comment details.

## 2. Fix, Reply, Resolve

Spawn a single fresh resolver sub-agent for the thread, with a prompt telling it to read the `pr-comment-resolver.md` persona (in this skill's `references/` directory — expand to an absolute path from the installed skill directory) and follow it. Pass the same fields full mode does, including `isOutdated` and the location fields (`line`, `originalLine`, `startLine`, `originalStartLine`) -- targeted threads can be outdated too and need the same relocation handling. Then follow the same validate -> commit -> push -> reply -> resolve flow as Full Mode steps 5-7 (in `references/full-mode.md`).
