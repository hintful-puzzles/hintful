## ADDED Requirements

### Requirement: Dominosa draws a domino as a piece in the theme pair's first color

`redraw` SHALL fill a placed domino with the collection's color for a placed
piece, the theme pair's first member, and a clashing domino with the
collection's error color, with the number on either in a white that is the same
in both schemes. A number carrying a value highlight on a domino SHALL be drawn
on a disc of the board's own color, inside the mistake outline, so the
highlight's color reads there as it does on an open square. The reference
spotlight SHALL take the collection's color for what the player is after, which
no domino, mistake, hint or value highlight takes.

#### Scenario: A highlighted number on a domino sits on a badge

- **WHEN** a value is highlighted and a square showing it is covered by a domino
- **THEN** a disc in the board's color is drawn under that number
- **AND** no disc is drawn under a number that is not highlighted

#### Scenario: The domino's number does not invert with the scheme

- **WHEN** a board with a placed domino is drawn in the dark scheme
- **THEN** the number on the domino is the same white as in the light scheme
