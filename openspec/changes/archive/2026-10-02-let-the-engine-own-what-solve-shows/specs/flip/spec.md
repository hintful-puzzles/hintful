## MODIFIED Requirements

### Requirement: Flip solver and play

The Flip solver SHALL perform Gaussian elimination over GF(2) on the
toggle matrix and return a shortest flip set, or report that no
solution exists for a hand-entered position. Clicking a cell (or
selecting it with the keyboard cursor) SHALL toggle the cell and its
matrix-defined neighbors; `executeMove` SHALL be pure (return a new
state). Solve SHALL press every square of the solution in one move.
Moving the keyboard cursor SHALL redraw without adding a
history entry. The game SHALL report `solved` when all lights are off,
upgraded to `solved-with-help` when the solver was used.

#### Scenario: Solving and completion

- **WHEN** the player flips cells until all lights are off
- **THEN** the game status becomes `solved`
- **AND** if the built-in solver was used to get there it is
  `solved-with-help`

#### Scenario: Unsolvable hand-entered position

- **WHEN** the solver runs on a position with no solution
- **THEN** it reports that no solution exists rather than returning a
  move

### Requirement: Flip rendering, timing, and text format

Flip SHALL render the grid, per-cell toggle diagram and keyboard
cursor through `GameDrawing`, with a
diagonal flip animation on a move and a win flash on completion, and
SHALL provide a statusbar string reporting move count and
completed/auto-solved state, and a plain-text format of the board.
Colors SHALL be derived from the supplied default background.

#### Scenario: Flip renders and animates through the engine

- **WHEN** Flip is played through the app
- **THEN** moves animate, completion flashes, the statusbar shows the
  move count and completion wording, and the palette is derived from
  the host background
- **AND** the board has a correct plain-text representation
