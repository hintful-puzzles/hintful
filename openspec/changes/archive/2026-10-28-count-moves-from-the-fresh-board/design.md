# Design

## The rule the player sees

A **run** is play from a fresh board: the board as a New game, a type change,
a shared or loaded game, or a Start over drew it. The counter, the timeline and
the checkpoints are the run's: "Move 3 of 5" counts from the run's fresh board,
and Start over shows as no move. Undo at a run's first position goes to the run
before it, and Redo at a run's last position to the run after it, whichever of
the two commands put that run away. The timeline offers the run before and the
run after as one entry each, named for how the fresh board was drawn.

## Two stores, one presentation

The owner's words were "I don't really care how we handle the undo internally,
but to a user it must not be shown as a move". The two commands put away
different things, and they stay in two stores:

- **A Start over keeps its `Restart` entry in the board's move log**, as now.
  The run before it is the same board, so it belongs in the board's save:
  undoing a Start over keeps working after the page reloads from its autosave,
  as it does today, and the save envelope does not change. Today's saves with
  `restarts` open exactly as they do, which is the compatibility the proposal
  asks for, at no cost.
- **A New game (and every other replacement) keeps the board left as a save of
  itself**, as now. Another board stays out of this board's save: an exported
  or named save would otherwise carry the player's other games with it.

The midend presents both the same way: the notification's counter is the run's
(`currentMove` and `totalMoves` are counted from the run's first position), the
neighbors are named by kind (`boardBefore`, `boardAfter`:
`"restart" | "board" | null`), and each run is numbered as a board is
(`board`), so the app's per-board record, the checkpoints, follows a run with
no new concept. `restarts` leaves the notification: nothing shows a restart in
the middle of a count any more.

Considered and declined: making Start over a board replacement (the played
board kept as a save, and a fresh `startFrom`). It is one store, but the kept
run would then not survive a reload, which today's restarts do; keeping it
would mean writing kept boards into saves, which brings other games into an
exported save. Its other gains (one counter rule) the presentation layer gets
anyway.

## What Undo can reach, and the bound

A board's own log, restarts included, is unbounded, as its moves are today: a
bound on actions would cut back undo within one long board, which nobody asked
for. **The bound is on boards kept: up to 100 each way** (`KEPT_BOARDS`).
Kept boards are no longer dropped by the first move on the board in play: a
step (a move or a Start over) drops what is ahead, the moves ahead of the
cursor and every board kept after, and keeps the boards behind, as an editor's
undo does. Replacing a board pushes the board left onto those behind and drops
those ahead. Each kept board is one save, a few kilobytes at most, so the bound
is about memory, set high enough that a player does not meet it in a sitting.
Kept boards still do not survive the page (the reason above).

## What else follows

- **A Start over starts the timer again from zero, and the help record with
  it**: starting over is starting again (the owner's intuition, 2026-10-28,
  on accepting the rest). A restart keeps the far side's time and help beside
  its solver record, and Undo across it brings them back, as a kept board
  comes back with its time. The save's restart entries gain `elapsed` and
  `hinted`; a save written before has neither and reads as the time and help
  running on through, which is what they did.
- **Each run is numbered**: `Restart` carries the number of the run it begins,
  a kept board carries its runs' numbers, and a board brought back reopens
  them, so its runs' checkpoints come back with it.
- **The app keeps checkpoints for every kept board, by number**, where it kept
  one board's. Pruning by "moves fewer than before" is skipped when the board
  changes, since the two counts are different runs'.
- **"Is this board played" is no longer the counter's question.** The
  autosave, the shared-game warning and the open-saved dialog asked it as
  `totalMoves > 0`, so a Start over (move 0 of 0) deleted the autosave and lost
  the moves it put away on reload; the app run found it. They ask
  `Puzzle.played` instead: a move in the run, or a Start over either side.
- **The words**: the timeline's entries are *Previous board* / *Next board*
  for a board, *Before starting over* / *Started over* for a run of the same
  board; the label "Started over (n)" and "Checkpoint, at a restart" go, as no
  restart lies inside a run. An Undo across a Start over says "Your moves from
  before you started over are back. Redo starts over again." where an Undo
  across a board says the board is back.
