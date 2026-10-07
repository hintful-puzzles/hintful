# Mosaic

Decide every square: it either holds a {{pair:0}} square or is clear.
Each number indicates how many {{pair:0}} squares are in the 3×3 square
surrounding the number – *including* the clue square
itself.

A square you have made clear carries a small dot, which tells it from a
square you have not decided yet; the dot moves to the corner where the
square has a number. A number is drawn on top
of whatever its square holds, and fades once its 3×3 square is fully
decided and agrees with it.

## Controls

{{controls}}

Drag along a row or column to give every empty square you pass over
the state the first square took.

## Hints

**Hint** explains the next step rather than simply making it. It
reasons only from the numbers and the squares you have already made
{{pair:0}} or clear, so it carries on from wherever you are, as long as
none of them is wrong; if one is, it asks you to fix the highlighted
mistakes first. A number's *squares*, in its words, are its block: the
number's own square and the eight around it, fewer at the edge of the
grid.

{{hint-marks}}

Every step is one of two ideas:

* **A number that has all its {{pair:0}} squares** makes the rest of its
  block clear.
* **A number with only as many squares left that are not clear as it
  needs** makes all of those {{pair:0}}.

## Mosaic parameters

{{parameters}}
