# Salad

You have a square grid; each square may contain a character from A (or 1) to a given maximum. Your objective is to put characters in some of the squares, so each character appears exactly once in each row and column.

The rules vary depending on the game mode, and the Type menu has a section for each:

* {{choice:game-mode:0}}: The letters on the edge show which letter appears first when 'looking' into the grid.
* {{choice:game-mode:1}}: Squares with a ball must contain a number. Squares with a cross must remain empty.

{{choice:game-mode:1}} is the puzzle called Number Ball, invented by Inaba Naoki. The original puzzles are available here: http://www.janko.at/Raetsel/Nanbaboru/index.htm

{{choice:game-mode:0}} is the puzzle called ABC End View, whose designer is unknown.

## Controls

Salad uses a control scheme similar to Solo, but with the ability to mark empty squares.

Left-click to select a cell, then type a letter or number on your keyboard to enter it. Press Backspace or Space to clear a cell.

Press 'X' to mark a cell as empty, or press 'O' to mark a cell as "definitely not empty".

Right-click a cell, then type a letter or number to add a pencil mark. Pencil marks can be used for any purpose. The letter 'X' can also be used to indicate a cell that might be empty. A preference makes right-click switch on a *sticky* pencil mode instead, which stays on until you right-click again.

You can also use the arrow keys to move the selected cell around. Press Enter to toggle between entering letters/numbers and entering pencil marks.

Press the 'M' key to fill every empty cell with all possible pencil marks.

## Hints

**Hint** explains the next step rather than simply making it. When a step needs pencil marks, it starts by filling in every candidate, 'X' included, in each empty square that has none yet (the same as pressing 'M'), then works from your own marks, so it carries on from wherever you are. If a letter, 'X' or 'O' you've entered is wrong, or a square's pencil marks have crossed out its answer, it asks you to fix the highlighted mistakes first.

{{hint-marks}}

A numbered chain is read in order: the sentence says how it rules a letter out of the ringed square.

The hint speaks of *squares*, and a clue *sees* the first letter along its line. The pencil-mark 'X', the note that a square might be empty, is its *empty-square mark*, and a sentence that lists what a square can still be writes it as X. It is crossed out like any other pencil mark: a square left with only that mark must be empty, and a square that has lost it must hold a letter. Each row and column has a fixed number of empty squares, so counting them is half the game: once a line has all its empty squares, the rest must hold letters, and once it has all its letters, the rest must be empty. In {{choice:game-mode:1}}, where every symbol is a number, the hint says "number" wherever this says "letter".

## Salad parameters

{{parameters}}

