# Towers

Fill in the grid with towers whose heights range from 1 to the grid
size, so that every possible height appears exactly once in each row
and column, and so that each clue around the edge counts the number
of towers that are visible when looking into the grid from that
direction. (Taller towers hide shorter ones behind them. So the
sequence 2,1,4,3,5 would match a clue of 3 on the left, because the
1 is hidden behind the 2 and the 3 is hidden behind the 4. On the
right, it would match a clue of 1 because the 5 hides everything
else.)

## Controls

To place a tower, click in a square to select it, then type the
desired height on the keyboard. To erase a tower, click to select a
square and then press Backspace.

Right-click in a square and then type a number to add or remove the
number as a pencil mark, indicating tower heights that you think
*might* go in that square.

Left-click on a clue to mark it as done (gray it out). To unmark a
clue as done, left-click on it again. Drag along the clues to do the
same to each one you pass over.

A preference makes right-click switch on a *sticky* pencil mode
instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected square around.
Press Enter to toggle between entering heights and entering pencil
marks, and Backspace or Space to clear a square. Shift or Ctrl with an
arrow key marks the clue at that end of the selected square's row or
column as done. Press the 'M' key to fill every empty square with all
possible pencil marks.

## Hints

**Hint** explains the next step rather than simply making it. It begins
with any clue of 1 or of the full grid size, which place towers outright
with no pencil marks needed, then fills in every cell's pencil marks
(the same as pressing 'M'), crosses out the heights already standing
in each row and column, and then works from your own
marks, so it carries on from wherever you are. If a tower you've placed
is wrong, or a cell's pencil marks have crossed out its answer, it asks
you to fix the highlighted mistakes first. If you would rather it left
a cell unmarked until a step needs it, set **Hints pencil in** to
**Only as needed** in the preferences: a cell with no marks then counts
as holding every height not already in its row and column.

{{hint-marks}}

A clue is named by its number ("clue 3"); two outlined clues at either
end of a line are a facing pair. Numbered cells are a chain of cells with
two heights left each, read in order: the sentence says how the chain
rules a height out of the ringed cell.

The hint speaks of *heights* and of what a clue *sees*, the towers
visible from it. A few clue ideas are worth learning by name:

* **A clue of 1** sees only the tallest tower, so it stands right next
  to the clue.
* **A clue as large as the grid** sees every tower, so the heights climb
  1, 2, 3, … away from it.
* **Facing clues that add to one more than the grid size** pin down
  exactly where the tallest tower stands.
* **Too tall, too close.** A tall tower near a clue hides everything
  shorter behind it, so it can leave the clue unable to see as many
  towers as it says.

If you've turned on the preference that removes a height from pencil
marks in its row and column when you place a tower, the hint leaves
that tidying to the placement rather than spelling it out as a step of
its own. On an Unreasonable board, deduction can run out before the
grid is full; the hint says so rather than guessing.

## Towers parameters

{{parameters}}
