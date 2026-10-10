# Design

## Context

`Midend.stateReplaced(prev, next)` is the one place every board change goes
through: a move, an undo, a redo, a restart, a hint's move, Solve, a load. It
sets `this.press = null`, ends every `GridDrag` the `Ui` carries, and calls
the game's `changedState`. `cancelPress` is the midend's answer to a press
the frontend takes back (a second finger, a lost pointer): it returns the
game to how it was before the press, and the game hears nothing of it
(`engine-input`, "A game hears nothing of a cancel").

## Decisions

### 1. A change is the gesture's own when it is made inside `processInput`

The midend knows which call it is in. A board change made while
`processInput` is handing an input to the game came from the player's input;
every other one (Undo, Redo, a restart, Solve, a hint's move, a load, a new
board) came from outside it. One flag, set for the length of `processInput`,
tells `stateReplaced` which.

**A key's move counts as input, and does not end the gesture.** A key arrives
through `processInput` too, and a key typed while a pointer is down is a real
way to play: `pressNoteTakingCell` moves the highlight on the *press*, so a
player who holds a cell with one thumb and taps a digit with the other enters
that digit in the held cell. Ending the gesture there would put the `Ui` back
to before the press (decision 2), and the highlight would jump back to the
cell it was on before. The engine cannot tell that press, whose `Ui` write is
a selection the key acts on, from a drag whose `Ui` write is a preview the
key invalidates: both are a press that wrote the `Ui`. So a key's move keeps
what it does today: it drops the open press, so a later cancel changes
nothing, and the gesture goes on. What that leaves is measured in
"What a key's move under a drag leaves" below. The other rule was planted
(`inInput` set for pointer events only) and the guard's key test failed on
Crossing: the highlight was back at the corner, hidden.

### 2. Ending puts the `Ui` back to before the press, and keeps the moves

The `Ui` is restored from the copy the midend took at the press, as a cancel
restores it, so no preview of the gesture is left whatever fields a game
keeps one in. The history is *not* put back: a move the gesture made before
the change stays, since the change came after it and was made of that board.

A `Ui` holds more than the gesture: a count kept from the boards it has seen
(a `changedState` that reads `prev` and `next`). The copy from before the
press was never told of the gesture's own moves. So after the restore the
game's `changedState` is called with the board at the press and the board
the gesture left, where those differ, and then with the change itself as it
always is. The `Ui` is then the one a player would hold who had made the
same moves and no gesture.

What `changedState` cannot rebuild from two boards it does not get back: a
`Ui` write that `interpretMove` ties to the move through a flag (Inertia's
death tally through `justMadeMove`, Black Box's error count through
`newmove`). A press that kills the ball, held, then Undo, leaves the tally
uncounted. A cancel of that press already does the same (Escape with the
pointer down), so no new way to lose a count is opened, and the Undo takes
the move back as well.

Leaving the `Ui` and only dropping the rest of the gesture's events was the
other candidate. It leaves a preview on screen with no release ever arriving
to clear it, in every game that holds one in fields of its own.

A board that starts fresh (`startFrom`) has a new `Ui`, and nothing is
restored onto it.

A press the midend no longer holds (a preference written, or a key's move,
after the press) cannot be restored. The gesture is still ended, its
`GridDrag`s and its sweep with it, and the rest of its events dropped.

### 3. The rest of the gesture is dropped in the midend

The view goes on tracking the pointer and sends its drags and its release.
The midend drops a drag or a release of an ended gesture: they reach no game,
and the next press opens a new one. The view needs no change, and a cancel
arriving for an ended gesture finds no press open and changes nothing
(`engine-input`, "A cancel with no press open changes nothing").

### 4. The games' own clearing

With the engine ending every gesture, a `changedState` that clears a drag
does nothing more for this. They are left, and `docs/games/input.md` says a
port writes none.

## The guard

`changedUnder` in `src/engine/testing/input-probe.ts`: for every registered
game, each probe point pressed with each button, held or dragged to each
neighboring tile; then an Undo, or a Redo of a move undone before the press;
then a drag a tile further on, a drag back, and the release. It asks that
nothing after the change made a move, and that the `Ui` is the one from
before the press told of the same boards, when the change lands and after
the release. Where the `Ui` differs it paints both, and says whether the
frame shows it. The board is played on first, lightly and then all over, by
clicks, drags of one tile and of two, an arrow and a typed key, since a game
with no move in its history has nothing to undo (ABCD, Pegs and Sokoban had
none until the keys and the longer drag were added).

Measured 2026-10-10, 57 games. With the midend's new branch switched off the
guard named 32 games whose gesture carried on: every game of the proposal
(Sixteen, Galaxies, Spokes, Map, Bricks, Clusters, Pearl, Rome, Sticks,
Signpost, Group, Inertia, Tracks), and Ascent, Black Box, Dominosa, Light Up,
Loopy, Magnets, Mines, Mosaic, Palisade, Range, Separate, Singles, Slant,
Sokoban, Subsets, Towers, Undead, Unequal and Unruly, most of them a sweep
that went on marking after its own first mark was undone. Inertia's was a
throw ("the ball is dead"). With the branch on it names none. Gestures the
board was changed under ran from 168 (Flood) to 7960 (Map) a game, 145,873 in
all, and the guard requires that in twenty games or more some had made a move
of their own first. It costs about
six seconds; against the unfixed midend, which paints for every difference,
about seventy.

## What a key's move under a drag leaves

Measured the same day by a scratch sweep, not kept: a left press dragged a
tile, then each arrow, Enter and two keypad keys, then the drag again and
the release. A key moved the board under a held drag in 22 games. In three
the release then made a move: Group (a row or column drag, which names fixed
positions and is still what the player aimed), Sokoban (its `changedState`
has cleared the grab, and the drag event walks as a drag does) and Inertia
(the drag re-aims as it does with no key). None is a move aimed at a board
that is gone, so nothing was filed.

## In the app

Chrome, 2026-10-10, by mouse, in Sixteen, Spokes, Map, Galaxies and Tracks:
a move, a press and drag, Cmd+Z with the button down, the drag carried on,
the release. Each time the preview left the frame at the Undo, the counter
read "Move 0 of 1" after the release, and Redo brought the move back. By
touch (a phone-sized context, CDP touch events) in Sixteen, with the Undo
button pressed while the finger was down: the same. A second finger's own
tap on Undo could not be emulated: the synthetic second touch ended the
first finger's drag before the button saw a click.
