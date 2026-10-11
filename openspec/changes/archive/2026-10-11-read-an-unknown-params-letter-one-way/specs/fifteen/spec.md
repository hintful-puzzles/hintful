## MODIFIED Requirements

### Requirement: Fifteen's params are a width and a height

Params SHALL be `w` and `h`, encoded `WxH`. A bare `W` SHALL decode as a
square `W×W` board. Params with `w < 2` or `h < 2` SHALL be refused.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 4, h: 4 }` are encoded
- **THEN** the result is `4x4`
- **AND** decoding `4x4` and `4` both yield `{ w: 4, h: 4 }`, while a
  non-square `5x4` decodes to `{ w: 5, h: 4 }`

#### Scenario: A board one cell wide is refused

- **WHEN** params `{ w: 1, h: 4 }` are checked
- **THEN** they are refused
