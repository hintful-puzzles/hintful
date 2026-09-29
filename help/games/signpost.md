# Signpost

Connect all the squares together into a sequence, so that every
square's arrow points towards the square that follows it (though the
next square can be any distance away in that direction).

## Controls

Left-drag from a square to the square that should follow it, or
right-drag from a square to the square that should precede it.

Left-drag a square off the grid to break all links to it. Right-drag
a square off the grid to break all links to it and everything else
in its connected chain. (A chain that already runs into one of the
given numbers is not broken up this way: only the square you dragged
loses its links.)

The keyboard can also be used. The arrow keys move a cursor. Press
Enter on a square, move to the square that should follow it and press
Enter again to link them; Space does the same the other way round,
starting from the square that should come second. X breaks all links
to the square under the cursor, and Shift+X breaks up its whole chain
as a right-drag off the grid does.

## Hints

**Hint** explains the next link rather than simply making it, and says
why no other link will do. It works from the links you have already made,
so it carries on from wherever you are; if one of them is wrong, it asks
you to fix the highlighted mistakes first.

{{hint-marks}}

These are the ideas the hint teaches, from the plainest up:

* **Consecutive numbers.** When a number's arrow points at the square
  holding the next number, the two must be linked.
* **Only one square can come next.** Of the squares an arrow points at,
  every one but one may be ruled out: it already follows another square,
  it is in the arrow's own chain (linking them would close a loop), or it
  holds the wrong number. The one left must follow the arrow.
* **Only one arrow can lead in.** Every square but the first needs a square
  before it, and when every arrow pointing at a square but one is ruled
  out the same way, that one must lead into it.

## Signpost parameters

{{parameters}}
