## MODIFIED Requirements

### Requirement: Flood params are a size, a color count and a leniency

Params SHALL be `w`, `h`, `colors` and `leniency`, the leniency being the
moves allowed beyond the solver's own count. They SHALL be encoded `WxH`, with
`c{colors}m{leniency}` appended when `full`. A bare `W` SHALL decode as a
square `W×W` board.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 12, h: 12, colors: 6, leniency: 5 }` are encoded with
  `full = true`
- **THEN** the result is `12x12c6m5`
- **AND** decoding `12x12c6m5` round-trips, and a bare `12` decodes to a 12×12
  board with the default colors and leniency
