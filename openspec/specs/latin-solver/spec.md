# latin-solver Specification

## Purpose
The shared Latin-square solver and generator, so that a game built on rows and
columns of distinct symbols supplies only its own deductions rather than a whole
solver. It specifies what the solver deduces and returns, the layout of the
candidate cube a game's deductions read, the support for a symbol, such as an
empty square, that may repeat in a line, and what the generator promises.

## Requirements

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

### Requirement: The solver writes the grid back and returns a difficulty or a sentinel

`latinSolver` SHALL write the solved grid back in place and return the
difficulty level at which it solved, or one of the sentinels `DIFF_IMPOSSIBLE`,
`DIFF_AMBIGUOUS` and `DIFF_UNFINISHED`.

#### Scenario: Reports ambiguity

- **WHEN** `latinSolver` runs with recursion on a board with more than one
  completion
- **THEN** it returns `DIFF_AMBIGUOUS`

### Requirement: The candidate cube is indexed by cell and then by symbol

The candidate cube SHALL be indexed `(x·o + y)·symbols + (n−1)`, where
`symbols` is the number of distinct values: `o` for a Latin square, and
`o − times + 1` when a symbol is declared to repeat `times` per line (see "The
Latin cube supports a symbol that may repeat in a line").

#### Scenario: A repeated symbol narrows the cube

- **WHEN** a solver of order `o` is built with a symbol declared to repeat
  `times` per line
- **THEN** each cell has `o − times + 1` candidates in the cube, and the
  candidates of one cell are adjacent in it

### Requirement: The Latin cube supports a symbol that may repeat in a line

The shared Latin-square solver SHALL support puzzles in which one declared
symbol may appear a stated number of times in each row and column, rather than
exactly once, and SHALL express it in the cube, so that deduction techniques can
be written about it. The support SHALL be opt-in, and SHALL be inert when not
requested: a puzzle that declares no repeatable symbol SHALL produce exactly the
deductions, in exactly the order, that it produces without the support.

#### Scenario: A pseudo-Latin puzzle is expressed directly

- **WHEN** a puzzle declares a symbol with a per-line multiplicity greater than
  one
- **THEN** the solver reasons about that symbol's placements in the cube, without
  the caller translating it into and out of a single-occurrence encoding

#### Scenario: Existing consumers are unaffected

- **WHEN** a puzzle declaring no repeatable symbol is solved
- **THEN** the solver's deductions and their order are unchanged

### Requirement: The engine provides a shared, seeded Latin-square generator

The engine SHALL provide the Latin-square generator, square and rectangular,
and a game that deals from a Latin square SHALL use it and hold no copy. Given
the same random state it SHALL produce the same square.

#### Scenario: Generated square is Latin and deterministic per seed

- **WHEN** `latinGenerate(o, rng)` is called
- **THEN** the result contains every value `1..o` exactly once in each row and
  column
- **AND** calling it again from an identical random state yields the same square

### Requirement: The solver weighs a wing at the single-number set level

`latinSolver` SHALL apply the wing, every value one cell can take each read
off a cell in its row or column down to that value and one other, at the
single-number set elimination's level, after it. It SHALL strike one cell a
firing, and SHALL weigh no cell that could still hold a repeated symbol.

#### Scenario: A wing strikes at the top deductive level

- **WHEN** a cell's candidates are 1 and 2, a cell in its row is down to 1
  and 3, a cell in its column is down to 2 and 3, a fourth cell shares a line
  with both of those, and `maxdiff` reaches the single-number set level
- **THEN** 3 is struck from the fourth cell

### Requirement: The Latin ladder is compiled from its description

The library's techniques SHALL be stated once in `latin.description.yaml`, and
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
