# Crossing

You're given a grid with several blocked squares, and a list of numbers. Your objective is to fill every empty square with a digit, so each number appears once in the grid when reading from left-to-right or from top-to-bottom.

This is an implementation of *Nansuke*, which was invented by Nikoli. It's sometimes known as *Number Skeleton*.

More information: https://www.nikoli.co.jp/en/puzzles/nansuke/

## Controls

Crossing uses the same control scheme as Solo.

Left-click to select a cell, then type a number on your keyboard to enter it. Press Backspace or Space to clear a cell.

Right-click a cell, then type a number to add a pencil mark. A cell's pencil marks are the digits it can still take, so **Check & save** flags a set of marks that leaves out the cell's answer, and the hint reads them the same way. A preference makes right-click switch on a *sticky* pencil mode instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected cell around. Press Enter to toggle between entering numbers and entering pencil marks.

### Typing a whole number

After you enter a digit, the selection moves on to the next square of the run you're filling, so a complete number can be typed without selecting each square in turn. The selection stops at the end of the run.

The direction is set by the arrow key you last used, and by the square you select: a square that belongs to only one run snaps to it, and clicking an already-selected square that lies on both an across and a down run swaps between them. Clearing a square or adding a pencil mark doesn't move the selection.

### Placing numbers from the list

The number list is an input surface, not just a reference. Click a number to pick it up and every run that can still take it is previewed; click one of those runs to write the whole number in at once. If a square is already selected, clicking a number that fits one of its runs places it straight away.

Across and down runs are drawn in two different colors, and each number in the list is written in the color of the run a click would send it to — so the list always tells you where the number is going. Numbers already written into the grid stay distinguishable from ones that simply don't fit the square you have selected.

Both the auto-advance and the two clue-list aids — highlighting the runs through the selected cell, and coloring the list by where each number could go — can be switched off in the game's preferences.

## Hints

**Hint** explains the next step rather than simply making it. It reasons from the digits you have entered and from your pencil marks, which it reads as the only digits a square can still take. So it carries on from wherever you are, as long as none of them is wrong; if one is, it asks you to fix the highlighted mistakes first. Since blue and amber already mean across and down here, the hint's marks are green.

{{hint-marks}}

A number *still fits* a run, in the hint's words, when it is the run's length, is not already written in elsewhere, and agrees with every square of the run: the digit you entered, or else its pencil marks.

When the hint needs to narrow a square down before it can say more, it writes the digits that square can still take into its pencil marks ("so note them"), or crosses out the ones it can't ("so rule it out"), as steps of their own.

A few ideas are worth learning by name:

* **Only one number fits.** A run whose length only one listed number shares, or whose other numbers of that length are all used, must be that number.
* **Every fitting number agrees.** If every number that still fits a run has the same digit in one of its squares, that square is that digit.
* **Crossing runs.** The across number allows some digits in a square and the down number allows others; when they share just one, that is the square's digit.

## Crossing parameters

{{parameters}}
