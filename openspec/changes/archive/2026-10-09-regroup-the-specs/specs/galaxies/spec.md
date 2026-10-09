## MODIFIED Requirements

### Requirement: Galaxies has a plain-text format

The game SHALL provide a plain-text format of the board.

#### Scenario: The board is copied as text

- **WHEN** the board is asked for as text
- **THEN** each dot is an `o`, each grid vertex with no dot a `+`, each set
  edge a `|` or a `-`, and each tile associated with a dot a `W` or a `B` for
  that dot's color
- **AND** an edge that is not set and a tile with no association are spaces

### Requirement: Candidate dots are ringed during a cell-to-dot drag, by preference

While a cell-to-dot drag is in progress, every dot the cell could legally join
SHALL be ringed and the picked one emphasized. Under the key `galaxies-show-drag-candidates`, on by default, the rings SHALL be subject to a
preference, because they are a solving aid. The gesture SHALL NOT be gated by
that preference.

#### Scenario: Candidate dots are ringed, and can be switched off

- **WHEN** a cell-to-dot drag is in progress
- **THEN** exactly the dots a release could legally commit to are ringed, the
  picked one more heavily, and the rings are erased when the drag ends
- **AND WHEN** the candidate preference is off
- **THEN** no rings are drawn, and the drag and its commit preview are
  unaffected

### Requirement: Galaxies highlights the mistakes it finds

Galaxies SHALL render the flagged tiles and walls with a distinct mistake
highlight.

#### Scenario: A flagged tile and a flagged wall are lit

- **WHEN** mistake checking has flagged a tile and a wall
- **THEN** the renderer highlights the tile, and draws the wall in the mistake
  color
