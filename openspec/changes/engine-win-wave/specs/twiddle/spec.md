## ADDED Requirements

### Requirement: The Twiddle completion flash lights each tile's face

The completion flash SHALL sweep the tiles diagonally, a tile's position being
its place in the grid. A lit tile's face SHALL drop to the well's plain
surface inside its bevel, a tile's face being the lifted surface already, and
SHALL keep its number and its orientation mark.

#### Scenario: The flash leaves a tile

- **WHEN** the flash has passed a tile
- **THEN** that tile alone is repainted, with its own face

## REMOVED Requirements

### Requirement: Only a genuine completion flashes the background

**Reason**: Which completions flash is the engine's rule for every game
(`ts-engine`, "The engine derives a board's history from its position"), and
the flash is drawn on the tiles' faces, not the background.

**Migration**: None. Nothing a player holds refers to the flash.
