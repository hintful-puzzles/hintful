# own-region-division-in-the-engine

**Status: scaffolded 2026-10-12, not started.** Filed on the owner's word the
same day: dividing a grid into regions of unequal size is a shared concern,
and the engine is to own it. It comes before `add-starbattle`, which is its
first new user.

## Why

`src/engine/divvy.ts` divides a rectangle into regions of one size, and
`redivide.ts` mends such a division. A game whose regions differ in size
writes its own division, and at least six do, by `generator.ts` as read on
2026-10-12:

| Game | Function | How it divides |
| --- | --- | --- |
| Rome | `generateRegions` | Shuffles every pair of adjacent squares and merges the pair's regions in a `Dsf` unless a rule of the game forbids it (two of one arrow, a goal) |
| Keen | in `newKeenDesc` | Random dominoes, then each remaining single square folded into a neighbor under a largest size |
| Solo, Killer | `genKillerCages`, `mergeSomeCages` | Pairs laid in reading order, then cages merged |
| Filling | `mergeOnes` | Single squares absorbed into a neighbor under a largest size |
| Seismic | `growRegions` | A seed at the most hemmed-in free square, grown to a size drawn for it |
| Map | `genmap` | A number of seeds placed, then grown until the grid is full |

Galaxies also ends with unequal regions, each symmetric about its dot, and
is read for whether it is the same concern or its own.

Two shapes cover the six: **merge neighbors while the game allows it**, and
**seed and grow**. What differs between games is a rule (may these two
merge, how large may this grow) and never the walk. Star Battle would be the
seventh copy: stars are placed, then regions are merged around them so that
none holds more stars than the board's number.

## What Changes

- **An engine module divides a grid into unequal regions**, in the two
  shapes, with the game supplying its rule as a predicate or a size. It
  returns what `divvy.ts` returns, so a caller reads one kind of division.
- **The games that fit move onto it.** Moving one changes which board a
  seed deals, which breaks nothing a player holds, and retires that game's
  frozen fixture where the fixture then holds nothing
  (`docs/games/testing.md` § "The frozen differentials"). Each move is
  judged by the boards it deals: the same sizes dealt, in the same time or
  less, with regions a player would not call worse. A game that does not
  fit keeps its own and the design says what it would legitimately want to
  do differently.
- The catalog and `solver-and-generator.md` name it as the one way.

Not in this change: `divvy.ts`'s equal division, and Star Battle itself.

## Capabilities

### Modified Capabilities

- `engine-helpers`: a requirement for the division of a grid into regions.

## Impact

`src/engine/`, the generators above and their fixtures,
`docs/games/engine-catalog.md`, `docs/games/solver-and-generator.md`.
