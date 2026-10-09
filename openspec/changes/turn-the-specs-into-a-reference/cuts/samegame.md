# Cuts: samegame

Requirements: 17 before, 15 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Same Game implements the Game interface" (whole requirement and its scenario "The game is registered without a solver") | type | The compiler and `registerGame(samegameGame)` say it. Which sections are missing is computed, per `ts-engine` "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft"; the `findMistakes` reason is in `notApplicable`. The sentence naming the puzzle moved to the Purpose. |
| "Same Game offers five presets" (whole requirement and its scenario "The preset menu") | declared | `presets()` in `src/games/samegame/state.ts`. The scenario's rule that each is no wider than tall is `engine-params` "Every default and preset draws no wider than tall". |
| "Same Game refuses params it cannot deal": "`validateParams` SHALL refuse `ncols < 3` and `w·h ≤ 1`. The declared bounds ... SHALL carry the rest, which the engine's params check refuses." | collection | `engine-params` "Params validity is the engine's check" and "A rule that a game rejects params is met by the engine's check" say which piece may carry a refusal. The ranges stay; the two scenarios became one. |
| "Same Game removes connected groups, scores, and compacts": "`executeMove` SHALL be pure", and "the source state is unmutated" in its scenario | collection | `ts-engine` "Applying a move returns a new state". |
| "Same Game generates boards that can be cleared": "using the inverse-move generator: it repeatedly inserts a verified connected blob whose removal reproduces the prior grid" | how | The way the board is built; the promise that it can be cleared stays. |
| "Same Game generates boards that can be cleared": "`newDesc` SHALL produce the board as a comma-separated list of `w·h` color integers in row-major order" | duplicate | "A Same Game description is one color for every tile", which now also says row-major. |
