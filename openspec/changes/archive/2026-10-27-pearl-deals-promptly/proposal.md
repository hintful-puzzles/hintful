# Proposal: pearl-deals-promptly

## Why

Pearl's menu offers boards that take seconds to deal. Measured 2026-10-27
(three to five deals a line, during `rectangular-presets`): 10x10 Easy's
slowest deal took 15 s and 10x10 Tricky's 4.1 s; 8x12 Easy took 5.3 s and
8x12 Tricky 4.7 s. `metrics/deal-walk.md` (2026-10-06) has 10x10 at 3 to 4 s
a deal, the slowest 7 s, and 15x15 finding no board in 60 s. A player who
picks the largest Pearl board on the menu waits, and `docs/mechanics.md`
§ "The preset menu is a grid" cuts a row whose tail passes a second.

The owner (2026-10-27), asked whether to drop the slow boards or speed the
generator: "please file that change to optimize Pearl and come up with new
board sizes for it".

## What Changes

- Find where a Pearl deal spends its time (loop generation, the two-way
  gate's solves, the greedy white-pearl removal, retries), and make it
  faster without changing what the generator promises: every board still
  passes the gate at its tier, and the removal still keeps the one solution.
- Then choose Pearl's menu anew, by measurement: the largest sizes whose
  slowest deal of a dozen stays near a second, at least half of them
  upright rectangles (`engine-params`, "A game that takes rectangles offers
  them on its menu"), the first board kept at 6x6 Easy.
- A board's desc format does not change; a seed may deal a different board,
  which breaks nothing (the app hands out boards, never seeds).

## Capabilities

### Modified Capabilities

- `pearl`: a requirement that the menu's boards deal promptly.

## Impact

- `src/games/pearl/generator.ts` and `solver.ts`, `state.ts`'s presets, the
  params-stability snapshot's Pearl lines, and Pearl's frozen differential
  fixtures where they pin a seed's board.
