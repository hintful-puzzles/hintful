## Why

`architectural-review-second-pass` item 5 (owner accepted every item,
2026-11-21). `testing/hint-walk.ts` walks a midend for the cross-game guards,
but nothing walks a game's hint plan alone, so per-game hint tests loop it
by hand. Measured at `22ba4e45f`: 32 of 62 `*-hint.test.ts` files loop
`plan`/`hint` (query in the review's design.md, item 5), and 13 define a
local `function walk`. Each new game's hint test copies one.

## What Changes

- A plan-level walker in `src/engine/testing/` with a per-step visitor, a
  stop rule (solved, `validateBoard`, an empty plan) and an optional answer
  check each step.
- The hand walks move onto it, each keeping its limit, stop rule and check.
- The skeletons' hint tests use it.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

`src/engine/testing/`, `src/games/*/*-hint.test.ts`, the skeletons' hint
tests, `docs/testing.md`.
