## REMOVED Requirements

### Requirement: Hint: Recording does not change what the Mathrax solver commits

**Reason**: The hint no longer records the solver; it runs the clue
techniques over the notes, so there is no recorder whose presence could
change a verdict.

**Migration**: None. The solver's verdicts are held by the frozen fixture
corpus.

## RENAMED Requirements

- FROM: `### Requirement: Hint: A recorded clue elimination names one clue acting on one cell`
- TO: `### Requirement: Hint: A clue elimination names one clue acting on one cell`

## MODIFIED Requirements

### Requirement: Hint: A clue elimination names one clue acting on one cell

A clue elimination SHALL name exactly one clue acting on exactly one cell.
Mathrax's deduction intersects a cell's candidates across the up to four
clues at its corners at once, so each clue technique SHALL fire one clue's
strikes in one cell, saying the clue, and a firing SHALL be one step.

#### Scenario: A clue step strikes only the one cell it acts on

- **WHEN** a clue's deduction is hinted
- **THEN** the step names one clue and strikes only candidates of the one cell
  it acts on

### Requirement: Hint: A clue step names its clue and what lies across it

A clue step's sentence SHALL name the clue as the board draws it and state the
operation in words. Whether it names a digit across the clue SHALL be decided by
the working board and not by the technique's firing: it SHALL say so only
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

### Requirement: Hint: Mathrax's hint deduces at the tier of the board's params

Where the board's params name a tier below `Unreasonable`, the hint SHALL run
only the techniques of that tier, so a hint uses no deduction its board's tier
does not.

#### Scenario: A board whose params say Easy

- **WHEN** a hint is requested on a board whose params name Easy
- **THEN** no step is a set elimination or a chain, and an arithmetic clue is
  read only where one digit is left across it

