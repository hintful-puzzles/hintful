## REMOVED Requirements

### Requirement: A hint-executed placement plays at the hint-step duration

**Reason**: `engine-hints`, "A hint-executed move plays its animation at one duration",
holds it for every game: the midend scales whatever `animLength` returns, and
Unruly's `animLength` is positive for a placement by `unruly`, "A placement
animates as a growing fill". Unruly writes no code for the stretch
(`src/games/unruly/index.ts`, `animLength`).
