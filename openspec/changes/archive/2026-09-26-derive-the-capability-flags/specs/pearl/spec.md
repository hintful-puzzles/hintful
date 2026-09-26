## MODIFIED Requirements

### Requirement: Pearl game is registered and implements the Game interface

The engine SHALL provide a registered `pearl` game implementing
`Game<PearlParams, PearlState, PearlMove, PearlUi, PearlDrawState, PearlMistake>`:
draw a single closed loop through grid cells so that it turns a right angle at
every black pearl (and goes straight through at least one cell on each side of
it) and passes straight through every white pearl (turning immediately before or
after). Params SHALL be `w`, `h`, `difficulty` (Easy or Normal) and `nosolve`
(allow an unsoluble board, default false), encoded `{w}x{h}` with a full-form
`d{char}` difficulty suffix and an `n` suffix when `nosolve` is set.
`validateParams` SHALL enforce `w ≥ 5`, `h ≥ 5`, that width×height does not
overflow, and that a Normal board has `w + h ≥ 11`. Eight presets
(6×6, 8×8, 10×10, 8×12 each at Easy and Normal; upstream's 12×8 turned to draw
taller than wide) SHALL be offered. The game SHALL provide `solve` and `textFormat`, and SHALL drive a
completion flash suppressed after Solve. The two upstream appearance styles
(traditional Masyu and loopy) SHALL be selectable via an `appearance`
preference (default traditional).

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, difficulty: DIFF_TRICKY, nosolve: false }` (the
  Normal tier) are encoded in full
- **THEN** decoding the result round-trips the params

#### Scenario: The Normal tier requires a large enough board

- **WHEN** `validateParams` is given a Normal board with `w + h < 11`, or any
  board with `w < 5` or `h < 5`
- **THEN** it returns a non-null error string
