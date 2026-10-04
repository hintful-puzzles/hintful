# Rectangles

Draw lines along the grid edges to divide the grid into rectangles,
so that each rectangle contains exactly one numbered square and its
area is equal to the number written in that square.

## Controls

Click and drag from one grid corner to another, or from one square
center to another, to draw a rectangle. You can also drag along a
grid line to just draw a line at a time, or just click on a single
grid edge to draw or erase it.

While you drag, the status line shows the size of the rectangle.
Drawing a rectangle also clears any lines inside it. Right-drag across
an area to clear the lines inside it without drawing its outline.

With the keyboard, the arrow keys move a cursor from square to square.
Press Enter to start a rectangle at the cursor, move the cursor, and
press Enter again to draw it; use Space in place of Enter to clear the
lines inside the area instead. Escape abandons a rectangle you have
started.

## Hints

**Hint** explains the next rectangle rather than simply drawing it, and
says why no other will do. It reads only what is on the board: the
numbers and the lines you have drawn, so it carries on from wherever you
are; if one of your lines is wrong, it asks you to fix the highlighted
mistakes first.

{{hint-marks}}

A number's **fits** are the rectangles of its size that contain it, stay
on the board, take in no other number and cross none of your lines. These
are the ideas the hint teaches, from the plainest up:

* **Only one fit.** When every other rectangle would run off the board,
  take in another number or cross a line, the one left is the number's.
* **Only one number can reach a square.** Every square belongs to some
  rectangle, so when only one number has a fit covering a square, that
  number's rectangle covers it, which may leave it one fit.
* **Squares another number is sure to cover.** When every fit of one
  number covers the same squares, no other number can use them.
* **Leaving no room.** A fit that would leave another number nowhere to
  go, or leave a square that no rectangle could cover, is ruled out.
* **A line no rectangle can cross.** When the only fits across an edge
  are ruled out, for taking a square another number is sure to cover or
  for missing a square no other number can reach, the squares beside it
  are in different rectangles, so the edge must be a line. Drawing it
  keeps what you worked out: a fit that crosses a line no longer counts.

## Rectangles parameters

{{parameters}}
