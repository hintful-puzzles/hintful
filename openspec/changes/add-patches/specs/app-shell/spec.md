# app-shell Specification Delta — add-patches

## MODIFIED Requirements

### Requirement: A hint's words sit under the board

The hint's explanation, and the status line of a game that prints one, SHALL be
shown under the board, and under the Game controls where they are under it, at
every window size, and in no panel. Showing or clearing a hint, or a status
line's text, SHALL NOT move the board or any control in a panel, nor SHALL the
Hint control's caption changing. In a game with a hint, the room the longest
hint the engine allows takes at the window's width SHALL be kept while no hint
shows, and in a game with a status line, its line's room while it says nothing.

#### Scenario: A hint is shown on a desktop

- **WHEN** a player presses Hint in a wide window
- **THEN** the explanation appears under the board
- **AND** every control in the Bar, the Game controls and the Menu is where it
  was before the press

#### Scenario: A hint is shown on a phone with a keypad

- **WHEN** a player presses Hint at 412 by 915 CSS pixels in a game with keys
- **THEN** the explanation appears between the keys and the Bar
- **AND** the board and every key are where they were before the press

#### Scenario: A short hint leaves the board as it was

- **WHEN** a player presses Hint in any game at any window size, and the
  explanation is within the engine's length limit
- **THEN** the board is the same size as before the press, and stays so when
  the hint is cleared

#### Scenario: A long hint is not cut off

- **WHEN** the explanation needs more lines than the room keeps
- **THEN** it is shown whole, and the board gives up the height beyond the room

#### Scenario: A status line that speaks only during a drag leaves the board as it was

- **WHEN** a player drags a rectangle in Rectangles, whose status line gives
  the dragged rectangle's size and is empty otherwise
- **THEN** the board is the same size and in the same place before, during
  and after the drag
