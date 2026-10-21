# path Specification Delta — color-path-pairs

## REMOVED Requirements

### Requirement: Look: Lines are ink, joined pairs gray, and broken lines red

**Reason**: Lines take their pair's color, and a broken line is told by its shape.
**Migration**: Replaced by "Look: Each pair and the lines reaching it share a color".

## ADDED Requirements

### Requirement: Look: Each pair and the lines reaching it share a color

A number SHALL sit in a disc in its pair's color, taken from the collection's set of colors that mean nothing and repeating past it, with the number on the disc. A line SHALL take the color of the number its piece reaches, and a piece reaching no number SHALL be ink. A line whose piece joins two different numbers or closes a loop SHALL be told by its shape, not by a color.

#### Scenario: A line from a number takes its color

- **WHEN** a line is drawn from a number
- **THEN** it is drawn in that number's color, and a piece of line not yet reaching a number is ink
