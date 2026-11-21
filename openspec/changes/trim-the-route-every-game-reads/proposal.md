## Why

`architectural-review-second-pass` item 6 (owner accepted every item,
2026-11-21), the question `state-each-guide-rule-once` handed on: folding
copies did not shrink the route, whose cost is the size of the sections it
sends every kind to. Measured at `04494aa27` with
`node scripts/checks/guide-sections.mjs --route`: 3,662 to 4,811 lines a
kind (about 55 to 75 thousand tokens) before any source.

## What Changes

- Section by section through the route's every-game block: a passage that
  walks through what the skeleton or the code already shows becomes a
  pointer to it ("a guide points, and the code details"); a rule stays.
- Passages that the engine changes before this one made obsolete go
  (`describe-adapters-from-the-engine`, `redraw-takes-a-frame`,
  `one-way-to-paint-hint-marks`, `walk-a-hint-plan-once`).
- The route's per-kind figures are re-measured and recorded.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

None.

## Impact

`docs/`.
