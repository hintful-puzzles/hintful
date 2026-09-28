# Bridges

Draw horizontal or vertical bridges to link up all the islands.
Bridges may be single or double (a custom board can allow anything
from one to four between a pair of islands); they may not cross; the
islands must all end up connected to each other; the number in each
island must match the number of bridges that end at that island
(counting double bridges as two). Loops of bridges are permitted
unless **Allow loops** is switched off.

## Controls

Click on an island and drag left, right, up or down to draw a bridge
to the next island in that direction. Do the same again to create a
double bridge (or more, where the board allows them), and once more
past the limit to remove the bridge if you change your mind. Click on an island without dragging to mark the island as
completed once you think you have placed all its bridges.

Drag with the right mouse button instead (or, on a touch screen, hold your
finger still on the island for a moment before dragging) to write down how
many bridges a line may carry at most. The first such drag marks the line
**≤1**: at most one bridge may run there, so dragging a bridge along it
again removes it rather than doubling it. The next drag lowers that to none,
drawn as a pair of small crosses, and the one after clears the mark. On a
board that allows more than two bridges, the first drag marks the most less
one, and each drag after lowers it by one more. A line that already carries
bridges can be limited down to the number it has, but no further.

To play with a keyboard, the arrow keys move the cursor to the nearest island in that direction, and typing an island's number jumps to the nearest island showing it (A to F for 10 to 15, and 0 for 16). Press Enter on an island and then an arrow key to draw a bridge that way; press Space to mark the island completed. Holding Control while pressing an arrow draws a bridge from the island under the cursor in one go, and holding Shift writes the at-most mark instead, just as the right mouse button does.

## Hints

**Hint** explains the next step rather than simply making it, and because
Bridges decides two different kinds of thing — the bridges along a line, and
the islands at their ends — the mark tells you which one it means.

* **Bridges drawn in the hint color** are the ones to add. A line that already
  carries a bridge keeps it in the board's own ink, so you can see at a glance
  how many the hint is asking you to add.
* **A pair of small crosses along a line** means no bridge may ever run there.
  You can draw the same crosses yourself by dragging with the right mouse
  button.
* **A ≤1 on a line** means at most one bridge may run there: two would cut a
  group of islands off from the rest, or leave an island short of its count.
  It is the same mark you write with the right mouse button, and later hints
  count on it being there.
* **An island recolored to match** is the island the sentence is talking
  about: when a hint says "this 5 still needs 2 more bridges", the 5 it means
  is the one that has changed color.

What the hint is reasoning *from* is marked in the second color: the islands it
is counting, and the bridges between them. When a hint says "a bridge here
would shut these 2 islands into a finished group of their own", the two islands
it means are the two that are outlined.

Every hint is a deduction you could have made from what is on the board, so it
never guesses. It is refused while a bridge you have drawn contradicts the
solution; the offending bridges light up instead, exactly as they do for
**Check & save**. Marking an island completed before it really is can also stop
the hint, because that locks bridges the island still needs — undo the mark and
ask again.

## Bridges parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares; each must be at least 3.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle; see <a href="../features#difficulty">what the names mean</a>. Tricky needs lines that can carry at least two bridges.</dd>
	<dt>Allow loops</dt>
	<dd>Whether the bridges may form a closed loop. When this is off, no solution contains one, and a board with a loop of bridges on it does not count as finished.</dd>
	<dt>Max. bridges per direction</dt>
	<dd>The most bridges that may join one pair of islands, from 1 to 4.</dd>
	<dt>%age of island squares</dt>
	<dd>Roughly what share of the grid's squares are islands. There are always at least three, and the generator may stop short of the target when it runs out of room.</dd>
	<dt>Expansion factor (%age)</dt>
	<dd>How often a new island is placed as far away as it can go, rather than at a random distance, when the generator grows the puzzle; higher values give longer bridges. With loops allowed, it is also how often a bridge joins an island that is already there, which is what makes loops.</dd>
</dl>
