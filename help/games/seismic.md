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

**Hint** explains the next step rather than simply making it. It works from your own pencil marks, so it starts by filling them in (the same as pressing 'M') and then crossing out the numbers already ruled out. As long as none of your marks has crossed out a cell's answer, it carries on from wherever you are.

* **A cell ringed in the hint color** is the cell the step is about: the number to enter there, or the pencil marks to cross out, which are shown with a line through them.
* **An outlined area** is the area the step reasons from. A step that crosses out a number just placed outlines that number's cell instead.

Most steps are the plain rules at work: a cell with only one pencil mark left, or a number with only one cell left to go in within its area. On Normal boards one more idea appears. When every cell an area has left for some number is close enough to a cell outside it to clash, that cell cannot hold the number: whichever cell the area uses, the two would break the keep-apart rule.

## Seismic parameters

These parameters are available from the ‘Custom…’ option on the ‘Type’ menu. 

<dl>
	<dt>Width, Height</dt>
	<dd>Size of the grid in squares. The limit depends on the mode: Tectonic goes up to 100 squares, Seismic up to 64. Seismic's keep-apart rule gets harder to satisfy the larger the board, so past that size a puzzle may never be found at all. Large boards can take several seconds to generate, which is why the ready-made types in the ‘Type’ menu stop at 8×8.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle. Higher difficulties require more complex reasoning.</dd>
	<dt>Game mode</dt>
	<dd>Switch between Seismic and Tectonic mode.</dd>
</dl>

