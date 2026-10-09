## MODIFIED Requirements

### Requirement: A step narrates what its move does

Each step's narration SHALL describe what its move actually does. The
highlighted tile SHALL be the lowest-numbered out-of-place tile on the moved
line, or the lowest-numbered tile on it when every tile of the line is home,
except on the second leg of a previewed journey. The target SHALL be the
narrated tile's landing cell under the step's move, and the returned delta
SHALL be normalized to the in-grid direction of travel.

#### Scenario: Each step lands its tile on its target

- **WHEN** a user asks for a hint on an unsolved Sixteen board
- **THEN** each step of the plan lands the highlighted tile exactly on that
  step's highlighted target

#### Scenario: A move along a line that is all home

- **WHEN** a step slides a line whose every tile is in its solved cell, to
  serve another line's journey
- **THEN** the step highlights the lowest-numbered tile on that line

### Requirement: The Sixteen port supports direct row and column dragging

Sixteen SHALL support direct touch and mouse row/column dragging. When a user drags on a tile in the grid, the game SHALL track the horizontal or vertical drag vector and visually offset the dragged row/column in real-time. When released, the line SHALL slide by the drag's distance rounded to a whole number of tiles, and a drag that rounds to none SHALL make no move.

#### Scenario: Dragging a row to slide it right
- **WHEN** a user pointerdowns on tile (0, 1), pointermoves right by 1.2 tiles, and pointerups
- **THEN** the game executes a slide move on row 1 with a delta of +1 (shifting right by 1)

#### Scenario: A short drag makes no move
- **WHEN** a user drags a row right by a third of a tile and releases
- **THEN** no slide is executed and the row settles where it was
