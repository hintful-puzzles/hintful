# derive-target-verb-input

**Status: scaffolded, not started.** Phase 4 of `envision-the-game-contract`.
Read that change's `design.md` first, and the postmortem
`2026-09-05-gesture-table-withdrawal.md`.

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

Five of the hintless games are members of the model: **Net, Mines, Black Box,
Flip and Twiddle**. This is the phase where a new hint checks the framework
best, because a hint's steps are moves, and in these games the moves are
exactly the verbs the model derives. A step's move should be spelled through
the declared verb, not beside it, and a hint that has to hand-build a move the
model already names is a finding about the model.

Take them after the pilot, one at a time, in the order they press:

1. **Net** first: its lock is a verb with game-supplied semantics (Task 0's
   list), its decided element is a tile's rotation (a new mark kind), and its
   deductions are connectivity, which the hint bar can narrate.
2. **Mines**: the chord verb, and a desc that changes mid-game
   (`Game.supersededDesc`), which a hint's plan must survive.
3. **Black Box**, **Flip**, **Twiddle** after that, each checked against the
   model as built. Twiddle's hint is a sliding-permutation planner (see how
   Fifteen and Sixteen were bound), and Flip's is linear algebra over the
   board: decide whether each is deductive or heuristic before building it,
   in its own change.

Re-check membership before starting: this list is the input survey's, and a
member can move to `interpretMove`'s override once the second falsifier runs.
