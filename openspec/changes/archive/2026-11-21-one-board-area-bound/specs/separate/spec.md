## MODIFIED Requirements

### Requirement: Params: Separate refuses a letter count the grid cannot be divided by

`validateParams` SHALL refuse a `k` that does not divide `w·h`. Under full
validation it SHALL also refuse a `k` equal to the whole grid, a `k` of 1, and
a `k` above 26, the letters of the alphabet.

#### Scenario: Invalid params are rejected

- **WHEN** params are fully validated with a `k` that does not divide `w·h`,
  or with `k = w·h`
- **THEN** the result is a non-null error string

#### Scenario: One letter, or more letters than the alphabet

- **WHEN** a 6×6 board is fully validated with `k = 1`, or a 27×27 board with
  `k = 27`
- **THEN** the result is a non-null error string
