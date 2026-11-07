## MODIFIED Requirements

### Requirement: Generation: A Galaxies board is Easy where the deduction chain finishes it and Unreasonable where only recursion does

`newDesc` SHALL return only a board diagnosed, from the dots alone, at
exactly the tier asked for: Easy where the description's compiled ladder,
each technique checked sound, finishes the board, and Unreasonable where the
ladder does not and the engine's search finds one answer within its budget.
The hint SHALL run the same ladder.

#### Scenario: Generated boards are uniquely solvable at the right difficulty

- **WHEN** a Galaxies board is generated for any preset
- **THEN** the solver run at the requested difficulty completes the board
- **AND** the solver diagnosis is exactly the requested difficulty (neither
  lower, nor `Ambiguous`, nor `Impossible`)

### Requirement: Solver: The Galaxies solver grades by deduction, then bounded recursion

The Galaxies solver SHALL run its compiled ladder and, for `Unreasonable`,
the engine's search over it (`engine-difficulty`, "The engine counts a
searching game's answers up to two, within a budget of positions"), which
takes the square with the fewest dots left that could own it and assumes
each in turn. It SHALL return one of the `GalaxiesDiff` verdicts `Normal`
(solvable at the Easy tier), `Unreasonable`, `Ambiguous`, `Impossible`, or
`Unfinished`.

#### Scenario: Unsolvable hand-entered position

- **WHEN** the solver runs on a position with no consistent association
- **THEN** it reports `Impossible` rather than returning a move
