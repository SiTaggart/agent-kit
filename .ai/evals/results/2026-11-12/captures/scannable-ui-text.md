# Scannable UI text smoke captures

One fresh session per case. Cases 1–4 received the skill and their request
without the rubric. Case 5 received only skill metadata and its request.
No external services, UI rendering, or repository edits were needed.
The complete response text is below, with trailing Markdown spaces removed.

## Case 1: Session titles with unknown state

- A: Inspect billing alert setup
- B: Review billing retries
- C: Export invoices as CSV

All are under 30 characters. Visual fit and truncation are unverified because no browser or sidebar preview is available.

## Case 2: Mixed status and overlapping prefixes

- A: **EU invoice export: failed**
  Secondary: Confirmed timeout.
- B: **US invoice export: paused**
  Secondary: Paused by owner. No error.
- C: **APAC invoice export: status unknown**
  Secondary: Telemetry is missing.

All labels are within 36 characters. Region comes first, then status. Visual fit is unverified; text review only.

## Case 3: Feedback with uneven evidence

**Search**
12 of 20 respondents like the speed. Of those 12, 3 also report stale results.

**Export**
4 respondents report a crash only when exporting more than 10,000 rows. Reproduction is pending.

**Sharing**
2 respondents request expiring links. No reason or example was recorded.

Visual fit is unverified because the actual card width and UI were not provided.

## Case 4: Notification tokens and negation

{
  "export_paused": "Export paused for {projectName} by {actorName}.",
  "export_failed": "Export failed for {projectName}. No files were saved.",
  "export_done": "Export completed for {projectName}. Saved {fileCount} files."
}

Status appears early in each standalone notification. All keys, tokens, and consequential details are preserved. Visual fit is unverified.

## Case 5: Leave general prose outside scope

The client connects to the server and retries after a timeout.
