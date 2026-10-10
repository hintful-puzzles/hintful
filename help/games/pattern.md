# Pattern

Shade some of the squares in the grid, so that the numbers in each row
and column match the lengths of its consecutive runs of shaded squares.
A shaded square holds a {{pair:0}} square.

## Controls

{{controls}}

A square you know is not shaded can be marked clear, with a cross; a
square with nothing in it is one you have not decided yet.

Drag along a row or column to give every undecided square on it what
the first square turned into. A drag whose first square turns back to
undecided erases instead, and it erases a whole rectangle, not just a
row or column. Hold Ctrl while moving the cursor to shade undecided
squares as you go, Shift to mark them clear, and both to return any
square to undecided. Like a drag, Ctrl or Shift alone leaves a square
you have already marked as it is.

## Hints

**Hint** explains the next step rather than simply making it. Each step
works along one row or column at a time, from its numbers and the
squares you have already marked {{pair:0}} or clear, so it carries on
from wherever you are, as long as none of those is wrong; if one is, it
asks you to fix the highlighted mistakes first. Its sentences call a
square a *cell*.

{{hint-marks}}

A few ideas are worth learning by name:

* **Overlap.** A run that can slide only a few cells along its line
  always covers the cells in the middle of its range, so they must be
  {{pair:0}}. A run with nowhere to slide covers all of them.
* **Out of reach.** A cell no run can reach in its line must be clear.
* **Every fit agrees.** Try every way a line's runs can fit around what
  is already marked: a cell that comes out the same in all of them is
  settled.

On an Unreasonable board there comes a point where no row or column
settles another cell on its own, and the hint says that nothing further
follows by deduction instead of choosing for you. Save your position,
try a cell, and it carries on from whatever you mark.

## Pattern parameters

{{parameters}}
