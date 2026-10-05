## ADDED Requirements

### Requirement: ABCD's menu offers a board under each of its rules

ABCD's presets SHALL include a board with diagonal touching disallowed, so a player reaches that rule from the menu and every cross-game sweep deals one. The rule needs five letters, which no other preset has, so writing the one field onto another preset is refused and nothing but a preset reaches it.

#### Scenario: The rule against diagonal touching is on the menu

- **WHEN** ABCD's preset menu is read
- **THEN** it holds a 6x6 board with five letters and diagonal touching
  disallowed, between the 6x6 and 7x7 boards, titled with the words the label
  gives that rule

#### Scenario: The board deals at once and the hint finishes it

- **WHEN** that preset is dealt
- **THEN** the deal takes milliseconds, and following the hint solves the board
