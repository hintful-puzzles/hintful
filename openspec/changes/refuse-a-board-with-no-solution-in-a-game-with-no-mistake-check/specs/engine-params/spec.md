## ADDED Requirements

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

- **WHEN** a Pegs game ID with two pegs that can never meet is opened
- **THEN** it loads, and its solver is not run

### Requirement: A game with no mistake check is held to a board with no solution

`hasNoSolution` SHALL be a proof whose cost does not depend on the board,
since it is asked of every board opened. `registerGame` SHALL refuse it on a
game with `findMistakes`. Every registered game without `findMistakes` SHALL
be held by a test to a board with no solution: one that is refused, where the
game has `hasNoSolution`, and one that loads, where it has not.

#### Scenario: A new game with no mistake check

- **WHEN** a game is registered without `findMistakes`
- **THEN** the test fails until a board of its own with no solution is pinned

#### Scenario: A game gains a proof

- **WHEN** a game whose pinned board loads is given `hasNoSolution`
- **THEN** the test fails until that board is moved to the refused ones
