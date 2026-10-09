## MODIFIED Requirements

### Requirement: Bricks parameters are a width, a height and a difficulty

Parameters SHALL be a width, a height and a difficulty, Easy or `Unreasonable`.
The engine SHALL refuse a width or height below 2 and an unknown difficulty,
from the bounds and choices the game declares. Of full parameters
`validateParams` SHALL refuse a 2×2 at `Unreasonable`, which has no board of
that tier. A game ID SHALL encode the width, height and difficulty and
round-trip through decode. The difficulty letters SHALL stay `e`, `n` and `t`,
so that an existing game ID names the same board.

#### Scenario: A game ID round-trips through the parameters

- **WHEN** a parameter set is encoded to a game ID and decoded
- **THEN** the same width, height and difficulty are recovered

#### Scenario: A board one cell wide is refused

- **WHEN** parameters with a width of 1 are checked
- **THEN** they are refused

#### Scenario: A 2×2 at the harder tier

- **WHEN** a 2×2 `Unreasonable` board is asked for
- **THEN** it is refused with "No 2x2 puzzle is Unreasonable.", and a 2×3 at
  the same tier is dealt

### Requirement: The undeclared Bricks tier still loads and is never dealt

The undeclared tier SHALL remain decodable: its difficulty letter is kept, so a
game ID or saved game carrying it still parses and still round-trips. A full
(generation-capable) parameter set carrying it SHALL be refused by the engine,
from the difficulty item's retired choice, with a message that lists the tiers
that do exist; the tier refused has no name to give. Any other parameter set
carrying it SHALL be accepted, so such a game still loads.

#### Scenario: The undeclared tier is not generated

- **WHEN** a full parameter set requesting the depth-2 tier is validated
- **THEN** it is rejected with "Difficulty must be one of Easy, Unreasonable."
- **AND** the same parameters validate successfully when a description is
  supplied rather than generated

#### Scenario: The undeclared tier still round-trips through a game ID

- **WHEN** a game ID carrying the depth-2 difficulty character is decoded and
  re-encoded
- **THEN** the same difficulty is recovered and the same game ID is produced

#### Scenario: The generator refuses rather than exhausts its retries

- **WHEN** the generator is called at that tier anyway
- **THEN** it fails immediately, rather than rejecting candidates until its retry
  budget is spent
