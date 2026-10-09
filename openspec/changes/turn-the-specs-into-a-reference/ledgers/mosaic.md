# Ledger: mosaic

Base: bb004490

Where every rule of Mosaic's spec went in the reference form. The old spec
called the two marks "black" and "white" in some requirements and "marked" and
"blank" in others; the rewrite says marked and blank throughout.

## Mosaic game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `mosaic` game implements `Game`, a grid-fill puzzle whose clue counts the marked cells of its 3×3 neighborhood, itself included | spec: Mosaic game implements the Game interface |
| The game implements `Game` with five type arguments | untrue: `mosaicGame` in `src/games/mosaic/index.ts` declares eight, adding `MosaicMistake`, `MosaicHint` and `MosaicRung`, so the rewrite says `Game` alone |
| It provides `statusbarText`, `solve` and `textFormat` | spec: Mosaic game implements the Game interface |
| Params are `width`, `height` and `aggressive`, encoded `{w}x{h}` with an `h{0 or 1}` suffix when `aggressive` differs from its default of true | spec: Mosaic's parameters and their encoding |
| The `h` suffix is written whenever `aggressive` differs from its default | untrue: `encodeParams` in `src/games/mosaic/state.ts` writes it only when `full` is set, which the old scenario already assumed, so the rewrite says the full encoding |
| The six presets, and the type summary through the three config keys with `aggressive` a boolean | spec: Mosaic's presets and type summary |
| The presets are upstream's | history |
| `validateParams` rejects a board smaller than 3×3 | untrue: `validateParams` in `src/games/mosaic/state.ts` checks only the tile ceiling and the minimum is the `bounds: { min: 3 }` on the dimension fields in `src/games/mosaic/index.ts`, which the engine's `paramsError` refuses with "Width must be at least 3." |
| `validateParams` rejects a board of more than 10000 tiles | spec: Mosaic's size limits |
| Scenario: params round-trip | spec: Mosaic's parameters and their encoding |
| Scenario: invalid params are rejected | spec: Mosaic's size limits |

## Mosaic descriptions are run-length clue grids

| Rule | Where it went |
| --- | --- |
| The desc is a digit per shown clue and a letter per run of 1-26 hidden cells, in scan order | spec: Mosaic descriptions are run-length clue grids |
| "Exactly as upstream" | history |
| `validateDesc` rejects any other character and a wrong decoded length | untrue: the game defines no `validateDesc`. `parseDesc` under `newState` in `src/games/mosaic/state.ts` refuses both and the engine's `validateDesc` in `src/engine/desc-error.ts` reports it, so the rewrite says the desc is refused and names no hook |
| `newState` parses the desc into a clue board frozen and shared by reference, with every cell unmarked | spec: A Mosaic game's states share one clue board |
| The state holds `notCompletedClues`, equal at first to the number of shown clues | untrue: `MosaicState` has no such field. `cluesLeft` in `src/games/mosaic/state.ts` counts the clues left from the marks, which on a new state is every shown clue |
| Scenario: a description round-trips | spec: Mosaic descriptions are run-length clue grids |
| Scenario: a malformed description is rejected | spec: Mosaic descriptions are run-length clue grids |

## Mosaic generates deduction-solvable boards

| Rule | Where it went |
| --- | --- |
| A random image of one `randomBits` bit per cell, every cell's clue with a border cell counting in-bounds neighbors, and what "full" and "empty" are | spec: Mosaic generates deduction-solvable boards |
| Regenerate until the board has a usable starting deduction and the shuffled-order solver completes it | spec: Mosaic generates deduction-solvable boards |
| Hide every clue whose deduction never narrowed anything, and in aggressive mode try the rest in random order, reverting a hide that breaks solvability | spec: Mosaic hides the clues a board does not need |
| Scenario: generated boards are valid and solvable | spec: Mosaic generates deduction-solvable boards |

## Mosaic marks cells via toggle and straight-line paint moves

| Rule | Where it went |
| --- | --- |
| A move is a toggle of one step or two, a paint of a straight run with a captured state, or a solve | spec: Mosaic marks cells via toggle and straight-line paint moves |
| The move union has three arms | untrue: `MosaicMove` in `src/games/mosaic/state.ts` has a fourth, `fill`, which gives a hint step's cells one mark |
| `executeMove` is pure and throws on an out-of-bounds target | spec: Mosaic marks cells via toggle and straight-line paint moves |
| A toggle strips a `SOLVED` or `ERROR` overlay and cycles the mark, and a paint sets only still-unmarked cells | spec: A Mosaic toggle cycles a mark and a paint fills only unmarked cells |
| After each move every affected clue is reflagged `SOLVED` or `ERROR` | spec: Mosaic flags a satisfied clue and a contradicted one |
| The reflagging follows every move, a solve included | untrue: the `solve` arm of `executeMove` in `src/games/mosaic/state.ts` flags every cell `SOLVED` and returns without reflagging any clue, so the rewrite names toggle, paint and fill |
| After each move `notCompletedClues` is recounted | untrue: no count is stored. `cluesLeft` in `src/games/mosaic/state.ts` reads it off the marks whenever it is asked, which the rewrite states as the count following the marks |
| A press toggles its cell, and a drag on from it gives the same toggle to every cell passed that held what the pressed cell held, in any direction, as one step of Undo | spec: A Mosaic press toggles a cell and a drag repeats it |
| The game makes no `paint` move of its own and still replays one from a saved game | spec: A Mosaic toggle cycles a mark and a paint fills only unmarked cells |
| Margin clicks are ignored, only cursor movement is accepted after completion, and a keyboard cursor with select and select2 mirrors the clicks | spec: Mosaic's keyboard, margin and finished board |
| Scenario: toggling cycles a cell | spec: Mosaic marks cells via toggle and straight-line paint moves |
| Scenario: painting fills only unmarked cells | spec: A Mosaic toggle cycles a mark and a paint fills only unmarked cells |
| Scenario: a satisfied clue grays out and a contradicted clue reddens | spec: Mosaic flags a satisfied clue and a contradicted one |
| Scenario: completing every clue solves the game, with `status`, the status bar and the 0.5s flash | spec: Mosaic is complete when every clue is satisfied |
| The scenario's `notCompletedClues` is 0 | untrue: there is no such field, and the scenario now says no clue is left, which is `cluesLeft` returning 0 in `src/games/mosaic/state.ts` |

## Mosaic solves and checks mistakes against the deduced solution

| Rule | Where it went |
| --- | --- |
| Solve runs the deductive solver, applies the full solution with cells flagged solved and the status bar reading `Auto-solved.`, and fails with an error when deduction cannot finish | spec: Mosaic's Solve applies the deduced solution |
| Completion is judged from the board itself, so a solve move needs no bookkeeping of its own | spec: Mosaic is complete when every clue is satisfied |
| `findMistakes` returns every determined cell that contradicts the deduced solution, drawn as an error-colored outline, and none when deduction stalls or the marks are consistent | spec: Mosaic checks mistakes against the deduced solution |
| Scenario: Solve completes the board | spec: Mosaic's Solve applies the deduced solution |
| Scenario: findMistakes flags a wrong mark | spec: Mosaic checks mistakes against the deduced solution |

## Mosaic draws its marks as a piece and a cross on a quiet surface

| Rule | Where it went |
| --- | --- |
| Pieces on a quiet surface, one surface for every cell, the thin surface grid, the shaded piece inset on a marked cell, and an unmarked cell plain | spec: Mosaic draws its marks as a piece and a cross on a quiet surface |
| The marked cell is the one other requirements call black, after upstream, and the blank one white | history |
| A blank cell has no piece and no fill and carries the ruled-out cross, in the middle or small in a corner where the cell has a number | spec: A blank Mosaic cell carries a cross that leaves its number the middle |
| A number is drawn over whatever the cell holds and reads in both schemes, in a color that does not invert on the piece, and a satisfied number is grayer on every kind of cell | spec: A Mosaic number reads over whatever its cell holds |
| A contradicted number is the error color on bare surface and a badge on the piece | spec: A contradicted Mosaic number is red, and a badge on the piece |
| The game names no hue for either mark in its hint sentences, control words, legend or help page | spec: Mosaic names no hue of its own for either mark |
| Scenario: the three marks are told apart without a fill | spec: Mosaic draws its marks as a piece and a cross on a quiet surface |
| Scenario: a blank cell's cross and its number both read | spec: A blank Mosaic cell carries a cross that leaves its number the middle |
| Scenario: a satisfied number grays on the piece and off it | spec: A Mosaic number reads over whatever its cell holds |
| Scenario: a hint names the mark by the engine's word | spec: Mosaic names no hue of its own for either mark |
