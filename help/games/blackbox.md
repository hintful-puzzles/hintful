# Black Box

Determine where the hidden balls are in the box, by observing the
behavior of light beams fired into the box from the sides.

## Controls

{{controls}}

A beam's result is 'H' (the beam hit a ball dead-on and stopped), 'R'
(the beam was either reflected back the way it came or there was a ball
just to one side of its entry point) or a number appearing in two
squares (indicating that the beam entered one of those squares and
emerged from the other). Clicking a beam you have already fired shows
its path again.

When you have placed enough balls, a green button will appear in the
top left; click that to indicate that you think you have the answer.
The keyboard's cursor moves around the edge of the box as well as
inside it, and onto the button once it shows.

A square marked as known takes no ball until you right-click it again.

Every board has exactly one answer: once every laser is fired, only one
set of balls sends them all where they go. So **Check & Save** can check
your marks against it, as it does in every other puzzle, and highlights a
ball on a square that holds none and a square marked as known that holds
a ball. A game ID whose lasers allow more than one answer won't open.

## Hints

**Hint** reads only what your lasers have shown, never the hidden balls,
so it tells you nothing you could not work out yourself.

{{hint-marks}}

Its main tool is following a laser through the box. Start at a laser
you have fired and walk its path through the squares you already know,
up to the first square you know nothing about. Ask what that square
could hold: if a ball there would send the laser somewhere it did not
go, the square must be empty, and if leaving it empty would, it must
hold a ball. A laser that came out at a numbered square can be followed
from either of its two numbers, since a path runs the same both ways.

The hint marks an empty square as known and puts a ball on a square that
must hold one, so each later step can build on what is on the board.
When nothing more can be settled, it asks you to fire a laser whose path
still runs through squares nothing has settled.

Once every laser is fired, it can happen that no single laser settles
any more squares, though all of them together do. The hint then finds
balls that send every laser where it went by trying, and offers them as
one run of moves. A square no laser ever reaches is settled by the count
alone: when the box must hold more balls than the lasers account for,
every such square holds one, and the hint asks you to put them on.

## Black Box parameters

{{parameters}}
