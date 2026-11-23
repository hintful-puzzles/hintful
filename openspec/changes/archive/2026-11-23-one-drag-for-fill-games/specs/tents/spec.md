## MODIFIED Requirements

### Requirement: Controls: Tents places tents and grass by click and drag

`interpretMove` SHALL start a one-cell drag on a left or right press, extend it
along the single nearer row or column, and enact it on release. A left click
SHALL set a blank square to a tent or clear a non-blank square; a right click
SHALL set a blank to a non-tent or clear a non-blank. A drag with either
button SHALL give every square it covers that held what the pressed square
held what the pressed square became. Trees SHALL never be modified.

#### Scenario: A left click toggles a tent

- **WHEN** a blank square is left-clicked, then left-clicked again
- **THEN** the square becomes a tent, then blank

#### Scenario: A right-drag paints non-tents

- **WHEN** the right button is dragged across a row of blank squares
- **THEN** every covered blank square becomes a non-tent

#### Scenario: A left-drag places tents along its line

- **WHEN** the left button is dragged across a row of blank squares, one of
  them already grass
- **THEN** every other covered square becomes a tent, and the grass is kept

### Requirement: Controls: A drag between a tree and the square beside it is the link gesture

A left drag between a tree and the square orthogonally beside it, in either
direction, SHALL be the link gesture when that square holds a tent or is
blank. It SHALL join the two, placing a tent on a blank square in the same
move, or part them when they are already joined, and SHALL change no other
square. A left drag that is not the link gesture SHALL be the drag every fill
game makes.

#### Scenario: A drag from a tree to a blank square places its tent joined

- **WHEN** the player left-drags from a tree onto the blank square beside it,
  or from that square onto the tree
- **THEN** the square becomes a tent joined to that tree, in one move
