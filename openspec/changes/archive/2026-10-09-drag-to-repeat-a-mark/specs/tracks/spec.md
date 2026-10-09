## MODIFIED Requirements

### Requirement: Tracks input maps drag, click and cursor

`interpretMove` SHALL support two drags, told apart by what the pressed square
holds and never by where in it the press lands. A left-drag from a square
that carries no track SHALL paint track along a single straight row or
column, and a right-drag from any square SHALL paint no-track the same way,
each toggling based on the drag-start cell's current state. A left-drag from
a square that carries track (the player marked it, or a segment reaches it)
SHALL mark no square: it SHALL do to every edge it crosses that held what the
first edge crossed held what a click does to that first edge, laying track
segments or taking them away, turning corners freely, as one step of Undo. A
right-drag SHALL NOT mark an edge: a run of crosses on edges is no use to a
player.

`interpretMove` SHALL also support: a left-click near a cell center that
toggles the square's track, and one near a cell edge that toggles that edge's
track; a right-click that toggles no-track on the square, except on the strip
along an edge, an eighth of a tile either side of its line and never under
four pixels, where it toggles no-track on that edge; and a half-grid keyboard
cursor whose select toggles a square (at a cell center) or an edge (on a cell
border), with select2 toggling no-track. Moves that would change nothing, and
interactions outside the grid, SHALL produce no history move.

#### Scenario: A drag lays a straight run of track

- **WHEN** the player left-drags across three cells of one row from a blank
  start, the press landing anywhere in the first cell
- **THEN** those three cells are marked as track, and no edge carries a
  segment

#### Scenario: A drag from a square that carries track lays segments

- **WHEN** the player left-drags from a square marked as track through the
  centers of the next two squares in the row
- **THEN** the two edges crossed each carry a track segment and no square mark
  changes
- **AND** one Undo removes both segments
- **AND WHEN** the player makes the same drag again
- **THEN** both segments are taken away

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

### Requirement: Tracks renders rails, clues, drag previews and the completion flash

`redraw` SHALL render, using the `NARROW_BORDERS` geometry (zero gutter, a
one-tile margin holding the clue numbers and the A/B entrance/exit labels):
straight rails drawn with sleepers, curved rails, no-track crosses on squares
and edges, the in-progress drag preview (a newly-set piece in `COL_DRAGON`
blue, a cleared piece in `COL_DRAGOFF` light blue), row/column clue numbers
(red on a clue error), the cursor highlight, and the completion flash. The
drawstate SHALL diff a per-cell `Int32Array` of committed and drag flags plus
a clue-error sidecar, with the findMistakes overlay carried in the diff key.

The completion flash SHALL be a highlight a few squares long that runs the
finished track from the entrance to the exit: at any moment only those few
squares' rails are drawn in the flash color, every square of the track is lit
once and in order, and the last goes dark before the flash ends. It SHALL run
at one pace on every board, so a longer track takes longer, and never under a
second. Its color SHALL read against the rails and the track bed in both
color schemes.

#### Scenario: A completed row clue turns red when over-filled

- **WHEN** a row holds more track cells than its clue
- **THEN** that row's clue number renders in the error color

#### Scenario: A drag preview shows provisional pieces

- **WHEN** a left-drag is in progress over blank cells
- **THEN** the covered cells render their provisional track in the drag color

#### Scenario: The flash runs from A to B

- **WHEN** a board is won and frames of its flash are drawn from start to end
- **THEN** no frame lights more than a few squares, the first lit square is
  the entrance's, and every square of the track is lit for one stretch of
  frames
