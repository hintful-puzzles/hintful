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

The game ends with one peg, so every other peg has to be taken along the
way: **leave no peg stranded**. A peg is *stranded* when no peg is beside
it. It cannot jump, and nothing can take it until a peg lands next to it,
so you will have to go back for it. A peg is *cut off* when no peg can ever
land beside it again. A board with a cut-off peg can never finish with one.

So the first thing the hint looks for is a jump that would cut a peg off,
either straight away or whatever you jump next. It stripes that jump,
outlines the peg, and shows a jump that keeps the peg in reach. When the
striped jump and the suggested one start from the same peg, the suggested
jump is that peg going the other way.

Otherwise, a hint may show a **package**: a short run of jumps that clears
a row or column of three, or a block of two by three, and puts every
other peg back where it was. For three in a line, a spare peg beside one
end can jump across the line into an empty hole, the line's far peg jumps
in, and the spare jumps back to where it began. Learning these shapes is
how to clear a board one area at a time. A package is one hint, shown a
jump at a time.

When the search has checked the other jumps, the hint says what it found.
It draws an arrow on each jump that can still finish, the suggested one
among them, and when it checked every jump it says that only those can.
When every jump can still finish, which is usual early in a game, it says
that too. In the middle of a game on the larger boards there are often too
many ways to go for the search to check every jump quickly, and then the
hint makes no claim about the jumps it did not settle. It turns to stranded
pegs instead: a stranded peg the suggested jump goes back for, or another
jump that would strand a peg the suggested jump keeps company. Leaving no
peg stranded is a habit worth having rather than a rule. Sometimes the
winning line strands a peg for a while and comes back for it later.

The hint refuses when there is nothing to search for: if a peg is
already cut off, it outlines the cut-off pegs and asks you to undo, and
it asks the same when the search proves no line of jumps from here leaves
one peg. On the larger boards a position can also be too far from any
finish for the search to settle, and the hint says so; *Show solution…*
then shows a finish from the board as it was dealt.

**Check & save** asks the same question, since Pegs has no single answer
to check your jumps against: it won't save a position the hint would
ask you to undo from, and outlines any cut-off pegs. A position too far
from a finish for the search to settle is saved, and the check says it
couldn't tell.

## Pegs parameters

{{parameters}}
