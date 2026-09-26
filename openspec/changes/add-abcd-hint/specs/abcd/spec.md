## MODIFIED Requirements

### Requirement: ABCD game implements the Game interface

The engine SHALL provide `src/games/abcd/` implementing the `Game`
interface for ABCD, registered so the puzzle is served by the TypeScript engine.

Parameters SHALL be a width, a height, a letter count, a "disallow diagonal
adjacency" flag, and a "remove clues" flag. Validation SHALL require width and
height at least 2, a letter count of at most 9 and at least 3 (at least 5 when
diagonal adjacency is disallowed), matching upstream. A game ID SHALL encode the
width, height, letter count and the diagonal flag and round-trip through decode;
the "remove clues" flag is a generation-time setting and SHALL appear only in the
full parameter encoding.

Because ABCD has a unique solution, it SHALL declare a `findMistakes` hook that
re-solves the clues to the canonical grid and reports every entered letter that
differs from it, and every empty cell whose pencil marks are not empty yet leave
out its answer. Marks that merely include extra letters SHALL NOT be reported.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, letter count and diagonal flag are recovered

#### Scenario: Invalid letter counts are rejected

- **WHEN** parameters request fewer than 3 letters in normal mode, fewer than 5
  letters with diagonal adjacency disallowed, or more than 9 letters
- **THEN** validation rejects them with a message naming the offending bound

#### Scenario: A mark that has crossed out the answer is a mistake

- **WHEN** the mistake check runs on an empty cell whose pencil marks leave out the
  letter the unique solution puts there
- **THEN** that cell is reported as a mistake, and the hint refuses until it is fixed

## ADDED Requirements

### Requirement: ABCD's solver is a certified deduction ladder

ABCD's solver SHALL run its three techniques (satisfied clue, single possibility,
runs) as a `runDeductionFixpoint` ladder, and SHALL keep upstream's hand-written
loop as an oracle only a test calls. A ladder-equivalence test SHALL prove, over
generated boards covering every preset shape, diagonal mode and a thin board, that
the ladder leaves the same verdict and the same working board (grid, candidate cube
and outstanding counts) as the oracle, and SHALL carry a firing census asserting
that every technique fires on the corpus, with a count of the boards compared.

#### Scenario: A technique the corpus never reaches fails the census

- **WHEN** a technique is removed from the ladder
- **THEN** the census reports it as never fired, even where every board comparison
  still agrees because the generator, gated on the same solver, dealt only boards
  the weakened ladder finishes

### Requirement: ABCD offers an explained hint

ABCD SHALL declare a `hint` built on the shared candidate-elimination plan walk,
reasoning from the player's pencil marks and placed letters, with the no-touch rule
as the walk's reach (a letter rules itself out of its orthogonal neighbors, and of
its diagonal ones when diagonal touching is disallowed). Besides the walk's own
steps, its rungs SHALL be one line's firing of the solver's techniques:

- **Satisfied clue**: a row or column that already holds its count of a letter, or
  whose count is 0, strikes that letter from its other cells' marks, naming the line,
  hatching it and drawing the count it reads in the hint color.
- **Runs**: a row or column whose cells that can still take a letter fit, with no two
  touching, exactly as many as the line still needs places every letter that forces,
  as one journey, outlining those cells, hatching the line and drawing its count in
  the hint color. The arithmetic SHALL be the solver's own, so the hint and the
  solver cannot disagree about a line.

The runs technique SHALL be offered only when no other rung has a firing, as the
solver tries it only when the cheaper techniques are spent. ABCD SHALL offer the
`hint-notes` preference and start on the collection's `populate` reading.

#### Scenario: The hint finishes every generated board

- **WHEN** a hint plan is built from a freshly generated board of any preset, under
  either reading, and its steps are played
- **THEN** the board is solved, and the grid is the solver's solution

#### Scenario: A runs step names the line and the count

- **WHEN** the hint shows a runs step
- **THEN** its sentence says how many of the letter the line needs and that the
  outlined cells fit only that many apart, the line is hatched through its clue slots,
  its count for that letter is drawn in the hint color, and the cell to fill is ringed

#### Scenario: The runs claim holds for every line shape

- **WHEN** the runs arithmetic forces positions in a line
- **THEN** every way of placing that many letters in the line's open cells with no
  two touching puts a letter on each forced position
