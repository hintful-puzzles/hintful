## MODIFIED Requirements

### Requirement: Untangle game implements the Game interface

The engine SHALL provide a registered `untangle` game implementing
`Game<UntangleParams, UntangleState, UntangleMove, UntangleUi, UntangleDrawState>`:
a planar graph of `n` vertices joined by edges, drawn tangled, solved when the
player has dragged the vertices so that no two edges cross. Params SHALL be
`{ n }` (vertex count), encoded as the integer; the five upstream presets (6, 10,
15, 20, 25) SHALL be offered with default `n = 10`. `validateParams` SHALL reject
`n < 4` and an unreasonably large `n`. The game SHALL report `wantsStatusbar`
faithfully to upstream, `canSolve = true`, and
`canFormatAsText = false` (the upstream text format exists only in the excluded
editor build). It SHALL provide a `hint` hook (see "Untangle hints move the point
that removes the most crossings") and SHALL NOT provide a `findMistakes` hook
(crossed edges are the built-in mistake feedback).

#### Scenario: Params round-trip

- **WHEN** params `{ n: 10 }` are encoded and decoded
- **THEN** the round-trip yields `{ n: 10 }`, and the five presets (6/10/15/20/25)
  are offered

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` receives `{ n: 3 }` (too few) or an unreasonably large
  `n`
- **THEN** it returns a non-null reason
