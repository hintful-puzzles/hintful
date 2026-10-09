# Cuts: cube

Requirements: 12 before, 10 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Cube game implements the Game interface": that a registered `cube` game implements `Game<CubeParams, CubeState, CubeMove, CubeUi, CubeDrawState>`. The sentence saying what the board is, and the scenario, stay under the new title "A Cube board is a solid on an arena of painted squares". | type | The annotation on `cubeGame` and `registerGame(cubeGame)` in `src/games/cube/index.ts`; the compiler and the registry say it of every game. |
| "Cube offers one preset for each solid", whole, with its scenario. | declared | `presets()` and `PRESET_SIZES` in `src/games/cube/state.ts`, which the engine reads. The params encoding stays. |
| "Cube roll moves transform orientation and swap paint": "`executeMove` SHALL be pure, returning a new state", and "leaving the source state unmutated" in its scenario. | collection | `ts-engine` "Applying a move returns a new state". |
| "Cube roll moves transform orientation and swap paint": "from the current orientation key-points". | how | Which fields the roll is computed from; that the solid lands on a new face and exchanges paint stays. |
| "Cube renders the solid, grid, and rolling animation": "the arena's grid squares, painted squares distinguished from plain ones", and the scenario "Draw output contains grid squares and the solid". Retitled "Cube draws the solid in projection and animates a roll". | duplicate | "Cube draws its arena as a quiet surface under a lifted solid" and "Cube draws the solid as the one object on the board" say what each square and face is drawn as, each with a scenario. |
| "Cube repaints its whole scene every frame", whole, with its scenario. | how | Whether a frame is repainted or cached is not seen by anyone; `engine-drawing` "A warm frame matches a fresh paint of the same state" holds what is seen, and `ts-engine` "The engine imposes no redraw policy" leaves the choice to the game. |
