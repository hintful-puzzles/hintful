## ADDED Requirements

### Requirement: The key decides which way a modified arrow acts

In every game, Shift or Ctrl with an arrow and the same modifier with the
opposite arrow, pressed from one position, SHALL NOT both change the board
and leave the same board and the same `Ui`. The engine SHALL hold every game
to this from every position the plain arrows walk the cursor to, in a
population it derives from which games' boards a modified arrow changes.

#### Scenario: A line slid from its far end

- **WHEN** a game slides a row for Shift with Right, and the cursor is on the
  row's last square
- **THEN** Shift with Right and Shift with Left leave different boards

#### Scenario: A game that reads the direction off the cursor

- **WHEN** a game works out which way to act from where the clamped cursor
  ended up, so that an arrow at the far edge acts as its opposite does
- **THEN** the guard names the game and the keys that reach the position

### Requirement: The engine reads a number-pad digit as a direction, once

The engine SHALL provide `numpadDirection(button)` in `pointer.ts`: the step
a number-pad digit names where a game uses the pad as a direction pad (8, 2,
4 and 6 as the arrows, 7, 9, 1 and 3 the diagonals), or `null` for the pad's
5 and 0 and for any other key. A game with such a pad SHALL take all eight
directions from it before asking `digitOf`, so that none is also a digit.

#### Scenario: A diagonal is a direction and not a digit

- **WHEN** a game whose number pad moves its cursor is sent the pad's 9
- **THEN** it reads a step up and right from `numpadDirection`, and does not
  ask `digitOf` about that key

#### Scenario: A top-row digit names no direction

- **WHEN** `numpadDirection` is asked about the top row's `7`
- **THEN** it answers `null`

### Requirement: A cursor step on a sheared hexagonal board is the engine's

The engine SHALL provide `shearedHexStep(step, y, h)` in `pointer.ts` for a
hexagonal board held as a grid whose rows each sit half a cell right of the
row above. Up and Down SHALL zigzag, taking the diagonal that keeps the
cursor in the column it is drawn in; the number pad's 7 and 3 SHALL be a
plain row step up and down, and its 9 and 1 the other two diagonals.

#### Scenario: Up from an even row

- **WHEN** the cursor is on an even row below the first and Up is pressed
- **THEN** the step is one row up and one column right in the grid

### Requirement: Only a digit carries the number-pad mark

The frontend SHALL set `MOD_NUM_KEYPAD` on a key from the number pad only
when the key is a digit. The pad's arrows, which it sends with Num Lock off,
and its Enter SHALL arrive as the keys they name, so that a game comparing a
button against a named code finds one.

#### Scenario: An arrow from the number pad

- **WHEN** the number pad's 8 is pressed with Num Lock off
- **THEN** the game receives `CURSOR_UP`, as from the arrow key
