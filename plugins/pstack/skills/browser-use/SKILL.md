---
name: browser-use
description: Build or adapt a local browser/CDP harness to drive and inspect a web, IDE, or Electron UI. Use for local UI verification, screenshots, accessibility snapshots, perf profiles, visual diffs, or reproducing UI bugs.
---

Read [Codex runtime guidance](../../CODEX.md) before this workflow.


# Browser Use

Use Codex's native browser-use capability to verify UI behavior with evidence. Read the current browser tool instructions first. On hosts exposing `mcp__cua_repl.js`, use the initialized CUA browser API and its returned documentation. Existing repo test harnesses remain useful for repeatable tests and profiling. This skill is the Codex replacement for upstream `control-ui`; it does not install a third-party browser service.

## What It Is Used For

- Reproducing UI bugs that depend on real browser focus, keyboard input, scrolling, resizing, or rendering.
- Verifying visual or accessibility changes with screenshots and snapshots.
- Checking local web, IDE, or Electron behavior before shipping.
- Capturing console logs, network logs, CPU profiles, traces, or heap snapshots.
- Creating before/after evidence for `verify-this`.

## Setup Pattern

1. Start the app locally using the repo's documented dev command.
2. Discover existing local harnesses: Playwright tests, Cypress specs, Storybook, browser scripts, Electron launch scripts, or snapshot tools.
3. For a web app, connect to the local URL with the existing browser tooling.
4. For Electron/Chromium, enable a remote debugging port when supported.
5. Select the correct page by stable app markers, not by tab order alone.
6. Prefer accessibility roles, labels, and stable `data-*` selectors over coordinates.

## Native Codex Browser Harness

Discover the available native browser tool and read its current API instructions.
For `mcp__cua_repl.js`, the first call must contain exactly one entry-point API
call. With a known URL and no user-selected browser:

```javascript
let browser = await cua.getBrowser({ url: "http://127.0.0.1:<port>" });
```

For an explicitly requested in-app browser:

```javascript
let tab = await cua.createBrowserTab("iab", "http://127.0.0.1:<port>", { visible: true });
```

Read the returned documentation and initial UI state before the next call. Use
only documented APIs. Match any user-mentioned tab by its observed title, URL,
and provider tab ID; do not open a substitute tab. Read the current state, act on
an observed control, and capture the resulting state. Emit screenshots through
the tool's documented image API. Save proof only through supported output APIs.

The host owns the browser runtime and its credentials. Do not copy its SDK into
this plugin, install another browser package to bypass missing capabilities, or
silently replace the requested browser. If the native browser tool is absent,
report that prerequisite before attempting live verification.

## Electron and Native Desktop

Use the native browser API only when it exposes the target Electron surface.
Otherwise use Codex's available native computer-use tool and inspect its API and
current application state first. A repo's existing Electron/CDP test harness can
supply repeatable profiling or test coverage where the host permits it. Preserve
the same launch, selection, interaction, evidence, and cleanup loop. If neither
surface can reach the app, report the missing access; web proof does not establish
desktop behavior.

## Interaction Loop

1. Capture a page snapshot or screenshot before acting.
2. Choose a target from the latest page structure.
3. Perform exactly one structural action: click, type, keypress, drag, scroll, navigate, or resize.
4. Capture a fresh snapshot/screenshot.
5. Verify the expected state change.
6. Save artifacts for before/after comparisons when the user asked for proof.

## CDP Capabilities

Use these only when the native tool or an existing repo harness exposes them; do not guess unsupported browser API calls:

- Performance: CPU profiles, traces, paint flashing, FPS meter, layout shift inspection.
- Memory: heap snapshots and forced GC for leak investigations.
- Network: request blocking, throttling, cache disablement, request/response logs.
- Rendering: viewport changes, color scheme emulation, reduced motion, accessibility checks.
- Debugging: console streaming, exception capture, DOM snapshots.

## Page Selection

When multiple app windows/tabs share a debug port:

- Prefer a positive marker for the surface under test, such as an app root selector.
- Use a negative marker to avoid the wrong surface when necessary.
- If no page matches, list available page titles and URLs instead of guessing.

## Guardrails

- Do not rely on stale element references after navigation or structural changes.
- Avoid coordinate clicks unless a fresh screenshot was captured immediately before the click.
- Keep test data local and disposable.
- Do not store screenshots or heap snapshots from privacy-sensitive workspaces unless the user explicitly agrees.
- Do not hard-code selectors, ports, or script paths from another repository. Discover the current repo's local app markers.
- Clean up dev servers, debug sessions, and temp profiles when done.
