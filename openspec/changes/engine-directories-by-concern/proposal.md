## Why

`architectural-review` item 11 (owner accepted every item, 2026-11-20, and
"old decisions are very likely no longer relevant": the flat-layout policy
in `docs/engine-catalog.md` § "Where a promoted helper lands" is revisited,
not kept by default). Measured at `9faabdf61`: `src/engine/` holds 120 flat
modules beside 157 test files, 45 of the modules hint machinery; the
grouping lives in a 1,864-line guide rather than the filesystem. The barrel
`src/engine/index.ts` has 78 importers while 875 files import engine modules
by path, so it is not a boundary. Nothing layers the engine internally, and
about 50 engine tests are cross-game guards living among the unit tests.

Sixth in the owner's order: 8, 1, 6, 10, 7, 11, 9, after the changes that
alter what the engine holds.

## What Changes

- `src/engine/` is grouped into directories by concern (hints, rendering,
  generation, params, input, …), settled from what the engine holds then.
- The barrel goes: one way in, by path.
- A layering rule inside the engine, held by a guard (rendering does not
  import hint planners, and whatever else the grouping makes clear).
- The cross-game guards move out of the engine's unit tests into a directory
  of their own.
- The catalog guide's placement rule is rewritten for the new layout, and
  the guide shrinks where the filesystem now says what it said.
- No player-visible change.

## Impact

Every import of an engine module, `docs/` paths, the feedback probe's
anchors, `module-layering.test.ts`, the vitest and gate scoping that keys on
paths (`scripts/gate.sh`, the commit hook's test selection).
