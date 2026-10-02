## ADDED Requirements

### Requirement: A board with a mistake check loads only with exactly one answer

The engine SHALL refuse to load a description, whoever wrote it, when the game
implements `findMistakes` and the game's own `solve`, asked about the board it
builds, proves the board has more than one solution (refused with
`DESC_NOT_UNIQUE`) or none (refused with `DESC_CONTRADICTORY`). The verdict
SHALL be part of `loadDesc`, so a pasted game ID, a shared link and a save are
judged alike. A board at a tier the game declares in `nonUniqueTiers` SHALL NOT
be asked, and a solver that gives up without proving either SHALL leave the
board loading. A game's `findMistakes` SHALL compare the player's marks with
that one answer, including where the answer is hidden from the player; a hidden
answer SHALL NOT be a reason in `notApplicable.findMistakes`.

#### Scenario: A game ID with two answers

- **WHEN** a player opens a Black Box game ID whose lasers allow two layouts
- **THEN** it is refused with `DESC_NOT_UNIQUE`, and nothing throws

#### Scenario: A game ID upstream's generator wrote

- **WHEN** a desc from a frozen upstream fixture is loaded under the params its
  fixture states, every field of which is placed or known to describe the
  fixture
- **THEN** it loads

#### Scenario: A hidden answer is checked

- **WHEN** the player runs Check & Save in Mines with a flag on a square that
  has no mine
- **THEN** the flag is highlighted as a mistake and the board is not saved
