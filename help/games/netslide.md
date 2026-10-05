# Netslide

Slide the grid squares around so that they all join up into a single
connected network with no loops.

One square is the *source*: the solid box the power comes from. It
never moves — the row and the column it sits in cannot be slid, which is why
no arrows are drawn beside them. So a square sharing the source's row can
only be shifted by sliding its column, and vice versa, and the network has to
be built up around the source where it stands.

Squares connected to the source are lit up. Aim to light up
every square in the grid (not just the endpoint blobs).

Connecting across a red barrier line is forbidden. On harder levels,
there are fewer barriers, which makes it harder rather than easier!

One setting changes the rules, and a board's name in the Type menu
says when it is on:

{{modifiers}}

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

{{parameters}}
