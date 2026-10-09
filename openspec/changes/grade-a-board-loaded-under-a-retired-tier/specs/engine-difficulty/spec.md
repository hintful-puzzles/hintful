## MODIFIED Requirements

### Requirement: A tier with no boards is retired and still loads

A tier that the game's solver understands and its generator can deal at no size
SHALL be declared a retired choice of the difficulty item, because a saved game
or a game ID may still name it. A retired tier SHALL NOT be offered, SHALL be
accepted when a board is loaded, with `solveAtCap` answering at its cap, and
SHALL be refused with a human-readable reason when a board is to be generated.
A board loaded under a retired tier SHALL take the lowest offered tier that
solves it.

#### Scenario: A game ID names a retired tier

- **WHEN** a game ID or a save names a tier the game has retired, as Bricks'
  `dt` does
- **THEN** the board loads
- **AND** the form does not offer the tier, and asking for a new board at it is
  refused with the reason

#### Scenario: A board that needs search arrives under a retired tier

- **WHEN** a Bricks board that only its Unreasonable tier solves is loaded by an
  ID carrying `dt`
- **THEN** the midend reports it as Unreasonable, and a hint that runs out of
  deduction on it is returned as the refusal and nothing is thrown
