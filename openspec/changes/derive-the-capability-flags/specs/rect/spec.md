## MODIFIED Requirements

### Requirement: Rectangles game implements the Game interface

The engine SHALL provide a registered `rect` game implementing
`Game<RectParams, RectState, RectMove, RectUi, RectDrawState, RectMistake>`:
divide a `w × h` grid into rectangles so that every rectangle contains exactly
one numbered square and its area equals that number. Params SHALL be `w`, `h`,
`expandfactor` (a non-negative float, default 0) and `unique` (a boolean,
default true), encoded `{w}x{h}` with a full-form `e{%g}` expansion-factor
suffix when non-zero and an `a` suffix when `unique` is false (square shorthand
`{n}`). All 7 upstream presets (7×7, 9×9, 11×11, 13×13, 15×15, 17×17, 19×19)
SHALL be offered. `validateParams` SHALL enforce `w > 0`, `h > 0`, `w*h ≥ 2`,
and a non-negative expansion factor. The game SHALL provide `solve` and `textFormat`, and SHALL drive a completion flash suppressed
after Solve.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 9, h: 7, expandfactor: 0, unique: false }` are encoded
  in full
- **THEN** the result is `9x7a` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a grid whose area is less than 2, or a
  negative expansion factor
- **THEN** it returns a non-null error string
