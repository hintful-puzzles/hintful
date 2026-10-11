## MODIFIED Requirements

### Requirement: A move animates the slide, and death and the win flash

A move SHALL animate the ball sliding along its path, in a time proportional to
the square root of the distance traveled, with each gem disappearing as the ball
reaches it. Death SHALL blink the whole board red, a flash of the game's own
through `flashLength`. The win flash SHALL sweep the squares diagonally, a lit
square's floor taking the flash color, and SHALL never light a wall.

#### Scenario: A gem stays until the ball reaches it

- **WHEN** a slide that collects a gem is partway through its animation and the
  ball has not yet reached the gem's square
- **THEN** the gem is still drawn

#### Scenario: A death paints nothing of a win

- **WHEN** the ball lands on a mine and frames of the flash are drawn
- **THEN** every square's floor blinks red together, and none takes the win's
  flash color
