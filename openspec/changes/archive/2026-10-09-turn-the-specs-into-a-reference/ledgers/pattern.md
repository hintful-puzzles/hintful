# Ledger: pattern

Base: bb004490

Where every rule of Pattern's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Pattern game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `pattern` game implements `Game`, the nonogram on a `w × h` grid of `Full` and `Empty` cells matching run-length clues | spec: Pattern game implements the Game interface |
| The five type arguments of `Game` it is written with | untrue: `patternGame` in `src/games/pattern/index.ts` is typed with eight, adding `PatternMistake`, `PatternHint` and `PatternRung`, so the requirement names `Game` alone |
| Params are `w` and `h`, encoded `{w}x{h}`, a bare `{w}` decoding square | spec: Pattern's parameters are a width and a height |
| The presets 10×10 to 30×30 are offered | spec: Pattern's parameters are a width and a height |
| The presets are upstream's | history |
| `validateParams` rejects a non-positive dimension | untrue: `validateParams` in `src/games/pattern/state.ts` checks the area only, and a dimension below 1 is refused by the `bounds` of `paramConfig`, which the engine's `paramsError` reads first |
| `validateParams` rejects an unreasonably large `w·h` | spec: Pattern's parameters are a width and a height |
| It provides `solve` and `textFormat` and drives a solve-completion flash | spec: Pattern game implements the Game interface |
| Scenario: params round-trip | spec: Pattern's parameters are a width and a height |
| Scenario: invalid params are rejected | spec: Pattern's parameters are a width and a height |

## Pattern descriptions are slash-separated clue lists

| Rule | Where it went |
| --- | --- |
| Column clues then row clues, `/`-separated, each line `.`-separated positive run lengths | spec: Pattern descriptions are slash-separated clue lists |
| A trailing `,` suffix of immutable clue squares in the run-length alphabet is parsed so such a desc round-trips | spec: A Pattern description's suffix of immutable clue squares is read |
| The suffix is what upstream's picture generator produces | history |
| The generator emits no suffix | spec: A Pattern description's suffix of immutable clue squares is read |
| `validateDesc` parses the suffix and rejects a malformed desc | untrue: Pattern has no `validateDesc` hook, and the engine's `validateDesc` in `src/engine/desc-error.ts` reads the board through `newState`, whose parse in `src/games/pattern/state.ts` makes the refusals |
| A non-positive or excessive clue, a line whose clues cannot fit, too few or too many lines and an unrecognized character are refused | spec: A malformed Pattern description is refused |
| `newState` parses into immutable clue arrays and an all-`Unknown` grid with the suffix applied | spec: Pattern descriptions are slash-separated clue lists |
| Scenario: a description round-trips | spec: Pattern descriptions are slash-separated clue lists |
| Scenario: a malformed description is rejected | spec: A malformed Pattern description is refused |

## Pattern ports the per-line solver and gates generation on it

| Rule | Where it went |
| --- | --- |
| The per-line solver, the generator accepting only a uniquely line-solvable grid, and the solver reused by `solve()` and `findMistakes` | spec: Pattern ports the per-line solver and gates generation on it |
| The generator's name `generate_soluble` | history |
| Scenario: generated boards are uniquely line-solvable | spec: Pattern ports the per-line solver and gates generation on it |
| Scenario: solve recovers the unique grid | spec: Pattern ports the per-line solver and gates generation on it |

## Pattern accepts drag-fill rectangle and cursor input

| Rule | Where it went |
| --- | --- |
| The input reproduces upstream's with two divergences, and upstream filled on a mouse press and cycled only on a stylus | history |
| A press cycles the pressed cell as the cursor-select keys do, for a mouse and a finger alike, left one way and right the other | spec: A Pattern press cycles the pressed cell and begins a drag |
| A drag snaps to a row or column, a clear drag erases a rectangle, and release emits a `fill` only when a non-immutable cell would change | spec: Pattern accepts drag-fill rectangle and cursor input |
| A multi-cell paint drag fills only `Unknown` cells, a clear drag still resets marks, carried by `onlyBlank` and previewed by `redraw` | spec: A multi-cell paint drag leaves placed marks |
| A single-cell action overwrites the cell | spec: A Pattern press cycles the pressed cell and begins a drag |
| Cursor movement with control and shift sets cells through the same rectangle move, and Enter and Space cycle as a left and a right press | spec: Pattern's keyboard paints and cycles as the pointer does |
| Immutable cells are never overwritten | spec: Pattern accepts drag-fill rectangle and cursor input |
| Scenario: a drag that changes cells emits a move | spec: Pattern accepts drag-fill rectangle and cursor input |
| Scenario: a multi-cell paint drag leaves placed marks | spec: A multi-cell paint drag leaves placed marks |
| Scenario: a single click still overwrites a mark | spec: A Pattern press cycles the pressed cell and begins a drag |
| Scenario: a no-op drag produces no move | spec: Pattern accepts drag-fill rectangle and cursor input |
| Scenario: a click and Enter agree | spec: Pattern's keyboard paints and cycles as the pointer does |

## Pattern renders clues, the error overlay, and mistakes

| Rule | Where it went |
| --- | --- |
| `redraw` draws the grid, the clue numbers, the cursor and the drag preview, and drives the flash | spec: Pattern renders clues, the error overlay, and mistakes |
| A fully determined line contradicting its clue has its numbers in the error color | spec: Pattern renders clues, the error overlay, and mistakes |
| The check is upstream's `check_errors` | history |
| `findMistakes` flags every marked cell that contradicts the unique solution and never an `Unknown` cell | spec: Pattern's findMistakes flags marks against the unique solution |
| A mistake is rendered with the `COL_MISTAKE` overlay | untrue: `src/games/pattern/render.ts` has no `COL_MISTAKE`, and draws the mistake outline in `COL_ERROR` |
| Every overlay outside the packed cell value is in the render cache diff key | spec: Pattern's overlays are part of the render cache key |
| Scenario: a contradicting completed line shows red clues | spec: Pattern renders clues, the error overlay, and mistakes |
| Scenario: Check & Save flags a wrong cell | spec: Pattern's findMistakes flags marks against the unique solution |

## Pattern provides an explained, deductive hint

| Rule | Where it went |
| --- | --- |
| Pattern implements the hint hooks to the explained-hint quality bar, and each hint teaches why the move is forced by a recognizable line technique | spec: Pattern provides an explained, deductive hint |
| The techniques are run overlap, line completion, unreachable gap, edge or anchor extension and the intersection | untrue: `PATTERN_RUNGS` in `src/games/pattern/solver.ts` is overlap, unreachable, lineEmpty and intersection, with no completion or edge rung |
| Every generated board is solvable by pure deduction, and the hint never reveals the stored solution or runs a search | spec: A Pattern hint never reveals the solution or searches |
| One line deduction forcing several cells is one multi-cell step of a single color | spec: One Pattern line deduction is one multi-cell step |
| The narration leads with the indication and concludes in the necessity voice | spec: Pattern's narration leads with the indication and concludes by necessity |
| Every step names a technique, no generic step, and never the wording "only one arrangement fits" | spec: Every Pattern hint step names a technique |
| The intersection is the bottom rung, narrated in the necessity voice | spec: Every Pattern hint step names a technique |
| The bottom rung's sentence reads "whichever way this line's runs fit, these cells must be black / must stay white" | untrue: `say.intersection` in `src/games/pattern/hint-text.ts` says every way the line's runs can fit covers or leaves out the cells, so they must be the shaded word or the unshaded one |
| The "only one arrangement fits" wording was retired | history |
| The rung always exists for a generated board, so the plan completes with no un-narrated step | spec: A Pattern hint never reveals the solution or searches |
| A hint is refused on a solved board or one with mistakes, by the midend before the game, lighting the overlay and the banner | spec: A Pattern hint is refused on a solved or mistaken board |
| `hintKeepTrack` returns completed, onTrack with the step shrunk, or off | spec: Pattern's hintKeepTrack follows partial progress |
| Scenario: a hint explains a forced line deduction | spec: Pattern provides an explained, deductive hint |
| Scenario: no hint step is a generic un-narrated fallback | spec: Every Pattern hint step names a technique |
| Scenario: the plan solves the board | spec: A Pattern hint never reveals the solution or searches |
| Scenario: a hint refuses on a wrong board | spec: A Pattern hint is refused on a solved or mistaken board |

## Pattern hint color legend

| Rule | Where it went |
| --- | --- |
| Forced cells are ringed in `COL_HINT` and never pre-drawn | spec: Pattern hint color legend |
| Premises follow the element-type legend, each color with a non-color cue and never named in the narration | spec: Pattern's hint premises follow the element-type legend |
| The line's clue in `COL_HINT` and its line of sight hatched, and cited cells outlined by kind at the cell's edge | spec: Pattern's hint premises follow the element-type legend |
| Hint overlay bits are folded into the per-cell render cache key | spec: Pattern hint color legend |
| Scenario: forced cells are highlighted, not pre-filled | spec: Pattern hint color legend |
| Scenario: premise marks are ringed by their color | spec: Pattern's hint premises follow the element-type legend |

## Pattern draws its picture as shaded pieces and crosses on a quiet surface

| Rule | Where it went |
| --- | --- |
| A `Full` cell holds the shaded piece, an `Empty` cell the cross on plain surface, an `Unknown` cell nothing, and no step of gray tells them apart | spec: Pattern draws its picture as shaded pieces and crosses on a quiet surface |
| The other requirements call a `Full` cell black, after upstream | history |
| Grid lines and frame in the quiet grid color, the frame no heavier than a line, a doubled line every fifth cell, clue numbers in ink | spec: Pattern's grid lines are the surface's quiet grid color |
| The game names no hue: hint sentences, control words and legend say the engine's words, and the help page a placeholder | spec: Pattern names no hue of its own |
| The mistake outline sits at the cell's edge, beside the piece | spec: Pattern's mistake outline sits beside the piece |
| Scenario: the three states are a piece, a cross and nothing | spec: Pattern draws its picture as shaded pieces and crosses on a quiet surface |
| Scenario: a hint names the shaded piece by the engine's word | spec: Pattern names no hue of its own |
