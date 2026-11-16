## ADDED Requirements

### Requirement: Look: The win flash draws the route from each number to the next

During the win flash Signpost SHALL draw, in the flash's colors, the stretch
of the line from each number's square to the next number's that the
highlight is on, stopping short of the two squares' numbers, so the light is
seen to travel the solved sequence. A frame after one that drew the route
SHALL repaint every square.

#### Scenario: A highlight between two numbers

- **WHEN** the highlight is between the squares of numbers 3 and 5
- **THEN** a lit line runs on the links from 3 to 4 and from 4 to 5, and on
  no other
- **AND** the next frame with no highlight shows no line
