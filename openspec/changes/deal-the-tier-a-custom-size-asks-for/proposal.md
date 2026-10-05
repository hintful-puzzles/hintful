# deal-the-tier-a-custom-size-asks-for

**Status: scaffolded, not started (2026-10-05).** Found by
`review-preset-counts-across-the-catalog` while filling menus out to every
tier.

## Why

A board's tier is a promise about what it takes to solve, and
`difficulty-contract.test.ts` holds every *preset* to it: the lowest cap its
dealt board solves at is the tier it claims. Nothing holds a Custom size to
it, and on some sizes the generator hands back a board below the tier asked
for, under the tier's name.

Measured 2026-10-05, three deals a cell from fixed seeds, each board's lowest
solving cap from `lowestSolvingCap(cappedSolveFor(...))`:

- **Group 6x6 at Tricky and at Hard**: all three boards needed Normal. The
  deals took under a millisecond, which is what gave it away.
- **Group 8x8 at Hard**: all three needed Tricky.
- **Unequal's Adjacent, 5x5 and 6x6 at Hard**: two of three needed Tricky.

Group 6x6 and 8x8 at Unreasonable, and Adjacent 7x7 at Hard, came out at
their tier. None of the five cells is on a menu; each is one the Custom
dialog accepts.

## What is known and what is not

- **Three deals a cell is a thin sample.** It convicts a cell that fails and
  does not clear one that passes. The eleven games measured were the ones
  whose menus changed; no other game's Custom sizes have been asked.
- **Why each generator gives up is not known.** Group's 6x6 may have no board
  that needs more than Normal, in which case the tier is not there to deal;
  or its retry loop may stop early. The two call for different fixes.
- `difficulty-contract.test.ts` has a comment on exactly this: a hard tier on
  a small board "asks something no generator can answer", and
  `validateParams` accepting params is not evidence a board can carry the
  tier.

## What Changes

To be designed, per game, once the cause is read:

- where a size cannot hold a tier, `validateParams` refuses the pair, as
  Unequal already refuses Adjacent below 5 at Tricky and above;
- where the generator stops short, it keeps going or throws, so a board is
  never dealt under a tier it does not need.

Then a diagnostic that walks every size a dialog allows at every tier, in
the spirit of `bound-custom-sizes-by-their-deal`, which asks the same cells
how long they take.

## Compatibility

A refusal makes a params string that loads today stop dealing new boards. A
saved or shared board carries its desc and still loads. The owner's to
confirm before any refusal lands.

## Hints to pull in

None.

## What would show it worked

The five cells above each refused or dealt at their tier, and a walk over
the dialogs' sizes that reports no board below its label.
