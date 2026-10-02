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
`minballs < 1`, `minballs > maxballs`, and `minballs >= w*h`. The game SHALL provide `statusbarText`, `solve` and `hint`, and SHALL NOT provide `textFormat` or `findMistakes`.

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

## ADDED Requirements

### Requirement: Black Box's hint SHALL reason only from the lasers fired

Black Box SHALL provide a `hint` that reads only the lasers fired and where they went, never
the hidden balls, so two boards whose balls send every fired laser the same way get the same
plan. It SHALL settle a square by following a fired laser through the squares already settled
to the first one nothing has settled, and concluding that square holds what does not send the
laser somewhere it did not go; a laser that came out at a numbered square SHALL be followed from
either end. A settled empty square SHALL be shown by marking it known and a settled ball by
guessing it, the step ringing the square and outlining the laser's ends. When nothing more
settles, the hint SHALL ask for a laser whose path still depends on unsettled squares. When
every laser is fired and none settles a square on its own, it SHALL offer, found by a bounded
search, balls that send every laser where it went, and refuse with `SEARCH_OUT_OF_REACH` past
the search's budget. Once every laser's path is settled by the balls on the board, it SHALL put
any balls the count still requires on squares no laser reaches, take off any the box cannot
hold, and ask the player to check the answer.

#### Scenario: A square a laser settles

- **WHEN** a fired laser came out at its other numbered end, and a ball on the first unsettled
  square along its path would keep any ray from running between those ends
- **THEN** the step rings that square, outlines both ends, says the square must be empty, and
  marks it known

#### Scenario: Nothing settles

- **WHEN** no fired laser settles a square and some laser's path still runs through unsettled
  squares
- **THEN** the step rings one such laser and asks the player to fire it

#### Scenario: The hint gives nothing away

- **WHEN** a hidden ball is moved to another square and every fired laser still goes where it
  went
- **THEN** the hint's plan is unchanged

#### Scenario: Following the hint wins

- **WHEN** the player follows every step from a dealt board of any preset
- **THEN** the answer is checked and accepted
