## ADDED Requirements

### Requirement: A grid too large for a game is refused in one sentence

A game whose `validateParams` refuses a grid because its width times its
height is more than the game can hold SHALL return the engine's
`AREA_TOO_LARGE`, "Width times height must not be unreasonably large.", and no
sentence of its own. Where the ceiling sits SHALL stay the game's own.

#### Scenario: Two games with different ceilings

- **WHEN** Net is asked for `1001x1000` and Mines for `16385x16384n10`
- **THEN** each refuses with "Width times height must not be unreasonably
  large.", Net because the grid is past a million squares and Mines because it
  is past 2²⁸
