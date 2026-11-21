## REMOVED Requirements

### Requirement: Params: Netslide refuses a grid past a million squares

**Reason**: The engine bounds every board's area (`engine-params`, "A grid too large for a game is refused in one sentence"), below Netslide's own former ceiling, and Netslide refuses nothing else.

**Migration**: None; Netslide has no `validateParams`.
