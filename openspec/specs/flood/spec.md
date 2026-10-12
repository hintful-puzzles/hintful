# flood Specification

## Purpose
Flood, the puzzle of turning the whole grid one color within a move limit by
repeatedly flood-filling from the top-left corner. This capability specifies
what is the game's own: its params encoding and limits, what a dealt board
promises, what a fill does and when one is offered, winning and losing, the
status bar, the solver's hint plan, and how the board is drawn.

## Requirements

### Requirement: Rules: A Flood fill recolors the corner region and costs one move

The board is a `w×h` grid of colored squares, and the controlled region is the
one holding the top-left corner. A fill SHALL turn that region the chosen
color, joining to it every square of that color it then touches, and SHALL
count one move. Solve SHALL apply the solver's fills, each counted as a move.

#### Scenario: A fill floods the corner region

- **WHEN** a fill move with a color adjacent to the controlled region executes
- **THEN** the corner region and all newly-adjacent same-color squares become
  that color, and the move count increases by one

### Requirement: Rules: Flood reports win and lose status

The Flood `status()` SHALL return `"solved"` when the grid is complete within the
move limit, `"lost"` when the move count reaches the limit before completing,
and `"ongoing"` otherwise. The grid is complete exactly when it is one color.

#### Scenario: Exhausting the move limit loses

- **WHEN** the player makes the move that brings the move count up to the limit
  without completing the grid
- **THEN** `status()` returns `"lost"`

#### Scenario: Completing within the limit wins

- **WHEN** a fill completes the grid with the move count at or below the limit
- **THEN** `status()` returns `"solved"`

### Requirement: Params: Flood params are a size, a color count and a leniency

Params SHALL be `w`, `h`, `colors` and `leniency`, the leniency being the
moves allowed beyond the solver's own count. They SHALL be encoded `WxH`, with
`c{colors}m{leniency}` appended when `full`. A bare `W` SHALL decode as a
square `W×W` board.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 12, h: 12, colors: 6, leniency: 5 }` are encoded with
  `full = true`
- **THEN** the result is `12x12c6m5`
- **AND** decoding `12x12c6m5` round-trips, and a bare `12` decodes to a 12×12
  board with the default colors and leniency

### Requirement: Params: Flood refuses params it cannot deal

`validateParams` SHALL reject a grid with `w·h < 2`. A `colors` outside 3–10
and a negative `leniency` SHALL be refused too.

#### Scenario: A one-square grid is refused

- **WHEN** params with `w = 1` and `h = 1` are validated
- **THEN** `validateParams` refuses them, saying the grid must contain at
  least two squares

#### Scenario: Too many colors are refused

- **WHEN** params with `colors = 11` are checked
- **THEN** they are refused, naming the Colors field and its upper bound

### Requirement: Params: Flood's Easy, Medium and Hard name the extra moves

The preset titles Easy, Medium and Hard SHALL name how many moves the limit
allows beyond the solver's own count, and no difficulty tier: Easy is 5 extra
moves, Medium 2 and Hard none. A preset with another number of colors SHALL
be titled by its size and its colors, and gives no extra moves.

#### Scenario: Two presets of one size

- **WHEN** the presets `12x12c6m2` and `12x12c6m0` are listed
- **THEN** the first is titled `12x12 Medium` and the second `12x12 Hard`

#### Scenario: A three-color board

- **WHEN** the preset `12x12c3m0` is listed
- **THEN** its title is `12x12, 3 colors`, with no word for its lack of extra
  moves

### Requirement: Description: Flood descriptions are a digit a square and the move limit

A Flood description SHALL be one decimal digit for each square in reading
order, the square's color counted from 0, then a comma and the move limit in
decimal. `newState` SHALL refuse a digit that is not below the params' color
count, too few or too many squares, a missing limit and anything after it.
The colors a fill may use SHALL be counted from the board, one more than the
highest digit it holds, and not from the params.

#### Scenario: A dealt 12×12 board

- **WHEN**
  `112134144412112311041120154311140123340134132014315015100513422150022300251115244430040030540540412042102523025541112531014244505101425240325120,23`
  is opened under `12x12c6m5`
- **THEN** the top row begins with colors 1, 1, 2, 1, 3 and 4, the board has
  six colors, and the status bar reads `0 / 23 moves`

#### Scenario: A board with more colors than the params allow

- **WHEN** that description is opened under `12x12c3m0`
- **THEN** it is refused, since it holds digits of 3 and above

#### Scenario: A digit outside the colors

- **WHEN** the first digit of that description is changed from `1` to `6` and
  it is opened under `12x12c6m5`
- **THEN** it is refused as holding a number out of range

### Requirement: Generation: A generated Flood board is completable within its move limit

A new board's grid SHALL NOT already be one color, and its move limit SHALL be
the number of fills the solver takes on that grid plus the leniency.

#### Scenario: A generated board is completable with its move limit

- **WHEN** a new game is created from any valid params
- **THEN** the grid is not already one color, and the move limit equals the
  solver's move count plus the leniency

### Requirement: Solver: Flood's Solve refuses a finish past the move limit

Solve SHALL refuse, saying no solution can be found from this position, when
the solver's fills would take the move count past the limit, since that grid
is a loss.

#### Scenario: Solve refuses a finish past the move limit

- **WHEN** the moves already spent plus the solver's fills exceed the move limit
- **THEN** Solve refuses, and the board is unchanged

### Requirement: Controls: Flood input fills with the chosen square's color

`interpretMove` SHALL produce a fill only when the clicked or cursor-selected
cell's color differs from the current corner color and the game is not
complete.

#### Scenario: A fill that does not change the corner color is rejected

- **WHEN** input targets a cell whose color equals the current corner color
- **THEN** no move is produced

### Requirement: Hint: Flood offers a solver-backed hint plan

The Flood `hint()` SHALL return the solver's whole remaining move sequence as a
multi-step plan: each step is a fill, narrated by its color and highlighting the
squares that fill will absorb.

#### Scenario: Hint plan completes the board

- **WHEN** `hint()` is requested on an unsolved board and each step's fill is
  applied in order
- **THEN** the fills are legal and the grid reaches a single color

### Requirement: Hint: Flood's hint plan follows the player's fills

`hintKeepTrack` SHALL advance the plan when the player makes the step's fill
and drop it otherwise.

#### Scenario: Following the plan keeps it; deviating drops it

- **WHEN** the player makes the current step's fill
- **THEN** `hintKeepTrack` reports it completed and the plan advances
- **AND** a different fill reports `"off"`

### Requirement: Hint: Flood's hint refuses a grid flooded after the limit

A grid that became one color only after the move limit is lost and has no
fill left to make. The hint SHALL refuse it, saying the game is over and to
undo or start a new one. On a lost board whose grid is not yet one color the
hint SHALL still give the solver's remaining fills.

#### Scenario: The grid is finished one move late

- **WHEN** the fill that makes the grid one color is the first past the limit,
  and a hint is asked
- **THEN** the hint refuses, saying `This game is over. Undo to play on, or
  start a new one.`

### Requirement: Status bar: Flood's status bar counts moves against the limit

The status bar SHALL give the move count against the limit, opening with
`FAILED!` on a lost board.

#### Scenario: A lost board says so

- **WHEN** the move count reaches the limit with the grid not one color
- **THEN** the status bar opens with `FAILED!`, followed by the move count
  against the limit

### Requirement: Look: Flood draws a flat field of colored tiles

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

### Requirement: Look: Flood's regions and field are bounded by the thin grid line

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

### Requirement: Look: A mark on a Flood tile is black in both schemes

A mark drawn on a tile (the keyboard cursor's outline, the dot a hint puts on
each square the next fill joins, and the blink of a lost board) SHALL be black
in both schemes, since it is read against the tile and not against the board.

#### Scenario: The hint's dot in the dark scheme

- **WHEN** a hint step is shown on a board drawn in the dark scheme
- **THEN** the dot on each square the fill joins is black, as it is in the
  light scheme
