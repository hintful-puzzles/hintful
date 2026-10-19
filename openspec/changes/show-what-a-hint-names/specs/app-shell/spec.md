## MODIFIED Requirements

### Requirement: A hint's words sit under the board

The hint's explanation, and the status line of a game that prints one, SHALL be
shown under the board, and under the Game controls where they are under it, at
every window size, and in no panel. Showing or clearing a hint SHALL NOT move
the board or any control in a panel, nor SHALL the Hint control's caption
changing. In a game with a hint, the room the longest hint the engine allows
takes at the window's width SHALL be kept while no hint shows, in every game
alike.

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

### Requirement: The hint rises out of the panel under it, and the board stands on it

The hint SHALL stand on the Bar, or the window's edge where the Bar is not
under it, with no rule between them, and SHALL rise out of it when it appears,
except where the player asks for reduced motion. It SHALL be as tall as its
words, and the room a short hint leaves SHALL be above it. The board SHALL stand at the foot of its area, over what is under it
with a gap of no more than 12px, and SHALL NOT touch it.

#### Scenario: A one-line hint on a desktop

- **WHEN** a player presses Hint at 1000 by 686 CSS pixels and the explanation
  takes one line
- **THEN** the hint stands on the Bar, and no more than 12px lies between the
  board and the hint

#### Scenario: A phone

- **WHEN** the puzzle screen renders at 412 by 915 CSS pixels
- **THEN** the board stands just over the Game controls, the hint's room is
  between them and the Bar, and the height the board does not use is above it

## ADDED Requirements

### Requirement: A hint's references show what they name

Each reference in a displayed hint's words SHALL be a control, reachable by
keyboard, and tinted in the color its marks are drawn in. Pressing one, or a
mouse coming over it, SHALL turn every mark that reference draws white on a
dark board and black on a light one, once, with a line from the reference to
them, and fade both within a second, while every other mark of the step stays
as it is. A flash SHALL end when the step changes.

#### Scenario: A player presses "this cell"

- **WHEN** a hint says "the outlined cells … this cell must be A" and the
  player presses "this cell"
- **THEN** the ring on that cell turns white on a dark board and fades back,
  and the outline and stripes stay as they are throughout
- **AND** within a second of the press, every mark of the step is as it was
