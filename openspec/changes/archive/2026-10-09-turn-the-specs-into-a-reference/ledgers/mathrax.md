# Ledger: mathrax

Base: bb004490

Where every rule of Mathrax's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Mathrax game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A complete `Game` implementation, registered, and the objective of the puzzle | spec: Mathrax game implements the Game interface |
| Params are a size, a difficulty of four tiers and a set of six clue types | spec: Mathrax's parameters are a size, a difficulty and a set of clue types |
| The top tier is named `Unreasonable` because it guesses and verifies, and keeps its difficulty character | spec: Mathrax's parameters are a size, a difficulty and a set of clue types |
| The tier was upstream's `Recursive`, and the character is unchanged from that name | history |
| Validation requires a size from 3 to 9 and a known difficulty | spec: Mathrax refuses a size, a difficulty or a clue-type set it cannot play |
| When validating for generation, at least one clue type is enabled | spec: Mathrax refuses a size, a difficulty or a clue-type set it cannot play |
| A game ID encodes the three and round-trips, an empty clue-type set meaning all | spec: Mathrax's parameters are a size, a difficulty and a set of clue types |
| Scenario: a game ID round-trips | spec: Mathrax's parameters are a size, a difficulty and a set of clue types |
| Scenario: the renamed top tier keeps its difficulty character | spec: Mathrax's parameters are a size, a difficulty and a set of clue types |
| Scenario: every preset produces a uniquely solvable board | spec: Mathrax's generator strips a full board while it stays uniquely solvable |

## Mathrax clues constrain the four digits around each intersection

| Rule | Where it went |
| --- | --- |
| Clues on interior intersections, each constraining the four digits around it, by kind of clue, with both scenarios | spec: Mathrax clues constrain the four digits around each intersection |

## Mathrax descriptions use the run-length grid-and-clue encoding

| Rule | Where it went |
| --- | --- |
| Givens then clues in two comma-separated run-length parts, encoding and decoding exact inverses | spec: Mathrax descriptions use the run-length grid-and-clue encoding |
| A description is refused for too many squares, a digit over the size, an unknown character, an unknown clue, or a part that stops short | spec: Mathrax's reading of a description refuses a malformed one |
| A clue number is refused when it is too large | untrue: `clueNumRange` in `src/games/mathrax/state.ts` holds each arithmetic clue's number to a range with a low end as well, so a sum below 2, a product below 1 or a quotient below 2 is refused too |
| The corrected rule of the clue number | spec: Mathrax's reading of a description refuses a malformed one |
| Scenario: a generated description round-trips | spec: Mathrax descriptions use the run-length grid-and-clue encoding |
| Scenario: an out-of-range digit is rejected | spec: Mathrax's reading of a description refuses a malformed one |

## Mathrax input, notes and completion

| Rule | Where it went |
| --- | --- |
| Solo-style scheme: a cell selected for ink by left-click or cursor, digits enter or toggle a pencil mark, backspace, space and zero clear, givens not editable, a value already present a no-op | spec: Mathrax input, notes and completion |
| A cell is selected for pencil marks by right-click | untrue: `newUi` in `src/games/mathrax/state.ts` starts with `pencilSticky` on, and `applyPress` in `src/engine/note-taking-cell.ts` then makes a right press toggle pencil mode. It selects one cell for pencil marks only with the preference off |
| The corrected rule of the right-click | spec: A right-click in Mathrax toggles pencil mode or selects a cell for pencil marks |
| The game fills every empty cell with all candidate pencil marks | untrue: `applyNoteMove` in `src/engine/candidate-hint.ts` makes `pencilAll` fill only an empty cell that has no notes, and never resets a narrowed one |
| The corrected rule of the bulk fill, and the on-screen keypad sized to the grid | spec: Mathrax fills pencil marks in bulk and offers a digit keypad |
| Solved when every cell is filled with no row, column or clue violation, with a flash | spec: Mathrax is solved when the filled grid breaks no rule |
| Scenario: a digit is entered into a selected cell | spec: Mathrax input, notes and completion |
| Scenario: completing the grid correctly wins | spec: Mathrax is solved when the filled grid breaks no rule |
| Scenario: an on-screen keypad is offered | spec: Mathrax fills pencil marks in bulk and offers a digit keypad |

## Mathrax flags mistakes against the unique solution

| Rule | Where it went |
| --- | --- |
| `findMistakes` is provided so Check & Save can block a wrong board, flags a wrong digit and a note that crossed out the answer, never a cell with extra candidates, and nothing on a board that is not uniquely deducible, with the three scenarios | spec: Mathrax flags mistakes against the unique solution |
| The solution is derived from placed values only | untrue: `solveFromGivens` in `src/games/mathrax/index.ts` solves from the immutable cells and the clues alone, so the player's placed digits are not read either |
| The corrected rule of what the solve reads | spec: Mathrax flags mistakes against the unique solution |
| It is provided because Mathrax has a unique solution | reason |

## Mathrax grades its difficulty tiers honestly

| Rule | Where it went |
| --- | --- |
| A board above the easiest tier is not soluble at the tier below, the generator retries until one binds, and the loop is bounded, with the scenario | spec: Mathrax grades its difficulty tiers honestly |
| Upstream strips while the board solves at the target tier and generates exactly once | history |
| The correction changes every board above the easiest tier, and is the generator's second divergence | history |

## Mathrax offers only the difficulties a size can support

| Rule | Where it went |
| --- | --- |
| No size-3 board is generated at Normal or the top tier, `validateParams` rejects them when full and accepts them otherwise, and size 3 at Tricky is unaffected | spec: Mathrax offers only the difficulties a size can support |
| The message names those tiers from the tier list and not in prose | spec: The size-3 refusal names its tiers from the tier list |
| A 3x3 grid's four intersections cannot separate those tiers | spec: Mathrax offers only the difficulties a size can support |
| How many candidates were tried, and the cost of the other tiers | figure |
| Scenario: an unsupported size and tier are refused, with a message naming the size, and accepted with a description | spec: Mathrax offers only the difficulties a size can support |
| Scenario clause: the message names the tiers as the menu does | spec: The size-3 refusal names its tiers from the tier list |

## Mathrax solves and generates over the shared Latin-square framework

| Rule | Where it went |
| --- | --- |
| Solving over the shared Latin framework with Mathrax's clue deduction, across the four levels | spec: Mathrax solves and generates over the shared Latin-square framework |
| A full Latin square, a candidate clue at every intersection, removals in randomized order while uniquely solvable, reproducible from a seed | spec: Mathrax's generator strips a full board while it stays uniquely solvable |
| Uniqueness at every difficulty, the top tier included, since an ambiguous board cannot be mistake-checked | spec: A Mathrax board has one solution at every difficulty |
| An ambiguous verdict is not grounds to keep removing | spec: A Mathrax board has one solution at every difficulty |
| Upstream tests its verdict for truthiness | history |
| On an ambiguous board Check & Save would silently pass anything played | reason |
| How many sampled boards were ambiguous, and the recorded C descriptions | figure |
| Scenario: the solver solves a generated board | spec: Mathrax solves and generates over the shared Latin-square framework |
| Scenario: generation is reproducible from a seed | spec: Mathrax's generator strips a full board while it stays uniquely solvable |
| Scenario: even the guess-and-verify tier yields a unique solution | spec: A Mathrax board has one solution at every difficulty |

## Mathrax explains the next deduction

| Rule | Where it went |
| --- | --- |
| A solved or mistaken board is refused by the midend, and `hint` otherwise returns an ordered plan of forced steps, each narrating its premises | spec: Mathrax explains the next deduction |
| The plan is the shared walk over rows and columns, with one setup clean, then naked singles, recorded strikes and recorded placements in order | spec: Mathrax's hint plan is the shared candidate-elimination walk |
| The plan fills notes with the additive `pencilAll` before a deduction first needs them, said of every plan | untrue: `newUi` in `src/games/mathrax/state.ts` starts on the `implicit` reading, under which `runCandidatePlan` in `src/engine/candidate-plan.ts` has no populate and a firing writes only the notes it rests on. The fill is the plan's opening only under the populate reading |
| The corrected rule of the fill, and the reading Mathrax starts on | spec: Mathrax's hint plan is the shared candidate-elimination walk |
| The recording solve is seeded from placed digits alone and capped below the guess-and-verify tier | spec: The recording solve reads placed digits and stops below the guess-and-verify tier |
| A recorded clue elimination names one clue on one cell, attributed to a clue whose options exclude it, one clue per firing | spec: A recorded clue elimination names one clue acting on one cell |
| Recording does not change what is committed, the gate waits on every incident clue, and the generator's boards are the same | spec: Recording does not change what the Mathrax solver commits |
| A clue step names the clue as drawn, states the operation in words, and names a digit across it only when the working board shows one | spec: A clue step names its clue and what lies across it |
| A clue step shades the cells that identify the clue | untrue: `say` in `src/games/mathrax/hint-text.ts` marks those cells as `outline`, and `redraw` in `src/games/mathrax/render.ts` paints the evidence as an outline on the cells' borders, not a shade |
| The corrected rule of the evidence, by kind of clue, with its reason | spec: A clue step outlines the cells that identify its clue |
| The auto-pencil preference, acting on the board and in the plan | spec: Mathrax offers the auto-pencil preference |
| Scenario: a clue read against a digit across it | spec: A clue step names its clue and what lies across it |
| Scenario: a clue read against an open cell | spec: A clue step names its clue and what lies across it |
| Scenario: an even or odd clue shades all four cells | untrue: the four cells are outlined, as above |
| The corrected scenario | spec: A clue step outlines the cells that identify its clue |
| Scenario: the recorder does not change the solver's verdict | spec: Recording does not change what the Mathrax solver commits |
| Scenario: refusing a solved or mistaken board | spec: Mathrax explains the next deduction |

## Mathrax draws its cells on a quiet surface and lifts a given

| Rule | Where it went |
| --- | --- |
| Cells on the cell surface, the surface grid line and a frame no heavier, a given on the lifted surface with its number in ink, with both scenarios | spec: Mathrax draws its cells on a quiet surface and lifts a given |
| A number the player entered keeps the entry color | untrue: `drawTile` in `src/games/mathrax/render.ts` draws a digit flagged `FE_COUNT`, one repeated in its row or column, in `COL_ERROR` |
| The corrected rule of the entry color | spec: Mathrax draws its cells on a quiet surface and lifts a given |
| A clue is a disc in the lifted color with a ring in ink | untrue: `drawClue` in `src/games/mathrax/render.ts` draws the quarter in a cell whose digit contradicts the clue as a `COL_ERRORBG` disc with a `COL_ERROR` ring, the label still ink |
| The corrected rule of the clue, with its label in ink in both schemes | spec: A Mathrax clue is a lifted disc with a ring and a label in ink |
| The wash, the notes corner and the pencil marks on the cell's surface, and the hint's marks on the cell's edge | spec: Mathrax's highlight, notes and hint marks keep their places |
| These are drawn "as before" | history |
