## ADDED Requirements

### Requirement: Same Game generates soluble and random boards

`newDesc` SHALL produce the board as a comma-separated list of `w·h` color
integers in row-major order. When `soluble` is true it SHALL use the
inverse-move generator (repeatedly inserting a verified connected blob whose
removal reproduces the prior grid, so the board is clearable); when `soluble` is
false it SHALL use the legacy random generator (at least two tiles of every
color, the remainder filled at random).
`validateDesc` SHALL reject a desc without exactly `w·h` comma-separated
integers, or any integer outside `0..ncols`. `newState` SHALL parse the desc into
the tile grid with score 0 and the complete/impossible flags clear.

#### Scenario: A soluble description is well-formed

- **WHEN** `newDesc` runs for a soluble preset with a fixed seed
- **THEN** `validateDesc` accepts it and `newState` parses `w·h` tiles

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with too few numbers, or one
  containing a color greater than `ncols`
- **THEN** it returns a non-null error string

## REMOVED Requirements

### Requirement: Same Game generates guaranteed-soluble and random boards

**Reason**: It required the generated desc to match upstream's C byte-for-byte, a porting-era concern the owner retired on 2026-09-13, when matching upstream's C stopped being a requirement, and that obligation is a scenario of its own, which a `MODIFIED` block cannot drop.

**Migration**: Replaced by "Same Game generates soluble and random boards", which keeps both generators, the desc format, validation and parsing, and both scenarios without the parity obligation. The frozen differential fixtures may remain as regression tests; they are no longer a requirement.
