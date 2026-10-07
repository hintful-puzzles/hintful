## MODIFIED Requirements

### Requirement: Rendering, animation and the status bar

The game SHALL render the floor as the cell surface, ruled with the surface's
grid line, and a wall as a flat block with no bevel, in a gray that stands a
clear step off the floor in both schemes: darker than the floor in the light
scheme and lighter than it in the dark one. Walls that touch SHALL be drawn as
one mass, with no grid line between them. It SHALL render mines as spiked
balls, black in both schemes with a rim in ink, so that a mine stands off the
dark scheme's floor, stop-squares as rings, gems as
diamonds in the collection's color for what the player is after (the theme
pair's second member), and the ball as a circle in the color of where the
player is (a jagged red splat when dead) drawn over a blitter-saved background. A move
SHALL animate the ball sliding along its path, in a time proportional to the
square root of the distance traveled, with each gem disappearing as the ball
reaches it. Death SHALL flash the board red and the winning move SHALL flash it
light. The status bar SHALL show the remaining gem count, `DEAD!` when dead,
`COMPLETED!` when finished, and a running deaths tally.

The deaths tally SHALL be incremented only for a death caused by a move the player
just made on an unfinished board, so that undoing and redoing a fatal move does
not re-count it.

#### Scenario: Undo and redo do not re-count a death

- **WHEN** the player dies, undoes the fatal move, and redoes it
- **THEN** the deaths tally still reads 1

#### Scenario: A wall is a flat block

- **WHEN** a board with a wall is drawn
- **THEN** the wall's square is one rectangle in the wall's color
- **AND** nothing on the board is a bevel
