## Why

`architectural-review-second-pass` item 1 (owner accepted every item,
2026-11-21). Measured at `22ba4e45f`: the last green Gate run (44847177791)
spent 33.1 reference minutes of test CPU against the suite budget of 40
(`BUDGET.suite` in `scripts/checks/test-cost.ts`), half of it in the
cross-game guards, which every new game pays into. At about 23 reference
seconds a game, the budget runs out near 83 games. CI's wall time went from
9.7 minutes (2026-10-27, cited in `gate.yml`) to 19–20 against
`timeout-minutes: 30`. The catalog is meant to reach dozens to hundreds of
games.

## What Changes

- CI runs the suite as a matrix of `vitest --shard` jobs, so wall time stops
  tracking the suite's CPU. The cost report and the budgets are restated for
  sharded runs; the owner accepted the item whole, so the budget may be
  restated, and the change records the figures it chose and why.
- The dearest guards (warm-repaint, hint-resume, difficulty-contract,
  wrong-entry-check, candidate-reading, hint-quality) are profiled, and a
  board or round is cut only where it adds no coverage, judged by
  `docs/test-strength.md`.
- The `gate.yml` comment's stale figures go.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

`build-pipeline`, where it states the budget or how CI runs the gate.

## Impact

`.github/workflows/gate.yml`, `vitest.config.ts`, `scripts/checks/test-cost.ts`,
`scripts/gate.sh`, the dearest guards, `docs/testing.md` § "What runs when".
