# Ledger: unequal

Base: bb004490

Where every rule of Unequal's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters, and the rules the
code no longer bears out corrected to it.

## Unequal game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `unequal` game implements `Game`, a Latin square under clues between neighbors | spec: Unequal game implements the Game interface |
| The list of the six type arguments of `Game` | untrue: `unequalGame` in `src/games/unequal/index.ts` is typed with eight, adding `UnequalHint` and `UnequalRung`, so the requirement names `Game` alone |
| It provides `solve` and `textFormat`, no `statusbarText`, and `canMarkAll = true` | spec: Unequal game implements the Game interface |
| Two modes, a greater-than sign and a bar whose absence is also a clue | spec: Unequal has two modes |
| Params are `order`, `mode` and `diff` with its five values, and their encoding with the `a` and `d{c}` suffixes | spec: Unequal's parameters and their encoding |
| Each mode's presets are a grid of sizes by tiers | spec: Unequal's parameters and their encoding |
| The tier names Easy, Normal, Tricky, Hard and Unreasonable | spec: Unequal's tier names have one definition |
| The top tier is Unreasonable because it branches and backtracks, and its character stays `r` | spec: Unequal's tier names have one definition |
| "Rather than upstream's `Recursive`" | history |
| The tier names have a single definition read by the menu and the dialog | spec: Unequal's tier names have one definition |
| `validateParams` requires `3 ≤ order ≤ 32` | untrue: the bounds are 3 to `MAX_CANDIDATE_VALUE`, which is 31 in `src/engine/candidate-bits.ts`, declared on the size item of `paramConfig` and refused by the engine's `paramsError`, not by `validateParams`; spec: Unequal refuses the parameters it cannot deal |
| `validateParams` requires a known difficulty | spec: Unequal refuses the parameters it cannot deal |
| `validateParams` requires `order ≥ 5` for Adjacent puzzles of Tricky or harder | spec: Unequal refuses the parameters it cannot deal |
| Scenario: params round-trip | spec: Unequal's parameters and their encoding |
| Scenario: the renamed top tier keeps its difficulty character | spec: Unequal's tier names have one definition |
| Scenario: the menu and the custom dialog offer the same tiers | spec: Unequal's tier names have one definition |
| Scenario: invalid params are rejected | spec: Unequal refuses the parameters it cannot deal |

## Unequal descriptions encode per-cell numbers and adjacency flags

| Rule | Where it went |
| --- | --- |
| The grid in scan order, a number and its flag letters per cell | spec: Unequal descriptions encode per-cell numbers and adjacency flags |
| The fields are comma-separated, and a cell's flag letters come in any order | untrue: `parseDesc` in `src/games/unequal/state.ts` expects a comma after every cell, the last included, and accepts each letter at most once in the order `URDL`, which is what `encodeDesc` in `generator.ts` writes; spec: Unequal descriptions encode per-cell numbers and adjacency flags |
| The refusals are `validateDesc`'s | untrue: `unequalGame` in `src/games/unequal/index.ts` has no `validateDesc`, and a desc is refused by the `parseDesc` that `newState` reads through, so the requirement names no hook; spec: A malformed Unequal description is refused |
| Runs of leading blank cells MAY be skipped with the letters `a` to `z` | untrue: `parseDesc` in `src/games/unequal/state.ts` reads a number for every cell and refuses a letter there. Upstream's loader took the letters and its generator never wrote them; spec: A malformed Unequal description is refused |
| `validateDesc` rejects the wrong number of cells, a number out of range, a flag off the grid and contradictory flags | spec: A malformed Unequal description is refused |
| `newState` decodes into the immutable givens, the working grid and the immutable clue flags | spec: Unequal descriptions encode per-cell numbers and adjacency flags |
| Scenario: description round-trips through generate and decode | spec: Unequal descriptions encode per-cell numbers and adjacency flags |
| Scenario: malformed description is rejected | spec: A malformed Unequal description is refused |

## Unequal generates uniquely-solvable boards at the target difficulty

| Rule | Where it went |
| --- | --- |
| `newDesc` generates a full Latin square as the solution and builds a clue set | spec: Unequal generates uniquely-solvable boards at the target difficulty |
| Unequal mode adds number and inequality clues greedily and strips the redundant ones, and Adjacent mode seeds every flag and strips redundant numbers | spec: Unequal builds its clue set by adding and then stripping |
| It regenerates until the puzzle is solvable at the chosen difficulty and not below it | spec: Unequal generates uniquely-solvable boards at the target difficulty |
| It falls back to an easier difficulty after the upstream retry cap | untrue: `newUnequalDesc` in `src/games/unequal/generator.ts` loops until a board is at its tier and never deals an easier one, and `validateParams` refuses a 3×3 at Tricky or Unreasonable when a board is to be dealt; spec: Unequal generates uniquely-solvable boards at the target difficulty; spec: Unequal refuses the parameters it cannot deal |
| The result is uniquely solvable, and `newDesc` returns an `aux` solution string | spec: Unequal generates uniquely-solvable boards at the target difficulty |
| Scenario: generated board is unique and correctly graded | spec: Unequal generates uniquely-solvable boards at the target difficulty |

## Unequal accepts digit, pencil, clue-spent, and solve moves

| Rule | Where it went |
| --- | --- |
| A cell is selected by mouse, left for entry and right for pencil marks, or by the keyboard cursor | spec: Unequal accepts digit, pencil, clue-spent, and solve moves |
| A digit places or pencil-toggles, a clear key clears, the same value is a no-op, and a given rejects entry | spec: Unequal accepts digit, pencil, clue-spent, and solve moves |
| A digit is entered as a digit, or a letter for 11 and above at large orders | spec: Unequal accepts digit, pencil, clue-spent, and solve moves; spec: The keypad is zero-based from order 10 |
| `0` clears | untrue: `charValue` in `src/games/unequal/state.ts` reads `0` as the value 1 from order 10 up, so it clears only below order 10; spec: Unequal accepts digit, pencil, clue-spent, and solve moves |
| A click on a clue in the gap, or a shift/ctrl-cursor toward one, toggles its spent state | spec: A clue is struck through by a click or a modified arrow |
| `M` fills every empty cell with all candidate pencil marks | untrue: `interpretMove` in `src/games/unequal/index.ts` returns `adaptiveMarkAllMove`, which fills only the empty cells with no notes and, once every empty cell has notes, strikes the row and column duplicates instead; spec: The M key is Unequal's Mark-all |
| `executeMove` is pure, and the board is solved exactly while the filled grid satisfies every constraint | spec: Unequal applies a move purely and is solved by its rules |
| Scenario: entering the last correct number completes the board | spec: Unequal applies a move purely and is solved by its rules |
| Scenario: entry into an immutable cell is rejected | spec: Unequal accepts digit, pencil, clue-spent, and solve moves |
| Scenario: clicking a clue toggles its spent state | spec: A clue is struck through by a click or a modified arrow |

## Unequal renders greater-than signs or adjacency bars between cells

| Rule | Where it went |
| --- | --- |
| The grid with a gap between cells, a sign pointing from larger to smaller or a bar in each clue's gap | spec: Unequal renders greater-than signs or adjacency bars between cells |
| A clue is colored as normal, violated (red) or spent | spec: Unequal renders greater-than signs or adjacency bars between cells |
| A filled cell shows its number colored as given, entered or error, and an empty one its pencil marks in an auto-sized grid | spec: Unequal draws a cell's number or its pencil marks |
| The selection's full highlight or corner wedge, the pencil-mode indicator, the keyboard cursor and the completion flash | spec: Unequal draws the selection, the pencil mode, the cursor and the flash |
| Cells are diffed against a per-tile cache that accounts for the gap clues and the mistake overlay | spec: Unequal's tile cache accounts for the clues and the mistake overlay |
| Scenario: Unequal mode draws greater-than signs | spec: Unequal renders greater-than signs or adjacency bars between cells |
| Scenario: Adjacent mode draws adjacency bars | spec: Unequal renders greater-than signs or adjacency bars between cells |

## Unequal exposes pencil-mark preferences

| Rule | Where it went |
| --- | --- |
| Sticky pencil mode, default on, and auto-pencil, default off, stored on the `Ui` | spec: Unequal exposes pencil-mark preferences |
| The keep-highlight preference defaults off | untrue: `newUi` in `src/games/unequal/state.ts` sets `pencilKeepHighlight: true`; spec: Unequal exposes pencil-mark preferences |
| With auto-pencil off, note cleanup is manual, by the mark-all control or a hint | spec: Note cleanup is manual while auto-pencil is off |
| Scenario: sticky pencil mode persists across left-clicks | spec: Unequal exposes pencil-mark preferences |

## Unequal checks for mistakes against the unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` re-solves from the givens and clues and returns wrong entries and note mistakes | spec: Unequal checks for mistakes against the unique solution |
| The solution is derived from the placed givens only, never the notes | spec: Unequal checks for mistakes against the unique solution |
| A board not uniquely solvable from the givens returns an empty result | spec: A board with no unique solution has no mistakes to report |
| Scenario: a wrong number is flagged, ordinary notes are not | spec: Unequal checks for mistakes against the unique solution |

## Unequal provides an explained deduction hint

| Rule | Where it went |
| --- | --- |
| `hint(state, aux?, ui?)` returns a plan teaching the next deduction in pencil-note terms, from a cube seeded by givens and entries only | spec: Unequal provides an explained deduction hint |
| The plan walks a working copy of the board the way a person solves it | spec: Unequal provides an explained deduction hint |
| A naked single first, placed via `set` | spec: The hint prefers a single, then a strike, then a placement |
| A naked single is sound on a mistake-free board, since its candidate is then the solution | reason |
| The basic Latin row/column eliminations, struck via `pencilStrike`, then the clue eliminations, then a forced placement, in that order of preference | spec: The hint prefers a single, then a strike, then a placement |
| A lazy populate via `pencilAll`, emitted only when some empty cell lacks notes | spec: The hint starts on the implicit reading |
| Populate comes before the eliminations on every plan, and every elimination is a `pencilStrike` | untrue: `newUi` in `src/games/unequal/state.ts` starts on `candidateReading: "implicit"`, under which the walk in `src/engine/candidate-plan.ts` emits no fill-all step, and its `fold` turns a strike from a cell with no notes into a `pencilAdd` of what is left or a placement of the one value left. The fill precedes the first elimination only under the populate reading; spec: The hint starts on the implicit reading |
| A clue elimination is one technique firing | spec: A clue elimination is one firing of one clue |
| A firing's strikes all go by one `pencilStrike` move | untrue: `strikeAxis` in `buildSteps` in `src/games/unequal/index.ts` splits a firing into one leg and one `pencilStrike` per cell, so a link that strikes from both its ends is two steps of one journey; spec: A clue elimination is one firing of one clue; spec: A firing that forces several strikes is one journey |
| The narration leads with the indication, then the reasoning, then a necessity-voice conclusion, and reads correctly at the value extremes | spec: Unequal's hint narration meets the hint quality bar |
| A firing forcing several strikes is one journey with `continuesPrevious` legs | spec: A firing that forces several strikes is one journey |
| Equivalent strikes of one firing share the target hint color | spec: A hint's marks ring the struck cell and outline the clue's pair |
| The trivial row/column eliminations of a placement follow the auto-pencil preference | spec: The auto-pencil preference governs a placement's row and column strikes |
| The hint refuses on a solved board or one with mistakes, and the refusal lights the mistake overlay | spec: The hint is refused on a solved or mistaken board |
| The game's `hint` is what refuses a solved or mistaken board | untrue: `hint` in `src/games/unequal/index.ts` is one call of `candidateHint`, which refuses only an empty plan. The midend refuses these two boards before asking the game; spec: The hint is refused on a solved or mistaken board |
| The deduction is capped below recursion | spec: The hint's deduction is capped below recursion |
| Every step is monotone progress, a recomputed hint resumes to a solved board, and a recompute skips what the board already shows | spec: Every hint step is monotone progress |
| `hintKeepTrack` advances on a matching move, a placement of the hinted value is `completed`, and any other move drops the plan | spec: A kept plan follows the player's own move |
| A `pencilStrike` clearing a subset of the step's marks is `onTrack` | untrue: `keepCandidateHintTrack` in `src/engine/candidate-hint.ts` gives `completed` to a `pencilStrike` of exactly the step's marks and `off` to one of fewer. What shrinks the step is a pencil toggle, a `set` with `pencil`, on one of its marks; spec: A kept plan follows the player's own move |
| `refreshHintStep` drops dead marks or resolves the step before each display | spec: A stored step is refreshed before it is shown |
| The solver's recording is gated, so the generator and solve path is unchanged with it off | spec: The solver's recording is gated |
| One recorded firing maps to one `group`, so a step never mixes clues | spec: A clue elimination is one firing of one clue |
| Scenario: an inequality bound is taught as a note strike, by its move and its narration | spec: Unequal provides an explained deduction hint |
| Scenario clause: the clue's two cells are shaded and the struck candidates marked in the hint color | untrue: `redraw` in `src/games/unequal/render.ts` outlines the evidence cells and rings the struck cell in the gap, and `drawHints` draws a struck candidate in the pencil color with a line through it; spec: A hint's marks ring the struck cell and outline the clue's pair |
| Scenario: an adjacency clue is taught in Adjacent mode | spec: Unequal provides an explained deduction hint |
| Scenario: an empty board is populated before elimination | spec: The hint starts on the implicit reading |
| Scenario: the hint resumes from a self-played mid-game position | spec: Every hint step is monotone progress |
| Scenario: the hint refuses on a board with mistakes | spec: The hint is refused on a solved or mistaken board |

## Unequal provides on-screen key labels

| Rule | Where it went |
| --- | --- |
| `requestKeys(params)` returns a button per value and then the clear key, code `8` labeled "Clear", in both modes | spec: Unequal provides on-screen key labels |
| Each button's label is its own character | spec: Unequal provides on-screen key labels |
| Below order 10 the buttons are `'1'..'9'`, and from order 10 the keypad is `'0'`-based with letters from 11 | spec: The keypad is zero-based from order 10 |
| It diverges from the shared `digitKeys` helper | spec: The keypad is zero-based from order 10 |
| "Faithful to upstream's `c2n`/`game_request_keys`" | history |
| "Orders run 3..32, so the high range is genuinely reachable" | figure |
| Scenario: the keypad covers the grid's digits plus clear | spec: Unequal provides on-screen key labels |
| Scenario: the keypad is zero-based for order 10 and above | spec: The keypad is zero-based from order 10 |

## Unequal draws its boxes as quiet surfaces, with a given's lifted

| Rule | Where it went |
| --- | --- |
| Each cell is its own box on the cell surface, a given's on the lifted surface, outlined in the surface grid line | spec: Unequal draws its boxes as quiet surfaces, with a given's lifted |
| The signs and bars keep their own colors, drawn between the boxes | spec: Unequal draws its boxes as quiet surfaces, with a given's lifted |
| The selection's wash and pencil-mode corner are drawn over whichever surface the box has | spec: The selection is drawn over the box and the hint's marks beside it |
| The hint's marks stay in the gap beside the box | spec: The selection is drawn over the box and the hint's marks beside it |
| Scenario: a given is told by the box under it | spec: Unequal draws its boxes as quiet surfaces, with a given's lifted |
