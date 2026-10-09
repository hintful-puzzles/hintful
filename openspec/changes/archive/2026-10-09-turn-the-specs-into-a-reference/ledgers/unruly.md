# Ledger: unruly

Base: bb004490

Where every rule of Unruly's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Unruly game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `unruly` game implements `Game`, the binary puzzle on a `w2 × h2` grid of the two-state pair, with no run of three and equal counts in every line | spec: Unruly game implements the Game interface |
| The five type arguments of `Game` | untrue: `unrulyGame` in `src/games/unruly/index.ts` is a `Game` of eight type arguments, with `UnrulyMistake`, `UnrulyHint` and `UnrulyRung` after the five, so the spec says `Game` |
| The `unique` variant forbids two identical rows and two identical columns | spec: The unique variant forbids identical rows and columns |
| The params, what each is, and how they encode | spec: Unruly's params are a size, the unique variant and a difficulty |
| The presets are four sizes across the offered difficulties and one unique board | spec: Unruly's presets are four sizes and one unique board |
| `validateParams` rejects an odd dimension, too large an area, and a `unique` grid past the distinct-rows bound | spec: Unruly refuses params no board can be dealt for |
| `validateParams` rejects a dimension below 6 and an unknown difficulty | untrue: `validateParams` in `src/games/unruly/state.ts` checks neither, and `paramsError` in `src/engine/params.ts` refuses both, from the size items' `bounds: { min: 6 }` and the difficulty item's choice list |
| It provides `solve` and `textFormat` and not `statusbarText` | spec: Unruly game implements the Game interface |
| Scenario: params round-trip | spec: Unruly's params are a size, the unique variant and a difficulty |
| The scenario's `DIFF_NORMAL` as the name of the Tricky tier | held: src/games/unruly/constants.ts "export const DIFF_NORMAL = 2" |
| Scenario: invalid params are rejected | spec: Unruly refuses params no board can be dealt for |

## Unruly descriptions are run-length color grids

| Rule | Where it went |
| --- | --- |
| The desc is the clue cells in scan order in the run-length alphabet, summing to `w2·h2 + 1` | spec: Unruly descriptions are run-length color grids |
| `validateDesc` rejects any other character and a wrong decoded length | spec: A malformed Unruly description is refused |
| `newState` parses clues as immutable colored cells and leaves the rest empty | spec: A malformed Unruly description is refused |
| Scenario: a description round-trips | spec: Unruly descriptions are run-length color grids |
| Scenario: a malformed description is rejected | spec: A malformed Unruly description is refused |

## Unruly generates uniquely solvable boards at the target difficulty

| Rule | Where it went |
| --- | --- |
| A random valid full grid is built by shuffled placement and forward solving, retried until valid | spec: Unruly generates uniquely solvable boards at the target difficulty |
| Clues are winnowed in shuffled order while the solver at the target difficulty still finishes | spec: Unruly generates uniquely solvable boards at the target difficulty |
| Every generated board passes `validateDesc` and is solvable at its target difficulty | spec: Unruly generates uniquely solvable boards at the target difficulty |
| Above Easy, a board the solver one level easier finishes is rejected and regenerated | spec: A board above Easy needs its own tier |
| Scenario: generated boards are valid and solvable | spec: Unruly generates uniquely solvable boards at the target difficulty |

## Unruly solves boards with deductive techniques gated by difficulty

| Rule | Where it went |
| --- | --- |
| The solver applies its techniques to a fixpoint, gated by difficulty, and returns the maximum difficulty whose technique fired, or that none did | spec: Unruly solves boards with deductive techniques gated by difficulty |
| When no technique fired the solver returns "already solved" | untrue: `solveGame` in `src/games/unruly/solver.ts` runs with `baseGrade: -1` and returns `-1` when no technique fired, whether the board was already solved or the solver is stuck, so the spec says it returns that none did |
| The two Easy techniques | spec: The Easy techniques are the impending three and the single gap |
| The two Normal techniques, the second in `unique` mode | spec: The Normal techniques are the completed count and the unique-rows conflict |
| The Tricky technique | spec: The Tricky technique is the near-complete line |
| The `DIFF_TRIVIAL`, `DIFF_EASY` and `DIFF_NORMAL` identifiers of the three tiers | held: src/games/unruly/constants.ts "export const DIFF_TRIVIAL = 0" |
| The name `solveGame` for the function that returns the grade | held: src/games/unruly/solver.ts "export function solveGame(" |
| `solve` runs the full solver and returns the completing grid, or an error | spec: Solve runs the full solver |
| Scenario: the impending-three rule forces the third cell | spec: The Easy techniques are the impending three and the single gap |
| Scenario: Solve completes a generated board | spec: Solve runs the full solver |

## Unruly marks cells via three-state cycling moves

| Rule | Where it went |
| --- | --- |
| A move places a color or empty, or applies a solution grid, and `executeMove` is pure and rejects a bad target | spec: An Unruly move places a piece or applies a solution |
| The moves are upstream's `P{c},{x},{y}` and `S` | history |
| The board is solved exactly while counts-valid and run-valid, however it was reached | spec: The board is solved while its counts and runs are valid |
| Left and right cycle the three states in opposite orders, a clue cell is inert, and an input that changes nothing adds no history | spec: Unruly marks cells via three-state cycling moves |
| A keyboard cursor moves within the grid | spec: Unruly's keys place and clear at the cursor |
| The `1` key places one, `0` or `2` zero, and Backspace clears, stated without a condition | untrue: `interpretMove` in `src/games/unruly/index.ts` takes a digit only while `ui.cursor.visible` and applies it at the cursor, and the erase verb's keys are `ERASE_KEYS` of `src/engine/target-verb.ts`, Backspace and Delete, which `interpretTargetVerbs` applies only at a shown cursor |
| Scenario: left and right cycle in opposite directions | spec: Unruly marks cells via three-state cycling moves |
| Scenario: immutable cells reject marking | spec: Unruly marks cells via three-state cycling moves |
| Scenario: completing the board is detected | spec: The board is solved while its counts and runs are valid |

## Unruly renders the grid with live error highlighting and a completion flash

| Rule | Where it went |
| --- | --- |
| Pieces on a quiet surface, a given told by a lifted surface, and no hue of the game's own for either state | spec: Unruly draws pieces on a quiet surface |
| The count badge and the unique-match bar, recomputed each frame | spec: Unruly draws its error overlays live |
| A red bar spans a three-in-a-row run | untrue: `drawErrRectangle` in `src/games/unruly/render.ts` draws a thick rectangle outline around the run with `drawThickRectOutline`, in `COL_ERROR`, and only the unique-match overlay is a bar |
| The cursor outline, and the flash lifting every cell on its first and last frames | spec: Unruly draws a cursor outline and a completion flash |
| Scenario: a three-in-a-row reddens live | spec: Unruly draws its error overlays live |
| Scenario: the completion flash plays once | spec: Unruly draws a cursor outline and a completion flash |
| Scenario: a given is told from a placed piece by its cell | spec: Unruly draws pieces on a quiet surface |

## Unruly checks player marks against the unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the clues alone and returns each contradicting player cell, none on an undeduced board or consistent marks, and is pure | spec: Unruly checks player marks against the unique solution |
| A flagged cell draws an inset error-colored outline apart from the live overlays | spec: A flagged mark is outlined apart from the live errors |
| Scenario: a wrong mark is flagged and a correct one is not | spec: Unruly checks player marks against the unique solution |
| Scenario: Check & Save refuses a mistaken board | spec: A flagged mark is outlined apart from the live errors |

## Unruly provides an explained deduction hint and a placement animation

| Rule | Where it went |
| --- | --- |
| `hint` returns a narrated plan of the forced cells deduced from the player's marks at full strength, and `hintKeepTrack` advances it | spec: Unruly provides an explained deduction hint |
| "The fork's hint quality bar" as the name of the standard | guide: docs/games/hints.md § "The quality bar" |
| A hint is refused on a solved or mistaken board, by the midend, with its reason | spec: A hint is refused on a solved or mistaken board |
| Each step's narration states which of the four techniques forces its cell | spec: A hint step states the technique that forces its cell |
| A sentence names a piece's color in the palette's word | spec: A hint names a piece by the palette's word |
| The moves of one firing are one journey through `continuesPrevious` | spec: A firing that forces several cells is one journey |
| `hintKeepTrack` reports `"completed"` on the hinted cell and value and `"off"` otherwise | spec: hintKeepTrack completes on the hinted cell and value |
| The displayed step's ring, outline and stripes, and visible evidence on every step | spec: A displayed step carries the marks its sentence refers to |
| A placement grows and a removal shrinks, geometric, settling to the plain piece, beside the flash | spec: A placement animates as a growing fill |
| A hint-executed move plays stretched to the hint-step duration | spec: A hint-executed placement plays at the hint-step duration |
| Scenario: hint explains the next forced move | spec: Unruly provides an explained deduction hint |
| Scenario: one firing reads as one journey | spec: A firing that forces several cells is one journey |
| Scenario: every hint step shows visible evidence | spec: A displayed step carries the marks its sentence refers to |
| Scenario: hint refuses on a solved or mistaken board | spec: A hint is refused on a solved or mistaken board |
| Scenario: following the hint advances the plan | spec: hintKeepTrack completes on the hinted cell and value |
| Scenario: a placement animates as a growing fill | spec: A placement animates as a growing fill |

## Unruly's hint marks are told apart by color and by place

| Rule | Where it went |
| --- | --- |
| A stable legend, each color with a non-color cue, every mark at the cell's edge, consistent across the four techniques | spec: Unruly's hint marks are told apart by color and by place |
| The forced cell is ringed `COL_HINT` and not filled, with its reason | spec: The forced cell is ringed and never filled |
| The named line is hatched `COL_HINT` under its pieces | spec: The named line is hatched under its pieces |
| The premise cells of each technique are ringed `COL_HINT_REF` and keep their own appearance | spec: A cited premise is ringed apart from the move |
| The `nearcomplete` premise is the reserved window alone | untrue: `markedOf` in `src/games/unruly/index.ts` outlines the window and, when `reason.anchor >= 0`, the piece beside it as well |
| One premise ring color and not one per kind of piece, with its reason | spec: Unruly uses a single premise ring color |
| Scenario: a cited premise rings distinct from the forced cell | spec: Unruly's hint marks are told apart by color and by place |
