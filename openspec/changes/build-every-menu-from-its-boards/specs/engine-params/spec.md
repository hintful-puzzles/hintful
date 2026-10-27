## MODIFIED Requirements

### Requirement: The preset menu is a grid

A game's preset menu SHALL list its boards in the game's order, each at the
tiers it is offered at, and after them one board for each thing that is
neither a size nor a tier. The engine SHALL build every game's menu from the
boards the game names, so that no game writes its menu out by hand, and a
guard SHALL hold every registered game's menu to this shape, read off the
menu itself. A game whose params have a size SHALL offer at least three
boards.

#### Scenario: A game builds its menu from its boards

- **WHEN** a tiered game names three boards and no options
- **THEN** its menu is those three boards, each at every tier of its difficulty
  item, easiest first
