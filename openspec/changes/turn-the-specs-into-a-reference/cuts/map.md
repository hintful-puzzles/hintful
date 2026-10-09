# Cuts: map

Requirements: 45 before, 40 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Map game implements the Game interface": "The engine SHALL provide a registered `map` game implementing `Game` ... The game SHALL provide `solve`" | type | `mapGame: Game<...>` and `registerGame(mapGame)` in `src/games/map/index.ts`. The rule of the puzzle is in the Purpose and in "Map reports completion and mistakes". |
| "Map game implements the Game interface": "and SHALL drive a completion flash that is suppressed after Solve", and its scenario | collection | `ts-engine` "The win flash plays on a forward move that solves the board", whose scenario is "The Solve command does not celebrate". |
| "Map's presets" (whole requirement and its scenario) | declared | `PRESETS` in `src/games/map/state.ts` is the table the engine reads. |
| "Map refuses params that describe no map": "The game SHALL declare, in `paramConfig`, a minimum of 2 for the width and the height and of 5 for the number of regions, which the engine refuses a value below." | declared | The `bounds` of `paramConfig` in `src/games/map/index.ts`; the refusal is `engine-params` "Params validity is the engine's check". The `n > w*h` rule stays. |
| "A malformed Map description is refused": "via a union-find over non-edges" | how | What is refused stays. |
| "newState builds the immutable map": the list of structures built (four-quadrant map, adjacency graph, clue coloring, edge and region label points) | how | The rule that stays is the one its scenario held, under the title "One description draws one map": the diagonal smoothing is seeded from the desc. |
| "Check & Save refuses a Map board with a mistake" (whole requirement and its scenario) | collection | `app-shell` "Checking a board never costs a player their checkpoint": the command refuses to save over a mistake in every game. |
| "Map's preferences": "and stored on the `Ui` with `newUi` defaults" | collection | `ts-engine` "The engine supports per-game user preferences": every preference's `get` and `set` read and write the game's `Ui`. |
| "What Map draws": "(a blitter sprite)" | how | The drag blob stays in the list. |
| "The solver returns a three-valued verdict": "The solver SHALL return the three-valued verdict (impossible, unique, or stuck or ambiguous)", and its scenario | type | `DifficultyContract.solveAtCap` returns `"solved"`, `"impossible"` or `"unsolved"`; what Solve may claim from each is `ts-engine` "A solver claims only what it established". |
| "The solver returns a three-valued verdict": "a grading routine SHALL return the easiest difficulty that yields a unique solution" | how | `gradeMap` is read only by `map-differential.test.ts`; what a tier means is "Map's solver is graded by tier". |
| "Map's generator is gated on the solver": "grow voronoi regions over the cumulative-frequency table, four-color them recursively", "retry below a difficulty floor" | how | The promise is restated: one solution, at the requested difficulty and not the one below, with a clue of every color left. |
| "Selection names the region, not its cell": "the translation from a pixel SHALL derive that direction from the same quadrant test the pixel-to-region hit-test uses and SHALL NOT restate it" | how | What a tap on a split cell selects stays, with its scenario. |
| "A color carried by the keyboard sits in the triangle the cursor names": "On a whole cell it SHALL be drawn with a one-pixel nudge from the center." | particular | One pixel in `render.ts`, consulted only by a snapshot. |
| "Map explains the next deduction": "A hint SHALL be refused when the board is solved or `findMistakes` reports a mistake, by the midend before it asks the game." | collection | `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game". |
| "The generator does not call the hint" (whole requirement and its scenario) | how | A statement that one refactor changed nothing. That the hint reports through the solver's own functions is "The hint's deductions are the solver's three rungs". The cross-reference in "Map offers the player's reading of an undotted region" now ends at "A premise's regions are outlined apart from the ring". |
| "Map offers the player's reading of an undotted region": "through a `candidateReading` field in its `Ui`", "with the reason stated in `newUi`" | collection | `engine-candidate-hints` "A game states the reading it starts on". That Map's default is `implicit` stays. |
