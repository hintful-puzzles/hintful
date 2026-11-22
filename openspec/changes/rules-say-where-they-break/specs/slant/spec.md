## MODIFIED Requirements

### Requirement: Rules: Slant computes live errors after every move

The board SHALL flag, as drawn and without the solution (`Game.rules`), every
diagonal on a loop of diagonals, and every numbered point that already meets
more diagonals than its number or that too few of its squares are left to
meet, a point on the border included. A diagonal off the loop, joined to it,
SHALL NOT be flagged. The fade-grounded preference SHALL dim every diagonal
joined, through other diagonals, to the border.

#### Scenario: A closed loop is flagged

- **WHEN** diagonals are placed forming a closed loop, and a diagonal runs off
  one of its corners
- **THEN** each diagonal on the loop is red, and the one running off it is not

#### Scenario: An over-committed clue is flagged

- **WHEN** a vertex clue `1` has two incident diagonals
- **THEN** that number is red

#### Scenario: A border clue its squares can no longer meet is flagged

- **WHEN** a `1` on the border has both its squares slanting away from it
- **THEN** that number is red
