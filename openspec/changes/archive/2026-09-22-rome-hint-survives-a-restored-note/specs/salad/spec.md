## ADDED Requirements

### Requirement: Salad's hint strikes a circled square's empty-square mark wherever the circle came from

Salad's hint SHALL offer the strike of a circled square's "might be empty"
pencil mark as a firing of its own whenever the board holds one, as well as
the leg that follows a circle the hint itself places. A circle reaches the
board without that leg when the player places it, or takes the hint's circle
step and then goes their own way. The mark would then hide the placement
behind it, and the plan could not explain that placement.

#### Scenario: The hint's own circle, recomputed

- **WHEN** the hint is walked one first step at a time on the pinned board,
  so each circle is placed without the leg that tidies it
- **THEN** the walk strikes the leftover mark and reaches a solved board

#### Scenario: The player's circle

- **WHEN** the player circles a square whose marks still include "might be
  empty", and the circle is right
- **THEN** the hint's next step strikes that mark, and the walk reaches a
  solved board
