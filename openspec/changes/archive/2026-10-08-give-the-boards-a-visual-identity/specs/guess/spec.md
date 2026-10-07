## ADDED Requirements

### Requirement: Guess draws an empty hole as quiet surface

`redraw` SHALL draw an empty peg hole, and an empty feedback hole, as the
collection's cell surface inside a rim in the surface's grid line, so that the
pegs are the color on the board and an empty hole is where a peg goes and no
state of its own. The ten peg colors, the black and white feedback pegs, the
wash that lights a row ready to be scored, the held-peg bar and the answer
row's well SHALL be drawn as before.

#### Scenario: An empty hole recedes

- **WHEN** a board with rows not yet reached is drawn
- **THEN** each of their holes is filled in the cell surface and rimmed in the
  grid line
- **AND** no empty hole is outlined in ink

#### Scenario: A peg keeps its color and its outline

- **WHEN** a row holds pegs
- **THEN** each peg is filled in its own color and outlined in ink
