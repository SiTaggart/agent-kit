# QMD Collection Catalog

## Purpose

This reference maps the QMD collections available on this machine to their content and intended use. The inventory and default behavior are environment-specific and may change independently of the installed QMD CLI.

When live collection state differs from this catalog, use the live inventory and update this reference afterward.

## Default Collections

These collections are included in unfiltered QMD searches unless live configuration says otherwise.

| Collection | Source | Purpose | Use when |
|---|---|---|---|
| `docs` | OneDrive work documentation | Durable work docs, plans, decisions, and project material | The task may have formal project or organizational context |
| `ai` | Spade `.ai` directory | Local AI scratch material and prior-agent plans | Recovering historical reasoning; never treat as current authority |
| `termpower-wiki` | Generated Termpower wiki | Termpower architecture, concepts, repo context, and curated links | Understanding Termpower intent, concepts, or subsystem relationships |
| `spade-wiki` | Generated Spade wiki | Spade architecture, concepts, project context, and curated links | Understanding Spade intent, architecture, or subsystem relationships |
| `spade-docs-content` | Spade `docs/content` | Documentation-site source for Spade, Termpower, CoolApp, and related systems | Looking for current user or developer documentation |
| `spade-config` | Spade repository root | Repository instructions and configuration | Looking for repository rules, dependencies, lint, type-check, workspace, or test configuration |
| `spade-python-core` | `src/spade` | Main Spade Python implementation | Backend, data, feed, service, simulation, server, orchestration, mapping, and trading work |
| `spade-local-libs` | Spade `lib` directory | Local path dependency code | Working with `chsql`, `kirchhoff`, `requestslib`, `ante`, `relay`, `amp`, `nwpp`, or related libraries |
| `spade-apps-scripts` | Spade `apps`, `scripts`, and Python `infra` | App entrypoints, operational scripts, and Python infrastructure | Finding app glue, commands, operational helpers, or deployment scripts |
| `termpower-ui` | `src/termpower/src` | Main React and TypeScript implementation | Working on Termpower components, views, state, routes, API clients, or frontend utilities |

## Specialized Opt-In Collections

These collections are excluded from unfiltered searches and must be selected explicitly when their evidence type is relevant.

| Collection | Source | Purpose | Use when |
|---|---|---|---|
| `spade-data-descriptors` | JSON and YAML under `src/spade` | Feed descriptors, integration specs, mappings, and static metadata | Working on ingestion formats, market specs, mappings, or descriptor-driven code |
| `spade-sql` | SQL under `src/spade` | ClickHouse and Postgres schemas, migrations, and query assets | Working on database models, table definitions, SQL queries, or schema evolution |
| `spade-tests` | Spade `tests` | Python tests and expected behavior | Looking for examples, fixtures, regression coverage, or behavioral contracts |
| `termpower-tooling` | Termpower scripts, lint rules, e2e, tests, and mapgen | Frontend tooling and support code | Working on lint automation, build scripts, end-to-end tests, map generation, or project tooling |
| `termpower-storybook` | Termpower `.storybook` | Storybook configuration and decorators | Working on Storybook setup, global decorators, preview behavior, or component-development infrastructure |

## Task Routing

| Task | Start with | Add when needed |
|---|---|---|
| Understand a Spade concept | `spade-wiki`, `spade-docs-content` | `spade-python-core` to verify implementation |
| Understand a Termpower concept | `termpower-wiki`, `spade-docs-content` | `termpower-ui` to verify implementation |
| Find Python implementation | `spade-python-core` | `spade-local-libs`, `spade-tests`, or `spade-sql` depending on boundaries |
| Find repository rules or commands | `spade-config` | `spade-docs-content` for longer guides |
| Understand a local dependency | `spade-local-libs` | `spade-python-core` for call sites |
| Find an app or operational script | `spade-apps-scripts` | `spade-config` for invocation or configuration |
| Work on Termpower UI | `termpower-ui` | `termpower-wiki`, `spade-docs-content`, `termpower-tooling`, or `termpower-storybook` |
| Inspect database structure | `spade-sql` | `spade-python-core`, `spade-docs-content`, and `spade-tests` |
| Find expected behavior | `spade-tests` | Relevant implementation and docs collections |
| Inspect feed metadata | `spade-data-descriptors` | `spade-python-core` and relevant docs or wiki |
| Understand tooling or e2e behavior | `termpower-tooling` | `termpower-ui` and `spade-config` |
| Inspect Storybook setup | `termpower-storybook` | `termpower-ui` |
| Recover historical agent reasoning | `ai` | Always verify against current docs and source |
| Find formal project plans or decisions | `docs` | Relevant wiki and implementation collections |

## Collection Caveats

- Specialized collections are opt-in so tests, SQL, descriptors, and tooling do not overwhelm general searches.
- `.ai` is gitignored local scratch material. It can recover prior reasoning but is not shared or durable project documentation.
- `.storybook` has its own collection because QMD filters hidden directories when scanning from a parent root.
- QMD may lag behind uncommitted edits. Read the live working tree before changing code.
- Collection names, membership, and inclusion defaults may drift; live state wins over this catalog.
