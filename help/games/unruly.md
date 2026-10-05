# Unruly

Color every square either black or white, in such a way that:

- no three consecutive squares, horizontally or vertically, are
  the same color
- each row and column contains the same number of black and white
  squares.

One setting adds a rule: **Unique rows and columns**, from ‘Custom
type…’ on the ‘Type’ menu. A board's name says when it is on:

{{modifiers}}

## Controls

{{controls}}

Clicking a filled square again moves it on round black, white and empty,
and a right-click goes round the other way. You can also press 1 for
black, and 0 or 2 for white.

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

{{parameters}}
