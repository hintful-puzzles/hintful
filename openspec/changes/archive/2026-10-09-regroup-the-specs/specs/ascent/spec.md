## MODIFIED Requirements

### Requirement: What Ascent draws

Where a drawn path holds only a single number, rendering SHALL show at its endpoints the one or two smaller numbers valid there. Moves
SHALL be applied instantly, with no interpolated animation.

#### Scenario: A move is drawn at once

- **WHEN** a move is made
- **THEN** the next frame shows its result, with no frame between
