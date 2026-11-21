## MODIFIED Requirements

### Requirement: Params: Clusters refuses a board size that has no puzzle

Validation SHALL reject a board whose area is less than 2 as too small. It
SHALL additionally reject a board no larger than 2×2 in both dimensions, which
has no Clusters puzzle at any difficulty.

#### Scenario: A board with no puzzle at all is rejected

- **WHEN** a board of 1×2 or 2×2 is validated
- **THEN** it is rejected, naming the constraint, rather than accepted and
  generated for ever
