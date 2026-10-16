## ADDED Requirements

### Requirement: Hint: Cube has a hint that says what each roll collects

Cube SHALL have a hint on every board its generator deals within the hint's
reach, and SHALL say plainly where a board is beyond it. Each step SHALL offer
a roll, mark where it goes, and say what it does toward collecting the blue
squares.

#### Scenario: A hint on a dealt board

- **WHEN** a player presses Hint on a freshly dealt Cube board of the default
  size
- **THEN** a step names a roll, marks the square it rolls to, and says what it
  collects or sets up
