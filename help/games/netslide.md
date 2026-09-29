# Netslide

Slide the grid squares around so that they all join up into a single
connected network with no loops.

One square is the *source*: the black box the power comes from. It
never moves — the row and the column it sits in cannot be slid, which is why
no arrows are drawn beside them. So a square sharing the source's row can
only be shifted by sliding its column, and vice versa, and the network has to
be built up around the source where it stands.

Squares connected to the source are lit up. Aim to light up
every square in the grid (not just the endpoint blobs).

Connecting across a red barrier line is forbidden. On harder levels,
there are fewer barriers, which makes it harder rather than easier!

## Controls

Click on the arrows at the edges of the grid to move a row or column
left, right, up or down. The square that falls off the end of the
row comes back on the other end.

Right-click an arrow to slide the line the opposite way.

On the keyboard, the arrow keys move a cursor round the arrows at the
edges, skipping the source's row and column, and Enter or Space presses
the arrow under it.

## Hints

**Hint** shows the next slide rather than simply making it. Nothing in
Netslide is forced by logic, so the hint searches for a way to finish
from where you are, one slide at a time, and tells you what each slide
is for.

{{hint-marks}}

A step ends by saying whether the piece arrives *where it belongs* (or
*beside the source*), or is only *setting up*.

The search looks only so far ahead. When it cannot find a way to finish
from your position, the hint says so rather than guessing: play a few
slides of your own and ask again, or use *Show solution…*.

## Netslide parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. Both must be at least 2.</dd>
	<dt>Walls wrap around</dt>
	<dd>When on, the network may run off one edge of the grid and come
	back on the opposite edge, so the outside of the grid is no longer a
	wall.</dd>
	<dt>Barrier probability</dt>
	<dd>A number from 0 to 1: the share of the places where the finished
	network has no wire that get a barrier drawn across them. At 0 there
	are no barriers inside the grid; at 1 every such place has one, which
	gives away a lot about the solution.</dd>
	<dt>Number of shuffling moves</dt>
	<dd>How many random slides scramble the finished network. At 0, the
	number is chosen from the size of the grid.</dd>
</dl>
