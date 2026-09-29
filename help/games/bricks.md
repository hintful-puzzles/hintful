# Bricks

You're given a hexagonal grid with numbers in some of its cells. Your objective is to shade several cells while following these rules:

1. Each shaded cell must have at least one shaded cell below it (unless it's on the bottom row).
2. There can't be 3 or more consecutive shaded cells in a horizontal line.
3. A number indicates the amount of shaded cells around it.
4. Cells with numbers cannot be shaded.

This genre was invented by [Nikoli](https://www.nikoli.co.jp/) under the name *Tawamurenga*.

## Controls

Left-click to shade a cell. Right-click to unshade a cell. You can also click and drag to place multiple squares.

To play with a keyboard, use the arrow keys to move the cursor. Press Enter to shade a square, and press Space to unshade a square.

You can also use the numpad (keys 1, 3, 7, 9) to move the cursor diagonally.

## Hints

**Hint** explains the next step rather than simply making it. Each step decides one cell: either it must be shaded, or it must *stay clear*, which means marking it unshaded (right-click, or Space). The hint reasons from the numbers and your own shaded and unshaded cells, so it carries on from wherever you are.

{{hint-marks}}

A *shaded brick*, in the hint's words, is a shaded cell. Where a sentence says "this cell", it means the ringed one; the smaller rings inside cells are the "outlined" cells it names.

Each step is one of the rules at work on a single cell: shading it would make three in a row, leave it with nothing shaded beneath it to rest on, or give a number too many shaded neighbors; or clearing it would leave a shaded brick above with nothing to rest on, or leave a number unable to reach its count.

If a cell is wrong in a way that breaks a rule, the hint asks you to fix the highlighted mistakes first. If your marks break no rule but still cannot all be right, it says they contradict each other, and asks you to undo or clear the ones you are unsure of. On an Unreasonable board it may stop and say that nothing further follows by deduction.

## Bricks parameters

{{parameters}}

