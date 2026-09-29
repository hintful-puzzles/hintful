# Seismic

You're given a grid that has been divided into areas. Fill each empty cell with a number so each area of size N contains one instance of each number between 1 and N. Depending on the game mode, the following rule is added:

* Seismic: Two equal numbers N in the same row or column must have at least N spaces between them.
* Tectonic: Two equal numbers cannot be horizontally, vertically or diagonally adjacent.

Seismic mode is an implementation of *Hakyuu*, a puzzle invented by [Nikoli](https://www.nikoli.co.jp/). It's also known as *Ripple Effect*. More information: http://www.janko.at/Raetsel/Hakyuu/index.htm

The inventor of Tectonic is unknown.

## Controls

Seismic uses the same control scheme as Solo, but the interface automatically enforces the maximum number on each area, so it's not possible to enter numbers that are out of range.

Left-click to select a cell, then type a number on your keyboard to enter it. Press Backspace or Space to clear a cell.

Right-click a cell, then type a number to add a pencil mark. Pencil marks can be used for any purpose. A preference makes right-click switch on a *sticky* pencil mode instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected cell around. Press Enter to toggle between entering numbers and entering pencil marks.

Press the 'M' key to fill every empty cell with all possible pencil marks.

## Hints

**Hint** explains the next step rather than simply making it. It works from your own pencil marks, and a cell with none counts as holding every number its area and the numbers near it haven't ruled out yet, so an Easy board needs no marks at all. When a step reasons from a cell's possibilities, the hint writes that cell's marks first. If you would rather it start by filling in every cell's marks (the same as pressing 'M'), set **Hints pencil in** to **Every candidate first** in the preferences. As long as none of your marks has crossed out a cell's answer, it carries on from wherever you are.

{{hint-marks}}

Most steps are the plain rules at work: a cell with only one pencil mark left, or a number with only one cell left to go in within its area. On Normal boards one more idea appears. When every cell an area has left for some number is close enough to a cell outside it to clash, that cell cannot hold the number: whichever cell the area uses, the two would break the keep-apart rule.

## Seismic parameters

{{parameters}}

