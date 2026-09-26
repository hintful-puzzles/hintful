## MODIFIED Requirements

### Requirement: Twiddle game implements the Game interface

The engine SHALL provide a registered `twiddle` game implementing
`Game<TwiddleParams, TwiddleState, TwiddleMove, TwiddleUi, TwiddleDrawState>`:
a `w×h` grid of numbered tiles solved when the tile numbers read in
non-decreasing row-major order (and, when `orientable`, every tile is upright).
Params SHALL be `w`, `h`, `n` (rotating-block size), `rowsonly`, `orientable`,
and `movetarget`, encoded as `WxHnN` with trailing `r` (rowsonly) / `o`
(orientable) / `mK` (shuffle target) flags, with lenient decode (a bare `W`
yields a square `W×W` board, default `n = 2`). The eight upstream presets SHALL
be offered. `validateParams` SHALL reject `n < 2`, `w < n`, `h < n`, an
unreasonably large `w·h`, and a negative `movetarget`. The game SHALL provide `statusbarText`, `solve` and `textFormat`. It SHALL NOT provide a `findMistakes` hook (every
reachable position is legal) and SHALL NOT provide a `hint` hook (no upstream
human solver exists for subsquare rotation).

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 4, h: 4, n: 3, rowsonly: false, orientable: false, movetarget: 0 }` are encoded
- **THEN** the result is `4x4n3`
- **AND** decoding `4x4n3`, `4n3` (square shorthand), and `4x4n3o` all round-trip
  to the corresponding params, with `o` setting `orientable`

#### Scenario: A generated board is scrambled and starts unsolved

- **WHEN** a new game is created from any valid params
- **THEN** the grid is a scramble of the solved arrangement that is not itself
  the solved arrangement, and reports a not-completed status
- **AND** generation terminates for every preset

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` receives `{ n: 1 }`, or `{ w: 2, n: 3 }`, or a
  negative `movetarget`
- **THEN** it returns a non-null human-readable reason
