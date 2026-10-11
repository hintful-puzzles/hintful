## ADDED Requirements

### Requirement: A Netslide params string with no `b` asks for no barriers

Decoding SHALL read a string with no `b` as a barrier probability of 0,
though the default params have 1. The letters SHALL be read once each in the
order `w`, `b`, `m`, one out of that order being ignored, and a bare `{n}`
SHALL be a square grid that takes none of them.

#### Scenario: The default and the preset beside it

- **WHEN** the default params are encoded in full, and `3x3` is decoded
- **THEN** the first is `3x3b1`, a grid with every barrier drawn, and the
  second is a 3×3 grid with no barrier inside it and no wrapping

### Requirement: Netslide refuses a grid past a million squares

`validateParams` SHALL refuse a grid of more than 1,000,000 squares, in the
engine's words for an area too large, and SHALL refuse nothing else: a side
under 2 is refused by the bound its field declares.

#### Scenario: Either side of the bound

- **WHEN** a 1000×1000 and a 1000×1001 grid are validated
- **THEN** the first is admitted and the second refused

### Requirement: A Netslide arrow slides its line toward its own edge

A left click in the gutter left of a row SHALL slide the row left, and one
right of it right; above a column up, and below it down. The right button
SHALL slide the other way. Enter and Space SHALL both slide as the left
button does, and the first of them on a hidden cursor SHALL only show it.

#### Scenario: The arrow left of a row

- **WHEN** the player left-clicks the gutter left of a row
- **THEN** every tile of the row moves one place left and its leftmost tile
  comes back at the right end

### Requirement: A Netslide journey opens on the first reason that holds

The step that opens a journey SHALL say that the source's row, or column,
never slides where its tile sits in that line and the slide crosses it;
failing that, that the tile belongs beside the source where the journey ends
on a square sharing a side with the source and the finished grid wants the
tile's wires there; and failing that, only where the slide takes the tile. A
later leg SHALL say that it takes the tile on.

#### Scenario: A tile in the source's row that belongs beside the source

- **WHEN** a journey opens by sliding a column to shift a tile that sits in
  the source's row, and ends on a square beside the source where the tile
  belongs
- **THEN** the opening step says "This row never slides", and not that the
  tile belongs beside the source

### Requirement: Netslide's preset titles name the help the barriers give

A preset SHALL be titled by its size and one of three words: `hard` where the
grid wraps, `easy` where it does not and the barrier probability is 1, and
`medium` otherwise. The words name no tier: Netslide has none, every board is
dealt the same way, and a board is harder only for showing fewer walls.

#### Scenario: The three 3×3 presets

- **WHEN** the preset menu is read
- **THEN** "3x3 easy" is `3x3b1`, "3x3 medium" is `3x3` and "3x3 hard" is
  `3x3w`

### Requirement: Netslide's status bar reads moves, then the target, then the tiles lit

The status bar SHALL read `Moves: {n}`, then ` (target {t})` where the params
set a move target, then ` Active: {lit}/{w·h}`, the tiles lit from the source
over every tile of the grid.

#### Scenario: A board as dealt, with and without a target

- **WHEN** `26dh2vhb49cv1` is opened on a 3×3 grid
- **THEN** the status bar reads "Moves: 0 Active: 2/9"
- **AND** opened under `3x3b1m7`, the same params with a target of 7, it
  reads "Moves: 0 (target 7) Active: 2/9"
