## ADDED Requirements

### Requirement: Look: A wire the rules break is red

Net's rules SHALL read the sides the player recorded: locks, then notes, then walls, a side two locks disagree about as wired. A wire SHALL be red where that board breaks a rule on it (`Game.rules`): on a loop, in a group closed off from the rest, across a wall, or of a tile whose piece no longer fits the sides round it. With "Highlight loops involving unlocked squares" on, a loop the tiles make as turned SHALL be red too.

#### Scenario: A lock that disagrees with the lock beside it is red

- **WHEN** a dead end locked pointing at a locked tile is unlocked, turned away, and locked again, while the tile it pointed at keeps a wire toward it
- **THEN** the wire facing its old side is red, and so is every wire of the dead end, which the sides read round it give two

#### Scenario: A loop through unlocked tiles is red only when asked for

- **WHEN** four unlocked corners are turned into a ring
- **THEN** the ring is red with "Highlight loops involving unlocked squares" on, and plain with it off
