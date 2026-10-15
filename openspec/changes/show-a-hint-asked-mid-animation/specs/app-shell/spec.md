## ADDED Requirements

### Requirement: A Hint pressed during a move's animation shows its step

A Hint press that arrives while a move is animating SHALL show the step it
answers, its words under the board and its marks on it, once the animation
ends. The Hint control SHALL NOT offer to apply a step that is not shown.

#### Scenario: Two quick presses

- **WHEN** a player presses Apply the hint and presses Hint again while the
  applied move is still animating
- **THEN** once the animation ends the next step's words and marks are shown,
  and pressing the control again applies that step
