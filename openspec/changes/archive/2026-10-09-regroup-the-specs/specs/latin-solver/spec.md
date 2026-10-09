## MODIFIED Requirements

### Requirement: The engine provides a shared, seeded Latin-square generator

The engine SHALL provide the Latin-square generator, square and rectangular,
and a game that deals from a Latin square SHALL use it and hold no copy. Given
the same random state it SHALL produce the same square.

#### Scenario: Generated square is Latin and deterministic per seed

- **WHEN** `latinGenerate(o, rng)` is called
- **THEN** the result contains every value `1..o` exactly once in each row and
  column
- **AND** calling it again from an identical random state yields the same square
