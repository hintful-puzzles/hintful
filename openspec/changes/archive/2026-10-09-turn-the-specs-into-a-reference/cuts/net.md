# Cuts: net

Requirements: 26 before, 24 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Net game implements the Game interface": "The engine SHALL provide a registered `net` game implementing `Game`". The board, its mask bits and what counts as solved stay, retitled "Net's board and what counts as solved". | type | The compiler and the registry say it of every game. |
| "No Net preset draws wider than tall": the list of bounded sizes (5×5, 7×7, 9×9, 11×11, 11×13). The two differences from upstream stay (13×11 stood upright, one wrapping preset where upstream has five), retitled "Net offers one wrapping preset", with the scenario. | declared | `PRESETS` in `src/games/net/index.ts`, which the engine reads. |
| "No Net preset draws wider than tall": "No preset SHALL be wider than it is tall." | collection | `engine-params` "Every default and preset draws no wider than tall", judged by `computeSize` for every registered game. |
| "Net loads only a board its hint finishes": "The game SHALL provide `solve` and `statusbarText`, and SHALL NOT provide `textFormat`." | type | The members on the game object; `ts-engine` "Solve, the status bar and text export follow from the game's methods". |
| "No-op inputs are suppressed locally": "suppressed in `interpretMove` ... and never by comparing serialized game states", and the scenario's "the engine performs no state-equality suppression". What the player sees stays: the three inputs make no move, and a turn that undoes the last is still its own undo entry. | how | Where the suppression is written; the engine has no state comparison to forbid. |
| "Jumble is deterministic on replay": "The RNG SHALL NOT be part of the Ui: it is neither where the player is nor anything replay reads." | how | Which variable holds the generator (`jumbleRs` in `src/games/net/index.ts`, whose comment gives the reason); the replay promise stays. |
| "The keypad offers a Jumble key" (requirement merged) | duplicate | Its sentence and scenario are now in "Jumble is deterministic on replay"; nothing is lost. |
| "The pointer notes the side a tap lands nearest": "(`ui.pencilMode`, toggled by the Marks key and `P`, shown by the pencil at the canvas's top-right)" | collection | `engine-notes` "One way into note-taking across the collection" (the Marks key and `P`), "The engine gives every note-taking game its Marks key" and "A sticky notes mode is visible on the board" (the indicator). |
| "Net gives no hint while a lock or note is wrong" | collection | `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game": the midend refuses with `FIX_MISTAKES_FIRST` whenever `findMistakes` reports anything, and a game may not write the refusal. What Net's `findMistakes` reports stays in "Net flags wrong locks and notes". |
