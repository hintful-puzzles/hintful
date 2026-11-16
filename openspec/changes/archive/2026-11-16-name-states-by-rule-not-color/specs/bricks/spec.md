## MODIFIED Requirements

### Requirement: Hint: Bricks calls its piece shaded and never by its color

Bricks' hint sentences, control words and help page SHALL say "shaded" for
the shaded state and SHALL NOT say the piece's color.

#### Scenario: A hint rests on a shaded cell

- **WHEN** a hint step reasons from a cell that is shaded
- **THEN** its sentence calls it a shaded brick and names no color
