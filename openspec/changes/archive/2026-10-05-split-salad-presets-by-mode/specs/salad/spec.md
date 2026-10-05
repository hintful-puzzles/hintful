## MODIFIED Requirements

### Requirement: Salad's menu offers both of its difficulties

Salad's presets SHALL include boards at each difficulty the game deals, so a player reaches Normal from the menu and every cross-game guard that deals from a game's presets deals a Normal Salad board. The Normal presets SHALL be shapes whose deal stays well under a second. The menu SHALL hold one section for each game mode, and within a section the Normal presets SHALL follow the Easy ones.

#### Scenario: Normal is on the menu

- **WHEN** Salad's preset menu is read
- **THEN** it holds presets titled Normal as well as Easy, in both game modes,
  and within each mode's section the Normal ones come last

#### Scenario: A cross-game guard deals a Normal board

- **WHEN** a cross-game guard takes Salad's presets one per value of every
  field they vary
- **THEN** difficulty is one of those fields, and a Normal board is among the
  boards it deals

#### Scenario: Each mode has a section

- **WHEN** Salad's preset menu is read
- **THEN** its top level is two sections, one for each game mode, and every
  preset sits in the section of its own mode
