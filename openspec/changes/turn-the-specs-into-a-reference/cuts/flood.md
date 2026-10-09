# Cuts: flood

Requirements: 16 before, 13 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Flood game implements the Game interface": that a registered `flood` game implements `Game<…>` and provides `statusbarText`, `solve` and `textFormat`, with its scenario. The sentence saying what the board is moves to the head of "A Flood fill recolors the corner region and costs one move" (the old "Flood fill and solve moves transform state purely", retitled). | type | The compiler and the registry say it of every game; `ts-engine` "Solve, the status bar and text export follow from the game's methods" derives the three from the members. |
| "Flood game implements the Game interface": "SHALL NOT provide `findMistakes`: no single move is a mistake, and the failure mode is the lose status." | declared | `notApplicable.findMistakes` in `src/games/flood/index.ts` gives the reason in the help page's words, and the engine reads it (`ts-engine` "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft"). |
| "Flood offers its presets", whole, with its scenario. | declared | `presets()` and `defaultParams()` in `src/games/flood/state.ts`, which the engine reads. The params encoding stays. |
| "Flood refuses params it cannot deal": "by the engine, from the bounds the game declares on those two fields in its `paramConfig`." | how | Where the bound is checked; that 3–10 colors and a leniency of 0 or more are the limits stays. |
| "Flood fill and solve moves transform state purely": "A `FloodMove` SHALL be a fill carrying a color (`{ type: "fill", color }`) or a solve (`{ type: "solve" }`)." | type | The `FloodMove` union in `src/games/flood/state.ts`. |
| "Flood fill and solve moves transform state purely": "`executeMove` SHALL be pure", and "the source state is unmutated" in its scenario. | collection | `ts-engine` "Applying a move returns a new state". |
| "Flood fill and solve moves transform state purely": scenario "Solve snaps to a completed grid". | collection | `ts-engine` "Solve leaves a solved board", which the midend holds every game to. That Solve's fills are counted as moves stays. |
| "Flood input fills with the chosen square's color": "Cursor keys SHALL move the cursor, clamped to the grid." | collection | `engine-input` "A target and its cursor belong to the geometry" and "A bounded-grid cursor is driven through moveCursor"; Flood declares `squareGrid` and has no cursor code of its own. |
| "Flood's state records neither completion nor the solver", whole, with its scenario. | collection | `ts-engine` "No game's state records a solve or the solver's use" and "A game's status is judged from the board alone"; "the grid is complete exactly when it is one color" is kept, as a sentence of "Flood reports win and lose status". |
| "Flood's status bar counts moves against the limit": "`COMPLETED!` on a board the player solved and `Auto-solved` on one Solve finished." | collection | `ts-engine` "The status bar's completion words come from the engine" and "No game writes the completion words itself". `FAILED!` is Flood's own and stays. |
