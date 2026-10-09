# Ledger: tents

Base: bb004490

Where every rule of Tents' spec went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Tents game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `tents` game implements `Game`, and what the puzzle asks: the matching, no touching tents, the clued counts | spec: Tents game implements the Game interface |
| The six type arguments the game gives `Game` | untrue: `tentsGame` in `src/games/tents/index.ts` gives eight, the last its hint rungs, and the requirement now names `Game` alone |
| Params are `w`, `h` and `diff`, encoded `{w}x{h}d{e/t}` with the short form and the square shorthand | spec: Tents' parameters |
| The presets are 8×8, 10×10 and 15×15 at Easy and Normal | spec: Tents' parameters |
| The presets are "upstream's", and there are six of them | history; figure |
| `validateParams` enforces the minimum size 4×4 | untrue: `validateParams` in `src/games/tents/state.ts` has no such test. The minimum is `bounds: { min: 4 }` on the dimension fields of `paramConfig`, which `paramsError` in `src/engine/params.ts` checks before it calls the game |
| The game provides `solve` and `textFormat` | spec: Tents game implements the Game interface |
| Scenario: params round-trip | spec: Tents' parameters |
| Scenario: invalid params are rejected, restated for the engine's check | spec: Tents' parameters |

## Tents descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| The run-length code of the tree grid, then the `w + h` edge numbers, columns then rows, each after a comma | spec: Tents descriptions use the upstream run-length encoding |
| `validateDesc` rejects invalid characters, a wrong grid area, and missing or malformed numbers | spec: A malformed Tents description is rejected |
| `newState` parses into a tree grid and a shared edge-number array, with every non-tree square blank | spec: A malformed Tents description is rejected |
| Scenario: a description round-trips | spec: Tents descriptions use the upstream run-length encoding |
| Scenario: a malformed description is rejected | spec: A malformed Tents description is rejected |

## Tents computes live errors and completion as upstream

| Rule | Where it went |
| --- | --- |
| Live errors and completion are computed "exactly as upstream" `find_errors` and `execute_move` | history |
| Two adjacent tents, orthogonal or diagonal, are marked with an error diamond | spec: Adjacent tents are marked with an error diamond |
| Every adjacent pair marks a shared corner | untrue: `findErrors` in `src/games/tents/render.ts` sets a corner bit for a diagonal pair only, and for an orthogonal pair the bits `drawTile` draws at the middle of the shared edge |
| A row or column over its clue, or with tents plus blanks below it, has a red number | spec: An edge number that cannot be met is red |
| Two connected-component passes flag a tent in a component with fewer trees than tents, and a tree in one with more trees than tents or blanks | spec: An over-committed group of tents or trees is red |
| The passes use a `dsf` | reason |
| Complete when tents equal trees, every number is met, no two tents are adjacent and a perfect matching exists | spec: Tents completion is judged from the board |
| Completion is judged from the board however it was reached, and the win flash does not play for Solve | spec: Tents completion is judged from the board |
| Scenario: adjacent tents are flagged | spec: Adjacent tents are marked with an error diamond |
| Scenario: an unmet clue is flagged | spec: An edge number that cannot be met is red |
| Scenario: completion requires a valid matching | spec: Tents completion is judged from the board |

## Tents input maps drag gestures, cursor and direct keys

| Rule | Where it went |
| --- | --- |
| The drag model is "upstream's" | history |
| A press starts a one-cell drag, dragging extends it along the nearer row or column, releasing enacts it | spec: Tents places tents and grass by click and drag |
| What a left click, a right click and a right-drag do, and trees are never modified | spec: Tents places tents and grass by click and drag |
| A gesture producing no change returns no move | spec: Tents places tents and grass by click and drag |
| Arrow keys move a cursor, select and select2 set or clear its square, and `T`, `N` and `B` set it directly | spec: Tents takes a cursor and direct keys |
| A left drag between a tree and the tent or blank square beside it joins them, placing the tent, or parts them, and changes no other square | spec: A drag between a tree and the square beside it is the link gesture |
| A left drag that is not the link gesture is a click at its start | spec: A drag between a tree and the square beside it is the link gesture |
| That meaning is "upstream's" | history |
| `L` then an arrow makes the same move and takes the cursor along, and any other key disarms it | spec: L and an arrow make the link from the keyboard |
| Scenario: a left click toggles a tent | spec: Tents places tents and grass by click and drag |
| Scenario: a right-drag paints non-tents | spec: Tents places tents and grass by click and drag |
| Scenario: a drag from a tree to a blank square places its tent joined | spec: A drag between a tree and the square beside it is the link gesture |
| Scenario: the keyboard joins with L and an arrow | spec: L and an arrow make the link from the keyboard |

## Tents ships findMistakes

| Rule | Where it went |
| --- | --- |
| It re-solves with the top-difficulty solver and returns one mistake per placed square that contradicts the unique solution, never a blank, and nothing on a board that is not uniquely solvable | spec: Tents ships findMistakes |
| A mistaken square is rendered with a distinct inset red overlay | spec: Tents ships findMistakes |
| A link no pairing of the solution can hold with the links before it is a mistake, drawn in the mistake color, with its reason | spec: A link no pairing holds is a mistake |
| Scenario: a wrong tent blocks Check & Save | spec: Tents ships findMistakes |
| Scenario: blank squares are not mistakes | spec: Tents ships findMistakes |
| Scenario: a link no pairing holds is a mistake | spec: A link no pairing holds is a mistake |

## Tents solves with a graded deductive solver

| Rule | Where it went |
| --- | --- |
| The solver returns the impossible, unique or non-converged verdict at each difficulty | spec: Tents solves with a graded deductive solver |
| It links a tent with one unattached adjacent tree, and a tree with one candidate square, whether the tent is placed by that rung or is already there | spec: Tents' link rung sits beneath Easy, and its Easy rungs at Easy |
| It marks as a non-tent a blank with no adjacent unmatched tree | spec: Tents' link rung sits beneath Easy, and its Easy rungs at Easy |
| It marks as a non-tent a blank diagonally adjacent to a tent | untrue: `grassNextToTents` in `src/games/tents/solver.ts` marks a blank touching a tent on any of its eight sides, which the requirement now says |
| The Normal-tier tree diagonal-pair elimination | spec: Tents' Normal rungs are rungs of their own |
| The row and column pass places what every valid placement of the remaining tents agrees on, with the adjacent lines at Normal | spec: Tents' line count reads every placement of a line's tents |
| The solver is reused by `solve()`, the generator's gate and `findMistakes` | spec: Tents solves with a graded deductive solver |
| Scenario: generated boards solve at exactly their difficulty | spec: Tents' Normal rungs are rungs of their own |
| Scenario: solve recovers from a wrong mid-game state | spec: Tents solves with a graded deductive solver |

## Tents generates solver-gated boards reproducibly

| Rule | Where it went |
| --- | --- |
| The same seed gives the same board | spec: Tents generates solver-gated boards reproducibly |
| `w*h/5` tents at random squares no two adjacent, trees by the bipartite `matching`, no empty row or column, the edge numbers derived, and the solver gate at the target and one level below | spec: Tents generates solver-gated boards reproducibly |
| The permutation is driven by `random_upto` | history |
| The board must "fail" one level below | untrue: `newTentsDesc` in `src/games/tents/generator.ts` accepts only the non-converged verdict there, `easier === 2`, and the requirement now says "fails to converge" |
| Scenario: generation is reproducible from a seed | spec: Tents generates solver-gated boards reproducibly |

## Tents renders trees, tents, clues, errors and the completion flash

| Rule | Where it went |
| --- | --- |
| Grass-filled non-blank tiles, the tree, the tent, grid lines, the edge numbers below and to the right, and the cursor outline | spec: Tents renders trees, tents, clues and the cursor |
| The error trunk and the error leaf and tent | spec: An over-committed group of tents or trees is red |
| Adjacency diamonds with exclamation marks | spec: Adjacent tents are marked with an error diamond |
| Red numbers | spec: An edge number that cannot be met is red |
| The three-phase completion flash, trees and tents blanked on the flashed phases | spec: Tents flashes on completion in three phases |
| The flash is "upstream's" | history |
| A thin top and left border, and room for the numbers at the bottom and right | spec: Tents renders trees, tents, clues and the cursor |
| That geometry is the web build's `NARROW_BORDERS` | history |
| The drawstate diffs a packed word per tile and a separate array for the numbers, so every overlay is in the diff key | spec: Every Tents overlay is in the diff key |
| Scenario: a mistake overlay repaints an unchanged tile | spec: Every Tents overlay is in the diff key |
| Scenario: edge numbers render red on error | spec: An edge number that cannot be met is red |

## Tents' solver is a certified deduction ladder

| Rule | Where it went |
| --- | --- |
| The solver runs its deductions as a `runDeductionFixpoint` ladder | spec: Tents' solver is a certified deduction ladder |
| The ladder has seven rungs | untrue: `tentsLadder` in `src/games/tents/solver.ts` has eight. The link of a tree to a tent already on its one candidate square is a rung of its own, at Easy, and the requirement now lists it |
| The tent's link sits beneath Easy so the links-only cap runs it alone | spec: Tents' link rung sits beneath Easy, and its Easy rungs at Easy |
| The two grass rules, a tree's single candidate and the per-line count are at Easy | spec: Tents' link rung sits beneath Easy, and its Easy rungs at Easy |
| The diagonal pair and the reading of the two lines alongside are each a Tricky rung that writes only what its Tricky half deduces | spec: Tents' Normal rungs are rungs of their own; spec: Tents' line count reads every placement of a line's tents |
| A firing census walks generated boards at every cap the generator uses and asserts that every rung fires | spec: Tents' solver is a certified deduction ladder |
| The census covers the preset sizes at both tiers | untrue: the census's shapes in `src/games/tents/tents-ladder.test.ts` hold 8×8 and 10×10 at both tiers, 15×15 at Normal and not at Easy, and a 12×5. That is every preset size, both tiers and a non-square board, which the requirement now says |
| The hand-written loop is not kept | spec: Tents' solver is a certified deduction ladder |
| The loop was replaced, kept until the adoption was proved, and git holds it | history |
| Scenario: a Tricky rung nothing depends on is still certified | spec: Tents' solver is a certified deduction ladder |
| "On nearly every board" | figure |
| Scenario: a mis-tiered Tricky rung fails | spec: Tents' Normal rungs are rungs of their own |

## Tents has a link notation

| Rule | Where it went |
| --- | --- |
| The whole requirement and its scenario, unchanged | spec: Tents has a link notation |

## Tents explains the next deduction

| Rule | Where it went |
| --- | --- |
| `hint` is a recording projection of the solver's rungs, one premise per step, and the premises | spec: Tents explains the next deduction |
| Every fact a step rests on is something the player can see, and how the links are re-read before each firing | spec: A Tents hint step rests only on what the player can see |
| A pairing the rungs need beyond that is a step that draws the link, the square-placing rungs before the line counts | spec: The Tents hint draws a link for a pairing its rungs need |
| A link is drawn only when some stalled rung fires once it is drawn | untrue: `tentsHintLadder` in `src/games/tents/solver.ts` ends with a rung that draws the first pending link anyway when no single link lets a rung fire, and the requirement now states that case |
| A tree's single open square is one step placing the tent joined to that tree | spec: Tents explains the next deduction |
| Each step names why in one sentence of at most 120 characters, and its ring, outline, hatch, clue color and link | spec: A Tents hint step says why and marks what it uses |
| The hint refuses on a solved board and while `findMistakes` reports anything | spec: The Tents hint is refused on a solved or mistaken board |
| `hintKeepTrack` judges a move by the squares and links it changes, holding and shrinking a partly made step | spec: Tents' hintKeepTrack judges a move by what it changes |
| Scenario: following the hint finishes a board | spec: Tents explains the next deduction |
| Scenario: a step rests on nothing the player cannot see | spec: A Tents hint step rests only on what the player can see |
| Scenario: a link is drawn only for a step that needs it, narrowed to a firing that places a square | spec: The Tents hint draws a link for a pairing its rungs need |
| Scenario: placing a tree's tent by a click is progress | spec: Tents' hintKeepTrack judges a move by what it changes |

## Tents draws its squares on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| An undecided square is the cell surface, with the surface grid line between squares and round the grid | spec: Tents draws its squares on the collection's quiet surface |
| Grass, a tree and a tent keep the grass fill, so undecided and grass differ in hue, in both schemes | spec: Tents draws its squares on the collection's quiet surface |
| The trees and the tents keep their shapes and colors | spec: Tents renders trees, tents, clues and the cursor |
| The clues, a link, the cursor and the edge of an error diamond are in ink, not the grid's color | spec: Tents draws its squares on the collection's quiet surface |
| Scenario: undecided and grass are told apart by hue | spec: Tents draws its squares on the collection's quiet surface |
| Scenario: a link is ink on a quiet grid | spec: Tents draws its squares on the collection's quiet surface |
