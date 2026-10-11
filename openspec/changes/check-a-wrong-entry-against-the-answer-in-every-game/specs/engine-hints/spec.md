## ADDED Requirements

### Requirement: Check & Save names a wrong entry in every game

A game with `findMistakes`, `solve` and a hint SHALL report through
`findMistakes` an entry the board's answer contradicts, whether or not the
entry breaks a rule. A cross-game guard SHALL hold this by playing gestures
chosen blind on a dealt board of each such game, and SHALL state which games
its gestures made no wrong entry in.

#### Scenario: An entry that is wrong and breaks no rule

- **WHEN** one gesture's moves, played on a game's solved board, leave it
  unsolved, and from the position the gesture reached the hint cannot finish
  the board
- **THEN** `findMistakes` reports something there, or the check refuses in
  words of the game's own that name the cause, and the guard fails otherwise

#### Scenario: A game the gestures enter nothing wrong in

- **WHEN** no gesture makes a wrong entry in a game
- **THEN** the guard fails unless its ledger names that game with the reason
