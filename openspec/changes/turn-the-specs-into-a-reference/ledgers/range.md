# Ledger: range

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Range game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `range` game implements `Game`, and the three rules of the puzzle with a clue counted once as `h + v - 1` | spec: Range game implements the Game interface |
| The five type arguments the game is typed with | untrue: `rangeGame` is typed with eight arguments, `RangeMistake`, `RangeHint` and `RangeRung` after the five listed (`src/games/range/index.ts`), and the requirement now says `Game` |
| The puzzle is Nikoli's Kurodoko / Kuromasu | history |
| Params are `w` and `h`, encoded `{w}x{h}` | spec: Range params are a width and a height |
| Four presets, 6×9, 8×12, 9×13 and 11×16, drawn taller than wide | spec: Range params are a width and a height |
| The presets are upstream's sizes turned | history |
| `validateParams` rejects a non-positive dimension | untrue: the game's `validateParams` checks only `w + h` and the small grids (`src/games/range/state.ts`), and a dimension below 1 is refused by the engine's `paramsError` from the bound the items declare (`src/engine/params.ts`) |
| `validateParams` rejects a `w + h` that overflows the cell encoding, and when full the 1×1, 1×2, 2×1 and 2×2 grids | spec: Range params are refused outside their bounds |
| The game provides `solve` and `textFormat` and no `statusbarText` | spec: Range game implements the Game interface |
| Scenario: params round-trip, whose bare-number case the requirement now also states | spec: Range params are a width and a height |
| Scenario: invalid params are rejected | spec: Range params are refused outside their bounds |

## Range descriptions are run-length clue grids

| Rule | Where it went |
| --- | --- |
| Scan order, the digits of each clue, a letter for each run of 1-26 blanks, and `_` between two clues that would merge | spec: Range descriptions are run-length clue grids |
| `_` also separates a clue and a run | untrue: `encodeDesc` writes `_` only between two adjacent clues and `parseDesc` expects it only there, so a `_` between a clue and a run letter is refused (`src/games/range/state.ts`) |
| "Exactly as upstream" | history |
| Any other character, a clue outside `1 .. w + h - 1` and a wrong cell count are rejected | spec: A malformed Range description is refused |
| The check is the game's `validateDesc` | untrue: the game declares no validator, and the refusal is raised by `newState` through `parseDesc` (`src/games/range/state.ts`), from which the engine derives the verdict (`src/engine/desc-error.ts`) |
| `newState` parses clue cells to their value and every other cell to `EMPTY` | spec: Range descriptions are run-length clue grids |
| Scenario: a description round-trips | spec: Range descriptions are run-length clue grids |
| Scenario: a malformed description is rejected | spec: A malformed Range description is refused |

## Range generates uniquely solvable symmetric boards

| Rule | Where it went |
| --- | --- |
| Paint up to `n / 3` random squares black, skipping one that touches a black or disconnects the whites, and compute each white square's clue from its two runs | spec: Range's generator paints black squares, then strips clues |
| Remove the clues symmetric to a black square, then symmetric pairs in random order, keeping only removals solvable without recursion, and retry the whole generation when the first removals cannot be made | spec: Range's generator paints black squares, then strips clues |
| Every board is uniquely solvable without recursion and has two-way rotationally symmetric clues | spec: Range generates uniquely solvable symmetric boards |
| Every board contains at least one black square | untrue: on a one-row or one-column grid the only candidates can all be squares that would disconnect the whites, as the middle of a 1×3, and `chooseBlackSquares` then paints none (`src/games/range/solver.ts`), so the rule is stated for a grid at least two squares each way, where the first candidate is always painted |
| Scenario: generated boards are valid and solvable | spec: Range generates uniquely solvable symmetric boards |

## Range solves boards with four deductive rules plus recursion

| Rule | Where it went |
| --- | --- |
| The adjacency rule, the clue run rule and the cut-vertex rule, applied to a fixpoint | spec: Range's deduction applies three rules to a fixpoint |
| A clue with three directions fixed forces the remaining count into the fourth, restated as the cells the clue cannot reach its count without, which is what `ruleNotTooBig` whitens | spec: Range's deduction applies three rules to a fixpoint |
| Recursion runs only when the rules stall | spec: Range's Solve searches where deduction stalls |
| Recursion forces the surviving color when the other leads to a contradiction | untrue: `solveRec` tries an undecided cell black and then white and returns the first completion `findErrors` passes, without showing the other color contradicts (`src/games/range/solver.ts`) |
| `solve` runs the full solver from the initial clues and returns the completing cell-sets, or an error on a contradictory board | spec: Range's Solve searches where deduction stalls |
| Scenario: the adjacency rule whitens a neighbor | spec: Range's deduction applies three rules to a fixpoint |
| Scenario: Solve completes a generated board | spec: Range's Solve searches where deduction stalls |

## Range marks cells via three-state cycling moves

| Rule | Where it went |
| --- | --- |
| A move is a list of cell-sets plus an optional solve flag, and `executeMove` is pure and throws on an out-of-bounds or clue-cell target | spec: Range's move is a list of cell-sets |
| The solve flag is upstream's `S` | history |
| The board is solved exactly while `findErrors` finds no error, however it was reached | spec: Range is solved exactly while it has no error |
| The left and right cycles, and a clue cell is inert | spec: Range marks cells via three-state cycling moves |
| A keyboard cursor moves within the grid, and shift with a direction marks the vacated and entered empty cells white | spec: Range's keyboard cursor marks white with shift |
| The grid helpers take `(r, c)` and the cursor is the shared `(x, y)`, `cursor.x` the column and `cursor.y` the row | spec: Range's keyboard cursor marks white with shift |
| It is the one place in the collection where the two conventions meet | reason |
| Scenario: left and right cycle in opposite directions | spec: Range marks cells via three-state cycling moves |
| Scenario: clue cells reject marking | spec: Range marks cells via three-state cycling moves |
| Scenario: completing the board is detected | spec: Range is solved exactly while it has no error |

## Range highlights errors live and checks mistakes against the solution

| Rule | Where it went |
| --- | --- |
| `redraw` highlights each of the three violations in the error color, recomputed each frame from `findErrors` | spec: Range highlights errors live |
| "Matching upstream's live error display" | history |
| `findMistakes` re-solves from the initial clues and returns each mark that contradicts the unique solution, and none when the marks are consistent or undecided | spec: Range checks mistakes against the solution |
| Scenario: a black-adjacency violation reddens live | spec: Range highlights errors live |
| Scenario: findMistakes flags a wrong black | spec: Range checks mistakes against the solution |

## Range provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| `hint(state)` returns a plan-carrying narrated hint that explains why each move is forced, one step per forced cell of the no-recursion deduction from the player's marks | spec: Range provides an explained deduction hint |
| "The fork's hint quality bar" | reason |
| A hint is refused on a solved board or one with mistakes, since contradictory marks would mislead | spec: A Range hint is refused on a solved or mistaken board |
| The game's `hint` makes those two refusals | untrue: `hint` in `src/games/range/index.ts` checks neither, the midend's `computeHintPlan` makes both before calling it (`src/engine/midend.ts`), and `hint` refuses only with `DEDUCTION_EXHAUSTED` when the plan is empty |
| The five deductions a step's narration states | spec: A Range hint step states the deduction that forces its cell |
| `hintKeepTrack` advances the plan, `"completed"` on the hinted cell and value and `"off"` otherwise | spec: Range's hintKeepTrack follows the hinted cell and value |
| The target is ringed in the hint color at its edge with no preview, the narration saying which mark | spec: The forced cell and its premises take different marks |
| The evidence is outlined as an area in the evidence color, by deduction kind | spec: A Range hint outlines its evidence as an area |
| A `reach` step stripes the run from the clue up to the target, and a black premise takes a doubled outline in a color of its own | spec: A shaded premise, a run and a clue each take their own mark |
| Evidence is computed against the board as each step fires and never includes the target | spec: Range hint evidence is computed as each step fires |
| A known-white cell is told from an undecided one without a fill, a clue by its lifted surface and a white mark by its cross | spec: A known-white Range cell is told without a fill |
| "So a beginner reads determined state at a glance" | reason |
| Scenario: hint explains the next forced move | spec: Range provides an explained deduction hint |
| Scenario: every hint step shows visible evidence | spec: A Range hint outlines its evidence as an area |
| Scenario: hint refuses on a solved or mistaken board | spec: A Range hint is refused on a solved or mistaken board |
| Scenario: following the hint advances the plan | spec: Range's hintKeepTrack follows the hinted cell and value |

## Range hint color legend

| Rule | Where it went |
| --- | --- |
| A stable legend of marks, none a fill that hides content, consistent across deductions and read from the step's words | spec: Range hint color legend |
| The forced cell is ringed `COL_HINT` whichever mark it takes, with no preview, and premises with no shaded piece are outlined `COL_HINT_CELL` | spec: The forced cell and its premises take different marks |
| A shaded premise keeps its piece and takes a doubled outline in `COL_HINT_SHADEDREF`, the `reach` run is striped `COL_HINT`, and the clue's number is drawn `COL_HINT` | spec: A shaded premise, a run and a clue each take their own mark |
| Scenario: a cited black square rings distinct from the forced cell | spec: Range hint color legend |
| Scenario: premises that are not shaded are outlined | spec: The forced cell and its premises take different marks |

## Range draws a shaded cell as the collection's shaded piece

| Rule | Where it went |
| --- | --- |
| Pieces on a quiet surface: a shaded cell holds the shaded piece, a cell marked not shaded the ruled-out cross with no fill, an undecided cell the plain surface, and no state is a step of gray | spec: Range draws a shaded cell as the collection's shaded piece |
| The other requirements say black and white "after upstream" | history |
| A clue sits on the lifted surface with its number in ink, and the cell lines and frame are the surface's grid line | spec: A Range clue sits on the lifted surface of a given |
| A cell in error keeps its content and takes an error frame, a number or a cross in the error color, and a piece keeps its color | spec: A Range cell in error keeps its content |
| The flash lifts every cell on its lit beats, reads in both schemes, and leaves the pieces standing | spec: The Range completion flash lifts every cell |
| The cursor and every hint mark are drawn at the cell's edge, beside the piece | spec: Range's cursor and hint marks sit at the cell's edge |
| The game names no hue: sentences, control words and legend say the collection's words, and the help page names the shaded color by placeholder | spec: Range names no hue of its own |
| Scenario: three states on one surface | spec: Range draws a shaded cell as the collection's shaded piece |
| Scenario: a clue is told by the cell under it | spec: A Range clue sits on the lifted surface of a given |
| Scenario: a shaded cell in error is still a shaded piece | spec: A Range cell in error keeps its content |
| Scenario: a hint says the word for the color the piece is drawn in | spec: Range names no hue of its own |
