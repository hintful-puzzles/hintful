# Ledger: crossing

Base: bb004490

Where every rule of Crossing's spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Crossing game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/crossing/` implements `Game` and is registered | spec: Crossing game implements the Game interface |
| The parameters are a width, a height and a symmetric-walls flag | spec: Crossing's parameters |
| Both dimensions at least 2, and at least one at least 4 | spec: Crossing's parameters |
| "Matching upstream", and "the corresponding upstream message" | history |
| A game ID round-trips, and is square when the height is omitted | spec: Crossing's parameters |
| A game ID encodes the symmetry | untrue: the `S` flag is declared `full` in the `paramsCodec` of `src/games/crossing/state.ts`, so only the full encoding carries it |
| It implements `findMistakes`, so Check & Save can block a save | spec: Crossing game implements the Game interface |
| It offers the on-screen digit keypad and supports pencil marks | spec: Crossing game implements the Game interface |
| That the keypad was "restored" | history |
| Scenario: every preset produces a uniquely-solvable board | spec: Crossing's generator keeps every board uniquely solvable |
| Scenario: a game ID round-trips through the parameters | spec: Crossing's parameters |
| Scenario: a dimension below the minimum is rejected | spec: Crossing's parameters |

## Crossing descriptions use the upstream run-length encoding

| Rule | Where it went |
| --- | --- |
| The run-length encoding of walls, then the comma-separated clue numbers | spec: Crossing descriptions use the upstream run-length encoding |
| The clue numbers are stored sorted by length and then lexicographically | spec: Crossing descriptions use the upstream run-length encoding |
| Validation rejects an unknown wall character, too much cell data and a duplicate clue number | spec: A Crossing description is validated against its board |
| It rejects a clue number longer than the maximum row length | spec: A Crossing description is validated against its board |
| Those are its only checks: an over-short description and an invalid digit character are accepted | untrue: `parseDesc` in `src/games/crossing/state.ts` reads through `readDesc`, which fails a description that ends early as too short, and it fails a clue character that is not `1` to `9`, a clue number under 2 digits, and a clue list whose lengths do not match the board's runs |
| Scenario: a generated description round-trips | spec: Crossing descriptions use the upstream run-length encoding |
| Scenarios: an unknown wall character and a duplicate clue number are rejected | spec: A Crossing description is validated against its board |

## Crossing ports the deductive solver and solver-gated generator

| Rule | Where it went |
| --- | --- |
| The solver finds the unique solution or reports the board undetermined or contradictory, by propagation over the runs to a fixpoint | spec: Crossing's solver propagates what the fitting numbers allow |
| It reports a board valid only when every run matches one clue and each clue is used once | spec: The solver calls a board valid only when every clue is used once |
| The generator grows the walls, fills digits, reads the clue list and accepts only a board the solver reports valid, retrying otherwise | spec: Crossing's generator keeps every board uniquely solvable |
| Generation from a seed is reproducible | spec: Crossing's generator keeps every board uniquely solvable |
| Scenario: the solver finds the unique solution | spec: Crossing's solver propagates what the fitting numbers allow |
| Scenario: generation is reproducible from a seed | spec: Crossing's generator keeps every board uniquely solvable |

## Crossing input, marking, mistakes and completion

| Rule | Where it went |
| --- | --- |
| Played by selecting an open cell and entering a digit, with a separate pencil-mark mode | spec: Crossing is played by selecting a cell and entering a digit |
| A left click selects for digit entry and a right click for pencil marking, in every case | untrue: `pressNoteTakingCell` in `src/engine/note-taking-cell.ts` does that only with `pencilSticky` off, and `newUi` in `src/games/crossing/state.ts` turns it on, where a right press toggles the mode and a left press selects in the mode that is on |
| The arrow keys move a keyboard cursor and Enter toggles between digit and pencil entry | spec: The arrow keys move a cursor and Enter switches the entry mode |
| A digit key places a digit or toggles a note, and Backspace, Space or `0` clears | spec: A digit key enters, and Backspace, Space or 0 clears |
| Walls are not editable, and a move that changes nothing makes no history entry | spec: A digit key enters, and Backspace, Space or 0 clears |
| A completed run matching no clue number is flagged live, independently of `findMistakes` | spec: A full run that reads as no clue number is flagged live |
| `findMistakes` re-solves, flags wrong digits and notes that cross out the solution digit, and returns nothing on an undetermined board | spec: Crossing's findMistakes compares the board with the unique solution |
| Complete when every run matches one clue and each clue is used once, with a flash | spec: Crossing is complete when every clue is placed exactly once |
| A wall is a flat, strong fill and a placed digit sits on a flat, lifted surface, neither beveled | spec: Crossing draws flat squares on a quiet surface |
| A placed digit is drawn in one ink | untrue: `drawCell` in `src/games/crossing/render.ts` draws a digit in `COL_RUNTEXT`, the paper color, where a run's direction wash is under it, and in `COL_TEXT` elsewhere, which the spec now says in "A wash replaces a square's surface, empty or filled" |
| Rendering draws pencil marks and a number-list panel below the grid colored by how many times each clue is placed | spec: The number list sits below the grid and shows how often each clue is placed |
| Rendering draws the run-error highlights | spec: A full run that reads as no clue number is flagged live |
| Scenario: entering the wrong digit is caught by Check & Save | spec: Crossing's findMistakes compares the board with the unique solution |
| Scenario: a no-op entry makes no move | spec: A digit key enters, and Backspace, Space or 0 clears |
| Scenario: placing every clue exactly once wins | spec: Crossing is complete when every clue is placed exactly once |

## Crossing advances the selection along the number being filled

| Rule | Where it went |
| --- | --- |
| Entering a digit moves the selection to the next cell of the run being filled, as a preference that is on by default | spec: Crossing advances the selection along the number being filled |
| "The enhancement the game's own documentation asks for" | history |
| The direction is remembered, and set by the last arrow key, by a cell in only one run, and by a repeat click at a crossing | spec: The fill direction is remembered and set by three gestures |
| A repeat click with no direction to toggle deselects the cell | spec: The fill direction is remembered and set by three gestures |
| That it deselects "as before" | history |
| The selection does not advance after clearing a cell or after a pencil mark | spec: Crossing advances the selection along the number being filled |
| Scenarios: a whole number is typed after one selection, and the selection stops at the end of the run | spec: Crossing advances the selection along the number being filled |
| Scenario: clicking a crossing cell again changes direction | spec: The fill direction is remembered and set by three gestures |

## Crossing rejects board sizes it cannot generate

| Rule | Where it went |
| --- | --- |
| Validation for generation rejects a board over the generable maximum, with a reason | spec: Crossing rejects board sizes it cannot generate |
| "Rather than retrying indefinitely as upstream does" | spec: Crossing rejects board sizes it cannot generate |
| That the maximum was "measured" | history |
| Generation retries until every run reads as a distinct number, so success falls to zero as the board grows | spec: Crossing rejects board sizes it cannot generate |
| The ceiling is not applied when a description is supplied | spec: Crossing rejects board sizes it cannot generate |
| Scenarios: an ungenerable size is refused with a reason, and an existing large description still loads | spec: Crossing rejects board sizes it cannot generate |

## Crossing places whole clue numbers from the list

| Rule | Where it went |
| --- | --- |
| The clue list is interactive: a click picks a clue up, and clicking a run that can take it writes it in as one move | spec: Crossing places whole clue numbers from the list |
| A held clue is previewed in every run that can still take it | spec: A held clue shows every run it could go in |
| With a cell selected, clicking a clue that fits its run places it at once | spec: Crossing places whole clue numbers from the list |
| That holds for a cell selected in either entry mode | untrue: `interpretMove` in `src/games/crossing/index.ts` places at once only under `ui.cursor.visible && !ui.pencilMode`, and holds the clue otherwise |
| Where both runs can take the clue, the more written-in run takes it and only a tie goes to the fill direction | spec: A clue that fits both runs goes to the more written-in one |
| The clue list is colored by the same rule | spec: A clue that fits both runs goes to the more written-in one |
| Selecting a cell indicates which clues can go in either run through it | spec: Selecting a cell shows which clues fit its runs |
| The two directions are told apart by color, the same two on the board and in the list, and the color means the direction | spec: Across and down each have one color, on the board and in the list |
| The two colors are of equal strength, perceptually and as rendered | spec: The two direction colors are of equal strength |
| A clue already written into the grid stays distinguishable from one that cannot go in the selected run | spec: Selecting a cell shows which clues fit its runs |
| Marking the runs and coloring the list are separate preferences, both on by default | spec: The board marking and the list coloring are separate preferences |
| When a clue can go in a run, decided from the player's entries alone and never from the solution or the crossing runs | spec: A clue's availability is decided from the player's entries alone |
| "The aid SHALL be available as a preference, enabled by default" | spec: The board marking and the list coloring are separate preferences |
| The preview shows a clue's digits in place only when one run remains, and a clue on the board indicates its run | spec: A held clue shows every run it could go in |
| Scenario: a clue is placed into the selected cell's run | spec: Crossing places whole clue numbers from the list |
| Scenario: a clue completes the partly-written run | spec: A clue that fits both runs goes to the more written-in one |
| Scenarios: a picked-up clue shows every run, one remaining run is previewed in place, a clue on the board shows where it is | spec: A held clue shows every run it could go in |
| Scenarios: both runs are answered for, and a clue on the board stays distinguishable | spec: Selecting a cell shows which clues fit its runs |
| Scenario: neither direction's color is stronger | spec: The two direction colors are of equal strength |
| Scenario: the board marking and the list coloring are independent | spec: The board marking and the list coloring are separate preferences |
| Scenario: a clue used elsewhere is not offered again | spec: A clue's availability is decided from the player's entries alone |

## One deduction is one hint

| Rule | Where it went |
| --- | --- |
| One deduction forcing several cells is one hint, and one run's notes in several squares are one journey | spec: One deduction is one hint |
| The four kinds of action are each marked in their own shape, and a ruled-out candidate is marked on the candidate | spec: Each kind of hinted action has its own mark |
| Scenarios: a run filled by one deduction is one hint, and one run's notes are one journey | spec: One deduction is one hint |

## A displayed hint gives the board back as soon as the player acts

| Rule | Where it went |
| --- | --- |
| An interaction that changes the display without a move dismisses the hint, unless it leaves the selection on a square the hint is about | spec: A displayed hint gives the board back as soon as the player acts |
| The exception is only for an interaction that "puts" the selection on a hinted square | untrue: `uiUpdateClearsHint` in `src/games/crossing/index.ts` keeps the hint whenever the selection is showing on a hatched or ringed square after the interaction, whether or not the interaction moved it there, so the spec says "leaves" |
| A displayed hint suppresses the wash of the runs through the selected square | spec: A displayed hint owns the board's coloring |
| "Required rather than cosmetic", and what would happen without the dismissal | reason |
| Without the exception, selecting a hinted square would delete the explanation | spec: A displayed hint gives the board back as soon as the player acts |
| A selection on a hinted square is shown by a cue legible against the hint's colors | spec: A displayed hint owns the board's coloring |
| The hint owns the background of the squares it marks | untrue: `drawCell` in `src/games/crossing/render.ts` leaves the background to the selection's wash under a hint, which is a ring on the square's border and a translucent hatch |
| Scenario: clicking away from the hint puts it away | spec: A displayed hint gives the board back as soon as the player acts |
| Scenario: clicking into the hint keeps it, and shows the cursor | spec: A displayed hint owns the board's coloring |

## Crossing refuses to hint a board it cannot honestly advise

| Rule | Where it went |
| --- | --- |
| The hint refuses with a reason on a solved board, a contradicted board and an exhausted deduction, and shows the mistaken cells | spec: Crossing refuses to hint a board it cannot honestly advise |
| A note set that excludes the solution's digit is refused, and never reasoned onward from | spec: Crossing refuses to hint a board it cannot honestly advise |
| That the mistake overlay was "existing" | history |
| Scenario: a note that rules out the right digit is refused | spec: Crossing refuses to hint a board it cannot honestly advise |

## Crossing's clue panel repaints when the held clue changes

| Rule | Where it went |
| --- | --- |
| The held clue is an input to the clue-panel cache, with its scenario | spec: Crossing's clue panel repaints when the held clue changes |

## Crossing never generates a cell no clue can reach

| Rule | Where it went |
| --- | --- |
| Generation rejects a board with an open cell in no run, and why | spec: Crossing never generates a cell no clue can reach |
| "Upstream produces such boards and records the fault as a generator TODO" | history |
| Scenario: every open cell of a generated board lies in a run | spec: Crossing never generates a cell no clue can reach |

## Crossing explains its next deduction from the board

| Rule | Where it went |
| --- | --- |
| An explained hint plans forced moves from the current board and says why each is forced | spec: Crossing explains its next deduction from the board |
| The hint is the solver's deduction replayed a firing at a time, and alters neither the solver, the generator nor the codec | spec: The hint replays the solver's deduction and leaves the solver alone |
| The hint re-derives the named technique and does not narrate the bare elimination | spec: The hint names the technique, not the candidate elimination |
| A number still fits a run only as the board shows it, and every premise holds under that reading | spec: A number still fits a run only as the board shows it |
| A placement no premise yet supports is not asserted, and its rule-outs go ahead of it as note steps narrated by their run | spec: A placement the board does not yet support waits for its notes |
| The narration states the elimination that does the work and cites no entry the board lacks | spec: The narration states the elimination that does the work |
| Every step is narratable, with no unexplained fallback step | spec: Every Crossing hint step is narrated |
| Scenario: a run determined by a single remaining number is offered whole | spec: Crossing explains its next deduction from the board |
| Scenarios: a positional deduction, and two crossing numbers agreeing on one digit | spec: The hint names the technique, not the candidate elimination |
| Scenario: a placement the board does not yet support is preceded by its notes | spec: A placement the board does not yet support waits for its notes |
| Scenario: a placement whose premise lives in the notes says so | spec: The narration states the elimination that does the work |
| Scenario: the evidence includes the numbers the deduction reasons over | spec: The hint's evidence includes the listed numbers it reasons over |

## Crossing draws flat squares on a quiet surface

| Rule | Where it went |
| --- | --- |
| No bevel, the cell surface, the lifted surface under a digit, and a flat wall told from both in both schemes | spec: Crossing draws flat squares on a quiet surface |
| The lines between squares and the frame are the surface grid line | spec: The grid lines are the collection's surface grid line |
| The selection's wash and a run's wash replace the surface of an empty and a filled square alike | spec: A wash replaces a square's surface, empty or filled |
| The keyboard cursor on a wall is corner brackets that stand off it in both schemes | spec: A wash replaces a square's surface, empty or filled |
| The completion flash sweeps a bright and a dim beat across the squares holding digits | spec: The completion flash sweeps the squares holding digits |
| A clue used up, or fitting nowhere in the selection, takes the used-up clue color | spec: The number list sits below the grid and shows how often each clue is placed |
| Scenarios: nothing is beveled, and placed is told by the square under the digit | spec: Crossing draws flat squares on a quiet surface |
