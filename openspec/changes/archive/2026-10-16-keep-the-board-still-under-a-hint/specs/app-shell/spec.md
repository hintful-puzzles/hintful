## MODIFIED Requirements

### Requirement: A hint's words sit under the board

The hint's explanation, and the status line of a game that prints one, SHALL be
shown under the board at every window size, and in no panel. Showing or
clearing a hint SHALL NOT move any control in a panel, and neither SHALL the
Hint control's own caption changing to say what the next press does. In a game
with a hint, the room of a two-line hint, three in a window that is not wide,
SHALL be kept under the board while no hint shows.

#### Scenario: A hint is shown on a desktop

- **WHEN** a player presses Hint in a wide window
- **THEN** the explanation appears under the board
- **AND** every control in the Bar, the Game controls and the Menu is where it
  was before the press

#### Scenario: A short hint leaves the board as it was

- **WHEN** a player presses Hint and the explanation fits in two lines
- **THEN** the board is the same size as before the press, and stays so when
  the hint is cleared

#### Scenario: A long hint is not cut off

- **WHEN** the explanation needs more lines than the room keeps
- **THEN** it is shown whole, and the board gives up the height beyond the room
