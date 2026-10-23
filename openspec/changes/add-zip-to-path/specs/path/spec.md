# path Specification Delta — add-zip-to-path

## MODIFIED Requirements

### Requirement: Controls: A drag draws a line through the squares it passes

A press and drag with the left button SHALL draw a line along each edge between the squares it passes, a rook move at a time, keeping the lines already there; back over a square it has passed it SHALL change nothing, and carry on from where it reached. A drag that passes only edges holding lines SHALL take them up. A drag SHALL stop where an edge is crossed or where its line would give a square more lines than it takes. A left click near an edge SHALL draw or remove its line.

#### Scenario: A drag draws a line

- **WHEN** on `4x3de:1_2_1c2e` the left button is pressed on the top 2, dragged down one square and right one square, and released
- **THEN** lines are drawn on edges 10 and 4, and the move is one step of Undo

#### Scenario: A drag along a line and past its end carries it on

- **WHEN** a drag starts along a line the player has drawn and goes on past its end
- **THEN** the line is kept and carried on along the drag, not taken up

## ADDED Requirements

### Requirement: Rules: Zip joins the numbers in order with one line

Under the Zip ruleset each number 1 to K SHALL be on exactly one square. The puzzle SHALL be solved when one line runs from 1 to K through every square, passing the numbers in order: the first and last numbered squares take one line, and every other square two.

#### Scenario: A line out of order does not win

- **WHEN** on `4x3zde:1f2_3b4` every square has its lines but the line passes the 3 before the 2
- **THEN** the game's status is ongoing

#### Scenario: The line through the numbers in order wins

- **WHEN** on `4x3zde:1f2_3b4` the lines on edges 0 to 8, 12 and 13 are drawn
- **THEN** the game's status is solved

### Requirement: Params: Zip is a ruleset written z

Path and Zip SHALL be the two rulesets of the game's "Game mode" field. Zip SHALL be written `z` after the size, and Path as nothing, so that every Path params string written before Zip decodes as it did.

#### Scenario: Zip round-trips

- **WHEN** `6x6zdt` is decoded and encoded in full
- **THEN** the result is `6x6zdt`, and `6x6dt` decodes to Path

### Requirement: Description: A Zip number is on one square, and walls follow a comma

Under Zip, a description SHALL give each number from 1 to its highest once, the highest at least 2. Under either ruleset, the numbers MAY be followed by a comma and the walls, as the engine's list of walls and gaps over the edges in their numbered order. A wall's edge SHALL start crossed, and no move SHALL change it.

#### Scenario: A repeated number is refused under Zip

- **WHEN** `1f2_3b3` is loaded at 4x3 under Zip
- **THEN** it is refused

#### Scenario: A wall loads crossed and round-trips

- **WHEN** `1f2_3b4,jf` is loaded at 4x3 under Zip
- **THEN** edge 10 is a wall holding a cross, and the description encodes back to `1f2_3b4,jf`

### Requirement: Controls: A wall is the board's

No click, key or drag SHALL change a wall's edge, and a drag SHALL stop at a wall as at a cross.

#### Scenario: A click on a wall does nothing

- **WHEN** a wall's edge is clicked with either button
- **THEN** no move is made

### Requirement: Solver: Zip counts an out-of-order join and a loop as closed

Under Zip, the ladder SHALL count an edge as closed when a line on it would join two pieces whose numbers nearest the meeting ends are not one apart, or would join a piece to itself.

#### Scenario: The 3's line cannot meet the 5's

- **WHEN** the line from a 3 and a line whose nearest number is the 5 end on squares side by side
- **THEN** no hint step asks for a cross on the edge between them

### Requirement: Generation: Zip's board is one path, its numbers and walls stripped

A Zip board SHALL be dealt only where the ladder finishes it at exactly the tier asked for. The 1 and the highest number SHALL sit on the ends of a path through every square, and every wall SHALL lie on an edge that path does not take, and be one the ladder needs to finish the board with the numbers it has.

#### Scenario: A dealt Zip board has one answer

- **WHEN** a 5x5 board is dealt under Zip
- **THEN** a search that walks every path from the 1 finds exactly one answer

### Requirement: Look: Zip's line changes color from the 1 to the highest number

Under Zip, a stretch of line SHALL take the color of the number it leaves, the colors running in order of hue from the 1's to the highest's, and a number SHALL be ringed in that color, the highest in its stretch's. A number's disc SHALL fill once the line reaches the numbers either side of it. A line SHALL be red where it closes a loop or passes two numbers that are not one apart. A wall SHALL be drawn as a bar along its edge.

#### Scenario: Each stretch takes its own color

- **WHEN** on `4x3zde:1f2_3b4` the whole answer is drawn
- **THEN** the lines are drawn in three colors, one for each stretch between two numbers
