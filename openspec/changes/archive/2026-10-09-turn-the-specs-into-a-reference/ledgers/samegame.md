# Ledger: samegame

Base: bb004490

Where every rule of Same Game's spec went in the reference form: every rule
kept, stated once, a requirement held to the tool's 500 characters.

## Same Game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `samegame` game implements `Game`, on a grid of colored tiles whose connected groups the player removes | spec: Same Game implements the Game interface |
| It provides `statusbarText` and `textFormat`, and no `solve`, `hint` or `findMistakes` | spec: Same Game implements the Game interface |
| The four params, their encoding and lenient decode | spec: Same Game's params are a size, a color count and a scoring system |
| A trailing `r` is left unread and never written | spec: Same Game's params are a size, a color count and a scoring system |
| The `r` is upstream's letter | history |
| Five presets, their sizes, colors and scoring | spec: Same Game offers five presets |
| The presets are upstream's sizes, turned to draw taller than wide | history; spec engine-params: Every default and preset draws no wider than tall |
| No `transposeParams`, because tiles fall down and columns close leftward | spec: Same Game does not turn its board |
| Params need `w ≥ 1`, `h ≥ 1`, `3 ≤ ncols ≤ 9`, `scoresub ∈ {1,2}` and `w·h > 1` | spec: Same Game refuses params it cannot deal |
| `validateParams` requires all five bounds | untrue: `validateParams` in `src/games/samegame/state.ts` refuses only `ncols < 3` and `w·h ≤ 1` (and an unreasonably large area). The lower bound on `w` and `h`, the upper bound on `ncols` and the two scoring choices are declared on `paramConfig` and refused by the engine's `paramsError` |
| Scenario: params round-trip and lenient decode | spec: Same Game's params are a size, a color count and a scoring system |
| Scenario: invalid params are rejected | spec: Same Game refuses params it cannot deal |

## Same Game removes connected groups, scores, and compacts

| Rule | Where it went |
| --- | --- |
| The move's shape, and what a pure `executeMove` does to the tiles and the score | spec: Same Game removes connected groups, scores, and compacts |
| `executeMove` recomputes `impossible` | spec: A Same Game board with no move left is impossible, not lost |
| `status` is solved on an empty grid and otherwise ongoing, never lost, since Undo rescues a stuck board | spec: A Same Game board with no move left is impossible, not lost |
| Scenario: removing a group scores and compacts | spec: Same Game removes connected groups, scores, and compacts |
| Scenario: clearing the last tiles wins | spec: A Same Game board with no move left is impossible, not lost |
| Scenario: a stuck board is impossible but not lost | spec: A Same Game board with no move left is impossible, not lost |

## Same Game supports two-click selection, keyboard input, and a live score

| Rule | Where it went |
| --- | --- |
| The selection is held in the Ui, a click on a removable tile flood-selects, and an empty or lone tile selects nothing | spec: A first click in Same Game selects the group |
| `changedState` clears the selection on every real transition | spec: A first click in Same Game selects the group |
| A second left click or `CURSOR_SELECT` on the selection removes it, and a right click or `CURSOR_SELECT2` clears it | spec: A second click on the selection removes it |
| A keyboard cursor moves with the cursor keys and acts at the cursor on select | spec: Same Game's keyboard cursor acts where it stands |
| The status bar's score, its selected count and points, and its words on a stuck board | spec: Same Game's status bar shows the score |
| `statusbarText` shows the completion words before the score on a cleared board | untrue: `statusbarText` in `src/games/samegame/index.ts` returns `Score: N` alone on a cleared board, and the midend puts the engine's completion words before it |
| Scenario: first click selects, second click removes | spec: A second click on the selection removes it |
| Scenario: a lone tile cannot be selected | spec: A first click in Same Game selects the group |
| Scenario: the selection clears across a move | spec: A first click in Same Game selects the group |

## Same Game generates boards that can be cleared

| Rule | Where it went |
| --- | --- |
| `newDesc` writes `w·h` comma-separated colors in row-major order from the inverse-move generator, and no parameter deals an unclearable grid | spec: Same Game generates boards that can be cleared |
| A desc without exactly `w·h` comma-separated integers is refused, and `newState` parses the tiles with score 0 | spec: A Same Game description is one color for every tile |
| An integer outside `0..ncols` is refused | untrue: `parseDesc` in `src/games/samegame/state.ts` reads each color with `r.int(1, p.ncols)`, so `0` is refused too, and the game's own test refuses `1,0,3` |
| `newState` leaves the complete and impossible flags clear | untrue: `SamegameState` has no complete flag, and `newState` in `src/games/samegame/state.ts` sets `impossible` from `check(tiles, w, h)`, so a typed desc with no adjacent pair starts impossible |
| Scenario: a generated description is well-formed | spec: Same Game generates boards that can be cleared |
| Scenario: a malformed description is rejected | spec: A Same Game description is one color for every tile |

## Same Game draws flat tiles on a quiet field

| Rule | Where it went |
| --- | --- |
| Flat tiles on the cell surface with no bevel, joined within a group and gapped between colors, an emptied cell plain, and a one-pixel frame one gap off the tiles | spec: Same Game draws flat tiles on a quiet field |
| A selected tile has a white body in both schemes and its color at its middle, with the reason | spec: A selected tile is white with its color at its middle |
| The cursor is an outline inside the cell's edge, black on a tile in both schemes and ink on an emptied cell | spec: The cursor and a stuck board are marked on the tile |
| On a board with no move left every tile keeps its color and takes ink at its middle | spec: The cursor and a stuck board are marked on the tile |
| The flash lifts the whole field, margin included, on its lit beats and leaves the tiles | spec: Same Game's flash lifts the field and leaves the tiles |
| Scenario: the field has no bevel | spec: Same Game draws flat tiles on a quiet field |
| Scenario: an emptied cell is empty surface | spec: Same Game draws flat tiles on a quiet field |
| Scenario: a selected tile is white in both schemes | spec: A selected tile is white with its color at its middle |
