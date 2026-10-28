## ADDED Requirements

### Requirement: The Marks key shows whether pencil mode is on

The Marks key SHALL show whether the game's pencil mode is on, drawn lit as the
bar draws a mode in force and named "on" or "off" to a screen reader, whichever
input switched the mode: the key itself, the P shortcut, a secondary press, or
a tap in Right-click mode. The app SHALL read the mode from the game's `Ui`
after every transition, through the engine, and SHALL keep no copy of its own.

#### Scenario: A right press switches the mode on

- **GIVEN** a note-taking game with sticky pencil mode on
- **WHEN** the player right-clicks a cell
- **THEN** the Marks key is lit, and a press on it turns the mode off and the
  key with it

#### Scenario: The mode the app is told is the mode the game holds

- **WHEN** any input, Undo included, is processed in a game that takes notes
- **THEN** the pencil mode the engine reports is the one on the game's `Ui`
