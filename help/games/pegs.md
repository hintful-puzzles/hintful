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
one peg and shows you its first jump. Alongside it, the hint compares that
jump with the other jumps you could make, because telling a jump that can
still finish from one that cannot is what winning at Pegs takes.

{{hint-marks}}

The first thing to look for is a peg cut off: one with no peg beside it,
and nowhere a peg could ever land beside it. A board with a cut-off peg can
never finish with one. So when some other jump would cut a peg off, either
straight away or whatever you jump next, the hint stripes that jump and
outlines the peg it would strand.

Otherwise, a hint may show a **package**: a short run of jumps that clears
a row or column of three, or a block of two by three, and puts every
other peg back where it was. For three in a line, a spare peg beside one
end can jump across the line into an empty hole, the line's far peg jumps
in, and the spare jumps back to where it began. Learning these shapes is
how to
clear a board one area at a time. A package is one hint, shown a jump at a
time.

When the search has checked the other jumps, the hint says what it found.
It draws an arrow on each other jump that can still finish, and when it
checked every jump it says that only those can. When every jump can still
finish, which is usual early in a game, it says that too. In the middle
of a game on the larger boards there are often too many ways to go for the
search to check every jump quickly, and then the hint makes no claim about
the jumps it did not settle.

The hint refuses when there is nothing to search for: if a peg is
already cut off, or the search proves no line of jumps from here leaves
one peg, it asks you to undo. On the larger boards a position can also
be too far from any finish for the search to settle, and the hint says
so; *Show solution…* then shows a finish from the board as it was dealt.

## Pegs parameters

{{parameters}}
