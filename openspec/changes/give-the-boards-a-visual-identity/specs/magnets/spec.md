## ADDED Requirements

### Requirement: An undecided Magnets domino is the collection's cell surface

`redraw` SHALL fill a domino the player has not decided with the collection's
cell surface, so the board recedes and a decided domino is told by its pole
colors or its neutral color and never by a step of gray. The pole colors, the
neutral color and the `?` mark keep their colors, which the game names.

#### Scenario: An undecided domino is surface

- **WHEN** an opening board is drawn
- **THEN** every domino is filled with the cell surface

#### Scenario: A decided domino carries the color

- **WHEN** the player sets a domino to a magnet
- **THEN** its two squares are filled with the two pole colors
