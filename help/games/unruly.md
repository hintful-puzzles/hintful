# Unruly

Fill every square with one of two pieces, a {{pair:0}} square or a
{{pair:1}} disc, in such a way that:

- no three consecutive squares, horizontally or vertically, hold
  the same piece
- each row and column contains the same number of each.

The pieces the puzzle starts with sit on a lighter square, and cannot be
changed.

One setting adds a rule: **Unique rows and columns**, from ‘Custom
type…’ on the ‘Type’ menu. A board's name says when it is on:

{{modifiers}}

## Controls

{{controls}}

Clicking a filled square again moves it on round {{pair:0}}, {{pair:1}} and
empty, and a right-click goes round the other way. You can also press 1 for
{{pair:0}}, and 0 or 2 for {{pair:1}}.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the squares already filled, so it carries on from wherever you
are, as long as none of them is wrong; if one is, it asks you to fix the
highlighted mistakes first.

{{hint-marks}}

The hint uses four ideas:

* **No three in a row.** Where two of three squares in a line already hold
  the same piece, the third must hold the other one.
* **A full quota.** A row or column that already holds all its {{pair:0}}
  pieces must be {{pair:1}} everywhere else, and the other way round.
* **The last one has few places to go.** When a row or column needs just
  one more of a color, and every place but the outlined squares would force
  three of the other color together, the rest of the line is the other
  color.
* **No two lines alike**, when *Unique rows and columns* is switched on
  in ‘Custom type…’. When the outlined row already holds all its {{pair:0}}
  pieces, and the striped row holds all but one of its own in the same places,
  putting the last one where the outlined row has its remaining {{pair:0}}
  would make the two rows identical, so that square must be {{pair:1}} (and
  the same with the colors swapped, or with columns).

When one idea settles several squares at once, the hint walks through
them one at a time as a single step.

## Unruly parameters

{{parameters}}
