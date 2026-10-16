## ADDED Requirements

### Requirement: A hint asked while an executed step animates shows the next step

When `midend.hint()` is called while the move of a step `executeHint` played
is still animating, the midend SHALL first settle that step, as its landing
would, and then display the step after it. The landing SHALL NOT hide the step
so displayed, so the Hint control never offers to apply a step that is not
shown.

#### Scenario: Two quick presses

- **WHEN** a player presses Apply the hint and presses Hint again while the
  applied move is still animating
- **THEN** the next step's words and marks are shown, they are still shown once
  the move lands, and pressing the control again applies that step
