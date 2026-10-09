# Cuts: netslide

Requirements: 48 before, 36 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Netslide game implements the Game interface": "The engine SHALL provide a registered `netslide` game implementing `Game`". The rules of the board stay, retitled "Netslide's board, its source and the lines that never slide". | type | The compiler and the registry say it of every game. |
| "Netslide offers three sizes at three difficulties" | declared | `PRESETS` and `presetTitle` in `src/games/netslide/index.ts`, which the engine reads. |
| "Netslide's params are held to their ranges" | declared | The `bounds` of each `paramConfig` item in `src/games/netslide/index.ts`; `engine-params` "Params validity is the engine's check" says the engine refuses a value outside them. |
| "Netslide provides Solve and a status bar, and no text format" | type | The members on the game object; `ts-engine` "Solve, the status bar and text export follow from the game's methods". |
| "newState builds the barrier grid": that `newState` parses the desc into two grids and derives each barrier's `RU`, `UL`, `LD`, `DR` corner flags. The border walls of a non-wrapping game, and the scenario, move into "Netslide descriptions encode wires and barriers". | how | How the junctions are built; that barriers join cleanly at a corner stays in "Netslide renders wires, barriers, arrows and the slide animation". |
| "Every state of a game shares one barrier grid" | how | An allocation choice no player sees; `docs/games/mechanics.md` ("Share the parts of state that never change") states it with Netslide as the exemplar. |
| "The solved grid is grown from the source as a spanning tree": the candidate set ordered by `x`, `y`, `direction` and the uniform pick from it. | how | Which algorithm grows the tree; what the grid is (a spanning tree, no cross, no loop) stays. |
| "Barriers are chosen after the shuffle" | particular | A property of one seed across two probabilities; the app hands out boards, never seeds, and only its own test consults it. |
| "The generator saves the unshuffled grid as aux" | duplicate | "Netslide solves from the generator's grid when it has one", which now says so in its first sentence. |
| "A slide arrow sits beside every line that slides": "The border gutter SHALL be `⌊3 · tileSize / 4⌋ + 1` wide." | particular | `border()` in `src/games/netslide/render.ts`; a layout figure only its test reads. |
| "Netslide renders wires, barriers, arrows and the slide animation": "with their corner flags" | how | The flags are the means; the clean join stays. |
| "The status bar counts moves and powered tiles": "Whether the game is complete or was auto-solved SHALL be said by the engine's completion words, which the game SHALL NOT write itself." | collection | `ts-engine` "No game writes the completion words itself". |
| "Netslide offers an explained hint" | duplicate | "Each move is narrated by its consequence", "The plan's goal is every tile powered" and "Netslide can be solved from any position"; that it implements `hint` and `hintKeepTrack` is the type's. |
| "Netslide is covered by the cross-game hint-resume guard" | collection | `ts-engine` "A shared mechanic is joined by having it, not by declaring it": the guard takes every game that has a hint. |
| "Netslide can be solved without the generator's answer" | duplicate | Merged into "Netslide solves from the generator's grid when it has one", with its scenario. |
| "Hint colors come after the upstream color enum" | port | Upstream is not tracked, so nothing reads the palette index-for-index against its enum. |
| "The hint overlay is part of the render cache's diff key" | collection | `engine-drawing` "A warm frame matches a fresh paint of the same state" holds every registered game to it, and `docs/games/rendering.md` ("The tile cache and the diff key") states the rule; that the marks are drawn stays in "Netslide renders the displayed hint step". |
