## MODIFIED Requirements

### Requirement: Fifteen game implements the Game interface

The engine SHALL provide a registered `fifteen` game implementing
`Game<FifteenParams, FifteenState, FifteenMove, FifteenUi, FifteenDrawState>`:
an `w×h` grid of numbered tiles with one empty gap, solved when the tiles read
`1..n-1` in row-major order with the gap last. Params SHALL be `w`, `h`,
encoded `WxH` with lenient decode (a bare `W` yields a square `W×W` board). The
single upstream preset (`4x4`) SHALL be offered, and `validateParams` SHALL
reject `w < 2` or `h < 2`. The game SHALL provide `statusbarText`, `solve` and `textFormat`. It SHALL
NOT provide a `findMistakes` hook (every reachable position is legal).

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 4, h: 4 }` are encoded
- **THEN** the result is `4x4`
- **AND** decoding `4x4` and `4` both yield `{ w: 4, h: 4 }`, while a
  non-square `5x4` decodes to `{ w: 5, h: 4 }`

#### Scenario: A generated board is solvable and starts unsolved

- **WHEN** a new game is created from any valid params
- **THEN** the tile array is a permutation whose parity matches the gap's
  chessboard parity (i.e. the board is reachable from the solved state)
- **AND** the initial state is not already in the solved arrangement and
  reports a not-completed status
