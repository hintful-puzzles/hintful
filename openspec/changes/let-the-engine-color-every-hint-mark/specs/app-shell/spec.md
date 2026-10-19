## ADDED Requirements

### Requirement: The engine colors every hint mark

A hint mark's color and edge SHALL be the engine's, the same on the screen
and in an exported image, and no game SHALL declare a hint color of its own.

#### Scenario: Copy image while a hint shows

- **WHEN** a player copies the board's image while a hint is displayed
- **THEN** the image shows each reference's marks in the colors the screen
  shows them in
