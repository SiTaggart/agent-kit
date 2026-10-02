---
name: code-taste
description: Apply TypeScript and React code-shape taste for implementation, review, refactor, and quality-gate tasks. Use when TypeScript or React changes involve typed contracts, helper boundaries, domain cores, IO or UI adapters, schemas, reducers, selectors, premature abstractions, speculative guards, maintainability smells, courier objects, JSX business logic, casts, useEffect, effect soup, or over-engineering.
---

# Code Taste

Use this skill for TypeScript and React architecture and code-shape judgment.
This skill is the single home for those rules; global `AGENTS.md` points here
and does not repeat them.

## Authority

- Follow local project conventions first.
- Follow explicit user instructions when they conflict with these defaults.
- Apply these rules harder to new code than to old code around it.
- Prefer the change that yields the smallest resulting system — least complexity
  carried forward — over the one with the smallest diff.

## Routing

For Spade Python-only changes, use `spade-python-taste` instead. Use both only
when the change crosses TypeScript or React and a Spade Python service.

Use this skill before choosing the implementation approach. Do not save
code-shape thinking for the quality gate.

- When installed, load the host's React and Next.js best-practices companion
  whenever a change touches rendering, data loading, effects, suspense,
  server/client boundaries, or bundle-affecting imports. Match the change
  against its relevant rules before implementing.
- Load `typescript-advanced-types` for real compile-time contract work:
  discriminated unions, generic APIs, schema inference, typed configuration.
- Skip supporting skills when the local convention already makes the right
  move obvious.

## Architecture

- Prefer contract-oriented code: a typed domain core with explicit IO, UI, and
  imperative-integration boundaries.
- Treat user actions, URL state, persisted state, backend payloads, mutations,
  subscriptions, cache invalidation, and rendered output as product contracts.
  Encode them with TypeScript types, schemas, endpoint metadata, discriminated
  unions, or explicit state-machine actions.
- Put deterministic behavior in named, typed, testable modules: schemas,
  parsers, reducers, selectors, validators, compilers, hydrators, adapters, and
  model helpers.
- Keep React components and hooks focused on rendering, user interaction,
  external subscriptions, IO coordination, cache coordination, navigation,
  analytics, dialogs, and imperative interop.
- Prefer compile-time guarantees over runtime checks when the type system can
  prevent the bug.

## Smallest Change Bias

"Smallest" means the smallest resulting system — least complexity carried
forward — not the smallest diff against the current shape. The bullets below
guard against over-building; the last guards against the opposite failure:
propping up a structure that should be replaced.

- Prefer the direct edit that satisfies the current contract.
- Apply the deletion test to every guard, branch, fallback, helper, and test:
  if deleting it would not leave the accepted contract unmet or unproven, do
  not write it. Useful, thorough, and possible are not aliases for necessary.
- Do not introduce a helper, wrapper, adapter, lookup, config layer, type guard,
  or defensive branch unless it removes current duplication, names a real
  invariant, crosses an actual runtime boundary, or makes the accepted behavior
  easier to prove.
- Do not hedge against hypothetical data shapes, impossible states, or future
  callers. Handle an edge case only when a real caller or input in this system
  can produce it — name that source. If you cannot name one, leave the case
  unhandled and give it one line in the report instead of code.
- Trust compiler inference inside typed code. Do not add casts, predicate
  helpers, or runtime checks to convince TypeScript of facts it can already know
  with clearer types or local narrowing.
- Parse or guard raw `unknown` data once at the external boundary, then pass
  typed values inward.
- Do not prop up a shape that should be replaced. When a fix only fits by adding
  a special case, a flag, or a workaround to structure that is itself the
  problem, replacing that structure is the smaller change even when the diff is
  larger. Name it and surface the tradeoff rather than patching the local
  minimum.

## TypeScript And React

- Prefer `interface` for object shapes and `type` for unions, intersections, and
  utility types.
- Prefer React component function declarations with explicit return types when
  that fits the local style.
- Co-locate related component, hook, type, and test files when the project
  already uses that pattern.
- Start function names with an action verb that tells the caller what happens,
  then name the file after the main export. Prefer `calculatePeriodValue` over
  `periodValue`.
- Let names and types document internal TypeScript. Use TSDoc only for published
  API behavior that callers cannot infer from the signature.
- Use `unknown` plus parsing at external boundaries instead of trusting raw data.
- Avoid casts. If a cast is unavoidable, add a short `// SAFETY:` comment that
  explains the invariant.
- Hold `any` and `!` non-null assertions to the same bar: fix the type boundary
  or handle the null case. A genuinely unavoidable exception carries a
  `// SAFETY:` comment.
- Keep JSX from carrying business rules. Move shaping, validation, filtering,
  state transitions, and derived rows into helpers, selectors, reducers, schemas,
  adapters, or hooks.

## Function Boundaries

- Write domain workflows as a top-to-bottom sequence of named states.
- Give each meaningful transformation its own statement. Name the value for the
  domain state that exists after that step.
- Inline an operation only when an intermediate name would add no domain
  meaning. Name filtering, representation changes, result selection, and
  fallible work even when the value is used once.
- Let broad workflow owners compose broad objects: public actions, render
  resolvers, validators, hooks, components, and IO adapters.
- Below that owner boundary, pass the smallest meaningful values a helper
  directly reasons about.
- Avoid courier arguments: broad objects passed through helper layers so a lower
  function can read one field or forward the object again.
- Avoid helpers that accept both a broad object and a value already derived from
  it.
- Broad objects are fine when the function truly owns a broad transition or
  invariant.

```ts
const points = convertRowsToPoints(input, dates, timezone);
const result = calculateLatestMetricResult(points, unit, comparison);
return attachRefreshError(result, refreshError);
```

```ts
const chartDateSetup = chartDefaultDateSetup(chart);

return resolveTraceDateWindow({
  chartDateSetup,
  seriesDateSetup: series.dateSetup,
  traceWindow: trace.window,
});
```

Prefer that over:

```ts
return resolveTraceDateWindow(chart, series, trace);
```

## IO And External Synchronization

- Centralize fetches, saves, invalidation, and backend shaping behind query,
  mutation, command, or adapter hooks.
- Treat `useEffect` as a code smell for product/domain state, derivation, event
  handling, data loading, backend shaping, or parent-child synchronization.
- Before adding `useEffect`, exhaust event handlers, derived render values,
  reducers, selectors, query/mutation hooks, framework data APIs, refs, and
  explicit external subscriptions.
- Use `useEffect` only for synchronization with a real external system that no
  narrower framework or adapter boundary already owns.
- Isolate imperative engines behind controllers or adapters.
- Domain rules should return domain results. Callers own UI outcomes such as
  toasts, routing, dialogs, and analytics.

```ts
type ValidationResult =
  | { ok: true }
  | { ok: false; reason: "duration-mismatch"; traceIds: string[] };

function validateEqualDuration(spec: ChartSpec): ValidationResult {
  return hasEqualDuration(spec)
    ? { ok: true }
    : { ok: false, reason: "duration-mismatch", traceIds: traceIds(spec) };
}
```

## Testing Taste

- Each new test must prove one acceptance criterion or reproduce one observed
  failure. Name which one. Do not add a test that re-proves what an existing
  test already proves.
- Test the promised behavior, not the implementation's branches. Do not write
  one test per branch you happened to write.
- Test the lowest meaningful seam that proves the behavior: schema, parser,
  hydrator, reducer, selector, validator, URL sync, command, mutation, cache
  invalidation, hook, or adapter.
- Use component or browser tests when the regression is genuinely
  interaction-level, visual-state-level, or journey-level.
- Avoid render tests that only prove mocked wiring, prop forwarding, or effect
  calls.
- Extend the existing suite for the surface you changed. Create a new test
  file only when no suite covers that surface.
- Prefer the project's existing test shape over a new harness.

## Review Smells

- JSX maps backend responses directly into UI rows.
- Helpers read only one or two fields from a broad object.
- A broad object is passed onward without meaningful local use.
- Derived values are recomputed after the caller already knows them.
- Effects coordinate state transitions that should be reducer actions.
- Fetch, save, invalidation, or parsing logic is scattered through components.
- A wrapper, lookup, adapter, or abstraction only packages a direct call.
- A helper exists mainly to hide a cast, type guard, or single property access.
- Runtime guards check states already excluded by the local TypeScript types.
- Defensive branches handle hypothetical edge cases outside the accepted
  contract.
- Tests mount UI just to observe mocked hooks.
- A new test re-proves an existing test, or lands in a new file when a suite
  already covers the surface.
- `useEffect` coordinates product state, mirrors props, loads data, shapes
  backend responses, or patches over ownership boundaries.
- Casts, `any`, non-null assertions, skipped tests, or ignored rules hide the
  real type or behavior boundary.
