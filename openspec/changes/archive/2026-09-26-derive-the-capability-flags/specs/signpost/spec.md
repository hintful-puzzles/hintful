## MODIFIED Requirements

### Requirement: Signpost game implements the Game interface

The engine SHALL provide a registered `signpost` game implementing
`Game<SignpostParams, SignpostState, SignpostMove, SignpostUi,
SignpostDrawState>`: a `w × h` grid in which every cell carries an arrow
(one of 8 directions) and some cells carry immutable sequence numbers; the
player links cells into a single chain `1 … n` (`n = w*h`) where every link
follows its cell's arrow and the numbers run consecutively. Params SHALL be
`w`, `h`, and `forceCornerStart` (boolean), encoded `{w}x{h}` with a
trailing `c` when corner-start is set (square shorthand `{n}`). All 6
upstream presets (4×4, 4×4 free ends, 5×5, 5×5 free ends, 6×6, 7×7) SHALL
be offered. `validateParams` SHALL reject non-positive dimensions and a
1×1 full generation. The game SHALL provide `solve` and `textFormat` and SHALL drive a spin win-flash suppressed after
Solve.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, forceCornerStart: true }` are encoded in
  full
- **THEN** the result is `5x5c` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1×1 grid for full generation
- **THEN** it returns a non-null error string
