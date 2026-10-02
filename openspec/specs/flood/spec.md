# flood Specification

## Purpose
Flood, the puzzle of turning the whole grid one color within a move limit by
repeatedly flood-filling from the top-left corner. This capability specifies its
port to the TS engine: pure fill and solve moves, win and lose status, and a
hint plan backed by the solver.

## Requirements

### Requirement: Flood game implements the Game interface

The engine SHALL provide a registered `flood` game implementing
`Game<FloodParams, FloodState, FloodMove, FloodUi, FloodDrawState>`: a `w×h`
grid of colored squares solved by flood-filling the top-left corner until the
whole grid is one color within a move limit. Params SHALL be `w`, `h`,
`colors` (3–10), and `leniency`, encoded `WxH` with `c{colors}m{leniency}`
appended when `full`, with lenient decode (a bare `W` yields a square `W×W`
board). The seven upstream presets SHALL be offered. `validateParams` SHALL
reject `w·h < 2`, `colors` outside 3–10, and negative `leniency`. The game SHALL provide `statusbarText`, `solve` and `textFormat`, and SHALL NOT provide `findMistakes` (no per-move
mistake; the failure mode is the lose status).

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 12, h: 12, colors: 6, leniency: 5 }` are encoded with
  `full = true`
- **THEN** the result is `12x12c6m5`
- **AND** decoding `12x12c6m5` round-trips, and a bare `12` decodes to a 12×12
  board with the default colors/leniency

#### Scenario: A generated board is completable with its move limit

- **WHEN** a new game is created from any valid params
- **THEN** the grid is not already one color, and the move limit equals the
  solver's move count plus the leniency

### Requirement: Flood fill and solve moves transform state purely

A `FloodMove` SHALL be a fill carrying a color (`{ type: "fill", color }`) or a
solve (`{ type: "solve" }`). `interpretMove` SHALL produce a fill only when the
clicked / cursor-selected cell's color differs from the current corner color
and the game is not complete; cursor keys SHALL move the cursor (clamped).
`executeMove` SHALL be pure: a fill floods the corner region to the chosen
color and increments the move count; a solve SHALL run the solver and apply its
fills to reach the solved grid. Solve SHALL refuse, saying no solution can be found
from this position, when those fills would take the move count past the limit,
since that grid is a loss. The state SHALL keep no record of completion or
of the solver: the grid is complete exactly when it is one color, and the
engine records that Solve was used.

#### Scenario: A fill floods the corner region

- **WHEN** a fill move with a color adjacent to the controlled region executes
- **THEN** the corner region and all newly-adjacent same-color squares become
  that color, the move count increases by one, and the source state is unmutated

#### Scenario: A fill that does not change the corner color is rejected

- **WHEN** input targets a cell whose color equals the current corner color
- **THEN** no move is produced

#### Scenario: Solve refuses a finish past the move limit

- **WHEN** the moves already spent plus the solver's fills exceed the move limit
- **THEN** Solve refuses, and the board is unchanged

#### Scenario: Solve snaps to a completed grid

- **WHEN** the solve move executes
- **THEN** the grid becomes a single color and the game reports itself solved
  with help

### Requirement: Flood reports win and lose status

The Flood `status()` SHALL return `"solved"` when the grid is complete within the
move limit, `"lost"` when the move count reaches the limit before completing,
and `"ongoing"` otherwise. The status bar SHALL reflect the move count against
the limit with `COMPLETED!` / `FAILED!` / `Auto-solved` prefixes as appropriate.

#### Scenario: Exhausting the move limit loses

- **WHEN** the player makes the move that brings the move count up to the limit
  without completing the grid
- **THEN** `status()` returns `"lost"`

#### Scenario: Completing within the limit wins

- **WHEN** a fill completes the grid with the move count at or below the limit
- **THEN** `status()` returns `"solved"`

### Requirement: Flood offers a solver-backed hint plan

The Flood `hint()` SHALL return the solver's whole remaining move sequence as a
multi-step plan: each step is a fill, narrated by its color and highlighting the
squares that fill will absorb. `hintKeepTrack` SHALL advance the plan when the
player makes the step's fill and drop it otherwise.

#### Scenario: Hint plan completes the board

- **WHEN** `hint()` is requested on an unsolved board and each step's fill is
  applied in order
- **THEN** the fills are legal and the grid reaches a single color

#### Scenario: Following the plan keeps it; deviating drops it

- **WHEN** the player makes the current step's fill
- **THEN** `hintKeepTrack` reports it completed and the plan advances
- **AND** a different fill reports `"off"`
