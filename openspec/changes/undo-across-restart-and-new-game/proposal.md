# undo-across-restart-and-new-game

**Status: scaffolded, not started (2026-10-07).** Asked for by the owner that
day: *"I quite like how Patrick's Parabox implemented an undo across the
Restart Game option - can we do this too?"*, and then *"and maybe even an undo
of New Game? (just with depth 1 probably)"*.

## Why

Restart and New game are the two commands that throw a player's work away,
and neither can be taken back. A mis-tap on either costs the whole board.

Read on 2026-10-07: `Midend.restartGame` replaces the history with its first
state alone, so every move is gone and Undo is unavailable afterwards.
Upstream keeps a restart as an entry in the history (`../puzzles/midend.c`,
`movetype = RESTART`, written to a save under that key), so its Undo reaches
back across one. Not traced: why the port does otherwise. Read the commit
before treating it as a decision.

## What Changes

**Restart is a step in the history.** Undo after it returns the board as it
was, moves and all, and Redo restarts again.

- A save stores the move log and replays it, so a restart becomes an entry in
  that log and the envelope's version goes up. Every save a player holds today
  still opens. The owner's word on the other direction (2026-10-07): an older
  copy of the app failing to read a newer save is not a cost
  (`docs/work-management.md` § "What the owner accepts").
- Restart clears the board's "solved with help" record today. Undoing the
  restart has to bring it back with the moves it belongs to.
- Mines restarts to just after its first click (`descSuperseded`). Say how
  that reads as a history step.
- How the step appears in the move timeline and to the checkpoints past it.

**New game can be undone, one board deep.** Just before a board is replaced,
the app keeps a full save of it. On the new board, before any move, Undo
brings the old one back as it was left. No save format changes: what is kept
is an ordinary save.

Proposed to the owner on 2026-10-07 and not objected to; decide otherwise only
with a reason:

- It covers every way a board is replaced: New game, a type chosen from the
  menu, a shared game opened, a save loaded.
- The kept board is dropped at the first move on the new one. From then on
  Undo means what it always has.
- Redo after undoing returns to the new board.
- It is not kept across a reload.

Not read yet: how the autosave and `settings.getLastGameId` already remember
a board across a deal, and whether the kept board should ride on them.

## Hints to pull in

None.

## What would show it worked

In the app, by pointer, key and touch: play some moves, Restart, Undo, and the
moves are back; Redo restarts. Play some moves, New game, Undo, and the old
board is back with its moves and its timer; Redo returns the new board; one
move on the new board and Undo no longer reaches the old one. A save written
before this change opens. A save holding a restart round-trips, with the
cursor on either side of it.
