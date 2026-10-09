# Design: how a cancel reaches a game

## What was measured (2026-10-09)

`canceledPresses` in `src/engine/testing/input-probe.ts` presses every probe
point with each button, cancels it as the view did (a drag and a release at
(-100, -100)), and compares the board and the `Ui` with what the midend held
before the press. It does the same after a drag to each neighboring tile, on
the opening board and on a board played on.

Held to "what it was before the press", the old cancel left something behind
in 55 of the 57 games: every game but Sokoban and Slide's unmoved case. The
ten games the triage's survey flagged were the ones where a cancel differs
from a click. This probe asks the question the proposal asks, and three kinds
of leftover answer it:

- **The press itself acts.** Loopy, Net, Slant, Mosaic, Light Up and the other
  click games make their move on the press, so a canceled press had already
  moved. Fifteen and Flood slide and fill on it.
- **The press selects.** Solo, Keen, Towers and the other keypad games move
  the highlight on the press; Boats, Tents and Rect open a drag.
- **The synthesized drag commits.** Galaxies, Bridges, Pattern, Untangle,
  Tracks, Sticks and the rest of the triage's list: the drag to the corner is
  taken as a drag there.

The same was seen in Chrome, with a mouse press and Escape, over every game
(`tasks.md` 1.2).

## The decision: the engine puts back what it saved at the press

At a pointer press the midend keeps a copy of the `Ui` and its place in the
history. `Midend.cancelPress` puts both back. No game hears about a cancel at
all.

What each option asks of a game, at 57 games and at hundreds:

| Option | What a game writes | What goes wrong |
| --- | --- | --- |
| A button code (`POINTER_CANCEL`) | An arm in `interpretMove` that undoes whatever its press and drag put in the `Ui` | Every game with a press decides what to reset, and a game that forgets a field, or acts on the press, is wrong silently. A move the press already made cannot be taken back from `interpretMove` at all. |
| A hook (`Game.cancelPress(ui)`) | The same reset, in a second place | As above, and a game without the hook is not told apart from a game with nothing to reset. |
| The engine restores | Nothing | The engine has to be able to copy a `Ui`. |

The third is the only one in which a porter makes no decision, and the only
one that covers a press that acts on the press. A `Ui` is small and plain: over
all 57 games it is at most five objects, and holds nothing but plain objects,
arrays, typed arrays, one `Set` and `GridDrag`s. `copyUi` keeps prototypes
(the engine finds a `GridDrag` by `instanceof`) and refuses, by name, an
object it could not copy correctly, so a future `Ui` that holds one fails the
cross-game guard on the day it is written.

## What a cancel puts back

- **The `Ui`**, in place, as it was just before the press.
- **The history**: the moves the gesture made (a press that acts, a sweep's
  marks) are gone, and the moves that were ahead of the press for Redo are
  back. `record` builds new arrays on every move, so the arrays saved at the
  press are still the ones the press saw.
- **Not the hint.** A gesture whose move was taken back drops the stored plan,
  as Undo does. A gesture that made no move leaves the hint as the gesture
  left it.
- **Not the timer**, and not `helped` or `cheated`: none is changed by a
  pointer gesture.

## When there is nothing to put back

The saved press is the gesture's, and is dropped when anything but the
gesture's own pointer events replaces the state or writes the `Ui` from
outside: Undo, Redo, a new board, a restart, Solve, a hint step, a key that
makes a move, a preference. The engine has by then ended every `GridDrag`
(`stateReplaced`), and a cancel after it changes nothing. It is also dropped
at the release, so a cancel with no press open is a no-op.

## What the games lose

The two guards the triage added read a drag at a negative coordinate as a
cancel. With no drag sent, each only stops a real drag that leaves the board by
its top or left edge before it has moved, which the bottom and right edges
never did. Both are removed, and with them the requirement text that describes
the synthesized drag. The shared sweep drag (`sweepTo`) had the same test for
the same reason, and loses it too: a drag off the left edge now marks what it
passed, as one off the right always did.

A sweep is kept beside the `Ui`, in a `WeakMap` keyed on it, so `cancelPress`
ends it by name. It is the one piece of gesture state the engine holds outside
the `Ui`, and the guard reads it.

Sokoban's "a drag off the board aims at nothing" is about a real pointer and
stays.
