## MODIFIED Requirements

### Requirement: Solo's solver is a certified deduction ladder whose rungs run alone

Solo's solver SHALL run its techniques as a `runDeductionFixpoint` ladder of
named rungs in upstream's order: the block single, the four killer rungs, the
line, diagonal and naked singles, the line and diagonal intersections, the
region and diagonal sets, the single-digit set and the forcing chain. Each rung
SHALL carry its tier on its own scale, sudoku or killer; the ladder SHALL hold
only the rungs both caps admit, and a rung that fires SHALL raise its own
scale's grade. A rung SHALL read nothing a rung before it left behind in the
same pass, so that the premise audit's replay runs a firing's own rung alone.
A firing census SHALL walk pinned boards covering every variant at every pair of
deduction caps and at search, and assert that every rung fires on the corpus.
The hand-written loop the ladder replaced SHALL NOT be kept once the adoption is
proved; git holds it.

A killer region whose filled cells and whole cages leave nothing for its open
cells SHALL be a contradiction.

#### Scenario: A mis-tiered or reordered rung fails

- **WHEN** a rung is declared at another tier, or moved past the rung after it
- **THEN** the frozen differential or the firing census fails

#### Scenario: A premise cut short is found

- **WHEN** a line-block intersection's step stops naming the region it
  confines the digit to
- **THEN** the premise audit reports the firing, since its rung alone no longer
  concludes it

#### Scenario: A region left nothing is not a solve

- **WHEN** a killer board with stray digits is searched and a region's filled
  cells and whole cages already make its total with cells still open
- **THEN** the solver reports the board impossible, not solved with an
  unfinished grid
