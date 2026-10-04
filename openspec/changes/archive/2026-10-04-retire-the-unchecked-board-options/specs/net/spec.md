## MODIFIED Requirements

### Requirement: Net game implements the Game interface

The engine SHALL provide a registered `net` game implementing `Game<NetParams, NetState,
NetMove, NetUi, NetDrawState, NetMistake>`: a `w × h` grid of wire tiles (a 4-bit mask of connections
`R=1`, `U=2`, `L=4`, `D=8`) whose solved configuration is a spanning tree rooted at a source
square. The player SHALL rotate tiles until every tile is connected to the source and powered.

Params SHALL be `w`, `h`, `wrapping` and `barrierProbability`, encoded
`{w}x{h}[w][b{prob}]` (`w` = wrapping, the `b` suffix only in the full encoding). Decoding
SHALL skip upstream's `a`, which asks for a board with no promised single answer, and
encoding SHALL never write it. Upstream's presets SHALL be offered, its two 13×11 boards (plain and
wrapping) turned to 11×13 so that no preset draws wider than tall. `validateParams` SHALL reject a
`wrapping` board with a side of length 2.

The game SHALL provide `solve` and `statusbarText`, and SHALL NOT provide `textFormat`. It
SHALL implement `finishesByDeduction` as its solver settling every tile.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, wrapping: true, barrierProbability: 0.25 }` are
  encoded in full
- **THEN** the result is `5x5wb0.25` and decoding it round-trips the params

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `7x9wb0.25a` is decoded
- **THEN** the params are those of `7x9wb0.25`

### Requirement: Generated boards are uniquely solvable without guessing

The generator SHALL gate every board through its own solver, perturbing
the wiring until the board has exactly one solution reachable by pure deduction, and SHALL then
keep the board only if the hint's engine finishes it from the opening position, dealing another
otherwise. No parameter SHALL deal a board that requires guessing or that the hint cannot finish.

#### Scenario: A generated board has one deducible solution

- **WHEN** a board is generated
- **THEN** the solver reports it uniquely solvable, and no guess is required to reach the
  solution

#### Scenario: A generated board is hinted to the end

- **WHEN** a board is generated and the player follows the hint from the opening position
- **THEN** every step agrees with the solution and the board ends solved
