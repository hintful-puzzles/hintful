# Unequal

Fill in the grid with numbers from 1 to the grid size, so that every
number appears exactly once in each row and column. The clue signs
between squares carry a further rule, and which rule depends on the
game mode:

* Unequal mode: the clues are `<` signs, and all of them must
  represent true inequalities (i.e. the number at the pointed end is
  smaller than the number at the open end). Not every true inequality
  is shown, particularly at the harder difficulties.
* Adjacent mode: the clues are bars, and a bar means the two squares
  it separates hold consecutive numbers — one is exactly one higher
  than the other. Every bar the solution calls for is shown, so the
  *absence* of a bar between two squares tells you their numbers are
  definitely not consecutive.

Both modes are in the ‘Type’ menu, and ‘Custom type…’ has a **Mode**
setting as well.

## Controls

To place a number, click in a square to select it, then type the
number on the keyboard. To erase a number, click to select a square
and then press Backspace.

Right-click in a square and then type a number to add or remove the
number as a pencil mark, indicating numbers that you think
*might* go in that square.

Left-click on a clue to mark it as done (gray it out). To unmark a
clue as done, left-click on it again.

A preference makes right-click switch on a *sticky* pencil mode
instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected square around.
Press Enter to toggle between entering numbers and entering pencil
marks, and Backspace or Space to clear a square. Shift or Ctrl with an
arrow key marks the clue between the selected square and its neighbor
that way as done. Press the 'M' key to fill every empty square with all
possible pencil marks.

## Hints

**Hint** explains the next step rather than simply making it. It works
from your own numbers and pencil marks, so it carries on from wherever
you are; if a number you've placed is wrong, or a cell's pencil marks
have crossed out its answer, it asks you to fix the highlighted
mistakes first. It pencils in only as it needs to: a cell with no marks
counts as holding every number its row and column don't already hold,
and the hint writes a cell's marks only when its next step crosses one
out or reasons from them. If you would rather it filled in every cell's
marks first (the same as pressing 'M'), set **Hints pencil in** to
**Every candidate first** in the preferences.

* **A ringed cell** is the one the step is about: the number to enter
  there, or the pencil marks to cross out, which are shown with a line
  through them.
* **Two outlined cells** either side of a sign or bar are the pair the
  sentence reasons about: the ringed one, and "the cell across" it.
  Elsewhere, outlined cells between them already account for the
  numbers being crossed out.
* **A striped row or column** is the line the sentence calls "this row"
  or "this column".
* **Numbered cells** are a chain of cells with two numbers left each,
  read in order: the sentence says how the chain rules a number out of
  the ringed cell.

The hint calls every `<` sign a *greater-than sign*, and reasons from
it both ways: the cell on its larger side can't hold anything as small
as the smallest its partner could be, nor the one on its smaller side
anything as large as the largest. In Adjacent mode it reasons from the
bars and from their absence. A number is *open* in a cell while it is
still possible there: in the cell's pencil marks, or, in a cell with no
marks, not yet ruled out by its row and column. So "a neighbor with
nothing open one away from 6" means no number that could still go in
the neighbor is 5 or 7, and a bar there rules 6 out.

If you've turned on the preference that removes a number from pencil
marks in its row and column when you place it, the hint leaves that
tidying to the placement rather than spelling it out as a step of its
own. On an Unreasonable board, deduction can run out before the grid is
full; the hint says so rather than guessing.

## Unequal parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu.

<dl>
	<dt>Mode</dt>
	<dd>Unequal, where the clues are <code>&lt;</code> signs, or Adjacent, where they are bars between consecutive numbers (both described above).</dd>
	<dt>Size</dt>
	<dd>Width and height of the grid, which is also the largest number in it: from 3 to 31. Above 9, the numbers are written 0 to 9 and then A, B, C and so on, so each still takes one character. Adjacent puzzles at Tricky or above need a size of at least 5.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle (<a href="../features#difficulty">what the names mean</a>).</dd>
</dl>
