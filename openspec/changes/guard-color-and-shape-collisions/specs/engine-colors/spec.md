# engine-colors Specification Delta — guard-color-and-shape-collisions

## ADDED Requirements

### Requirement: Two unrelated marks are not one color and one shape

Two palette slots a game paints SHALL NOT be drawn as the same kind of mark at a like size, a bar of one thickness, a cell fill, a disc of one radius, or text, where a player cannot tell their colors apart in either scheme, unless the game declares the two one meaning and says why.

#### Scenario: A wall drawn as an ink bar beside an ink line is refused

- **WHEN** a game draws its walls and its player's lines as bars of a like thickness in one color
- **THEN** the guard fails, naming the game and both slots

#### Scenario: Ink text beside an ink grid line passes

- **WHEN** a game draws its numbers and its grid lines in one ink
- **THEN** the guard passes, because a digit and a line are different marks

#### Scenario: A declared pair passes

- **WHEN** a game declares two slots one meaning, with its reason
- **THEN** the guard passes them
