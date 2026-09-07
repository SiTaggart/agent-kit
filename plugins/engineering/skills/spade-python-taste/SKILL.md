---
name: spade-python-taste
description: Apply Spade-specific Python service design taste when writing, reviewing, refactoring, or fixing Python under spade, especially FastAPI or Termpower services, Pydantic boundaries, router packages, runtime dependencies, expensive endpoints, and service code-shape decisions.
---

# Spade Python Taste

Shape Python services around narrow ownership, structural contracts, repo-native
conventions, and explicit runtime limits. Follow the closest project instructions
first; use this skill to make tactical design choices before implementation and
during the changed-code quality gate.

## 1. Read the grain

- Read the nearest peer service, its package exports, its router mount, its runtime
  dependency extra, and its focused tests.
- Trace the real route, structured input, output or event contract, downstream
  consumer, persistence boundary, and expensive I/O before choosing a shape.
- Reuse existing Spade helpers and operational primitives before adding machinery.

Continue once the public contract, owner, closest prior art, and proof surface are
all explicit.

## 2. Choose the narrow owner

- Keep feature-specific types and helpers in the feature package. Promote them only
  when a concrete second consumer proves what is shared.
- Split a module around independent contracts, not line count. Let the router own
  HTTP and orchestration; give coherent typed vocabularies or validation rules a
  focused sibling module.
- Decide routes and response or event shapes before downstream consumers ship.
  Aggregate sibling services through a parent router only when they share a real
  namespace.
- Match the service-router barrel convention: declare `__all__` in the router
  module, re-export it from `__init__.py`, and keep `logger`, `__all__`, and
  `router` above loaded constants.
- Put dependencies in the install extra that imports them at runtime. An optional
  extra must represent a usable deployment.
- Prefer the simplest supported local mechanism. For adjacent files, start with
  `Path(__file__).parent`; add portability machinery only for a real runtime.

Continue once every module, public path, dependency, and shared helper has one real
runtime owner and no speculative layer remains.

## 3. Make the boundary structural

- Model structured external input with typed Pydantic models. Make required facts
  required fields and forbid malformed combinations before I/O.
- Pass distinct concepts as distinct parameters instead of hiding dates, selectors,
  vintages, or policies inside `dict[str, Any]` protocols.
- Keep reusable vocabulary separate from feature policy. Pass limits, inclusive
  range semantics, and other product constraints explicitly at the call site.
- Preserve necessary behavior while simplifying its representation. Verify why a
  guard exists, then prefer types that remove parsing branches and fall-through
  states.
- Apply the deletion test to every guard, branch, and fallback: if deleting it
  would not leave the contract unmet or unproven, do not write it. Handle an
  edge case only when a real caller or input can produce it — name that source,
  or leave the case unhandled with one line in the report.
- Fix a broken invariant in its shared owner when caller impact is understood. If
  that would materially widen the change, protect the current service at its
  boundary and leave the shared fix explicit and separate.
- Prefer a direct branch, membership check, or validated default over a helper or
  identity mapping whose only job is satisfying the type checker.

Continue once malformed or mixed states fail at validation and valid interior code
does not repeatedly re-parse or re-check the same contract.

## 4. Expose costs and mirrors

- Bound expensive or metered endpoints before exposing them. Choose the applicable
  authentication, timeout, concurrency, rate, input/window, turn/tool, and result
  limits; explain any meaningful omission.
- Reuse distributed locks and counters when the service runs across workers.
- Keep an unavoidable mirror of another source of truth together in one module.
  Name the authoritative counterpart in one comment and test the boundary. Prefer
  removing the mirror when ownership can become singular.

Continue once every costly path has an explicit ceiling and every duplicated
contract has a visible owner and drift check.

## 5. Prove the deployed seam

- Test the lowest meaningful typed boundary and its malformed shapes.
- Tie each new test to one acceptance criterion or one observed failure. Do not
  re-prove what an existing test already proves.
- Extend the existing suite for the touched surface. Create a new test file
  only when no suite covers that surface.
- Exercise resource-limit and failure paths before relying on happy-path tests.
- Import the real application, assert the exact route is present, and assert any
  obsolete route is absent when routing changed.
- Prove downstream response or event compatibility at the consumer boundary.
- Run the focused tests plus touched-file formatting, lint, and advisory type checks
  appropriate to the change.

Finish only when the actual application contract, invalid-input path, and applicable
runtime ceilings are proven, with any unavailable proof reported explicitly.
