# Salad

You have a square grid; each square may contain a character from A (or 1) to a given maximum. Your objective is to put characters in some of the squares, so each character appears exactly once in each row and column.

The rules vary depending on the game mode:

* ABC End View mode: Letters on the edge show which letter appears first when 'looking' into the grid.
* Number Ball mode: Squares with a ball must contain a number. Squares with a cross must remain empty.

Number Ball was invented by Inaba Naoki. The original puzzles are available here: http://www.janko.at/Raetsel/Nanbaboru/index.htm

The designer of ABC End View is unknown.

## Controls

Salad uses a control scheme similar to Solo, but with the ability to mark empty squares.

Left-click to select a cell, then type a letter or number on your keyboard to enter it. Press Backspace or Space to clear a cell.

Press 'X' to mark a cell as empty, or press 'O' to mark a cell as "definitely not empty".

Right-click a cell, then type a letter or number to add a pencil mark. Pencil marks can be used for any purpose. The letter 'X' can also be used to indicate a cell that might be empty. A preference makes right-click switch on a *sticky* pencil mode instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected cell around. Press Enter to toggle between entering letters/numbers and entering pencil marks.

Press the 'M' key to fill every empty cell with all possible pencil marks.

## Hints

**Hint** explains the next step rather than simply making it. When a step needs pencil marks, it starts by filling in every candidate, 'X' included, in each empty square that has none yet (the same as pressing 'M'), then works from your own marks, so it carries on from wherever you are. If a letter, 'X' or 'O' you've entered is wrong, or a square's pencil marks have crossed out its answer, it asks you to fix the highlighted mistakes first.

* **A ringed square** is the one the step is about. What to enter there is previewed in it in the hint color: a letter or number, an X for "empty", or a circle for "holds a letter" (or number). Pencil marks to cross out are shown with a line through them.
* **A clue in the hint color** is the one the sentence names ("this column's top clue"), and **the striped row or column** is the line it looks along. Without a clue, a striped line is the one the sentence calls "this row" or "this column".
* **Outlined squares** are the ones the reason rests on: the squares a clue looks across before its letter, the run of squares its letter must lie in, or squares that between them already account for the letters being crossed out.
* **Numbered squares** are a chain of squares with two candidates left each, read in order: the sentence says how the chain rules a letter out of the ringed square.

The hint speaks of *squares*, and a clue *sees* the first letter along its line. The pencil-mark 'X', the note that a square might be empty, is its *empty-square mark*. Each row and column has a fixed number of empty squares, so counting them is half the game: once a line has all its empty squares, the rest must hold letters, and once it has all its letters, the rest must be empty. In Number Ball, where every symbol is a number, the hint says "number" wherever this says "letter".

## Salad parameters

These parameters are available from the ‘Custom type…’ option on the ‘Type’ menu. 

<dl>
	<dt>Game mode</dt>
	<dd>Switch between ABC End View and Number Ball mode.</dd>
	<dt>Size (s*s)</dt>
	<dd>Size of the grid in squares.</dd>
	<dt>Symbols</dt>
	<dd>The amount of different symbols that appear in each row.</dd>
	<dt>Difficulty</dt>
	<dd>Determine the difficulty of the generated puzzle. A Normal puzzle always needs a technique the Easy level does not have, so the setting you choose is the difficulty you get. Normal Number Ball puzzles are rare, so one can take a few seconds to appear.</dd>
</dl>

