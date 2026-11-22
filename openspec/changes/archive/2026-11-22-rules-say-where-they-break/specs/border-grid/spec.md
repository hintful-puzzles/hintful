## MODIFIED Requirements

### Requirement: A border-grid game takes the mechanic from the engine and owns no copy

A game that marks a grid's edges SHALL take the mechanic from the shared
engine modules and own no copy: the edge bits and
direction tables, the nearest-edge hit test,
the three-state toggle, the paired edit of an edge's two cells, the half-cell
cursor, and its look: the geometry, the edge rects, the tile skeleton and how
a live error shows. Which edges are wrong SHALL be what the game's rules
report (`Game.rules`), so a change to how they read a region reaches every
such game.

#### Scenario: A fix to the shared mechanic reaches both games

- **WHEN** a defect is found in the edge hit test, the three-state toggle or
  the reading of a region the walls close off
- **THEN** it is fixed once in the shared module
- **AND** both Palisade and Separate receive the fix, rather than one game
  silently retaining the defect

#### Scenario: Both games' edits come from the shared module

- **WHEN** a click and a cursor key address the same interior edge in Separate
- **THEN** both produce the paired edits the shared module computes for that
  edge

#### Scenario: The error model is the shared module's

- **WHEN** the player's no-wall marks join more than `k` cells in Separate
- **THEN** the edges between that region and its neighbors are drawn in the
  error color, from the violations Separate's rules report, not from a test
  of Separate's own

### Requirement: The board reddens an edge beside a group joined past the region size

The error marks SHALL be read from the borders as they stand and the game's
region size `k`. They SHALL redden an interior edge, whatever state the edge
holds, between two cells that the player's no-wall marks do not join, where
either is one of more than `k` cells that no-wall marks join. An undecided
edge joins nothing, so over-size SHALL be measured on what the no-wall marks
commit to and never on a region the walls have yet to close.

#### Scenario: An undecided edge round an over-large group is reddened

- **WHEN** the player's no-wall marks join more than `k` cells of Palisade
- **THEN** every interior edge between that group and a cell outside it is
  drawn in the error color, the undecided ones included
- **AND** the no-wall marks inside the group keep their own color

#### Scenario: A board with no no-wall mark has no over-size error

- **WHEN** a new board holds only its rim walls, so the whole grid is one
  region the walls bound
- **THEN** no edge is reddened

### Requirement: The board reddens a wall beside an undersized region and a wall that divides nothing

The error marks SHALL redden a wall between two regions the walls bound,
where either holds fewer than `k` cells. They SHALL redden a wall that
divides nothing: one between two cells the no-wall marks join, or between two
cells of one wall-bounded region of at most `k` cells, whose undecided edges
the rules read as no wall, since a region holding any of its cells is the
whole of it. The rim SHALL never be reddened. An edge the game's Check & Save
flags SHALL be drawn in the same error color.

#### Scenario: An undersized region reddens its walls

- **WHEN** the player's walls enclose a region of fewer than `k` cells
- **THEN** the walls between that region and its neighbors are drawn in the
  error color, and the stretch of rim that bounds it is not

#### Scenario: A wall inside a region still too large is not an error

- **WHEN** the player draws one wall on a new board, which cuts nothing off
  the one region of more than `k` cells that the rim bounds
- **THEN** the wall is drawn as a wall, since the region is still being
  divided

#### Scenario: A wall left inside a finished region is reddened

- **WHEN** a wall-bounded region holds exactly `k` cells and a wall lies
  between two of them
- **THEN** that wall is drawn in the error color
