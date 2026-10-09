## MODIFIED Requirements

### Requirement: Only the key block and the exit carry a hue

Of the board's fills, only the two things the help page names to the player,
the blue key block and the green exit, SHALL carry a hue. The other fills
SHALL stay neutral so they cannot compete with them. The rule binds fills
alone: a mark laid over the board, the keyboard cursor's corner brackets among
them, keeps its own color.

#### Scenario: The floor, wall and ordinary block are neutral

- **WHEN** the board is rendered in either color scheme
- **THEN** the key block reads blue and the exit area green, and the floor, the
  wall and an ordinary block carry no hue of their own

#### Scenario: The keyboard cursor is red

- **WHEN** the keyboard cursor is shown on a block
- **THEN** its corner brackets are red, and the block under them keeps its
  neutral fill
