# Pattern

Fill in the grid with a pattern of black and white squares, so that
the numbers in each row and column match the lengths of consecutive
runs of black squares.

## Controls

Left-click in a square to mark it black; right-click (or hold Ctrl
while left-clicking) to mark it white. Click and drag along a row or
column to mark multiple squares black or white at once. Middle-click
(or hold Shift while left-clicking) to return a square to gray
(meaning undecided): dragging like that can erase a whole rectangle,
not just a row or column.

The keyboard can also be used. The arrow keys move a cursor. Enter
turns the square under it black, then white, then back to gray; Space
goes the other way round, white first. Hold Ctrl while moving to paint
black squares as you go, Shift to paint white ones, and both to return
them to gray.

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

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares.</dd>
</dl>
