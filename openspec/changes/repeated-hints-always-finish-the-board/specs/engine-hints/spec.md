## ADDED Requirements

### Requirement: Applying the hint on a wrong board clears its mistakes

When the hint is refused with `FIX_MISTAKES_FIRST`, applying it SHALL make a move that takes off every mistake the overlay shows, as one step of Undo. The engine SHALL build that move from what each game declares about its mistakes, and no game SHALL write it as a hint of its own.

#### Scenario: A line drawn out of order is taken off

- **WHEN** on a Path board a line joins two numbers that are not one apart, the hint is refused with `FIX_MISTAKES_FIRST`, and the hint is applied
- **THEN** the lines the overlay showed as mistakes are taken off, Undo puts them back, and the next hint is not refused for mistakes

### Requirement: Pressing Hint over and over finishes any board

From any position a player can reach, pressing Hint repeatedly SHALL finish the board, in every game with a hint, but for exceptions this requirement names with their reasons. A refusal that has a way forward SHALL carry the move that takes it.

#### Scenario: A wrong board is finished by the hint alone

- **WHEN** a dealt board is put in a reachable state with wrong entries, and Hint is pressed until the board's status stops changing
- **THEN** the board's status is solved
