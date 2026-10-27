# engine-params Specification Delta — rectangular-presets

## ADDED Requirements

### Requirement: A game that takes rectangles offers them on its menu

Where a game accepts a board whose width and height differ, at least half of the distinct board sizes on its preset menu, rounded down, SHALL be rectangles. A rectangle on the menu SHALL be at least as tall as it is wide where the game's rules do not care which way it stands.

#### Scenario: A menu of squares in a game that takes rectangles is refused

- **WHEN** a game whose rules accept a 7x9 board offers only 5x5, 7x7 and 9x9
- **THEN** the preset menu's shape check fails, naming the game

#### Scenario: A game that needs a square is not asked

- **WHEN** a game's rules refuse every board whose width and height differ
- **THEN** its menu of squares passes
