# Cuts: galaxies

Requirements: 43 before, 34 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Galaxies parameters and presets": "It SHALL offer the presets 7×7, 10×10 and 15×15, each in Easy and in Unreasonable." | declared | `presets()` in `src/games/galaxies/index.ts` is the table the engine reads. The sentence naming the three parameters moves into "Galaxies parameter strings decode leniently and round-trip". |
| "Galaxies parameters and presets": scenario "Preset and game-ID parameters select a board" | type | Every registered game deals a board from a preset or a game ID; nothing in it is Galaxies' own. |
| "Galaxies refuses a size outside its bounds with a reason" (whole requirement and its scenario) | declared | The bounds are `paramConfig`'s `bounds: { min: 3, max: 100 }`, and the refusal and its wording are the engine's: `engine-params` "Params validity is the engine's check" (its scenario is this one, "Width must be at least N."). |
| "Galaxies generates uniquely-solvable boards at the requested difficulty": "The generator SHALL retry until the solver-verified difficulty matches." | how | The promise stays: a board at another difficulty, ambiguous or impossible is never returned. |
| "Galaxies moves are pure" (whole requirement and its scenario) | collection | `ts-engine` "Applying a move returns a new state". |
| "Galaxies reports solved from its edges": "The status SHALL be upgraded to `solved-with-help` if the solver was used to get there", and the scenario's last line | collection | `ts-engine` "The engine derives a board's history from its position": the midend, not the game, reports solved-with-help. |
| "Moving the keyboard cursor adds no history" (whole requirement and its scenario) | collection | `ts-engine` "A UI-only input redraws without a history entry", whose scenario is a keyboard cursor. |
| "Galaxies flashes on completion" (whole requirement and its scenario) | collection | `ts-engine` "The win flash plays on a forward move that solves the board". |
| "Galaxies derives its surfaces from the host background": "The colors of Galaxies' surfaces SHALL be derived from the supplied default background", and its scenario | duplicate | "Galaxies draws its cells on the collection's quiet surface" and "A white dot's finished region is the lifted surface" name each surface; "The transient affordances use authored colors" names the exception. |
| "Galaxies derives its surfaces from the host background": "`redraw` SHALL paint the outer border on its first draw, over the ground the midend lays." | collection | `engine-drawing` "The game paints everything above the ground" (the board border on the first frame, no second ground fill). |
| "Galaxies is registered in the engine registry" (whole requirement and its scenario) | type | `registerGame(galaxiesGame)` typed as `Game`; `ts-engine` "Per-game engine selection is a runtime registry, not a build flag". |
| "A hint refuses on a board with a mistake" (whole requirement and its scenario) | collection | `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game": the midend gives the refusal and lights the overlay, and a game may not write it. That walls count is "Mistake checking covers walls as well as associations". |
| "Galaxies is in the cross-game hint guards" (whole requirement and its scenario) | collection | `ts-engine` "A shared mechanic is joined by having it, not by declaring it": declaring `hint()` is the enrollment. |
