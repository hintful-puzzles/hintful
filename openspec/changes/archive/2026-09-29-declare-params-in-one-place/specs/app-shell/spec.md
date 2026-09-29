## REMOVED Requirements

### Requirement: The type header names an option by the name the game declares

**Reason**: The header's per-game template formatters, whose hand-spelled
option lists this requirement policed, are deleted. The header is now the
engine's label of the params, composed from the game's own `paramConfig` items,
so there is no second list for an option name to be copied into.

**Migration**: `ts-engine` "One describer labels every params set", whose
scenario "A tier renders as its declared name" carries the surviving promise.
