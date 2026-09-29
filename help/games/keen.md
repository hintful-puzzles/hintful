# Keen

Fill in the grid with digits from 1 to the grid size, so that every
digit appears exactly once in each row and column, and so that all
the arithmetic clues are satisfied (i.e. the clue number in each
thick box should be possible to construct from the digits in the box
using the specified arithmetic operation).

## Controls

To place a number, click in a square to select it, then type the
number on the keyboard. To erase a number, click to select a square
and then press Backspace.

Right-click in a square and then type a number to add or remove the
number as a pencil mark, indicating numbers that you think
*might* go in that square. A preference makes right-click switch on a
*sticky* pencil mode instead, which stays on until you right-click
again.

You can also use the arrow keys to move the selected square around.
Press Enter to toggle between entering numbers and entering pencil
marks, and Backspace or Space to clear a square. Press the 'M' key to
fill every empty square with all possible pencil marks.

## Hints

**Hint** explains the next step rather than simply making it. It starts
by filling in every cell's pencil marks (the same as pressing 'M') and
crossing out the numbers already standing in each row and column, then
works from your own marks, so it carries on from wherever you are. If a
number you've placed is wrong, or a cell's pencil marks have crossed
out its answer, it asks you to fix the highlighted mistakes first. If
you would rather it left a cell unmarked until a step needs it, set
**Hints pencil in** to **Only as needed** in the preferences: a cell
with no marks then counts as holding every number not already in its
row and column.

{{hint-marks}}

A cage's clue is read out as what its cells must do: "sum to 9",
"differ by 3", "multiply to 72", "have a ratio of 2". The cage steps
work cell by cell: a number goes when no way of filling the cage puts it
in this cell, and when every way of filling a cage puts, say, a 4 in one
row, no other cell of that row can be 4.

If you've turned on the preference that removes a number from pencil
marks in its row and column when you place it, the hint leaves that
tidying to the placement rather than spelling it out as a step of its
own. On an Unreasonable board, deduction can run out before the grid is
full; the hint says so rather than guessing.

## Keen parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Grid size</dt>
	<dd>Width and height of the grid, which is also the largest number in it: from 3 to 9.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle (<a href="../features#difficulty">what the names mean</a>).</dd>
	<dt>Multiplication only</dt>
	<dd>When enabled, every cage's clue is a product: no sums, differences or ratios.</dd>
</dl>
