## ADDED Requirements

### Requirement: A lightness a help page names is pinned in the game's palette

A game whose help page calls something black, shaded, white or lit SHALL hold in
its palette a color that is dark, or light, in both schemes by its own authored
values, so that the word stays true when the scheme changes. A page whose word
is not about a piece's color SHALL be recorded with what the word is about, and
a record for a page that no longer uses the word SHALL fail.

#### Scenario: A lit square drawn in paper fails

- **WHEN** a help page tells the player to light up the squares
- **AND** the game paints a lit square in a color that inverts with the scheme
  and holds no color pinned light
- **THEN** a test fails and names the game and the word

#### Scenario: A word about something else is recorded

- **WHEN** a help page says squares "light up" to describe a mistake shown in
  red
- **THEN** the game is recorded as using the word for something other than a
  piece's color, with what it is
