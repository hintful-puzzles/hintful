## ADDED Requirements

### Requirement: A hint names a state by the rules and a piece by its shape

A hint sentence SHALL name a cell's state by the word the puzzle's rules use
("shaded", "clear") and a piece of the two-state pair by its shape's word, and
SHALL NOT say the color either is drawn in, because the color is the theme's.
A game whose colors are its content, drawn from a set the player hears named
(Flood's fills, Map's regions), still names those colors.

#### Scenario: A walk hears a pair's color word

- **WHEN** the cross-game hint walk reads a step that says the color word of a
  member of the two-state pair
- **AND** the game does not draw that word's color as content
- **THEN** the walk fails and names the game and the sentence

#### Scenario: A game whose colors are its content

- **WHEN** Map's hint says a region must be yellow
- **THEN** the walk passes it, because Map draws its yellow from the named
  region fills
