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

