## ADDED Requirements

### Requirement: A technique reads a value's multiplicity

A description SHALL be able to declare one value of its domain that appears
more than once in each unit, and how many times (`answer.value.repeat`), and
a formula SHALL read a value's multiplicity as `times(d)`, 1 for every value
not declared. The library's techniques SHALL read it, and SHALL be checked
sound on a Latin square and on one whose last value appears twice a line.

#### Scenario: A Latin square reads as it did

- **WHEN** a game that declares no repeated value runs a library technique
- **THEN** it makes the firings, in the order, that it made before the
  technique read a multiplicity

#### Scenario: Two empty squares left in a line of two places

- **WHEN** a Salad row of seven squares and four letters has placed one of its
  three empty squares, and only two more of its squares can be empty
- **THEN** the library's hidden single places the empty square in both

### Requirement: A compiled technique may read a size the grid does not give

A description's size that the grid is not measured in SHALL be dealt by the
game in its compiled `Dealt`, where a technique reads it, and the soundness
checker SHALL check each technique at every value of such a size that a
board of each checked order can hold.

#### Scenario: Salad's count of symbols

- **WHEN** Salad's border technique reads `nums`
- **THEN** its compiled function reads the board's count of symbols from what
  the game deals

## MODIFIED Requirements

### Requirement: The solver applies the generic deductions up to the difficulty ceiling

The engine SHALL provide one generic Latin-square solver, `latinSolver`, for
every Latin-square game. It SHALL apply, up to `maxdiff`, the game's described
ladder, which places the Latin library's techniques (singles, set and
single-number set elimination, the wing) among the game's own, then forcing
chains and guess-and-verify recursion, validated by the game's `valid`
callback. A forcing chain, a supposition, SHALL run only at the recursive
level.

#### Scenario: Respects the difficulty ceiling

- **WHEN** a board requires a deduction above `maxdiff` and recursion is not
  permitted
- **THEN** `latinSolver` returns `DIFF_UNFINISHED` rather than guessing

#### Scenario: A chain waits for the recursive level

- **WHEN** a board's next deduction is a forcing chain and `maxdiff` is below
  the recursive level
- **THEN** the chain's elimination is not made

### Requirement: The Latin ladder is compiled from its description

The library's techniques SHALL be stated once in `latin.description.yaml`, and
a described game's ladder in its description, and SHALL run as the functions
`npm run describe` compiles from them. A technique SHALL scan in the order its
binders are written and fire the first binding whose conclusion changes the
marks; a binding whose conclusion is false SHALL prove the marks
inconsistent. A cube with a repeated symbol SHALL run the same techniques,
each reading the symbol's multiplicity.

#### Scenario: A value with no place left is a contradiction

- **WHEN** a row's open cells have all lost a value the row still lacks
- **THEN** the hidden single's conclusion is false for that row and value
- **AND** `latinSolver` returns `DIFF_IMPOSSIBLE`

#### Scenario: The scan order is the statement's

- **WHEN** two naked sets in different rows could each fire
- **THEN** the one in the earlier row fires, because `set` binds its unit
  first and the units are the rows before the columns
