## REMOVED Requirements

### Requirement: Look: Bricks marks a rule violation on the board

**Reason**: Bricks kept its marks off a committed board until the check, as
upstream did, where every other game shows them as soon as a rule breaks.
**Migration**: "Look: Bricks draws in red where the board breaks a rule".

## ADDED Requirements

### Requirement: Look: Bricks draws in red where the board breaks a rule

A rule violation SHALL be marked on the board, always and with no mistake
check asked for (`Game.rules`), as every game marks one: a bar over three or
more shaded cells in a row, an error diamond under a shaded cell that can
rest on nothing, both squares beneath it clear, a number or the board's edge,
and in the error color the number of a clue that can no longer count its
bricks. While a drag is in flight the marks SHALL be those of the board the
drag previews.

#### Scenario: A drag shows the row it is about to make

- **WHEN** a drag in flight previews three shaded cells in a row
- **THEN** the bar is drawn over them before the drag is released

#### Scenario: A committed row of three is marked at once

- **WHEN** a move leaves three shaded cells in a row and no drag is in flight
- **THEN** the bar is drawn over them

#### Scenario: A brick over an open square is not yet marked

- **WHEN** a shaded cell has one square beneath it still empty and the other
  clear
- **THEN** no diamond is drawn under it
