# Sixteen

Slide the grid squares around so that the numbers end up in
consecutive order from the top left corner.

## Controls

Click on the arrows at the edges of the grid to move a row or column
left, right, up or down. The square that falls off the end of the
row comes back on the other end.

Right-click an arrow to slide the line the opposite way. You can also
drag a square along its row or column: when you let go, the line
slides by as many squares as you dragged it.

On the keyboard, the arrow keys move a cursor round the board. On one
of the edge arrows, Enter presses it and Space presses it in reverse.
On a square, Ctrl and an arrow key slides that square's line, and the
cursor goes with the square; Shift and an arrow key slides the line
under a cursor that stays put. Enter or Space on a square locks the
cursor into one of those two ways, so the plain arrow keys slide until
you press it again.

## Hints

**Hint** shows the next move rather than simply making it. Nothing in
Sixteen is forced by logic, so the hint searches for a way to finish
from where you are and tells you what each move is for.

{{hint-marks}}

Everything a step marks is part of the move it asks for, so the hint calls
the square it lands on "the ringed square", whatever its outline looks like.

Each step opens by naming the tile it is working on — *"Working on tile
5:"* — and ends by saying whether the move takes it to *its final spot*
or is only *setting up* for a later one.

The search looks only so far ahead. When it cannot find a way to finish
from your position, the hint says so rather than guessing: play a few
moves of your own and ask again, or use *Show solution…*.

## Sixteen parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. Both must be at least 2.</dd>
	<dt>Number of shuffling moves</dt>
	<dd>How the board is scrambled. At 0, the squares are dealt in a
	random order, which can take many moves to put right. Any other
	number starts from the finished board and makes that many random
	slides, so a small number gives a puzzle that is only a few moves from
	solved.</dd>
</dl>
