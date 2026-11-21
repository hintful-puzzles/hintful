## REMOVED Requirements

### Requirement: Params: Flip refuses a size it cannot use

**Reason**: The engine bounds every board's area (`engine-params`, "A grid too large for a game is refused in one sentence"), well inside what Flip's arithmetic holds.

**Migration**: None; the engine's refusal replaces Flip's.
