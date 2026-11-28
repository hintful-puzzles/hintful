# latin-solver Specification

## Purpose
The shared Latin-square solver and generator, so that a game built on rows and
columns of distinct symbols supplies only its own deductions rather than a whole
solver. It specifies what the solver deduces and returns, the layout of the
candidate cube a game's deductions read, the support for a symbol, such as an
empty square, that may repeat in a line, and what the generator promises.

## Requirements

### Requirement: The engine provides a shared, seeded Latin-square generator

The engine SHALL provide the Latin-square generator, square and rectangular,
and a game that deals from a Latin square SHALL use it and hold no copy. Given
the same random state it SHALL produce the same square.

#### Scenario: Generated square is Latin and deterministic per seed

- **WHEN** `latinGenerate(o, rng)` is called
- **THEN** the result contains every value `1..o` exactly once in each row and
  column
- **AND** calling it again from an identical random state yields the same square

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

### Requirement: A compiled firing is recorded with a reason built from its binding

On the recording path, each fact of a compiled firing SHALL be recorded with
a reason built from the firing's binding and the marks as they stood before
the firing, so a hint's words read the same reason objects whatever stated
the technique.

#### Scenario: A sign quotes its bound as the step found it

- **WHEN** a sign's firing strikes values from both its ends
- **THEN** every strike's reason quotes the other end's least or greatest
  candidate as it stood before any of the firing's strikes

### Requirement: A compiled technique may range over the fillings of a set

A quantifier or aggregate SHALL bind `fill f of S`, each assignment of a value
to every element of `S`, from its candidates where `from cand` is said, read
`f(x)`. The compiled enumeration SHALL give the result of trying every
assignment, while it passes over one that repeats a value in a `distinct`
the `where` states, or that breaks an `f(x) = t` it states, before it is
whole.

#### Scenario: A line's fillings asked cell by cell

- **WHEN** a technique asks, for each cell `c` of a line of 6 and each value
  `d`, whether some filling of the line from its candidates, every value
  once, with `d` in `c`, shows a count
- **THEN** the line's fillings are enumerated once for every question until
  the marks change, over at most the 720 orders of its values rather than
  6⁶ assignments a question, and each answer is the whole enumeration's

### Requirement: A compiled technique may read a partition the board deals

A description's `space.regions` SHALL name a partition the board deals,
whose parts a compiled technique binds as elements and reads the cells of
with `cells(r)`, each part's cells in reading order, and a clue kind SHALL
be able to sit at a part. The partition SHALL be dealt with the clues, and
a partition and a clue kind SHALL NOT share a name.

#### Scenario: A cage's clue read at the cage

- **WHEN** a technique binds `r in cage` on a board dealt cages and a sum
  clue at some of them
- **THEN** `clue(sum, r)` is the sum dealt at that cage, or `none` at a cage
  that has another kind

### Requirement: A technique may run only below a tier

A described technique SHALL be able to say `until` a tier above its own, and
the ladder SHALL run it only at a cap below that tier, so that a technique a
higher one strikes all of does not set a grade at a cap where the higher
one runs.

#### Scenario: Keen's Easy cage reading above Easy

- **WHEN** Keen's solver is asked at a cap of Normal or above
- **THEN** the Easy cage reading does not run, and a cage deduction is made
  by Normal's

### Requirement: A compiled technique may read a grid's corners

A description's `space.corners` SHALL give the points inside the grid where
four cells meet, as elements in reading order, with `cells(k)` a corner's
four cells in reading order, `corners(c)` a cell's corners, and
`across(k, c)` the cell diagonally across a corner from another, and a clue
kind SHALL be able to sit at a corner.

#### Scenario: A clue read across a corner

- **WHEN** a technique binds `k in corners(c)` on a board dealt a sum clue
  at that corner
- **THEN** `clue(sum, k)` is its value, and `across(k, c)` is the cell that
  shares the corner with `c` and neither its row nor its column

### Requirement: A compiled technique may read a Sudoku's boxes and diagonals

The partition a description lists among its `units` SHALL be the compiled
space's boxes, lines like its rows, and `space.diagonals` SHALL give the two
diagonals as lines; the space's units SHALL be scanned in the description's
order. A partition named as a function SHALL give the part holding a cell.

#### Scenario: A box's hidden single

- **WHEN** a technique binds `u in box` on a Sudoku board and a value has one
  place left in a box
- **THEN** `cells(u)` is the box's cells in reading order, and `box(c)` of
  that place is the box

### Requirement: A ladder may grade on more than one scale

A description SHALL be able to name grading scales besides its tiers, and a
technique's tier SHALL be a tier of one of them, which its compiled ladder
entry names. A technique SHALL be able to name a tier, `from`, below which
cap on its scale the ladder does not run it.

#### Scenario: A killer reading graded on the killer scale

- **WHEN** a Solo killer technique fires
- **THEN** it raises the killer grade, never the sudoku one

### Requirement: The compiler reads a description with every variation applied

The compiled ladder SHALL be built from the description with every variation
applied, and a name a board's variations do not deal SHALL be empty on it.

#### Scenario: A killer technique on a board without cages

- **WHEN** Solo's compiled ladder runs on a board with no killer cages
- **THEN** its killer techniques bind nothing and fire nothing

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

### Requirement: A game's answer check is compiled from its rules

A described game's module SHALL export `isAnswer`, compiled from its domain,
shape, rules and clue meanings, and a described game SHALL decide that a
board is solved, and its solver that a filled grid is an answer, only by it.
A rule a variation adds SHALL hold only where the board has the variation on.

#### Scenario: A value outside the domain is no answer

- **WHEN** a filled grid satisfies every clue but holds a value outside a
  cell's domain
- **THEN** `isAnswer` is false and the game's status is not solved

#### Scenario: A variation's rule holds only where it is on

- **WHEN** an Unruly grid repeats a row and the unique-rows rule is off
- **THEN** `isAnswer` holds of it, and with the rule on it does not

### Requirement: A technique that follows from one kind of rule is placed on the kind

A described game SHALL place a technique that follows from one kind of rule
alone with `kind:`, giving its nouns and words, and SHALL state only what is
its own. The loader SHALL expand a placement into the technique it stands
for, so the compiler, the soundness check and the hint read it as stated. A
placed technique SHALL be checked sound with the kind's planted defect,
unless the game plants a sharper one.

#### Scenario: A placement compiles as the statement it replaces

- **WHEN** Light Up's `shine` is placed on `peer.placed` with its group, peers
  and move
- **THEN** its compiled module is byte-identical to the one its statement
  compiled to

#### Scenario: A game's plant replaces the kind's

- **WHEN** a game's plants file names a placed technique
- **THEN** the soundness check plants the game's defect, not the kind's

### Requirement: A described game's live errors are where its rules break

A described game's module SHALL export `violations`, compiled from the same
domain, shape, rules and clue meanings as `isAnswer`, reporting each
statement a board still being filled already breaks, with the elements or
clue where it does. A violation SHALL be reported only where no completion
of the board satisfies the statement, and on a whole board the violations
SHALL be empty exactly where `isAnswer` holds. A game that declares `rules`
SHALL draw its live error marks from them alone.

#### Scenario: A board on the way to an answer breaks nothing

- **WHEN** some elements of an answer are made undecided
- **THEN** `violations` reports nothing

#### Scenario: Two tents touching are one violation, at both

- **WHEN** a Tents board holds two tents side by side
- **THEN** the shape's exclusion rule is reported at those two squares, and
  the board draws a diamond between them

#### Scenario: A row that can no longer reach its count is marked

- **WHEN** a Tents row has fewer tents and open squares together than its
  number
- **THEN** the count clue of that row is reported, and its number is red

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
