## ADDED Requirements

### Requirement: Seeded random loop generation

The engine SHALL provide `src/engine/loopgen.ts` exposing
`generateLoop(grid, board, rng, bias?)` which colors every face of `grid`
inside (white) or outside (black) so that the white/black boundary is a single
closed loop, writing the coloring into `board`. Candidate faces SHALL be ordered by score,
then their random score field, then face index, so that no ordering depends on
anything but the random stream. An optional `bias` callback (invoked with a face
tentatively set, then restored, then notified on commit; consuming no randomness)
SHALL let a consumer bias generation toward desirable loops. Given a fixed seed,
the generated loop SHALL be reproducible across builds, because a seeded Loopy
game ID regenerates its board from it.

#### Scenario: Loop generation yields a single closed loop

- **WHEN** `generateLoop` runs on a square grid with a fixed seed and no bias
- **THEN** the resulting white/black face coloring has a boundary that is one
  closed loop, and the same seed yields the same coloring every run

### Requirement: Grid descriptions round-trip and keep building the same grid

The grid module (`src/engine/grid/`) SHALL provide `gridNewDesc(type, width, height, rng)` producing a grid
description string, and `gridValidateDesc(type, width, height, desc)` returning
an error message for a rejected description and null otherwise.

`gridNewDesc` SHALL be the **only** randomness-consuming function in the module.
It SHALL return `"0"` for the triangular tiling and null for the other twelve
periodic tilings; `gridValidateDesc` SHALL reject a description supplied for a
tiling that does not use one.

For the aperiodic tilings, description generation SHALL be a deterministic
function of the random stream and stable across builds, so a seeded game ID keeps
its grid. Weight constants SHALL be integers and SHALL NOT be recomputed from
irrational expressions.

Where a stored description is replayed and its coordinates are exhausted, the
fixed-seed fallback generator SHALL behave the same in every build — created
lazily at the same point and shared thereafter — because divergence yields a
different grid for the same description with no detectable error.

Description parsing SHALL validate the length of the description before deriving
a coordinate count from it.

#### Scenario: A generated description round-trips

- **WHEN** `gridNewDesc` produces a description for an aperiodic tiling
- **THEN** `gridValidateDesc` accepts it and `gridNew` builds a grid from it

#### Scenario: Description generation is stable for a seed

- **WHEN** `gridNewDesc` is called for an aperiodic tiling with a given seed
- **THEN** the description string it produces matches the one the committed
  fixture records for that seed

#### Scenario: A malformed description is rejected rather than crashing

- **WHEN** `gridValidateDesc` is given an empty, truncated, or otherwise
  malformed description, including one too short to carry a coordinate count
- **THEN** it returns an error message, and no construction is attempted

## MODIFIED Requirements

### Requirement: Shared planar-grid data structure and deterministic square tiling

The engine SHALL provide `src/engine/grid/index.ts` exposing a general
planar-grid data structure — `Grid` with arrays of `GridFace`, `GridEdge` and
`GridDot`, a bounding box, and a `tileSize` — with full reference incidence: each
edge references its two dots and its two faces (a null face reference denotes the
infinite exterior); each face references its clockwise-ordered edges and dots
(edge `k` joins dots `k` and `k+1`); each dot references its clockwise-ordered
edges and faces. The structure SHALL be immutable after construction and shared
by reference (no refcount; GC replaces `grid_free`). It SHALL provide
`gridNewSquare(width, height)` building the square tiling **deterministically**
from `(width, height)` alone (no randomness, no floating point): one four-dot
face per cell with `tileSize = 20`, shared corner dots deduplicated. A shared
`makeConsistent` step SHALL derive the edges (deduplicated by their dot pair,
assigning each edge its one or two faces), the per-face edge lists, the per-dot
edge and face rings (walked clockwise then anticlockwise past the exterior face),
and the bounding box. All ordering tie-breaks SHALL be by array index.

That module is a **barrel**, and its own doc comment tells callers to import from
it rather than from the parts (`grid-core.ts`, `grid-desc.ts`, `grid-geometry.ts`,
`grid-trim.ts`, the `grid-tilings*` family and `tilings/`), which live beside it
under `src/engine/grid/`. The barrel status is load-bearing beyond convenience:
`scripts/feedback-probe.mjs` counts a test importing the barrel as a local test
of every part it re-exports.

#### Scenario: A square grid has the expected incidence

- **WHEN** `gridNewSquare(w, h)` is built
- **THEN** it has `w*h` faces, each a four-sided face whose edges join its
  consecutive corner dots, every interior edge references two faces and every
  border edge references one face (the other being the exterior), and shared
  corner dots are a single dot instance

#### Scenario: Square construction is deterministic

- **WHEN** `gridNewSquare(w, h)` is built twice with the same `w`, `h`
- **THEN** the two grids have identical faces, edges and dots in the same order
  (no randomness enters square construction)

### Requirement: Periodic tilings

The grid module (`src/engine/grid/`) SHALL provide a generator for each of the 14 periodic tilings —
square, honeycomb, triangular, snub-square, Cairo, great-hexagonal, Kagome,
octagonal, kites, floret, dodecagonal, great-dodecagonal,
great-great-dodecagonal and compass-dodecagonal — selected by a `GridType`.

Every periodic generator SHALL be a pure function of `(width, height)` (and, for
triangular, its version desc): it SHALL consume no randomness and SHALL use
**exact integer arithmetic only**, because shared corner dots are deduplicated
by exact coordinate equality and a fractional coordinate would silently produce
duplicate dots rather than a visible error. An integer division SHALL
truncate (`Math.trunc`) rather than yield a fraction.

Each generator's face and dot emission order SHALL be stable across builds, not
merely the resulting shape: a Loopy description indexes its clues by face, so
reordering faces would give a stored game ID a different board.

The triangular tiling SHALL support both of upstream's algorithms, selected by
its version desc: an absent desc selects the legacy generator (which leaves
ragged boundary "ears") and the desc `"0"` selects the current ear-trimmed one.

#### Scenario: Every periodic tiling builds a consistent grid

- **WHEN** any periodic tiling is built at a legal size
- **THEN** the grid is fully linked — every face's edges join its consecutive
  dots, every edge references one or two faces (a null face being the exterior),
  and every dot's edge and face rings are complete

#### Scenario: Periodic generation is deterministic and integer-exact

- **WHEN** the same periodic tiling is built twice at the same size
- **THEN** the two grids are identical in every dot coordinate, edge and face,
  and in the same order; and no dot coordinate is fractional

#### Scenario: Triangular honors its version desc

- **WHEN** the triangular tiling is built with no desc and again with the desc
  `"0"`
- **THEN** the two grids differ, the former retaining upstream's ragged boundary
  and the latter being ear-trimmed

### Requirement: Aperiodic tilings

The grid module (`src/engine/grid/`) SHALL provide a generator for each of the four aperiodic tilings —
Penrose P2 (kite/dart), Penrose P3 (thick/thin rhombs), hats and spectres —
selected by the same `GridType`, completing the collection at 18 tilings.

Each aperiodic generator SHALL be a **pure deterministic function of
`(width, height, desc)`**: all randomness SHALL be confined to grid-description
generation. Its arithmetic SHALL be exact — Penrose in ℤ[√5], spectres in ℤ[√3],
hats in plain integers on a triangular lattice — with the irrational part
converted to integer pixels exactly once, at the tiling-to-grid boundary, by
`nTimesRootK`. The rational and irrational parts SHALL be scaled separately and
then summed, so that exactly one rounding occurs.

Dot coordinates SHALL be normalized so that no coordinate is negative zero,
because dot deduplication is by exact coordinate equality and a negative zero
produces a structurally correct grid that nonetheless differs from the one the
same description built before.

Face emission order SHALL be stable across builds, for the reason "Periodic
tilings" gives: a stored description indexes its clues by face.

Legacy (pre-rewrite) Penrose grid descriptions — those beginning with `'G'` —
SHALL be rejected with an explicit error naming them, rather than silently
falling through to a misleading parse error.

#### Scenario: Every aperiodic tiling builds a consistent grid

- **WHEN** any aperiodic tiling is built at a legal size from a valid
  description
- **THEN** the grid is fully linked — every face's edges join its consecutive
  dots, every edge references one or two faces (a null face being the exterior),
  and every dot's edge and face rings are complete

#### Scenario: Aperiodic construction is deterministic given a description

- **WHEN** the same aperiodic tiling is built twice from the same
  `(width, height, desc)`
- **THEN** the two grids are identical in every dot coordinate, edge and face,
  and in the same order, and no dot coordinate is fractional or negative zero

#### Scenario: A legacy Penrose description is rejected

- **WHEN** `gridNew` or `gridValidateDesc` is given a Penrose description
  beginning with `'G'`
- **THEN** it reports an error identifying the description as an unsupported
  legacy format

## REMOVED Requirements

### Requirement: RNG-faithful random loop generation

**Reason**: It required reproducing upstream `generate_loop`'s RNG draw order exactly, and its heading is named for that fidelity. Matching upstream's C was a porting tool; with the port finished it is not a requirement (owner, 2026-09-13), and a heading or scenario that names it cannot be renamed by a `MODIFIED` block.

**Migration**: Replaced by "Seeded random loop generation", which keeps the single-loop result, the face ordering, the bias contract and reproducibility from a seed.

### Requirement: Grid description round-trip

**Reason**: It required aperiodic description generation and the fixed-seed fallback to reproduce upstream exactly, with a scenario comparing against "the one upstream produces". Matching upstream's C was a porting tool; with the port finished it is not a requirement (owner, 2026-09-13), and a heading or scenario that names it cannot be renamed by a `MODIFIED` block.

**Migration**: Replaced by "Grid descriptions round-trip and keep building the same grid", which keeps the round-trip, the validation, and stability of a seed's description and of a stored description across builds.
