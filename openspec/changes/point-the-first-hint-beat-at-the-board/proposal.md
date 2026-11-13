# point-the-first-hint-beat-at-the-board

**Status: filed on the owner's word (2026-11-13), from a Netslide hint they
showed.** An engine finding, not Netslide's: Netslide is the first case found.
Player-visible, so its result goes to the owner before it is archived.

## Why

The Hint button's first beat shows one mark, "where to look"
(`archive/2026-11-09-show-where-to-look-first`). The engine picks it from the
step's marks by role: the evidence outline first, then stripes, and a step with
neither shows its ring.

That order assumes a stripe is evidence about the position. Where a game
stripes a line that is part of the puzzle's layout and never changes (Netslide
stripes the column or row that never slides, with a sentence that says "This
column never slides"), the first beat points at a fact that holds in every
position. The owner (2026-11-13): the first click "should always show something
that's specific to the board state".

The measurement that change took (2026-11-09, 5,506 steps) found stripes were
the first non-ring mark in 18% of steps. How many of those stripe a fixed fact
of the layout is not known.

## What Changes

- **A rule**: a step's first beat shows something that depends on the board's
  position. A mark that is true of every position of the puzzle is not
  eligible, and is not drawn on the first beat. When nothing else is eligible,
  the first beat shows the ring on what the step decides.
- **A census, as a query**: over every hinting game's gate presets, the
  steps whose first-beat mark is a set of squares that is the same in every
  position of that game (a fixed line, a source, a border). Count them and
  take the sample size that would have found one (`docs/method.md`).
- **The fix is in the game's marks, not the rule's order**, where the census
  finds one: a fixed fact is not a stripe, and the sentence that named it
  loses the clause (`standardize-hint-vocabulary` decides the words; Netslide's
  own sentence is `reword-the-netslide-hint`).
- **A guard that derives its population**: every game with a `hint()` is held
  to the rule, so a new game cannot ship a structural stripe as its first beat.

## What it must not become

A per-game list of exempt games or marks. The rule is about what a mark
depends on, and the guard reads it from the step, not from a name.

## What it touches

The engine's choice of the first-beat mark (`src/engine/midend.ts`
`lookFirst`, and the helper `show-where-to-look-first` added), the role
definitions in `src/engine/hint-words.ts`, `docs/hints-marks.md`, the
`engine-hints` spec, and each game the census finds.

## Acceptance

The census is written and its count stated. No game's first beat is a mark
that holds in every position. The owner sees the Netslide first click land on
the tile it moves, in the running app.
