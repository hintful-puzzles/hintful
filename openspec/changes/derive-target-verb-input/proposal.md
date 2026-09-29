# derive-target-verb-input

Phase 4 of `envision-the-game-contract`. Read that change's `design.md` first,
and the postmortem `2026-09-05-gesture-table-withdrawal.md`. What was measured
and built is this change's `design.md`; the rest of the members, and Net's hint,
are `sweep-target-verb-input`.

## Why

The gesture table failed because it was keyed on **gestures**, and only 14 of
57 games fit it cleanly. The mechanic-keyed note-taking cell (`engine/note-taking-cell.ts`)
has since absorbed thirteen games, seven of which the table had classed hatched
or partial.

The input survey (2026-09-29) found one more mechanic shared by about seventeen
games: **target verbs**. The player aims at a cell, edge, corner or gutter
target. Left, right and sometimes middle each apply a verb there. At the cursor,
Enter and Space do the same as left and right. Members: Light Up, Magnets,
Range, Singles, Slant, Subsets, Unruly, Net, Twiddle, Mines, Blackbox, Dominosa,
Flip, Flood, Palisade, Separate and Loopy.

`border-grid.ts` already implements the model for Palisade and Separate, whose
`interpretMove` is eleven lines each. The other fifteen hand-write the cursor,
Enter/Space and verb branch.

Their help pages state the Enter/Space convention in prose. Before 2026-09-28,
27 help pages did not mention the keyboard at all.

## What changes

A target-verb input model:

- The game declares its target geometry, and each button's verb as a function
  returning a move, with a label.
- The model derives the cursor's Enter and Space, the touch long-press (from
  existing machinery), and the Controls paragraph of the help.
- `interpretMove` remains the typed override for extra arms. That covers the
  eight click-plus-drag games, which take the model plus one drag arm.

The drag games keep `interpretMove` permanently. Their keyboards are designs
(`docs/games/input.md` § "The keyboard equivalent of a drag is a design, not a
derivation").

## Tasks, in order

- **Task 0, a behavioral probe through `testing/input-probe.ts`.** Does
  `CURSOR_SELECT` at the cursor do what `LEFT_BUTTON` at that target does, and
  `CURSOR_SELECT2` what `RIGHT_BUTTON` does, game by game? **Falsifier:** fewer
  than about 20 games agree. The derivation is then false, and the change is
  withdrawn with the measurement.
- **Second falsifier.** Classify the press, drag and release arms of the model's
  games. If more than about a third need the override for arms that touch the
  model's own press (click versus drag resolved on release), the model is "two
  ways plus a seam" again. It must then own resolve-on-release, as select-or-drag
  does, or stop.
- Verb semantics that differ are game-supplied functions, never flags: Magnets'
  three-state cycle, Singles' "either key clears", Mines' chord and Net's lock.
- Pilot on three or four click-only games (Light Up, Singles, Range, Unruly)
  before any sweep.

## Hints to pull in (2026-09-29)

One: **Net**, after the pilot. A hint's steps are moves, and in the model's
games the moves are exactly the verbs it derives, so a step should be spelled
through the declared verb, and a hint that has to hand-build a move the model
already names is a finding about the model. Net presses hardest of the
hintless members: its lock is a verb with game-supplied semantics (Task 0's
list), its decided element is a tile's rotation (a new mark kind), and its
deductions are connectivity, which the hint bar can narrate.

The other hintless members (Mines, Black Box, Flip, Twiddle) stay in reserve
(`hintless-games-in-reserve`); pull one in only if Net leaves a question about
the model that it alone would answer. Re-check that Net is still a member
before starting: the list is the input survey's, and a member can move to
`interpretMove`'s override once the second falsifier runs.
