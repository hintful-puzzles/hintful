# flood Specification

## Purpose
Flood, the puzzle of turning the whole grid one color within a move limit by
repeatedly flood-filling from the top-left corner. This capability specifies
the game: its params, its fill and solve moves, win and lose status, a hint
plan backed by the solver, and how the board is drawn.

## Requirements

### Requirement: Flood game implements the Game interface

The engine SHALL provide a registered `flood` game implementing
`Game<FloodParams, FloodState, FloodMove, FloodUi, FloodDrawState>`: a `w×h`
grid of colored squares solved by flood-filling the top-left corner until the
whole grid is one color within a move limit. The game SHALL provide
`statusbarText`, `solve` and `textFormat`, and SHALL NOT provide
`findMistakes`: no single move is a mistake, and the failure mode is the lose
status.

#### Scenario: The game's optional hooks

- **WHEN** the registered `flood` game is read
- **THEN** it has `statusbarText`, `solve` and `textFormat`
- **AND** it has no `findMistakes`

### Requirement: Flood params are a size, a color count and a leniency

Params SHALL be `w`, `h`, `colors` and `leniency`, the leniency being the
moves allowed beyond the solver's own count. They SHALL be encoded `WxH`, with
`c{colors}m{leniency}` appended when `full`. Decoding SHALL be lenient: a bare
`W` yields a square `W×W` board.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 12, h: 12, colors: 6, leniency: 5 }` are encoded with
  `full = true`
- **THEN** the result is `12x12c6m5`
- **AND** decoding `12x12c6m5` round-trips, and a bare `12` decodes to a 12×12
  board with the default colors and leniency

### Requirement: Flood offers its presets

The presets SHALL be, in this order: 12×12 in six colors at leniency 5, 2 and
0, titled `12x12 Easy`, `12x12 Medium` and `12x12 Hard`; 16×16 in six colors
at leniency 2 and 0, titled `16x16 Medium` and `16x16 Hard`; and 12×12 at
leniency 0 in three colors and in four.

#### Scenario: The first preset is the default board

- **WHEN** the preset menu is read
- **THEN** its first entry is `12x12 Easy`, a 12×12 board in six colors with a
  leniency of 5

### Requirement: Flood refuses params it cannot deal

`validateParams` SHALL reject a grid with `w·h < 2`. A `colors` outside 3–10
and a negative `leniency` SHALL be refused too, by the engine, from the bounds
the game declares on those two fields in its `paramConfig`.

#### Scenario: A one-square grid is refused

- **WHEN** params with `w = 1` and `h = 1` are validated
- **THEN** `validateParams` refuses them, saying the grid must contain at
  least two squares

#### Scenario: Too many colors are refused

- **WHEN** params with `colors = 11` are checked
- **THEN** they are refused, naming the Colors field and its upper bound

### Requirement: A generated Flood board is completable within its move limit

A new board's grid SHALL NOT already be one color, and its move limit SHALL be
the number of fills the solver takes on that grid plus the leniency.

#### Scenario: A generated board is completable with its move limit

- **WHEN** a new game is created from any valid params
- **THEN** the grid is not already one color, and the move limit equals the
  solver's move count plus the leniency

### Requirement: Flood fill and solve moves transform state purely

A `FloodMove` SHALL be a fill carrying a color (`{ type: "fill", color }`) or a
solve (`{ type: "solve" }`). `executeMove` SHALL be pure: a fill floods the
corner region to the chosen color and increments the move count, and a solve
SHALL run the solver and apply its fills to reach the solved grid.

#### Scenario: A fill floods the corner region

- **WHEN** a fill move with a color adjacent to the controlled region executes
- **THEN** the corner region and all newly-adjacent same-color squares become
  that color, the move count increases by one, and the source state is unmutated

#### Scenario: Solve snaps to a completed grid

- **WHEN** the solve move executes
- **THEN** the grid becomes a single color and the game reports itself solved
  with help

### Requirement: Flood input fills with the chosen square's color

`interpretMove` SHALL produce a fill only when the clicked or cursor-selected
cell's color differs from the current corner color and the game is not
complete. Cursor keys SHALL move the cursor, clamped to the grid.

#### Scenario: A fill that does not change the corner color is rejected

- **WHEN** input targets a cell whose color equals the current corner color
- **THEN** no move is produced

### Requirement: Flood's Solve refuses a finish past the move limit

Solve SHALL refuse, saying no solution can be found from this position, when
the solver's fills would take the move count past the limit, since that grid
is a loss.

#### Scenario: Solve refuses a finish past the move limit

- **WHEN** the moves already spent plus the solver's fills exceed the move limit
- **THEN** Solve refuses, and the board is unchanged

### Requirement: Flood's state records neither completion nor the solver

The state SHALL keep no record of completion or of the solver: the grid is
complete exactly when it is one color, and the engine records that Solve was
used.

#### Scenario: Completion is read off the grid

- **WHEN** a fill leaves every square one color
- **THEN** the state is complete, with no field of the state set to say so

### Requirement: Flood reports win and lose status

The Flood `status()` SHALL return `"solved"` when the grid is complete within the
move limit, `"lost"` when the move count reaches the limit before completing,
and `"ongoing"` otherwise.

#### Scenario: Exhausting the move limit loses

- **WHEN** the player makes the move that brings the move count up to the limit
  without completing the grid
- **THEN** `status()` returns `"lost"`

#### Scenario: Completing within the limit wins

- **WHEN** a fill completes the grid with the move count at or below the limit
- **THEN** `status()` returns `"solved"`

### Requirement: Flood's status bar counts moves against the limit

The status bar SHALL reflect the move count against the limit, opening with
`FAILED!` on a lost board, `COMPLETED!` on a board the player solved and
`Auto-solved` on one Solve finished.

#### Scenario: A lost board says so

- **WHEN** the move count reaches the limit with the grid not one color
- **THEN** the status bar opens with `FAILED!`, followed by the move count
  against the limit

### Requirement: Flood offers a solver-backed hint plan

The Flood `hint()` SHALL return the solver's whole remaining move sequence as a
multi-step plan: each step is a fill, narrated by its color and highlighting the
squares that fill will absorb.

#### Scenario: Hint plan completes the board

- **WHEN** `hint()` is requested on an unsolved board and each step's fill is
  applied in order
- **THEN** the fills are legal and the grid reaches a single color

### Requirement: Flood's hint plan follows the player's fills

`hintKeepTrack` SHALL advance the plan when the player makes the step's fill
and drop it otherwise.

#### Scenario: Following the plan keeps it; deviating drops it

- **WHEN** the player makes the current step's fill
- **THEN** `hintKeepTrack` reports it completed and the plan advances
- **AND** a different fill reports `"off"`

### Requirement: Flood draws a flat field of colored tiles

`redraw` SHALL draw the board as a field of flat tiles in the collection's ten
colors, with no bevel anywhere on it. Tiles of one region SHALL join with no
line between them, so a region reads as one area and the controlled region's
growth is the picture.

#### Scenario: The field has no bevel

- **WHEN** a board is drawn for the first time
- **THEN** every tile is a flat rectangle in its color

#### Scenario: A region is one area

- **WHEN** two orthogonally adjacent tiles have the same color
- **THEN** no line is drawn between them

### Requirement: Flood's regions and field are bounded by the thin grid line

Where two regions meet, and round the field, the line SHALL be the surface's
grid line, thin, and the frame SHALL be no heavier than the line between two
regions.

#### Scenario: The frame is as wide as a region's edge

- **WHEN** a board is drawn for the first time
- **THEN** the field is framed by a line in the grid's color, as wide as the
  line a tile draws at its region's edge

#### Scenario: Two regions are separated

- **WHEN** two orthogonally adjacent tiles have different colors
- **THEN** they are separated by the grid line

### Requirement: A mark on a Flood tile is black in both schemes

A mark drawn on a tile (the keyboard cursor's outline, the dot a hint puts on
each square the next fill joins, and the blink of a lost board) SHALL be black
in both schemes, since it is read against the tile and not against the board.

#### Scenario: The hint's dot in the dark scheme

- **WHEN** a hint step is shown on a board drawn in the dark scheme
- **THEN** the dot on each square the fill joins is black, as it is in the
  light scheme
