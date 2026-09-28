# Signpost

Connect all the squares together into a sequence, so that every
square's arrow points towards the square that follows it (though the
next square can be any distance away in that direction).

## Controls

Left-drag from a square to the square that should follow it, or
right-drag from a square to the square that should precede it.

Left-drag a square off the grid to break all links to it. Right-drag
a square off the grid to break all links to it and everything else
in its connected chain. (A chain that already runs into one of the
given numbers is not broken up this way: only the square you dragged
loses its links.)

The keyboard can also be used. The arrow keys move a cursor. Press
Enter on a square, move to the square that should follow it and press
Enter again to link them; Space does the same the other way round,
starting from the square that should come second. X breaks all links
to the square under the cursor, and Shift+X breaks up its whole chain
as a right-drag off the grid does.

## Signpost parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. Either may be 1, but not both.</dd>
	<dt>Start and end in corners</dt>
	<dd>Make the sequence start in the top left corner and end in the bottom right one. Otherwise its first and last squares can be anywhere in the grid.</dd>
</dl>
