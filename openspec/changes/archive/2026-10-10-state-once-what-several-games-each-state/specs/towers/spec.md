## MODIFIED Requirements

### Requirement: Towers selects a cell by pointer or by keyboard cursor

Under the 3D appearance the pointer's hit-testing SHALL follow the towers, so a
press on a tower protruding from a neighboring cell selects that neighbor.

#### Scenario: A press lands on a neighbor's tower

- **WHEN** the 3D appearance is on and the player presses inside one cell's
  square, on the top face of the tower standing in the cell below it
- **THEN** the cell below is the one selected

### Requirement: Towers checks for mistakes against the unique solution

`findMistakes` SHALL re-solve the board from its clues and givens and return
every marking that contradicts the unique solution: a filled cell whose tower
differs from it (`kind: "cell"`), and a cell whose non-empty candidate set
lacks its solution height (`kind: "note"`). Both kinds SHALL render as the same
red cell overlay. When the board is not uniquely solvable from the givens,
`findMistakes` SHALL return an empty result.

#### Scenario: A wrong tower is flagged

- **WHEN** the player enters a tower height that contradicts the unique solution
- **THEN** `findMistakes` includes that cell with `kind: "cell"`

#### Scenario: A note that excludes the correct height is flagged

- **WHEN** an empty cell carries pencil notes that do not include the cell's
  solution height
- **THEN** `findMistakes` includes that cell with `kind: "note"`

### Requirement: Towers provides an explained, pencil-notes-based deduction hint

The hint SHALL teach Towers' candidate-elimination reasoning by setting and
striking pencil notes. It SHALL be the solver's own narrated deduction script:
the recording solver's ordered operations are expressed against the player's
live notes and grid as a sequence of `HintStep`s.

#### Scenario: The player has edited the notes

- **WHEN** a hint is requested on a mistake-free board whose notes the player
  has edited
- **THEN** each step is expressed against the notes as they stand

### Requirement: A Towers hint step marks the clue it reasons from and the cells it acts on

Each step's highlight SHALL mark the driving clue cell or cells and their line
of sight, so the player can see which clue the hint is about: the clue outlined
in its slot beside the grid, and the line striped through the clue slots at
both its ends. It SHALL ring the target cell or cells, with the equivalent
strikes of one firing sharing the target's mark.

#### Scenario: A clue elimination is marked

- **WHEN** a hint step strikes heights that a clue's line of sight rules out
- **THEN** the driving clue is outlined, its line of sight is striped and each
  cell struck from is ringed

### Requirement: Towers auto-pencils row/column eliminations on placement

The game SHALL provide an auto-pencil preference: when it is on and the player
places a tower height, the game SHALL strike that height from the pencil marks
of every other cell in the same row and column, and when it is off a placement
SHALL leave other cells' pencil marks untouched. The decision SHALL be fixed at
move-creation time, recorded on the move, so that replaying a saved game is
deterministic regardless of the preference's later value.

#### Scenario: Placing a tower clears matching notes in its line

- **WHEN** auto-pencil is on and the player places height `n` in a cell
- **THEN** every other empty cell in that cell's row and column loses candidate `n`
  from its pencil marks
- **AND** cells sharing neither the row nor the column keep candidate `n`

#### Scenario: Auto-pencil off leaves notes untouched

- **WHEN** auto-pencil is off and the player places a height
- **THEN** no other cell's pencil marks change

## REMOVED Requirements

### Requirement: Every Towers hint step is progress the hint never undoes

**Reason**: `engine-candidate-hints`, "A candidate plan's step is never undone by a later
one", holds the first sentence; `engine-hints`, "Only a searching hint is
excused the walk's promise" and "The hint walk SHALL cover every preset a game
offers", hold the recompute, "A displayed hint step never references
already-resolved state" the skip, and "Deduction runs out only where the tier
permits search" its "a board whose tier needs no search".

### Requirement: hintKeepTrack advances the plan when a move matches the step

**Reason**: `engine-candidate-hints`, "A candidate step is completed by the move that
makes it whole", holds every verdict it gives; Towers' `hintKeepTrack` is one
call of `keepCandidateHintTrack` with the default dialect.
