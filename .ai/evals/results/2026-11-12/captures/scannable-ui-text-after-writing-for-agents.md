# Scannable UI text captures after Writing for Agents

One fresh session per unchanged case. Cases 1–4 received the revised skill and
only their request. Case 5 received the revised description and its request.
The complete response text is below, with trailing Markdown spaces removed.

## Case 1: Session titles with unknown state

A → Review billing alert setup
B → Review billing retries
C → CSV invoice export

Review tasks use action + object; C remains a conventional label without inventing an action or status. All titles are under 30 characters. Visual fit and actual truncation remain unverified because no browser is available.

## Case 2: Mixed status and overlapping prefixes

A → EU invoice export: failed
Secondary: Confirmed timeout.

B → US invoice export: paused
Secondary: Paused by owner. No error.

C → APAC invoice export: unknown
Secondary: Telemetry is missing.

Pattern: region + object + status. All labels are within 36 characters; the always-visible secondary lines preserve cause, owner action, and uncertainty. Text reviewed together; visual fit remains unverified.

## Case 3: Feedback with uneven evidence

### A. Search
12 of 20 respondents like the speed. Of those 12, 3 also report stale results.

### B. Export
4 respondents report a crash only when exporting more than 10,000 rows. Reproduction is pending.

### C. Sharing
2 respondents request expiring links. No reason or example was recorded.

Note: Feature-first titles support comparison, while each card preserves its evidence and limitations. All fit the two-sentence limit; visual fit at the actual card width remains unverified.

## Case 4: Notification tokens and negation

```json
{
  "export_paused": "Paused: export for {projectName}. Paused by {actorName}.",
  "export_failed": "Failed: export for {projectName}. No files were saved.",
  "export_done": "Completed: export for {projectName}. Saved {fileCount} files."
}
```

Status-first openings make the notifications easy to compare. Each stands alone and preserves the original keys, tokens, actor, and outcomes. Visual fit is unverified because the UI is unavailable.

## Case 5: Leave general prose outside scope

The client connects to the server and retries after a timeout.
