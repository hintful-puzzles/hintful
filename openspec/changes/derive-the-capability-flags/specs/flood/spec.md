## MODIFIED Requirements

### Requirement: Flood game implements the Game interface

The engine SHALL provide a registered `flood` game implementing
`Game<FloodParams, FloodState, FloodMove, FloodUi, FloodDrawState>`: a `w×h`
grid of colored squares solved by flood-filling the top-left corner until the
whole grid is one color within a move limit. Params SHALL be `w`, `h`,
`colors` (3–10), and `leniency`, encoded `WxH` with `c{colors}m{leniency}`
appended when `full`, with lenient decode (a bare `W` yields a square `W×W`
board). The seven upstream presets SHALL be offered. `validateParams` SHALL
reject `w·h < 2`, `colors` outside 3–10, and negative `leniency`. The game SHALL provide `statusbarText`, `solve` and `textFormat`, and SHALL NOT provide `findMistakes` (no per-move
mistake; the failure mode is the lose status).

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 12, h: 12, colors: 6, leniency: 5 }` are encoded with
  `full = true`
- **THEN** the result is `12x12c6m5`
- **AND** decoding `12x12c6m5` round-trips, and a bare `12` decodes to a 12×12
  board with the default colors/leniency

#### Scenario: A generated board is completable with its move limit

- **WHEN** a new game is created from any valid params
- **THEN** the grid is not already one color, and the move limit equals the
  solver's move count plus the leniency
