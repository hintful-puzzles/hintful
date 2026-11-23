## Why

`measure-cost-by-instructions` re-measured the born games' deals against
the hand-written ones they replaced (its design.md § "The born games
re-measured (3.1, 3.2)", 2026-11-23). Counted in instructions, a born deal
costs 3.7 times the hand-written one in Light Up, 2.6 times in Boats, and
1.6, 1.6 and 1.4 times in Clusters, Sticks and Unruly. Timed per menu board
by `deal-compare` against `75691d811`, five deals a preset, wall-clock
means:

| Board | Hand-written | Born | Slowest born |
|---|---|---|---|
| Light Up 12x16, middle tier | 105 ms | 402 ms | 627 ms |
| Light Up 12x16, top tier | 236 ms | 481 ms | 1,059 ms |
| Light Up 10x10, top tier | 69 ms | 231 ms | 417 ms |
| Boats 10x10, hardest | 29 ms | 213 ms | 478 ms |
| Clusters 9x9, Unreasonable | 28 ms | 138 ms | 296 ms |

These are menu boards, past the 100 ms a player does not notice, and the
`born-plain-cell-family` archive missed them by taking each game's median
deal. Several games share the cost, so it is the engine's born deal
(`src/engine/fill/deal.ts`, `sample.ts`, `grow.ts`, `search.ts`) and not one
game's.

## What Changes

- **Find where a born deal's work goes** on the boards above: by
  `deal-profile`, and by the stage census `npm run deal-walk` prints with
  cells named (draws thrown away, mends, the uniqueness solve).
- **Cut it in the engine**, for every born game, until no menu board's
  deal is slower than its hand-written one was by more than the spread, or
  a deal over 100 ms has a stated reason the hand-written one did not need.
- **Counted, not timed**: each step of the work compared by
  `npm run compare-cost` against the commit before it, and the deals'
  milliseconds as the least of several CPU-time runs
  (`docs/method.md` § "Compare a cost in instructions, not in time").
- No game's description changes to make its deal cheaper
  (`docs/descriptions.md` § "What a technique compiles to": speed is
  improved as work passes, in the engine).

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `described-fill-game`: a born game's deal costs no more than the
  hand-written one it replaced, on the menu's boards.

## Impact

`src/engine/fill/` (the deal, the sample, the grow and the search), and
whatever `src/engine/solve/` the uniqueness solve reaches. Saves and IDs
are unchanged: the app hands out boards, not seeds.
