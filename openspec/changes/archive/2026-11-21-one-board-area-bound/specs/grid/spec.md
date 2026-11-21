## REMOVED Requirements

### Requirement: Grid parameter validation

**Reason**: The engine holds every board's width times height to `MAX_BOARD_AREA`, under which no tiling's coordinates or object count can overflow, so the geometry has no size to refuse.

**Migration**: A consuming game's sizes are bounded by `dimensionParamConfig` (`engine-params`); its minimum sizes stay its own.
