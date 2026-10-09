# Cuts: inertia

Requirements: 34 before, 32 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Inertia game implements the Game interface": "The engine SHALL provide a registered `inertia` game implementing `Game<…>`" and "The game SHALL provide `solve`, `textFormat`, `statusbarText` and `hint`". The board and the win condition stay, retitled "Inertia's board and what solves it". | type | The compiler and the registry say it of every game; `ts-engine` "Solve, the status bar and text export follow from the game's methods" and "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft". |
| "Inertia's parameters and presets": "three presets (8×10, 12×15, 16×20) SHALL be offered". The params, their `WxH` encoding, the floor of 2 and the area floor of 6 stay, retitled "Inertia's parameters". | declared | `PRESETS` in `src/games/inertia/state.ts`, which the engine reads. |
| "Inertia's parameters and presets": which of the engine's bounds check and `validateParams` gives each refusal (the sentence, and the scenario's last clause). | collection | `engine-params` "Params validity is the engine's check": bounds first, then the game's `validateParams`. |
| "The ball slides until it is stopped": "The state SHALL record the distance traveled by the last move, so the renderer can animate the slide." | how | Which field carries the animation's input; what the animation does stays in "A move animates the slide, and death and the win flash". |
| "Inertia's pieces and ball": "The ball SHALL be drawn over a blitter-saved background." | how | How the sprite is painted; nothing a player sees depends on it. |
| "Inertia's status bar": "`COMPLETED!` when finished". | collection | `ts-engine` "The status bar's completion words come from the engine": the midend prefixes them, and Inertia's `statusbarText` returns none. |
| "The hint is drawn as a marked gem and an arrow": "The ring SHALL be part of the tile's cache key, because it is drawn on a tile rather than on the ball sprite, and an overlay outside the diff key is never painted and never erased." | process | `docs/games/rendering.md` § "The tile cache and the diff key": every overlay not in the tile value must be in the diff key. |
| "Gem candidates are searched as square-plus-direction pairs": "computed by two breadth-first searches over the `w · h · 8` square-plus-direction space". | how | Which search finds the candidates; that a candidate is judged as a square and a direction, and why, stays. |
| "Solve plays a computed route to the finished board": "so the board is finished, as Solve finishes every game's board" and "The step-by-step aid is the hint's." | collection | `ts-engine` "Solve leaves a solved board"; the hint has its own requirements here. |
| "The route is a tour grown over the move graph" | how | Which algorithm builds the route (`src/games/inertia/solver.ts`). That the route collects every gem without the ball dying, and is a tour found by approximation, moved into "Solve plays a computed route to the finished board". |
| "The route is the shorter of two tours" | how | Which two tours are grown and compared; the route need not be the shortest, which "Solve plays a computed route to the finished board" now says. |
