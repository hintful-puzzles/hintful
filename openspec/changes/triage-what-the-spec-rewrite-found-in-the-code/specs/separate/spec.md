## MODIFIED Requirements

### Requirement: Separate refuses a letter count the grid cannot be divided by

`validateParams` SHALL refuse a `k` that does not divide `w·h`, and an
unreasonably large `w·h`. Under full validation it SHALL also refuse a `k`
equal to the whole grid, a `k` of 1, and a `k` above 26, the letters of the
alphabet.

#### Scenario: Invalid params are rejected

- **WHEN** params are fully validated with a `k` that does not divide `w·h`,
  or with `k = w·h`
- **THEN** the result is a non-null error string

#### Scenario: One letter, or more letters than the alphabet

- **WHEN** a 6×6 board is fully validated with `k = 1`, or a 27×27 board with
  `k = 27`
- **THEN** the result is a non-null error string

### Requirement: A hint sentence rests on the player's own marks

Every hint sentence SHALL rest only on letters, walls and regions joined by the
player's own marks. A step citing two regions SHALL stripe one and outline the
other and name both marks, calling a lone square a square and never a region.
A `shared-letter` or `only-way` firing's first sentence SHALL instead name a
lone square by its letter, and two lone squares that share a letter SHALL both
be outlined.

#### Scenario: Two regions are named by their marks

- **WHEN** a displayed step cites two regions of more than one square each
- **THEN** one is striped and the other outlined, and the sentence names both
  marks

#### Scenario: A lone square is named by its letter

- **WHEN** the first step of a `shared-letter` firing cites a region and a lone
  square
- **THEN** the region is striped and the square outlined
- **AND** the sentence names the square by its letter, not as a region

#### Scenario: A lone square a wall separates keeps its mark

- **WHEN** a `walled-apart` step cites a lone square and a larger region
- **THEN** one is striped and the other outlined, either of which may be the
  lone one, and the sentence calls it a square: "A wall already separates the
  striped square and the outlined region" where the square is the striped one,
  and "the striped region and the outlined square" where it is the outlined
