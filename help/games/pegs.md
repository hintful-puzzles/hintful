# Pegs

Jump one peg over another to remove the one you jumped over. Try to
remove all but one peg.

## Controls

Drag a peg into an empty space to make a move. The target space must
be exactly two holes away from the starting peg, in an orthogonal
direction, and there must be a peg in the hole in between.

With the keyboard, the arrow keys move a cursor around the board. Press
Enter or Space on a peg to pick it up, then an arrow key to jump it in
that direction; press Enter or Space again instead to put it back down.

## Hints

**Hint** shows the next jump rather than making it. No jump in Pegs is
forced by logic, so the hint searches for a line of jumps that leaves
one peg and walks you along it, saying what it has checked about each
jump on the way.

{{hint-marks}}

When every other jump from here would leave a board that can no longer
finish with one peg, the hint says this is the only jump that can. When
some other jump would leave a peg cut off, where no peg could ever get
next to it again, it outlines that peg. A peg that keeps jumping is one
hint: the next jump shows as soon as you make the last.

The hint refuses when there is nothing to search for: if a peg is
already cut off, or the search proves no line of jumps from here leaves
one peg, it asks you to undo. On the larger boards a position can also
be too far from any finish for the search to settle, and the hint says
so; *Show solution…* then shows a finish from the board as it was dealt.

## Pegs parameters

{{parameters}}
