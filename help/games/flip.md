# Flip

Try to light up all the squares in the grid by flipping combinations
of them. Pressing a square flips a group of squares, and which group
depends on the game mode. The Type menu has a section for each:

{{rulesets}}

## Controls

{{controls}}

In either mode, the diagram in each square indicates which other
squares will flip.

## Hints

Pressing a square twice undoes it, and the order of presses never
matters, so an answer is simply a set of squares to press once each.
**Hint** takes the answer with the fewest presses and works through it
left to right along the top row, then along the next row down. A square
it has gone past is never pressed again.

That order is what gives a press a reason. Once the hint has gone past
every other square that flips some dark square, the one square left is
the only one that can still light it, so it has to be pressed: *"Row by
row, only this square can still light the outlined square, so it must
be pressed. It flips the striped ones too."* With {{choice:ruleset:0}} this is the
square directly below a dark one, which is the whole method: get the top
row right and each row after it is settled by the row above.

{{hint-marks}}

A striped square is not part of the reason. The press flips it along
with the rest, and a square further on will set it right if it needs it.

The presses that come first, the top row's with {{choice:ruleset:0}}, have no reason
of that kind: a square further on could still undo whatever they change.
For those the hint says how many presses the board takes and that the
ringed square is one of them: *"The whole board can be lit in 5 presses,
and no fewer. One of them: press this square."* When only one set of
presses lights the board at all, it says so instead. And the last press
says that it is the last: *"Press this square: that lights the outlined
squares and finishes the board."*

## Flip parameters

{{parameters}}
