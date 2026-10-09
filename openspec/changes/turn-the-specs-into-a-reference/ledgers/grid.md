# Ledger: grid

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Shared planar-grid data structure and deterministic square tiling

| Rule | Where it went |
| --- | --- |
| `Grid` with arrays of `GridFace`, `GridEdge` and `GridDot`, a bounding box and a `tileSize`, with full reference incidence in clockwise order and a null face for the exterior | spec: The grid is a planar structure with full reference incidence |
| The structure is immutable after construction and shared by reference, with no refcount | spec: A grid is immutable once built and shared by reference |
| Immutability reconciled with the incenter the same spec caches on a face after construction | spec: A grid is immutable once built and shared by reference |
| GC replaces `grid_free` | history |
| `gridNewSquare(width, height)` is deterministic, with no randomness and no floating point, one four-dot face per cell, `tileSize = 20`, corner dots deduplicated | spec: The square tiling is built deterministically |
| `makeConsistent` derives the edges, the per-face edge lists, the per-dot rings and the bounding box | spec: makeConsistent derives the incidence from the faces' dots |
| All ordering tie-breaks are by array index | spec: makeConsistent derives the incidence from the faces' dots |
| `src/engine/grid/index.ts` is a barrel whose doc comment tells callers to import from it, with the parts beside it | spec: The grid module is imported through its barrel |
| The list of the part files by name | held: src/engine/grid/index.ts "import from this module, not from the" |
| The barrel status is load-bearing because the probe counts a barrel import as a local test of every part | spec: The grid module is imported through its barrel |
| Scenario: a square grid has the expected incidence | spec: The square tiling is built deterministically |
| Scenario: square construction is deterministic | spec: The square tiling is built deterministically |

## Periodic tilings

| Rule | Where it went |
| --- | --- |
| A generator for each periodic tiling, named, selected by a `GridType` | spec: Periodic tilings |
| There are 14 of them | figure |
| Each is a pure function of `(width, height)` and, for triangular, its version desc, with no randomness and exact integer arithmetic only, and integer division truncates | spec: Periodic generators are pure and integer-exact |
| Face and dot emission order is stable across builds, since a Loopy description indexes its clues by face | spec: Face and dot emission order is stable across builds |
| Triangular supports both algorithms by its version desc, absent for the legacy one and `"0"` for the ear-trimmed one | spec: The triangular tiling honors its version desc |
| Both algorithms are upstream's | history |
| Scenario: every periodic tiling builds a consistent grid | spec: Periodic tilings |
| Scenario: periodic generation is deterministic and integer-exact | spec: Periodic generators are pure and integer-exact |
| Scenario: triangular honors its version desc | spec: The triangular tiling honors its version desc |

## Grid size computation

| Rule | Where it went |
| --- | --- |
| `gridComputeSize(type, width, height)` returns `tileSize`, `xExtent` and `yExtent` as a pure integer function needing no grid, for every tiling, and consumers size their surface from it | spec: Grid size computation |
| "All 18 tilings" as a count | figure |
| Penrose and spectre grids are re-centered within the reported extent, and a hat grid deliberately is not | spec: Penrose and spectre grids are re-centered in their extent, and hat grids are not |
| Scenario: size is computed without building a grid | spec: Grid size computation |
| Scenario: a periodic grid's bounding box matches its reported extent | spec: Grid size computation |

## Nearest-edge hit testing

| Rule | Where it went |
| --- | --- |
| `gridNearestEdge(grid, x, y)` returns the nearest edge or null, with integer eligibility, a floating-point distance comparison and a strict comparison so the lowest index wins a tie | spec: Nearest-edge hit testing |
| Both scenarios | spec: Nearest-edge hit testing |

## Face incenter for label placement

| Rule | Where it went |
| --- | --- |
| `gridFindIncenter(face)` computes the center of the largest inscribable circle, lazily and cached on the face | spec: Face incenter for label placement |
| The incenter is display-only, influences no description, generation or solving, and its coordinates are not byte-parity surface | spec: The incenter is display-only |
| The stored point is rounded to the nearest integer on each axis, and the truncating `v + 0.5` form is not reproduced | spec: The incenter is rounded to the nearest integer point |
| The truncating form was upstream's, and C's conversion truncates toward zero | history |
| It costs up to 1.229 units of radius where rounding costs 0.053, over every face of all eighteen tilings | figure; held: src/engine/grid/grid-geometry.ts "Measured over every face of all 18 tilings" |
| Quality is asserted against the largest circle independently computable at an integer point, not against another implementation | spec: The incenter's quality is asserted against an independent optimum |
| That is how the truncation survived for as long as it did | history |
| Scenario: the incenter lies inside its face | spec: Face incenter for label placement |
| Scenario: the incenter admits nearly the largest circle, and the sweep enumerates `ALL_GRID_TYPES` | spec: The incenter's quality is asserted against an independent optimum |
| Scenario: the incenter is cached | spec: Face incenter for label placement |

## Grid parameter validation

| Rule | Where it went |
| --- | --- |
| `gridValidateParams(type, width, height)` returns an error message or null for every tiling, rejecting non-positive and overflowing sizes | spec: Grid parameter validation |
| Per-type minimum sizes are deliberately not part of the requirement, being the consuming game's, which is a statement of scope and not a prohibition | spec: Grid parameter validation |
| "All 18 tilings" as a count | figure |
| Both scenarios | spec: Grid parameter validation |

## Aperiodic tilings

| Rule | Where it went |
| --- | --- |
| A generator for each of Penrose P2, Penrose P3, hats and spectres, selected by the same `GridType` | spec: Aperiodic tilings |
| Completing the collection at 18 tilings | figure |
| Each is a pure deterministic function of `(width, height, desc)`, with all randomness confined to description generation | spec: Aperiodic generators are deterministic functions of their description |
| Arithmetic is exact in its ring, converted to pixels once by `nTimesRootK`, with the rational and irrational parts scaled separately and summed | spec: Aperiodic arithmetic is exact and rounds once |
| No coordinate is negative zero | spec: No dot coordinate is negative zero |
| Dot deduplication by exact coordinate equality as the reason for it | reason |
| Face emission order is stable across builds | spec: Face and dot emission order is stable across builds |
| A legacy Penrose description beginning with `'G'` is rejected with an explicit error naming it | spec: Legacy Penrose descriptions are rejected by name |
| "Pre-rewrite" as the description of the legacy format | history |
| Scenario: every aperiodic tiling builds a consistent grid | spec: Aperiodic tilings |
| Scenario: aperiodic construction is deterministic given a description | spec: Aperiodic generators are deterministic functions of their description |
| Scenario: a legacy Penrose description is rejected | spec: Legacy Penrose descriptions are rejected by name |

## Vigorous trimming of aperiodic patches

| Rule | Where it went |
| --- | --- |
| `gridTrimVigorously(grid)` keeps the faces adjacent to a landlocked dot of the largest component, compacts in place in order with dense indices, and runs before incidence is derived | spec: Vigorous trimming of aperiodic patches |
| It is a directed-adjacency index over dots and not a dense pairwise matrix, which is quadratic in dots and not viable in a browser | spec: Trimming indexes directed adjacency, not a pairwise matrix |
| Upstream's matrix stores a face index that is never read back | history; held: src/engine/grid/grid-trim.ts "the stored face index is never read" |
| It raises an error and returns no empty grid when no landlocked component exists | spec: Trimming a patch with no landlocked dot is an error |
| Scenario: a ragged patch is trimmed to its landlocked core | spec: Vigorous trimming of aperiodic patches |
| Scenario: only the largest landlocked component survives | spec: Vigorous trimming of aperiodic patches |
| Scenario: a patch with no landlocked dots is an error | spec: Trimming a patch with no landlocked dot is an error |

## Seeded random loop generation

| Rule | Where it went |
| --- | --- |
| `src/engine/loopgen.ts` exposes `generateLoop(grid, board, rng, bias?)`, coloring every face so the boundary is one closed loop, written into `board` | spec: Seeded random loop generation |
| Candidates are ordered by score, random score field, then face index | spec: Loop generation orders candidates by the random stream alone |
| The optional `bias` callback is called tentative, restored and on commit, and consumes no randomness | spec: A bias callback steers loop generation |
| A fixed seed's loop is reproducible across builds | spec: Seeded random loop generation |
| Because a seeded Loopy game ID regenerates its board from it | reason |
| Scenario: loop generation yields a single closed loop | spec: Seeded random loop generation |

## Grid descriptions round-trip and keep building the same grid

| Rule | Where it went |
| --- | --- |
| `gridNewDesc` produces a description and `gridValidateDesc` returns an error message or null | spec: Grid descriptions round-trip and keep building the same grid |
| `gridValidateDesc` rejects a description for a tiling that uses none | spec: Grid descriptions round-trip and keep building the same grid |
| `gridNewDesc` is the only randomness-consuming function in the module, and returns `"0"` for triangular | spec: gridNewDesc is the only function that consumes randomness |
| It returns null for the other twelve periodic tilings | untrue: `PERIODIC_GRID_TYPES` in `src/engine/grid/grid-tilings.ts` lists fourteen tilings, so thirteen besides triangular get null from the `default` arm of `gridNewDesc` in `src/engine/grid/grid-desc.ts`, and the requirement now says every other periodic tiling |
| Aperiodic description generation is a deterministic function of the random stream and stable across builds, with integer weight constants not recomputed from irrationals | spec: Aperiodic description generation is stable across builds |
| So a seeded game ID keeps its grid | reason |
| The fixed-seed fallback generator behaves the same in every build, created lazily at the same point and shared | spec: The fallback generator behaves the same in every build |
| Parsing validates the length before deriving a coordinate count | spec: Description parsing checks length before counting coordinates |
| Scenario: a generated description round-trips | spec: Grid descriptions round-trip and keep building the same grid |
| Scenario: description generation is stable for a seed | spec: Aperiodic description generation is stable across builds |
| Scenario: a malformed description is rejected rather than crashing | spec: Grid descriptions round-trip and keep building the same grid |
