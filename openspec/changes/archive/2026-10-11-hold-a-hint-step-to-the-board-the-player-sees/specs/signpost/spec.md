## MODIFIED Requirements

### Requirement: A Signpost hint asks for no link the board already holds

Every step the hint shows SHALL be a link the board does not hold. A link
between consecutive numbers, which the board makes itself, SHALL NOT be shown
as a step for the player to make: the plan SHALL make those links on its own
copy after each step, as the board does after each move.

#### Scenario: A plan made afresh

- **WHEN** a hint is asked for on a board with no plan on display, as on the
  fresh 4×4 board `1e9cfgddgadcaaabh16a`
- **THEN** the step shown links two squares the board does not hold linked

#### Scenario: A plan followed to its end

- **WHEN** the plan made on the fresh 4×4 board `1e9cfgddgadcaaabh16a` is
  followed step by step
- **THEN** every step links two squares the board does not hold linked when
  it is reached, and none says a number "must come right after" another
