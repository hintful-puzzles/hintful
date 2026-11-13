# Tasks

## 1. Trial

- [x] 1.1 Write the design: a step's terms, a conclusion's named arms, mark roles, how a firing is shown, and the adapter, read against the earlier withdrawals
- [x] 1.2 Build the comparison of every hint walk's words and marks, and see it fail on a planted change (`src/engine/hint-walk-fingerprint.test.ts`, snapshots taken at `HEAD` for Unruly, Singles and Boats; a planted outline-to-stripes swap failed Unruly's)
- [ ] 1.3 Move Unruly, Singles and one of Boats or Bridges onto it, and measure the lines that went against the report's prediction
  - [x] Unruly (`a6ccdf4b`): `says` in the schema, compiler and runtime; `engine/described-hint.ts`; hint, keep-track and kinds engine-built. Comparison: the same words, and marks differ only where the old ones were defective (design § "What the trial found"). **Lines**: measure `git show --stat a6ccdf4b` for `unruly/` against the report's ~90 + 71 + 72 + 123 (A, B, C, D) for it
  - [x] Singles: `says.arms`, `says.marks.strand` and `reads`, and `engine/described-firing-hint.ts`; every walk's hash equals `HEAD`'s on the snapshot's boards and on 40 boards a preset (design § "Singles, built"). **Lines**: 400 of hint glue out of `index.ts` and `solver.ts`, 138 in (66 of them yaml)
  - [x] Boats (design § "Boats, built"): in this order, each its own commit, each compared by the fingerprint
    - [x] The engine (`95bf98c3`): tier escalation and the plan cap, consequences from the marks' diff, a journey of legs over a firing's targets, per-leg keep-track, in `describedFiringHint`
    - [x] The sixteen techniques that `says` carries, the three trials keeping a reason callback beside them; every step of 216 boards equals `HEAD`'s modulo the order of a highlight's evidence
    - [x] The trials' breach stays a reason callback: it needs the validator, and no `with` term reaches that
  - [x] Bridges (design § "Bridges, built"): `engine/described-edge-hint.ts` for edge facts, seven techniques (eight kinds) that `say`, the game's own keep-track

## 2. The catalog

- [ ] 2.1 Move the rest of the described games, a family at a time, each compared
  - [x] Light Up (design § "Light Up, built"): `says.shown: each`, `consequences: false`, the engine's `refreshHintStep`
  - [x] Mosaic (design § "Mosaic, built"): `move(targets, state)`, `refreshHintStep`
  - [x] Clusters (design § "Clusters, built"): `each`, five arms of `refute`, tile terms
  - [x] Star Battle (design § "Star Battle, built"): `each`-free firings, thirteen techniques, fifteen kinds
  - [x] The per-fact `says` (design § "Bricks, built"): `says.fact`, read at each `place` or `strike`
  - [x] Bricks (design § "Bricks, built"): every technique `each`, `three`'s run per square
  - [x] Range (design § "Range, built"): `each`, `reach`'s run and sight per square
  - [x] Sticks (design § "Sticks, built"): `shown: legs`, five techniques with per-fact terms and outline
  - [ ] Seismic: its `cull` strikes candidates, so it waits for the candidate games' shape
  - [ ] **Next, in this order** (2026-11-13: the survey in design.md found no game left that is a plain Clusters-shaped move, so each family needs its engine shape designed first, from the game that is nearest it, then the family's games moved one at a time):
    - [ ] The edge shape (designed and built on Separate, design § "Separate, built"; Palisade done, § "Palisade, built"; Dominosa, Pearl, Tracks, Path, Spokes next): Separate, Palisade, Dominosa, Pearl, Tracks, Path, Spokes, on Bridges' `describedEdgeHint` (`engine/described-edge-hint.ts`); read what it left per game and what the others need beyond it
    - [ ] The link shape: Tents, Galaxies, Signpost, Rect
    - [ ] The shape for state the walk updates between steps: Slant (merge marks), Net (notes), Magnets (hidden firings), Map (removed-color dots)
  - [ ] The other cell games that place or strike a firing's squares (`describedFiringHint`): Tents, Separate, Abcd, Dominosa, Pearl, Slant, Magnets, Net, Tracks, Palisade, Path, Spokes, Undead, Seismic, Map, Galaxies, Rect, Crossing, Signpost
  - [ ] The candidate games (a Latin family's `latinPremise` and `runLatinCandidatePlan`: Unequal, Adjacent, Keen, Towers, Group, Solo, Mathrax, Rome, Salad): the engine's candidate-elimination shape is a design of its own, read first
- [ ] 2.2 Remove what no game uses, and update `docs/descriptions.md`, `docs/hints.md` and the skeletons
- [x] 2.3 Check and fix the two defects named under "Fixed in passing" (Mines' dead region arm removed in `1118d723`; Loopy's `closed` throw is unreachable, since a closed loop with every clue met is solved and one with a clue unmet is a mistake, so it stays as the invariant's guard)
