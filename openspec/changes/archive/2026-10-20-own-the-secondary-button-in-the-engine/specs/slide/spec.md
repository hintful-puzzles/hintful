## MODIFIED Requirements

### Requirement: Controls: Either pointer button moves a Slide block

The right button's press, drag and release SHALL do what the left button's
do. Slide binds nothing to the secondary button and declares
`ignoresSecondaryButton`, so a touch held still before it drags stays a left
press, and a mouse's right button reaches the game as the left one.

#### Scenario: A press held before the drag

- **WHEN** a block is pressed with the right button, dragged to a cell it can
  reach and released
- **THEN** the block moves there, as one move, as a left drag moves it
