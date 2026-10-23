# Pearl

Draw a single closed loop by connecting together the centers of
adjacent grid squares, so that some squares end up as corners, some as
straights (horizontal or vertical), and some may be empty. Every
square containing a black circle must be a corner not connected
directly to another corner; every square containing a white circle
must be a straight which is connected to *at least one* corner.

## Controls

Drag from square to square to draw the loop along the edges you pass.
A drag only adds: passing back over a square it has already drawn through
does nothing, and it carries on once you return to where it reached, while
dragging back onto the square you started from closes the loop. Undo takes
a stroke back. A drag
along a stretch of loop you have drawn and on past its end carries that
stretch on, and a drag that runs only along lines you have drawn takes
them up. A line stops where it would give a square a third line, or
where you have crossed the edge out. You can also click near the edge
between two squares to draw or remove a line there.

Right-click an edge to mark it with a cross indicating that you are
sure the loop does not go through it, and keep the button down and
drag to cross every unmarked edge you pass over.

The keyboard can also be used. The arrow keys move a cursor. Press
Enter to start drawing, move the cursor along the path you want (moving
back along it takes a step back), and press Enter again to draw or undraw
it; Space, Escape, Backspace or
Delete abandons the path instead. Holding Ctrl while pressing an arrow
key draws or undraws the line in that direction and moves along it,
holding Ctrl and Shift together does the same without moving, and
holding Shift alone marks or unmarks a cross on that edge.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the lines you have drawn, the edges you have crossed out and the
pearls, so it carries on from wherever you are, as long as none of those is
wrong; if one is, it asks you to fix the highlighted mistakes first.

{{hint-marks}}

Most steps are the rules at work. A square the loop enters has to be left by
another edge, and a square with nowhere else to go stays empty. A black pearl
turns, so of each two opposite edges it uses exactly one, and its line then
runs straight through the next square on both sides. A white pearl runs
straight through, so it takes both edges on one side-to-side or up-and-down
line, and its loop must turn in a square beside it.

A few are worth learning, because they settle a pearl from farther away:

* If the square past a black pearl can't carry its line straight on (it
  holds another black pearl, already has a line leading off to the side, or
  is blocked on its far side), the black pearl can't go that way.
* If neither square beside a white pearl along one line could turn into it,
  it must run the other way.
* If a white pearl's line already runs straight on through the square on one
  side, it must turn in the square on the other.
* On harder boards: **the loop is one loop**. An edge that would join the two
  ends of a stretch of loop into a closed circle, while some pearl is still
  outside it, can't be part of the loop.

A square that already has its two lines needs no crosses on its other edges,
so the hint never asks you to draw them, and it counts such an edge as
closed when it reasons.

## Pearl parameters

{{parameters}}
