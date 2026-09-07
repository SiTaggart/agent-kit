# Dev-server port detection

Port resolution runs via `scripts/resolve-port.sh`. This document explains the probe order, framework defaults, and historical divergences from older inline browser-test cascades.

This cascade runs **only when** `.claude/launch.json` is absent or has no `port` field for the resolved configuration. When `launch.json` specifies a port, use it verbatim and skip this cascade entirely.

## Priority order

1. **Explicit `--port` flag** -- if the caller passed `--port <n>`, use it directly.
2. **Framework config files** -- `next.config.*`, `vite.config.*`, `nuxt.config.*`, `astro.config.*` scanned with a conservative regex matching only numeric literal port values. Variable references (`process.env.PORT`, `getPort()`) are deliberately not matched.
3. **`Procfile.dev`** -- web line scanned for `-p <n>` / `--port <n>` / `-p=<n>` / `--port=<n>`.
4. **`docker-compose.yml`** -- line-anchored grep for `"<n>:<n>"` port mapping patterns. Not full YAML parsing.
5. **`package.json`** -- `dev`/`start` scripts scanned for `--port <n>` / `-p <n>` / `--port=<n>` / `-p=<n>`.
6. **`.env` files** -- checked in override order: `.env.local` -> `.env.development` -> `.env` (first hit wins). Parses `PORT=<n>` with quote stripping and comment truncation.
7. **Framework default lookup table** -- see table below.

## Framework defaults

| Framework | Default port |
|-----------|-------------|
| Next.js | 3000 |
| Nuxt | 3000 |
| Remix (classic) | 3000 |
| Vite | 5173 |
| SvelteKit | 5173 |
| Astro | 4321 |
| Procfile | 3000 |
| Unknown | 3000 |

## Sync-note block

`resolve-port.sh` intentionally differs from older inline browser-test cascades in three ways. Do not remove these behaviors without understanding the rationale.

**(a) Quote stripping on `.env` values.** `resolve-port.sh` strips surrounding `"` and `'` from `PORT=` values (so `PORT="3001"` resolves to `3001`). This is more robust for real-world `.env` files where quoting is common.

**(b) Comment stripping on `.env` values.** `resolve-port.sh` truncates at `#` after trimming whitespace (so `PORT=3001 # dev only` resolves to `3001`). Same rationale: real `.env` files frequently contain inline comments.

**(c) No `AGENTS.md`/`CLAUDE.md` grep.** `resolve-port.sh` does not scan instruction files for port references. Instruction files carry natural language that may mention ports in contexts unrelated to the dev server (documentation, examples, troubleshooting), producing false positives that are hard to debug. Framework config files and `.env` are more reliable sources of truth.
