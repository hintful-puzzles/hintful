## MODIFIED Requirements

### Requirement: Net game implements the Game interface

The engine SHALL provide a registered `net` game implementing `Game<NetParams, NetState,
NetMove, NetUi, NetDrawState, NetMistake>`: a `w × h` grid of wire tiles (a 4-bit mask of connections
`R=1`, `U=2`, `L=4`, `D=8`) whose solved configuration is a spanning tree rooted at a source
square. The player SHALL rotate tiles until every tile is connected to the source and powered.

Params SHALL be `w`, `h`, `wrapping` and `barrierProbability`, encoded
`{w}x{h}[w][b{prob}]` (`w` = wrapping, the `b` suffix only in the full encoding). Decoding
SHALL skip upstream's `a`, which asks for a board with no promised single answer, and
encoding SHALL never write it. Upstream's five sizes SHALL be offered, its 13×11 board turned to 11×13 so that no preset draws wider than tall, and one wrapping board. `validateParams` SHALL reject a
`wrapping` board with a side of length 2.

The game SHALL provide `solve` and `statusbarText`, and SHALL NOT provide `textFormat`. It
SHALL implement `finishesByDeduction` as its solver settling every tile and its hint's engine
finishing the board, so that a board that loads is one its hint finishes.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, wrapping: true, barrierProbability: 0.25 }` are
  encoded in full
- **THEN** the result is `5x5wb0.25` and decoding it round-trips the params

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `7x9wb0.25a` is decoded
- **THEN** the params are those of `7x9wb0.25`
