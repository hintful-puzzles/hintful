# Unruly

Color every square either black or white, in such a way that:

- no three consecutive squares, horizontally or vertically, are
  the same color
- each row and column contains the same number of black and white
  squares.

With **Unique rows and columns** switched on (from ‘Custom type…’ on the
‘Type’ menu), no two rows may be the same, and no two columns.

## Controls

Left-click in an empty square to turn it black, or right-click to turn
it white. Click again in an already-filled square to cycle it between
black and white and empty; middle-click to reset any square to empty.

With the keyboard, the arrow keys move a cursor around the grid. Enter
cycles the square under it the way a left-click does, and Space the way a
right-click does. You can also press 1 for black, 0 or 2 for white, and
Backspace or Delete to empty the square.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the squares already colored, so it carries on from wherever you
are, as long as none of them is wrong; if one is, it asks you to fix the
highlighted mistakes first.

{{hint-marks}}

The hint uses four ideas:

* **No three in a row.** Where two of three squares in a line are already
  the same color, the third must be the other one.
* **A full quota.** A row or column that already holds all its black
  squares must be white everywhere else, and the other way round.
* **The last one has few places to go.** When a row or column needs just
  one more of a color, and every place but the outlined squares would force
  three of the other color together, the rest of the line is the other
  color.
* **No two lines alike**, when *Unique rows and columns* is switched on
  in ‘Custom type…’. When the outlined row already holds all its black squares,
  and the striped row holds all but one of its own in the same places, putting
  the last one where the outlined row has its remaining black would make the
  two rows identical, so that square must be white (and the same with the
  colors swapped, or with columns).

When one idea settles several squares at once, the hint walks through
them one at a time as a single step.

## Unruly parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. Both must be even, and at least 6.</dd>
	<dt>Difficulty</dt>
	<dd>How hard the reasoning the puzzle needs may be (<a href="../features#difficulty">what the names mean</a>).</dd>
	<dt>Unique rows and columns</dt>
	<dd>Adds the rule that no two rows may be the same, and no two columns. There are only so many different rows of a given width, so this limits how tall the grid can be for its width, and the other way round: a grid 6 squares wide can be at most 14 high, and one 8 wide at most 34.</dd>
</dl>
