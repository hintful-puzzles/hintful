# Solo

Fill in a number in every square so that every number appears
exactly once in each row, each column and each block marked by thick
lines.

When you master the basic game, try a setting that changes the rules,
or all of them at once! A board's name in the Type menu says which it
has:

{{modifiers}}

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

{{parameters}}
