# undo-across-restart-and-new-game

**Status: implemented (2026-10-07).** Asked for by the owner that day: *"I
quite like how Patrick's Parabox implemented an undo across the Restart Game
option - can we do this too?"*, and then *"and maybe even an undo of New Game?
(just with depth 1 probably)"*.

## Why

Restart and New game are the two commands that throw a player's work away,
and neither could be taken back. A mis-tap on either cost the whole board.

`Midend.restartGame` replaced the history with its first state alone. It had
done so since the first midend (`6c3af39b`), whose message and comments give
no reason: a simplification of the port, not a decision. Upstream keeps a
restart as an entry in the history (`../puzzles/midend.c`, `movetype =
RESTART`), and so does the port now.

## What Changes

**Restart is a step in the history.** Undo after it returns the board as it
was, moves and all, and Redo restarts again.

- The move log gains a second kind of entry. A save writes it as `null` in
  `moves` and lists it in `restarts`, in a `v: 3` envelope. Every `v: 1` and
  `v: 2` save opens.
- "Solved with help" is one flag on the midend, not part of a state. Each
  restart keeps the flag of the play on its far side, and the two are
  exchanged when the cursor crosses, so the record comes back with the moves
  it belongs to.
- Mines restarts to just after its first click, as before; that board is the
  step. A restart logged before the first click replays to the blank board.
- A restart with nothing played since the start or the last restart does
  nothing. Before, it also emptied the redo tail.
- The timer neither resets nor stops at a restart. Before, it stopped until
  the next move, with the elapsed time kept.
- The timeline names each restart, and checkpoints before it stay valid.

**New game can be undone, one board deep.** The board replaced is kept as an
ordinary save, in the engine, where every replacement ends in `startFrom`.

- It covers every way a board is replaced: New game, a type chosen from the
  menu, a shared game opened, a save loaded.
- **Undo has one meaning.** The kept board sits before the new board's first
  position: Undo takes back a move if there is one, and brings the old board
  back otherwise. For a save loaded mid-game that means walking its moves
  first, or choosing *Previous board* in the timeline. The alternative, the
  first Undo after a load undoing the load, would make Undo after *Back to
  last save* swap boards when the player meant one move.
- Redo from the old board's last move returns to the new board, and Undo
  returns again: either is dropped at the first move on the board in play.
- Not kept across a reload. It does not ride on the autosave or on
  `settings.lastGameId`: both follow the board in play, and the autosave of
  the old board is deleted when an unplayed board replaces it.
- An unplayed copy of the board that replaces it is not kept, which is what a
  page leaves when it opens a board by id and then its autosave.
- The board's checkpoints go with it and return with it. The engine numbers
  the board in play so the app can tell.
- A load now reports the board once, not once per replayed move.

## Hints to pull in

None.

## What showed it worked

Engine: `restart-step.test.ts`, `replaced-board.test.ts`, and the restart
cases in `desc-supersede.test.ts` and `save.test.ts`; four defects planted in
the midend were each caught. App: `puzzle-board-checkpoints.test.ts`.

In Chrome on Flip, at desktop width by pointer and by `Ctrl+Z` /
`Ctrl+Shift+Z`, and in a 412px touch context by tap: moves, Restart, Undo,
Redo; moves, a checkpoint, New game, Undo, Redo; a move on the new board, after
which Undo stops at its start. A stored autosave rewritten to `v: 2` in
IndexedDB reopened at its position.
