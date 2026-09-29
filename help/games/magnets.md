# Magnets

Each tile covers two squares. Fill each one with either a magnet
(consisting of a + and − pole) or a neutral tile (green).

The number of + poles in each row and column must match the
numbers along the top and left; the number of − poles must
match the numbers along the bottom and right. Two + poles may not be
orthogonally adjacent to each other, and similarly two − poles.

## Controls

Left-click a tile to make it a magnet, with the + in the end you
click; click it again to turn the magnet round, and a third time to
empty the tile. Right-click to toggle
between empty, neutral, and a ? mark indicating that you're sure
it's a magnet but don't yet know which way round it goes.

A tile marked ? that lies along a row or column brings exactly one +
and one − to that line, whichever way round it turns out, so it
counts toward both of the line's numbers.

Left-click a clue to mark it as done (gray it out). To unmark a clue
as done, left-click it again.

The keyboard can also be used: the arrow keys move a cursor over the
grid, Enter does what a left-click does to the tile under it, and
Space what a right-click does.

## Hints

**Hint** explains the next step rather than simply making it. It reasons
only from the numbers, the tiles you have filled in and your ? marks, so
it carries on from wherever you are, as long as none of those is wrong;
if one is, it asks you to fix the highlighted mistakes first.

{{hint-marks}}

When a step says a tile must be a magnet but not which way round, it
asks you for a ? mark: right-click the tile until the ? shows. Since a ?
tile lying along a line brings one + and one − to it, the hint counts it
toward both of the line's numbers, and says "counting marked magnets"
when a number is met only that way.

A few ideas are worth learning by name:

* **Like poles repel.** A pole can't go beside the same pole, so a tile
  whose two ends both touch a + can't be a magnet at all.
* **A full line.** Once a row has all its +s, no tile lying along it can
  be a magnet, and no other square in it can be +.
* **No room to spare.** When a line's numbers need a + or − in every one
  of its empty squares, every tile there is a magnet; when they leave
  room for just one more neutral square, every tile lying along it is.
* **The odd gap.** When a line's empty squares must all hold poles, they
  alternate. If the line needs one more + than −, the extra + comes from
  its one odd-length gap, which must start with +.

## Magnets parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares, from 2 to 61 each. At least one of them must be 3 or more, or 5 or more for the harder of the two difficulties.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle. Higher difficulties require more complex reasoning (<a href="../features#difficulty">what the names mean</a>).</dd>
	<dt>Strip clues</dt>
	<dd>Remove numbers from around the edge, one at a time, for as long as the puzzle still has only one solution at its difficulty. Some rows and columns then have no number for + or − at all.</dd>
</dl>
