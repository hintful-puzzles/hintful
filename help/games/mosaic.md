# Mosaic

Color every square either black or white.
Each number indicates how many black squares are in the 3×3 square
surrounding the number – *including* the clue square
itself.

## Controls

Left-click in an empty square to turn it black, or right-click to turn
it white. Click again in an already-filled square to cycle it between
black and white and empty. You can left- or right-drag to set multiple
squares at once.

On the keyboard, the arrow keys move a cursor around the grid. Enter
cycles the square under it the way a left-click does, and Space the way
a right-click does.

## Mosaic parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. Both must be at least 3, and the grid
	may hold at most 10000 squares.</dd>
	<dt>Aggressive generation</dt>
	<dd>Every puzzle hides the clues the game never used while solving
	it. When on, the game also tries taking away each clue that remains,
	and keeps it away whenever the puzzle can still be solved without it,
	so fewer numbers are shown, which usually makes the puzzle
	harder.</dd>
</dl>
