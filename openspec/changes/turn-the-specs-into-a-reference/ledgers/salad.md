# Ledger: salad

Base: bb004490

Where every rule of Salad's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Salad game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/salad/` implements `Game` and is registered, in both game modes | spec: Salad game implements the Game interface |
| The four parameters, and a game ID that encodes them and round-trips | spec: Salad's parameters |
| `nums` at least 2, at most 9 and less than `order`, and `order` at least 3 | spec: Salad's parameters |
| "Validation" requires all four limits | untrue: `validateParams` in `src/games/salad/state.ts` refuses only `nums >= order`, and the other three are the `bounds` of the `paramConfig` items there, which the engine enforces |
| "Matching upstream" | history |
| It declares `findMistakes`, and its keypad holds the symbol keys and the two markers | spec: Salad declares a mistake check and an on-screen keypad |
| Scenario: every preset produces a uniquely-solvable board | spec: Salad game implements the Game interface |
| Scenario: a game ID round-trips | spec: Salad's parameters |

## Salad descriptions use the upstream run-length block encoding

| Rule | Where it went |
| --- | --- |
| The run-length block encoding, and which arrays each mode's description holds | spec: Salad descriptions use the upstream run-length block encoding |
| Validation rejects too many or too few squares and tells them apart, an out-of-range clue value, and an unknown character | spec: A Salad description is validated against its arrays |
| The rejections reproduce the upstream messages | untrue: `readSection` and `parseDesc` in `src/games/salad/state.ts` fail with `DESC_TOO_LONG`, `DESC_OUT_OF_RANGE` and `descBadCharacter`, and the reader with `DESC_TOO_SHORT`, the collection's own sentences in `src/engine/desc-error.ts` |
| Scenario: a generated description round-trips | spec: Salad descriptions use the upstream run-length block encoding |
| Scenario: the wrong number of squares is rejected | spec: A Salad description is validated against its arrays |

## Salad ports the solver as a shared Latin-square consumer

| Rule | Where it went |
| --- | --- |
| The solver is built on `engine/latin.ts` and adds the border-clue deduction in ABC End View mode | spec: Salad ports the solver as a shared Latin-square consumer |
| The empty square is the cube's repeated symbol, a cross is it placed and a ball it struck, and the markers are read back off the cube | spec: Salad's solver reasons about the empty square directly |
| The cube's own positional, numeric and set eliminations reason about empty squares directly | spec: Salad's empty-square deductions are the shared cube's own |
| Two difficulties, Easy and Normal, both pure deduction | spec: Salad ports the solver as a shared Latin-square consumer |
| The generator strips clues in a randomized order while the board stays uniquely solvable at the target difficulty, and is reproducible from a seed | spec: Salad's generator strips clues while the board stays uniquely solvable |
| Scenario: the solver deduces the unique solution without guessing | spec: Salad ports the solver as a shared Latin-square consumer |
| Scenario: generation is reproducible from a seed | spec: Salad's generator strips clues while the board stays uniquely solvable |

## Salad input, marking and completion

| Rule | Where it went |
| --- | --- |
| A cell is selected and takes a symbol, an empty marker or a not-empty marker, with pencil marks for notes | spec: Salad selects a square and enters a symbol or a marker |
| The arrow keys move a cursor and the select key toggles ink and pencil | spec: Salad selects a square and enters a symbol or a marker |
| Left-click selects for ink entry and right-click for pencil entry, with the sticky pencil preference off | spec: Salad selects a square and enters a symbol or a marker |
| Left-click always selects for ink entry and right-click always for pencil entry | untrue: `newUi` in `src/games/salad/state.ts` turns `pencilSticky` on, and with it on `applyPress` in `src/engine/note-taking-cell.ts` makes a right press switch pencil mode and leaves the mode alone on a left press, so a left press selects in the mode that is on |
| A fill-all-candidates action is available | spec: Salad offers a fill-all-candidates action |
| A move that would not change the board is a no-op | spec: A Salad move that would not change the board is a no-op |
| `findMistakes` re-solves from the fixed clues and reports each entry that contradicts the solution, and each empty cell whose notes cross out its value | spec: Salad flags mistakes against the unique solution |
| The game is solved, and flashes, when every line and every border clue is satisfied | spec: Salad is solved when every line and every border clue is satisfied |
| What rendering draws, and that it is not held to pixel parity with the C | spec: What Salad draws |
| Scenario: entering a symbol places it in the selected cell | spec: Salad selects a square and enters a symbol or a marker |
| Scenario: completing every line to the rules wins | spec: Salad is solved when every line and every border clue is satisfied |
| Scenario: check flags a contradicting entry | spec: Salad flags mistakes against the unique solution |

## Salad explains every hint as a pencil-note deduction

| Rule | Where it went |
| --- | --- |
| `hint` is a candidate-elimination hint, and every step explains why its move is forced | spec: Salad explains every hint as a pencil-note deduction |
| The hole/symbol synchronization is narrated in its own terms | spec: Salad's hint narrates the hole and symbol synchronization in its own terms |
| The per-line count is narrated in its own terms, in both its halves | spec: Salad's hint narrates the per-line count in its own terms |
| The border clue is narrated in its own terms, in ABC End View mode only | spec: Salad's hint narrates the border clue in its own terms |
| The inherited Latin deductions are narrated, and the hint never needs a non-deductive fallback | spec: Salad's hint narrates the Latin deductions it inherits and needs no fallback |
| A hint is refused, with the mistakes highlighted, on a wrong board, and refused on a complete one | spec: A Salad hint is refused on a wrong or a complete board |
| The plan is recomputable from any mid-game position | spec: Salad's hint plan is recomputable from any position |
| Computing a hint does not change which puzzles are generated | spec: Computing a hint leaves Salad's generation unchanged |
| Scenario: a border clue's deduction names the clue and its line of sight | spec: Salad's hint narrates the border clue in its own terms |
| Scenario: a line whose empty squares are all found forces the rest | spec: Salad's hint narrates the per-line count in its own terms |
| Scenario: one deduction forcing several squares is one hint | spec: Salad explains every hint as a pencil-note deduction |
| Scenario: a hint is refused while the board holds a mistake | spec: A Salad hint is refused on a wrong or a complete board |
| Scenario: a hint plan resumes from a partly-followed position | spec: Salad's hint plan is recomputable from any position |
| Scenario: recording a hint's deductions leaves generation unchanged | spec: Computing a hint leaves Salad's generation unchanged |

## Salad's Normal tier is never soluble at Easy

| Rule | Where it went |
| --- | --- |
| A board generated at Normal is not soluble at Easy | spec: Salad's Normal tier is never soluble at Easy |
| Upstream has no difficulty gate and publishes whatever stripping leaves | history |
| 12 of the 13 Normal fixture boards and 71 of 80 fresh ones were soluble at Easy, every one in Number Ball at 5×5 and 6×6 | figure |
| The correction changes every Normal-tier description | history |
| A median of 486 candidates a success at 5×5 and a worst case of 4,419 | figure |
| The retry bound is high enough that a legal seed cannot exhaust it, because Normal Number Ball boards are rare and exhaustion is seen by a player | spec: Salad's generation retry bound outlasts a legal seed |
| Scenario: a Normal board genuinely needs the Normal tier | spec: Salad's Normal tier is never soluble at Easy |

## Salad's solver reasons about the empty square directly

| Rule | Where it went |
| --- | --- |
| The empty square is a shared-cube symbol with a per-line multiplicity, with no translation at the game's edge | spec: Salad's solver reasons about the empty square directly |
| The translation layer that stood in for that support is removed | spec: Salad's solver reasons about the empty square directly |
| The empty-square deductions are the cube's own and not a hand-written sync-and-count layer | spec: Salad's empty-square deductions are the shared cube's own |
| The Number Ball quality gate asks its question of that cube | spec: Salad's empty-square deductions are the shared cube's own |
| Scenario: the empty square is reasoned about directly | spec: Salad's solver reasons about the empty square directly |
| Scenario: a generated board is uniquely solvable at its stated tier | spec: Salad's Normal tier is never soluble at Easy |

## Salad's hint strikes a circled square's empty-square mark wherever the circle came from

| Rule | Where it went |
| --- | --- |
| The strike of a circled square's "might be empty" mark is a firing of its own, as well as the leg after the hint's own circle | spec: Salad's hint strikes a circled square's empty-square mark wherever the circle came from |
| How a circle reaches the board without that leg, and that the mark would hide the placement behind it | spec: Salad's hint strikes a circled square's empty-square mark wherever the circle came from |
| "And the plan could not explain that placement" | reason |
| Scenario: the hint's own circle, recomputed | spec: Salad's hint strikes a circled square's empty-square mark wherever the circle came from |
| "On the pinned board" | history |
| Scenario: the player's circle | spec: Salad's hint strikes a circled square's empty-square mark wherever the circle came from |

## Salad's hint teaches every deduction that rules a square out as empty

| Rule | Where it went |
| --- | --- |
| Each deduction that rules a square out as empty is taught on every board at either difficulty, and a line holding all its empties is said as a count | spec: Salad's hint teaches every deduction that rules a square out as empty |
| A set or a chain that rules a square out as empty strikes its mark with that reason, and the square is then marked as holding a symbol | spec: A set or a chain that rules a square out as empty strikes its mark |
| The "might be empty" mark is printed as X, never as a letter or number past the symbols | spec: Salad's hint prints the "might be empty" mark as X |
| Scenario: a set holds all of a column's empty squares | spec: A set or a chain that rules a square out as empty strikes its mark |
| Scenario: the mark is gone from a square's notes | spec: A set or a chain that rules a square out as empty strikes its mark |
| Scenario: a chain runs through the "might be empty" mark | spec: Salad's hint prints the "might be empty" mark as X |

## Salad's menu offers both of its difficulties

| Rule | Where it went |
| --- | --- |
| The presets hold each difficulty, the Normal ones deal well under a second, each mode has a section, and a shape's Normal follows its Easy | spec: Salad's menu offers both of its difficulties |
| Scenario: Normal is on the menu | spec: Salad's menu offers both of its difficulties |
| Scenario: a cross-game guard deals a Normal board | spec: Salad's menu offers both of its difficulties |
| Scenario: each mode has a section | spec: Salad's menu offers both of its difficulties |

## Salad draws its squares on a quiet surface, with a given's lifted

| Rule | Where it went |
| --- | --- |
| The player's squares are on the cell surface and the puzzle's on the lifted surface of a given, the grid line and frame are the surface grid line, and the border clues stay outside | spec: Salad draws its squares on a quiet surface, with a given's lifted |
| The selection's wash and pencil-mode corner are drawn over the square's surface, and the hint's marks stay on the border | spec: Salad's selection and hint marks keep the square's surface |
| A ball drawn round a character shows the surface through it | untrue: `drawBall` in `src/games/salad/render.ts` draws no ball round a character in ABC End View and shows the surface through a ball there, and in Number Ball fills a ball with `COL_I_BALLBG` (paper) for a given or `COL_G_BALLBG` (the entry green wash) for the player's; spec: Salad's selection and hint marks keep the square's surface |
| Scenario: a given is told by the square under it | spec: Salad draws its squares on a quiet surface, with a given's lifted |
