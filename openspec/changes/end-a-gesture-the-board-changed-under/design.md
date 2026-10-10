# Design

Written 2026-10-10 when the change was filed. Nothing here has been tried.

## Context

`Midend.stateReplaced(prev, next)` is the one place every board change goes
through: a move, an undo, a redo, a restart, a hint's move, Solve, a load. It
sets `this.press = null`, ends every `GridDrag` the `Ui` carries, and calls
the game's `changedState`. `cancelPress` is the midend's answer to a press
the frontend takes back (a second finger, a lost pointer): it returns the
game to how it was before the press, and the game hears nothing of it
(`engine-input`, "A game hears nothing of a cancel").

## To settle first

1. **A board change the gesture itself made is not a change under it.** A
   drag that marks as it goes makes moves, each through `stateReplaced`, and
   must carry on (`engine-input`, "One drag is one step of Undo"). What ends
   a gesture is a change that did not come from that gesture's own input.
   Find how the midend can tell: it knows which call it is in.
2. **What ending is.** The candidates: the cancel that exists, so that the
   `Ui` is as it was before the press (and a move the drag already made
   stays, since the board change that ended it came after); or leaving the
   `Ui` and only dropping the rest of the gesture's events. The first leaves
   no preview painted by construction. Check what `cancelPress` restores for
   a game whose `Ui` holds more than the drag (a cursor, a pencil mode).
3. **The rest of the gesture.** After the end, drags and the release of that
   pointer still arrive from the frontend. They reach no game until the next
   press. Check the frontend's part: `engine-input`, "A canceled press leaves
   the game as it was before the press" and its neighbors say what the
   gesture layer already does on a cancel.
4. **The games' own clearing.** With the engine ending every gesture, a
   `changedState` that clears a drag does nothing more. Leave them; list
   them in the guide as no longer needed, so a port does not copy one.

## The guard

The sweep that measured this is the guard: for every registered game, each
of the probe's presses and drags, then a board change under it (an undo of a
move made before the press, and a redo), then the rest of the drag and the
release. It asks two things: no move was made after the change, and the
frame after the release is the frame of that board with a fresh gesture. It
must find the twelve games and the engine's sweep before the midend changes,
pinned as its positives, and none after. It must also reach the gestures the
first sweep skipped, whose press already makes a move.
