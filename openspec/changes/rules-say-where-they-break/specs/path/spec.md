## ADDED Requirements

### Requirement: Look: A piece of line the rules break is red

Under either ruleset a piece of line SHALL be drawn red, whole, where the board breaks a rule on it (`Game.rules`): it closes a loop, though its numbers are in order; it joins two numbers that may not meet, two different ones under Pairs and two not one apart under Path; or it ends at a square that can take no further line.

#### Scenario: A line that can go no further is red

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn from the square below the top-left 1 into the corner below it, and the corner's other side is crossed
- **THEN** that line is drawn red

#### Scenario: A loop through the numbers in order is red once it closes

- **WHEN** on `4x3zde:1f2_3b4` a line runs from the 2 along the top row, back along the middle one to the 3, and on along the bottom row toward the 2
- **THEN** it takes the numbers' colors while open, and is drawn red once it reaches the 2 again

## MODIFIED Requirements

### Requirement: Look: Each pair and the lines reaching it share a color

A Pairs number SHALL sit in a ring of its pair's color, from the colors that mean nothing, spread so that pairs given near each other differ where the set allows, and repeating past it. A pair's ring, disc and lines SHALL be edged in black. The ring SHALL fill with the color once a line joins the pair. A line SHALL take the color of the number its piece reaches, and a piece reaching no number SHALL be ink.

#### Scenario: A line from a number takes its color

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn between the two squares below the top-left 1
- **THEN** it is ink, and once a line joins it to the 1, both lines are drawn in the 1's color

#### Scenario: A line between two numbers is red

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn between the top-left 1 and the 2 beside it
- **THEN** that line is drawn red

### Requirement: Look: Path's line changes color from the 1 to the highest number

Under Path, a stretch of line SHALL take the color of the number it leaves, the colors running in order of hue from the 1's to the highest's, and a number SHALL be ringed in that color, the highest in its stretch's. A number's disc SHALL fill once the line reaches the numbers either side of it. A wall SHALL be drawn as a bar along its edge.

#### Scenario: Each stretch takes its own color

- **WHEN** on `4x3zde:1f2_3b4` the whole answer is drawn
- **THEN** the lines are drawn in three colors, one for each stretch between two numbers
