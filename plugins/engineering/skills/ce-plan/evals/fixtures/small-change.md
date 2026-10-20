# Repository fixture: report export

This is a frozen synthetic repository. These excerpts are its relevant source.

`src/export-report.ts`:

```ts
export async function exportReport(report: Report, download: Download) {
  const rows = visibleRows(report);
  const csv = serializeCsv(rows);
  await download(csv, report.filename);
}
```

`src/report-actions.tsx`:

```tsx
async function handleExport() {
  setExporting(true);
  try {
    await exportReport(report, download);
    toast.success("Report exported");
  } catch {
    toast.error("Something went wrong");
  } finally {
    setExporting(false);
  }
}
```

The toast component accepts plain text. Existing export tests cover visible-row
selection, CSV escaping, and filename preservation. The toolbar already disables
Export while `exporting` is true. There is no automatic retry. No API or stored
configuration is changed by either function.

User request: Plan a clearer failed-download message: “Report export failed.
Try again.” Keep current export behavior. Planning only; save the plan. This
fixture supplies the source context; do not change the implementation.
