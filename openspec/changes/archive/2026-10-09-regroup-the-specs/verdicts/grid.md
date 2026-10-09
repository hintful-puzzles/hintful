# Verdicts: grid

## keep `grid`: Aperiodic description generation is stable across builds

Not `port`. A seed's description is no promise to a player (docs/doctrine.md,
"The app hands out boards, never seeds"), but the requirement binds the code
today on two counts: `src/engine/grid/__fixtures__/grid-aperiodic-c-reference.json`
is retained under `testing`, "A C-recorded fixture is kept for what cannot be
derived, not as a quality bar", as the regression net for refactoring the
tilings, and the integer-weights rule is what keeps generation a function of
the random stream and not of a float. A deliberate change re-founds the
fixture under that `testing` requirement and needs no ask.

## keep `grid`: No dot coordinate is negative zero

Something outside the tests can tell: `src/games/loopy/notes.ts` takes
`Math.atan2(far.y - dot.y, far.x - dot.x)` over dot coordinates, and `atan2`
reads the sign of a zero (`-0 - 0` is `-0`, and `atan2(-0, -1)` is `-π` where
`atan2(0, -1)` is `π`). `===`, the dedup key and `Map` lookup are blind to it,
as the doubt says, but an angle is not, so the normalization is not a rule
only its own test would consult.

## keep `grid`: Seeded random loop generation

The ordering clause is live whatever a seed promises: it forbids an order that
depends on anything but the random stream and the face index (a container's
iteration order, an unstable sort), which is what makes a generator test and
Loopy's description differential (`src/games/loopy/loopy-differential.test.ts`)
repeatable. "Across builds" is the
same regression net as the aperiodic descriptions, not a promise to a player.
The catalog's "Byte-match critical" for `loopgen.ts` is the stale part; the
`random` verdicts carry a note for it.

## keep `grid`: Penrose and spectre grids are re-centered in their extent, and hat grids are not

The tree treats the hat exception as a decision: `gridComputeSize` in
`src/engine/grid/grid-tilings.ts` says the asymmetry "is upstream's and is
deliberate — don't 'fix' it by adding a recentering step", and
`tilings/hat-grid.ts` lists it as one of two deliberate differences. Whether
anyone would defend it or not, it is what the helper does, and whoever sizes a
drawing surface from `gridComputeSize` must know a hat grid's box is not that
extent.

## keep `grid`: The incenter is rounded to the nearest integer point

Not `particular`: it is a deliberate difference from upstream's
`(int)(v + 0.5)`, which the prune brief keeps, and docs/test-strength.md § 4a
tells it as the worked example of a method, not as a rule about the grid. A
session touching `gridFindIncenter` would check its change against this.
