## ADDED Requirements

### Requirement: Every default and preset passes validation for generation

A game's default params and every leaf of its preset menu SHALL pass
`paramsError(game, p, true)`: no item's `bounds`, no choice's list and no rule
of the game's `validateParams`, generation-only or not, SHALL refuse a board
the game itself offers.

#### Scenario: A generation-only bound is tightened past a preset

- **WHEN** a game lowers the largest area its `validateParams` will generate
  below the area of one of its presets
- **THEN** the guard fails, naming the game, and the preset or the bound is
  changed before a player can choose a board the game refuses to deal
