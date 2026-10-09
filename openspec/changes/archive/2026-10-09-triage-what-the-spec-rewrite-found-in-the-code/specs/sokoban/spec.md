## MODIFIED Requirements

### Requirement: Sokoban's Solve finishes from the player's position, or else from the dealt board

Sokoban's Solve SHALL search for a line from the player's position and, failing that, from the
board as dealt, and SHALL leave the finished board that line reaches. Its move SHALL carry the
finished board as `encodeBoard` writes it: a game ID's letters, and for a labeled barrel on a
target the control character the board stores, which a game ID cannot carry and only this
move's board may. The move SHALL be refused on a board whose walls differ.

#### Scenario: A lost position is solved from the dealt board

- **WHEN** Solve is asked on a position a pushed-in barrel has lost
- **THEN** it leaves a solved board, found from the board as dealt

#### Scenario: A level with a labeled barrel is solved

- **WHEN** Solve is asked on a hand-typed level whose barrel is a capital letter
- **THEN** it leaves that barrel on its target with its letter, and a save of the solved game
  loads to the same board
