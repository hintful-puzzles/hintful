## MODIFIED Requirements

### Requirement: Preferences: A star can bring the crosses it rules out

Star Battle SHALL declare what a star rules out, for the engine's `auto-cross`
preference: every blank cell touching a new star, and the blank cells of its
row, column or region where the star is the last that one holds. Removing the
star SHALL leave the crosses.

#### Scenario: The last star of a row

- **WHEN** the preference is on and a star is placed that is the last its
  row holds
- **THEN** the blank cells touching the star and the blank cells of the row
  are crossed out, and one Undo takes them back with the star

### Requirement: Hint: A first click toward a step's mark keeps the step

A step that asks for a cross SHALL stay on show when the player's move puts
a star on one of its blank cells, and a step that asks for a star when the
move puts a cross there, since one more click of that button makes the mark
asked for. The gesture that plays a step SHALL use the button that makes
each mark in one click.

#### Scenario: Reaching a hinted star with the right button

- **WHEN** a step asks for a star on a blank cell and the player
  right-clicks it twice
- **THEN** the step is still shown after the first click and is completed by
  the second
