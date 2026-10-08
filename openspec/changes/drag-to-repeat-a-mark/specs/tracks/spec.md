## MODIFIED Requirements

### Requirement: Tracks input maps drag, click and cursor

`interpretMove` SHALL support: a left-drag that starts near a cell center and
paints track along a single straight row or column (right-drag paints
no-track), toggling based on the drag-start cell's current state; a drag that
starts near a cell edge, which does to every edge it crosses that held what
the first held what a click does to the first (a left-drag lays track
segments, a right-drag no-track crosses), turning corners freely, as one
step of Undo; a click near a cell center that toggles the
square's track (or no-track on right-click); a click near a cell edge that
toggles that edge's track (or no-track); and a half-grid keyboard cursor whose
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
