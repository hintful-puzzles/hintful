## MODIFIED Requirements

### Requirement: The puzzle screen is three panels, and every command is in exactly one

The puzzle screen SHALL present its controls as three panels, at every window
size: a **Bar**, a **Menu**, and a **Game controls** panel where the game has
any. A command a panel offers SHALL be in exactly one place across the three,
so that a player never has two surfaces to learn. Only the readout row above
the board and the notification that ends a game SHALL repeat a panel's
command. The way out of a deal still being looked for SHALL be beside the
words that say so, under the board, and nowhere else.

#### Scenario: A command is offered twice

- **WHEN** a command in the puzzle screen's command map is reachable from more
  than one place across the three panels and the words under the board
- **THEN** a test fails, naming the command and both places

#### Scenario: A command has no home

- **WHEN** a command in the command map is reachable from nowhere in the three
  panels, and the guard's ledger gives no reason for it
- **THEN** a test fails, naming the command

#### Scenario: A command that is deliberately in no panel

- **WHEN** a command is reached another way, as Change type is from the type
  shown in the readout row and the Marks shortcut is from the key panel
- **THEN** the guard's ledger names it with its reason, and fails when the
  command gains a control in a panel or leaves the command map

#### Scenario: A game with no controls of its own

- **WHEN** a game has no reference panel, no Mark-all and no on-screen keys
- **THEN** no Game controls panel is drawn, and the Bar and the Menu are as on
  any other game

#### Scenario: Share on a solved board

- **WHEN** a player solves a board and the notification appears over it
- **THEN** Share is offered there, and the Menu's Share row is still the one
  place the panels offer it

### Requirement: The Bar and the Menu are one ordered list, cut once

The Bar and the Menu SHALL be drawn from one ordered list of commands. The Bar
SHALL show the leading entries of that list and a button that opens the Menu,
and the Menu SHALL hold every entry the Bar does not show, in the list's
order: its contents are a suffix of the list and never a selection from it.
The first four entries SHALL be on the Bar at every size: Undo, Redo, Hint and
Check & save, or in a game with no hint Undo, Redo, Check & save and Back to
last save.

#### Scenario: The Menu on a phone

- **WHEN** a player on a phone opens the Menu
- **THEN** it does not contain Undo, Redo, Hint or Check & save
- **AND** its first rows are the entries of the list that follow the last one
  the Bar shows

#### Scenario: A game with no hint

- **WHEN** a player on a phone opens the Menu of a game that has no hint
- **THEN** it does not contain Back to last save, which is the Bar's fourth
  entry there

## ADDED Requirements

### Requirement: The notification that ends a game offers what comes next

When a game ends, and unless the player has switched it off in the
preferences, a notification over the board SHALL offer New game. On a solved
board it SHALL also offer Share, Change type and the way back to all puzzles,
and on a lost board Start over and, where a move can be taken back, Undo. It
SHALL offer no command that has no home elsewhere on the screen.

#### Scenario: A board finished by Solve

- **WHEN** Solve finishes a board
- **THEN** the notification offers New game, Share, Change type and the way
  back to all puzzles, as it does on a board the player solved
