# Cuts: abcd

Requirements: 27 before, 21 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "ABCD game implements the Game interface" (whole requirement) | type | `abcdGame` is typed `Game<…>` and passed to `registerGame` in `src/games/abcd/index.ts`. The rules of the puzzle are in "ABCD is solved when the grid is full and every rule holds". |
| "ABCD's findMistakes compares the board with its one solution": "re-solves the clues to the canonical grid" | how | Where the answer comes from. What is reported, marks included, stays. |
| "ABCD's solver classifies a clue set by deduction alone": "The solver SHALL NOT depend on any leaf library." | port | A statement about how the port was staged; nothing it says constrains the solver now. |
| "ABCD's solver is a certified deduction ladder" (requirement merged) | duplicate | Its three techniques, its census rule and its scenario are now in "ABCD's solver classifies a clue set by deduction alone". |
| "ABCD's solver is a certified deduction ladder": "as a `runDeductionFixpoint` ladder, and SHALL NOT keep a hand-written loop beside it" | collection | `engine-helpers` "A shared deduction-fixpoint scaffold": a game that hand-rolls the loop converges onto the shared runner. |
| "ABCD's solver is a certified deduction ladder": "covering every preset shape, diagonal mode and a thin board", "with a count of the boards solved" | declared | The corpus is the `SHAPES` list in `abcd-ladder.test.ts`, and the count is the shared census harness's. That every technique must fire stays. |
| "Removing clues keeps the puzzle uniquely solvable" (requirement merged) | duplicate | Its sentence and its scenario are now in "ABCD's generator accepts only a uniquely solvable fill"; nothing is lost. |
| "Solve fills the grid with the unique solution" (whole requirement) | collection | `ts-engine` "Solve leaves a solved board", which the midend holds every game to; a solved ABCD board is the one solution. |
| "An ABCD entry that changes nothing is no move": "The decision SHALL be made locally from that cell's own contents, never by comparing serialized states." | how | How the no-op is detected. Which entries are no move, and which stay real, is kept. |
| "ABCD's hint starts on the populate reading" (whole requirement) | collection | `engine-candidate-hints` "A candidate hint plan reads an unmarked cell the way the player chose" (a game on the walk offers `hint-notes`) and "A game states the reading it starts on" (the convention is `populate`); ABCD departs from neither. |
| "ABCD's selection and hint marks keep their places on the surface" (whole requirement) | collection | `engine-notes` "The highlight is part of the cell's background" and `engine-hints` "A hint mark is drawn on the cell's border"; ABCD takes the shared note-taking highlight and has no wall on its borders. |
