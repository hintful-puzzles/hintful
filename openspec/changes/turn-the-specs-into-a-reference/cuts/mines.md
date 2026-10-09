# Cuts: mines

Requirements: 27 before, 25 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Mines game implements the Game interface": that the engine provides a registered `mines` game implementing `Game`, and the scenario "The game is registered". The rules of the puzzle stay, retitled "The rules of Mines", with what counts as solved (`isWon` in `src/games/mines/state.ts`) stated beside them. | type | The compiler and the registry say it of every game. |
| "Mines game implements the Game interface": "The game SHALL provide `solve`, `textFormat` and `statusbarText`" | collection | `ts-engine` "Solve, the status bar and text export follow from the game's methods": the methods' presence is the declaration. What Solve and the status bar do in Mines stays in "Death is recoverable and is not a loss" and "The count of deaths persists". |
| "Mines' presets": the list of six boards, and the scenario | declared | `presets()` in `src/games/mines/index.ts`, which the engine reads. |
| "Mines' presets": "The two largest SHALL be taller than wide" | collection | `engine-params` "Every default and preset draws no wider than tall", held for every registered game by `src/engine/orientation.test.ts`; Mines has no ledger entry and no departure. |
| "Mines' parameters leave room for a safe first click": "which the engine checks before it asks the game" | collection | `engine-params` "Params validity is the engine's check" (bounds first, then the game's `validateParams`). The minimum of 1 stays. |
| "The clock reflects the state of play": that the timer does not run before the first click, runs during play, stops on completion and runs again on an undo out of it; the scenario "The clock starts on the first click" | collection | `ts-engine` "Every game has a solve timer, and it runs while the board is undecided" (from the first move, while the status is ongoing) and "The solve timer follows the board on display". What is Mines' own stays: a dead board holds the timer, with a scenario for it. |
| "Solve stops the clock, and elapsed time survives a save": "Solve SHALL complete the board, dead or alive, so the game reports solved-with-help" | duplicate | "Death is recoverable and is not a loss" says Solve shows the finished board over the opened mine and reports solved-with-help; the scenario "Solve on a dead board" moved there. |
| "Solve stops the clock, and elapsed time survives a save": "and the timer stops" | collection | `ts-engine` "Every game has a solve timer, and it runs while the board is undecided": a solved board is decided. |
| "Solve stops the clock, and elapsed time survives a save": "Elapsed time SHALL survive a save and restore" | collection | `ts-engine` "The engine uses a clean TS-native save format": the envelope carries the timer's elapsed time. |
| "Mines checks flags against its mines": "held in the tile's cache key so it repaints when it comes and goes" | collection | `engine-drawing` "A warm frame matches a fresh paint of the same state", for every registered game; the cache key is how Mines meets it. |
