# Cuts: crossing

Requirements: 44 before, 42 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Crossing game implements the Game interface": the sentence that `src/games/crossing/` implements `Game` and is registered. | type | The compiler and the registry say it of every game. |
| "Crossing game implements the Game interface": the sentence that the game implements `findMistakes` so Check & Save can block a save on a wrong digit or note. | duplicate | "Crossing's findMistakes compares the board with the unique solution", whose scenario keeps the refused save. |
| "Crossing game implements the Game interface": "SHALL support pencil marks". | duplicate | "Crossing is played by selecting a cell and entering a digit" states the pencil-mark mode. |
| "Crossing game implements the Game interface": the title and shell. Its keypad sentence and its scenario are kept, moved into "A digit key enters, and Backspace, Space or 0 clears". | duplicate | Nothing of the requirement was left but the keypad rule, which now sits with the digit keys. |
| "Crossing's parameters": "An encoding SHALL round-trip through decode." | collection | `engine-params` "A game declares its params encoding once, and both codec halves are derived": Crossing declares its encoding with `paramsCodec`, so the halves are inverses by construction. The scenario is kept for the omitted height. |
| "Crossing's generator keeps every board uniquely solvable": that open cells grow "from a single shuffled pass", that the candidate is filled "with random digits" and the runs read "into the clue list". | how | What the generator promises of a board is kept: accepted only when the solver calls it valid, no fully closed 2×2 block, open cells connected, reproducible from a seed. |
| "Crossing's clue panel repaints when the held clue changes" (whole requirement and its scenario) | process | `docs/games/rendering.md` § "Moving a cue out of the key's channel is how the key loses it" tells the incident and the rule for a cache key. That a picked-up clue is shown as held stays in "A held clue shows every run it could go in". |
