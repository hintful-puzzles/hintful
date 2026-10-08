## ADDED Requirements

### Requirement: The puzzle screen is three panels, and every command is in exactly one

The puzzle screen SHALL present its controls as three panels, at every window
size: a **Bar**, a **Game controls** panel and a **Menu**. Every command the
screen offers SHALL be reachable from exactly one place in exactly one of
them.

Two surfaces a player must both learn is the defect this rule exists to
prevent. A desktop rail and a phone bar with the rail behind it were one list
drawn as two shapes, and the phone's sheet repeated what its bar already
showed.

The Bar and the Menu SHALL be drawn from one ordered list of commands. The Bar
SHALL show the leading entries of that list and a button that opens the Menu,
and the Menu SHALL hold every entry the Bar does not show, in the list's order.
The Menu's contents are therefore a suffix of the list and never a selection
from it. The first four entries (Undo, Redo, Hint, Check & save) SHALL be on
the Bar at every size.

Every control in a panel SHALL carry a visible text label, not an icon alone.

#### Scenario: A command is offered twice

- **WHEN** a command in the puzzle screen's command map is reachable from more
  than one place across the three panels
- **THEN** a test fails, naming the command and both places

#### Scenario: A command has no home

- **WHEN** a command in the command map is reachable from nowhere in the three
  panels
- **THEN** a test fails, naming the command

#### Scenario: The Menu on a phone

- **WHEN** a player on a phone opens the Menu
- **THEN** it does not contain Undo, Redo, Hint or Check & save
- **AND** its first rows are the entries of the list that follow the last one
  the Bar shows

#### Scenario: A control carries no label

- **WHEN** a panel renders a control
- **THEN** it carries a visible text label, not an icon alone

### Requirement: The Bar is the same in every game, and a game's own controls are together

The Bar SHALL hold only commands every game has, so that a command keeps its
slot from one game to the next. A game with no hint has no Hint slot; no other
slot depends on the game.

Everything that depends on the game in play SHALL be in the Game controls
panel and nowhere else: its keys, the controls that change what a press means
(the note toggle, the button toggle), and its own commands (Fill or Update
marks, Reference). The Menu SHALL hold nothing that depends on the game, apart
from the game's name in the help row. A game that brings none of these SHALL
have no Game controls panel, and the board takes the room.

A player does not know to look in a menu for something only one game has.

#### Scenario: The same slots in two games

- **WHEN** the Bar is drawn at one window size for Solo and for Tracks
- **THEN** it has the same commands in the same order

#### Scenario: A game with mark-all

- **WHEN** the screen renders for a game whose `canMarkAll` is true
- **THEN** the Game controls panel contains the mark-all command
- **AND** neither the Bar nor the Menu does

#### Scenario: A game with a reference

- **WHEN** the screen renders for Dominosa
- **THEN** the Reference toggle is in the Game controls panel and not in the
  Menu

#### Scenario: A game with nothing of its own

- **WHEN** the screen renders for a game with no keys, no secondary action
  shown as a toggle, no mark-all and no reference
- **THEN** no Game controls panel is drawn

### Requirement: Only the Menu scrolls

No panel other than the Menu SHALL scroll, and the Menu SHALL be the screen's
only overflow: there is no second menu inside it and no scrolling column beside
it. The Bar SHALL fit its window by showing fewer of the list's leading
entries, the rest moving to the head of the Menu.

#### Scenario: A short desktop window

- **WHEN** the puzzle screen renders at 1280 by 600 CSS pixels
- **THEN** the Bar and the Game controls panel are wholly visible without
  scrolling
- **AND** every command not on the Bar is in the Menu

#### Scenario: The Bar at a phone width

- **WHEN** the puzzle screen renders at 360 CSS pixels wide with the hint
  reading "Apply the hint"
- **THEN** the Bar does not overflow horizontally, and no caption runs over a
  neighboring button

### Requirement: A hint's words sit under the board

The hint's explanation, and the status line of a game that prints one, SHALL be
shown under the board at every window size, and in no panel. Showing or
clearing a hint SHALL NOT move any control in a panel.

#### Scenario: A hint is shown on a desktop

- **WHEN** a player presses Hint in a wide window
- **THEN** the explanation appears under the board
- **AND** every control in the Bar, the Game controls and the Menu is where it
  was before the press

### Requirement: A player can choose where the panels dock

The app SHALL let a player choose, in Preferences, which side the Game controls
are on, whether the Bar is along the bottom or on a side, whether the Game
controls are on a side or under the board, and whether the Menu stays open when
there is room. The Menu SHALL take the side opposite the Game controls, so that
no choice can put all three panels on one side.

The side the Game controls are on SHALL be kept once for the device. The other
choices SHALL be kept separately for each window shape (tall; wide; wide and
short), so that a layout chosen on a wide screen does not follow a player to a
tall one. Where a player has made no choice, the default SHALL depend on the
window shape.

A choice that cannot be honored in the current window SHALL fall back without
being overwritten: a Menu that cannot dock without squeezing the board opens
over it.

#### Scenario: The default in a wide window

- **WHEN** a player who has changed nothing opens a puzzle in a wide window
- **THEN** the Menu is open on the left, the Bar is along the bottom and the
  Game controls are on the right

#### Scenario: The default in a tall window

- **WHEN** a player who has changed nothing opens a puzzle on an upright phone
- **THEN** the Bar is along the bottom, the Game controls are under the board,
  and the Menu opens as a sheet

#### Scenario: A left-handed player

- **WHEN** a player sets the Game controls to the left
- **THEN** the Game controls are on the left and the Menu on the right, in
  every window shape

#### Scenario: A choice made in one shape

- **WHEN** a player moves the Bar to the side in a wide window, and later opens
  the app in a tall one
- **THEN** the tall window shows its own layout, and the wide window's choice
  is still in force when they return to it

## REMOVED Requirements

### Requirement: Every puzzle command has exactly one home

**Reason**: It required one vertical command surface, with a phone bar that is
a subset of it. The owner chose three panels at every size, with the Bar and
the Menu partitioning one list (2026-10-08).

**Migration**: "The puzzle screen is three panels, and every command is in
exactly one" keeps the one-home rule and both of its failing-test scenarios,
and replaces the subset scenario with the partition.

### Requirement: Mark-all holds a slot in the phone bar in every game that has it

**Reason**: The owner moved mark-all to the Game controls panel (2026-10-08),
so that the Bar is the same in every game. It is still one tap away and always
visible, which is what the bar slot was asked for.

**Migration**: "The Bar is the same in every game, and a game's own controls
are together", scenario "A game with mark-all". The bar's fit at a narrow width
is "Only the Menu scrolls", scenario "The Bar at a phone width".
