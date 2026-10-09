# Bridges

Draw horizontal or vertical bridges to link up all the islands.
Bridges may be single or double; they may not cross; the
islands must all end up connected to each other; the number in each
island must match the number of bridges that end at that island
(counting double bridges as two). Loops of bridges are permitted.

Two settings change these rules, and a board's name in the Type menu
says when one does:

{{modifiers}}

## Controls

Click on an island and drag left, right, up or down to draw a bridge
to the next island in that direction. Do the same again to create a
double bridge (or more, where the board allows them), and once more
past the limit to remove the bridge if you change your mind. While you
drag, the line between the two islands shows in green what letting go
would leave there, so a drag that is about to remove a bridge shows the
line empty; drag back onto the island you started from to leave things as
they were. Click on an island without dragging to mark the island as
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

**Hint** explains the next step rather than simply making it. Each step decides
what may run along a line, and names the island it reasons about by its number.

{{hint-marks}}

A ≤1 goes where two bridges would cut a group of islands off from the rest, or
leave an island short of its count.

Every hint is a deduction you could have made from what is on the board, so it
never guesses. It is refused while a bridge you have drawn contradicts the
solution; the offending bridges light up instead, exactly as they do for
**Check & save**. Marking an island completed before it really is can also stop
the hint, because that locks bridges the island still needs — undo the mark and
ask again.

## Bridges parameters

{{parameters}}
