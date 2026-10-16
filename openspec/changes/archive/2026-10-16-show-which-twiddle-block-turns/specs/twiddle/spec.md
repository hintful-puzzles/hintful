## MODIFIED Requirements

### Requirement: Controls: A click rotates the block centered on it

A click on a square SHALL turn the block, among those holding that square,
whose center is nearest the click, and a click off the squares SHALL make no
move. Which way each button and the select keys turn a block SHALL be what
`targetVerbs` declares (`engine-input`, "The engine owns a declaring game's
press and select keys").

#### Scenario: Every square answers a click

- **WHEN** a click lands anywhere on any square, for blocks of side 2, 3 or 4
- **THEN** it turns a block that holds that square

#### Scenario: Click geometry constrains legal rotations

- **WHEN** a click lands in the border outside every square
- **THEN** no move is produced

## ADDED Requirements

### Requirement: Look: Twiddle shows which block a click turns

Twiddle SHALL draw a dot at every block's center, on the grid corner for a
block of even side and below the number of the middle square for one of odd
side. While the mouse is over the board, the block a click would turn SHALL be
outlined, in the same band and color as the keyboard cursor, and the outline
SHALL go when the pointer leaves.

#### Scenario: Hovering a square outlines the block a click turns

- **WHEN** the mouse moves over a square
- **THEN** the block a click there would turn is outlined, and nothing is
  outlined once the pointer leaves the board
