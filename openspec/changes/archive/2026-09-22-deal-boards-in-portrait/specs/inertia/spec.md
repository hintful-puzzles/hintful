## MODIFIED Requirements

### Requirement: Inertia game implements the Game interface

The engine SHALL provide a registered `inertia` game implementing
`Game<InertiaParams, InertiaState, InertiaMove, InertiaUi, InertiaDrawState>`: a
`w × h` grid whose cells are blank, a gem, a mine, a stop-square or a wall, with a
single ball starting on a stop-square. A move slides the ball in one of eight
directions until it lands on a stop-square or the next square in its path is a
wall; it collects every gem it passes over and dies on any mine it touches. The
game is won when every gem has been collected. Params SHALL be `w` and `h`, and
three presets (8×10, 12×15, 16×20), upstream's sizes turned to draw taller
than wide, SHALL be offered. The game SHALL
report `canSolve = true`, `canFormatAsText = true` and `wantsStatusbar = true`.

The game SHALL NOT implement `findMistakes`: every reachable position is legal — a
death is undone, not corrected — so there is no wrong-but-legal state to flag, and
Check-&-Save correctly degrades to a plain quick-save.

The game SHALL implement `hint` (see "The hint explains each move by the gem it is
going for").

#### Scenario: Params round-trip

- **WHEN** params `{ w: 15, h: 12 }` are encoded in full and decoded
- **THEN** the decoded params equal the original

#### Scenario: Degenerate params are rejected

- **WHEN** `validateParams` is given a grid with a dimension below 2, or an area
  below 6 squares
- **THEN** it returns a non-null error string
