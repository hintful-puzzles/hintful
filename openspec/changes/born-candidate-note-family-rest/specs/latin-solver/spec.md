## ADDED Requirements

### Requirement: The Latin library's wing strikes one cell a firing

The Latin library's wing SHALL weigh every value one cell can take, each read
off a cell in its row or column down to that value and one other, and SHALL
strike one cell a firing. It SHALL weigh no cell that could still hold a
repeated symbol. A description places it at a tier of its own choosing.

#### Scenario: A wing strikes what no set can

- **WHEN** a cell's candidates are 1 and 2, a cell in its row is down to 1
  and 3, a cell in its column is down to 2 and 3, and a fourth cell shares a
  line with both of those
- **THEN** the wing strikes 3 from the fourth cell, which no set elimination
  strikes

## MODIFIED Requirements

### Requirement: The Latin ladder is compiled from its description

The library's techniques SHALL be stated once in `latin.description.yaml`, and
a described game's ladder in its description, and SHALL run as the functions
`npm run describe` compiles from them. A technique SHALL scan in the order its
binders are written and fire the first binding whose conclusion changes the
marks; a binding whose conclusion is false SHALL prove the marks
inconsistent. Marks with a repeated symbol SHALL run the same techniques,
each reading the symbol's multiplicity.

#### Scenario: A value with no place left is a contradiction

- **WHEN** a row's open cells have all lost a value the row still lacks
- **THEN** the hidden single's conclusion is false for that row and value
- **AND** the hidden single reports the marks inconsistent

#### Scenario: The scan order is the statement's

- **WHEN** two naked sets in different rows could each fire
- **THEN** the one in the earlier row fires, because `set` binds its unit
  first and the units are the rows before the columns

## REMOVED Requirements

### Requirement: The solver applies the generic deductions up to the difficulty ceiling

**Reason**: Every Latin game is born from its description, and the fill
engine solves it: its ladder capped at the board's tier, and at Unreasonable
the engine's search over that ladder. `latinSolver`, its forcing chain and
its guess-and-verify recursion have no caller left and are retired.
**Migration**: A Latin game places the library's techniques in its
description (`use: latin.…`); the fill board solves it (`described-fill-game`).

### Requirement: The solver writes the grid back and returns a difficulty or a sentinel

**Reason**: `latinSolver` and its sentinels (`DIFF_IMPOSSIBLE`,
`DIFF_AMBIGUOUS`, `DIFF_UNFINISHED`) are retired with their last caller.
**Migration**: None; a born game's verdict is the fill board's.

### Requirement: The Latin cube supports a symbol that may repeat in a line

**Reason**: The support lives in the engine's marks, which every described
game runs on, and "A technique reads a value's multiplicity" states it of the
library, with its scenario for a board that declares no repeat.
**Migration**: A game declares the repeated value in its description
(`answer.value.repeat`).

### Requirement: The solver weighs a wing at the single-number set level

**Reason**: The wing's tier is each description's to place, not the
solver's; what the wing strikes is "The Latin library's wing strikes one cell
a firing".
**Migration**: None; each Latin description already places `latin.wing`.

### Requirement: The cube a generator reads is written from the marks

**Reason**: No generator reads upstream's candidate cube: Unequal and Salad
are born, and deal through their descriptions. The cube and `latinSolver`
that wrote it are retired.
**Migration**: None.
