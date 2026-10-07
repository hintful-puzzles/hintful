# ABCD

You're given an empty grid, and several rows of numbers on the side. You have to write a letter in every empty cell, following these rules:

1. The numbers on the edge indicate how many instances of a specific letter appear in that row or column.
2. Identical letters can not be horizontally or vertically adjacent.

One setting adds to the second rule, and a board's name in the Type menu says when it is on:

{{modifiers}}

## Controls

ABCD uses the same control scheme as Solo, but with letters instead of numbers.

Left-click to select a cell, then type a letter on your keyboard to enter it. Press Backspace or Space to clear a cell.

Right-click a cell, then type a letter to add a pencil mark. Pencil marks can be used for any purpose. A preference makes right-click switch on a *sticky* pencil mode instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected cell around. Press Enter to toggle between entering letters and entering pencil marks.

Press the 'M' key to fill every empty cell with all possible pencil marks.

## Where the puzzle comes from

The inventor of this type is unknown. This puzzle is also known under the names *ABCD Puzzle*, *ABC-Kombi* or *ABCD-Rätsel*.

More information: https://www.janko.at/Raetsel/Abc-Kombi/index.htm

## Hints

**Hint** explains the next step rather than simply making it. It starts by filling in every cell's pencil marks (the same as pressing 'M'), then works from your own marks, so as long as none of them has crossed out a cell's answer it carries on from wherever you are. If you would rather it leave a cell unmarked until a step needs it, set **Hints pencil in** to **Only as needed** in the preferences: a cell with no marks then counts as holding every letter not already beside it.

{{hint-marks}}

Most steps are the plain rules at work: a cell with only one pencil mark left, a letter crossed out beside the same letter, or a row that already holds as many of a letter as its number says. One idea goes further. Since no two of the same letter may touch, a stretch of empty cells can hold at most every other cell's worth: 3 in a stretch of 5, 1 in a stretch of 2. When the stretches of a row that can take a letter hold at most exactly as many as the row still needs, every stretch must be full, and a full stretch of odd length has only one shape: that letter in its first cell, its last, and every other cell between.

## ABCD parameters

{{parameters}}

