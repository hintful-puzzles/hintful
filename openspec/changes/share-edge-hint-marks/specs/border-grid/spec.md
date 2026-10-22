# border-grid Specification Delta — share-edge-hint-marks

## MODIFIED Requirements

### Requirement: The board reddens a wall beside an undersized region and a wall that divides nothing

The shared error model SHALL redden a wall between two regions the walls
bound, where either holds fewer than `k` cells. It SHALL redden a wall that
divides nothing: one between two cells the no-wall marks join, or between two
cells of one wall-bounded region of at most `k` cells. The rim SHALL never be
reddened. An edge the game's Check & Save flags SHALL be drawn in the same
error color.

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

## ADDED Requirements

### Requirement: An edge a hint decides is drawn as what it must become

An edge a displayed hint rings SHALL be drawn as the step says it must
become: one that must be a wall as the edge in the hint's color, over its
other states; one that can't be a wall as a cross in the hint's color on the
edge, which SHALL keep its own color, so that the two asks never look alike.

#### Scenario: A step that rules out a wall crosses the edge

- **WHEN** a hint step says an undecided edge can't be a wall
- **THEN** the edge is drawn undecided, with a cross in the hint's color on
  it, and nothing of it in the hint's color is drawn as a wall
