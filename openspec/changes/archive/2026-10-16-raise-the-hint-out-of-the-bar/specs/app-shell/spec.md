## ADDED Requirements

### Requirement: The hint rises out of the panel under it, and the board stands on it

The hint SHALL stand on the panel under it, or the window's edge where there
is none, with no rule between them, and SHALL rise out of it when it appears,
except where the player asks for reduced motion. It SHALL fill the room kept
for it. The board SHALL stand at the foot of its area, over the hint and its
room with a gap of no more than 12px, and SHALL NOT touch the hint.

#### Scenario: A one-line hint on a desktop

- **WHEN** a player presses Hint at 1000 by 686 CSS pixels and the explanation
  takes one line
- **THEN** the hint stands on the Bar, and no more than 12px lies between the
  board and the hint

#### Scenario: A phone

- **WHEN** the puzzle screen renders at 412 by 915 CSS pixels
- **THEN** the board stands just over the hint's room, and the height the board
  does not use is above it
