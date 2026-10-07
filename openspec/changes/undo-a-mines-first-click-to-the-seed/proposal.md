# undo-a-mines-first-click-to-the-seed

Found in `work-down-the-unreached-hint-rungs`, and filed on the owner's answer
that day (2026-10-07): *"I want to drop undo. Can't we just undo to the same
seed?"*

**How that was read:** undoing the first click returns to the board before it
was laid out, and the square opened next lays it out again from the same seed.
Undo keeps working. The other reading, that Undo stops at the first click, was
the option offered and not taken.

## Why

A Mines layout is made to be finished from one square: the one first opened.
It then survived undo (`state.ts`'s shared `MineLayout`, upstream's device to
stop a player rerolling the board), so a player could undo the first click and
open a different square of a layout that was not made for it. Measured on
2026-10-07, on six ordinary 9x9 deals and every other square of each (480
first clicks after an undo):

- the game ID changed every time, since the public desc names the click;
- 60 opened a mine at once;
- 299 saved to a file that will not restore ("needs trial and error");
- 234 made the next hint throw ("ran out of deduction").

One more route reached the same board with its start square lost: open, undo,
flag and unflag a square, save and load. The hint then opened `(-1,-1)`.

## What Changes

Undoing the first click un-lays the board. State 0 is the board the seed
describes, and the layout belongs to the state the first click made, laid out
from the seed and that square, the same for the same square every time.

- **The layout is on the state.** `MinesState` holds `mines` and the square it
  was laid out around; a board not laid out yet holds the seed, which is never
  advanced. The shared mutable `MineLayout` box is gone, and `executeMove` is
  pure.
- **The first click is its own move, and it carries its layout.** `begin`
  holds the square and the board laid out around it. The move is built where a
  move is interpreted (and by the hint), and executing it generates nothing.
  This is what keeps a save true when the generator changes: a save is the
  seed's desc and a move log, and the log's first move is the board. An open
  that brings no layout is refused on a board not laid out.
- **The game ID follows the position.** `Game.supersededDesc` answers a desc
  for the state it is given, or `null` for the desc the board started from,
  and the midend asks it of the state in play. It returned a pair, and the
  midend kept both once set; the private half is now simply the desc the board
  started from, which the midend already has.
- **A save's envelope is unchanged.** `desc` is the board in play, and
  `privDesc` the desc state 0 is rebuilt from where that differs. For Mines
  the private desc is now the seed's, where it was the layout alone.
- **The `restart` hint rung, `say.restart` and the renderer's "start here"
  cross are gone**: they existed for the board this removes, and Mines'
  `unreached` is empty.

### What it costs

- **A player can pick among the boards one seed gives**, by undoing the first
  click and opening elsewhere. Nothing in the app counts or rewards a board.
  The spec said a player SHALL NOT obtain a new board by undoing; it now says
  the reverse.
- **A layout with no first square loads as a game ID**, as a board not laid
  out yet whose first click lays out afresh. It was refused in
  `work-down-the-unreached-hint-rungs` as a board needing a guess, which it no
  longer is. Nothing hands such an ID out except an older save undone to its
  start.

### Saves written before this

They hold the layout alone as `privDesc` and opens that bring no layout. They
restore: the layout alone reads as a board not laid out that keeps the layout
for the first open replayed onto it (`MinesState.orphan`), with a seed made
from the layout for any square the player opens instead. Saved again, from any
position, they restore again, and replay as they did: a restart logged before
the first open goes to the start of the history, as it went.

## Hints to pull in

None.

## What shows it worked

`mines.test.ts`, "opening a different first square after an undo strands
nothing": every other square of three 9x9 deals, through the midend (240
first clicks after an undo). Each names its own square in the ID, opens no
mine, and saves to a file that restores, which `loadVerdict` grants only to a
board the hint finishes. Mines' `unreached` is empty, and "a save written when
the layout was the save's own still restores" holds the older format.
