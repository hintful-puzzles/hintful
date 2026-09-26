## MODIFIED Requirements

### Requirement: Netslide game implements the Game interface

The engine SHALL provide a registered `netslide` game implementing
`Game<NetslideParams, NetslideState, NetslideMove, NetslideUi,
NetslideDrawState>`: a `w × h` grid of Net wire tiles (a 4-bit mask of
connections `R=1`, `U=2`, `L=4`, `D=8`) whose solved configuration is a
spanning tree rooted at the center tile, scrambled by toroidal row/column
slides. The player SHALL slide rows and columns — never the center row or the
center column — until every tile is connected to the center.

Params SHALL be `w`, `h`, `wrapping`, `barrierProbability` and `movetarget`,
encoded `{w}x{h}[w][b{prob}][m{target}]` (square shorthand `{n}`; the `b`
suffix only in the full encoding, the `m` suffix in both because the target
move count is part of the puzzle). All 9 upstream presets (3×3, 4×4, 5×5 ×
easy / medium / hard) SHALL be offered. `validateParams` SHALL require width
and height both greater than one, a barrier probability in `[0, 1]`, and a
non-negative move target.

The game SHALL provide `solve` and `statusbarText`, and SHALL NOT provide `textFormat`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, wrapping: true, barrierProbability: 0.5,
  movetarget: 20 }` are encoded in full
- **THEN** the result is `5x5wb0.5m20` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a width or height of 1, a negative or
  greater-than-one barrier probability, or a negative move target
- **THEN** it returns a non-null error string
