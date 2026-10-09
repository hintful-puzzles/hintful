# Cuts: sokoban

Requirements: 33 before, 32 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| Sokoban game implements the Game interface: "The engine SHALL provide `src/games/sokoban/` implementing the `Game` interface for Sokoban, registered…" | type | The compiler and the registry say it of every game. |
| Sokoban game implements the Game interface: "Sokoban SHALL implement `solve` and `hint`, both by searching within a budget." | duplicate | "Sokoban's hint offers one push, set against the barrel's other pushes", "Sokoban's Solve finishes from the player's position, or else from the dealt board" and "Sokoban's search orders by distance and counts its budget in positions". |
| Sokoban game implements the Game interface: "…it SHALL NOT implement `findMistakes`", with its reason | declared | `Game.notApplicable.findMistakes` in `src/games/sokoban/index.ts` gives the same reason, and the engine reads it (ts-engine, "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft"). |
| Sokoban game implements the Game interface: "Check & Save SHALL ask the hint whether the position is a dead end instead." | collection | engine-hints, "The check asks the hint whether a position is a dead end"; ts-engine, "`canCheck` and `check()` reach the mistake hook" and "Help is the app doing some of the solving": a game with a hint and no hook is checked through its hint, in every game. Its scenario (a new game is solvable) moved to "Sokoban generation is deterministic". |
| Sokoban's parameters are a width and a height: "with presets 10×12, 12×16 and 16×20" | declared | `presets()` in `src/games/sokoban/state.ts`. |
| An illegal Sokoban move leaves no history: "Undo and redo SHALL be provided by the engine with no game-specific state." | type | `Game` has no undo hook; the midend owns the history. |
| Sokoban rendering: "walls as flat blocks, targets … as discs, barrels as squares, and labeled barrels with their letter" | duplicate | "A wall is a flat gray block, and walls that touch are one mass", "A target is a ring in the color for where the player is going", "A barrel is a square in the color for a thing the player pushes". |
| Sokoban rendering: "over grid lines drawn once, on the ground the midend lays" | collection | engine-drawing, "The midend lays the ground under a fresh draw state's first frame" and "The game paints everything above the ground". |
| Sokoban rendering: "The board SHALL flash on completion.", and the scenario "A completed board flashes" | collection | ts-engine, "The win flash plays on a forward move that solves the board"; engine-colors, "The solved flash is one role". The scenario is replaced by one on what is left of the requirement. |
