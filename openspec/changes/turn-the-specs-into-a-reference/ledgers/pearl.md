# Ledger: pearl

Base: bb004490

Where every rule of Pearl's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Pearl descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| The run-length encoding of unclued runs, `B` and `W`, what `validateDesc` rejects, and what `newState` parses | spec: Pearl descriptions use the upstream run-length encoding |
| Scenario: a description round-trips | spec: Pearl descriptions use the upstream run-length encoding |
| Scenario: a malformed description is rejected | spec: Pearl descriptions use the upstream run-length encoding |

## Pearl reports completion and mistakes

| Rule | Where it went |
| --- | --- |
| The board is solved exactly while the lines form one closed loop satisfying every clue | spec: Pearl reports completion and mistakes |
| Always-on error marks from a union-find loop classification flag squares of degree over two and clue contradictions | spec: Pearl reports completion and mistakes |
| The rules are those of `check_completion` | history |
| The error marks flag non-reciprocal links | untrue: `checkCompletion` in `src/games/pearl/moves.ts` returns `valid: false` for a line with no reciprocal and `executeMove` throws "pearl: invalid move", so the move is refused and nothing is marked |
| `findMistakes` re-solves and returns every drawn segment the solution lacks and every cross on an edge it has | spec: Pearl's findMistakes compares the board with its one solution |
| A missing solution segment is not a mistake, and a board the solver cannot finish yields none | spec: Pearl's findMistakes compares the board with its one solution |
| Check & Save depends on the hook and refuses to save while a mistake is present | spec: Pearl's mistakes gate Check & Save and draw apart from its error marks |
| The error marks and the overlay are distinct signals, and the overlay draws a wrong cross in the mistake color | spec: Pearl's mistakes gate Check & Save and draw apart from its error marks |
| Scenario: a line the solution does not contain is flagged | spec: Pearl's findMistakes compares the board with its one solution |
| Scenario: a cross on an edge the solution uses is flagged | spec: Pearl's findMistakes compares the board with its one solution |
| Scenario: a correct partial board has no mistakes | spec: Pearl's findMistakes compares the board with its one solution |

## Pearl input and rendering

| Rule | Where it went |
| --- | --- |
| A drag along grid edges commits the traced path as line-segment flips, with marks as barriers and the loop-closure degree rule | spec: Pearl draws the loop by dragging along grid edges |
| No-line crosses are marked with the secondary drag | spec: Pearl marks no-line crosses with the secondary drag |
| Laying a line over a mark is rejected | spec: Pearl marks no-line crosses with the secondary drag |
| A keyboard cursor draws lines or marks with modifiers | spec: Pearl's keyboard cursor draws lines and marks |
| A drag or click that changes nothing produces no move | spec: A Pearl input that changes nothing makes no move |
| The game declines `H`, and the autosolve move still replays from a saved game | spec: Pearl leaves the H key to the app |
| What `redraw` renders | spec: What Pearl draws |
| Scenario: a drag draws a loop path | spec: Pearl draws the loop by dragging along grid edges |
| Scenario: a no-op drag yields no move | spec: A Pearl input that changes nothing makes no move |

## Pearl game is registered and implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `pearl` game implements `Game`, and what the puzzle asks of the loop | spec: Pearl game is registered and implements the Game interface |
| `Game` takes the six type arguments listed | untrue: `pearlGame` in `src/games/pearl/index.ts` gives `Game` eight, the six listed and then `PearlHint` and `PearlRung` |
| The params, their encoding, and upstream's trailing `n` left unread and never written | spec: Pearl's parameters |
| `validateParams` enforces `w ≥ 5` and `h ≥ 5` | untrue: `validateParams` in `src/games/pearl/state.ts` has no such test. `paramConfig` declares `bounds: { min: 5 }` and the engine's `paramsError` refuses on it. Restated in spec: Pearl's parameter bounds |
| `validateParams` enforces that the area does not overflow and that a Normal board has `w + h ≥ 11` | spec: Pearl's parameter bounds |
| Eight presets: 6×6, 8×8, 10×10 and 8×12, each at Easy and Normal | spec: Pearl's presets |
| The 8×12 is upstream's 12×8 turned | history |
| The game provides `solve` and `textFormat`, and a completion flash suppressed after Solve | spec: Pearl game is registered and implements the Game interface |
| The two appearance styles are chosen by an `appearance` preference, traditional by default | spec: Pearl's appearance preference |
| Scenario: params round-trip | spec: Pearl's parameters |
| Scenario: the Normal tier requires a large enough board | spec: Pearl's parameter bounds |
| Scenario: upstream's unchecked-board letter | spec: Pearl's parameters |

## Pearl ports the deductive solver and solver-gated generator

| Rule | Where it went |
| --- | --- |
| The solver is pure iterative propagation over the edge and square workspace, with the Normal tier adding the premature-short-loop rules | spec: Pearl's solver is pure constraint propagation |
| It implements `pearl_solve`, as a port | history |
| The three-valued verdict, and a grading routine returning the easiest tier that is unique | spec: Pearl's solver is pure constraint propagation |
| The generator builds a loop through `generateLoop`, derives a maximal clue set, gates on the solver at the tier and against the tier below, and minimizes greedily | spec: Pearl's generator gates every board on the solver |
| A 5×5 Normal request is generated at Easy | untrue: `newClues` in `src/games/pearl/generator.ts` passes `params.difficulty` to the solver unchanged, and `validateParams` refuses a Normal board with `w + h < 11`, so a 5×5 Normal request never reaches the generator |
| `solve` returns the generator's aux when present, else re-solves from the clues | spec: Pearl's Solve uses the generator's solution when it has one |
| Scenario: generated boards are uniquely solvable at their difficulty | spec: Pearl's generator gates every board on the solver |

## Pearl's solver is a certified deduction ladder

| Rule | Where it went |
| --- | --- |
| The `runDeductionFixpoint` ladder, its rungs and their tiers, and the closed-loop rung ending it through `settled` | spec: Pearl's solver is a certified deduction ladder |
| The ladder has five rungs | figure |
| The shortcut-loop rule sits at Tricky | untrue: `tierNames(DIFF_COUNT)` in `src/games/pearl/state.ts` names the two tiers Easy and Normal, and the rung in `src/games/pearl/solver.ts` is declared at `DIFF_TRICKY`, the constant for the Normal tier. Restated as Normal in spec: Pearl's solver is a certified deduction ladder |
| A firing census walks generated boards at both tiers and both caps and asserts every rung fires | spec: Every rung of Pearl's ladder fires on a census |
| The hand-written loop the ladder replaced is not kept | spec: Pearl's solver is a certified deduction ladder |
| Once the adoption is proved, and git holds it | history |
| Scenario: a silenced rung fails | spec: Every rung of Pearl's ladder fires on a census |
| Scenario: a mis-tiered shortcut rung fails | spec: Pearl's solver is a certified deduction ladder |

## Pearl explains the next deduction

| Rule | Where it went |
| --- | --- |
| `hint` is a recording projection of the solver ladder, one premise per step, and the premises | spec: Pearl explains the next deduction |
| Every fact a step rests on is an edge or a pearl: shapes re-read before each firing, and a ruled-out shape counting only through the edges it settles | spec: A Pearl hint step rests only on edges and pearls |
| No step asks for a cross beside a square that has its two lines | spec: A Pearl hint step asks for no cross the square already shows |
| Each step names why in one sentence of at most 120 characters, draws each decided edge in the action color, and outlines the squares it reasons from | spec: A Pearl hint step says why and marks what it decides |
| The hint refuses on a solved board and while `findMistakes` reports anything | spec: Pearl explains the next deduction |
| `hintKeepTrack` judges a move by the edges it changes, holding and shrinking a partly made step | spec: Pearl's hint follows a step made one edge at a time |
| Scenario: following the hint finishes a board | spec: Pearl explains the next deduction |
| Scenario: a step rests on nothing the player cannot mark | spec: A Pearl hint step rests only on edges and pearls |
| Scenario: a wrong cross is refused | spec: Pearl explains the next deduction |

## Pearl's hint draws a black pearl's arm whole

| Rule | Where it went |
| --- | --- |
| A step also draws, in the same step and move, every open edge the pearls' rules carry on from its lines, and from those in turn | spec: Pearl's hint draws a black pearl's arm whole |
| The black pearl's sentence says its line runs through the next square, a white carry is said in a second sentence, and no carried line goes unnamed | spec: Pearl's hint names every line it carries on |
| Scenario: a black pearl's forced edge comes with its run-on | spec: Pearl's hint draws a black pearl's arm whole |
| Scenario: a line into a white pearl comes out the other side | spec: Pearl's hint names every line it carries on |

## Pearl draws its loop on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| Every square is the cell surface, the grid lines and frame or the dots and their lines are the surface grid line, and the loop is ink | spec: Pearl draws its loop on the collection's quiet surface |
| The pearls are a black and a white that are the same in both schemes, the white pearl's black outline parts it from the loop, and the black pearl carries an ink rim | spec: Pearl's pearls are the same black and white in both schemes |
| The keyboard cursor is brackets at the corners of its square and does not fill it | spec: Pearl's keyboard cursor is brackets at its square's corners |
| Scenario: the loop reads in the dark scheme | spec: Pearl draws its loop on the collection's quiet surface |
| Scenario: a black pearl reads on a fresh dark board | spec: Pearl's pearls are the same black and white in both schemes |
| Scenario: the cursor leaves the square's surface alone | spec: Pearl's keyboard cursor is brackets at its square's corners |
