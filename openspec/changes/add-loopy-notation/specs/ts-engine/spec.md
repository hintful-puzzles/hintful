# ts-engine

## ADDED Requirements

### Requirement: A hint relies only on marks the player can make

A game's `hint()` SHALL rest every step on facts the player can see on the board or
record there with the game's own input. Where a tier's deductions need a kind of
mark the game does not offer, the game SHALL offer that mark to the player, and the
hint's steps SHALL place it as a move. A hint SHALL NOT draw, as a hint-only
overlay, a fact the player has no way to record.

#### Scenario: A deduction rests on a fact the player cannot mark

- **WHEN** a game's hint would rest a step on a fact its solver derived and the
  player has no input to record
- **THEN** the game is not conforming until it gives the player a mark for that fact
  and the hint places the mark as a move

#### Scenario: Every premise of a step is the player's own

- **WHEN** a step of any hinting game is displayed
- **THEN** every premise its sentence names is a clue, an entry the player placed,
  or a mark the player can make
