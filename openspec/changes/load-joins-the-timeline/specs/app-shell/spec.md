## MODIFIED Requirements

### Requirement: The Bar and the Menu are one ordered list, cut once

The Bar and the Menu SHALL be drawn from one ordered list of commands. The Bar
SHALL show the leading entries of that list and a button that opens the Menu,
and the Menu SHALL hold every entry the Bar does not show, in the list's
order: its contents are a suffix of the list and never a selection from it.
The Bar SHALL show Undo, Redo, Hint and Check & save at every size, and Undo,
Redo and Check & save in a game with no hint. Back to last save SHALL be the
Menu's row after the move number.

#### Scenario: The Menu on a phone

- **WHEN** a player on a phone opens the Menu
- **THEN** it does not contain Undo, Redo, Hint or Check & save
- **AND** its first rows are the entries of the list that follow the last one
  the Bar shows

#### Scenario: A game with no hint

- **WHEN** a player opens the Menu of a game that has no hint
- **THEN** the Bar shows Undo, Redo and Check & save, and Back to last save is
  in the Menu after the move number
