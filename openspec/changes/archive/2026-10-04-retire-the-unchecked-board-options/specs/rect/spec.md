## MODIFIED Requirements

### Requirement: Rectangles game implements the Game interface

The engine SHALL provide a registered `rect` game implementing
`Game<RectParams, RectState, RectMove, RectUi, RectDrawState, RectMistake>`:
divide a `w × h` grid into rectangles so that every rectangle contains exactly
one numbered square and its area equals that number. Params SHALL be `w`, `h`
and `expandfactor` (a non-negative float, default 0), encoded `{w}x{h}` with a
full-form `e{%g}` expansion-factor suffix when non-zero (square shorthand
`{n}`). Decoding SHALL read past upstream's trailing `a`, which asks for a
board with no promised single answer, and encoding SHALL never write it. All 7
upstream presets (7×7, 9×9, 11×11, 13×13, 15×15, 17×17, 19×19)
SHALL be offered. `validateParams` SHALL enforce `w > 0`, `h > 0`, `w*h ≥ 2`,
and a non-negative expansion factor. The game SHALL provide `solve` and `textFormat`, and SHALL drive a completion flash suppressed
after Solve. The game SHALL implement `finishesByDeduction` as its solver
reaching a unique placement from the board's numbers.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 10, h: 10, expandfactor: 0.5 }` are encoded in full
- **THEN** the result is `10x10e0.5` and decoding it round-trips the params

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given a grid whose area is less than 2, or a
  negative expansion factor
- **THEN** it returns a non-null error string

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `9x7a` is decoded
- **THEN** the params are those of `9x7`, and a board dealt from them has one
  solution

### Requirement: Rectangles ports the solver and solver-gated generator

The port SHALL implement `rect_solver` with its full deductive power:
per-rectangle candidate-placement enumeration, the overlaps and `rectbyplace`
bookkeeping, and the deduction loop (sole-remaining-number-position marking,
placement-intersection marking, rectangle-focused and square-focused placement
elimination), plus the RNG-driven number-placement winnowing used during
generation. The generator (`new_game_desc`) SHALL tile the base grid at random,
remove singletons, stretch it with the two-pass expand-and-transpose, call the
solver on every layout, and encode the run-length desc. `solve` SHALL run the solver from the fixed
numbers and return the unique solution's edges (or the generator's `aux` when
present).

#### Scenario: Generated boards are uniquely solvable

- **WHEN** a board is generated and solved from its numbers
- **THEN** the solver reaches a single consistent rectangle placement for every
  number

### Requirement: Rectangles deals only boards its hint can finish

The generator SHALL deal only boards the hint's steps finish from an empty
board, dealing again where a board it laid out would leave them short. Such a
seed's desc SHALL differ from upstream's.

#### Scenario: A board past the hint is dealt again

- **WHEN** the generator lays out a uniquely solvable board the hint's steps
  cannot finish
- **THEN** it draws another board instead of returning that one
