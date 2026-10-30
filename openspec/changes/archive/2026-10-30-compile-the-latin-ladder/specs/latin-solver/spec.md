## MODIFIED Requirements

### Requirement: The solver applies the generic deductions up to the difficulty ceiling

The engine SHALL provide one generic Latin-square solver, `latinSolver`, for
every Latin-square game. It SHALL apply, up to `maxdiff`, the Latin library's
techniques (singles, set and single-number set elimination, the wing),
forcing chains, and guess-and-verify recursion, interleaved with the game's
own deductions at their levels, or a described game's ladder, and validated
by the game's `valid` callback. A forcing chain, a supposition, SHALL run only
at the recursive level.

#### Scenario: Respects the difficulty ceiling

- **WHEN** a board requires a deduction above `maxdiff` and recursion is not
  permitted
- **THEN** `latinSolver` returns `DIFF_UNFINISHED` rather than guessing

#### Scenario: A chain waits for the recursive level

- **WHEN** a board's next deduction is a forcing chain and `maxdiff` is below
  the recursive level
- **THEN** the chain's elimination is not made

## ADDED Requirements

### Requirement: The Latin ladder is compiled from its description

The library's techniques SHALL be stated once in `latin.description.json`, and
a described game's ladder in its description, and SHALL run as the functions
`npm run describe` compiles from them. A technique SHALL scan in the order its
binders are written and fire the first binding whose conclusion changes the
marks; a binding whose conclusion is false SHALL prove the marks
inconsistent. A cube with a repeated symbol SHALL run the engine's own
multiplicity deductions instead.

#### Scenario: A value with no place left is a contradiction

- **WHEN** a row's open cells have all lost a value the row still lacks
- **THEN** the hidden single's conclusion is false for that row and value
- **AND** `latinSolver` returns `DIFF_IMPOSSIBLE`

#### Scenario: The scan order is the statement's

- **WHEN** two naked sets in different rows could each fire
- **THEN** the one in the earlier row fires, because `set` binds its unit
  first and the units are the rows before the columns

### Requirement: A compiled firing is recorded with a reason built from its binding

On the recording path, each fact of a compiled firing SHALL be recorded with
a reason built from the firing's binding and the marks as they stood before
the firing, so a hint's words read the same reason objects whatever stated
the technique.

#### Scenario: A sign quotes its bound as the step found it

- **WHEN** a sign's firing strikes values from both its ends
- **THEN** every strike's reason quotes the other end's least or greatest
  candidate as it stood before any of the firing's strikes
