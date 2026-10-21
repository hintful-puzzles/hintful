# Path

You have a grid of squares, some of which hold a number. Every number appears
on exactly two squares. Join each pair of like numbers with a line running
from square to square through the middles of the squares, never diagonally.
Lines may not cross or branch, so every square takes two lines (one in, one
out) except a numbered square, which takes one. Every
square must be used: the puzzle is solved when every pair is joined and no
square is left empty.

Every puzzle has exactly one solution, and none needs a guess.

## Controls

Drag from square to square to draw a line along the edges you pass. Dragging
back the way you came takes the line back up again, and a drag that starts
along a line you have drawn takes lines up instead of drawing them, until it
reaches an edge with no line. A line stops where it would give a square more
lines than it takes, or where you have crossed the edge out. You can also
click near the edge between two squares to draw or remove a line there.

Right-click an edge to cross it out, to mark that you are sure no line goes
there, and keep the button down and drag to cross out every edge you pass.
Right-click it again to clear the cross. You never need to cross anything
out to finish.

The keyboard can also be used. The arrow keys move a cursor. Press Enter to
start a line, move the cursor along the way you want it, and press Enter
again to draw it; Space, Escape, Backspace or Delete abandons it instead.
Holding Ctrl while pressing an arrow key draws or removes the line in that
direction and moves along it, and holding Shift crosses out or clears the
edge in that direction.

Each pair of numbers has a color, ringing both its numbers, and a line takes
that color once it reaches one of them, while a line that reaches no number
yet has none. Colors repeat on a board with more pairs than colors, and the numbers
tell those pairs apart. A line turns red when it breaks the rules already:
when it joins two different numbers, or closes into a loop. A pair's two
discs fill with its color once a line joins them.

## Where the puzzle comes from

The puzzle is Nikoli's *Numberlink*, also published as *Arukone*, and played
by many as *Flow Free*. Simon Tatham wrote a generator for it but never a
game; this one fills every square, as Flow Free does.

## Hints

**Hint** explains the next step rather than simply making it. It reasons only
from the numbers and the lines and crosses you have drawn, so it carries on
from wherever you are, as long as none of those is wrong; if one is, it asks
you to fix the highlighted mistakes first.

{{hint-marks}}

An edge beside a square that already has all its lines can never take
another, and neither can an edge whose line would join two different
numbers, whether the numbers sit beside it or lines lead to them from it. The
hint counts all of these as closed without asking you to cross them out, and
most steps are then one rule at work: a square with only as many open edges
left as it still needs lines takes a line on each of them.

On Normal boards a step sometimes has to look ahead. It supposes a line on an
edge, or a cross, and follows that rule from it, numbering each square's
edges as it settles them, until a square is left a dead end or cut off, gets
too many lines, or a loop closes. Then the edge must be the other way.

## Path parameters

{{parameters}}
