## MODIFIED Requirements

### Requirement: A board with a mistake check loads only with exactly one answer

The engine SHALL refuse to load a description, whoever wrote it, when the game
implements `findMistakes` and the game's own `solve`, asked about the board it
builds, proves the board has more than one solution (refused with
`DESC_NOT_UNIQUE`) or none (refused with `DESC_CONTRADICTORY`). The verdict
SHALL be part of `loadDesc`, so a pasted game ID, a shared link and a save are
judged alike. A solver that gives up without proving either SHALL leave this
verdict passing.

#### Scenario: A game ID with two answers

- **WHEN** a player opens a Black Box game ID whose lasers allow two layouts
- **THEN** it is refused with `DESC_NOT_UNIQUE`, and nothing throws

#### Scenario: A game ID upstream's generator wrote

- **WHEN** a desc in `src/guards/__fixtures__/upstream-descs.json` is loaded
  under the params string it is listed under
- **THEN** it loads
