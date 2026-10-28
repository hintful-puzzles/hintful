# Skeleton

You have a grid of squares with walls between some of them. Draw one loop
that runs from square to square through the middles of the squares, never
diagonally, passes through every square once, and never crosses a wall. So
every square takes two lines, one in and one out, and the loop may close only
once it has passed through every square.

Every puzzle has exactly one solution, and none needs a guess.

## Controls

Drag from square to square to draw a line along the edges you pass. A drag
only adds: passing back over a square it has already drawn through does
nothing, and it carries on once you return to where it reached. Undo takes
a stroke back. A drag along a line you
have drawn and on past its end carries that line on, and a drag that runs
only along lines you have drawn takes them up. A line stops where it would
give a square more than two lines, or at a wall or an edge you have crossed
out. You can also click near the edge between two squares to draw or remove a
line there.

Right-click an edge to cross it out, to mark that you are sure no line goes
there, and keep the button down and drag to cross out every edge you pass.
Right-click it again to clear the cross. You never need to cross anything out
to finish.

The keyboard can also be used. The arrow keys move a cursor. Press Enter to
start a line, move the cursor along the way you want it, and press Enter
again to draw it; Space, Escape, Backspace or Delete abandons it instead.
Holding Ctrl while pressing an arrow key draws or removes the line in that
direction and moves along it, holding Ctrl and Shift together does the same
without moving, and holding Shift alone crosses out or clears the edge in
that direction.

A line turns red when it closes a loop that leaves some squares out.

## Hints

**Hint** explains the next step rather than simply making it. It reasons only
from the walls and the lines and crosses you have drawn, so it carries on
from wherever you are, as long as none of those is wrong; if one is, it asks
you to fix the highlighted mistakes first.

{{hint-marks}}

An edge beside a square that already has its two lines can never take
another, and neither can an edge whose line would close a loop that leaves
some squares out. The hint counts these as closed without asking you to cross
them out, as it does a wall, and most steps are then one rule at work: a
square with only as many open edges left as it still needs lines takes a line
on each of them.

On Normal boards a step sometimes looks at what a line would do, drawing it
thin. A line breaks the board if it leaves a square a dead end or cut off, or
closes a loop too soon. An edge whose line would break the board is crossed
out, and a square with three open edges left takes the third if lines on the
other two would break the board.

## Skeleton parameters

{{parameters}}
