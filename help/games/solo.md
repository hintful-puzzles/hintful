# Solo

Fill in a number in every square so that every number appears
exactly once in each row, each column and each block marked by thick
lines.

When you master the basic game, try Jigsaw mode (irregularly shaped
blocks), X mode (the two main diagonals of the grid must also
contain every number once), Killer mode (instead of single-cell
clues you are given regions of the grid each of which must add up to
a given total, again without reusing any digits), or all of those at
once!

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
marks, and Backspace or Space to clear a square. On grids of more than
9 numbers, the numbers past 9 are typed as letters. Press the 'M' key
to fill every empty square with all possible pencil marks (except on a
grid large enough to use M as a number).

## Hints

**Hint** explains the next step rather than simply making it. It works
from your own numbers and pencil marks, so it carries on from wherever
you are; if a number you've entered is wrong, or a cell's pencil marks
have crossed out its answer, it asks you to fix the highlighted
mistakes first. It pencils in only as it needs to: a cell with no marks
counts as holding every number its row, column and block (and, in X
mode, diagonal, and in Killer mode, cage) don't already hold, and the
hint writes a cell's marks only when its next step crosses one out or
reasons from them. Much of a puzzle then needs no marks at all. If you
would rather it filled in every cell's marks first (the same as
pressing 'M'), set **Hints pencil in** to **Every candidate first** in
the preferences.

{{hint-marks}}

Numbered outlined cells are a chain of cells with two numbers left each,
read in order: the sentence says how the chain rules a number out of the
ringed cell.

A few ideas are worth learning by name:

* **Only one place.** When every other cell of a row, column or block
  rules a number out, it goes in the one cell left.
* **Confined to an overlap.** When every cell of a row that can still
  take a 1 lies in one block, that block's 1 must be in the row, so the
  1 goes from the rest of the block (and the same the other way round).
* **Already accounted for.** When some cells of a block can hold only
  certain numbers between them, and there are as many of those numbers
  as cells, those numbers go from every other cell of the block.
* In Killer mode, **the region total**: every row, column and block
  adds up to the same total (45 on a 9×9 grid), so once its whole cages
  and placed digits are counted, what's left over belongs to the cells
  that remain.

If you've turned on the preference that removes a number from the
pencil marks it rules out when you place it, the hint leaves that
tidying to the placement rather than spelling it out as a step of its
own. On an Unreasonable board, deduction can run out before the grid is
full; the hint says so rather than guessing.

## Solo parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Columns of sub-blocks, Rows of sub-blocks</dt>
	<dd>How many blocks the grid has across and down. Their product is the width and height of the grid, and the largest number in it: 3 and 3 make the usual 9×9 grid of 3×3 blocks, while 2 and 3 make a 6×6 grid of blocks 3 wide and 2 high. Each must be at least 2 (apart from Jigsaw, below), and the grid can hold at most 31 numbers.</dd>
	<dt>"X" (require every number in each main diagonal)</dt>
	<dd>X mode: the two long diagonals must also hold every number once. The grid needs at least 4 numbers.</dd>
	<dt>Jigsaw (irregularly shaped sub-blocks)</dt>
	<dd>Jigsaw mode: the grid keeps its size, but its blocks are random shapes rather than rectangles.</dd>
	<dt>Killer (digit sums)</dt>
	<dd>Killer mode: instead of given numbers, the grid is divided into cages, each labeled with the total its numbers must add up to, and a number may not repeat within a cage. Killer grids hold at most 9 numbers.</dd>
	<dt>Symmetry</dt>
	<dd>The symmetry of the pattern of given numbers: None, 2-way rotation, 4-way rotation, 2-way mirror, 2-way diagonal mirror, 4-way mirror, 4-way diagonal mirror or 8-way mirror. A rotation keeps the pattern the same when the grid is turned a half (2-way) or a quarter (4-way) turn; a mirror keeps it the same when reflected across the middle line, or the diagonal for a diagonal mirror, and the 4- and 8-way ones combine several of these. Killer puzzles have no given numbers, so it makes no difference there.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle (<a href="../features#difficulty">what the names mean</a>).</dd>
</dl>
