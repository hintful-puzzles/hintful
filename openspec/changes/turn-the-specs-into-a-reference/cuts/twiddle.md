# Cuts: twiddle

Requirements: 18 before, 15 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Twiddle game implements the Game interface": "The engine SHALL provide a registered `twiddle` game implementing `Game<TwiddleParams, …>`". The grid, what counts as solved and the scrambled deal stay, retitled "Twiddle is solved when its tiles read in order". | type | The compiler and the registry say it of every game. |
| "Twiddle's presets hold one orientable board": the list of the seven boards, and "Every 3×3 preset SHALL rotate blocks of 2". The rule that exactly one preset is orientable, where upstream had two, stays. | declared | `presets()` in `src/games/twiddle/state.ts`, which the engine reads. |
| "Twiddle refuses a board smaller than its block": the lower bound of 2 on `n` and of 0 on `movetarget` declared in `paramConfig`, and those two cases of the scenario. | declared | The `bounds` of the two `numberItem`s in `src/games/twiddle/index.ts`; `engine-params` "Params validity is the engine's check" says the engine refuses a value outside them, with a reason. |
| "Twiddle rotation and solve moves transform state purely": the shape of `TwiddleMove` as a rotate-or-solve union. What a rotation does stays, retitled "A rotation turns the block and its tiles". | type | The `TwiddleMove` type in `src/games/twiddle/state.ts`. |
| "Twiddle rotation and solve moves transform state purely": "`executeMove` SHALL be pure, returning a new state", and "the source states are unmutated" in its scenario. | collection | `ts-engine` "Applying a move returns a new state". |
| "The Twiddle cursor moves over the rotation origins": that a cursor key "SHALL return a UI update". | type | The return type of `interpretMove`; the engine's target-verb model produces it. |
| "The Twiddle cursor moves over the rotation origins": `CURSOR_SELECT` rotating `dir +1` and `CURSOR_SELECT2` `dir −1`, a select on a hidden cursor only revealing it, and the scenario "A first select reveals the cursor". | collection | `engine-input` "The engine owns a declaring game's press and select keys": Enter applies the left-click verb, Space the right-click verb, and the first select on a hidden cursor only shows it. Twiddle declares `targetVerbs`. |
| "The Twiddle cursor outlines its block", as a separate requirement. Its rule and scenario are now in "The Twiddle cursor moves over the rotation origins". | duplicate | Merged: two short requirements on the cursor. |
| "Solve replaces the grid with the solved arrangement": "the completion flash is suppressed on the following redraw" in its scenario. | collection | `ts-engine` "The win flash plays on a forward move that solves the board" (scenario "The Solve command does not celebrate"). |
| "Twiddle state keeps no record of completion or of the solver" | collection | `ts-engine` "No game's state records a solve or the solver's use" and "A game's status is judged from the board alone"; the flash half is "The win flash plays on a forward move that solves the board". |
| "Twiddle draws a recessed border and beveled numbered tiles": that the border is drawn "once". | how | When the border is painted; that it is there is what a player sees. |
| "A Twiddle tile is repainted only when it changed" | how | The per-tile cache in `TwiddleDrawState`; a player sees the same frame either way. |
| "The Twiddle status bar shows a move count that never resets": the count following the engine's completion words (`COMPLETED!`, `Auto-solved.`, `Auto-solver used.`). | collection | `ts-engine` "The status bar's completion words come from the engine" and "No game writes the completion words itself". |
