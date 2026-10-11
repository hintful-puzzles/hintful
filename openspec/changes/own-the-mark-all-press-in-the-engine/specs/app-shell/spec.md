## MODIFIED Requirements

### Requirement: Everything that depends on the game is in the Game controls

Everything that depends on the game in play SHALL be in the Game controls
panel and nowhere else, in this order in every game: its keys, the note
toggle, and its own commands (Fill or Update marks, Reference). Each SHALL be
present by what the game is, so that no game is listed: the keys and the note
toggle by the keys the game asks for, mark-all by a `markAll` hook, Reference
by a `reference` hook. A player does not know to look in a menu for something
only one game has.

#### Scenario: A game with mark-all

- **WHEN** the screen renders for a game that has a `markAll` hook
- **THEN** the Game controls panel contains the mark-all command
- **AND** neither the Bar nor the Menu does

#### Scenario: A game with a reference

- **WHEN** the screen renders for Dominosa
- **THEN** the Reference toggle is in the Game controls panel and not in the
  Menu
