## ADDED Requirements

### Requirement: A command that acts on the board waits for the first board

A puzzle page holds its engine before it holds a board: the first board is
dealt, or reopened from an id or a save, after the page has its controls. A
command that reads or acts on the board in play (a hint, Auto-solve, Show
solution, a check, a save, undo, redo, restart, a key or a press sent to the
game, the board as text) SHALL NOT be sent to the engine until the first board
exists. Sent earlier, it SHALL wait and be answered about the board that
arrives.

The methods of the engine's surface that read the board SHALL be a type of
their own (`BoardSurface`), and the app SHALL reach them only through the wait,
so that a method added to that type cannot be called around it.

Until the first board exists, the chrome SHALL draw the controls of those
commands unavailable. A command that needs no board (New game, the type menu,
loading a game, opening a shared one, the puzzle switcher, preferences, help)
SHALL be offered throughout.

#### Scenario: Hint is pressed by key before the first board

- **GIVEN** a page that has its controls and is still dealing its first board
- **WHEN** the player presses the hint's key
- **THEN** no error is shown
- **AND** the hint is given once the board is there

#### Scenario: The controls while the first board is dealt

- **GIVEN** a page that has its controls and is still dealing its first board
- **THEN** Hint, Auto-solve, Show solution, Check & save, Restart, Save game,
  Share and Copy image are drawn unavailable
- **AND** New game and Load game are not

#### Scenario: The board arrives from a save

- **WHEN** the first board is a restored autosave and not a deal
- **THEN** the commands that waited are answered about it
