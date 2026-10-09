# Cuts: sticks

Requirements: 30 before, 25 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Sticks game implements the Game interface": that the engine provides a registered `sticks` game implementing `Game` | type | The compiler and the registry say it of every game. |
| "Sticks game implements the Game interface": that Sticks is uniquely solvable and so declares `findMistakes`, and the scenario "Every preset produces a uniquely solvable board" | duplicate | "Every generated Sticks board has one solution, reached without guessing" and "Sticks findMistakes flags only lines that contradict the solution". |
| "Sticks provides an explained hint", with its scenarios on resuming from a self-played position and never repeating a move | collection | `engine-hints` "The hint walk SHALL cover every preset a game offers" (following hints solves the board from any reached position, with no line added to enroll a game) and "A hint SHALL show only steps the player's board does not already decide". |
| "Every Sticks hint step names its technique" | collection | `engine-hints` "A hint step always names a technique, with no un-narrated fallback"; that the deduction decides every generated board is "Every generated Sticks board has one solution, reached without guessing". |
| "A hint on a mistaken Sticks board is refused" | collection | `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game", which forbids a game to write this refusal itself. |
| "Sticks hint recording is confined to the hint path" | how | Where the recorder is wired; what a board is promised is held by "The Sticks generator keeps only what the solver completes" and the uniqueness requirements. |
