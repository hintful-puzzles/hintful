# Mosaic

Decide every square: it either holds a {{pair:0}} square or is clear.
Each number indicates how many {{pair:0}} squares are in the 3×3 square
surrounding the number – *including* the clue square
itself.

A square you have made clear carries a cross, which tells it from a
square you have not decided yet; the cross is small and in the corner
where the square has a number. A number is drawn on top
of whatever its square holds, and fades once its 3×3 square is fully
decided and agrees with it.

## Controls

{{controls}}

The drag works for clearing too: start on a shaded square and the
shaded squares you pass over are cleared with it. A whole drag is one
step of Undo.

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

On an Unreasonable board there comes a point where no number on its own
settles another square, and the hint says that nothing further follows by
deduction instead of choosing for you. Look first at two numbers whose blocks
overlap, which the hint does not do: the difference between them is all in
the squares only one of them counts, and when it is as large as it can be
those squares are settled. Failing that, save your position and try a square
beside a number with few squares left. The hint carries on from whatever you
mark.

## Mosaic parameters

{{parameters}}
