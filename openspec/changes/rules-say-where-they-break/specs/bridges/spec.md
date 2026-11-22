## MODIFIED Requirements

### Requirement: Rules: Bridges draws provably wrong state red

`redraw` SHALL draw in red, as the board is played, what breaks a rule (`Game.rules`): an island its lines can no longer satisfy, when `allowloops` is false a loop's bridges, and a group closed off from the rest, bridges included. A line SHALL read as holding at least the bridges drawn and at most its limit, none past a bridge across it, no more than either island still needs, and what it has at an island marked done.

#### Scenario: A loop is red only where loops are forbidden

- **WHEN** the player's bridges close a loop
- **THEN** the loop's bridges are drawn red on a board with
  `allowloops = false`, and closing a loop is not what turns anything red on a
  board that allows loops

#### Scenario: A limit can leave an island short

- **WHEN** a 3 whose two lines carry 2 and 1 at most has the first limited to one, with no bridge drawn
- **THEN** the 3 is red

#### Scenario: An island marked done holds what it has

- **WHEN** an island is marked done with fewer bridges than its number
- **THEN** it is red, and so is a group it closes off from the rest
