# deal-or-refuse-stretched-unreasonable-rectangles

**Status: filed 2026-10-10 by `bound-rect-to-the-boards-it-deals`, which
measured it. What it says of the code was true that day; re-check before
relying on it.**

## Why

Rectangles' Custom dialog takes an expansion factor: the board is laid out on
a grid `size / (1 + factor)` squares a side, two at least, and stretched. With
one, a small board asked for at Unreasonable is admitted by `validateParams`
and the deal gives up, after some seconds, with the generator's error.

Reached in the app: Rectangles, Type, Custom, width 5, height 5, expansion
factor 0.5, Unreasonable, OK.

Measured 2026-10-10, five deals a shape, every shape from 2 to 6 on the
shorter side and up to 14 on the longer:

| Expansion | Every deal gave up | Dealt |
| --- | --- | --- |
| 0 | none | every shape admitted |
| 0.5 | 3x5, 3x6, 3x7, 4x4, 4x5, 4x6, 5x5 | every other, 2x12 to 2x14 among them |
| 2 | 3x5 to 3x11, 4x4 to 4x11, 5x5 to 5x11, 6x6 to 6x9 | 2x12 to 2x14, 3x12 up, 4x12 up, 5x12 up, 6x10 up |

A shape that gave up took 3 to 11 seconds to do it: the deal is allowed eight
million squares drawn (`MAX_UNREASONABLE_SQUARES_DRAWN` in
`rect/generator.ts`), which is sized for the unstretched small boards, where a
board comes once in some thousands of draws.

A stretched board has the few rectangles of its base, each made larger. What
separates the shapes that deal is not the base's size alone: at a factor of 2
a 6x9 and a 6x10 board both stretch a 2x3 base, and the first gave up five
times of five while the second dealt in a quarter of a second; at 0.5 a 4x6
and a 4x7 board both stretch a 2x4 base, and only the second dealt. The
factor is a float, so a table of shapes cannot be the rule.

Unstretched, the same question was settled by trying every board of a shape
(`rect-tier.test.ts`, `needingSearch`) and by counting what the generator
draws.

## What Changes

One of these, by what the first task finds:

- `validateParams` refuses, when a board is to be dealt, an Unreasonable board
  whose stretch leaves the tier absent or too rare, by a rule in the base
  grid and the board that the measurements bear out, with the sentence for
  which of the two it is (`noSuchTier`, `tooRareToDeal`).
- Or the generator deals them: the Unreasonable deal already moves numbers
  within their rectangles, and a stretched division has more squares a
  rectangle to move them to.

A pasted board still opens either way.

## What to settle first

- **Whether the tier is absent or rare** on a stretched small board. Count,
  over a few hundred thousand of the generator's own draws at 5x5 with 0.5
  and at 6x9 with 2, how many have one answer that the solver and the hint
  stop short of, with the numbers placed anywhere and not only where the deal
  leaves them. None in that many is absent for the generator's purposes.
- **What the rule is in.** The number of rectangles the base can hold, the
  largest rectangle the stretch can make, or how many rows and columns are
  added: tabulate each against deals and gives-up over the sweep above before
  choosing, and add factors of 0.25, 1 and 4.
- **What the base grid is.** `division` in `rect/generator.ts` computes it in
  single precision. A rule in `validateParams` needs the same arithmetic, and
  one function both call, not a copy.

## Capabilities

### Modified Capabilities

- `rect`: which stretched boards are dealt at Unreasonable.

## Impact

- `src/games/rect/state.ts` (`unreasonableRefusal`), `generator.ts`
  (`division`, `unreasonableBoard`), `rect-tier.test.ts`.
