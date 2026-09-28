# Black Box

Determine where the hidden balls are in the box, by observing the
behavior of light beams fired into the box from the sides.

## Controls

Click in a square around the edge of the box to send a beam into the
box. Possible results are 'H' (the beam hit a ball dead-on and
stopped), 'R' (the beam was either reflected back the way it came or
there was a ball just to one side of its entry point) or a number
appearing in two squares (indicating that the beam entered one of
those squares and emerged from the other).

Click in the middle of the box to place your guessed ball positions.
When you have placed enough, a green button will appear in the top
left; click that to indicate that you think you have the answer.
You can also right-click to mark squares as definitely known.

A square marked as known takes no ball until you right-click it again. Right-click a square around the edge to mark, or unmark, the whole row or column it looks into. Clicking a beam you have already fired shows its path again.

To play with a keyboard, use the arrow keys to move the cursor, both inside the box and around its edge. Press Enter to do what a click would, and Space to do what a right-click would.

## Black Box parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the box in squares, from 2 to 255 each.</dd>
	<dt>No. of balls</dt>
	<dd>How many balls are hidden. Give a single number, or a range such as <code>3-6</code> for a number picked at random from that range, which you then have to find out as you play. There must be at least one ball, and fewer balls than squares.</dd>
</dl>
