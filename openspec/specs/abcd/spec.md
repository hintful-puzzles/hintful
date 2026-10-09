# abcd Specification

## Purpose
ABCD, the puzzle of writing a letter in every cell so that no two identical
letters touch horizontally or vertically and each edge number counts one letter
in its row or column, with a solver-gated generator, a refusal of the board
sizes that generator cannot produce, and an explained hint.

## Requirements

### Requirement: ABCD's parameters

Parameters SHALL be a width, a height, a letter count, a "disallow diagonal
adjacency" flag, and a "remove clues" flag. Validation SHALL refuse a width or
a height under 2, and a letter count over 9, under 3, or under 5 when diagonal
adjacency is disallowed. A game ID SHALL encode the width, height,
letter count and the diagonal flag and round-trip through decode. The "remove
clues" flag is a generation-time setting and SHALL appear only in the full
parameter encoding.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, letter count and diagonal flag are recovered

#### Scenario: Invalid letter counts are rejected

- **WHEN** parameters request fewer than 3 letters in normal mode, fewer than 5
  letters with diagonal adjacency disallowed, or more than 9 letters
- **THEN** validation rejects them with a message naming the offending bound

### Requirement: ABCD's findMistakes compares the board with its one solution

Because ABCD has a unique solution, it SHALL declare a `findMistakes` hook that
reports every entered letter that differs from that solution, and every empty
cell whose pencil marks are not empty yet leave out its answer. Marks that
merely include extra letters SHALL NOT be reported.

#### Scenario: An entry that contradicts the solution is flagged

- **WHEN** the mistake check runs and a cell holds a letter that differs from the
  puzzle's unique solution
- **THEN** that cell is reported as a mistake

#### Scenario: A mark that has crossed out the answer is a mistake

- **WHEN** the mistake check runs on an empty cell whose pencil marks leave out the
  letter the unique solution puts there
- **THEN** that cell is reported as a mistake, and the hint refuses until it is fixed

### Requirement: ABCD descriptions use the edge-clue encoding

An ABCD description SHALL encode the puzzle as a comma-terminated list of
`(width + height) × letters` clue numbers: the row clues followed by the column
clues, each row's or column's clues in letter order, with a bare `-` standing
for a hidden clue. Encoding and decoding SHALL be exact inverses.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a state
- **THEN** re-encoding that state's clue numbers yields the identical description

### Requirement: An ABCD description is validated against its clue count and its lines

Validation SHALL reject a description whose clue count is not exactly
`(width + height) × letters`, distinguishing too few clues from too many. It
SHALL reject one whose row clue exceeds `1 + width / 2` or whose column clue
exceeds `1 + height / 2`, the half rounded down, and one that contains an
unrecognized character.

#### Scenario: A description with the wrong number of clues is rejected

- **WHEN** a description carrying more or fewer clue entries than
  `(width + height) × letters` is validated
- **THEN** it is rejected with a message distinguishing too few from too many

### Requirement: ABCD's solver classifies a clue set by deduction alone

ABCD's solver SHALL report a clue set uniquely solvable, ambiguous or
contradictory. It SHALL apply, to a fixpoint and without backtracking, three
techniques: satisfied clue, striking a letter from a line whose count is met;
single possibility, placing a cell's one remaining candidate; and runs,
forcing letters when the most a line can still take equals the count it needs.
A firing census SHALL walk boards generated at every preset on the menu and
assert that every technique fires.

#### Scenario: The solver classifies a puzzle

- **WHEN** the solver is run on a clue set
- **THEN** it reports uniquely solvable, ambiguous, or contradictory, and for a
  uniquely solvable set it yields the solution grid

#### Scenario: A technique the corpus never reaches fails the census

- **WHEN** a technique is removed from the ladder
- **THEN** the census reports it as never fired, even though the generator, gated
  on the same solver, deals only boards the weakened ladder finishes

#### Scenario: A preset is added to the menu

- **WHEN** a preset is added to ABCD's preset list
- **THEN** the census walks boards generated at it with no edit to the census

### Requirement: ABCD's Solve does not claim a second answer it has not found

"Ambiguous" is the ladder stopping short, which proves no second answer. The
game's `solve` SHALL refuse such a clue set with `PUZZLE_NOT_REASONABLE` and
SHALL NOT say the puzzle has more than one solution, so a game ID naming one
is refused as needing trial and error.

#### Scenario: A game ID the ladder cannot finish

- **WHEN** a hand-built 10×10 ABCD game ID whose clues the ladder stops short
  on is opened
- **THEN** it is refused with `DESC_NOT_DEDUCIBLE`, not with `DESC_NOT_UNIQUE`

### Requirement: ABCD's generator accepts only a uniquely solvable fill

The generator SHALL fill the grid with random letters that respect the
no-touch rule, count the resulting clues, and accept the puzzle only when the
solver reports it uniquely solvable, retrying otherwise. When "remove clues" is
set, it SHALL then hide clues in a randomized order, keeping each removal only
while the puzzle stays uniquely solvable. Generation from a given seed SHALL be
reproducible.

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical description

#### Scenario: A board with clues removed still has one solution

- **WHEN** a board is generated with "remove clues" set
- **THEN** the solver reports its description, hidden clues included, uniquely
  solvable

### Requirement: ABCD enters a letter into the selected cell

ABCD SHALL be played by selecting a cell, by mouse click or arrow-key cursor,
and entering one of the letters, with a pencil-mark mode for candidate marks.
Entering a letter SHALL accept the letter keys and the bare digit keys `1` to
`9` up to the letter count. Clearing SHALL accept Backspace, Space, and `0`.

#### Scenario: Entering a letter fills the selected cell

- **WHEN** a cell is selected and a letter key (or its digit) within the letter
  count is pressed
- **THEN** that letter is placed in the cell

### Requirement: ABCD's fill-all-marks command fills only cells with no marks

While some empty cell carries no marks, the fill-all-marks command SHALL give
every such cell every letter and SHALL NOT reset a cell the player has
narrowed. Otherwise it SHALL strike, as one `pencilStrike`, each mark whose
letter a touching cell already holds (diagonally too when that is disallowed)
or whose row or column already holds its clue's count, never a cell's last
mark, and SHALL produce no move when there is nothing to strike.

#### Scenario: A narrowed cell is left as it is

- **WHEN** one empty cell has been narrowed to two marks, another carries none,
  and the command is used
- **THEN** the cell with no marks takes every letter and the narrowed cell
  keeps its two

### Requirement: An ABCD entry that changes nothing is no move

An entry that would leave the state exactly as it is SHALL produce no move, and
so no history entry: re-entering the letter a cell already holds, or clearing a
cell that is already empty and carries no marks. Clearing an empty cell that
does carry marks SHALL remain a real move, because it wipes them.

#### Scenario: Re-entering the letter already present costs no undo step

- **WHEN** a cell already holds a letter and that same letter is entered again
- **THEN** no move is produced and the undo history is unchanged

#### Scenario: Clearing a cell that holds only marks is a real move

- **WHEN** an empty cell carrying pencil marks is cleared
- **THEN** a move is produced, and undoing it restores the marks

### Requirement: What ABCD draws

Rendering SHALL draw the letter grid with edge clues and corner letters, SHALL
show pencil marks in empty cells and the cursor highlight, and SHALL flash on
completion. It SHALL color red a clue its line exceeds or can no longer reach,
and a letter with an identical letter adjacent: orthogonally, and diagonally
when that is disallowed. There SHALL be no move animation.

#### Scenario: A clue its line can still reach is not red

- **WHEN** a row holds fewer of a letter than its clue asks and has empty cells
  enough to make up the difference
- **THEN** the clue is drawn in the ordinary clue color
- **AND** it turns red once the row's empty cells are too few

### Requirement: ABCD is solved when the grid is full and every rule holds

The game SHALL be reported solved when every cell is filled, every clue is
satisfied, and no two identical letters are adjacent under the active adjacency
rule.

#### Scenario: Completing the grid correctly wins

- **WHEN** the final cell is filled so that every clue is met and no identical
  letters are adjacent
- **THEN** the game is reported solved and flashes

### Requirement: ABCD refuses board sizes it cannot generate

Parameter validation SHALL reject, when validating for generation, any
combination of grid size and letter count whose measured generation-success
rate is too low to produce a board in an acceptable time, giving a reason,
rather than retrying until an attempt budget is exhausted. Validation SHALL NOT
apply the bound when a description is already in hand, so that a previously
shared game ID remains loadable.

#### Scenario: An un-generable configuration is refused immediately

- **WHEN** a configuration below the measured rate is entered in the Custom
  dialog
- **THEN** it is refused with a reason, without the generator being run

#### Scenario: An existing game ID outside the bound still loads

- **WHEN** a game ID whose parameters fall outside the bound is opened, with its
  description present
- **THEN** the board loads and is playable

### Requirement: The bound is measured across size, shape and letter count

The bound on generable boards SHALL be derived from measurement across grid
size, grid shape and letter count, since none of them alone determines the
rate: two boards of equal area, or of equal clue-to-cell ratio, can differ
widely in acceptance rate. Diagonal mode SHALL be bounded separately, being
markedly more generable rather than less.

#### Scenario: A board of the same area as a refused one is still offered

- **WHEN** a long thin board is entered whose area equals that of a refused
  squarer board
- **THEN** it is accepted, because its generation rate is measured to be high

#### Scenario: Diagonal mode is bounded on its own measurements

- **WHEN** a board is entered that is un-generable with diagonal touching
  allowed but generable without it
- **THEN** it is refused in the first mode and accepted in the second

### Requirement: The bound admits every preset and is asserted in both directions

Every shipped preset SHALL pass validation for generation. The bound on
generable boards SHALL be asserted in both directions: that it admits
configurations measured generable as well as refusing those measured
un-generable.

#### Scenario: A tightened bound cannot bar a preset

- **WHEN** each shipped preset is validated for generation
- **THEN** none is refused

### Requirement: The generator's retry cap is sized to what the bound admits

The generator's retry cap SHALL be sized to what the bound on generable boards
admits, so that exhausting it continues to signal a defect rather than an
ordinary player request.

#### Scenario: Exhausting the cap on an admitted board is an error

- **WHEN** the generator spends its whole retry cap on a configuration that
  validation admits for generation
- **THEN** it throws `RetryLimitExceeded` and deals no fallback board, and the player is shown the engine's sentence that no board was found

### Requirement: ABCD offers an explained hint

ABCD SHALL declare a `hint` built on the shared candidate-elimination plan
walk, reasoning from the player's pencil marks and placed letters, with the
no-touch rule as the walk's reach: a letter rules itself out of its orthogonal
neighbors, and of its diagonal ones when diagonal touching is disallowed.
Besides the walk's own steps, its rungs SHALL be one line's firing of the
solver's satisfied-clue and runs techniques.

#### Scenario: The hint finishes every generated board

- **WHEN** a hint plan is built from a freshly generated board of any preset, under
  either reading, and its steps are played
- **THEN** the board is solved, and the grid is the solver's solution

### Requirement: The satisfied-clue rung strikes a letter from a line that has its count

For a row or column that already holds its count of a letter, or whose count is
0, the hint's satisfied-clue rung SHALL strike that letter from the line's
other cells' marks, naming the line, hatching it and drawing the count it reads
in the hint color.

#### Scenario: A row that holds its one A

- **WHEN** the hint shows a satisfied-clue step for a row whose clue for A is 1
  and that holds an A
- **THEN** it strikes A from the marks of the row's other cells that still
  show it, names and hatches the row, and draws the clue's 1 in the hint color

### Requirement: The runs rung places the letters a line's open cells force

For a row or column whose cells that can still take a letter fit, with no two
touching, exactly as many as the line still needs, the hint's runs rung SHALL
place every letter that forces, as one journey, outlining those cells where
there are several, hatching the line and drawing its count in the hint color. The arithmetic SHALL be the
solver's own, so the hint and the solver cannot disagree about a line.

#### Scenario: A runs step names the line and the count

- **WHEN** the hint shows the first step of a runs journey on a line with more
  open cells than letters to place
- **THEN** its sentence says how many of the letter the line needs and that the
  outlined cells fit only that many apart, the line is hatched through its clue slots,
  its count for that letter is drawn in the hint color, and the cell to fill is ringed

#### Scenario: The runs claim holds for every line shape

- **WHEN** the runs arithmetic forces positions in a line
- **THEN** every way of placing that many letters in the line's open cells with no
  two touching puts a letter on each forced position

### Requirement: The runs rung is the hint's last resort

The hint's runs rung SHALL be offered only when no other rung has a firing, as
the solver tries the runs technique only when the cheaper techniques are spent.

#### Scenario: A satisfied clue is spoken before a run

- **WHEN** a board has both a line whose count is met with marks left to strike
  and a line the runs arithmetic forces
- **THEN** the hint's next step is not a runs step

### Requirement: ABCD's menu offers a board under each of its rules

ABCD's presets SHALL include a board with diagonal touching disallowed, so a
player reaches that rule from the menu and every cross-game sweep deals one.
The rule needs five letters, which no other preset has, so writing the one
field onto another preset is refused and nothing but a preset reaches it.

#### Scenario: The rule against diagonal touching is on the menu

- **WHEN** ABCD's preset menu is read
- **THEN** it holds a 6x6 board with five letters and diagonal touching
  disallowed, between the 6x6 and 7x7 boards, titled with the words the label
  gives that rule

#### Scenario: The board deals at once and the hint finishes it

- **WHEN** that preset is dealt
- **THEN** the deal is immediate, and following the hint solves the board

### Requirement: ABCD draws its letters on a quiet surface

`redraw` SHALL draw every cell of the letter grid on the collection's cell
surface, with the collection's surface grid line between cells and as the frame
round the grid. No cell SHALL take the lifted surface of a given, since the
grid holds no given letters, and the clues SHALL stay on the board, outside the
surface. The corner marks that show diagonal touching is disallowed are a rule
and SHALL keep their own color.

#### Scenario: The grid recedes

- **WHEN** a board is drawn
- **THEN** every cell of the letter grid is the cell surface
- **AND** every cell's border is the surface grid line
