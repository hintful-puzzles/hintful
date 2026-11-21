## Why

`architectural-review-second-pass` item 9 (owner accepted every item,
2026-11-21). Of the large files the split left, `compile-expr.ts` (3,640
lines, one strongly connected component) and `midend.ts` (2,616, its hint
section declined) were declined with reasons that still hold. Two were never
read for seams: `src/engine/hint/candidate-plan.ts` (1,540) and
`src/engine/solve/ladder-runtime.ts` (1,381), measured at `22ba4e45f`.

## What Changes

- Read each for seams with ownership behind them; split along them, the
  export surface unchanged, or record why not.
- Re-check the two declines against the tree as it is then, after the
  changes before this one.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

`src/engine/hint/`, `src/engine/solve/`, the feedback probe's anchors,
`docs/engine-catalog.md`.
