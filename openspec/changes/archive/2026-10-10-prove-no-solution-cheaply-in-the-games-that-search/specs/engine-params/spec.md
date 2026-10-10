## MODIFIED Requirements

### Requirement: A board its game proves has no solution does not load

The engine SHALL refuse to load a description, whoever wrote it, when the
game's `hasNoSolution` holds for the board it builds. The refusal SHALL be
`DESC_NO_SOLUTION`, and SHALL be part of `loadDesc`, so a pasted game ID, a
shared link and a save are judged alike. The engine SHALL NOT ask the `solve`
of a game without `findMistakes` when a board loads.

#### Scenario: A Flip board no presses light

- **WHEN** a player opens a Flip game ID whose presses cannot put out every
  light
- **THEN** it is refused with `DESC_NO_SOLUTION`, and nothing throws

#### Scenario: A sliding puzzle with two tiles swapped

- **WHEN** a player opens a Fifteen game ID that is the finished board with
  two tiles swapped
- **THEN** it is refused with `DESC_NO_SOLUTION`

#### Scenario: A game whose only proof is a search

- **WHEN** a Slide game ID with a block moved so that no slides finish it is
  opened
- **THEN** it loads, and its solver is not run

#### Scenario: A search game's quick loss

- **WHEN** a Pegs game ID with two pegs that can never meet is opened
- **THEN** it is refused with `DESC_NO_SOLUTION`, and its search is not run

## ADDED Requirements

### Requirement: A proof that names its cause refuses the hint

`hasNoSolution` SHALL answer for any position of the game, and MAY answer with
a marked dead end naming what proves it. Where it does, the midend SHALL
refuse a hint and a check with that dead end and SHALL NOT ask the game's
`hint`. A bare yes SHALL leave the hint to the game.

#### Scenario: A peg jumped out of reach

- **WHEN** a Pegs player jumps a peg to where no jump can ever involve it, and
  asks for a hint
- **THEN** the hint says the outlined peg is cut off, the peg is outlined, and
  the game's `hint` was not called

#### Scenario: A proof with nothing to outline

- **WHEN** a Flood player has made a fill after which the limit cannot be met,
  and asks for a hint
- **THEN** the game's `hint` is asked, and names a fill
