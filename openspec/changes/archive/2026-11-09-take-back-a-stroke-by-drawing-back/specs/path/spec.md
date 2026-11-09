## MODIFIED Requirements

### Requirement: Controls: A drag draws a line through the squares it passes

A press and drag with the left button SHALL draw a line along each edge between the squares it passes, a rook move at a time, keeping the lines already there, as the engine's line drag does, and taking back the steps it retraces over its end. A drag that passes only edges holding lines SHALL take them up. It SHALL stop where an edge is crossed or where its line would give a square more lines than it takes. A left click near an edge SHALL draw or remove its line.

#### Scenario: A drag draws a line

- **WHEN** on `4x3de:1_2_1c2e` the left button is pressed on the top 2, dragged down one square and right one square, and released
- **THEN** lines are drawn on edges 10 and 4, and the move is one step of Undo

#### Scenario: A drag along a line and past its end carries it on

- **WHEN** a drag starts along a line the player has drawn and goes on past its end
- **THEN** the line is kept and carried on along the drag, not taken up
