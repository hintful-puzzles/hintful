## ADDED Requirements

### Requirement: Mathrax solves and generates over the shared Latin-square framework

Mathrax SHALL solve using the shared Latin-square solver framework, contributing its
own clue deductions: for each cell it SHALL intersect its candidate digits with those
permitted by each adjacent clue given the opposite cell's candidates, across the Easy,
Normal, Tricky and `Unreasonable` difficulty levels. The generator SHALL produce a full
Latin square, derive a candidate clue at every interior intersection, and then remove
given digits and clues in a randomized order while the puzzle remains **uniquely**
solvable at the target difficulty. Generation from a given seed SHALL be reproducible.

Uniqueness is required at *every* difficulty, including the guess-and-verify
`Unreasonable` tier. This is a deliberate divergence from upstream, which tests its
solver's verdict for bare truthiness and so accepts an *ambiguous* verdict as grounds
to keep removing — leaving that whole tier with puzzles that have several solutions
(measured: 30 of 30 sampled boards, and the recorded C descriptions for it are blank
grids). A board with no unique answer cannot be mistake-checked, so Check & Save would
silently pass anything played on it.

#### Scenario: The solver solves a generated board

- **WHEN** a generated board is solved
- **THEN** the returned grid is the board's unique Latin-square solution and satisfies
  every clue

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description

#### Scenario: Even the guess-and-verify tier yields a unique solution

- **WHEN** a board is generated at the `Unreasonable` difficulty
- **THEN** it has exactly one solution, and it cannot be solved without the
  guess-and-verify step

## MODIFIED Requirements

### Requirement: Mathrax grades its difficulty tiers honestly

A Mathrax board generated at a difficulty above the easiest SHALL NOT be soluble at
the tier below it.

This diverges from upstream, whose generator strips clues while the board still
solves at the target tier and publishes the result, never asking whether an easier
tier would also have done. Upstream generates exactly once; the corrected
generator retries until a candidate binds, and that loop SHALL be bounded.

Because generation is solver-gated at every removal, the correction changes every
board above the easiest tier. This is the second divergence in this generator — the
first requires removals to keep the board *uniquely* solvable.

#### Scenario: A Tricky board genuinely needs the Tricky tier

- **WHEN** a board generated at Tricky is solved at Normal
- **THEN** the solver does not reach a unique solution
- **AND** solving the same board at Tricky does

## REMOVED Requirements

### Requirement: Mathrax ports the Latin-square solver and generator faithfully

**Reason**: Its heading asserted parity with upstream's C ("faithfully"), a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement; a `MODIFIED` block cannot rename a requirement.

**Migration**: Replaced by "Mathrax solves and generates over the shared Latin-square framework", which keeps its whole text and every scenario without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
