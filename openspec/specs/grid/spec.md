# grid Specification

## Purpose
The shared planar-grid layer for games played on the dots, edges and faces of an
arbitrary tiling rather than a square array. It specifies the grid structure,
the periodic and aperiodic tilings with their sizing, validation, description
round-trip and patch trimming, the geometric queries that input and labels need,
and the random loop generator built on it.

## Requirements

### Requirement: The grid is a planar structure with full reference incidence

The engine SHALL provide a general planar-grid structure: `Grid`, with arrays of
`GridFace`, `GridEdge` and `GridDot`, a bounding box and a `tileSize`. Each edge
SHALL reference its two dots and its two faces, a null face reference denoting
the infinite exterior. Each face SHALL reference its clockwise-ordered edges and
dots, edge `k` joining dots `k` and `k+1`. Each dot SHALL reference its
clockwise-ordered edges and faces.

#### Scenario: An edge on the border has the exterior on one side

- **WHEN** an edge of a built grid lies on the grid's boundary
- **THEN** one of its two face references is a face and the other is null

### Requirement: A grid is immutable once built and shared by reference

A `Grid` SHALL be immutable after construction and SHALL be shared by reference.
The one write after construction SHALL be the incenter
that "Face incenter for label placement" caches on a face.

#### Scenario: A built grid is held in more than one place

- **WHEN** a consumer keeps a built grid in more than one of its values
- **THEN** each holds the same `Grid` object, and none alters its faces, edges
  or dots

### Requirement: makeConsistent derives the incidence from the faces' dots

A shared `makeConsistent` step SHALL derive, from faces that know their
clockwise dots: the edges, deduplicated by their dot pair, each assigned its one
or two faces; the per-face edge lists; the per-dot edge and face rings, complete
even at a dot on the boundary; and the bounding box.
Every ordering tie-break in building a grid SHALL be by array index.

#### Scenario: Two faces share a side

- **WHEN** two faces list the same pair of dots as consecutive corners
- **THEN** `makeConsistent` makes one edge for the pair, referencing both faces

#### Scenario: A dot on the boundary gets a complete ring

- **WHEN** a dot touches the exterior face
- **THEN** its edge and face rings are complete, and its face ring holds null
  for the exterior

### Requirement: Every tiling builds a fully linked grid

The grid module SHALL provide a generator for every `GridType` in
`ALL_GRID_TYPES`, reached through `gridNew(type, width, height, desc)`: the
periodic tilings, and the four aperiodic ones, which are Penrose P2 (kite and
dart), Penrose P3 (thick and thin rhombs), hats and spectres.

#### Scenario: Every periodic tiling builds a consistent grid

- **WHEN** any periodic tiling is built at a legal size
- **THEN** the grid is fully linked: every face's edges join its consecutive
  dots, every edge references one or two faces (a null face being the exterior),
  and every dot's edge and face rings are complete

#### Scenario: Every aperiodic tiling builds a consistent grid

- **WHEN** any aperiodic tiling is built at a legal size from a valid
  description
- **THEN** the grid is fully linked: every face's edges join its consecutive
  dots, every edge references one or two faces (a null face being the exterior),
  and every dot's edge and face rings are complete

### Requirement: Periodic generators are pure and integer-exact

Every periodic generator SHALL be a pure function of `(width, height)` and, for
triangular, its version desc. It SHALL consume no randomness and SHALL use exact
integer arithmetic only, because shared corner dots are deduplicated by exact
coordinate equality and a fractional coordinate would produce duplicate dots
with no visible error. An integer division SHALL truncate (`Math.trunc`) and
SHALL NOT yield a fraction.

#### Scenario: Periodic generation is deterministic and integer-exact

- **WHEN** the same periodic tiling is built twice at the same size
- **THEN** the two grids are identical in every dot coordinate, edge and face,
  and in the same order; and no dot coordinate is fractional

### Requirement: Face and dot emission order is stable across builds

Each periodic generator's face and dot emission order, and each aperiodic
generator's face emission order, SHALL be stable across builds, and not merely
the resulting shape: a stored Loopy description indexes its clues by face, so
reordering faces would give a stored game ID a different board.

#### Scenario: A generator's faces are reordered within a cell

- **WHEN** a tiling generator emits the same faces in a different order
- **THEN** that is a change of behavior, although the geometry is identical,
  because a stored description's clues now land on different faces

### Requirement: The triangular tiling honors its version desc

The triangular tiling SHALL support two algorithms, selected by its version
desc: an absent desc SHALL select the legacy generator, which leaves ragged
boundary ears, and the desc `"0"` SHALL select the current ear-trimmed one.

#### Scenario: Triangular honors its version desc

- **WHEN** the triangular tiling is built with no desc and again with the desc
  `"0"`
- **THEN** the two grids differ, the former retaining the ragged boundary and
  the latter being ear-trimmed

### Requirement: Grid size computation

The grid module SHALL provide `gridComputeSize(type, width, height)` returning
the tiling's natural `tileSize` and its `xExtent` and `yExtent`, as a pure
integer function of its arguments requiring no constructed grid, for every
tiling in `ALL_GRID_TYPES`. Consumers size their drawing surface from it.

#### Scenario: Size is computed without building a grid

- **WHEN** `gridComputeSize(type, w, h)` is called for any tiling
- **THEN** it returns integer `tileSize`, `xExtent` and `yExtent`

#### Scenario: A periodic grid's bounding box matches its reported extent

- **WHEN** a periodic tiling is built at `(w, h)`
- **THEN** its bounding box matches the extent `gridComputeSize` reports

### Requirement: Penrose and spectre grids are re-centered in their extent, and hat grids are not

A constructed Penrose or spectre grid SHALL be re-centered within the extent
`gridComputeSize` reports. A constructed hat grid SHALL NOT be re-centered, so
its bounding box will generally not equal its reported extent.

#### Scenario: A hat grid keeps the box that survived trimming

- **WHEN** a hat tiling is built
- **THEN** its bounding box is that of the dots that survived trimming, and no
  step shifts it to match the extent `gridComputeSize` reports

#### Scenario: A spectre grid's box is its reported extent

- **WHEN** a spectre or Penrose tiling is built at `(w, h)`
- **THEN** its bounding box has the width and height `gridComputeSize` reports

### Requirement: Nearest-edge hit testing

The grid module SHALL provide `gridNearestEdge(grid, x, y)` returning the edge
nearest a point, or null when no edge is close enough. The comparison SHALL be
strict, so that on an exact tie the lowest-index edge wins.

#### Scenario: A click near an edge selects it

- **WHEN** `gridNearestEdge` is given a point close to one edge of a grid
- **THEN** it returns that edge

#### Scenario: A click far from every edge selects nothing

- **WHEN** `gridNearestEdge` is given a point far from every edge
- **THEN** it returns null

### Requirement: Face incenter for label placement

The grid module SHALL provide `gridFindIncenter(face)` computing the center of
the largest circle inscribable in a face, the point at which a clue digit or
symbol most easily fits. It SHALL be computed lazily on first request and cached
on the face.

#### Scenario: The incenter lies inside its face

- **WHEN** `gridFindIncenter` is called on any face of any tiling, including
  concave and highly non-convex faces
- **THEN** the returned point lies strictly inside that face, admitting a circle
  of non-zero radius

#### Scenario: The incenter is cached

- **WHEN** `gridFindIncenter` is called twice on the same face
- **THEN** the second call returns the cached result without recomputing

### Requirement: The incenter is display-only

The incenter SHALL NOT influence any grid description, generation or solving,
and its exact coordinates SHALL NOT be treated as a surface to keep
byte-identical.

#### Scenario: A grid is described, generated on and solved

- **WHEN** a grid description is generated or validated, a loop is generated on
  a grid, or a board on it is solved
- **THEN** no face's incenter is computed or read, the only reader being the
  code that draws a label in the face

### Requirement: The incenter is rounded to the nearest integer point

The stored incenter SHALL be rounded to the nearest integer on each axis. It
SHALL NOT be computed as a truncation of `v + 0.5`, which rounds to nearest only
for a positive coordinate, and a grid's coordinates are negative over most of a
board.

#### Scenario: The best point has a negative coordinate

- **WHEN** the best point found for a face has the coordinate `-134.98`
- **THEN** the stored coordinate is `-135`, not `-134`

#### Scenario: The incenter admits nearly the largest circle the face allows

- **WHEN** the inscribed radius at the returned point is compared with the best
  inscribed radius over the integer points of the face, derived independently of
  the implementation
- **THEN** the shortfall is within the half-unit-per-axis the rounding step can
  cost, and the ratio is close to 1

### Requirement: Grid parameter validation

The grid module SHALL provide `gridValidateParams(type, width, height)`
returning an error message for a rejected size and null otherwise, for every
tiling in `ALL_GRID_TYPES`. It SHALL reject non-positive dimensions, sizes
that overflow the coordinate arithmetic for the given tiling, and sizes whose
count of cells, times what the tiling builds per cell, overflows. Per-type
minimum sizes are not part of this requirement: they are a property of the
consuming game, not of the geometry.

#### Scenario: An unreasonably large grid is rejected

- **WHEN** `gridValidateParams` is given a size whose extent would overflow
- **THEN** it returns an error message rather than attempting construction

#### Scenario: A grid of too many objects is rejected

- **WHEN** `gridValidateParams` is given a width and a height that each fit the
  coordinate arithmetic, and whose product does not fit the count of objects
  the tiling builds
- **THEN** it returns the same error message

#### Scenario: A legal size is accepted

- **WHEN** `gridValidateParams` is given a legal size for any tiling
- **THEN** it returns null

### Requirement: Aperiodic arithmetic is exact and rounds once

Each aperiodic generator's arithmetic SHALL be exact: Penrose in ℤ[√5],
spectres in ℤ[√3], hats in plain integers on a triangular lattice. The
irrational part SHALL be converted to integer pixels exactly once, at the
tiling-to-grid boundary, by `nTimesRootK`. The rational and irrational parts
SHALL be scaled separately and then summed, so that exactly one rounding occurs.

#### Scenario: A coordinate has a rational and an irrational part

- **WHEN** a spectre vertex `a + b√3` is converted to pixels at unit `u`
- **THEN** it is `a·u` plus `nTimesRootK(b·u, 3)`, and not `u` times a rounded
  `a + b√3`

### Requirement: No dot coordinate is negative zero

An aperiodic generator's dot coordinates SHALL be normalized so that no
coordinate is negative zero, because a negative zero produces a structurally
correct grid that nonetheless differs from the one the same description built
before.

#### Scenario: A signed basis vector sums to zero

- **WHEN** a Penrose vertex's pixel coordinate comes out as negative zero
- **THEN** the dot is given the coordinate zero

### Requirement: Legacy Penrose descriptions are rejected by name

A legacy Penrose grid description, one beginning with `'G'`, SHALL be rejected
with an explicit error naming it, and SHALL NOT fall through to a misleading
parse error.

#### Scenario: A legacy Penrose description is rejected

- **WHEN** `gridNew` or `gridValidateDesc` is given a Penrose description
  beginning with `'G'`
- **THEN** it reports an error identifying the description as an unsupported
  legacy format

### Requirement: Vigorous trimming of aperiodic patches

The grid module SHALL provide `gridTrimVigorously(grid)`, retaining only those
faces adjacent to a landlocked dot (one not touching the infinite exterior)
whose landlocked dots lie in the single largest connected component, then
compacting faces and dots in place, preserving relative order and renumbering
their indices densely. It SHALL run before incidence is derived, on faces that
know only their clockwise dots.

#### Scenario: A ragged patch is trimmed to its landlocked core

- **WHEN** `gridTrimVigorously` runs on a freshly generated aperiodic patch with
  a ragged boundary
- **THEN** faces not adjacent to any landlocked dot are removed, the remaining
  faces and dots are renumbered densely in their original relative order, and the
  grid then links up consistently

#### Scenario: Only the largest landlocked component survives

- **WHEN** trimming a grid whose landlocked dots form more than one connected
  component
- **THEN** only the faces selected by the largest component are retained

### Requirement: Trimming indexes directed adjacency, not a pairwise matrix

`gridTrimVigorously` SHALL be implemented as a directed-adjacency index over
dots and SHALL NOT build a dense pairwise matrix, which grows with the square of
the dot count in both time and space and is not viable in a browser at the sizes
the app supports.

#### Scenario: A dot is judged landlocked from its own neighbors

- **WHEN** trimming decides whether a dot is landlocked
- **THEN** it compares the dots that follow it around some face with the dots
  that precede it around some face, and the dot is landlocked when the two sets
  are equal

### Requirement: Trimming a patch with no landlocked dot is an error

`gridTrimVigorously` SHALL raise an error, and SHALL NOT return an empty grid,
when no landlocked component exists.

#### Scenario: A patch with no landlocked dots is an error

- **WHEN** trimming a grid in which no dot is landlocked
- **THEN** an error is raised rather than an empty grid returned

### Requirement: Seeded random loop generation

The engine SHALL provide `src/engine/loopgen.ts` exposing
`generateLoop(grid, board, rng, bias?)`, which colors every face of `grid`
inside (white) or outside (black) so that the white/black boundary is a single
closed loop, writing the coloring into `board`. Given a fixed seed, the
generated loop SHALL be reproducible across builds: no ordering in it SHALL
depend on anything but the random stream and, last, the face index.

#### Scenario: Loop generation yields a single closed loop

- **WHEN** `generateLoop` runs on a square grid with a fixed seed and no bias
- **THEN** the resulting white/black face coloring has a boundary that is one
  closed loop, and the same seed yields the same coloring every run

### Requirement: A bias callback steers loop generation

`generateLoop` SHALL accept an optional `bias` callback that lets a consumer
bias generation toward desirable loops. It SHALL be invoked with a face
tentatively set, then again with the face restored, and SHALL be notified when a
face is committed. The callback SHALL consume no randomness.

#### Scenario: A candidate is tried and put back

- **WHEN** `generateLoop` scores a candidate face with a `bias` callback
- **THEN** it calls the callback with the face colored, restores the face to
  uncolored and calls it again, and calls it once more for the face it commits

### Requirement: Grid descriptions round-trip and keep building the same grid

The grid module SHALL provide `gridNewDesc(type, width, height, rng)` producing
a grid description string, and `gridValidateDesc(type, width, height, desc)`
returning an error message for a rejected description and null otherwise.
`gridValidateDesc` SHALL reject a description supplied for a tiling that does
not use one.

#### Scenario: A generated description round-trips

- **WHEN** `gridNewDesc` produces a description for an aperiodic tiling
- **THEN** `gridValidateDesc` accepts it and `gridNew` builds a grid from it

#### Scenario: A malformed description is rejected rather than crashing

- **WHEN** `gridValidateDesc` is given an empty, truncated, or otherwise
  malformed description, including one too short to carry a coordinate count
- **THEN** it returns an error message, and no construction is attempted

#### Scenario: A square grid is given a description

- **WHEN** `gridValidateDesc` is given the description `"0"` for the square
  tiling
- **THEN** it returns an error message

### Requirement: gridNewDesc is the only function that consumes randomness

`gridNewDesc` SHALL be the only randomness-consuming function in the grid
module: `gridNew` SHALL be a deterministic function of
`(type, width, height, desc)`. `gridNewDesc` SHALL return `"0"` for the
triangular tiling and null for every other periodic tiling.

#### Scenario: A periodic tiling is asked for a description

- **WHEN** `gridNewDesc` is called for the honeycomb tiling
- **THEN** it returns null and draws nothing from `rng`

#### Scenario: Aperiodic construction is deterministic given a description

- **WHEN** the same aperiodic tiling is built twice from the same
  `(width, height, desc)`
- **THEN** the two grids are identical in every dot coordinate, edge and face,
  and in the same order, and no dot coordinate is fractional or negative zero

### Requirement: Aperiodic description generation is stable across builds

For the aperiodic tilings, description generation SHALL be a deterministic
function of the random stream and stable across builds. Its weight constants
SHALL be integers and SHALL NOT be recomputed from irrational expressions.

#### Scenario: Description generation is stable for a seed

- **WHEN** `gridNewDesc` is called for an aperiodic tiling with a given seed
- **THEN** the description string it produces matches the one the committed
  fixture records for that seed

### Requirement: The fallback generator behaves the same in every build

Where a stored description is replayed and its coordinates are exhausted, the
fixed-seed fallback generator SHALL behave the same in every build, created
lazily at the same point and shared thereafter, because divergence yields a
different grid for the same description with no detectable error.

#### Scenario: A description runs out of coordinates

- **WHEN** a grid is built twice from a description whose coordinates are
  exhausted partway through the patch
- **THEN** the fallback generator is created at the same step both times and
  the two grids are identical
