# samegame Specification

## Purpose
Same Game, the puzzle of clearing a `w×h` grid of colored tiles by removing
orthogonally-connected groups of one color, scoring more for larger groups.
This capability holds the game's own rules: its params and description
encodings, the promise that a dealt board can be cleared, removal with scoring
and compaction, what a stuck board is, the two-click selection and its keys,
the status bar's words, and how the board is drawn.

## Requirements

### Requirement: Rules: Same Game removes connected groups, scores, and compacts

A `SamegameMove` SHALL be `{ type: "remove"; tiles: number[] }` carrying the grid
indices to clear. `executeMove` SHALL range-check each index, set those tiles
empty, add `max(0, n − scoresub)²` to the score (where `n` is the number of
removed tiles), let remaining tiles fall to the bottom of their columns, and
close up the non-empty columns to the left, keeping their order.

#### Scenario: Removing a group scores and compacts

- **WHEN** a `remove` move clearing a group of 4 tiles is executed with
  `scoresub = 2`
- **THEN** the new state's score increases by `(4 − 2)² = 4`
- **AND** tiles above the cleared cells have fallen and empty columns have moved
  right

#### Scenario: An index off the grid is refused

- **WHEN** a `remove` move carries an index outside `0..w·h − 1`
- **THEN** `executeMove` throws

### Requirement: Rules: A Same Game board with no move left is impossible, not lost

`executeMove` SHALL recompute `impossible` after compacting: no two
orthogonally-adjacent tiles share a color. `status` SHALL return `"solved"`
when the grid is empty and otherwise `"ongoing"`. A position with no move left
SHALL NOT be `"lost"`, because Undo rescues it.

#### Scenario: Clearing the last tiles wins

- **WHEN** a `remove` move empties the final non-empty tiles
- **THEN** the new state's grid is empty and `status()` returns `"solved"`

#### Scenario: A stuck board is impossible but not lost

- **WHEN** a state has no two orthogonally-adjacent same-color tiles and is not
  empty
- **THEN** that state's `impossible` flag is set and `status()` returns
  `"ongoing"`

### Requirement: Params: Same Game refuses params it cannot deal

`validateParams` SHALL refuse fewer than three colors, and a grid of a single
square.

#### Scenario: Two colors, and one square

- **WHEN** the engine's params check is given two colors, or a `1×1` grid
- **THEN** it answers "Number of colors must be at least three." for the
  first and "Grid area must be greater than one." for the second

### Requirement: Params: Same Game refuses an area too large to count

`validateParams` SHALL refuse a `w·h` past the largest whole number the app
counts exactly, in the collection's sentence "Width times height must not be
unreasonably large."

#### Scenario: A height of sixteen digits

- **WHEN** the preset `5x5c3s2` has its height changed to `9007199254740993`
- **THEN** the params are refused with "Width times height must not be
  unreasonably large."

### Requirement: Params: Same Game writes its params whole in both encodings

The short encoding SHALL be the full one: the color count and the scoring
system are part of the board a game ID names, and neither SHALL be left out.
A string with no `c` SHALL decode with three colors, and one with no `s` with
the `(n-2)²` scoring, `s2`.

#### Scenario: A preset, short and full

- **WHEN** the preset `5x5c3s2` is decoded and encoded again
- **THEN** its short encoding and its full one are both `5x5c3s2`

#### Scenario: A size alone

- **WHEN** the `c3s2` is taken off the preset `5x5c3s2`, leaving `5x5`
- **THEN** it decodes as a 5×5 board in three colors scored `(n-2)²`, which
  encodes as `5x5c3s2`

### Requirement: Params: Same Game reads upstream's r and sets nothing

The `r` upstream writes for colors scattered at random, with no promise the
grid can be cleared, SHALL be read and SHALL set nothing.

#### Scenario: A string upstream wrote for a random grid

- **WHEN** `15x10c4s2r` is decoded
- **THEN** it is the 15×10 board in four colors that `15x10c4s2` names, and it
  encodes as `15x10c4s2`

### Requirement: Description: A Same Game description is one color for every tile

A desc SHALL be the tiles' colors in row-major order, comma-separated. A desc
without exactly `w·h` integers, or with any integer outside `1..ncols`, SHALL
be refused: a dealt board is full, so no desc names an empty cell. `newState`
SHALL parse the desc into the tile grid with score 0, and SHALL read
`impossible` off the tiles.

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with too few numbers, or one
  containing a color greater than `ncols`
- **THEN** it returns a non-null error string

#### Scenario: An empty cell is rejected

- **WHEN** `validateDesc` is given `1,0,3` for a `3×1` board
- **THEN** it returns a non-null error string

### Requirement: Description: Same Game refuses a board that can never be cleared

`hasNoSolution` SHALL hold for a board with tiles left and no two
orthogonally-adjacent tiles of one color, and for a board on which a tile is
the only one of its color. It SHALL NOT hold for a cleared board. A dealt
board with a move SHALL load whether or not it can be cleared, and a game
played until no move is left SHALL open from its save.

#### Scenario: A board with no move

- **WHEN** the game ID `3x3c3s2:1,2,1,2,3,2,3,1,3` is opened, which has three
  tiles of every color and no two alike touching
- **THEN** it is refused with `DESC_NO_SOLUTION`
- **AND** it is refused alike under the other scoring, as `3x3c3s1`

#### Scenario: A lone tile of a color

- **WHEN** a board holds exactly one tile of some color
- **THEN** `hasNoSolution` holds, since a removal takes two or more of one
  color

#### Scenario: A board with one move

- **WHEN** the game ID `3x3c3s2:1,1,2,2,3,2,3,1,3` is opened, on which one
  pair touches
- **THEN** it loads

#### Scenario: A game played until it is stuck

- **WHEN** a player removes the only group of `3x2c3s2:1,1,3,2,3,2`, leaving
  no move, and the game is saved and opened again
- **THEN** it opens on the stuck position, and Undo brings the group back

### Requirement: Generation: Same Game generates boards that can be cleared

Every board `newDesc` deals SHALL be one that some order of removals empties.
No parameter SHALL deal a grid that may not be clearable.

#### Scenario: A dealt board can be emptied

- **WHEN** `newDesc` runs for a preset
- **THEN** the description parses to `w·h` tiles, and some order of removals
  from that board leaves the grid empty

### Requirement: Solver: Same Game's Solve empties the board

Same Game SHALL have a Solve, a move that empties the board and scores
nothing, given where a search clears the player's position or else the board
as dealt.

#### Scenario: Solve from a lost position

- **WHEN** the player's position cannot be cleared and the dealt board can
- **THEN** Solve empties the board

### Requirement: Controls: A first click in Same Game selects the group

`interpretMove` SHALL implement the two-click select-then-remove gesture using a
selection that is no move: selecting adds no step to Undo. Clicking a removable tile
(part of a same-color group of size ≥ 2) SHALL flood-select the connected region
and return a UI update. Clicking an empty or lone tile SHALL select nothing.
`changedState` SHALL clear the selection on every real transition.

#### Scenario: A lone tile cannot be selected

- **WHEN** a tile with no same-color orthogonal neighbor is clicked
- **THEN** no selection is made and no `remove` move is produced

#### Scenario: The selection clears across a move

- **WHEN** a `remove` move is applied
- **THEN** `changedState` leaves the Ui with no active selection

### Requirement: Controls: A second click on the selection removes it

Clicking again on the selection, with the left button or `CURSOR_SELECT`,
SHALL emit the `remove` move carrying the selected indices. Right-clicking the
selection, or `CURSOR_SELECT2` on it, SHALL clear it and return a UI update.

#### Scenario: First click selects, second click removes

- **WHEN** a removable tile is clicked
- **THEN** `interpretMove` returns a UI update, the connected same-color region
  is selected in the Ui, and `statusbarText` reports the selected count and its
  potential points
- **WHEN** a selected tile is then clicked again
- **THEN** `interpretMove` returns a `remove` move carrying the selected indices

#### Scenario: A right-click on the selection drops it

- **WHEN** a selected tile is right-clicked
- **THEN** `interpretMove` returns a UI update and no tile is selected

### Requirement: Controls: Same Game's keyboard cursor acts where it stands

A keyboard cursor SHALL move with the cursor keys, wrapping at the board's
edges, and a select key SHALL act on the tile at the cursor as a click there
does.

#### Scenario: Select at the cursor picks the group, then removes it

- **WHEN** the cursor stands on a removable tile and `CURSOR_SELECT` is pressed
- **THEN** the tile's connected same-color region is selected
- **WHEN** `CURSOR_SELECT` is pressed again
- **THEN** `interpretMove` returns the `remove` move for that region

### Requirement: Hint: Same Game has a hint that keeps the board clearable

Same Game SHALL have a hint. Each step SHALL offer a removal after which the
board can still be cleared, ring the group it removes, and say only what the
hint's search or a visible trap proves about it. It SHALL NOT speak of score.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Same Game board
- **THEN** a step rings a group to remove, and removing it leaves a board
  that can still be cleared

#### Scenario: A square the last of its color

- **WHEN** a player asks for a hint where a square is the last of its color
- **THEN** the hint refuses as a dead end and outlines that square

### Requirement: Status bar: Same Game's status bar shows the score

The status bar SHALL read `"Score: N"`, extended to
`"Score: N  Selected: K (P)"` while a region of `K` tiles worth
`P = max(0, K − scoresub)²` points is selected, and `"Cannot move! Score: N"`
when the board is impossible. On a cleared board `statusbarText` SHALL return
`"Score: N"`, which the engine's completion words precede:
`"COMPLETED! Score: N"`.

#### Scenario: A selection shows what it is worth

- **WHEN** a region of 3 tiles is selected on a board with `scoresub = 2` and
  a score of 0
- **THEN** the status bar reads `"Score: 0  Selected: 3 (1)"`

#### Scenario: A stuck board says so

- **WHEN** a board with a score of 4 has tiles left and no move
- **THEN** the status bar reads `"Cannot move! Score: 4"`

### Requirement: Look: Same Game draws flat tiles on a quiet field

`redraw` SHALL draw the board as flat tiles in the collection's colors standing
on the cell surface, with no bevel anywhere on it. Tiles of one group SHALL
join with no gap between them, and two tiles of different colors SHALL be
separated by a thin gap of the surface. An emptied cell SHALL be the plain
cell surface, with nothing drawn on it. The field SHALL be framed by the
surface's grid line, one pixel wide, standing one gap off the tiles.

#### Scenario: The field has no bevel

- **WHEN** a board is drawn for the first time
- **THEN** the field is a rectangle of the cell surface inside a one-pixel frame
  in the grid's color
- **AND** nothing on the board is a bevel

#### Scenario: An emptied cell is empty surface

- **WHEN** a cell holds no tile
- **THEN** it is drawn as the cell surface and nothing else

### Requirement: Look: A selected tile is white with its color at its middle

A selected tile SHALL be drawn with a white body and its color at its middle,
white in both schemes, so the selected group stands off the field and off its
unselected neighbors in the dark scheme as in the light one.

#### Scenario: A selected tile is white in both schemes

- **WHEN** a tile is part of the selected group
- **THEN** its body is drawn in a white that the dark scheme does not invert
- **AND** its own color is drawn at its middle

### Requirement: Look: The cursor and a stuck board are marked on the tile

The keyboard cursor SHALL be an outline inside the cell's edge: black on a
tile, in both schemes, and ink on an emptied cell. On a board with no move
left, every tile SHALL keep its color and take ink at its middle.

#### Scenario: The cursor on a tile is black

- **WHEN** the keyboard cursor stands on a tile of a board that has a move left
- **THEN** an outline is drawn inside the tile's edge in a black that the dark
  scheme does not invert

#### Scenario: A stuck board's tiles carry ink

- **WHEN** a board with tiles left and no move is drawn
- **THEN** every tile is drawn in its own color with ink at its middle

### Requirement: Look: Same Game's flash lifts the field and leaves the tiles

The completion flash, on a cleared board, SHALL sweep the field's cells, fill
a lit cell with a flash color and leave the margin inside the frame at rest.
The flash of a board with no move left is the game's own (`flashLength`) and
no win: on its lit beats it SHALL lift the whole field at once to the lifted
surface, the gaps and the margin included, and leave the tiles standing.

#### Scenario: A cleared board

- **WHEN** the last tiles are removed and frames of the flash are drawn
- **THEN** the first lit cell is the bottom-left one, every cell is lit on some
  frame, and the margin is never lit

#### Scenario: A lit beat

- **WHEN** a board with tiles left and no move is drawn on a lit beat
- **THEN** the emptied cells, the gaps and the margin inside the frame are
  drawn in the lifted surface
- **AND** every tile keeps its color
