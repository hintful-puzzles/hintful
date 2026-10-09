# Ledger: keen

Base: bb004490

Where every rule of Keen's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters, and the rules the
code no longer bears out corrected to it.

## Keen game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `keen` game implements `Game`, a Latin square on a `w × w` grid with digits `1..w` once in each row and column | spec: Keen game implements the Game interface |
| The six type arguments of `Game` | untrue: `keenGame` in `src/games/keen/index.ts` takes eight, with `KeenHint` and `KeenRung`, and the spec now names `Game` alone |
| "KenKen" and "Inshi No Heya" as other names | history |
| The grid is partitioned into contiguous cages, each with a target value and one of four operations, and subtraction and division cages have area 2 | spec: A Keen cage carries an arithmetic clue |
| Params are `w`, `diff` and `multiplicationOnly`, with the five tiers and their keys, so that Tricky is `"hard"` | spec: Keen's parameters |
| The keys are upstream's | history |
| The encoding `{w}` without `full` and `{w}d{c}{m?}` with it | spec: Keen's params encoding |
| Presets are laid out as the preset-grid requirement says | spec: Keen's parameters |
| `validateParams` requires `3 ≤ w ≤ 9` | untrue: `validateParams` in `src/games/keen/state.ts` holds no size bound, and the `grid-size` item's `bounds` in `src/games/keen/index.ts` do, read by the engine's `paramsError`; spec: Keen's parameters |
| `validateParams` requires a known difficulty | untrue: `diffToLevel` in `src/games/keen/state.ts` reads an unknown key as Normal, so no check refuses one, and `decodeParams` keeps the default tier for an unknown letter |
| The game provides `solve`, provides no `statusbarText` or `textFormat`, and reports `canMarkAll = true` | spec: Keen game implements the Game interface |
| Scenario: params round-trip | spec: Keen's params encoding |
| Scenario: invalid params are rejected, for a size out of range | spec: Keen's parameters |
| Scenario: invalid params are rejected, for an unknown difficulty | untrue: `diffToLevel` in `src/games/keen/state.ts` reads an unknown key as Normal, and the difficulty item's choice check passes it |

## Keen descriptions encode the block structure and cage clues

| Rule | Where it went |
| --- | --- |
| The desc is the block structure, a comma and the clue list | spec: Keen descriptions encode the block structure and cage clues |
| The block structure is run lengths of non-edges over the internal lines, in `_`, `a` to `y` and `z` | spec: The block structure is run lengths between dividing lines |
| A compression pass may replace a run of one letter with the letter and a count | untrue: `encodeBlockStructure` in `src/games/keen/state.ts` writes two of a letter as the letter twice and three or more as the letter and its count, and `readBlockStructure` refuses a count below 3; spec: The block structure is run lengths between dividing lines |
| The clue list gives each cage, in minimal-cell order, an operation tag and a decimal value | spec: Keen descriptions encode the block structure and cage clues |
| `validateDesc` rejects the four malformations | untrue: Keen declares no `validateDesc`, and the parse inside `newState` in `src/games/keen/state.ts` refuses them, from which the engine derives the verdict; spec: A malformed Keen description is refused; spec engine-params: The engine derives a description's verdict from newState |
| `newState` rebuilds the cage partition and the clues, with every cell blank | spec: Keen descriptions encode the block structure and cage clues |
| Scenario: description round-trips through generate and decode | spec: Keen descriptions encode the block structure and cage clues |
| Scenario: malformed description is rejected | spec: A malformed Keen description is refused |

## Keen solves cages with the shared Latin-square framework

| Rule | Where it went |
| --- | --- |
| The solver rides on the shared Latin solver, with cage deductions as user-solvers and a validator | spec: Keen solves cages with the shared Latin-square framework |
| The framework is named `latin_solver` | untrue: the export of `src/engine/latin.ts` is `latinSolver` |
| The cage deductions enumerate each cage's layouts and prune the cube, differently at Easy, Normal and Tricky | spec: A cage deduction enumerates the cage's layouts |
| The validator accepts a completed grid only when every cage satisfies its clue | spec: Keen solves cages with the shared Latin-square framework |
| `solveKeen` maps the tiers to the framework's levels and returns the difficulty reached or a sentinel | spec: Keen solves cages with the shared Latin-square framework |
| Scenario: solver grades a known board | spec: Keen solves cages with the shared Latin-square framework |
| Scenario: solver detects an inconsistent board | spec: Keen solves cages with the shared Latin-square framework |

## Keen interprets digit, pencil, and mark-all input

| Rule | Where it went |
| --- | --- |
| A left-click highlights a cell for a real entry, and a right-click highlights an empty cell for a pencil mark and, in sticky pencil mode, toggles the persistent mode | spec: Keen selects a cell through the shared note-taking cell |
| Cursor-select highlights a cell for a real entry | untrue: `toggleNoteTakingMode`, called by `interpretMove` in `src/games/keen/index.ts`, toggles pencil mode on a showing highlight; spec: Keen selects a cell through the shared note-taking cell |
| Select2 highlights an empty cell for a pencil mark | untrue: `interpretMove` in `src/games/keen/index.ts` reads `CURSOR_SELECT2`, which is the space key, as clear; spec: Keen interprets digit, pencil, and mark-all input |
| A digit key enters the digit or toggles the pencil mark, and backspace or space clears the cell | spec: Keen interprets digit, pencil, and mark-all input |
| Keyboard cursor movement | spec: Keen selects a cell through the shared note-taking cell |
| `M` fills every empty cell with all candidate pencil marks | untrue: `applyNoteMove` in `src/engine/candidate-hint.ts` fills only the empty cells with no notes, and `adaptiveMarkAllMove` strikes the obvious row and column candidates once every empty cell is noted; spec: Keen's mark-all key fills, then cleans; spec engine-notes: Mark-all is adaptive in a game with uniqueness regions |
| Entering the digit a cell already holds is a no-op that hides the mouse highlight | spec: Keen interprets digit, pencil, and mark-all input |
| With auto-pencil on, a placement strikes its digit from its row and column | spec: Auto-pencil strikes a placed digit from its row and column |
| `executeMove` returns a new state and never mutates its input | spec: Keen interprets digit, pencil, and mark-all input |
| A placement that completes the grid with no errors marks the state completed | untrue: `KeenState` in `src/games/keen/state.ts` has no completed flag, and `status` derives solved from the board; spec: A Keen board is solved when its grid is complete without errors |
| Scenario: placing and penciling digits | spec: Keen interprets digit, pencil, and mark-all input |
| Scenario: mark-all fills pencil candidates | spec: Keen's mark-all key fills, then cleans |

## Keen renders cages, digits, pencil marks, and overlays

| Rule | Where it went |
| --- | --- |
| Thick cage boundaries with same-cage cells merged, the digit or an auto-sized grid of pencil marks, the cursor and pencil-mode highlights, and a completion flash | spec: Keen renders cages, digits, pencil marks, and overlays |
| Each cage's clue at its minimal cell, the symbol omitted for area-1 cages and multiplication-only puzzles | spec: A cage's clue is drawn at its minimal cell |
| Live rule-violation errors and the Check & Save mistake overlay | spec: Keen shows rule violations and mistakes on the board |
| The pencil-mode indicator is shown while persistent pencil mode is on | untrue: `redraw` in `src/games/keen/render.ts` passes `ui.pencilMode` to `repaintPencilIndicator`, so it shows in any pencil mode, sticky or not; spec: Keen shows the pencil-mode indicator |
| A per-tile diff cache, with every overlay outside the tile value in the diff key | spec: Keen's tile cache keys on every overlay |
| Scenario: cage clue and digit are drawn | spec: A cage's clue is drawn at its minimal cell; spec: Keen renders cages, digits, pencil marks, and overlays |
| Scenario: mistake overlay repaints on an already-drawn cell | spec: Keen's tile cache keys on every overlay |

## Keen flags mistakes against its unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the clues alone and returns every wrong digit and every note set that crosses out its solution digit, and is empty when the board is not uniquely solvable | spec: Keen flags mistakes against its unique solution |
| It drives Check & Save, which blocks a quick-save while any mistake exists | spec quick-save: Check & save gates the checkpoint on a clean board |
| Scenario: a wrong digit and a wrong note are flagged | spec: Keen flags mistakes against its unique solution |

## Keen exposes pencil-mark preferences

| Rule | Where it went |
| --- | --- |
| A sticky-pencil-mode preference, default on, and an auto-pencil preference, default off | spec: Keen exposes pencil-mark preferences |
| The keep-highlight preference defaults off | untrue: `newUi` in `src/games/keen/state.ts` sets `pencilKeepHighlight: true`; spec: Keen exposes pencil-mark preferences; spec engine-notes: Every member offers the keep-highlight preference, defaulted the same way |
| The keep-highlight default matches upstream's `PREF_PENCIL_KEEP_HIGHLIGHT` | history |
| Preference values live on the `Ui` and are set as defaults by `newUi` | spec: Keen exposes pencil-mark preferences |
| With auto-pencil off, the player cleans notes with the mark-all control or a hint | spec: Keen exposes pencil-mark preferences |
| Scenario: pencil preferences are exposed with their defaults | spec: Keen exposes pencil-mark preferences |

## Keen provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| `hint(state, aux?, ui?)` returns a plan teaching the next deduction in pencil-notes terms, on a cube seeded from the placed entries only, built by walking a working copy of the board | spec: Keen provides an explained deduction hint |
| The plan prefers a naked single, then the populate and the basic Latin eliminations, then a cage elimination, then a forced placement | untrue: the order is the shared walk's, in `runCandidatePlan` of `src/engine/candidate-plan.ts`, which takes naked singles, then whichever recorded strike the plan can take now, cage or generic, then recorded placements, and Keen states no order; spec engine-candidate-hints: The walk owns the ladder |
| A naked single is sound on a mistake-free board because its candidate is the solution | reason |
| A lazy populate through the fill-all move, emitted only when some empty cell lacks notes | spec: The notes are filled in before the first elimination |
| The populate comes on every plan | untrue: under the `implicit` reading of the `hint-notes` preference `runCandidatePlan` emits no fill-all step, and `populate` is only Keen's default; spec: The notes are filled in before the first elimination |
| The basic Latin row and column eliminations a placed value implies are struck through `pencilStrike` | spec: A placement's row and column strikes follow auto-pencil; spec engine-candidate-hints: Candidate-elimination hints clean obvious candidates at populate |
| A cage elimination, of either kind, is a single firing striking through one or more `pencilStrike` moves linked as one journey | spec: A cage elimination is one firing, struck as one journey |
| A forced placement is a naked or a hidden single, narrated and highlighted by which it is, re-derived from the working board | spec: A forced placement is narrated as the single it is |
| A hidden single shades its whole line as evidence | untrue: `narrateLatinReason` in `src/engine/hint-text.ts` marks the line with the `stripes` role, which Keen's `drawTile` hatches, and outlines nothing; spec: A forced placement is narrated as the single it is |
| Narration leads with the cage named by its clue, then the reasoning, then a necessity-voice conclusion | spec: A cage deduction's sentence names the cage by its clue |
| The conclusions read "must cross out the N" and "can only be N" | spec engine-candidate-hints: A candidate strike SHALL end in the walk's conclusion; spec: A forced placement is narrated as the single it is |
| A firing forcing several strikes is one journey, and its strikes share the target hint color | spec: A cage elimination is one firing, struck as one journey |
| A placement's trivial eliminations follow the auto-pencil preference read from `ui` | spec: A placement's row and column strikes follow auto-pencil |
| The hint refuses on a solved board or when `findMistakes` is non-empty, and the refusal lights the mistake overlay | untrue: Keen's `hint` in `src/games/keen/index.ts` is one call to `candidateHint`, which refuses only an empty plan, and the midend refuses those two boards before it asks the game; spec engine-hints: The midend SHALL refuse a hint on a finished or wrong board before asking the game |
| The deduction is capped below recursion, since a guess is not a teachable note strike | spec: Keen's hint deduces below recursion |
| Every step is monotone progress, a recomputed hint makes progress and leads to a solved board, and a recompute skips what the board already shows | spec: Every Keen hint step is monotone progress |
| "The cross-game resume guarantee" as the name of that promise | history |
| `hintKeepTrack` advances the plan on a move matching the step's intent, and drops it otherwise | spec: Keen keeps a hint plan while the player follows it |
| A `pencilStrike` clearing a subset of the step's marks is `onTrack` | untrue: `keepCandidateHintTrack` in `src/engine/candidate-hint.ts` judges a `pencilStrike` `completed` only when its marks are the step's and `off` otherwise, and it is a pencil toggle clearing one mark that is `onTrack`; spec: Keen keeps a hint plan while the player follows it |
| `refreshHintStep` drops a stored step's dead marks or resolves it before each display | spec: Keen refreshes a stored hint step before it is shown |
| The recording mode is gated so the generate and solve path is unchanged, and one firing maps to one `group` | spec: The recording solver fires one cage at a time |
| Scenario: a cage elimination is taught as a note strike | spec: A cage elimination is one firing, struck as one journey |
| That scenario's cage cells are shaded and its struck candidates marked in the hint color | untrue: `say.cage` in `src/games/keen/hint-text.ts` stripes the cage, and `drawTile` in `src/games/keen/render.ts` draws a struck candidate in the pencil color with a line through it, the hint color going to the cell's ring; spec: A cage elimination is one firing, struck as one journey |
| Scenario: a hidden single is named by its line, not by the cell | spec: A forced placement is narrated as the single it is |
| Scenario: an empty board is populated before elimination | spec: The notes are filled in before the first elimination |
| Scenario: the hint resumes from a self-played mid-game position | spec: Every Keen hint step is monotone progress |
| Scenario: the hint refuses on a board with mistakes | spec engine-hints: The midend SHALL refuse a hint on a finished or wrong board before asking the game |

## Keen provides on-screen key labels

| Rule | Where it went |
| --- | --- |
| `requestKeys` returns one button per digit and then a clear key with button code 8 labeled "Clear" | spec: Keen provides on-screen key labels |
| As upstream's `game_request_keys` does | history |
| Scenario: the keypad covers the grid's digits plus clear | spec: Keen provides on-screen key labels |

## Keen generates boards uniquely solvable at exactly the requested difficulty

| Rule | Where it went |
| --- | --- |
| `newDesc` generates a Latin square, cages it, and accepts the board only when it is solved at exactly the requested difficulty, regenerating otherwise | spec: Keen generates boards uniquely solvable at exactly the requested difficulty |
| Cages are random dominoes with folded singletons, of area at most 6, with a balanced mix of operations and values avoiding low-quality clues | spec: Keen's cages are dominoes with the singletons folded in |
| A 3×3 puzzle requested above Normal is dialed down to Normal | untrue: `newKeenDesc` in `src/games/keen/generator.ts` dials nothing down, and `validateParams` in `src/games/keen/state.ts` refuses the deal with "No 3x3 puzzle is Tricky."; spec: A 3×3 Keen is not dealt above Normal |
| A capped-iteration backstop throws and does not hang | spec: Keen generates boards uniquely solvable at exactly the requested difficulty |
| Scenario: generated board is uniquely solvable at its difficulty | spec: Keen generates boards uniquely solvable at exactly the requested difficulty; spec: Keen's cages are dominoes with the singletons folded in |

## Keen draws its digits on a quiet surface inside heavy cages

| Rule | Where it went |
| --- | --- |
| Every cell is the cell surface, the line inside a cage the surface grid line, and a cage's boundary, the frame and the clue ink, with no lifted surface for a given | spec: Keen draws its digits on a quiet surface inside heavy cages |
| The selection's wash and pencil-mode corner are drawn over the surface, under the clue | spec: The selection is drawn under the clue, and the hint's ring in the gutter |
| The hint's marks stay in the gutter at the cell's edge | untrue: only the ring and the outline do, and `drawTile` in `src/games/keen/render.ts` hatches a striped cell, strikes a candidate through and numbers a chain inside the cell; spec: The selection is drawn under the clue, and the hint's ring in the gutter |
| Scenario: only a cage's boundary is heavy | spec: Keen draws its digits on a quiet surface inside heavy cages |
