## MODIFIED Requirements

### Requirement: Rules: Tracks computes live errors on every move

A square SHALL be red, as drawn and without the solution (`Game.rules`),
where it can no longer hold two rails or none, and every square of a piece
of track that can no longer reach an end, a loop included. Once the rails
join A to B, every open side crosses nothing, so a rail apart from them is
such a piece, and the track joining A to B SHALL NOT be red for it. A
square marked no track crosses nothing on its open sides.

#### Scenario: A loop is flagged

- **WHEN** track edges are placed forming a closed loop
- **THEN** every cell on the loop is red

#### Scenario: A rail apart from a finished track is flagged

- **WHEN** the rails join A to B, and one more rail joins two squares off the
  track
- **THEN** those two squares are red, and no square of the track is

### Requirement: Rules: A Tracks clue is in error when its line cannot meet it

A row's or column's clue SHALL be red when the squares of its line that hold
track, a rail on them or marked track, exceed it, or when the squares that
can still hold track fall short of it.

#### Scenario: An over-filled clue is flagged

- **WHEN** a row has more track cells than its clue number
- **THEN** that row's clue is red

#### Scenario: Squares marked track count

- **WHEN** a row whose clue is 3 has four squares marked track and no rail
- **THEN** that row's clue is red
