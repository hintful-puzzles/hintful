# Mathrax

You have a square grid; each square may contain a digit from 1 to the size of the grid, and some squares have clues overlapping them. Your objective is to fill the grid with numbers so that no number appears more than once in a row or column, and all clues are satisfied.

The following clues can appear:

* An 'E' indicates that the four adjacent digits are even.
* An 'O' indicates that the four adjacent digits are odd.
* An '=' indicates that diagonally adjacent digits are equal.
* A number indicates the result of the given operation when applied to each pair of diagonally adjacent digits. (topleft * bottomright) = (topright * bottomleft)

## Controls

Mathrax uses the same control scheme as Solo.

Left-click to select a cell, then type a number on your keyboard to enter it. Press Backspace or Space to clear a cell.

Right-click a cell, then type a number to add a pencil mark. Pencil marks can be used for any purpose. A preference makes right-click switch on a *sticky* pencil mode instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected cell around. Press Enter to toggle between entering numbers and entering pencil marks.

Press the 'M' key to fill every empty cell with all possible pencil marks.

## Where the puzzle comes from

The inventor of Mathrax is unknown.

More information: https://www.janko.at/Raetsel/Mathrax/index.htm

## Hints

**Hint** explains the next step rather than simply making it. It works from your own numbers and pencil marks, so it carries on from wherever you are; if a number you've entered is wrong, or a cell's pencil marks have crossed out its answer, it asks you to fix the highlighted mistakes first. It pencils in only as it needs to: a cell with no marks counts as holding every number its row and column don't already hold, and the hint writes a cell's marks only when its next step crosses one out or reasons from them. If you would rather it filled in every cell's marks first (the same as pressing 'M'), set **Hints pencil in** to **Every candidate first** in the preferences.

{{hint-marks}}

Numbered cells are a chain of cells with two numbers left each, read in order: the sentence says how the chain rules a number out of the ringed cell.

The hint names a clue as it is drawn ("the 7+ clue", "the 2÷ clue", "the = clue"), and "the 3 across it" is the number in the cell diagonally opposite across that clue. A number is *open* in a cell while it is still possible there: in the cell's pencil marks, or, in a cell with no marks, not yet ruled out by its row and column. So "nothing open across the 7+ clue adds with 1 to make 7" means the cell across can't be 6, so this cell can't be 1.

If you've turned on the preference that removes a number from pencil marks in its row and column when you place it, the hint leaves that tidying to the placement rather than spelling it out as a step of its own. On an Unreasonable board, deduction can run out before the grid is full; the hint says so rather than guessing.

## Mathrax parameters

{{parameters}}

