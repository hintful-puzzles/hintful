# latin-solver Specification

## Purpose
The shared Latin-square solver and generator, so that a game built on rows and
columns of distinct symbols supplies only its own deductions rather than a whole
solver. It specifies the generic deductions, the generator, and the support for
a symbol, such as an empty square, that may repeat in a line.

## Requirements

### Requirement: Shared generic Latin-square solver

The engine SHALL provide a generic Latin-square solver in
`src/engine/latin.ts`, for reuse by every Latin-square game. It SHALL expose a
`latinSolver(grid, o, cfg)` entry point that takes an `o × o` grid (0 = blank)
seeded with a game's fixed cells, and a configuration carrying `maxdiff`,
`diffSimple`, `diffSet0`, `diffSet1`, `diffForcing`, `diffRecursive`,
`usersolvers`, `valid` and `ctx`.

#### Scenario: Solves a uniquely-determined board

- **WHEN** `latinSolver` runs on a board with a unique completion, with
  recursion permitted
- **THEN** it returns a non-sentinel difficulty
- **AND** the grid is written back as a valid Latin square

### Requirement: The solver applies the generic deductions up to the difficulty ceiling

`latinSolver` SHALL apply, up to `maxdiff`, positional and numeric elimination,
row and column set elimination, single-number set elimination, forcing chains,
and guess-and-verify recursion. These SHALL be interleaved with the game's own
`usersolvers` at their declared difficulty levels and validated by the game's
`valid` callback.

#### Scenario: Respects the difficulty ceiling

- **WHEN** a board requires a deduction above `maxdiff` and recursion is not
  permitted
- **THEN** `latinSolver` returns `DIFF_UNFINISHED` rather than guessing

### Requirement: The solver writes the grid back and returns a difficulty or a sentinel

`latinSolver` SHALL write the solved grid back in place and return the
difficulty level at which it solved, or one of the numeric sentinels
`DIFF_IMPOSSIBLE` (10), `DIFF_AMBIGUOUS` (11) and `DIFF_UNFINISHED` (12).

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
exactly once, and SHALL express it in the cube, so that deduction techniques can be written about it. The support SHALL be opt-in, and SHALL be inert when
not requested: a puzzle that declares no repeatable symbol SHALL produce exactly
the deductions, in exactly the order, that it produces without the support.

#### Scenario: A pseudo-Latin puzzle is expressed directly

- **WHEN** a puzzle declares a symbol with a per-line multiplicity greater than
  one
- **THEN** the solver reasons about that symbol's placements in the cube, without
  the caller translating it into and out of a single-occurrence encoding

#### Scenario: Existing consumers are unaffected

- **WHEN** a puzzle declaring no repeatable symbol is solved
- **THEN** the solver's deductions and their order are unchanged

### Requirement: The engine provides a shared, seeded Latin-square generator

The engine SHALL provide, in `src/engine/latin.ts`, the Latin-square
generator: `matching` (randomized bipartite matching), `latinGenerate(o, rng)`,
and `latinGenerateRect(w, h, rng)`. Given the same random state they SHALL
produce the same square, so a seeded game ID keeps its board. Singles SHALL
consume the shared implementation.

#### Scenario: Generated square is Latin and deterministic per seed

- **WHEN** `latinGenerate(o, rng)` is called
- **THEN** the result contains every value `1..o` exactly once in each row and
  column
- **AND** calling it again from an identical random state yields the same square
