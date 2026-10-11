## MODIFIED Requirements

### Requirement: Singles params are refused outside their bounds

Params SHALL be refused unless `w ≥ 2`, `h ≥ 2` and both are `≤ 61`: 61 is the
largest number the desc alphabet writes, and a cell holds a number up to
`max(w, h)`. A difficulty letter the encoding does not know SHALL be
refused.

#### Scenario: Invalid params are rejected

- **WHEN** params with `w < 2` or `h < 2` are checked
- **THEN** the check returns a non-null error string

#### Scenario: A grid one past the alphabet is rejected

- **WHEN** params with a height of 62 are checked
- **THEN** the check returns "Height must be at most 61."
