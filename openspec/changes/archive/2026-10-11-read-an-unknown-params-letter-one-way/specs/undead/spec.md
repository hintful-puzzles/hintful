## MODIFIED Requirements

### Requirement: Undead's parameter limits

Width and height SHALL each declare a minimum of 3 in `paramConfig`, which the
engine's params check refuses below, and `validateParams` SHALL refuse
`w·h > 54`. A difficulty letter the encoding does not know SHALL be refused.

#### Scenario: Invalid params are rejected

- **WHEN** params with `w < 3`, `h < 3` or `w·h > 54` go through the engine's
  params check
- **THEN** it returns a refusal sentence
