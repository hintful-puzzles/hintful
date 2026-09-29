# Flood

Try to get the whole grid to be the same color within the given
number of moves, by repeatedly flood-filling the top left corner in
different colors.

## Controls

Click in a square to flood-fill the top left corner with that square's
color.

On the keyboard, the arrow keys move a cursor over the grid, and Enter
fills with the color under it.

## Hints

**Hint** names the next color to fill with — *"Fill with orange to join
the dotted squares to your region"*.

{{hint-marks}}

Nothing in Flood is forced by logic, so
the hint plays a few fills ahead and picks the one that looks best; it
does not promise the shortest way to finish. The move limit is set by
the same planner playing from the start, plus the extra moves the game
allows, so following the hint from the first move finishes in time.

## Flood parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. The grid must have at least two
	squares.</dd>
	<dt>Colors</dt>
	<dd>How many different colors the grid is filled with, from 3 to
	10.</dd>
	<dt>Extra moves permitted</dt>
	<dd>How much slack the move limit gives you. The game plays the board
	through itself when it deals it, and the limit is the number of fills
	it took plus this many. At 0 you have to match or beat the game's own
	count.</dd>
</dl>
