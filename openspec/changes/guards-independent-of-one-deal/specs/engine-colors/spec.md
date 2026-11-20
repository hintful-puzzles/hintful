## MODIFIED Requirements

### Requirement: Two unrelated marks are not one color and one shape

Two palette slots a game paints SHALL NOT be drawn as the same kind of mark at a like size, where a player cannot tell their colors apart in either scheme, unless the game declares, with its reason, that the two are one meaning or what tells them apart beyond the stroke. A mark's kind is a bar, a slash, a fill, a disc, a ring, a polygon of as many corners, or text; a rim is no mark of its own. The marks are read on a board of every mode and on the default board.

#### Scenario: A wall drawn as an ink bar beside an ink line is refused

- **WHEN** a game draws its walls and its player's lines as bars of a like thickness and reach in one color
- **THEN** the guard fails, naming the game and both slots

#### Scenario: Ink text beside an ink grid line passes

- **WHEN** a game draws its numbers and its grid lines in one ink
- **THEN** the guard passes, because a digit and a line are different marks

#### Scenario: A declared pair passes

- **WHEN** a game declares two slots one meaning, or names what tells them apart beyond the stroke, with its reason
- **THEN** the guard passes them

#### Scenario: A family of slots is declared once

- **WHEN** a game declares the text on each of its colors one meaning with its plain text, and which of those colors' text collides moves with the boards dealt
- **THEN** the guard passes whichever of them collide, and the declaration does not change

#### Scenario: A declaration outlives its pair

- **WHEN** no pair a declaration covers is drawn as one mark in one color on any board read
- **THEN** the guard fails until the declaration is removed
