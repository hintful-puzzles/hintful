# Cuts: guess

Requirements: 40 before, 39 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Guess game implements the Game interface": that a registered `guess` game implements `Game`, that it provides `statusbarText`, `solve` and `findMistakes` and no `textFormat`, and the scenario asking the registry for them. The sentence saying what the puzzle is moves to the head of "Guess is won or lost by the rows on the board". | type | The compiler and the registry say it of every game; the members present are the game object itself, and `ts-engine` "Solve, the status bar and text export follow from the game's methods" derives the three capabilities from them. |
| "Guess's parameters": "Three presets SHALL be offered: Standard (`6,4,10,false,true`), Super (`8,5,12,false,true`), and a third that is Standard with duplicates forbidden." | declared | `presets()` in `src/games/guess/state.ts`, which the engine reads. The params encoding stays. |
| "A Guess move is a submitted row or a set of marks": "`executeMove` SHALL be pure." | collection | `ts-engine` "Applying a move returns a new state". |
| "Guess is won or lost by the rows on the board": "Won and lost SHALL be judged from the rows on the board, never from a separate record of the outcome." | collection | `ts-engine` "A game's status is judged from the board alone" and "No game's state records a solve or the solver's use". |
| "Guess rubs out a color without ever lengthening the row": "the slot SHALL come from a scan of the row or from a cursor checked against `npegs`, rather than from declining the key." | how | How the key keeps inside the row; that it never writes past the last peg stays, and so does what it rubs out. |
| "Guess says why a row will not go": "Guess SHALL provide `statusbarText`." | type | The member is on the game object; what the line says stays. |
| "Guess composes a row from colors, holds and keyboard input": the list of what `interpretMove` supports. The hint-letters sentence and its scenario stay, retitled "Guess leaves the hint letters to the app". | duplicate | "Guess offers one key per color", "A tap selects a peg of the working row", "A hold stays off the panel", "Guess's keyboard cursor is one-dimensional", "Guess rubs out a color without ever lengthening the row" and "The Submit key is always offered and only the panel sends it". |
| "Guess marks an answer slot selected as a whole": "The pointer SHALL never act on one color inside a slot." | duplicate | "The panel is the pointer's only way to choose a color": a tap selects a slot "and never a color inside one". |
