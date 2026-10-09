# samegame Specification

## Purpose
Same Game, the puzzle of clearing a `w×h` grid of colored tiles by removing
orthogonally-connected groups of one color, scoring more for larger groups.
This capability holds the game's own rules: its params and description
encodings, the promise that a dealt board can be cleared, removal with scoring
and compaction, what a stuck board is, the two-click selection and its keys,
the status bar's words, and how the board is drawn.

## Requirements

### Requirement: Same Game's params are a size, a color count and a scoring system

Params SHALL be `w`, `h`, `ncols` and `scoresub` (1 or 2), encoded
`{w}x{h}c{ncols}s{scoresub}` with lenient decode. Decoding SHALL leave a
trailing `r` unread, the letter that asks for colors scattered at random with
no promise the grid can be cleared, and encoding SHALL never write it.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 15, h: 10, ncols: 4, scoresub: 2 }` are
  encoded with `full = true`
- **THEN** the result is `15x10c4s2`
- **AND** decoding `15x10c4s2` round-trips those params
- **AND** decoding `15x10c4s2r` yields the same params

### Requirement: Same Game does not turn its board

Tiles fall down and emptied columns close leftward, so a board of Same Game
SHALL NOT declare `transposeParams`: a tall board is a different game from a
wide one, not the same one turned.

#### Scenario: A tall board stays tall

- **WHEN** a `5×10` board is dealt for a window wider than it is tall
- **THEN** the board dealt is 5 wide and 10 tall

### Requirement: Same Game refuses params it cannot deal

Params SHALL be refused unless `w ≥ 1`, `h ≥ 1`, `3 ≤ ncols ≤ 9`,
`scoresub ∈ {1,2}` and `w·h > 1`.

#### Scenario: Invalid params are rejected

- **WHEN** the engine's params check is given `ncols: 2`, `ncols: 10`,
  `scoresub: 3`, or a `1×1` grid
- **THEN** it returns a non-null error string

### Requirement: Same Game removes connected groups, scores, and compacts

A `SamegameMove` SHALL be `{ type: "remove"; tiles: number[] }` carrying the grid
indices to clear. `executeMove` SHALL range-check each index, set those tiles
empty, add `max(0, n − scoresub)²` to the score (where `n` is the number of
removed tiles), let remaining tiles fall to the bottom of their columns, and
shuffle non-empty columns to the left.

#### Scenario: Removing a group scores and compacts

- **WHEN** a `remove` move clearing a group of 4 tiles is executed with
  `scoresub = 2`
- **THEN** the new state's score increases by `(4 − 2)² = 4`
- **AND** tiles above the cleared cells have fallen and empty columns have moved
  right

#### Scenario: An index off the grid is refused

- **WHEN** a `remove` move carries an index outside `0..w·h − 1`
- **THEN** `executeMove` throws

### Requirement: A Same Game board with no move left is impossible, not lost

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

### Requirement: A first click in Same Game selects the group

`interpretMove` SHALL implement the two-click select-then-remove gesture using a
selection held in `SamegameUi` (not in the game state). Clicking a removable tile
(part of a same-color group of size ≥ 2) SHALL flood-select the connected region
and return a UI update. Clicking an empty or lone tile SHALL select nothing.
`changedState` SHALL clear the selection on every real transition.

#### Scenario: A lone tile cannot be selected

- **WHEN** a tile with no same-color orthogonal neighbor is clicked
- **THEN** no selection is made and no `remove` move is produced

#### Scenario: The selection clears across a move

- **WHEN** a `remove` move is applied
- **THEN** `changedState` leaves the Ui with no active selection

### Requirement: A second click on the selection removes it

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

### Requirement: Same Game's keyboard cursor acts where it stands

A keyboard cursor SHALL move with the cursor keys, and a select key SHALL act
on the tile at the cursor as a click there does.

#### Scenario: Select at the cursor picks the group, then removes it

- **WHEN** the cursor stands on a removable tile and `CURSOR_SELECT` is pressed
- **THEN** the tile's connected same-color region is selected
- **WHEN** `CURSOR_SELECT` is pressed again
- **THEN** `interpretMove` returns the `remove` move for that region

### Requirement: Same Game's status bar shows the score

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

### Requirement: Same Game generates boards that can be cleared

Every board `newDesc` deals SHALL be one that some order of removals empties.
No parameter SHALL deal a grid that may not be clearable.

#### Scenario: A generated description is well-formed

- **WHEN** `newDesc` runs for a preset with a fixed seed
- **THEN** `validateDesc` accepts it and `newState` parses `w·h` tiles

### Requirement: A Same Game description is one color for every tile

A desc SHALL be the tiles' colors in row-major order, comma-separated. A desc
without exactly `w·h` integers, or with any integer outside `1..ncols`, SHALL
be refused: a dealt board is full, so no desc names an empty cell. `newState` SHALL parse the desc into the tile grid with score
0, and SHALL read `impossible` off the tiles.

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc with too few numbers, or one
  containing a color greater than `ncols`
- **THEN** it returns a non-null error string

#### Scenario: An empty cell is rejected

- **WHEN** `validateDesc` is given `1,0,3` for a `3×1` board
- **THEN** it returns a non-null error string

### Requirement: Same Game draws flat tiles on a quiet field

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

### Requirement: A selected tile is white with its color at its middle

A selected tile SHALL be drawn with a white body and its color at its middle,
white in both schemes, so the selected group stands off the field and off its
unselected neighbors in the dark scheme as in the light one.

#### Scenario: A selected tile is white in both schemes

- **WHEN** a tile is part of the selected group
- **THEN** its body is drawn in a white that the dark scheme does not invert
- **AND** its own color is drawn at its middle

### Requirement: The cursor and a stuck board are marked on the tile

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

### Requirement: Same Game's flash lifts the field and leaves the tiles

The flash SHALL lift the whole field, the margin inside the frame included, to
the lifted surface on its lit beats, leaving the tiles standing.

#### Scenario: A lit beat

- **WHEN** the board is drawn on a lit beat of the flash
- **THEN** the emptied cells, the gaps and the margin inside the frame are
  drawn in the lifted surface
- **AND** every tile keeps its color
