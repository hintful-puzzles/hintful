## ADDED Requirements

### Requirement: Generation: Crossing's generator deals only uniquely solvable boards

At Easy the generator SHALL accept a board only when the solver reports it
valid, so that the board has one solution and deduction alone reaches it, and
SHALL retry otherwise. On a generated board no 2×2 block SHALL be fully closed
and the open cells SHALL be connected. An Easy deal SHALL keep a board that
needs the solver's third deduction, which upstream's generator throws away.

#### Scenario: A generated board is valid and connected

- **WHEN** an Easy board is generated
- **THEN** the solver reports it valid, no 2×2 block of it is fully closed, and
  its open cells are connected

## REMOVED Requirements

### Requirement: Generation: Crossing's generator keeps every board uniquely solvable

**Reason**: Its scenario held a seed to the board upstream dealt from it, which no test holds any more: which board a seed deals is free to change.

**Migration**: Restated, without the seed scenario, as "Generation: Crossing's generator deals only uniquely solvable boards".
