# path Specification Delta — color-path-pairs

## REMOVED Requirements

### Requirement: Look: Lines are ink, joined pairs gray, and broken lines red

**Reason**: Lines take their pair's color, and a joined pair fills its discs rather than graying.
**Migration**: Replaced by "Look: Each pair and the lines reaching it share a color".

## ADDED Requirements

### Requirement: Look: Each pair and the lines reaching it share a color

A number SHALL sit in a ring of its pair's color, from the collection's set of colors that mean nothing, spread so that pairs given near each other differ where the set allows, and repeating past it. The ring SHALL fill with the color once a line joins the pair. A line SHALL take the color of the number its piece reaches, and a piece reaching no number SHALL be ink. A line SHALL be drawn red where its piece joins two different numbers or closes into a loop.

#### Scenario: A line from a number takes its color

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn between the two squares below the top-left 1
- **THEN** it is ink, and once a line joins it to the 1, both lines are drawn in the 1's color

#### Scenario: A line between two numbers is red

- **WHEN** on `4x3de:1_2_1c2e` a line is drawn between the top-left 1 and the 2 beside it
- **THEN** that line is drawn red
