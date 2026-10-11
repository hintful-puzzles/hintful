## MODIFIED Requirements

### Requirement: Subsets' parameters

Parameters SHALL be a width, a height, a universe size `n` and a difficulty
tier. Validation SHALL accept only `4×4` with `n = 4`. There SHALL be one
preset per tier. A game ID SHALL encode the width, height, universe size and
tier and round-trip through decode, and each tier SHALL encode to a *distinct*
ID. A game ID whose difficulty character names no tier SHALL be refused, and
SHALL NOT be played at another tier in its place.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height, universe size and tier are recovered

#### Scenario: Unsupported parameters are rejected

- **WHEN** parameters other than `4×4` with `n = 4` are validated
- **THEN** they are rejected: "Currently only 4x4 puzzles are supported."

#### Scenario: An unrecognized difficulty character is rejected

- **WHEN** a game ID carries a difficulty character naming no tier
- **THEN** decoding refuses it, rather than falling back to another tier
