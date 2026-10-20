---
title: "fix: Preserve export retry"
type: fix
status: active
date: 2026-10-16
origin: .ai/brainstorms/export-requirements.md
---

# fix: Preserve export retry

## Requirements

- R4. After a failed export, the user can retry without reloading the page.

## Implementation Units

### U3. Restore retry after failure

Keep the current CSV contents and filename behavior. A proposed RetryController
class may own the state. Its feasibility has not been checked.

## Review history

A reviewer suggested a rollout board and an approval ladder for the copy change.
These suggestions were never accepted.

## Repeated context

A failed export must allow retry without a page reload. CSV contents and filename
behavior stay the same. The RetryController class is a suggestion.

<!-- External ticket links refer to R4 and U3. -->
