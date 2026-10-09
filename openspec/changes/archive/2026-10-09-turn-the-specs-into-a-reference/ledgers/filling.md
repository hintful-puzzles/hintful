# Ledger: filling

Base: bb004490

Where every rule of Filling's spec went in the reference form.

## Filling game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `filling` game implements `Game`, and what Fillomino asks of a grid | spec: Filling game implements the Game interface |
| It provides `solve` and `textFormat` and no `statusbarText` | spec: Filling game implements the Game interface |
| Fillomino is "the Nikoli puzzle" | history |
| Params are `w` and `h`, encoded `{w}x{h}`, with presets 7×9, 9×13 (default) and 13×17 | spec: Filling's parameters |
| The presets are upstream's sizes turned to draw taller than wide | history |
| `validateParams` refuses a `w·h` unreasonably large | spec: Filling's parameters |
| `validateParams` requires `w ≥ 1` and `h ≥ 1` | untrue: `validateParams` in `src/games/filling/state.ts` checks the area only, and the minimum of 1 is the `bounds` of `paramConfig`, which the engine's `paramsError` refuses. Restated in spec: Filling's parameters |
| Scenario: params round-trip, and a bare `9` is a square | spec: Filling's parameters |
| Scenario: `validateParams` returns an error for `w < 1` or `h < 1` | untrue: `validateParams({ w: 0, h: 5 })` returns null, and `paramsError` is what answers "Width must be at least 1.". Scenario restated in spec: Filling's parameters |

## Filling descriptions are run-length number grids

| Rule | Where it went |
| --- | --- |
| Letters advance past runs of empty cells and a digit places a clue, in scan order | spec: Filling descriptions are run-length number grids |
| `newState` decodes to immutable `clues` and a `board` copied from them | spec: Filling descriptions are run-length number grids |
| Any other character is rejected, and the decoded area equals `w·h` exactly | spec: A Filling description is refused unless it fills the grid exactly |
| The game's `validateDesc` does the rejecting | untrue: the game declares no `validateDesc`. `parseDesc` in `src/games/filling/state.ts`, which `newState` reads through, refuses, and the engine derives the verdict from it |
| Every digit places a clue of its value | untrue: `parseDesc` refuses a clue of 0 or one above `max(w, h, 3)` with `DESC_OUT_OF_RANGE`. Stated in spec: A Filling description is refused unless it fills the grid exactly |
| Scenario: a description decodes to the clued board | spec: Filling descriptions are run-length number grids |
| Scenario: a mismatched length is rejected | spec: A Filling description is refused unless it fills the grid exactly |

## Filling generates uniquely solvable boards

| Rule | Where it went |
| --- | --- |
| The board is a partition into regions sized to their values, capped, and the clue set is reduced by regions and then single clues while the solver still solves | spec: Filling generates uniquely solvable boards |
| Scenario: every generated board is solvable | spec: Filling generates uniquely solvable boards |

## Filling solver deduces the unique solution

| Rule | Where it went |
| --- | --- |
| Four sound, confluent techniques run to fixpoint, the solver reports whether it solved, and `solve` returns the board as a move | spec: Filling solver deduces the unique solution |
| Scenario: the solver completes a generated board | spec: Filling solver deduces the unique solution |

## Filling fill moves and selection

| Rule | Where it went |
| --- | --- |
| Click, drag, keyboard multi-select, `CURSOR_SELECT2` toggle and Escape build and clear a selection | spec: Filling builds a selection of cells |
| The selection is cleared after every committed move | spec: Filling builds a selection of cells |
| A digit, or Backspace as 0, sets every selected non-clue cell in one move that changes at least one cell | spec: Filling fill moves and selection |
| A value above `max(w,h)` is rejected, the limit being 3 on a 2×2 board | spec: Filling fill moves and selection |
| With nothing selected the digit fills the cursor cell | untrue: `interpretMove` in `src/games/filling/index.ts` targets the cursor cell only while `ui.cursor.visible`. Stated in spec: Filling fill moves and selection |
| `executeMove` writes the value into each listed cell | spec: A Filling grid is solved when every cell equals its region's size |
| `executeMove` marks the state completed | untrue: `executeMove` in `src/games/filling/state.ts` only writes the cells, and `status` derives solved from the board through `isComplete`. Stated as the state reporting solved in spec: A Filling grid is solved when every cell equals its region's size |
| Scenario: filling a selection sets every selected cell | spec: Filling fill moves and selection |
| Scenario: a completed grid is detected | spec: A Filling grid is solved when every cell equals its region's size |

## Filling rendering shows regions, errors, and completion

| Rule | Where it went |
| --- | --- |
| Numbers in two colors, the selection highlight, the cursor outline, the completed shade and the error shade for an overfull or boxed-in region | spec: Filling rendering shows regions, errors, and completion |
| A bold border between differing cells where either region is complete or overfull | spec: Filling draws a bold border where two regions are told apart |
| A bold border between differing cells where at least one is filled | untrue: `redrawFilling` in `src/games/filling/render.ts` sets the border when both cells are filled (`if (v1 && v2)`), so an unfinished filled cell has none against an empty one. Corrected in spec: Filling draws a bold border where two regions are told apart |
| A flash on the transition to solved, not via Solve | spec: Filling flashes when the board is solved |
| No pixels the engine owns: the first draw paints the frame and each cell its own background | spec: Filling's renderer paints no pixels the engine owns |
| Scenario: an overfull region is flagged | spec: Filling rendering shows regions, errors, and completion |

## Filling reports mistakes for Check & Save

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the clues, returns every contradicting player cell, returns nothing when the clues do not solve, and so blocks a save on a wrong board | spec: Filling reports mistakes for Check & Save |
| Scenario: a wrong fill is flagged and clears | spec: Filling reports mistakes for Check & Save |

## Filling provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| `hint` returns a plan-carrying narrated hint that explains why, with `hintKeepTrack`, deducing from the player's board an ordered run of forced steps that solves it | spec: Filling provides an explained deduction hint |
| "The fork's hint quality bar" | guide: docs/games/hints.md § "The quality bar" |
| A hint is refused on a solved board or one with mistakes, since contradictory marks would mislead | spec: A Filling hint is refused on a solved or mistaken board |
| The game's `hint` makes those two refusals | untrue: `computeHintPlan` in `src/engine/midend.ts` refuses with `ALREADY_SOLVED` and `FIX_MISTAKES_FIRST` before asking, and `hint` in `src/games/filling/index.ts` checks neither. Restated in spec: A Filling hint is refused on a solved or mistaken board |
| A step is allowed to force several squares at once where one deduction pins them together, a permission whose only obligation is the region-growth rule | spec: One region-growth firing is one hint step |
| Region growth is emitted as one step filling all its squares, with one of two narrations | spec: One region-growth firing is one hint step |
| "One firing = one journey" as the name of the bar | guide: docs/games/hints.md § "Group one firing into one step" |
| Cells no growth group covers are forced singly: a lonely 1, an elimination survivor, a single growth square | spec: A cell no growth group covers is forced on its own |
| A narration names its deduction and does not repeat the region's number | spec: Filling provides an explained deduction hint |
| `hintKeepTrack` answers completed, onTrack with the step shrunk, or off | spec: hintKeepTrack follows a Filling step square by square |
| The target carries no digit, as a call to action, and the evidence is shown, digits readable, never including a target | spec: Filling draws the displayed step's target and evidence |
| The target is a mild fill and the evidence a shaded area in a lighter hint color | untrue: `redrawFilling` and `paintHintMarks` in `src/games/filling/render.ts` ring a target on its border, hatch the named region and outline the pinning neighbors, and no hint role fills a cell. Corrected in spec: Filling draws the displayed step's target and evidence |
| Scenario: the hint explains the next move and solves the board | spec: Filling provides an explained deduction hint |
| Scenario: one firing forces several squares as one step | spec: One region-growth firing is one hint step |
| Scenario: region-based steps show evidence and no step marks its own target | spec: Filling draws the displayed step's target and evidence |
| Scenario: the hint refuses on a solved or mistaken board | spec: A Filling hint is refused on a solved or mistaken board |
| Scenario: following a multi-square hint advances or shrinks the plan | spec: hintKeepTrack follows a Filling step square by square |

## Filling hint color legend

| Rule | Where it went |
| --- | --- |
| The element types a deduction names are told apart by a stable legend, each color with a non-color cue, consistent across the deduction kinds | spec: Filling hint color legend |
| The target carries no digit, as a call to action | spec: Filling draws the displayed step's target and evidence |
| The target is filled `COL_HINT` | untrue: `paintHintMarks` in `src/games/filling/render.ts` rings the target in `COL_HINT` on the cell's border, and `drawSquare` paints no hint fill. Corrected in spec: Filling hint color legend |
| The region premise is shaded `COL_HINT_CELL` with its digit on top | untrue: `drawSquare` hatches the named region in `COL_HINT` under its digits, and `COL_HINT_CELL` is the outline of the neighbors a lonely or eliminated cell is pinned by. Corrected in spec: Filling hint color legend |
| "Which is why Filling shades premises rather than ringing them" | untrue: Filling no longer shades a premise, as the comment at `COL_HINT_CELL` in `src/games/filling/render.ts` says |
| Several target squares of one firing share one color | spec: Filling hint color legend |
| Scenario: target and premise are in different colors | untrue: a `growth` step's ring and its stripes are both `COL_HINT` and are told apart by shape. Scenario restated in spec: Filling hint color legend |
| Scenario: grouped target squares share one color | spec: Filling hint color legend |

## Filling provides on-screen key labels

| Rule | Where it went |
| --- | --- |
| `requestKeys` returns digits 1 to 9 and a clear key with button code 8 labeled "Clear", whatever the board's size | spec: Filling provides on-screen key labels |
| "As upstream's `game_request_keys` is" | history |
| Scenario: the keypad is digits 1 to 9 plus clear | spec: Filling provides on-screen key labels |

## Filling draws its cells on a quiet surface and keeps its borders

| Rule | Where it went |
| --- | --- |
| Player cells on the cell surface, clues on the lifted surface, the surface grid line between, and a border in ink as one stroke over the grid line's pixel | spec: Filling draws its cells on a quiet surface and keeps its borders |
| The frame is as heavy as a border between two regions and no heavier | spec: Filling's frame is as heavy as a border between two regions |
| A shade or the selection replaces the surface, a clue's included, and four kinds of cell are told apart in both schemes | spec: A shade replaces the cell's surface, and four kinds of cell are told apart |
| Scenario: a clue is told by the cell under it | spec: A shade replaces the cell's surface, and four kinds of cell are told apart |
| Scenario: a border is one stroke | spec: Filling draws its cells on a quiet surface and keeps its borders |
