# undo-a-mines-first-click-to-the-seed

**Status: scaffolded, not started (2026-10-07).** Found in
`work-down-the-unreached-hint-rungs`, and filed on the owner's answer that day:
*"I want to drop undo. Can't we just undo to the same seed?"*

**How that was read, to be confirmed with the owner before building if any of
it looks wrong:** undoing the first click returns to the board before it was
laid out, and the square opened next lays it out again from the same seed. Undo
keeps working. The other reading, that Undo stops at the first click, was the
option offered and not taken.

## Why

A Mines layout is made to be finished from one square: the one first opened.
It then survives undo (`state.ts`'s shared `MineLayout`, upstream's device to
stop a player rerolling the board), so a player can undo the first click and
open a different square of a layout that was not made for it. Measured on
2026-10-07, on six ordinary 9x9 deals and every other square of each (480
first clicks after an undo):

- the game ID changed every time, since the public desc names the click;
- 60 opened a mine at once;
- 299 saved to a file that will not restore ("needs trial and error");
- 234 made the next hint throw ("ran out of deduction").

One more route reaches the same board with its start square lost: open, undo,
flag and unflag a square, save and load. The hint then opens `(-1,-1)`. The
route by a typed game ID was closed in `work-down-the-unreached-hint-rungs`.

## What Changes

Undoing the first click un-lays the board. State 0 is the board the seed
describes, and the layout belongs to the state the first click made, laid out
from the seed and that square, the same for the same square every time.

Read against the code before deciding the shape, as of 2026-10-07:

- `MineLayout` is shared by reference and `openSquare` is its one mutation
  site; `rs` is consumed and nulled there.
- `supersededDesc` answers a public desc and a private one, and the midend
  keeps both; a save rebuilds from the private one and replays the click.
  Whether a save should keep the seed's desc and replay the click from it is
  part of this, and is a save-format question: old saves must still load.
- The `restart` hint rung, `say.restart` and the renderer's "start here"
  cross exist only for the board this removes. `restart` is the last entry in
  Mines' `unreached`.
- `openspec/specs/mines` § "The first click is never a mine" says a player
  SHALL NOT obtain a new board by undoing, with a scenario. This reverses it:
  the cost is that a player can pick among the boards one seed gives, which
  nothing here counts or rewards.

## Hints to pull in

None.

## What would show it worked

The 480-click measurement above, run again, changes no game ID after the board
is laid out, strands no save and throws no hint; Mines' `unreached` is empty;
and a save written before this change still restores.
