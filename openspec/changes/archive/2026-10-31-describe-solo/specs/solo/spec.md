## ADDED Requirements

### Requirement: Solver: Solo's ladder is its description

Solo's solver SHALL run the ladder of `solo.description.yaml`, compiled: its
box single, its six killer readings, the intersection and the single-digit
set, and the Latin library's hidden single, naked single, set and wing, each
at the tier the description gives it, checked sound against the description's
rules in each world its variations deal. The forcing chain and the search
above them stay Solo's.

#### Scenario: A killer reading a firing at a time

- **WHEN** a cage's open cells leave no room for a value in one cell given
  the least and greatest the others can take, and that strike would leave
  another cell of the cage a value with no room either
- **THEN** the hint's step strikes only the first, read against the notes as
  the step shows them, and the second is a step of its own

## MODIFIED Requirements

### Requirement: Solver: Solo's solver is a certified deduction ladder whose rungs run alone

Solo's solver SHALL run its techniques as a `runDeductionFixpoint` ladder of
named rungs, in the order its description states them, then the forcing
chain. A rung SHALL read nothing a rung before it left behind in the same
pass, so that the premise audit's replay runs a firing's own rung alone. No
hand-written technique loop SHALL be kept beside it.

#### Scenario: A premise cut short is found

- **WHEN** a line-block intersection's step stops naming the region it
  confines the digit to
- **THEN** the premise audit reports the firing, since its rung alone no longer
  concludes it

### Requirement: Solver: Each rung is graded on its own scale

Each rung SHALL carry its tier on its own scale, sudoku or killer, as the
description's `scales` place it; the ladder SHALL hold only the rungs both
caps admit, and a rung that fires SHALL raise its own scale's grade.

#### Scenario: A rung over its cap is left out

- **WHEN** a killer board is solved with the killer cap below the region rule's
  tier
- **THEN** the ladder holds no killer region rung and no reading of the
  partial cages it works out, and the killer grade reported does not exceed
  the cap
