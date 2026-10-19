## MODIFIED Requirements

### Requirement: Hint: The Tracks hint settles a square from its blocked sides

A square with three or four sides blocked SHALL be marked empty ("The outlined
sides leave the ringed square one way in, and track needs two"). A square that
holds track and has two sides blocked SHALL have track laid across its other
two ("The track here can't cross the outlined sides, so it must run through the
ringed ones"). The grid's rim counts as blocked except where the entrance or
the exit crosses it, and the blocked sides SHALL be the evidence the step
outlines.

#### Scenario: A track square in a corner

- **WHEN** a corner square of the grid, away from the entrance and the exit,
  is marked as holding track
- **THEN** a step lays track across its two inner sides

### Requirement: Hint: The Tracks hint runs a lone loose end straight on

On a Normal or a Tricky board, in a row or column where exactly one square
holds a single segment running along the line, where the clue less the squares
that hold two segments is 2, and where every square without two segments has a
side blocked across the line, a step SHALL lay that square's track straight on
along the line ("This row has 2 track squares left, and none of the outlined
ones can cross it, so the loose end must run on").

#### Scenario: An Easy board is not given it

- **WHEN** an Easy board reaches a position where a line has one loose end,
  two track squares left and no way across it
- **THEN** no step runs the loose end on, and the hint goes on with what the
  Easy techniques decide
