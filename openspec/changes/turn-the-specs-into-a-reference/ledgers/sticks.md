# Ledger: sticks

Base: bb004490

Where every rule of Sticks' spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Sticks game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/sticks/` implements `Game` and is registered | spec: Sticks game implements the Game interface |
| It is uniquely solvable and so declares `findMistakes`, so Check & Save can block a save that contradicts the solution | spec: Sticks game implements the Game interface |
| The parameters are a width, a height, a percentage of black squares and one of five symmetries | spec: Sticks parameters and what each check refuses |
| Width and height are each at least 2 | spec: Sticks parameters and what each check refuses |
| On a full check the percentage is between 5 and 100, and 4-way rotational symmetry needs a square grid | spec: Sticks parameters and what each check refuses |
| A known symmetry is required for a full parameter check | untrue: the symmetry is a `choices` item of `paramConfig` in `src/games/sticks/state.ts`, and `itemError` in `src/engine/params.ts` refuses a choice outside its list whether or not the check is full, so the requirement now says the engine refuses it at every check |
| Validation, unqualified, requires the size bound | untrue: `validateParams` in `src/games/sticks/state.ts` checks only the percentage and the 4-way rotational case, and the bound of 2 is the `bounds` of the dimension items, which `paramsError` in `src/engine/params.ts` enforces, so the requirement now names which check refuses what |
| A game ID encodes the width, height, percentage and symmetry and round-trips | spec: Sticks parameters round-trip through their encoding |
| Every game ID carries all four parameters | untrue: the percentage and the symmetry are `full: true` fields of the codec in `src/games/sticks/state.ts`, so the short encoding is the bare size (`7x7` beside `7x7b20s2`), and the requirement now says the full encoding carries all four |
| A bare `width x height` ID decodes without a symmetry marker | spec: Sticks parameters round-trip through their encoding |
| Scenario: every preset produces a uniquely solvable board | spec: Sticks game implements the Game interface |
| Scenario: a game ID round-trips through the parameters | spec: Sticks parameters round-trip through their encoding |

## Sticks descriptions use the run-length blank encoding

| Rule | Where it went |
| --- | --- |
| The description encodes black cells and clue numbers in row-major order, with letters for blank runs, a marker for a black cell with its optional clue digit, and inline decimal clue numbers | spec: Sticks descriptions use the run-length blank encoding |
| The description accounts for exactly the grid's cell count | spec: Sticks descriptions use the run-length blank encoding |
| Validation rejects too many or too few cells, telling the two apart, and rejects an unknown character | spec: A Sticks description is validated against the grid |
| Scenario: a generated description round-trips | spec: Sticks descriptions use the run-length blank encoding |
| Scenario: a description with the wrong number of cells is rejected | spec: A Sticks description is validated against the grid |

## Sticks ports the deductive solver and solver-gated generator

| Rule | Where it went |
| --- | --- |
| The solver fills blank cells consistently with every clue or reports the board invalid, by contradiction on single cells, to a fixpoint, with no backtracking, and classifies complete, unfinished or invalid | spec: Sticks ports the deductive solver and solver-gated generator |
| Validity is the three puzzle rules: a numbered line's length, at most one number on a line, a numbered black cell's connection count | spec: Sticks validity is checked against the puzzle rules |
| The generator places black squares under the symmetry, fills and clues, keeps a candidate only while the solver completes it, then removes clues in random order while the board stays uniquely solvable | spec: The Sticks generator keeps only what the solver completes |
| Generation from a seed is reproducible | spec: The Sticks generator keeps only what the solver completes |
| Sticks has one tier, so every generated board has exactly one solution and the shipped deduction reaches it with no guessing | spec: Every generated Sticks board has one solution, reached without guessing |
| Uniqueness is established by a witness independent of the solver, since "complete" reports only the line of play followed | spec: Uniqueness is established by a witness independent of the solver |
| The witness is itself shown able to report more than one solution | spec: Uniqueness is established by a witness independent of the solver |
| The two look-behind bounds (`x > 1` and `y > 1`) are kept, though they make the checker weaker than intended | spec: The segment-reachability look-behind bounds are kept |
| The bounds are "ported", and upstream wrote them that way | history |
| Correcting the bounds was measured to change no verdict on any board at any offered preset | figure |
| Scenario: the solver completes a soluble board | spec: Sticks validity is checked against the puzzle rules |
| Scenario: generation is reproducible from a seed | spec: The Sticks generator keeps only what the solver completes |
| Scenario: a generated board has exactly one solution | spec: Every generated Sticks board has one solution, reached without guessing |
| Scenario: the uniqueness witness can report more than one | spec: Uniqueness is established by a witness independent of the solver |

## Sticks input, mistake-checking and completion

| Rule | Where it went |
| --- | --- |
| Played by dragging to draw a line, clicking to place one, or a keyboard cursor with keys to place or clear a line | spec: Sticks is played by drag, click and keyboard cursor |
| A left click places a vertical line and a right click a horizontal one | untrue: the two click verbs in `src/games/sticks/index.ts` cycle (`cycleLine`), left through empty, vertical, horizontal and empty, right the other way, so a click on a cell that holds a line turns or clears it, and the requirement now states the cycle |
| A drag draws the orientation of its dominant axis across the cells it passes | spec: A Sticks drag draws along its dominant axis |
| A drag started on a matching line clears matching lines | untrue: a clearing drag in `interpretMove` (`src/games/sticks/index.ts`) clears every cell it passes that holds a line of either orientation, and only its start has to match, so the requirement now says it clears the lines in the cells it passes |
| Black cells never take a line, and placing a line already in that state is a no-op kept out of the undo history | spec: A block takes no line, and a no-op is not a move |
| `findMistakes` re-solves from the fixed clues and flags each drawn line that contradicts the unique solution, never a missing line | spec: Sticks findMistakes flags only lines that contradict the solution |
| Solved when every blank cell carries a line consistent with all clues, with one flash and no interpolated animation of placement | spec: Sticks completion flashes once and nothing is animated |
| Scenario: dragging draws a line | spec: A Sticks drag draws along its dominant axis |
| Scenario: a contradicting line is flagged as a mistake | spec: Sticks findMistakes flags only lines that contradict the solution |
| Scenario: completing the grid consistently wins | spec: Sticks completion flashes once and nothing is animated |

## Sticks provides an explained hint

| Rule | Where it went |
| --- | --- |
| `hint()` plans from the player's current marks and narrates each forced move as the deduction that forces it | spec: Sticks provides an explained hint |
| The resume, purity, no-op, overlay and narration-quality guards cover it | spec: Sticks provides an explained hint |
| It is enrolled in a shared hint-bearing game list | untrue: there is no list to enroll in, `HINT_GAMES` in `src/engine/testing/hint-games.ts` is every registered game that declares a `hint`, so the requirement now says declaring `hint` is the enrollment |
| Every step names its technique, with no generic catch-all step, since the shipped deduction decides every board the generator produces | spec: Every Sticks hint step names its technique |
| The explanation names which clue the tentative line would break and how, telling the five ways apart | spec: A Sticks hint names the clue a tentative line would break, and how |
| The failing clause is recorded where the contradiction is detected, not re-derived at narration | spec: A Sticks hint names the clue a tentative line would break, and how |
| The conclusion is in the necessity voice, and a clue is named by the number the player sees | spec: A Sticks hint concludes in the necessity voice and names a clue by its number |
| One clue and one rule ruling out several squares is one journey, each later leg continuing the argument with its own square's specifics | spec: One clue ruling out several Sticks squares is one journey; spec engine-hints: One deduction firing is one journey |
| The forced square carries a line of the forced orientation in the hint color, never in the color of a placed line | spec: The Sticks hint draws the forced line in the hint color |
| The evidence is shown, marked so that it does not hide what makes it evidence | spec: The Sticks hint shows its evidence, and the marks count out against the words |
| Where the explanation states a count the marked squares number it, and a named run or span is the one the deduction walked | spec: The Sticks hint shows its evidence, and the marks count out against the words |
| No two roles on the board share a color, and the hint takes the collection's hint color | spec: No two roles on the Sticks board share a color |
| The keyboard cursor takes a color the board has not otherwise spent | spec: No two roles on the Sticks board share a color |
| Upstream drew the cursor in the hint's color | history |
| A hint on a board that contradicts its clues refuses and surfaces the mistakes | spec: A hint on a mistaken Sticks board is refused; spec engine-hints: The midend SHALL refuse a hint on a finished or wrong board before asking the game |
| The refused board is one "contradicting its own clues" | untrue: the refusal is the midend's, on whatever `findMistakes` reports, and `findMistakes` in `src/games/sticks/solver.ts` flags a line that differs from the unique solution whether or not a clue is yet broken, so the requirement now says a board that carries a mistake |
| Recording is confined to the hint path, and the generator's solve calls are unchanged | spec: Sticks hint recording is confined to the hint path |
| Scenario: a forced line is explained by the clue it would break | spec: A Sticks hint names the clue a tentative line would break, and how |
| Scenario: a hint resumes from a self-played position | spec: Sticks provides an explained hint |
| Scenario: one clue ruling out several squares is one hint | spec: One clue ruling out several Sticks squares is one journey |
| Scenario: the forced orientation is visible, not merely described | spec: The Sticks hint draws the forced line in the hint color |
| Scenario: a hint never repeats a move already made | spec: Sticks provides an explained hint |
| Scenario: a mistaken board is refused honestly | spec: A hint on a mistaken Sticks board is refused |
| Scenario: recording does not disturb generation | spec: Sticks hint recording is confined to the hint path |

## Sticks draws its cells on the collection's quiet surface

| Rule | Where it went |
| --- | --- |
| An open cell is the collection's cell surface, with the surface grid line between cells and a frame no heavier than that line | spec: Sticks draws its cells on the collection's quiet surface |
| A number on an open cell is drawn in ink | spec: Sticks draws its cells on the collection's quiet surface |
| A block is a solid fill in the wall color over its whole tile, so adjacent blocks are one mass, with its number in a white that is the same in both schemes | spec: A Sticks block is a solid mass in the wall color |
| The evidence ring on a block carries a line in the number's white, so it is told from the block in both schemes | spec: A Sticks block is a solid mass in the wall color |
| A player's line is drawn at its own weight in the placed-piece color, the theme pair's first member, because it is the content | spec: A player's line is drawn in the placed-piece color |
| The keyboard cursor is the collection's cursor color | spec: No two roles on the Sticks board share a color |
| The game's words call the cell a block, never a black cell | spec: Sticks calls the cell a block |
| Scenario: the grid recedes behind the lines | spec: Sticks draws its cells on the collection's quiet surface |
| Scenario: adjacent blocks are one mass | spec: A Sticks block is a solid mass in the wall color |
