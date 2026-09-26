## ADDED Requirements

### Requirement: The solve timer has its own place in the chrome

While a game's timer is on, the app SHALL show the elapsed time beside the move count: after
it in the phone's top bar, and under it in the desktop rail's "Your position" group. It SHALL
be absent, not blank, while the timer is off. The solved message SHALL state the time, and
SHALL say beside it when help was taken on the board. The app SHALL pause the timer while the
page is hidden.

#### Scenario: The timer is off

- **WHEN** a game's timer is off
- **THEN** no timer element takes space in the top bar or the rail

#### Scenario: A helped solve

- **WHEN** a player who used a hint solves a board with the timer on
- **THEN** the solved message reads "Finished in M:SS, with help" rather than "Solved in M:SS"
