# Cuts: grid

Requirements: 33 before, 26 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| The grid module is imported through its barrel | process | `docs/games/engine-catalog.md` § "`grid/index.ts` — planar-grid geometry (upstream `grid.c`)" says "Import the barrel, not the parts", and `docs/test-strength.md` § "2a. `npm run probe` — the cheap probe, kept" says the probe counts a test importing a barrel as the module's own. |
| The square tiling is built deterministically | duplicate | "Periodic generators are pure and integer-exact" (no randomness, no fraction, identical order on a rebuild) and "Every tiling builds a fully linked grid" state it of every periodic tiling, square included. |
| "one four-dot face per cell with `tileSize = 20`" (same requirement) | declared | `gridNewSquare` and `gridSizeFor` in `src/engine/grid/grid-tilings.ts`. |
| Periodic tilings: the list of fourteen tiling names | declared | `PERIODIC_GRID_TYPES` and `ALL_GRID_TYPES` in `grid-tilings.ts`, which `gridNew` switches over. The requirement stays as "Every tiling builds a fully linked grid". |
| Aperiodic tilings | duplicate | Merged into "Every tiling builds a fully linked grid", which names the four and keeps this requirement's scenario. |
| Aperiodic generators are deterministic functions of their description | duplicate | Merged into "gridNewDesc is the only function that consumes randomness" (`gridNew` is a deterministic function of type, size and desc), with its scenario. |
| "with no reference count" (A grid is immutable once built and shared by reference) | port | Says what upstream's C had; nothing in TypeScript could count one. |
| "walked clockwise and then anticlockwise past the exterior face" and the same clause in its scenario (makeConsistent derives the incidence from the faces' dots) | how | The way the ring is walked. That a boundary dot's rings are complete, with null for the exterior, stays. |
| "Eligibility SHALL be decided by exact integer arithmetic on squared lengths; only the perpendicular distance comparison is floating point." (Nearest-edge hit testing) | how | Which arithmetic picks the edge. What it returns, and that a tie goes to the lowest index, stays. |
| The incenter's quality is asserted against an independent optimum | process | `docs/test-strength.md` § "4a. A frozen capture used as a *quality bar* is on the wrong side of the line" gives the rule with this test as its worked example. The promise itself, the scenario bounding the shortfall, moved to "The incenter is rounded to the nearest integer point". |
| "The sweep SHALL enumerate its tilings from `ALL_GRID_TYPES`" (same requirement) | process | `AGENTS.md` § "What the project is for" ("a guard derives its population from what each game is"); `grid-incenter.test.ts` asserts its cases equal `ALL_GRID_TYPES`. |
| Loop generation orders candidates by the random stream alone | how | The three sort keys, which the header of `src/engine/loopgen.ts` records. The rule they serve, that no ordering depends on anything but the random stream and then the face index, is now a clause of "Seeded random loop generation". |
| Description parsing checks length before counting coordinates | duplicate | "Grid descriptions round-trip and keep building the same grid", scenario "A malformed description is rejected rather than crashing" (a description too short to carry a coordinate count returns an error). |
