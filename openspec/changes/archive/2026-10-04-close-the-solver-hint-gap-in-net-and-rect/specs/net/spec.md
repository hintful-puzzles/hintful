## ADDED Requirements

### Requirement: Net's hint follows a wire through tiles not settled yet

A way of turning a tile SHALL count as sealing a group off when each of its wires stops within a bounded run of tiles and together they reach fewer tiles than the grid holds. The run past a side SHALL be bounded over every way the tiles it enters can turn, among the ways that contradict no known side and close no loop through wires already known, and a side whose wire could lead on, or come back round, SHALL bound nothing. Where the group is reached across a side not yet known to be wired, the step's words SHALL say that the turning leads only into the striped tiles and that its wire must stop there however they turn, and SHALL add "without closing a loop" when a loop is what keeps one of them from leading on. Such a step SHALL rank as harder than one whose group the known wires already join.

#### Scenario: Two dead ends and two straights in one column

- **WHEN** the hint is asked on upstream's wrapping board `5x5w:19d7aaae8449d5636cad43c44`
- **THEN** the plan finishes the board, every step agreeing with the solver's answer, and one step locks a straight lying across because, standing upright, it would lead only into the striped squares

#### Scenario: A tile on the way could lead on only round a loop

- **WHEN** a tile the wire enters has a way of turning that fits its known sides and would carry the wire on, and that way closes a loop through known wires
- **THEN** the turning is still ruled out as sealing the group, and the step's words say the wire must stop however the tiles turn without closing a loop

#### Scenario: Upstream's boards are hinted to the end

- **WHEN** the generator is run on a seed of the frozen C reference
- **THEN** the hint's engine finishes upstream's board for that seed, and the generator returns that board

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
SHALL implement `finishesByDeduction` as its solver settling every tile and its hint's engine
finishing the board, so that a board that loads is one its hint finishes.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, wrapping: true, barrierProbability: 0.25 }` are
  encoded in full
- **THEN** the result is `5x5wb0.25` and decoding it round-trips the params

#### Scenario: Upstream's unchecked-board letter

- **WHEN** `7x9wb0.25a` is decoded
- **THEN** the params are those of `7x9wb0.25`
