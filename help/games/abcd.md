# ABCD

You're given an empty grid, and several rows of numbers on the side. You have to write a letter in every empty cell, following these rules:

1. The numbers on the edge indicate how many instances of a specific letter appear in that row or column.
2. Identical letters can not be horizontally or vertically adjacent.

The inventor of this type is unknown. This puzzle is also known under the names *ABCD Puzzle*, *ABC-Kombi* or *ABCD-Rätsel*.

More information: https://www.janko.at/Raetsel/Abc-Kombi/index.htm

## Controls

ABCD uses the same control scheme as Solo, but with letters instead of numbers.

Left-click to select a cell, then type a letter on your keyboard to enter it. Press Backspace or Space to clear a cell.

Right-click a cell, then type a letter to add a pencil mark. Pencil marks can be used for any purpose. A preference makes right-click switch on a *sticky* pencil mode instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected cell around. Press Enter to toggle between entering letters and entering pencil marks.

Press the 'M' key to fill every empty cell with all possible pencil marks.

## Hints

**Hint** explains the next step rather than simply making it. It starts by filling in every cell's pencil marks (the same as pressing 'M'), then works from your own marks, so as long as none of them has crossed out a cell's answer it carries on from wherever you are. If you would rather it leave a cell unmarked until a step needs it, set **Hints pencil in** to **Only as needed** in the preferences: a cell with no marks then counts as holding every letter not already beside it.

* **A cell ringed in the hint color** is the cell the step is about: the letter to enter there, or the pencil marks to cross out, which are shown with a line through them.
* **A striped row or column** is the line the step reasons from, and the number it reads is drawn in the hint color.
* **Outlined cells** are the particular cells the reason rests on: the letters a row already holds, or the cells that can still take a letter.

Most steps are the plain rules at work: a cell with only one pencil mark left, a letter crossed out beside the same letter, or a row that already holds as many of a letter as its number says. One idea goes further. Since no two of the same letter may touch, a stretch of empty cells can hold at most every other cell's worth: 3 in a stretch of 5, 1 in a stretch of 2. When the stretches of a row that can take a letter hold at most exactly as many as the row still needs, every stretch must be full, and a full stretch of odd length has only one shape: that letter in its first cell, its last, and every other cell between.

## ABCD parameters

These parameters are available from the ‘Custom…’ option on the ‘Type’ menu. 

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares (excluding the size of the numbers on the edge). How large a board can be depends on the number of letters, because each extra letter is another count every row and column has to satisfy: with three letters a board can reach about 130 squares, with four about 80, and from six letters up about 65. Long thin boards go much further — a short row is almost settled by its own numbers — so anything up to about 160 squares is allowed when one side is under 6. Past those limits no puzzle with a single solution is likely to exist at all, so the game says so rather than searching for one.</dd>
	<dt>Letters</dt>
	<dd>The amount of different letters that can appear in the puzzle.</dd>
	<dt>Remove clues</dt>
	<dd>When enabled, the difficulty is increased by hiding certain number clues.</dd>
	<dt>Allow diagonal touching</dt>
	<dd>When disabled, letters cannot be diagonally adjacent (in addition to letters not being orthogonally adjacent). Counter-intuitively this <em>raises</em> the size limit described above rather than lowering it: the extra restriction gives you more to reason from, so larger boards still work out to a single solution.</dd>
</dl>

