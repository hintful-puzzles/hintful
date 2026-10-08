## ADDED Requirements

### Requirement: The puzzle screen is three panels, and every command is in exactly one

The puzzle screen SHALL present its controls as three panels, at every window
size: a **Bar**, a **Game controls** panel and a **Menu**. Every command the
screen offers SHALL be reachable from exactly one place in exactly one of
them. The one command outside them is the way out of a deal still being looked
for, which SHALL be beside the words that say so, under the board, and nowhere
else.

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
The on-screen keys that type a character are an input surface and not
controls ("The on-screen key panel never takes keyboard focus"): the character
is what they carry.

A control in the Bar or the Game controls SHALL draw its icon above its
caption, the same shape for every one of them, Hint included. A caption SHALL
name an action.

The Bar SHALL NOT draw the key that runs a command: a slot's tooltip carries
it, with the command's full name. A Menu row SHALL write the key beside the
command only where a keyboard is likely: a pointer that is fine and can hover.

A bottom Bar's Menu button SHALL be at the end of the Bar nearest the side the
Menu opens on, so that the button is beside what it opens. A rule SHALL set
the Menu button apart from the Bar's commands: it opens a panel, and they act
on the board.

Opening or closing the Menu SHALL move no slot of the Bar, in any layout, and
the Menu SHALL NOT cover the Bar, so that the Menu button which opened the
Menu is in view under the pointer, and a press there closes it.

#### Scenario: The same press opens and closes the Menu

- **WHEN** a player presses the Bar's Menu button, and presses the same point
  again without moving
- **THEN** the Menu opens and then closes, whether it docks beside the board,
  opens as a sheet or opens as a drawer
- **AND** every slot of the Bar is where it was throughout

#### Scenario: The Menu button, by handedness

- **WHEN** the Bar is along the bottom and the Game controls are on the right
- **THEN** the Menu button is the Bar's first slot, on the left
- **AND** with the Game controls on the left, it is the last, on the right

#### Scenario: A command is offered twice

- **WHEN** a command in the puzzle screen's command map is reachable from more
  than one place across the three panels and the words under the board
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
panel and nowhere else, in this order in every game: its keys, the controls
that change what a press means (the note toggle, the button toggle), and its
own commands (Fill or Update marks, Reference). Each SHALL be present by what
the game is, so that no game is listed: the keys and the note toggle by the
keys the game asks for, mark-all by `canMarkAll`, Reference by a `reference`
hook. The button toggle SHALL be shown to a player who has asked for it in
Preferences, in a game that has a secondary action to swap to. The Menu SHALL
hold nothing that depends on the game, apart from the game's name in the help
row and the commands a game cannot run at all, which are absent. A game that
brings none of these SHALL have no Game controls panel, and the board takes
the room.

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
only overflow: there is no second menu of commands inside it and no scrolling
column beside it. The Bar SHALL fit its window by showing fewer of the list's
leading entries, the rest moving to the head of the Menu. Game controls beside
the board SHALL fit their height by laying the keys out in more columns.

The timeline is in the Menu and opens a list of its own. It is a list of moves
and not of commands.

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
clearing a hint SHALL NOT move any control in a panel, and neither SHALL the
Hint control's own caption changing to say what the next press does.

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
being overwritten: a Menu that cannot dock without squeezing the board is
closed, and the Bar's Menu button opens it over the board, as a sheet in a tall
window and a drawer on the Menu's side in a wide one, in either case clear of
the Bar. A command chosen from a
Menu that is over the board SHALL close it; a docked Menu stays.

Closing or opening the Menu from the Bar is for the visit and SHALL NOT change
the stored choice.

The window's shape SHALL choose the layout, and not its width alone: tall is
portrait, and a landscape window is wide, or wide and short below about 34rem
of height.

The reference panel, where a game has one and it is open, SHALL be a region of
the same layout: beside the board, beyond the Game controls, in a landscape
window, and under the board in a tall one.

Where a panel docks SHALL be decided in one place, from these choices. No panel
SHALL carry a rule of its own about the window's size.

#### Scenario: A window narrowed until the Menu cannot dock

- **WHEN** a wide window with the Menu docked is narrowed until the Menu would
  squeeze the board, and then widened again
- **THEN** the Menu leaves the layout while it cannot dock, and is docked open
  again when it can

#### Scenario: Two window sizes either side of the old breakpoint

- **WHEN** the puzzle screen renders at 768 by 1024 and at 800 by 1000 CSS
  pixels
- **THEN** both are tall, and the board is the window's width in each, less
  the same margin

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

## RENAMED Requirements

- FROM: `### Requirement: The phone's top bar is one row of readouts, and the chips give way first`
- TO: `### Requirement: The readouts are one row, and the chips give way first`

- FROM: `### Requirement: A menu in the More sheet stays open until a choice is made in it`
- TO: `### Requirement: A menu inside the Menu stays open until a choice is made in it`

## MODIFIED Requirements

### Requirement: The readouts are one row, and the chips give way first

The puzzle screen SHALL hold the back link, the game's name, the type chips and, while it is on, the
timer, on one row above the board at every window size, which does not overflow at 320 CSS px.
The row holds readouts and the way back, and no command. The move counter SHALL NOT appear in
it; it is the timeline's control, in the Menu's Board group. When the row is short of
space, the chips SHALL be clipped before the game's name, and no chip SHALL draw outside its
own box. The back link SHALL show its words where the window is wide, and its icon alone
elsewhere, with the words as its accessible name.

#### Scenario: A long preset title on a narrow phone

- **WHEN** a game whose preset title is "Size 9 Hexagon Hard" is open at 320 px with the timer on
- **THEN** the row does not overflow, the name is shown whole, and the chip is clipped with an ellipsis rather than running under the timer

### Requirement: A menu inside the Menu stays open until a choice is made in it

A menu trigger inside the Menu SHALL NOT also be a command, because a command
chosen from a Menu that is over the board closes it and takes the menu with it. A choice made
in such a menu SHALL close a Menu that is over the board, as a command chosen from it does.

#### Scenario: Jumping to a checkpoint from the sheet

- **WHEN** the player opens the Menu on a phone, taps the move counter, and picks a checkpoint
- **THEN** the timeline stays open until the pick, and the pick closes the sheet

### Requirement: The solve timer has its own place in the chrome

While a game's timer is on, the app SHALL show the elapsed time at the end of the readout
row above the board, at every window size. It SHALL
be absent, not blank, while the timer is off. The solved message SHALL state the time, and
SHALL say beside it when help was taken on the board. The app SHALL pause the timer while the
page is hidden.

#### Scenario: The timer is off

- **WHEN** a game's timer is off
- **THEN** no timer element takes space in the readout row

#### Scenario: A helped solve

- **WHEN** a player who used a hint solves a board with the timer on
- **THEN** the solved message reads "Finished in M:SS, with help" rather than "Solved in M:SS"

### Requirement: The chrome does not overflow at a phone width

The puzzle screen's chrome SHALL lay out without horizontal overflow at 390 CSS
pixels.

The inherited header was a non-wrapping flex row with no minimum-width budget,
so at 390px its last control ran underneath the one before it and the type menu
truncated to a single character. The row above the board now carries readouts
only, few enough to fit, and the Bar sheds entries to the Menu instead of
squeezing them ("Only the Menu scrolls").

#### Scenario: A narrow viewport

- **WHEN** the puzzle screen renders at 390 CSS pixels wide
- **THEN** no chrome element overlaps another, and no control's label is
  truncated to fewer characters than it needs

### Requirement: Custom type… SHALL open its dialog from every Type menu, titled by name

Choosing "Custom type…" from a Type menu SHALL open the game's Custom dialog
wherever that menu is drawn, a component's own shadow root included, and the
dialog SHALL be titled with the game's display name, never its id.

A menu drawn inside a shadow root once raised "launchCustomDialog() can't find
puzzle-context container" instead of opening, because the lookup for the
dialog's container did not cross a shadow root. The dialog read "abcd" because
its title was the one the engine sent, and the engine knows a game only by its
id; the name belongs to the catalog, so the engine's form description carries
no title at all.

#### Scenario: Custom type… opens from a menu inside a shadow root

- **WHEN** a player chooses Custom type… from Type chips drawn inside a
  component's shadow root
- **THEN** the Custom dialog opens, with no error

#### Scenario: The dialog is titled by the game's name

- **WHEN** the Custom dialog opens for Abcd
- **THEN** its title is "Custom ABCD", not "abcd"

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
- **THEN** Hint, Auto-solve, Show solution, Check & save, Start over, Save as…,
  Fill marks, Share and Copy image are drawn unavailable
- **AND** New game and Open saved… are not

#### Scenario: The board arrives from a save

- **WHEN** the first board is a restored autosave and not a deal
- **THEN** the commands that waited are answered about it

### Requirement: Undo reaches back across a Restart and a replaced board

Start over and New game are the two commands that put a player's work away,
and the app SHALL let Undo take either back (`ts-engine`, "A restart is a step
of the history" and "The board a new one replaces is kept, one deep"). The
Undo and Redo controls, their shortcuts and the timeline SHALL need nothing of
their own for it: the engine's `canUndo` and `canRedo` already count a restart
and a kept board.

A loaded save replaces the board as a New game does, by `Back to last save` or
`Open saved…`, and the board left SHALL be kept the same way: it lies beyond
the loaded save's first position, past the save's own moves, and the timeline
offers it at once as *Previous board*.

A board's checkpoints are move numbers on that board. They SHALL leave with
the board when it is replaced, so that a new board starts with none, and SHALL
return with it when Undo or Redo brings it back. The app SHALL follow the
board by the number the engine gives it and not by its id, which two boards
can share and one board can change.

When an Undo brings back a board, the app SHALL say so where a hint's words
go, since the whole board has changed under a control that usually takes back
one move, and SHALL take the words down when Redo returns.

The timeline SHALL name each restart at its move, and SHALL offer the board
kept before the first move as *Previous board* and the board kept after the
last as *Next board*.

The help SHALL describe both (`help/features.md`, "Taking back Start over or a
New game").

#### Scenario: Restart, then Undo

- **WHEN** a player makes moves, chooses Start over and presses Undo
- **THEN** the moves are back, and the timeline shows the restart ahead

#### Scenario: New game, then Undo

- **WHEN** a player makes moves, sets a checkpoint, chooses New game and
  presses Undo before moving
- **THEN** the old board is back with its moves, its checkpoint and its time
- **AND** the app says the board is back and that Redo returns

#### Scenario: A move on the new board

- **WHEN** a player moves on the new board and undoes that move
- **THEN** Undo is unavailable

#### Scenario: Back to last save, then Undo past the save's first move

- **WHEN** a player saves at move 2, plays to move 4, chooses Back to last save
  and presses Undo three times
- **THEN** the first two presses take back the save's own two moves
- **AND** the third brings back the board left, at move 4, and the app says so
