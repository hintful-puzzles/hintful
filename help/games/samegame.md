# Same Game

Try to empty the playing area completely, by removing connected
groups of two or more squares of the same color. Then try to score
as much as possible, by removing large groups at a time instead of
small ones.

## Controls

Click on a colored square to highlight the rest of its connected
group. The status line will print the number of squares selected,
and the score you would gain by removing them. Click again to remove
the group; other squares will fall down to fill the space, and if
you empty a whole column then the other columns will move left to
close the gap. You cannot remove a single isolated square: try to
avoid dead-end positions where all remaining squares are isolated.

Right-click a highlighted group to let go of it without removing it.

With the keyboard, the arrow keys move a cursor around the grid,
wrapping round at the edges. Enter highlights the group under the
cursor and removes it on a second press; Space highlights it, and lets
go of it on a second press.

## Same Game parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares.</dd>
	<dt>No. of colors</dt>
	<dd>How many different colors the squares come in: at most 9, and at least 3 when Ensure solubility is on. Fewer colors make bigger groups.</dd>
	<dt>Scoring system</dt>
	<dd>How many points removing a group of <em>n</em> squares scores: (n-1)² or (n-2)². Under (n-2)², the default, a group of two scores nothing, so it pays even more to save up large groups.</dd>
	<dt>Ensure solubility</dt>
	<dd>When enabled, the grid is built by playing the game backwards, so it can always be cleared completely. When disabled, the colors are scattered at random and there is no guarantee.</dd>
</dl>
