## MODIFIED Requirements

### Requirement: Light Up's cursor and completion flash

The keyboard cursor SHALL be brackets at the corners of its square, clear of a
bulb. The completion flash SHALL sweep the open squares diagonally, a lit
square filled with the flash color in place of its yellow and keeping its bulb.
A wall SHALL never be lit.

#### Scenario: The cursor on a bulb

- **WHEN** the cursor is on a square that holds a bulb
- **THEN** the brackets are drawn at the square's corners and the bulb's disc
  is not overdrawn

#### Scenario: A wall in the bottom-left corner

- **WHEN** a board whose bottom-left square is a wall is won
- **THEN** the flash sets off from the open squares nearest that corner, and
  the wall is drawn as on any other frame
