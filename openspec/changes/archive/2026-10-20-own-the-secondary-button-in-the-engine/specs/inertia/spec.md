## MODIFIED Requirements

### Requirement: Controls: The swipe works on the secondary button

The whole swipe gesture SHALL also work on the **secondary** button. Inertia
binds nothing to the secondary button and declares `ignoresSecondaryButton`,
so a held finger aiming the swipe is never promoted to it, and a mouse's
right button reaches the game as the left one.

#### Scenario: A held finger still aims

- **WHEN** a touch press on the ball is held still past the long-press
  interval, dragged out to the east and released
- **THEN** the ball sets off east

#### Scenario: A right-button swipe plays as a left one

- **WHEN** a mouse presses the ball with the right button, drags out to the
  east and releases
- **THEN** the ball sets off east
