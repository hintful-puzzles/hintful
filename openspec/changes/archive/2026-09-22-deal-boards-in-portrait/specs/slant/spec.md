## MODIFIED Requirements

### Requirement: Slant game implements the Game interface

The engine SHALL provide a registered `slant` game implementing
`Game<SlantParams, SlantState, SlantMove, SlantUi, SlantDrawState>`: fill
every square of a `w × h` grid with a `/` or `\` diagonal so that every
numbered vertex clue (0–4, on the `(w+1) × (h+1)` point grid) is met by
exactly that many incident diagonals and the diagonals form no closed loop.
Params SHALL be `w`, `h` and `diff` (Easy / Normal), encoded `{w}x{h}d{e|h}`
(short form `{w}x{h}`, square shorthand `{n}`). Six presets
(5×5, 8×8, 10×12 × Easy/Normal; upstream's 12×10 turned to draw taller than
wide) SHALL be offered. `validateParams` SHALL
enforce minimum size 2×2. The game SHALL report `canSolve = true` and
`canFormatAsText = true` and SHALL drive a solve-completion flash suppressed
after Solve.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 12, h: 10, diff: DIFF_HARD }` (the Normal tier) are
  encoded in full
- **THEN** the result is `12x10dh` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a 1-wide or 1-high grid
- **THEN** it returns a non-null error string
