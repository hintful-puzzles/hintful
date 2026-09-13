# Delete the retained upstream paths

**Owner directive, 2026-09-13**, following `retire-c-parity-requirements`:
*"please delete those no longer used upstream code paths and the related
cleanup."*

## Why

Eight games kept upstream's exact generation behavior reachable behind an option
that only their frozen C differential set, so the differential could keep
byte-matching upstream's descriptions after the shipped generator diverged:
`upstreamLooseGate` (Ascent, Bricks, Clusters, Mathrax, Salad),
`upstreamIsolatedCells` (Crossing), `upstreamRegionGrower` (Seismic — upstream's
whole region generator) and `upstreamDirtyGate` (Spokes). No player reaches any
of them, and since `retire-c-parity-requirements` no requirement asks for them.
Each is code that must be read, kept compiling and kept honest by a test that
exists only to prove the flag still changes the output.

## What Changes

- Each option is deleted with every branch, constant and helper only it used.
  The shipped path is unchanged.
- The tests that proved a flag still changes the outcome are deleted.
- Each of the eight differentials is **re-founded** rather than retired: its
  frozen fixture stays, and the test checks the recorded descriptions still
  validate, load and round-trip through the codec and that the solver finds
  each recorded board uniquely solvable. It no longer generates. What carries
  generation instead is each game's property test that every generated board
  is uniquely solvable at exactly its tier, named in the differential's header.
- `docs/games/solver-and-generator.md` § "Retained upstream paths are history,
  not the default" loses the paths it described.

## Impact

- `src/games/{ascent,bricks,clusters,crossing,mathrax,salad,seismic,spokes}/`,
  a comment in `src/games/subsets/`, `docs/games/`.
- No board a player can generate changes; no player data changes. Recorded
  upstream descriptions still load.
- No spec delta: no requirement names these options any more.
