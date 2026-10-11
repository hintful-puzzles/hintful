## ADDED Requirements

### Requirement: Same Game refuses a board that can never be cleared

`hasNoSolution` SHALL hold for a board with tiles left and no two
orthogonally-adjacent tiles of one color, and for a board on which a tile is
the only one of its color. It SHALL NOT hold for a cleared board. A dealt
board with a move SHALL load whether or not it can be cleared, and a game
played until no move is left SHALL open from its save.

#### Scenario: A board with no move

- **WHEN** the game ID `3x3c3s2:1,2,1,2,3,2,3,1,3` is opened, which has three
  tiles of every color and no two alike touching
- **THEN** it is refused with `DESC_NO_SOLUTION`
- **AND** it is refused alike under the other scoring, as `3x3c3s1`

#### Scenario: A lone tile of a color

- **WHEN** a board holds exactly one tile of some color
- **THEN** `hasNoSolution` holds, since a removal takes two or more of one
  color

#### Scenario: A board with one move

- **WHEN** the game ID `3x3c3s2:1,1,2,2,3,2,3,1,3` is opened, on which one
  pair touches
- **THEN** it loads

#### Scenario: A game played until it is stuck

- **WHEN** a player removes the only group of `3x2c3s2:1,1,3,2,3,2`, leaving
  no move, and the game is saved and opened again
- **THEN** it opens on the stuck position, and Undo brings the group back
