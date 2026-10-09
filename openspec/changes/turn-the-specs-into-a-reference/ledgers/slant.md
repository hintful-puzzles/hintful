# Ledger: slant

Base: bb004490

Where every rule of Slant's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Slant game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `slant` game implements `Game`: a diagonal in every square, each vertex clue met by that many diagonals, no closed loop | spec: Slant game implements the Game interface |
| The five type arguments of `Game` by name | untrue: `slantGame` in `src/games/slant/index.ts` takes eight, adding `SlantMistake`, `SlantHint` and `SlantRung`, and the spec now says only `Game` |
| Params are `w`, `h` and `diff` (Easy or Normal), with the full, short and square encodings | spec: Slant's parameters are a size and a difficulty |
| The presets are 5×5, 8×8 and 10×12, each at Easy and Normal | spec: Slant's parameters are a size and a difficulty |
| "Six presets" | figure |
| "Upstream's 12×10 turned to draw taller than wide" | history |
| `validateParams` enforces the minimum size 2×2 | untrue: `validateParams` in `src/games/slant/state.ts` refuses only an area too large to count, and the `bounds: { min: 2 }` its `paramConfig` declares are what the engine's `paramsError` refuses on, now spec: Slant refuses a grid narrower or shorter than two squares |
| The game provides `solve` and `textFormat` | spec: Slant game implements the Game interface |
| The game drives a completion flash that is suppressed after Solve | spec: Slant game implements the Game interface |
| Scenario: params round-trip | spec: Slant's parameters are a size and a difficulty |
| Scenario: invalid params are rejected | spec: Slant refuses a grid narrower or shorter than two squares |
| The scenario's "`validateParams` is given" a 1-wide grid | untrue: `validateParams` returns null for it, and the declared bound refuses it |

## Slant descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| The desc is the vertex-clue grid row-major, a digit per clue and a letter for a run of clueless vertices, a longer run in `z` chunks | spec: Slant descriptions are run-length clue grids |
| "Upstream" in the title | history |
| Unknown characters, short descs and over-long descs are rejected | spec: Slant descriptions are run-length clue grids |
| `validateDesc` is what rejects them | untrue: Slant defines no `validateDesc`, and the engine's `validateDesc` in `src/engine/desc-error.ts` reads the refusal off `newState`, so the spec now says validating a desc |
| `newState` parses the desc into a clue grid shared across all states, with all squares blank | spec: A new Slant board holds its clues and blank squares |
| The shared clue grid is frozen | untrue: `newState` in `src/games/slant/state.ts` freezes nothing, the clues are a `readonly` `Int8Array` that `executeMove` carries over by reference and never writes |
| Scenario: a description round-trips | spec: Slant descriptions are run-length clue grids |
| Scenario: a malformed description is rejected | spec: Slant descriptions are run-length clue grids |

## Slant input maps clicks, cursor and direct keys

| Rule | Where it went |
| --- | --- |
| A left-click cycles blank, `\`, `/`, blank and a right-click the other way, swapped by the `left-button` preference | spec: A click cycles a square through its three states |
| Clicks outside the grid are ignored | spec: A click cycles a square through its three states |
| Arrow keys move a cursor, select and select2 cycle the cursor square in each direction | spec: The keyboard cursor cycles and sets squares |
| The cursor is revealed "first", read as a press spent on revealing it | untrue: `moveCursor` in `src/engine/pointer.ts` reveals and moves in one press, now spec: The keyboard cursor cycles and sets squares |
| The keys `\`, `/` and backspace set or clear the cursor square directly, with no move when it already holds that value | spec: The keyboard cursor cycles and sets squares |
| Scenario: left-click cycles a square | spec: A click cycles a square through its three states |
| Scenario: swapped button order | spec: A click cycles a square through its three states |

## Slant ships findMistakes

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves with the Normal solver and reports each square whose diagonal differs from the unique solution, never a blank one, and nothing when the board is not uniquely solvable | spec: Slant ships findMistakes |
| A mistaken square is rendered with the red error styling | spec: Slant ships findMistakes |
| "The existing" styling | history |
| One mistake, carrying its side, per same-slant mark joining two squares whose solution slants differ, drawn in the mistake color | spec: A same-slant mark the solution contradicts is a mistake |
| Scenario: a wrong diagonal blocks Check & Save | spec: Slant ships findMistakes |
| Scenario: blank squares are not mistakes | spec: Slant ships findMistakes |
| Scenario: a wrong mark is a mistake | spec: A same-slant mark the solution contradicts is a mistake |

## Slant exposes its two upstream preferences

| Rule | Where it went |
| --- | --- |
| `left-button` with its two choices and its default, mapping to the click-cycle swap | spec: Slant exposes its two upstream preferences |
| `fade-grounded`, boolean and off by default, fading the border-connected diagonals so the rest stand out | spec: Slant exposes its two upstream preferences |
| Scenario: fade-grounded dims border-connected diagonals | spec: Slant exposes its two upstream preferences |

## Slant ships an explained deductive hint

| Rule | Where it went |
| --- | --- |
| `hint()` returns a plan of narrated steps from the solver's own techniques, seeded with the placed diagonals and the same-slant marks | spec: Slant ships an explained deductive hint |
| The hint refuses on a solved board and on a board with detectable mistakes, with the `findMistakes` overlay and the banner | spec: A Slant hint is refused on a solved or mistaken board |
| The plan is computed with the recorder an option, and the generator's solve path is unchanged | spec: The hint's recorder leaves the generator's solve unchanged |
| Each step names its technique, leads with the indication, says why the move is forced and concludes in the necessity voice | spec: Each hint step names its technique and says why the move is forced |
| "The Palisade quality bar" as the name of that bar | reason |
| One firing is one journey, and a clue firing forcing several squares is one multi-leg journey and not several hints | spec: One deduction firing is one journey |
| A step rests only on diagonals, clues and marks on the board, and every equivalence a firing uses cites the marks joining the two squares | spec: A hint step rests only on what the board shows |
| A mark the board does not show is placed by an earlier step of its own, narrated by why the two squares slant alike | spec: A mark the board lacks is placed by a step of its own |
| The three reasons a mark step gives are the whole list | untrue: `markStep` in `src/games/slant/hint.ts` also narrates a pair whose two v-shapes are ruled out for two different reasons (`say.markV` over two `vClause`s) and one held across a single 2 (`say.vAcross`), so the spec now gives the two kinds of merge, keeps the same clue at both ends as a case of the second and the line of 2s as the pattern that is named |
| No mark is placed that no firing uses | spec: A mark the board lacks is placed by a step of its own |
| No displayed step is a generic, un-narrated fallback | spec: Each hint step names its technique and says why the move is forced |
| Scenario: a clue-counting firing is explained and grouped | spec: One deduction firing is one journey |
| Scenario: loop and dead-end firings name the connectivity reason | spec: Each hint step names its technique and says why the move is forced |
| Scenario: refusal on a wrong board | spec: A Slant hint is refused on a solved or mistaken board |
| Scenario: the plan completes deductive boards | spec: Slant ships an explained deductive hint |
| Scenario: an equivalence rests on a mark the plan placed | spec: A hint step rests only on what the board shows; spec: A mark the board lacks is placed by a step of its own |

## Slant hint rendering follows the element-type legend

| Rule | Where it went |
| --- | --- |
| The hint highlights and does not perform: a target ringed `COL_HINT` with no slash preview, a placed mark drawn `COL_HINT` | spec: Slant hint rendering follows the element-type legend |
| "Blue" as the name of `COL_HINT`, and "auto-hint" as what applies the move | reason |
| The evidence, computed against the board as the step fires, is outlined `COL_HINT_CELL`, cited marks drawn `COL_HINT_CELL`, read clues recolored `COL_HINT`, a cited filled anchor ringed `COL_HINT_REF` | spec: A hint's evidence is drawn in the evidence color |
| Hint colors are appended past the colors the game was ported with, `COL_BACKGROUND` through `COL_GROUNDED` | spec: Every hint bit is part of what the tile cache compares |
| The base colors are "the upstream color enum" | history |
| The dark-mode overrides target other indices | untrue: no override keyed on a palette index is in the tree, and `colors` in `src/games/slant/render.ts` derives every entry from the background it is handed |
| Every hint bit is in the per-tile render-cache diff key | spec: Every hint bit is part of what the tile cache compares |
| Scenario: evidence is visible as an area | spec: Slant hint rendering follows the element-type legend; spec: A hint's evidence is drawn in the evidence color |
| Scenario: every step carries visible evidence | spec: A hint's evidence is drawn in the evidence color |

## Slant solves with a graded deductive solver

| Rule | Where it went |
| --- | --- |
| The solver applies its deductions by difficulty, returns impossible, unique or non-converged, and is reused by `solve()` and `findMistakes` | spec: Slant solves with a graded deductive solver |
| At Easy, clue-point counting and immediate loop avoidance | spec: The Easy solver counts clues and avoids immediate loops |
| At Normal, single-pair equivalence around clue points, counted jointly as one line, and slash values propagated through a class | spec: The Normal solver tracks squares that slant alike |
| It is a 2-clue with two undecided adjacent neighbors that marks them equivalent | untrue: `slantSolve` in `src/games/slant/solver.ts` merges on `nu === 2 && nl === 1`, any clue with one line left and exactly two undecided neighbors side by side, now spec: The Normal solver tracks squares that slant alike |
| At Normal, dead-end avoidance | spec: The Normal solver avoids dead ends |
| At Normal, the v-shape bitmap deductions | spec: The Normal solver rules out v-shapes |
| Scenario: generated boards solve at exactly their difficulty | spec: Slant solves with a graded deductive solver |
| Scenario: solve recovers from a wrong mid-game state | spec: Slant solves with a graded deductive solver |

## Slant generates solver-gated boards reproducibly

| Rule | Where it went |
| --- | --- |
| `newDesc` gives the same board for the same seed, growing a filled grid over a shuffled square order, forced by the vertex DSF or one random draw of two, deriving every clue and regenerating while solvable one level down | spec: Slant generates solver-gated boards reproducibly |
| `random_upto(rs, 2)` as the name of the draw | history |
| A single clue-index shuffle, then two solver-gated removal passes, pass 0 the obvious starting points or everything at Easy, pass 1 the rest | spec: Clue removal runs in two solver-gated passes |
| Scenario: generation is reproducible from a seed | spec: Slant generates solver-gated boards reproducibly |

## Slant renders diagonals, clues, errors and the completion flash

| Rule | Where it went |
| --- | --- |
| Thick diagonals, and corner dots where neighboring squares' diagonals meet the tile | spec: A diagonal is a thick ink line with corner dots |
| The diagonals and the clue rings are chessboard-colored by the parity `(x^y)&1` | untrue: `colors` in `src/games/slant/render.ts` sets `COL_SLANT1` and `COL_SLANT2` both to `INK`, so the parity chooses between two equal colors, and the spec now says ink |
| Grid lines, and the cell surface under every square | spec: Slant draws its squares on the collection's quiet surface |
| Clue circles with rings and ink numbers | spec: A clue is drawn on a lifted disc |
| Red for loop-edge slashes, corner dots included | spec: Slant draws its live errors in the error color |
| Red for an unmet clue's circle | untrue: `drawClue` in `src/games/slant/render.ts` reddens the number alone, the disc and its ring staying as they are, now spec: Slant draws its live errors in the error color |
| The cursor highlight | spec: Slant draws its squares on the collection's quiet surface |
| The grounded fade, by its preference | spec: Slant exposes its two upstream preferences |
| The three-phase completion flash | spec: The completion flash lifts the squares in three phases |
| "Upstream" as whose flash it is | history |
| The drawstate diffs a `(w+2) × (h+2)` packed `Int32Array` covering the border ring, rebuilt every frame, with the mistake overlay in the diff key | spec: The drawstate diffs a packed word for every tile and the ring |
| Scenario: a mistake overlay repaints an unchanged tile | spec: The drawstate diffs a packed word for every tile and the ring |
| Scenario: border clue circles draw | spec: A clue is drawn on a lifted disc |

## Slant notes mode marks squares that slant alike

| Rule | Where it went |
| --- | --- |
| A same-slant mark between any two squares sharing a side, stored as a mark to the right and a mark below, set or cleared by an absolute `alike` move | spec: Slant notes mode marks squares that slant alike |
| Notes mode is toggled by the Marks key, the only key on the keypad, the pencil indicator shows at `pencilIndicatorBox`, and with notes mode off input is unchanged | spec: The Marks key turns Slant's notes mode on and off |
| A notes-mode press toggles the mark on the nearest side, and does nothing at the board's outer edge | spec: A notes-mode press marks the nearest side |
| "Any button" for that press, said as either button, the left and the right being the two the engine's pointer has | spec: A notes-mode press marks the nearest side |
| Enter or Space pins, pairs, lets go and moves the pin, and Escape lets go of it | spec: The notes-mode keyboard pins a square and marks toward a neighbor |
| A mark is two short bars across the middle of the shared side in the pencil color | spec: A same-slant mark is two short bars across the shared side |
| Scenario: a tap marks the nearest shared side | spec: A notes-mode press marks the nearest side |
| Scenario: the keyboard pins and pairs | spec: The notes-mode keyboard pins a square and marks toward a neighbor |
| Scenario: a move log of diagonals alone replays to the same board with no marks | spec: Slant notes mode marks squares that slant alike |
| "Saves from before marks" in that scenario's title | history |

## Slant computes live errors as upstream and judges completion from the board

| Rule | Where it went |
| --- | --- |
| Loop errors by the engine's loop finder over the vertex graph, vertex errors for a clue exceeded or out of reach, and grounded diagonals in the border-connected component | spec: Slant computes live errors after every move |
| "Exactly as upstream `check_completion`" | history |
| Solved exactly while no errors exist and no square is blank, judged from the board however it was reached | spec: Slant judges completion from the board |
| Scenario: a closed loop is flagged | spec: Slant computes live errors after every move |
| Scenario: an over-committed clue is flagged | spec: Slant computes live errors after every move |
| Scenario: completion follows the board | spec: Slant judges completion from the board |

## Slant draws its squares on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| Every square on the cell surface, slashed or not, with the thin grid line, a filled square taking no tint, and the ring of tiles staying the board's tone | spec: Slant draws its squares on the collection's quiet surface |
| A clue on a disc of the lifted surface of a given, with its ring and its number | spec: A clue is drawn on a lifted disc |
| "As before" for the ring and the number | history |
| The flash lifts the squares to the given's surface on its lit beats, a step that reads in both schemes | spec: The completion flash lifts the squares in three phases |
| Scenario: a slashed square keeps the surface | spec: Slant draws its squares on the collection's quiet surface |
| Scenario: a clue is lifted | spec: A clue is drawn on a lifted disc |
