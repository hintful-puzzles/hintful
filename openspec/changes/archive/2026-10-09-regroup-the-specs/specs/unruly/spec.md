## MODIFIED Requirements

### Requirement: A malformed Unruly description is refused

`validateDesc` SHALL reject a desc holding any character outside the
run-length alphabet and any desc whose decoded length differs from
`w2·h2 + 1`.

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with an invalid character or a decoded
  length mismatching the params
- **THEN** it returns a non-null error string

### Requirement: A placement on a clue or off the board is rejected

`executeMove` SHALL reject a placement whose target is out
of bounds or an immutable clue cell.

#### Scenario: A placement on a clue is rejected

- **WHEN** `executeMove` is given a placement on an immutable clue cell
- **THEN** it throws, and the state it was given is unchanged
