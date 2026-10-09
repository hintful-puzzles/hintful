# mathrax Specification

## Purpose
Mathrax, the Latin-square puzzle whose clues sit on grid intersections and
constrain the four digits around each: its rules, its parameters and
descriptions, its controls, its mistake check against the unique solution,
what its generator promises of a board at each tier, what its hint says and
marks, and the look that is its own.

## Requirements

### Requirement: Mathrax is solved when the filled grid breaks no rule

The objective SHALL be to fill the grid with digits from 1 to the grid size so
that no digit repeats in any row or column and every clue is satisfied. The
game SHALL be reported solved when every cell is filled with no row, column or
clue violation.

#### Scenario: Completing the grid correctly wins

- **WHEN** the last cell is filled so that every row, column and clue is satisfied
- **THEN** the game is reported solved

#### Scenario: A full grid that repeats a digit is not the objective

- **WHEN** every cell is filled and one row holds the same digit twice
- **THEN** the game is not reported solved

### Requirement: Mathrax's parameters are a size, a difficulty and a set of clue types

Parameters SHALL be a grid size, a difficulty (Easy, Normal, Tricky or
`Unreasonable`), and a set of enabled clue types (addition, subtraction,
multiplication, division, equality, even/odd). The top tier, which reaches its
answer by guessing and verifying, SHALL be named `Unreasonable` and SHALL keep
the difficulty character `r`. A game ID SHALL encode the size, difficulty and
enabled clue types and round-trip through decode, where an empty encoded
clue-type set means all clue types are enabled.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same size, difficulty and enabled clue types are recovered

#### Scenario: The top tier keeps its difficulty character

- **WHEN** params at the top tier are encoded to a game ID
- **THEN** the difficulty character is `r`, so an ID that names the tier by
  that character still names the same board

### Requirement: Mathrax refuses a size, a difficulty or a clue-type set it cannot play

Mathrax SHALL play sizes 3 to 9, one digit to a cell, and SHALL refuse a size
outside them. `validateParams` SHALL refuse, when validating for generation, a
parameter set with no clue type enabled.

#### Scenario: A size below the bound is refused

- **WHEN** a parameter set of size 2 is checked
- **THEN** it is refused with a message saying the size must be at least 3

### Requirement: Mathrax clues constrain the four digits around each intersection

Clues SHALL sit on the interior grid intersections. Each clue SHALL constrain the four
digits diagonally adjacent to it. An arithmetic clue (add, subtract, multiply, divide)
SHALL require the operation to give the same result on both diagonal pairs and SHALL
display that result; an equality clue SHALL require each diagonal pair to be equal; an
even clue SHALL require all four digits to be even and an odd clue all four to be odd.

#### Scenario: An arithmetic clue is satisfied on both diagonals

- **WHEN** the four digits around an addition clue showing `n` are examined
- **THEN** the two diagonally-opposite pairs each sum to `n`

### Requirement: Mathrax descriptions use the run-length grid-and-clue encoding

A Mathrax description SHALL encode the immutable given digits and then the clues, in
two comma-separated run-length parts. In the grid part each square SHALL be a digit or
part of a run of empty squares; in the clue part each intersection SHALL be an
arithmetic clue with its number, an equality, even or odd marker, or part of a run of
empty intersections. Encoding and decoding SHALL be exact inverses.

#### Scenario: A generated description round-trips

- **WHEN** a description is generated and then decoded into a board
- **THEN** re-encoding that board yields the identical description

### Requirement: Mathrax's reading of a description refuses a malformed one

The reading `newState` builds a board from SHALL refuse a description whose
grid part carries more squares than the grid holds, that contains a digit
larger than the grid size, that uses an unknown character, that names an
unknown clue or a clue number outside what that clue can show on a board of
that size, or whose grid or clue part stops short of covering the grid.

#### Scenario: An out-of-range digit is rejected

- **WHEN** a description containing a given digit larger than the grid size is
  validated
- **THEN** it is rejected

#### Scenario: A clue number the board cannot show is rejected

- **WHEN** a description of a size-5 board carries an addition clue of 11
- **THEN** it is rejected

### Requirement: Mathrax input and keypad

Mathrax SHALL be played with the Solo-style control scheme: a cell is selected
for ink by left-click or cursor, digit keys enter a value or toggle a pencil
mark, and backspace, space or zero clear. Immutable given cells SHALL NOT be
editable. Entering the value already present in a cell SHALL be a no-op. The
on-screen keypad SHALL offer the digits 1 to the grid size and a clear key.

#### Scenario: A digit is entered into a selected cell

- **WHEN** an empty mutable cell is selected and a digit within range is typed
- **THEN** that digit is placed in the cell

#### Scenario: A given takes no entry

- **WHEN** the cursor is on a given cell and a different digit is typed
- **THEN** no move is made

### Requirement: Mathrax offers the sticky pencil and auto-pencil preferences

Mathrax SHALL offer the collection's sticky pencil preference, defaulting on,
and its auto-pencil preference. When auto-pencil is on a placement SHALL remove
its digit from the pencil marks of the rest of its row and column, both on the
board and in the hint's plan.

#### Scenario: A placement clears its digit from its row and column

- **WHEN** the auto-pencil preference is on and a digit is entered in a cell
  whose row and column hold that digit as a pencil mark
- **THEN** those pencil marks are removed with the entry

### Requirement: Mathrax flags mistakes against the unique solution

Mathrax SHALL provide `findMistakes`. It SHALL re-solve from the given digits
and the clues to the unique solution, never from the player's entries or
notes, and flag every placed digit that contradicts it and every empty cell
whose non-empty pencil notes have crossed out its solution value. A cell whose
notes merely carry extra candidates SHALL NOT be flagged. When the board is
not uniquely deducible, no cell SHALL be flagged.

#### Scenario: A wrong placed digit is flagged

- **WHEN** a cell holds a digit that differs from the unique solution and mistakes are
  checked
- **THEN** that cell is reported as a mistake

### Requirement: Mathrax grades its difficulty tiers honestly

A Mathrax board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it. The generator SHALL retry until a candidate needs its tier,
and that loop SHALL be bounded.

#### Scenario: A Tricky board genuinely needs the Tricky tier

- **WHEN** a board generated at Tricky is solved at Normal
- **THEN** the solver does not reach a unique solution
- **AND** solving the same board at Tricky does

### Requirement: Mathrax offers only the difficulties a size can support

Mathrax SHALL refuse to *generate* a size-3 board at Normal or at the top tier,
because a 3×3 grid's four intersections cannot separate those tiers from their
neighbors. `validateParams` SHALL reject those combinations for a full
(generation-capable) parameter set and accept them otherwise, so a saved game
or a game ID carrying its own description still loads. The refusal SHALL name
the tiers from the game's tier list, as the difficulty menu does. Size 3 at
Tricky SHALL be unaffected.

#### Scenario: An unsupported size and tier are refused

- **WHEN** a full parameter set requesting size 3 at Normal or the top tier is
  validated
- **THEN** it is rejected with a message naming the size, and Normal and the
  top tier exactly as the difficulty menu does
- **AND** the same parameters validate successfully when a description is supplied

### Requirement: Mathrax solves and generates over the shared Latin-square framework

Mathrax SHALL solve using the shared Latin-square solver framework, contributing its
own clue deductions: for each cell it SHALL intersect its candidate digits with those
permitted by each adjacent clue given the opposite cell's candidates, across the Easy,
Normal, Tricky and `Unreasonable` difficulty levels.

#### Scenario: The solver solves a generated board

- **WHEN** a generated board is solved
- **THEN** the returned grid is the board's unique Latin-square solution and satisfies
  every clue

### Requirement: A Mathrax board has one solution at every difficulty

Uniqueness SHALL be required at *every* difficulty, including the
guess-and-verify `Unreasonable` tier, because a board with no unique answer
cannot be mistake-checked. The generator SHALL NOT take an ambiguous solver
verdict as grounds to keep removing. Generation from a given seed SHALL be
reproducible.

#### Scenario: Even the guess-and-verify tier yields a unique solution

- **WHEN** a board is generated at the `Unreasonable` difficulty
- **THEN** it has exactly one solution, and it cannot be solved without the
  guess-and-verify step

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

### Requirement: Mathrax's hint plan is the shared candidate-elimination walk

The plan SHALL be built by the shared candidate-elimination walk over Mathrax's
row and column regions; a clue is not a region. Mathrax SHALL start on the
reading that pencils in only the notes a deduction needs, because a clue reads
the cell across it and the rest is singles, so a plan writes notes into few
cells.

#### Scenario: A hint with no Ui pencils in only what it needs

- **WHEN** a hint is requested with no `Ui` on a board with no notes
- **THEN** no step of the plan is `pencilAll`

### Requirement: The recording solve reads placed digits and stops below the guess-and-verify tier

The recording solve SHALL be seeded from the placed digits alone, never from the
player's notes, and SHALL be capped below the guess-and-verify tier, because a
guess is not a teachable note strike.

#### Scenario: A board at the top tier is hinted by deduction alone

- **WHEN** a hint is requested on a board generated at `Unreasonable`
- **THEN** the recording solve runs no higher than Tricky

### Requirement: A recorded clue elimination names one clue acting on one cell

A recorded clue elimination SHALL name exactly one clue acting on exactly one
cell. Mathrax's deduction intersects a cell's candidates across the up to four
clues at its corners at once, so the recording path SHALL attribute each
elimination to a clue whose options exclude it and commit one clue's
eliminations per firing.

#### Scenario: A clue step strikes only the one cell it acts on

- **WHEN** a clue's deduction is hinted
- **THEN** the step names one clue and strikes only candidates of the one cell
  it acts on

### Requirement: Recording does not change what the Mathrax solver commits

The recording path SHALL NOT change what the deduction commits: the difficulty
gate SHALL still wait on the intersection across every incident clue, so the
solver reaches the same verdict and the same grid with and without a recorder,
and the solver-gated generator produces the same boards.

#### Scenario: The recorder does not change the solver's verdict

- **WHEN** the same board is solved at the same difficulty cap with and without a
  deduction recorder
- **THEN** both solves return the same verdict and write back the same grid

### Requirement: A clue step names its clue and what lies across it

A clue step's sentence SHALL name the clue as the board draws it and state the
operation in words. Whether it names a digit across the clue SHALL be decided by
the working board and not by the recorded deduction: it SHALL say so only
when a digit is written there, and otherwise SHALL speak of what is still open
across the clue.

#### Scenario: A clue read against a digit across it names that digit

- **WHEN** a hint is requested on a board where a clue's deduction acts on a cell
  whose diagonal partner across that clue holds a digit
- **THEN** the step names the clue as the board draws it, states what the two
  cells on that diagonal must do, names the partner's digit, and strikes only
  candidates of the one cell it acts on

#### Scenario: A clue read against an open cell speaks of what is still open

- **WHEN** the same deduction acts on a cell whose diagonal partner across the
  clue is still empty
- **THEN** the step says that nothing open across that clue pairs with the values
  it strikes, and names no digit across the clue

### Requirement: A clue step outlines the cells that identify its clue

A clue step SHALL outline as its evidence the cells that identify the clue: the
diagonal pair for an arithmetic or equality clue, all four cells around the
intersection for an even or odd clue. The clue sits on an intersection the
board has no mark for, and each of those sets meets at exactly one
intersection.

#### Scenario: An even or odd clue outlines all four cells around it

- **WHEN** an `E` or `O` clue's deduction is hinted
- **THEN** the step says all four numbers around the clue are even or odd, and
  outlines the block of four cells around that intersection

### Requirement: Mathrax draws its cells on a quiet surface and lifts a given

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, with the collection's surface grid line between cells and a frame
round the grid no heavier than that line. A cell holding a given number SHALL
sit on the collection's lifted surface of a given, with its number in ink, and
a number the player entered SHALL keep the player's entry color on the plain
surface, unless it repeats in its row or column.

#### Scenario: A given is told by the cell under it

- **WHEN** a board with a given number is drawn
- **THEN** the given's cell is the lifted surface and every empty cell is the
  plain cell surface

#### Scenario: The grid is quiet

- **WHEN** the opening frame is drawn
- **THEN** the lines between cells and the frame are the surface's grid line
- **AND** nothing but a number, a clue's ring and a clue's label is drawn in ink

### Requirement: A Mathrax clue is a lifted disc with a ring and a label in ink

A clue SHALL be a disc in the lifted surface's color with a ring and a label in
ink, so a clue reads as the puzzle's own in both schemes. The quarter of a clue
in a cell whose digit contradicts it is excepted: its disc and ring take the
error colors.

#### Scenario: A clue is drawn as the puzzle's own

- **WHEN** a board with a satisfied clue is drawn
- **THEN** the clue's disc is the lifted surface's color and its ring and label
  are ink
