## ADDED Requirements

### Requirement: Black Box's win flash sweeps the squares of the revealed box

A reveal is the win, and Black Box SHALL declare no flash of its own for it:
the win flash SHALL sweep the squares of the box diagonally. A lit square
SHALL be filled with the flash color and SHALL keep the ball it holds. A laser
square SHALL never be lit.

#### Scenario: The Solve command reveals without a flash

- **WHEN** the Solve command reveals the box
- **THEN** the balls are shown and no flash runs
