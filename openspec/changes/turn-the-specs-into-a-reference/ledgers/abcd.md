# Ledger: abcd

Base: bb004490

Where every rule of ABCD's spec went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## ABCD game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/abcd/` implements `Game` and is registered | spec: ABCD game implements the Game interface |
| The five parameters, and what validation requires of width, height and the letter count | spec: ABCD's parameters |
| "Matching upstream" | history |
| A game ID encodes width, height, letter count and the diagonal flag and round-trips, and "remove clues" is in the full encoding only | spec: ABCD's parameters |
| `findMistakes` re-solves and reports a differing letter and marks that leave out the answer, never marks with extra letters | spec: ABCD's findMistakes compares the board with its one solution |
| Scenario: a game ID round-trips | spec: ABCD's parameters |
| Scenario: invalid letter counts are rejected | spec: ABCD's parameters |
| Scenario: a mark that has crossed out the answer is a mistake | spec: ABCD's findMistakes compares the board with its one solution |

## ABCD descriptions use the edge-clue encoding

| Rule | Where it went |
| --- | --- |
| The comma-terminated clue list, rows then columns in letter order, `-` for a hidden clue | spec: ABCD descriptions use the edge-clue encoding |
| Encoding and decoding are exact inverses | spec: ABCD descriptions use the edge-clue encoding |
| Validation rejects a wrong clue count, telling too few from too many, a clue too large for its line and an unrecognized character | spec: An ABCD description is validated against its clue count and its lines |
| Scenario: a generated description round-trips | spec: ABCD descriptions use the edge-clue encoding |
| Scenario: the wrong number of clues is rejected | spec: An ABCD description is validated against its clue count and its lines |

## ABCD ports the deductive solver and solver-gated generator

| Rule | Where it went |
| --- | --- |
| The solver reports unique, ambiguous or contradictory | spec: ABCD's solver classifies a clue set by deduction alone |
| It applies three techniques to a fixpoint without backtracking | spec: ABCD's solver classifies a clue set by deduction alone |
| It depends on no leaf library | spec: ABCD's solver classifies a clue set by deduction alone |
| The generator fills at random under the no-touch rule and accepts only a uniquely solvable fill, retrying otherwise | spec: ABCD's generator accepts only a uniquely solvable fill |
| With "remove clues" set, clues are hidden in a randomized order while the puzzle stays uniquely solvable | spec: Removing clues keeps the puzzle uniquely solvable |
| Generation from a seed is reproducible | spec: ABCD's generator accepts only a uniquely solvable fill |
| Scenario: the solver classifies a puzzle | spec: ABCD's solver classifies a clue set by deduction alone |
| Scenario: generation is reproducible from a seed | spec: ABCD's generator accepts only a uniquely solvable fill |

## ABCD input, entry, marks and completion

| Rule | Where it went |
| --- | --- |
| A cell is selected by click or arrow keys, a letter entered by its key or digit, cleared by Backspace, Space or `0`, with a pencil-mark mode | spec: ABCD enters a letter into the selected cell |
| A fill-all-marks command sets every empty cell's candidate marks | untrue: `interpretMove` in `src/games/abcd/index.ts` makes the adaptive mark-all, whose `pencilAll` fills only an empty cell with no marks and never resets a narrowed one, and whose later presses strike the marks `abcdObviousMarks` in `src/games/abcd/solver.ts` lists, which the rewritten requirement states; spec: ABCD's fill-all-marks command fills only cells with no marks |
| A Solve command fills the grid with the unique solution | spec: Solve fills the grid with the unique solution |
| An entry that changes nothing is no move, clearing a cell with marks is a real one, and the decision is local to the cell | spec: An ABCD entry that changes nothing is no move |
| Rendering draws the grid, edge clues, corner letters, pencil marks and the cursor highlight, flashes on completion and has no move animation | spec: What ABCD draws |
| A letter with an identical letter adjacent is red, orthogonally and diagonally when that is disallowed | spec: What ABCD draws |
| A clue is red while it is over- or under-satisfied | untrue: `computeClueErrors` in `src/games/abcd/render.ts` flags a clue only when its line holds more of the letter than the clue, or when the line's empty cells are too few to reach it, so an unfinished line that can still reach its clue is not red and "What ABCD draws" says so |
| The game is solved when every cell is filled, every clue satisfied and no identical letters adjacent under the active rule | spec: ABCD is solved when the grid is full and every rule holds |
| Scenario: entering a letter fills the selected cell | spec: ABCD enters a letter into the selected cell |
| Scenario: re-entering a letter costs no undo step, and clearing marks is a real move | spec: An ABCD entry that changes nothing is no move |
| Scenario: completing the grid correctly wins | spec: ABCD is solved when the grid is full and every rule holds |
| Scenario: an entry that contradicts the solution is flagged | spec: ABCD's findMistakes compares the board with its one solution |

## ABCD refuses board sizes it cannot generate

| Rule | Where it went |
| --- | --- |
| Validation for generation refuses, with a reason, a size and letter count whose measured success rate is too low, in place of retrying to a budget | spec: ABCD refuses board sizes it cannot generate |
| The acceptance rate falls towards zero as the board grows, so a large board can use a whole budget and fail | reason |
| "A multi-million-attempt budget" and "orders of magnitude" | figure |
| The bound is derived from measurement across size, shape and letter count, none of which alone determines the rate | spec: The bound is measured across size, shape and letter count |
| Diagonal mode is bounded separately, being more generable | spec: The bound is measured across size, shape and letter count |
| The bound is not applied when a description is in hand | spec: ABCD refuses board sizes it cannot generate |
| Every preset passes, and the bound is asserted in both directions | spec: The bound admits every preset and is asserted in both directions |
| The retry cap is sized to what the bound admits, so exhausting it signals a defect | spec: The generator's retry cap is sized to what the bound admits |
| Scenario: a board of the same area as a refused one is still offered | spec: The bound is measured across size, shape and letter count |
| Scenario: diagonal mode is bounded on its own measurements | spec: The bound is measured across size, shape and letter count |
| Scenario: an un-generable configuration is refused immediately | spec: ABCD refuses board sizes it cannot generate |
| Scenario: an existing game ID outside the bound still loads | spec: ABCD refuses board sizes it cannot generate |

## ABCD's solver is a certified deduction ladder

| Rule | Where it went |
| --- | --- |
| The three techniques run as a `runDeductionFixpoint` ladder | spec: ABCD's solver is a certified deduction ladder |
| A firing census walks generated boards covering every preset shape, diagonal mode and a thin board, and asserts every technique fires, with a count of the boards solved | spec: ABCD's solver is a certified deduction ladder |
| The hand-written loop is not kept | spec: ABCD's solver is a certified deduction ladder |
| "Once the adoption is proved; git holds it" | history |
| Scenario: a technique the corpus never reaches fails the census | spec: ABCD's solver is a certified deduction ladder |

## ABCD offers an explained hint

| Rule | Where it went |
| --- | --- |
| The hint is built on the shared plan walk, from the player's marks and placed letters, with the no-touch rule as its reach | spec: ABCD offers an explained hint |
| Besides the walk's own steps, its rungs are one line's firing of the solver's techniques | spec: ABCD offers an explained hint |
| Satisfied clue: what it strikes, and what it names, hatches and draws | spec: The satisfied-clue rung strikes a letter from a line that has its count |
| Runs: what it places as one journey, what it outlines, hatches and draws, and that its arithmetic is the solver's own | spec: The runs rung places the letters a line's open cells force |
| The runs rung outlines the cells that can still take the letter, on every line | untrue: `say.onlyHomes` in `src/games/abcd/hint-text.ts` outlines nothing when the line needs one letter and one cell can take it, the ring being that cell, so the rewritten requirement outlines them where there are several |
| Runs is offered only when no other rung has a firing | spec: The runs rung is the hint's last resort |
| ABCD offers `hint-notes` and starts on the `populate` reading | spec: ABCD's hint starts on the populate reading |
| Scenario: the hint finishes every generated board | spec: ABCD offers an explained hint |
| Scenario: a runs step names the line and the count | spec: The runs rung places the letters a line's open cells force |
| That scenario holds of every runs step | untrue: in `src/games/abcd/hint.ts` a later step of the same firing says only that its cell "must be" the letter "too", and a line with as many open cells as it needs is worded by `say.onlyHomes` in `src/games/abcd/hint-text.ts`, so the scenario now names the first step on a line with more open cells than letters to place |
| Scenario: the runs claim holds for every line shape | spec: The runs rung places the letters a line's open cells force |

## ABCD's menu offers a board under each of its rules

| Rule | Where it went |
| --- | --- |
| The presets include a board with diagonal touching disallowed, and why only a preset reaches it | spec: ABCD's menu offers a board under each of its rules |
| Scenario: the rule against diagonal touching is on the menu | spec: ABCD's menu offers a board under each of its rules |
| Scenario: the board deals at once and the hint finishes it | spec: ABCD's menu offers a board under each of its rules |
| "The deal takes milliseconds" | figure |

## ABCD draws its letters on a quiet surface

| Rule | Where it went |
| --- | --- |
| Every cell is the cell surface, with the surface grid line between cells and as the frame | spec: ABCD draws its letters on a quiet surface |
| No cell takes a given's lifted surface, the clues stay outside the surface, and the corner marks keep their own color | spec: ABCD draws its letters on a quiet surface |
| The selection's wash and pencil-mode corner are drawn over the surface, and the hint's marks stay on the border | spec: ABCD's selection and hint marks keep their places on the surface |
| Scenario: the grid recedes | spec: ABCD draws its letters on a quiet surface |
