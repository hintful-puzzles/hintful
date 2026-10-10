# bound-range-to-the-boards-it-deals

**Status: filed 2026-10-10 by the session that gave Range its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

## Why

Range's only size bound is upstream's guard on its cell encoding: width plus
height at most 128 (`validateParams` in `range/state.ts`). That admits a
64x64 board, and Range does not deal one.

**A large board fails outright.** `ruleConnectedness` in `range/solver.ts`
walks the clear squares by recursion, one call a square. On a 64x64 board the
walk is 4,096 calls deep and the deal ends in "Maximum call stack size
exceeded", after 14 seconds, at either tier. Where the limit falls between
40x40, which deals, and 64x64 was not measured, and it depends on the
browser's stack.

**Well short of that a deal takes too long.** `stripClues` runs the three
rules to a fixpoint once for every pair of clues it tries to remove, and each
run rescans the whole grid for every pass. Measured 2026-10-10 at Easy, mean
time for a deal, five deals a size or as many as fit in eight seconds:

| Board | Squares | s a deal |
| --- | --- | --- |
| 11x16 | 176 | 0.055 |
| 15x15 | 225 | 0.11 |
| 18x18 | 324 | 0.29 |
| 20x20 | 400 | 0.52 |
| 25x25 | 625 | 1.8 |
| 30x30 | 900 | 5.1 |
| 40x40 | 1,600 | 24 |
| 64x64 | 4,096 | fails |

The time goes by the area whatever the shape:

| Board | Squares | s a deal |
| --- | --- | --- |
| 2x126 | 252 | 0.17 |
| 5x60 | 300 | 0.26 |
| 3x125 | 375 | 0.46 |
| 8x60 | 480 | 0.87 |
| 10x118 | 1,180 | 13 |

No Easy deal gave up at any size: every one took a single draw.

The Unreasonable tier has a bound of its own from the same sweep, 300 squares
(`MAX_UNREASONABLE_AREA` in `range/state.ts`), where a deal takes about a
second. It takes three to four times as long as Easy at every size.

## What Changes

- `validateParams` refuses, when a board is to be dealt, a board Range does
  not deal in a few seconds, with a reason that names what to change.
- The connectedness rule no longer recurses a call a square, so that a board
  that arrives with its description cannot overflow the stack either: a
  pasted 64x64 board is loaded through the same rules.
- A pasted board of any size the encoding allows still opens.

## What to settle first

- **Whether a pasted 64x64 board fails today.** Loading runs the rules to
  grade the board. Paste a valid one and see; if it throws, the recursion is
  a defect in loading as well as in dealing, and it is fixed before the bound
  is chosen.
- **Not refusing what deals today.** A 25x25 board deals every time in two
  seconds. Refusing a board that deals today in a few seconds is the owner's
  call.
- **Whether the strip can be made cheaper**, which would move the bound by
  itself: it reruns the rules from the clues for each pair, where the fills
  that did not depend on the pair just removed still stand. It must keep and
  put back the same pairs, since which boards are dealt is decided by it.

## Capabilities

### Modified Capabilities

- `range`: which sizes are dealt.

## Impact

- `src/games/range/state.ts` (`validateParams`), `solver.ts`
  (`ruleConnectedness`, `stripClues`), `range.test.ts` and
  `range-tier.test.ts`, `help/games/range.md` and `help/differences.md`.
