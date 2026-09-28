# Net

Rotate the grid squares so that they all join up into a single
connected network with no loops.

Squares connected to the middle square are lit up. Aim to light up
every square in the grid (not just the endpoint blobs).

When this gets too easy, select a 'wrapping' variant from the Type
menu to enable grid lines to run off one edge of the playing area
and come back on the opposite edge!

## Controls

Left-click in a square to rotate it anticlockwise. Right-click to
rotate it clockwise. Middle-click, or shift-left-click if you have
no middle mouse button, to lock a square once you think it is
correct (so you don't accidentally rotate it again); do the same
again to unlock it if you change your mind.

On a touch screen, tap a square to rotate it anticlockwise, and hold
a finger on it to rotate it clockwise.

On the keyboard, the arrow keys move a cursor around the grid. A or
Enter rotates the square under it anticlockwise, D clockwise and F
half a turn, and S or Space locks or unlocks it. Ctrl and an arrow key
moves which square the network is lit from, and on a wrapping grid
Shift and an arrow key scrolls the whole grid. J jumbles every
unlocked square to a random rotation.

## Net parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. At least one of them must be more
	than 1.</dd>
	<dt>Walls wrap around</dt>
	<dd>When on, the network may run off one edge of the grid and come
	back on the opposite edge, so the outside of the grid is no longer a
	wall.</dd>
	<dt>Barrier probability</dt>
	<dd>A number from 0 to 1: the share of the places where the finished
	network has no wire that get a barrier drawn across them. At 0 there
	are no barriers inside the grid; at 1 every such place has one, which
	gives away a lot about the solution.</dd>
	<dt>Ensure unique solution</dt>
	<dd>When on, the puzzle has exactly one solution. When off, it may
	have several, and any of them counts. A wrapping grid 2 squares wide
	or high can never have just one solution, so it needs this
	off.</dd>
</dl>
