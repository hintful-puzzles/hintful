# Ledger: undead

Base: bb004490

Where every rule of Undead's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Undead game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `undead` game implements `Game`, a grid of mirrors and monster cells with three monsters to place | spec: Undead game implements the Game interface |
| The six type arguments of `Game` | untrue: `undeadGame` in `src/games/undead/index.ts` takes eight, with `UndeadHint` and `UndeadRung` after the six |
| Params are `w`, `h` and `diff`, the tier values, the two encodings and the presets at every tier | spec: Undead's parameters and their encoding |
| The top tier is `Unreasonable` because its boards can need the forcing rung, and its character stays `t` | spec: Undead's top tier is Unreasonable and keeps the letter t |
| The tier was upstream's `Tricky` | history |
| `validateParams` requires `w ≥ 3` and `h ≥ 3` | untrue: `validateParams` in `src/games/undead/state.ts` checks the area only, and the minimum of 3 is the `bounds` of `paramConfig`, refused by `paramsError` in `src/engine/params.ts` |
| `validateParams` requires `w·h ≤ 54` | spec: Undead's parameter limits |
| `validateParams` requires a known difficulty | untrue: nothing refuses one, the codec in `src/games/undead/state.ts` leaves the default tier for an unknown letter and `diffToLevel` reads an unknown value as Normal |
| It provides `solve` and `textFormat`, no `statusbarText`, and `canMarkAll = true` | spec: Undead game implements the Game interface |
| Scenario: params round-trip | spec: Undead's parameters and their encoding |
| Scenario: invalid params are rejected by `validateParams` | untrue: two of the three refusals are the engine's, so the scenario now goes through the engine's params check and drops the unknown difficulty |

## Undead descriptions encode totals, the mirror grid, and sightline clues

| Rule | Where it went |
| --- | --- |
| The desc is three totals, a grid specification and the sighting clues, and the grid's letters | spec: Undead descriptions encode totals, the mirror grid, and sightline clues |
| `validateDesc` rejects each malformed shape | untrue: the game has no `validateDesc`, the reader inside `newState` in `src/games/undead/state.ts` refuses and the engine derives the verdict from it |
| A monster-letter count that disagrees with the totals is rejected | untrue: `parseDesc` compares the number of monster cells, runs and givens together, with the sum of the three totals |
| The other malformed shapes that are refused | spec: A malformed Undead description is refused |
| `newState` builds the shared structure, and every non-fixed cell starts undecided | spec: newState builds Undead's shared structure |
| Scenario: a description round-trips | spec: Undead descriptions encode totals, the mirror grid, and sightline clues; spec: newState builds Undead's shared structure |
| Scenario: a malformed description is rejected | spec: A malformed Undead description is refused |

## Undead traces sightlines through the mirror maze

| Rule | Where it went |
| --- | --- |
| Every sightline is traced from the edge positions through the mirrors, and what is recorded for each | spec: Undead traces sightlines through the mirror maze |
| A vampire counts before any reflection, a ghost after one, a zombie always | spec: A monster's visibility depends on its type and the reflections before it |
| Scenario: reflected and direct visibility | spec: A monster's visibility depends on its type and the reflections before it |

## Undead solves and generates uniquely-solvable graded boards

| Rule | Where it went |
| --- | --- |
| How `newDesc` builds a grid, what it rejects, how it seeds and fills, and that every board is unique against the oracle | spec: Undead solves and generates uniquely-solvable graded boards |
| A board is graded by the rung of the ladder it requires, and the rung of each tier | spec: Undead grades a board by the rung of the ladder it requires |
| Every accepted board is solved by the ladder with no guessing or recursion, and a board needing recursion is rejected | spec: Every Undead board is solved by the ladder without recursion |
| "Per the fork's guess-free generation policy" | reason |
| The top tier is named `Unreasonable` because forcing is a search from the player's side, and the two lower tiers are plain deduction | spec: Undead's top tier is Unreasonable and keeps the letter t |
| Forcing is not nested recursion | spec: Every Undead board is solved by the ladder without recursion |
| The re-grade measurement over about 6,800 boards found no recursion residual | figure |
| Scenario: a generated board is unique and on-difficulty | spec: Undead solves and generates uniquely-solvable graded boards; spec: Undead grades a board by the rung of the ladder it requires |
| Scenario: every tier is free of nested recursion | spec: Every Undead board is solved by the ladder without recursion |
| Scenario: renaming the tier moves no board | history |
| The solver retains the forcing rung and only the hint's recorder lacks it | spec: The forcing rung never reaches an Undead hint |
| Scenario: recursion-only boards are rejected | spec: Every Undead board is solved by the ladder without recursion |
| "Such boards are non-unique" | figure |
| Scenario: solve fills the unique solution | spec: Undead game implements the Game interface |

## Undead supports monster, pencil, and clue moves with a cursor

| Rule | Where it went |
| --- | --- |
| The highlight cursor, placing and clearing a monster, and a pencil note in pencil mode | spec: Undead supports monster, pencil, and clue moves with a cursor |
| Mark-all fills every undecided cell with all candidate notes | untrue: `executeMove` in `src/games/undead/index.ts` fills only an empty cell with no notes and never resets a narrowed one |
| Mark-all is on `M` and `m` | spec: Undead's Mark-all fills the cells that have no notes |
| A click on an edge clue toggles its strike-through | spec: A click on a sighting clue strikes it through |
| Fixed cells reject edits, and a move that changes nothing returns no history entry | spec: Undead refuses edits to fixed cells and records no empty move |
| `executeMove` applies the move and recomputes the live error overlays | spec: Undead is solved when the grid is full and every count holds |
| `executeMove` marks the game solved | untrue: `executeMove` sets no flag, the `status` hook in `src/games/undead/state.ts` reads it from the board |
| The game is solved when every cell is filled and all counts and sightings hold | spec: Undead is solved when the grid is full and every count holds |
| Scenario: place and clear a monster | spec: Undead supports monster, pencil, and clue moves with a cursor; spec: Undead refuses edits to fixed cells and records no empty move |
| Scenario: mark-all gives every still-undecided cell all three notes | untrue: a cell the player has narrowed keeps its notes, so the scenario now has one and it is unchanged |

## Undead shows live legality errors and supports Check & Save

| Rule | Where it went |
| --- | --- |
| `executeMove` recomputes the overlays, and which counts, clues and cells each error flags | spec: Undead shows live legality errors and supports Check & Save |
| `redraw` paints the count block and the clue red | spec: Undead paints a flagged count and a flagged clue red |
| `redraw` paints red every placed cell of an over-placed type and the whole of a failing line | untrue: `redraw` in `src/games/undead/render.ts` reads `cellErrors` for staleness only and colors no cell from it, as the file's header says |
| `findMistakes` re-solves, what it returns, and that the solution comes from the clues only | spec: Undead's findMistakes compares the board with its unique solution |
| Both overlays are tracked in the render diff key | spec: Undead's error and mistake overlays are in the render diff key |
| Scenario: over-placing reddens the count | spec: Undead paints a flagged count and a flagged clue red |
| Scenario: over-placing reddens every placed cell of the type | untrue: no cell is recolored, only the count block, in `drawMonsterCount` of `src/games/undead/render.ts` |
| Scenario: Check & Save flags a wrong placement | spec: Undead's findMistakes compares the board with its unique solution |

## Undead renders monsters, mirrors, counts, and sightline hints

| Rule | Where it went |
| --- | --- |
| The count row, the clue numbers and their dimming and red, the three things a cell draws, and the per-cell diff cache | spec: Undead renders monsters, mirrors, counts, and sightline hints |
| The four count styles, Left/Total the default, dimmed when complete and red on error | spec: Undead's count blocks follow the selected count style |
| Left/Total is a deliberate divergence from upstream's Total default | history |
| Both displays are preferences, and the monster display is an in-play toggle | spec: Undead's count style and monster display are preferences |
| The count style is an in-play toggle | untrue: `interpretMove` in `src/games/undead/index.ts` has a key for the letters display alone, and `UndeadUi.countStyle` is set in Preferences only |
| The render flashes on solving and not on Solve | spec: Undead flashes on solving |
| Scenario: count-style and letters toggles | spec: Undead's count style and monster display are preferences; spec: Undead's count blocks follow the selected count style |
| Scenario: sticky pencil mode stays on between notes, and an indicator shows it | spec: Undead supports monster, pencil, and clue moves with a cursor |
| Scenario: right-clicking empty cells toggles notes in sticky pencil mode | untrue: a sticky right-click switches the mode, in `applyPress` of `src/engine/note-taking-cell.ts`, and a note is toggled by a monster key |

## Undead explained deduction hint

| Rule | Where it went |
| --- | --- |
| The hint is purely deductive, reveals no solution and narrates no guess or search | spec: Undead explained deduction hint |
| Forcing is a search, the recorder emits it on no tier, and the solver keeps it | spec: The forcing rung never reaches an Undead hint |
| On an `Unreasonable` board the plan stops and the hint refuses with a message saying so, and the tests assert both bounds | spec: An Unreasonable board's hint stops where deduction stops |
| A hint that solved every `Unreasonable` board would mean the rung had come back | reason |
| The two lower tiers' plans solve from empty and step by step | spec: Undead explained deduction hint |
| A hint is refused on a solved or contradictory board, by the midend, lighting the mistake overlay | spec: An Undead hint is refused on a solved or contradictory board |
| The narration teaches the sighting rule | untrue: `say.sightline` in `src/games/undead/hint-text.ts` gives the line's two clues and what they leave no room for, and leaves the rule to the help page |
| The narration reads correctly at the degenerate clue values | spec: A sightline step speaks of the line and its two clues |
| Conclusions use the necessity voice | spec: Undead's hint conclusions use the necessity voice |
| A `pencilStrike` move clears candidate bits atomically, beside `pencil` and `markAll` | spec: Undead's pencilStrike clears candidate bits atomically |
| No auto-pencil preference, and the `ui` argument is ignored | spec: Undead's hint takes no auto-pencil preference |
| `COL_HINT` and `COL_HINT_CELL` are in the palette and follow the element-type color legend, with no pre-rendered glyph in the target | spec: Undead's hint marks follow the element-type color legend |
| The two colors are appended to the palette | untrue: `COL_CELL` and `COL_GIVEN` follow them in `src/games/undead/render.ts` |
| The placement target is a solid `COL_HINT` fill, and the sightline evidence is shaded | untrue: both are outlines on the cell's edge, painted by `HintMarks` after the cell loop in `src/games/undead/render.ts`, and the cell keeps its ordinary background |
| A struck candidate keeps its pencil color with a strikethrough on a background that is not `COL_HINT`, and the hint signature is in the draw cache | spec: A struck candidate stays legible and the hint is in the draw cache |
| An empty cell whose notes exclude the solution monster is a `note` mistake, so a refused hint highlights it | spec: An Undead hint is refused on a solved or contradictory board |
| "Unchanged" and "for free" | history |
| Scenario: the forcing rung never reaches a narration | spec: The forcing rung never reaches an Undead hint |
| Scenario: an Unreasonable board's hint stops | spec: An Unreasonable board's hint stops where deduction stops |
| Scenario: a sightline elimination is one journey of legs on the narrated path, naming the sightline | spec: A sightline step speaks of the line and its two clues |
| Scenario: the explanation explains the mirror-sighting rule | untrue: the step's sentence in `src/games/undead/hint-text.ts` names the line and its two clues and does not restate the rule |
| Scenario: the whole sightline is the evidence area while each leg targets one cell | spec: Undead's hint marks follow the element-type color legend |
| Scenario: total exhaustion is narrated honestly | spec: Undead explained deduction hint |
| Scenario: a naked single is surfaced first | spec: Undead explained deduction hint |
| Scenario: the plan reaches a solved board | spec: Undead explained deduction hint |
| Scenario: the hint refuses on a solved or contradictory board | spec: An Undead hint is refused on a solved or contradictory board |

## Undead provides on-screen key labels

| Rule | Where it went |
| --- | --- |
| `requestKeys()` returns the three monster keys and a clear key, in that order, with their labels | spec: Undead provides on-screen key labels |
| The order is upstream's `game_request_keys`, and the letters match upstream | history |
| The keys carry the letters whatever the display preference | spec: Undead provides on-screen key labels |
| Scenario: the keypad is the three monsters plus clear | spec: Undead provides on-screen key labels |

## Undead draws its cells on a quiet surface and lifts what is fixed

| Rule | Where it went |
| --- | --- |
| Cells the player fills are on the cell surface with the surface grid line and a frame no heavier, and a mirror or a given monster is on the lifted surface | spec: Undead draws its cells on a quiet surface and lifts what is fixed |
| A monster is the same drawing on either surface, and a mirror stays in ink | spec: Undead draws its cells on a quiet surface and lifts what is fixed |
| The selected cell's wash and notes corner are on the cell's surface, and the hint's marks stay on the cell's edge | spec: Undead's selection is drawn on the cell's surface; spec: Undead's hint marks follow the element-type color legend |
| "As before" | history |
| Scenario: a mirror is told by the cell under it | spec: Undead draws its cells on a quiet surface and lifts what is fixed |
| Scenario: the frame is a grid line | spec: Undead draws its cells on a quiet surface and lifts what is fixed |
