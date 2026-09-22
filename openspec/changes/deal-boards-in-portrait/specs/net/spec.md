## MODIFIED Requirements

### Requirement: Net game implements the Game interface

The engine SHALL provide a registered `net` game implementing `Game<NetParams, NetState,
NetMove, NetUi, NetDrawState>`: a `w × h` grid of wire tiles (a 4-bit mask of connections
`R=1`, `U=2`, `L=4`, `D=8`) whose solved configuration is a spanning tree rooted at a source
square. The player SHALL rotate tiles until every tile is connected to the source and powered.

Params SHALL be `w`, `h`, `wrapping`, `barrierProbability` and `unique`, encoded
`{w}x{h}[w][b{prob}][a]` (`w` = wrapping, the `b` suffix only in the full encoding, `a` = not
unique). Upstream's presets SHALL be offered, its two 13×11 boards (plain and
wrapping) turned to 11×13 so that no preset draws wider than tall. `validateParams` SHALL reject a `unique`
`wrapping` board with a side of length 2.

The game SHALL report `canSolve = true`, `canFormatAsText = false` and `wantsStatusbar = true`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, wrapping: true, barrierProbability: 0.25, unique: true }` are
  encoded in full
- **THEN** the result is `5x5wb0.25` and decoding it round-trips the params
