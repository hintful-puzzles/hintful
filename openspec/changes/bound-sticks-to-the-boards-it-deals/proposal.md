# bound-sticks-to-the-boards-it-deals

**Status: filed 2026-10-10 by the session that gave Sticks its Unreasonable
tier (`add-an-unreasonable-tier-to-the-untiered-deductive-games`), which
measured it. What it says of the code was true that day; re-check before
relying on it.**

## Why

Sticks deals a board by placing blocks, laying a line in every white square
at random and numbering the lines, and trying again until the solver finishes
that fill from its numbers (`clueFill` in `sticks/generator.ts`), up to
100,000 times. It then strips numbers with a solver run for each. The solver
tries every blank square each way for each square it decides, so one run
grows steeply with the board. `validateParams` bounds
the share of blocks and nothing about size. A comment in `sticks/state.ts`
already records that a 13x13 deal took over seven seconds, which is why the
menu stops at 10x10; Custom still offers it.

Measured 2026-10-10 at Easy, 20% blocks, turned half way round: mean time
for a deal. None gave up.

| Board | Squares | Deals | s a deal |
| --- | --- | --- | --- |
| 7x7 | 49 | 30 | 0.04 |
| 10x10 | 100 | 30 | 0.54 |
| 8x12 | 96 | 12 | 0.49 |
| 5x20 | 100 | 12 | 0.49 |
| 4x25 | 100 | 12 | 0.89 |
| 11x11 | 121 | 12 | 1.2 |
| 12x12 | 144 | 6 | 2.6 |
| 13x13 | 169 | 4 | 8.5 |

A thin board costs far more than a square one of its area:

| Board | Squares | Deals | s a deal |
| --- | --- | --- | --- |
| 2x20 | 40 | 12 | 0.02 |
| 2x25 | 50 | 12 | 0.04 |
| 2x30 | 60 | 12 | 0.26 |
| 2x40 | 80 | 12 | 1.2 |
| 2x50 | 100 | 2 | 13.5 |
| 3x25 | 75 | 12 | 0.23 |
| 3x33 | 99 | 12 | 1.3 |

And the share of blocks matters as much as the size, with no symmetry:

| Board | Blocks | Deals | s a deal |
| --- | --- | --- | --- |
| 10x10 | 40% | 12 | 0.22 |
| 10x10 | 20% | 12 | 0.62 |
| 10x10 | 5% | 1 | 17.8 |

The Unreasonable tier has a bound of its own (100 squares and 30 on the
longer side, `MAX_UNREASONABLE_AREA` and `MAX_UNREASONABLE_SIDE` in
`sticks/state.ts`), taken at 20% blocks. It takes about three times as long
as Easy and has the same hole: an Unreasonable 10x10 with 5% blocks took 31
seconds.

## What Changes

- `validateParams` refuses, when a board is to be dealt, a board Sticks does
  not deal in a few seconds, with a reason that names what to change: a
  smaller grid or more blocks.
- The Unreasonable bound takes the share of blocks into account too.
- The retry cap on fills is sized to the rarest board the bound admits.
- A pasted board of any size still opens.

## What to settle first

- **The shape of the bound.** Time depends on the area, the longer side and
  the share of blocks. Sweep the shorter side from 2 to 13 at 5%, 10%, 20%
  and 40% blocks, with at least five deals at every size the bound will
  admit and a time limit on each cell, before choosing between a table and a
  rule on the expected time of a deal.
- **Not refusing what deals today.** A 12x12 board deals every time in under
  three seconds. Refusing a board that deals today in a few seconds is the
  owner's call.
- **Whether the solver can be made cheaper**, which is a different change:
  it rescans every blank square from the first after each one it decides,
  and a run that kept a list of the squares a new line could affect would
  move the bound by itself. It must reach the same verdict on every board,
  since which boards are dealt is decided by it.

## Capabilities

### Modified Capabilities

- `sticks`: which sizes are dealt.

## Impact

- `src/games/sticks/state.ts` (`validateParams`), `generator.ts` (the retry
  cap), `sticks-tier.test.ts` and `sticks.test.ts`, `help/games/sticks.md`
  and `help/differences.md`.
