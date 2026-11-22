## MODIFIED Requirements

### Requirement: Rules: Light Up renders with live error feedback

The live errors SHALL be where the board breaks a rule (`Game.rules`). A
numbered wall that can no longer have its bulbs SHALL sit on a disc in the
full error color, which stands off a wall in both schemes, its digit in that
color's text color. A bulb another bulb lights SHALL be a disc in the full
error color. A cross on a square nothing can light any more SHALL be drawn
in the error color.

#### Scenario: Overlapping bulbs render as errors

- **WHEN** two bulbs light each other
- **THEN** both are drawn in the error color

#### Scenario: A wrong clue reads on its wall in the dark scheme

- **WHEN** a numbered wall has more adjacent bulbs than its clue
- **THEN** its number sits on a disc in the full error color, not that color's
  wash

#### Scenario: A square nothing can light

- **WHEN** a square and every square that could light it hold a cross
- **THEN** its cross is drawn in the error color
