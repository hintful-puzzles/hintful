# Cuts: fifteen

Requirements: 14 before, 13 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Fifteen game implements the Game interface": "The engine SHALL provide a registered `fifteen` game implementing `Game`". The rule of the puzzle and the absent mistake check stay, retitled "Fifteen is solved when its tiles read in order with the gap last". | type | The compiler and the registry say it of every game. |
| "Fifteen's params are a width and a height": "Presets of `3x3`, `4x4` and `5x5` SHALL be offered." | declared | `presets()` in `src/games/fifteen/state.ts`. |
| "Fifteen's params are a width and a height": "by the minimum of 2 that both fields declare in `paramConfig`" | how | Where the refusal is declared; the refusal itself stays, and `engine-params` "A rule that a game rejects params is met by the engine's check" says how it is met. |
| "Fifteen slide and solve moves transform state purely": "`executeMove` SHALL be pure, returning a new state", and "the source state is unmutated" in its scenario. Retitled "A Fifteen slide shifts the whole line between its target and the gap". | collection | `ts-engine` "Applying a move returns a new state". |
| "Fifteen's state records neither completion nor the solver" | collection | `ts-engine` "No game's state records a solve or the solver's use" and "The win flash plays on a forward move that solves the board". Its scenario, less the flash, moves under the slide-and-solve requirement, which states that a solve counts as one move. |
| "A Fifteen hint step says whether its slide places a tile home": "The wording SHALL be consistent with the hint quality bar (the Palisade exemplar) and with Sixteen's hint." | process | `docs/games/hints.md` § "The quality bar" for the bar, and § "Hold a stable subgoal" for the one voice with Sixteen. |
| "A Fifteen hint step says whether its slide places a tile home": "The narration SHALL NOT alter a step's move, the tile it highlights, the plan's tracking or its length." | particular | A constraint on the change that added the words; the plan, its highlight and its tracking each keep a requirement of their own. |
| "Fifteen renders tiles, border, and slide animation": "It SHALL keep a per-tile cache, so a tile is repainted only when it changed, is animating, or the flash color or the hinted tile changed.", and "once" of the border drawn once. Retitled "Fifteen draws beveled numbered tiles in a recessed border". | how | How the frame is kept cheap; no player sees it. |
| "A Fifteen slide animates in two passes": "in two passes: the cells vacated by moving tiles are blanked first". Retitled "A Fifteen slide animates its tiles between cells". | how | The order of painting; the interpolated slide a player sees stays, and "A Fifteen tile stands off the well it slides in" says what a sliding tile uncovers. |
| "A genuine Fifteen completion flashes for two frames": "A board solved by the Solve command SHALL NOT flash.", and the scenario's line saying so | collection | `ts-engine` "The win flash plays on a forward move that solves the board", scenario "The Solve command does not celebrate". |
| "Fifteen's status bar shows the move count": "`COMPLETED!` when solved, `Auto-solved.` or `Auto-solver used.` once Solve was used" | collection | `ts-engine` "The status bar's completion words come from the engine". |
