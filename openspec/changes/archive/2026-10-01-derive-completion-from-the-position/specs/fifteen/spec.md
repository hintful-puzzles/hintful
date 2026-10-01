## MODIFIED Requirements

### Requirement: Fifteen slide and solve moves transform state purely

A `FifteenMove` SHALL be either a slide carrying the destination gap cell
(`{ type: "move", x, y }`) or a solve (`{ type: "solve" }`). `interpretMove`
SHALL produce a slide only when the target cell shares exactly one coordinate
with the current gap (a click sharing zero or both coordinates, or out of
bounds, produces nothing); cursor keys SHALL slide the adjacent tile into the
gap immediately using the default arrow semantics (the pressed arrow moves a
tile in that direction). `executeMove` SHALL be pure (returning a new state):
a slide shifts every tile on the line between the old and new gap one cell
toward the old gap, incrementing the move count once per shifted tile; a solve
SHALL replace the grid with the solved permutation and count as one move. The
state SHALL keep no record of completion or of the solver: the board is solved
exactly while its tiles are in order, and the engine records that Solve was
used and suppresses the completion flash for the Solve command.

#### Scenario: A slide shifts a line of tiles into the gap

- **WHEN** a slide move targets a cell sharing one coordinate with the gap,
  three tiles away along that line
- **THEN** all three tiles shift one cell toward the old gap, the gap lands on
  the targeted cell, the move count increases by three, and the source state
  is unmutated

#### Scenario: Click geometry constrains legal slides

- **WHEN** a click targets a cell diagonal to the gap (sharing neither
  coordinate exactly, or sharing both)
- **THEN** no move is produced

#### Scenario: Solve snaps to the solved board

- **WHEN** the solve move executes
- **THEN** the new state is the solved permutation with the move count one
  higher, and the completion flash is suppressed on the following redraw

### Requirement: Fifteen renders tiles, border, and slide animation

The Fifteen `redraw` SHALL draw a one-time recessed beveled border, then each
tile as a beveled square with its centered number (the gap drawn as plain
background), maintaining a per-tile cache so a tile is repainted only when it
changed, is animating, or the flash background changed. A slide SHALL animate
in two passes — cells vacated by moving tiles blanked first, then each moving
tile drawn interpolated one cell from its old position toward the gap over the
animation duration. A genuine completion (not a solve) SHALL flash the
background for two frames. The status bar SHALL show the move count, which
never freezes or resets, after the engine's completion words (`COMPLETED!`
when solved, `Auto-solved.` or `Auto-solver used.` once Solve was used).

#### Scenario: First draw emits the border and numbered tiles

- **WHEN** `redraw` runs against a recording `GameDrawing` double for a fresh
  board
- **THEN** the recorded operations include the recessed border and one beveled
  tile with its number for each non-gap cell

#### Scenario: A slide animates between cells

- **WHEN** a slide move has just executed and `redraw` runs mid-animation
- **THEN** the moving tiles are drawn at coordinates interpolated between their
  old and new cells, settling exactly on their destination cells at animation
  end
