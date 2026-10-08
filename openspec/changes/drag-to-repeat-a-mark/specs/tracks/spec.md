## MODIFIED Requirements

### Requirement: Tracks input maps drag, click and cursor

`interpretMove` SHALL support: a left-drag that starts near a cell center and
paints track along a single straight row or column, and a right-drag from
anywhere in a cell that paints no-track the same way, each toggling based on
the drag-start cell's current state; a left-drag that starts near a cell edge,
which does to every edge it crosses that held what the first held what a
click does to the first, laying track segments or taking them away, turning
corners freely, as one step of Undo; a left-click near a cell center that
toggles the square's track, and one near a cell edge that toggles that edge's
track; a right-click that toggles no-track on the square, except on the strip
along an edge, an eighth of a tile either side of its line and never under
four pixels, where it toggles no-track on that edge. A right-drag SHALL NOT
mark an edge: a run of crosses on edges is no use to a player; and a half-grid keyboard cursor whose
select toggles a square (at a cell center) or an edge (on a cell border), with
select2 toggling no-track. Moves that would change nothing, and interactions
outside the grid, SHALL produce no history move.

#### Scenario: A drag lays a straight run of track

- **WHEN** the player left-drags across three cells of one row from the
  center of a blank start
- **THEN** those three cells are marked as track

#### Scenario: A drag from an edge lays a run of segments

- **WHEN** the player presses the left button on the edge between two blank
  squares and drags through the centers of the next two squares in the row
- **THEN** the pressed edge and the two edges crossed each carry a track
  segment
- **AND** one Undo removes all three

#### Scenario: A right-click crosses the square unless it is on an edge

- **WHEN** the player right-clicks a blank square well off its middle and
  short of the strip along its edge
- **THEN** the square is marked no-track
- **AND WHEN** the player right-clicks two pixels inside the square's side
- **THEN** that edge is marked no-track and the square is not

#### Scenario: A right-drag from an edge's strip crosses squares

- **WHEN** the player presses the right button on the strip along an edge and
  drags along the row
- **THEN** the squares of the run are marked no-track, and no edge is

#### Scenario: A no-op interaction produces no move

- **WHEN** a right-drag (no-track) covers only cells that already hold track,
  so no flag can change
- **THEN** `interpretMove` returns no history move

#### Scenario: A drag that drifts out of bounds keeps its last valid extent

- **WHEN** an in-progress straight drag is continued to a position on neither
  the start row nor the start column (e.g. the pointer wanders off the grid)
- **THEN** the drag stays active with its last valid extent frozen (rather
  than resetting to the start cell, as upstream did), and resumes when the
  pointer returns to the start row/column
