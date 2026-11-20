## MODIFIED Requirements

### Requirement: A shared helper carries the byte-for-byte differential shape

The engine testing utilities SHALL provide `describeDescDifferential` in
`src/engine/testing/differential.ts`: given fixtures, a `params` mapper and a
game's `newDesc`, it asserts that each fixture's seed generates the recorded C
desc, and `aux` where one was recorded, with an optional `extra` callback for
a follow-on assertion. A game whose gated differential has that shape SHALL
use the helper. The solver-agreement shape is game-specific and is not
modeled by it.

#### Scenario: A game's byte-match differential uses the helper

- **WHEN** a game's gated differential asserts its `newDesc` reproduces the C desc
  byte-for-byte across a fixture set
- **THEN** it calls `describeDescDifferential` with its fixtures, params mapper, and
  `newDesc`, rather than re-declaring the `describe`/`for`/`it`/`expect` loop

#### Scenario: A differential decodes a board and runs the solver

- **WHEN** a game's differential decodes a recorded board, runs the solver and
  asserts the recorded difficulty
- **THEN** it is written in the game's own test, not through this helper

#### Scenario: A fixture that recorded the aux

- **WHEN** a fixture carries the `aux` the C generator wrote beside its desc
- **THEN** the helper asserts the TS generator's `aux` equals it too
