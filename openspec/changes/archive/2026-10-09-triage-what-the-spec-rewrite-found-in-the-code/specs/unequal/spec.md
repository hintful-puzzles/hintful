## MODIFIED Requirements

### Requirement: Unequal refuses the parameters it cannot deal

The game SHALL declare its size's bounds as 3 to the largest value a candidate
mask holds (`MAX_CANDIDATE_VALUE`), and an order outside them SHALL be refused,
an order of 32 included. A difficulty letter the encoding does not know SHALL
decode as the default tier. `validateParams` SHALL refuse an Adjacent puzzle of
Tricky difficulty or harder below order 5, and SHALL refuse, when a board is to
be dealt, an order of 3 at Tricky or Unreasonable, which no 3×3 board needs.

#### Scenario: Invalid params are rejected

- **WHEN** the params are checked with an order of 2 or of 32
- **THEN** they are refused with an error string

#### Scenario: A difficulty letter that names no tier

- **WHEN** the params string `5dz` is decoded
- **THEN** the order is 5 and the difficulty is the default tier, Normal
- **AND** the params are not refused

#### Scenario: A small Adjacent puzzle has no upper tiers

- **WHEN** `validateParams` is called with an Adjacent puzzle below order 5 at
  Tricky or harder
- **THEN** it returns a non-null error string
