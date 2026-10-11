## ADDED Requirements

### Requirement: The route may end on gems the ball cannot come back from

Where the route solver's tour cannot take in a gem because the ball has no
way back from it, the route SHALL end with a leg that does not come home and
passes over every such gem, since the game ends on the last one. The leg
SHALL leave the ball at rest and alive. Where no such leg is found, the
solver SHALL answer that no solution can be found from the position.

#### Scenario: One gem in a pocket

- **WHEN** a hint, Solve or Check & save is asked of the hand-entered board
  `4x3:bmbmSbbbbbwg`, whose one gem is collected by sliding east and then
  south, and from which the only slide back runs onto a mine
- **THEN** the hint works toward that gem, Solve finishes the board, and the
  position is saved

#### Scenario: One slide takes two

- **WHEN** a board's last two gems lie on one slide that ends where the ball
  cannot come back from
- **THEN** the route ends with that slide

#### Scenario: A dead ball

- **WHEN** Solve is asked of a board whose ball lies dead on a mine
- **THEN** no route is found, though slides lead out of that square

#### Scenario: Two pockets

- **WHEN** a board has two gems, each collected only by a slide that ends
  where every way out is a wall or a mine
- **THEN** no route is found
