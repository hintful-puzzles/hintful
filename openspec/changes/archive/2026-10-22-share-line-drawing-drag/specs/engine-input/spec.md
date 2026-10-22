# engine-input Specification Delta — share-line-drawing-drag

## ADDED Requirements

### Requirement: A line drawn through squares is the engine's drag

The engine SHALL provide the drag that draws a line along the edges between the squares it passes, a rook move at a time, cut back where it returns to a square it passed, and stopped by a crossed edge or a square given more lines than it takes. Its release SHALL keep the lines it passes, or take them up where it passes nothing else. A game drawing lines this way SHALL use it and declare only how many lines a square takes and whether a loop may close.

#### Scenario: A drag back over its own way takes the line back

- **WHEN** a drag passes three squares and returns to the second
- **THEN** releasing it draws only the edge between the first two

#### Scenario: A drag along a line and past its end carries it on

- **WHEN** a drag starts along a line already drawn and goes on past its end
- **THEN** releasing it keeps that line and draws on along the drag

#### Scenario: A square is never given more lines than it takes

- **WHEN** a drag, a click or a Ctrl+arrow would give a square more lines than it takes
- **THEN** the drag stops before that square, and the click or key makes no move

### Requirement: The line drawing's keys are the engine's

The engine's line drawing SHALL take Enter to start a line at the cursor, the arrows to carry it, Enter to draw it and Space or a cancel key to abandon it; Ctrl+arrow SHALL draw or take up the line on that side and move along it, Ctrl+Shift+arrow the same without moving, and Shift+arrow SHALL cross or clear that edge. A modified arrow on a hidden cursor SHALL only show it.

#### Scenario: Ctrl+Shift+arrow draws without moving

- **WHEN** Ctrl+Shift+Right is pressed on a showing cursor beside an open edge
- **THEN** the edge takes a line and the cursor stays on its square
