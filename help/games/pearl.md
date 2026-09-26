# Pearl

Draw a single closed loop by connecting together the centers of
adjacent grid squares, so that some squares end up as corners, some as
straights (horizontal or vertical), and some may be empty. Every
square containing a black circle must be a corner not connected
directly to another corner; every square containing a white circle
must be a straight which is connected to *at least one* corner.

Drag between squares to draw or undraw pieces of the loop.
Alternatively, left-click the edge between two squares to turn it on
or off. Right-click an edge to mark it with a cross indicating that
you are sure the loop does not go through it.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the lines you have drawn, the edges you have crossed out and the
pearls, so it carries on from wherever you are, as long as none of those is
wrong; if one is, it asks you to fix the highlighted mistakes first.

* **A blue line** from a square's center to its edge means the loop must go
  through that edge.
* **A blue cross** on an edge means it can't.
* **An outline** marks the squares the step reasons from: the pearl or square
  it is about, the squares beside a pearl, or a stretch of loop drawn so far.

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
