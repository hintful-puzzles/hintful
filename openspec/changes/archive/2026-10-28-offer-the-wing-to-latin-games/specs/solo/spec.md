## ADDED Requirements

### Requirement: Solver: Solo weighs a wing at Extreme

Solo's solver SHALL apply the wing at Extreme, as its `wing` rung after the
single-digit set: two cells see each other when they share a row, column,
block or, on an X board, diagonal, and a Killer cage is not counted. It SHALL
strike one cell a firing.

#### Scenario: A wing reads a block

- **WHEN** a cell's candidates are 2, 4 and 8, a cell of its block is down to
  2 and 8, a cell of its column is down to 2 and 4, and a fourth cell sees all
  three
- **THEN** capped at Extreme the solver strikes 2 from the fourth cell

## MODIFIED Requirements

### Requirement: Solver: Solo's solver is a certified deduction ladder whose rungs run alone

Solo's solver SHALL run its techniques as a `runDeductionFixpoint` ladder of
named rungs in order: the block single, the four killer rungs, the line,
diagonal and naked singles, the line and diagonal intersections, the region and
diagonal sets, the single-digit set, the wing and the forcing chain. A rung
SHALL read nothing a rung before it left behind in the same pass, so that the
premise audit's replay runs a firing's own rung alone. No hand-written
technique loop SHALL be kept beside it.

#### Scenario: A premise cut short is found

- **WHEN** a line-block intersection's step stops naming the region it
  confines the digit to
- **THEN** the premise audit reports the firing, since its rung alone no longer
  concludes it
