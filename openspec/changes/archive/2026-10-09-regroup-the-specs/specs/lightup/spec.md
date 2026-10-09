## MODIFIED Requirements

### Requirement: Light Up accepts pointer and cursor input

A left-click SHALL toggle a bulb on an open square that carries no mark, and a
right-click the impossible-mark on an open square that carries no bulb. A
click on a wall or outside the grid SHALL be a no-op. A left-click on a marked
square, and a right-click on a bulb, SHALL be rejected without a history
entry. A right-drag SHALL repeat the right-click on the squares it passes that held
what the pressed square held, and a left-drag SHALL repeat nothing, because a
row of bulbs light each other.

#### Scenario: Left-click places and toggles a bulb

- **WHEN** the player left-clicks an empty open square, then left-clicks it
  again
- **THEN** a bulb appears (lighting its row and column to the nearest walls)
  and then disappears

#### Scenario: Marks block bulbs

- **WHEN** the player left-clicks a square carrying an impossible-mark
- **THEN** no move is produced and no history entry is created

#### Scenario: A right-drag crosses a row

- **WHEN** the player right-drags across three empty open squares
- **THEN** all three carry the impossible-mark
- **AND WHEN** the player left-drags across three empty open squares
- **THEN** only the first holds a bulb
