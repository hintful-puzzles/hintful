# fold-notes-into-conclusions

**Status: scaffolded, not started.** Owner-requested, 2026-09-25. Player-visible
wording in seven games: the owner judges the sentences.

## Why

Under the implicit reading (`examine-implicit-candidates`), a firing that
strikes from a cell with no notes first writes that cell's notes as a leg of its
own, then strikes. The worst case is three steps for one deduction, seen on a
Mathrax board (2026-09-25): "Only 1, 2, 3, 4 and 5 aren't already standing in
this cell's row or column, so pencil them in." → "The 3− clue means this cell and
the 5 across it differ by 3, so we must cross out 1, 3, 4 and 5." → "Every other
number has been ruled out in this cell, so it can only be 2."

Note legs were measured (every preset, six seeds) at about 10% of Solo's implicit
steps, 23% of Mathrax's and 24% of Keen's. Map never pays this: its deduction
ends in whichever move the board calls for ("…so it must be 2", "…: dot red and
teal"), so a target region never needs a separate note step
(`docs/games/hints.md` § "A graph, not a grid (Map)", "A narrowing ends in
whichever move the board calls for").

## What changes

For a **struck** cell with no notes, the firing's own step carries the
conclusion instead of a note leg plus a strike:

- one value left → the step is a placement: "…, so it must be 2";
- several left → the step writes the survivors: "…, so pencil in 2 and 4".

Cells that are only **evidence** (outlined, or `reads`: a pair's cells, a cage's
other cells) keep their note legs. That is the half Map's playtests showed a
player needs written down.

The conclusion clause should be the **engine's**, not written seven times: a
game's strike words supply the premise ("No way to make this cage multiply to 5
puts 2, 3 or 4 in this cell"), and the walk appends the ending the move calls
for, which also takes the existing "so we must cross out …" ending off every
game. Measure first whether every game's strike sentences split cleanly into
premise and conclusion; `hint-text-convention.test.ts` and "Conclude with the
action the move makes" (`docs/games/hints.md`) are the rules the result must
meet.

## Watch for

- The move for "several left" on a note-less cell is `pencilAdd` of the
  survivors; `keepCandidateHintTrack` and `refreshCandidateHintStep` already
  follow it. The step's `marks` (drawn struck) must stay empty, since nothing
  is struck on the board.
- A strike split across several cells (Keen's cage, by cell) folds per leg;
  a leg whose cell already has notes still strikes as now.
- The frontier and `availableStrikes` read the premise off built steps; a folded
  step changes the step kinds they see, not the cells.
- The populate reading must stay byte-identical: every cell has notes there, so
  nothing folds. Its snapshots are the check.
- Re-measure the table in `docs/games/hints.md` § "Two readings of an unmarked
  cell" afterwards: the defaults were chosen on step counts this change lowers,
  so a game may now be better off starting on "only as needed".
