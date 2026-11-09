## MODIFIED Requirements

### Requirement: The chrome offers the hint and never urges it

No control in the chrome SHALL be styled to recommend taking a hint. The hint
SHALL be as reachable as any other command (same surface, same label, the same
three beats of where to look, why, and apply) and SHALL NOT be given an
emphasis that sets it above the commands beside it: whether to take a hint is
the player's call. The hint's own amber is unaffected: the explanation is the
hint speaking, as loudly as it likes once asked, and the button is the chrome
offering, which it SHALL do plainly.

#### Scenario: A player opens a puzzle they have not asked for help with

- **WHEN** the puzzle screen renders its command surface
- **THEN** no control is emphasized for being the hint

### Requirement: Only the Menu scrolls

No panel other than the Menu SHALL scroll, and the Menu SHALL be the screen's
only overflow: there is no second menu of commands inside it and no scrolling
column beside it. The Bar SHALL fit its window by showing fewer of the list's
leading entries, the rest moving to the head of the Menu. Game controls beside
the board SHALL fit their height by laying the keys out in more columns. The
timeline is in the Menu and opens a list of its own: it is a list of moves and
not of commands.

#### Scenario: A short desktop window

- **WHEN** the puzzle screen renders at 1280 by 600 CSS pixels
- **THEN** the Bar and the Game controls panel are wholly visible without
  scrolling
- **AND** every command not on the Bar is in the Menu

#### Scenario: The Bar at a phone width

- **WHEN** the puzzle screen renders at 360 CSS pixels wide with the hint
  reading "Explain the hint", its widest caption
- **THEN** the Bar does not overflow horizontally, and no caption runs over a
  neighboring button
