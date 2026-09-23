## ADDED Requirements

### Requirement: Magnets calls its pieces tiles when a player reads about them

Every Magnets hint sentence and the Magnets help page SHALL call the two-square
piece a tile, and a filled one a magnet or a neutral tile; they SHALL NOT call it
a domino. A tile's halves SHALL be its ends or squares, and a tile marked `?` a
marked magnet. The code's names for the layout are not player vocabulary and are
outside this requirement.

#### Scenario: No sentence says domino

- **WHEN** every sentence the Magnets hint can speak is produced, at every value
  that changes its words
- **THEN** none contains "domino"

#### Scenario: The help page says tile

- **WHEN** the Magnets help page is read
- **THEN** it describes filling each tile with a magnet or a neutral tile, and
  never says "domino"
