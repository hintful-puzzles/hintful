## MODIFIED Requirements

### Requirement: Tents takes a cursor and direct keys

Select SHALL set the keyboard cursor's square to a tent, and select2 to a
non-tent, or clear it. The literal keys `T`, `N` and `B` SHALL set the cursor
square directly: to a tent, to a non-tent and to blank. Shift or Ctrl with an
arrow SHALL move the cursor and set the square it leaves and the square it
enters to a non-tent where blank, and with Ctrl where a tent too.

#### Scenario: A letter sets the cursor square

- **WHEN** the cursor is on a blank square and `T` is pressed
- **THEN** the square becomes a tent

#### Scenario: A shifted arrow paints grass

- **WHEN** the cursor is on a blank square and Shift with an arrow moves it
  onto another blank square
- **THEN** one move makes both squares non-tents
- **AND** a tent under either is left alone, where Ctrl would have made it a
  non-tent
