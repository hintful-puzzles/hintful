## MODIFIED Requirements

### Requirement: Black Box game implements the Game interface

The engine SHALL provide a registered `blackbox` game implementing
`Game<BlackboxParams, BlackboxState, BlackboxMove, BlackboxUi,
BlackboxDrawState>`: a deduction puzzle in which the player locates hidden balls
in a `w`×`h` arena by firing lasers from the surrounding range and observing how
they hit, reflect, or exit. Params SHALL be `w`, `h`, `minballs`, `maxballs`,
encoded `w{w}h{h}m{minballs}M{maxballs}` with lenient decode (unknown letters
ignored). The 5 upstream presets — `5×5, 3 balls`, `8×8, 5 balls`, `8×8, 3-6
balls`, `10×10, 5 balls`, `10×10, 4-10 balls` — SHALL be offered. The
preset/custom **type summary** SHALL read `{w}x{h}, {n} balls` (or `{min}-{max}
balls`) via a `no-of-balls` annotation key mapped in the worker adapter.
`validateParams` SHALL reject `w < 2` or `h < 2`, `w > 255` or `h > 255`,
`minballs < 1`, `minballs > maxballs`, and `minballs >= w*h`. The game SHALL
report `wantsStatusbar = true`, `canSolve = true`, and
`canFormatAsText = false`, and SHALL NOT provide `hint` or `findMistakes`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 8, h: 8, minballs: 3, maxballs: 6 }` are encoded
- **THEN** the result is `w8h8m3M6`
- **AND** decoding `w8h8m3M6` round-trips those params

#### Scenario: The ball-count type summary reflects a range

- **WHEN** the worker adapter decodes params `w8h8m3M6` for the type summary
- **THEN** the `no-of-balls` annotation value is `"3-6"` (rendered `3-6 balls`)
- **AND** for `w8h8m5M5` the value is `"5"` (rendered `5 balls`)

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `minballs: 0`, or with
  `minballs > maxballs`, or with `minballs >= w*h`
- **THEN** it returns a non-null error string
