# Twiddle

Rotate square sections of the grid to arrange the squares into
numerical order starting from the top left.

When you master the basic game, go to the Type menu to try it with
larger rotating groups (for a 3×3 group you must click in the
center of a square to rotate the block around it). Or select the
'orientable' mode in which every square must end up the right way
round as well as in the right place. Or both!

## Controls

In the basic game, you rotate a 2×2 square section. Left-click
in the center of that section (i.e. on a corner point between four
squares) to rotate the whole section anticlockwise. Right-click to
rotate the section clockwise.

With the keyboard, the arrow keys move a cursor that outlines the block
it would turn. Enter turns that block anticlockwise and Space turns it
clockwise. The keys A, B, C and D turn the block in the top-left,
top-right, bottom-left and bottom-right corner anticlockwise, and
the capital letter (with Shift) turns it clockwise. On the numeric keypad, 7,
9, 1 and 3 turn the corner blocks, and 8, 2, 4, 6 and 5 turn the block
exactly halfway along an edge, or in the very center, where the grid
has one.

## Twiddle parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. Neither may be smaller than the rotating block.</dd>
	<dt>Rotating block size</dt>
	<dd>How many squares wide the block you turn is, at least 2. A block of even size turns about the corner point at its center, and an odd one about its center square; that is where you click.</dd>
	<dt>One number per row</dt>
	<dd>Every square in a row carries the same number, the row's own, so the puzzle is solved when each row holds only its own number and it doesn't matter which of those squares goes where.</dd>
	<dt>Orientation matters</dt>
	<dd>The 'orientable' mode: each square turns with its block, and must also end up the right way round.</dd>
	<dt>Number of shuffling moves</dt>
	<dd>How many random turns shuffle the grid. At 0 the game chooses a long shuffle; any other number shuffles exactly that many turns, and the status bar shows that number as your target beside the count of your moves.</dd>
</dl>
