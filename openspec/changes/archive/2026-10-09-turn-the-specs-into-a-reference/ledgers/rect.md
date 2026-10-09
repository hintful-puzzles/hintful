# Ledger: rect

Base: bb004490

Where every rule of Rectangles' spec went in the reference form: every rule
kept, stated once, a requirement held to the tool's 500 characters.

## Rectangles game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `rect` game implements `Game`, and what the puzzle asks | spec: Rectangles game implements the Game interface |
| The six type parameters the `Game` is given | untrue: `rectGame` in `src/games/rect/index.ts` takes eight, `RectHint` and `RectRung` after the six |
| Params are `w`, `h` and a non-negative `expandfactor` defaulting to 0, encoded `{w}x{h}` with a full-form `e{%g}` suffix when non-zero, and `{n}` is a square | spec: Rectangles' parameters and their encoding |
| Decoding reads past upstream's trailing `a` and encoding never writes it | spec: Rectangles reads past upstream's unchecked-board letter |
| The presets are the square boards of side 7 to 19 | spec: Rectangles' parameters and their encoding |
| "All 7 upstream presets" | figure |
| `validateParams` enforces an area of at least 2 | spec: Rectangles refuses params outside its bounds |
| `validateParams` enforces `w > 0`, `h > 0` and a non-negative expansion factor | untrue: `validateParams` in `src/games/rect/state.ts` checks only the area, and the engine refuses these three from the bounds `paramConfig` declares in `src/games/rect/index.ts` |
| The game provides `solve` and `textFormat`, and a completion flash suppressed after Solve | spec: Rectangles game implements the Game interface |
| `finishesByDeduction` is the solver reaching a unique placement and the hint's steps finishing the board | spec: Rectangles loads only a board its hint finishes |
| Scenario: params round-trip | spec: Rectangles' parameters and their encoding |
| Scenario: invalid params are rejected, of a small area | spec: Rectangles refuses params outside its bounds |
| Scenario: `validateParams` returns an error for a negative expansion factor | untrue: `validateParams` in `src/games/rect/state.ts` returns null for it, and the refusal "Expansion factor must be at least 0." is the engine's bounds check |
| Scenario: upstream's unchecked-board letter | spec: Rectangles reads past upstream's unchecked-board letter |
| Scenario: a board past the hint does not load | spec: Rectangles loads only a board its hint finishes |

## Rectangles descriptions use the upstream encoding

| Rule | Where it went |
| --- | --- |
| The row-major run-length encoding of empty runs and numbers | spec: Rectangles descriptions use the upstream encoding |
| The `_` separator is optional | untrue: `parseDesc` in `src/games/rect/state.ts` requires a `_` between two adjacent numbers and refuses one anywhere else |
| A desc with an unknown character or the wrong square count is refused | spec: Rectangles descriptions use the upstream encoding |
| `newState` parses the desc into the immutable numbers, with edges clear and the correctness overlay computed | spec: Rectangles descriptions use the upstream encoding |
| Scenario: a description round-trips | spec: Rectangles descriptions use the upstream encoding |
| Scenario: a malformed description is rejected | spec: Rectangles descriptions use the upstream encoding |

## Rectangles reports completion and mistakes

| Rule | Where it went |
| --- | --- |
| A cell is correct iff it belongs to a valid rectangle, and the board is completed when every cell is correct | spec: Rectangles reports completion and mistakes |
| "As `get_correct` does" | history |
| `findMistakes` re-solves and returns every drawn edge the unique solution lacks, never a missing edge, and nothing on a board that is not uniquely solvable | spec: Rectangles flags a drawn edge the solution lacks |
| Check & Save depends on the hook and refuses to save while a mistake is present | spec: Rectangles flags a drawn edge the solution lacks |
| Scenario: a wall the solution does not contain is flagged | spec: Rectangles flags a drawn edge the solution lacks |
| Scenario: a correct partial board has no mistakes | spec: Rectangles flags a drawn edge the solution lacks |

## Rectangles input and rendering

| Rule | Where it went |
| --- | --- |
| The left-drag, the right-drag, the click on an edge and the half-grid keyboard cursor with press-to-drag | spec: Rectangles input |
| The corner, center and edge allocation of a click | spec: Rectangles input |
| "Of `coord_round`" | history |
| A drag or click that changes no edge produces no move | spec: Rectangles input |
| `redraw` renders the grid, number text, corner pixels, the correct-rectangle fill, the cursor's brackets, the mistake edge color and the completion flash | spec: Rectangles rendering |
| An edge has three colors, a drawn line solid in ink among them | spec: Rectangles rendering |
| The drag-draw preview is red and the drag-erase preview blue | untrue: `colors` in `src/games/rect/render.ts` gives them `DRAG_ADD` and `DRAG_REMOVE`, which `src/engine/color/palette.ts` defines as blue and a wash of blue |
| A `BORDER` of 1 | spec: Rectangles rendering |
| "(NARROW_BORDERS)" | history |
| Scenario: a drag draws a rectangle outline | spec: Rectangles input |
| Scenario: a no-op click yields no move | spec: Rectangles input |

## Rectangles ports the solver and solver-gated generator

| Rule | Where it went |
| --- | --- |
| The solver enumerates candidate placements and runs the four deductions, and winnows number positions during generation | spec: Rectangles ports the solver and solver-gated generator |
| "The port SHALL implement `rect_solver` with its full deductive power", and the names of its `overlaps` and `rectbyplace` bookkeeping | history |
| The generator tiles a base grid, removes singletons, stretches it in two passes, calls the solver on every layout and encodes the desc | spec: Rectangles generates by tiling, stretching and solving |
| "(`new_game_desc`)" | history |
| `solve` runs the solver from the fixed numbers and returns the unique solution's edges, or the generator's `aux` when present | spec: Rectangles' Solve returns the unique solution's edges |
| Scenario: generated boards are uniquely solvable | spec: Rectangles ports the solver and solver-gated generator |

## Rectangles offers an explained hint that reads only the board

| Rule | Where it went |
| --- | --- |
| Every step draws one rectangle or one line and says why, reasoning only from the clues and the lines drawn | spec: Rectangles offers an explained hint that reads only the board |
| What a clue's fits are | spec: Rectangles offers an explained hint that reads only the board |
| The five things a step is | spec: A Rectangles hint step is one of five deductions |
| When a fit across an edge is ruled out, and the words name the clues that could cross and why they cannot | spec: A line step names the clues that cannot cross the edge |
| An edge no fit crosses is not a step, since a line there changes no fit | spec: A line step names the clues that cannot cross the edge |
| The rectangle a step draws is ringed as the contour of its squares | spec: A hint's rectangle is ringed as the contour of its squares |
| The hint refuses on a board with a wrong line | spec: Rectangles offers an explained hint that reads only the board |
| Scenario: a clue with one fit | spec: A Rectangles hint step is one of five deductions |
| Scenario: the player draws the rectangle a side at a time | spec: Rectangles offers an explained hint that reads only the board |
| Scenario: a line records a fit that is ruled out | spec: A line step names the clues that cannot cross the edge |
| Scenario: upstream's 10x10 board is hinted to the end | spec: Rectangles offers an explained hint that reads only the board |

## Rectangles deals only boards its hint can finish

| Rule | Where it went |
| --- | --- |
| The generator deals only boards the hint's steps finish from an empty board, dealing again otherwise | spec: Rectangles deals only boards its hint can finish |
| Such a seed's desc differs from upstream's | spec: Rectangles deals only boards its hint can finish |
| Scenario: a board past the hint is dealt again | spec: Rectangles deals only boards its hint can finish |

## Rectangles draws its squares on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| Every square on the cell surface with the thin grid line, a number on the lifted surface of a given and itself in ink | spec: Rectangles draws its squares on the collection's quiet surface |
| The rectangles' edges and the board's outer edge stay in ink at full width | spec: Rectangles draws its squares on the collection's quiet surface |
| A correct rectangle fills whole with the finished-region role, the number's square included, told by hue in both schemes | spec: A finished rectangle fills whole with the finished-region role |
| The keyboard cursor is brackets in the cursor color at its square's corners, beside the number, with no fill | spec: The Rectangles cursor is brackets at its square's corners |
| Scenario: a number is told by the cell under it | spec: Rectangles draws its squares on the collection's quiet surface |
| Scenario: a finished rectangle shades whole | spec: A finished rectangle fills whole with the finished-region role |
| Scenario: the cursor leaves the square's surface alone | spec: The Rectangles cursor is brackets at its square's corners |
