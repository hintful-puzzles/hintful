# Ledger: singles

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Singles game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `singles` game implements `Game`, and the rules of Hitori on a `w × h` grid | spec: Singles game implements the Game interface |
| The six type arguments the game is typed with | untrue: `singlesGame` is typed with eight arguments, `SinglesHint` and `SinglesRung` after the six listed (`src/games/singles/index.ts`), and the requirement now says `Game` |
| The puzzle is Nikoli's | history |
| Params are `w`, `h` and `diff`, encoded `{w}x{h}d{c}` when full and `{w}x{h}` otherwise | spec: Singles params are a size and a difficulty |
| Presets at 5×5, 6×6, 8×8, 10×10 and 12×12 in both Easy and Normal | spec: Singles params are a size and a difficulty |
| `w` and `h` at least 2, and a known difficulty | spec: Singles params are refused outside their bounds |
| Both at most 62 | untrue: the dimension items declare `max: MAX_DIM`, which is `DESC_ALPHABET_SIZE - 1`, 61 (`src/games/singles/state.ts`), and a height of 62 is refused with "Height must be at most 61." |
| The bounds are required by `validateParams` | untrue: the game's `validateParams` checks only the Normal tier on a small grid, and the bounds and the choice are refused by the engine's `paramsError` from the declared items (`src/engine/params.ts`) |
| A known difficulty is required only when full | untrue: `itemError` checks a choice against its list whether or not the params are full (`src/engine/params.ts`) |
| The game provides `solve` and `textFormat` and no `statusbarText` | spec: Singles game implements the Game interface |
| Scenario: params round-trip | spec: Singles params are a size and a difficulty |
| Scenario: invalid params are rejected | spec: Singles params are refused outside their bounds |

## Singles descriptions are fixed-length number grids

| Rule | Where it went |
| --- | --- |
| One character per cell in scan order, in the three ranges of the alphabet | spec: Singles descriptions are fixed-length number grids |
| The length equals `w·h` exactly and every number lies in `1..max(w,h)` | spec: Singles descriptions are fixed-length number grids |
| The check is the game's `validateDesc` | untrue: the game declares no validator, and the refusal is raised by `newState` through `parseDesc` (`src/games/singles/state.ts`), from which the engine derives the verdict (`src/engine/desc-error.ts`) |
| `newState` decodes into an immutable `nums` grid with all flags blank | spec: Singles descriptions are fixed-length number grids |
| Both scenarios | spec: Singles descriptions are fixed-length number grids |

## Singles toggle moves and cursor

| Rule | Where it went |
| --- | --- |
| A left-click or `CURSOR_SELECT` toggles black, a right-click or `CURSOR_SELECT2` toggles circled, and either clears a cell already set | spec: Singles toggle moves |
| A click outside the grid toggles the show-black-numbers preference, as a `UI_UPDATE` | spec: A click outside the Singles grid toggles show-black-numbers |
| Keyboard cursor moves move the cursor and return `UI_UPDATE`, revealing it on the first arrow press | spec: Singles keyboard cursor moves are not history moves |
| `executeMove` clears both bits on each targeted cell before applying the new value | spec: Singles moves replace a cell's mark, and completion is read from the board |
| `executeMove` sets the board completed when `checkComplete` reports no errors | untrue: `SinglesState` has no completed field and `executeMove` only marks errors, while `status` reads `checkComplete` off the board (`src/games/singles/solver.ts`), which the requirement now states |
| Scenario: left-click cycles a cell | spec: Singles toggle moves |
| Scenario: completion is detected | spec: Singles moves replace a cell's mark, and completion is read from the board |

## Singles deductive solver

| Rule | Where it went |
| --- | --- |
| The solver's techniques, and which are Normal and above | spec: Singles deductive solver |
| The techniques reproduce upstream's | history |
| The solver detects impossibility | spec: Singles deductive solver |
| `solve` tries the current state and then the initial one, and returns the move or an error | spec: Singles solve tries the current board, then the initial one |
| `solve` marks the state as solved-with-help | untrue: no state field records it, the move carries `solve: true` (`diffMove` in `src/games/singles/index.ts`) and the midend keeps the record of the solver's use (`src/engine/midend.ts`) |
| Scenario: solver completes a generated board | spec: Singles deductive solver |
| Scenario: solve reports failure | spec: Singles solve tries the current board, then the initial one |

## Singles rendering

| Rule | Where it went |
| --- | --- |
| Pieces on a quiet surface: the cell surface, the grid line, the frame, the shaded piece, a plain undecided cell, no step of gray | spec: Singles draws pieces on a quiet surface |
| A circled cell holds an unfilled ring in the ruled-out color and no other mark | spec: A circled Singles cell is a ring round its number |
| A cell with no piece always shows its number in ink, and a blackened one only by preference, pinned and smaller | spec: A Singles number is always shown off a piece, and on one by preference |
| An erroneous cell is drawn in the error color, and the grid lines and frame are when the board is impossible | spec: Singles errors are drawn in the error color |
| The cursor is corner brackets, and the hint's marks and the Check & Save outline are bands at the edge | spec: Singles edge marks land beside the piece and the ring |
| The completion flash lifts the surface of every cell that holds no piece | spec: Singles completion flash |
| The flash is withheld from a solved-with-help completion | untrue: `becameSolved` withholds it from the Solve command's own transition only, and a board finished by hand after a Solve flashes (`src/engine/midend.ts`), so the requirement now says the Solve command's |
| The game names no hue of its own, in hint sentences, control words, the preference's label and the help page | spec: Singles names no hue of its own |
| Scenario: a blackened cell holds the piece with no number by default | spec: A Singles number is always shown off a piece, and on one by preference |
| Scenario: an erroneous cell renders in the error color | spec: Singles errors are drawn in the error color |
| Scenario: a circled cell is a ring that stands in by more than a hint's band | spec: A circled Singles cell is a ring round its number |
| Scenario: a hint names the color the piece is drawn in | spec: Singles names no hue of its own |

## Singles show-black-numbers preference

| Rule | Where it went |
| --- | --- |
| One boolean preference, its keyword, its label, where it is stored and its default | spec: Singles show-black-numbers preference |
| Scenario: the preference toggles numbers on black squares | spec: Singles show-black-numbers preference |

## Singles mistake-checking

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the numbers and returns every contradicting cell, never an undecided one, and nothing on a consistent board | spec: Singles mistake-checking |
| Both scenarios | spec: Singles mistake-checking |

## Singles provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| `hint` returns a plan-carrying narrated hint that explains why each move is forced, and `hintKeepTrack` advances it | spec: Singles provides an explained deduction hint |
| The explanation is the fork's hint quality bar | reason |
| A hint is refused on a solved board and on one where `findMistakes` is non-empty | spec: A Singles hint is refused on a solved or mistaken board |
| The game's `hint` gives those two refusals | untrue: `computeHintPlan` returns `ALREADY_SOLVED` and `FIX_MISTAKES_FIRST` before it calls the game (`src/engine/midend.ts`), and the game's `hint` refuses only when the solver forces nothing (`src/games/singles/index.ts`) |
| `hint` runs the solver from the player's marks and returns the ordered steps, the remaining solution | spec: Singles provides an explained deduction hint |
| The narration states a number pattern: sandwich, adjacent pair, corner, offset pair | spec: A Singles hint step states the number pattern that forces its cell |
| The narration states a decided cell: last neighbor, split, shaded neighbor, circled copy | spec: A Singles hint step states the decided cell that forces its cell |
| A deduction forcing two cells at once is one multi-cell step | spec: A deduction that forces two Singles cells is one step |
| The target is ringed in the hint color at the edge and drawn without the forced mark | spec: A Singles hint draws its target without the forced mark |
| The evidence is outlined at the edge, and every step carries at least one outlined cell | spec: A Singles hint outlines its evidence |
| An undecided evidence cell takes the evidence color | spec: The forced cell, the number premises and the corner have their own colors |
| A decided evidence cell takes a color of its kind | spec: A decided premise in a Singles hint takes the color of its state |
| The row or column a sentence names is striped | spec: The forced cell, the number premises and the corner have their own colors |
| Distinct premise roles take distinct colors, the corner apart from the matching pair, and the three roles are disjoint | spec: Distinct premise roles in a Singles hint take distinct colors |
| Every corner narration names the actual numbers, and the one from two matching numbers follows the contradiction order | spec: A Singles corner deduction is narrated as a contradiction |
| The corner sentence's shape, with the collection's words | spec: The Singles corner sentence has one shape |
| That order and shape hold of every corner deduction | untrue: only `say.corner2` ends that the target stays not shaded, and the three- and four-number sentences end that their cell must be shaded (`src/games/singles/hint-text.ts`), so the order and the shape now name the deduction from two matching numbers, while all three sentences name the board's numbers |
| `hintKeepTrack` reports completed, onTrack with the step shrunk in place, or off | spec: Singles hint tracking follows a step cell by cell |
| Scenario: hint explains the next forced move | spec: Singles provides an explained deduction hint |
| Scenario: a two-cell firing is one step | spec: A deduction that forces two Singles cells is one step |
| Scenario: a corner deduction separates the corner from the matching pair | spec: Distinct premise roles in a Singles hint take distinct colors; spec: A Singles corner deduction is narrated as a contradiction |
| Scenario: every hint step shows visible evidence | spec: A Singles hint outlines its evidence |
| Scenario: hint refuses on a solved or mistaken board | spec: A Singles hint is refused on a solved or mistaken board |
| Scenario: following the hint advances the plan | spec: Singles hint tracking follows a step cell by cell |

## Singles hint color legend

| Rule | Where it went |
| --- | --- |
| A stable legend, consistent across deductions, in which no role is a fill | spec: Singles hint roles are bands and stripes, never fills |
| The forced cell is banded `COL_HINT` with no mark preview, a number premise `COL_HINT_CELL`, the protected corner `COL_HINT_STRAND`, and the named line striped `COL_HINT` | spec: The forced cell, the number premises and the corner have their own colors |
| A decided shaded premise is banded `COL_HINT_BLACKREF` and a circled one `COL_HINT_WHITEREF`, chosen from the cell's state, with its piece or ring left drawn | spec: A decided premise in a Singles hint takes the color of its state |
| Which cell takes which mark is read from the step's words, with `strand` telling the corner | spec: A Singles hint's marks are read from the step's words |
| The three highlight roles are disjoint | spec: Distinct premise roles in a Singles hint take distinct colors |
| Scenario: a cited shaded square rings distinct from the forced cell | spec: A decided premise in a Singles hint takes the color of its state |
| Scenario: a cited ringed white square uses the white-reference color | spec: A decided premise in a Singles hint takes the color of its state |
| Scenario: number premises and corners take their own colors | spec: The forced cell, the number premises and the corner have their own colors |

## Singles generates unique, difficulty-graded boards

| Rule | Where it went |
| --- | --- |
| A Latin rectangle, black squares added with solver assistance, numbers under them that keep the solution unique | spec: Singles generates unique, difficulty-graded boards |
| A board is accepted only when solvable at its difficulty and not one level below with the sneaky deduction | spec: Singles generates unique, difficulty-graded boards |
| Difficulty downgrades to Easy when `min(w, h) < 4` | untrue: `newSinglesDesc` generates at the difficulty asked for, and `validateParams` refuses Normal when generating only where both `w` and `h` are under 4 (`src/games/singles/state.ts`); spec: Normal is refused on a Singles grid under 4 squares both ways |
| Generation from a seed is reproducible | spec: Singles generates unique, difficulty-graded boards |
| Both scenarios | spec: Singles generates unique, difficulty-graded boards |
