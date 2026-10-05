# fix-salad-number-ball-hint-throw

**Status: scaffolded, not started (2026-10-05).** Found by
`name-the-rung-a-hint-step-speaks`, whose scan for Salad's rungs dealt the
board.

## Why

Salad's hint throws on a board its own generator deals, at a tier it ships.
Reproduced 2026-10-05, on the fresh board with no move played, under both
candidate readings:

- `5n3Bdx:c2b1aOXbXb3c1OOc` (Number Ball, 5x5, Normal, dealt from the seed
  `hint-scan-25`).
- `saladGame.hint(state)` throws: *"hint plan: placing 1 at cell 2 is neither
  a naked nor a hidden single in the notes, so the plan skipped a strike it
  rests on"* (`classifyPlacementInRegions`, `src/engine/latin-hint.ts`).

A player who presses Hint on that board gets a crash report and no hint. The
throw is the plan's own soundness check doing its job: the plan is about to
place a value its notes do not yet show as forced, so a strike the placement
rests on was never taught.

## What is known and what is not

- The check that throws is shared by every candidate game, and the cross-game
  hint walks are its guard. They did not meet this board. How often Number
  Ball at Normal deals one is **not measured**: the scan that found it was
  dropped from Salad's pins on the first throw. Measure it first, on a walk
  that counts throws and does not stop at one.
- Whether Letters mode at the same tier has the fault is not measured either.
- One lead, unverified: `buildSteps`'s `record` drops every hole-symbol strike
  (which is why Salad's `repeatFull` rung is listed `unreached` in
  `salad-hint.test.ts`). If a placement of a number rests on such a strike,
  dropping it would leave exactly this gap. Re-derive this before building on
  it.

## What Changes

The plan teaches every strike a placement rests on, on every board Salad
deals, and the board above is pinned as an input.

Until then Salad's rung scan (`salad-hint.test.ts`) leaves Normal Number Ball
boards out, and says so beside its `params`. Put them back in the same change,
and take `repeatFull` out of `unreached` if the fix makes it fire.

## Hints to pull in

None.

## What would show it worked

`saladGame.hint` returns a plan on the pinned board, a walk of Number Ball and
Letters at every tier over enough boards to have met the fault before meets it
on none, and Salad's rung scan covers Normal Number Ball again.
