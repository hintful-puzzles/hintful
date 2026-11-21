## MODIFIED Requirements

### Requirement: Params: Unruly refuses params no board can be dealt for

`validateParams` SHALL reject an odd dimension and a `unique`-mode grid too
tall or too long for any valid set of distinct rows (the A177790 bound).

#### Scenario: Invalid params are rejected

- **WHEN** the engine's params check is given an odd dimension, a dimension
  below 6, or a `unique`-mode grid exceeding the distinct-rows bound
- **THEN** it returns a non-null error string
