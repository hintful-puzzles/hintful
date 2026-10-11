## ADDED Requirements

### Requirement: A number-pad key that moves Ascent's cursor types nothing

Under "Move cursor", each of the number pad's eight direction digits SHALL
move the cursor and do nothing else: none SHALL begin or extend a typed
number, on whatever square the cursor lands. The pad's 5 and 0, which name no
direction, SHALL type as the top row's do.

#### Scenario: A diagonal onto an empty square

- **WHEN** "Numpad inputs" is "Move cursor", the cursor is in the top-left
  corner of a Classic board, and the number pad's 3 is pressed
- **THEN** the cursor is one square down and one right, and no number is being
  typed there
