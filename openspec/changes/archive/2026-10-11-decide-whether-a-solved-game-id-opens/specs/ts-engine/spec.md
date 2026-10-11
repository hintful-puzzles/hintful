## ADDED Requirements

### Requirement: A game ID whose board is already solved opens

A game ID whose description is a solved board SHALL open, whoever wrote it,
and the player SHALL be shown the finished board as one they had just solved.
Passing a solved board over SHALL be a rule of dealing alone.

#### Scenario: A sorted Fifteen is typed in

- **WHEN** a player opens a Fifteen game ID whose tiles are already in order
- **THEN** the board opens, and its status is solved at move 0

#### Scenario: A generator's own solved board is opened by its ID

- **WHEN** a generator writes a board that is solved before a move, and that
  board's game ID is opened
- **THEN** the board opens, and its status is solved at move 0
