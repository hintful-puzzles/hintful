## MODIFIED Requirements

### Requirement: A grid game imports the coordinate helpers

A game, and a helper games share, SHALL take the cell a pixel falls in from
`fromCoord` and SHALL NOT write its division out again. The one
override folds a press in the top or left margin onto the first row or column
the game draws there, where `fromCoord` answers one further out: a game that
takes it SHALL say so at its own conversion and name `fromCoord` as what it
declines. A position that keeps its fraction of a tile, and a change of scale
to a tiling's units, are not this mapping.

#### Scenario: A game fixes its border in a wrapper

- **WHEN** a game's border is a function of the tile size
- **THEN** its own `fromCoord(pixel, tileSize)` calls the engine's with that
  border, and holds no division of its own

#### Scenario: A game folds a margin press onto the first cell

- **WHEN** a game needs a press in the top or left margin to land on row or
  column 0
- **THEN** its conversion truncates toward zero, and the comment on it says
  that the truncation is what folds the press onto the first cell

#### Scenario: Only the outline folds

- **WHEN** a game gives the first square the pixels of the outline drawn
  before it and no more of the margin, as Rome does
- **THEN** its conversion floors, holds the outline's pixels to row or column
  0, and its comment names `fromCoord` as declined for those pixels

#### Scenario: Everything before the board is one index

- **WHEN** a game wants one answer for any pixel above or left of its board,
  as Tracks and Ascent do
- **THEN** it bounds what `fromCoord` returns, and holds no division of its
  own

#### Scenario: A change of scale

- **WHEN** Loopy turns a pointer's pixels into its tiling's units to find the
  nearest edge, or a tiling's extent into pixels
- **THEN** the division is its own, being no cell index

#### Scenario: A tile size under another name

- **WHEN** a conversion divides by a tile size the code calls something other
  than `ts`, `tile` or `tileSize`
- **THEN** the cross-game guard does not see it, which is the bound of what
  it measures: it recognizes the tile size by the names it goes by

#### Scenario: A legend sits between the margin and the grid

- **WHEN** a game draws a row and a column of headings outside its grid, and a
  press in the margin beyond them is to grab the heading beside it
- **THEN** its truncating conversion answers the heading's index for both, and
  its comment names `fromCoord` as declined

#### Scenario: A game reads where in a tile the pointer is

- **WHEN** a game tells a tile's corner from its edge from its center by the
  pointer's fraction of a tile, as Rect and Galaxies do
- **THEN** it divides for itself and says that `fromCoord` would floor the
  fraction away
- **AND** a game that wants the tile as well, as Net does, takes the tile from
  `fromCoord` and the fraction from its own division

### Requirement: The engine catalog names every shared helper there is

`docs/games/engine-catalog.md` SHALL name every module directly under
`src/engine/`, and every directory of modules under it as one entry, so the
menu an author consults cannot silently shrink. A module without one SHALL be in a ledger with its reason, which SHALL fail when it
names a module that no longer exists. The check SHALL run in the
gate's fast prefix, ahead of the documentation-only shortcut, and SHALL NOT be
a vitest file: a test that read `docs/` would make that shortcut unsafe.

#### Scenario: A new engine module ships without a catalog entry

- **WHEN** a module is added under `src/engine/` and the catalog is not updated
- **THEN** the gate fails, naming the module and pointing at the catalog

#### Scenario: A documentation-only commit deleting an entry is still checked

- **WHEN** a commit touches only `docs/` and removes a module's catalog entry
- **THEN** the check still runs, because it sits ahead of the
  documentation-only shortcut

#### Scenario: A file is added inside a directory the catalog names

- **WHEN** a module is added to `src/engine/grid/`, which the catalog names as
  one entry
- **THEN** the check passes with no new entry, since the file is a part of
  that helper
