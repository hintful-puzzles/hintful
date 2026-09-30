# Pattern

Fill in the grid with a pattern of black and white squares, so that
the numbers in each row and column match the lengths of consecutive
runs of black squares.

## Controls

{{controls}}

Drag along a row or column to give every gray square on it what the
first square turned into. A drag whose first square turns back to gray
erases instead, and it erases a whole rectangle, not just a row or
column. Hold Ctrl while moving the cursor to paint black squares as you
go, Shift to paint white ones, and both to return them to gray.

## Hints

**Hint** explains the next step rather than simply making it. Each step
works along one row or column at a time, from its numbers and the
squares you have already marked black or white, so it carries on from
wherever you are, as long as none of those is wrong; if one is, it asks
you to fix the highlighted mistakes first. Its sentences call a square a
*cell*.

{{hint-marks}}

A few ideas are worth learning by name:

* **Overlap.** A run that can slide only a few cells along its line
  always covers the cells in the middle of its range, so they must be
  black. A run with nowhere to slide covers all of them.
* **Out of reach.** A cell no run can reach in its line must be white.
* **Every fit agrees.** Try every way a line's runs can fit around what
  is already marked: a cell that comes out the same in all of them is
  settled.

## Pattern parameters

{{parameters}}
