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

## Rectangles parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares.</dd>
	<dt>Expansion factor</dt>
	<dd>How much the board is stretched after it is built. The generator first divides a smaller grid into rectangles and then widens it to full size by stretching rows and columns at random, so a larger factor gives fewer, larger rectangles. 0 means no stretching.</dd>
	<dt>Ensure unique solution</dt>
	<dd>When enabled, the numbers are placed so the puzzle has exactly one solution. When disabled, the puzzle may have several, and any division that satisfies the numbers counts.</dd>
</dl>
