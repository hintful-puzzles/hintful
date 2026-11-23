## ADDED Requirements

### Requirement: A born game's drag makes what its first square became

A drag with either button SHALL give every square it passes that held what the pressed square held what the pressed square became, and SHALL leave a fixed square as it was. Where the description's `play` names the drag `straight`, the drag SHALL keep to the row or column it starts along; otherwise it SHALL follow the pointer. Where `play.sweepWith` names one button, the other's drag SHALL act where it began alone. The whole drag SHALL be one move, made on its release.

#### Scenario: A straight left drag along a row

- **WHEN** in a game whose drag is straight, the player presses the left button on an open square, which the press fills, and drags along its row over two open squares and one ruled out
- **THEN** the two open squares are filled as the first was, and the ruled-out one is kept

#### Scenario: A pointer that wanders off the line

- **WHEN** a straight drag's pointer moves one square off the row it started along
- **THEN** the drag stays on that row, at the column nearest the pointer
