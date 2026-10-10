# bound-rect-to-the-boards-it-deals

**Status: filed 2026-10-10 by the session that gave Rectangles its
Unreasonable tier
(`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which measured
it. What it says of the code was true that day; re-check before relying on
it.**

## Why

Rectangles' only size bound is a million squares (`validateParams` in
`rect/state.ts`). An Easy deal is quick far past the menu and then is not.
Measured 2026-10-10 at Easy, no expansion, mean time for a deal, five deals a
size or as many as fit in eight seconds:

| Board | Squares | s a deal |
| --- | --- | --- |
| 19x19 | 361 | 0.02 |
| 25x25 | 625 | 0.05 |
| 30x30 | 900 | 0.11 |
| 40x40 | 1,600 | 0.47 |
| 50x50 | 2,500 | 1.2 |
| 70x70 | 4,900 | 4.4 |
| 100x100 | 10,000 | 28 |

Thin boards were quick at every length tried (8x40 takes 10 ms), and an
expansion factor of up to 4 made a deal no slower. No Easy deal gave up: each
took one to four layouts.

The cost was not split between the solver, which keeps a count for every
number at every square, and the check that the hint finishes the board
(`rungsFinish` in `rect/hint.ts`), which replays the hint a step at a time.
Which of them grows is the first thing to find, since the second is this
port's own and can be made cheaper without moving a board.

The Unreasonable tier has a bound of its own from the same sweep, 400 squares
(`MAX_UNREASONABLE_AREA` in `rect/state.ts`), where a deal takes 0.65 s on
average and 3.8 s at worst.

## What Changes

- `validateParams` refuses, when a board is to be dealt, a board Rectangles
  does not deal in a few seconds, with a reason that names what to change.
- A pasted board of any size still opens.

## What to settle first

- **Whether there is anything to refuse** (added 2026-10-10 by
  `bound-range-to-the-boards-it-deals`, which was filed on this premise and
  drew no bound). A Custom size is not refused for its wait
  (`docs/games/solver-and-generator.md` § "Bound a generator by its tail, not
  its median"): a player can stop a deal. Refuse only a deal that throws,
  gives up, or hands over a board other than the one asked for, and fix a
  throw where it is thrown. A slow deal is made cheaper or left.
- **Where the time goes at 70x70**: time the layout, the solver and
  `rungsFinish` apart on twenty deals.
- **Whether a pasted 70x70 board opens in reasonable time.** Loading grades
  the board by the hint and the search, so the cost of `rungsFinish` is paid
  there as well.
- **Not refusing what deals today.** A 50x50 board deals every time in under
  two seconds. Refusing a board that deals today in a few seconds is the
  owner's call.

## Capabilities

### Modified Capabilities

- `rect`: which sizes are dealt.

## Impact

- `src/games/rect/state.ts` (`validateParams`), `hint.ts` (`rungsFinish`),
  `rect.test.ts` and `rect-tier.test.ts`, `help/games/rect.md` and
  `help/differences.md`.
