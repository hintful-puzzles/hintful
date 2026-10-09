# Cuts: filling

Requirements: 25 before, 22 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Filling game implements the Game interface": "The engine SHALL provide a registered `filling` game implementing `Game<…>`", "The game SHALL provide `solve` and `textFormat`, and SHALL NOT provide `statusbarText`" | type | `fillingGame` is typed `Game<…>` and registered; `ts-engine` "Solve, the status bar and text export follow from the game's methods" derives the three from the object. |
| "Filling game implements the Game interface" (requirement merged) | duplicate | The rules of the puzzle and the scenario "A full grid with an oversized region is not a solution" are now in "A Filling grid is solved when every cell equals its region's size"; nothing is lost. |
| "A Filling grid is solved when every cell equals its region's size": "`executeMove` SHALL write the move's value into each cell the move lists" | type | The `set` move is `{ cells, value }`; "Filling fill moves and selection" says what a fill does. |
| "A Filling grid is solved when every cell equals its region's size": scenario "A completed grid is detected" | duplicate | Restated its rule; the requirement keeps the oversized-region scenario. |
| "Filling's parameters": "with presets 7×9, 9×13 (the default) and 13×17" | declared | `PRESETS` and `defaultParams` in `src/games/filling/state.ts`. The encoding stays. |
| "Filling's parameters": "by the bounds the width and height fields declare", "`validateParams` SHALL refuse" | how | Which of the two places refuses; `engine-params` "A rule that a game rejects params is met by the engine's check". Both refusals stay. |
| "Filling's parameters": scenario "Invalid params are rejected" | duplicate | Restated its rule; the requirement keeps "Params round-trip". |
| "Filling descriptions are run-length number grids": "`newState` SHALL decode the desc into an immutable `clues` grid and a mutable player `board` initialized to a copy of the clues" | how | Which arrays hold the decoded board. That a clue is immutable and every other cell starts empty stays. |
| "Filling generates uniquely solvable boards": "by partitioning the grid into regions…, and then reduce the clue set, removing whole regions and then individual clues" | how | The order the generator works in. The cap on a region's size and the promise that the solver solves the published clues stay. |
| "Filling solver deduces the unique solution": "It SHALL report whether the board was fully solved." | type | `solveFilling` returns `{ solved, board }`. |
| "Filling solver deduces the unique solution": "`solve` SHALL return the completed board as a move." | collection | `ts-engine` "Solve leaves a solved board", which the midend holds every game to. |
| "Filling's renderer paints no pixels the engine owns" | collection | `engine-drawing` "The game paints everything above the ground"; the frame the first draw paints stays in "Filling's frame is as heavy as a border between two regions". |
| "Filling reports mistakes for Check & Save": "This makes the shell's Check & Save control hard-block a save on a wrong board." | collection | `app-shell` "Checking a board never costs a player their checkpoint": the command refuses to save over a mistake, for every game that can check. |
| "A Filling hint is refused on a solved or mistaken board" | collection | `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game", and "The midend's two refusals are not a game's to give". |
