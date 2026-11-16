## MODIFIED Requirements

### Requirement: The two-state pair is two colors, two words and two shapes

The engine SHALL provide the two-state pair, for a game with two states of
which neither is the important one: two colors, two shapes, and a word for
each piece that names its shape, each indexed alike. The words SHALL be
declared beside the shapes and SHALL NOT be derived from the colors, so a
theme that changes a color changes no word.

#### Scenario: A member is one index in all three

- **WHEN** a game takes the pair's first member
- **THEN** its color, its word and its shape are each the first of their list

#### Scenario: A piece's word is no color's

- **WHEN** the pair's words are compared with the words of the palette's named
  colors
- **THEN** none of the pair's words is a color's word

### Requirement: A game that uses the pair names no hue or shape of its own

A game that uses the two-state pair SHALL name no hue or shape of its own for
a state: its palette, its hint sentences and its control words take the pair's
members by index, and its help page names a piece by a placeholder the help
build fills from the pair's words. Replacing the pair SHALL therefore be a
change to the engine's declaration alone.

#### Scenario: A different pair changes no game

- **WHEN** the engine's two-state pair is given other colors, words or shapes
- **THEN** a game that uses the pair draws, narrates and documents the new pair
- **AND** no file under that game's directory and no line of its help page
  changes

#### Scenario: A help page that types a pair name fails

- **WHEN** a game's help page names the pair by placeholder
- **AND** also types one of the pair's words or one of its colors' words
- **THEN** the cross-game help guard fails and names the page

### Requirement: Shaded or not is the pair's first member alone

The engine SHALL provide, for a game where a cell is shaded or is not, the
pair's first member alone: its color (`SHADED`), its shape (`SHADED_SHAPE`),
its word (`SHADED_NAME`, "shaded", the rules' word and not the color's) and one
word for a cell known not to be shaded (`UNSHADED_NAME`), which holds no
piece. Such a game SHALL take the color and shape by reference, SHALL call a
shaded cell "shaded" and a cell known not to be shaded by that one word, and
its help page SHALL name the state by the same words and no color.

#### Scenario: Two games conclude a cell is not shaded

- **WHEN** a hint of one such game and a hint of another each conclude that a
  cell is not shaded
- **THEN** both sentences end on the same word

#### Scenario: A game that names the state and never the color

- **WHEN** such a game's sentences call its piece by a word of the puzzle, as
  "shaded brick"
- **THEN** they say no color, and neither does its help page

#### Scenario: A theme changes the shaded color

- **WHEN** the pair's first color is replaced
- **THEN** no hint sentence, control word or help page of such a game changes

#### Scenario: Two states the player makes

- **WHEN** both of a game's states are ones the player makes, as lit and unlit
- **THEN** the game takes the two-state pair, and this requirement does not
