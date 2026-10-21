# path Specification Delta — color-path-pairs

## REMOVED Requirements

### Requirement: Look: Lines are ink, joined pairs gray, and broken lines red

**Reason**: Lines take their pair's color, and a joined pair fills its discs rather than graying.
**Migration**: Replaced by "Look: Each pair and the lines reaching it share a color".

## MODIFIED Requirements

### Requirement: Controls: A drag draws a line through the squares it passes

A press and drag with the left button SHALL draw a line along each edge between the squares it passes, a rook move at a time, keeping the lines already there; back over a square it has passed it SHALL be cut back to there. A drag that passes only edges holding lines SHALL take them up. A drag SHALL stop where an edge is crossed or where its line would give a square more lines than it takes. A left click near an edge SHALL draw or remove its line.

#### Scenario: A drag draws a line

- **WHEN** on `4x3de:1_2_1c2e` the left button is pressed on the top 2, dragged down one square and right one square, and released
- **THEN** lines are drawn on edges 10 and 4, and the move is one step of Undo

#### Scenario: A drag along a line and past its end carries it on

- **WHEN** a drag starts along a line the player has drawn and goes on past its end
- **THEN** the line is kept and carried on along the drag, not taken up

## ADDED Requirements

### Requirement: Look: Each pair and the lines reaching it share a color

A number SHALL sit in a ring of its pair's color, from the collection's set of colors that mean nothing, spread so that pairs given near each other differ where the set allows, and repeating past it. The ring SHALL fill with the color once a line joins the pair. A line SHALL take the color of the number its piece reaches, and a piece reaching no number SHALL be ink. A line SHALL be drawn red where its piece joins two different numbers or closes into a loop.

#### Scenario: A line from a number takes its color

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn between the two squares below the top-left 1
- **THEN** it is ink, and once a line joins it to the 1, both lines are drawn in the 1's color

#### Scenario: A line between two numbers is red

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn between the top-left 1 and the 2 beside it
- **THEN** that line is drawn red
