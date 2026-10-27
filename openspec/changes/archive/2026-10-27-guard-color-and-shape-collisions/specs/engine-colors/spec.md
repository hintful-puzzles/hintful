# engine-colors Specification Delta — guard-color-and-shape-collisions

## ADDED Requirements

### Requirement: Two unrelated marks are not one color and one shape

Two palette slots a game paints SHALL NOT be drawn as the same kind of mark at a like size, where a player cannot tell their colors apart in either scheme, unless the game declares, with its reason, that the two are one meaning or what tells them apart beyond the stroke. A mark's kind is a bar, a slash, a fill, a disc, a ring, a polygon of as many corners, or text; a rim is no mark of its own.

#### Scenario: A wall drawn as an ink bar beside an ink line is refused

- **WHEN** a game draws its walls and its player's lines as bars of a like thickness and reach in one color
- **THEN** the guard fails, naming the game and both slots

#### Scenario: Ink text beside an ink grid line passes

- **WHEN** a game draws its numbers and its grid lines in one ink
- **THEN** the guard passes, because a digit and a line are different marks

#### Scenario: A declared pair passes

- **WHEN** a game declares two slots one meaning, or names what tells them apart beyond the stroke, with its reason
- **THEN** the guard passes them

#### Scenario: A declaration outlives its pair

- **WHEN** a declared pair is no longer drawn as one mark in one color
- **THEN** the guard fails until the declaration is removed
