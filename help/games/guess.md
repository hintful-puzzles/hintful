# Guess

Try to guess the hidden combination of colors. You will be given
limited information about each guess you make, enabling you to
refine the next guess.

## Controls

Build a guess by pressing the color buttons below the grid. Each
color goes into the first empty peg of the row you are filling, and
the ring shows you where the next one will land. Press **Submit**
when the row is full. The small circles beside it give you your
feedback: black pegs indicate how many of the colors you guessed
were the right color in the right place, and white pegs indicate how
many of the rest were the right colors but in the wrong place.

Tap a peg in the row you are filling to choose where the next color
goes instead — useful for changing your mind about one peg, and the
only way to leave a gap in the middle of a row if you have turned
blanks on. **Clear** empties the peg you chose, or rubs out the last
color you placed if you have not chosen one.

Right-click a peg in that row — or hold a finger on it — to *hold*
it, marking that color to be carried into your next guess. A held
peg is kept when you clear the rest, so the colors you place go into
the gaps around it. Press **L** to number the colors, which can help
when two of them are hard to tell apart.

### The keyboard

Left and right move the cursor along the row, and a color's digit
places it — the digit shown on that color's button. Backspace rubs
one out and Space holds a peg. Once the row is full the cursor rests
one step past its last peg, where Enter submits the guess. Enter on a
peg switches Marks mode on and off, and in Marks mode the digits rule
colors out of the slot the cursor is on.

## The answer row

Below the rows is the answer row: one slot for each peg of the hidden
combination, each holding a small square of every color that could
still be in that slot. It is where you keep track of what you have
worked out: when you rule a color out of a slot, its square goes, and
the colors that are left are the ones you still have to decide
between. Each color always sits in the same place in a slot, so you
can tell at a glance which one has gone.

To rule colors out of a slot, tap the slot. The frame moves there,
and the color buttons now rule their color out of that slot, or put
it back if it is already out; **Clear** puts every color back.
Tapping a peg in the row you are filling takes you back to entering
pegs. **Marks** switches between the two as well, keeping the frame
in the same column, so whichever row the frame is on is always what
the color buttons will change.

## Hints

**Next hint** first points out anything the scored rows prove that
your answer row does not show yet, and rules those colors out of their
slots for you, as marks you could have made yourself. It reasons only
from the scores, never from the marks already in your answer row.

* **Stripes** across a scored row, its score included, mark *the
  striped row* the step reads.
* **An outline** round an answer slot, in a second color, marks *the
  outlined slot*: one whose colors the step already knows and leans on.
* **A frame** beside a color in the answer row marks one of *the framed
  colors*: the ones the step rules out, or, when it suggests a guess,
  the color it picks for each slot.

Some things a single row tells you for certain:

- A row that scored **no black pegs** has none of its colors where
  it guessed them.
- A row that scored **nothing at all** has none of its colors
  anywhere in the answer.
- A row where **every peg scored** holds every color the answer uses.

Once some slots are narrowed down, a row can say more. If only two
of a row's pegs can still be in their right places and it scored two
black pegs, those two must be right. And when settled slots already
account for all of a row's black pegs, none of its other pegs can be in
place.

When nothing more follows, the hint suggests a guess, framing one color
in each slot. The guess always fits every score so far, so it could be
the answer, and the hint tells you how many answers are still possible
and the most that could be left after it. That part is a suggestion
rather than a deduction, and the hint says so by counting rather than
arguing.

## Guess parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Colors</dt>
	<dd>How many colors the answer is chosen from, from 2 to 10.</dd>
	<dt>Pegs per guess</dt>
	<dd>How many pegs the hidden combination has, and so how many go in
	each guess. At least 2.</dd>
	<dt>Guesses</dt>
	<dd>How many rows you have to find the answer in.</dd>
	<dt>Allow blanks</dt>
	<dd>When on, you may submit a guess with some pegs left empty, as long
	as it has at least one color in it. The answer itself never has a
	blank.</dd>
	<dt>Allow duplicates</dt>
	<dd>When on, a color may appear more than once in the answer, and in
	your guesses. When off, every peg of the answer is a different color,
	so there must be at least as many colors as pegs.</dd>
</dl>
