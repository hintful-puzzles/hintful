# derive-solos-region-names

## Why

`share-the-latin-candidate-plan` set out to generalize a derivation it believed
Solo already had. Measured 2026-09-20: **Solo does not have it.**

`src/games/solo/index.ts` holds two statements of the same fact, twelve lines
apart, with nothing holding them together:

- `regionsOf(state, x, y)` **builds** the cell's no-repeat regions — row,
  column, sub-block, the X diagonals the cell lies on, then the Killer cage.
- `noRepeatRegionNames(state, at?)` **names** them, from a hand-written
  `["row", "column", "block"]` plus `"diagonal"` if `xtype` and `"cage"` if
  Killer.

They agree today. Nothing makes them: no test reads both, and neither is
exported, so a behavioral test cannot reach them either. Add a region to one and
the other goes quietly wrong — and what goes wrong is a **sentence a player is
asked to trust**: `say.dup` cites the regions a placed digit was just culled
from, and `say.cleanObvious` cites the regions the opening clean swept. A list
that has drifted names a region the cull did not touch, or omits one it did.

This is `AGENTS.md` § "Convention over configuration": a statement *about* a game
that only a sentence reads, beside the declaration it paraphrases. The
enrollment shape the repo has reversed three times, at the scale of one game.

## What changes

Solo's region names come from the regions themselves. The shape is the change's
one real decision, and the constraints are known:

- **The cage carries no name, deliberately.** It is declared
  `holdsEvery: false` and untagged so the type refuses a partial region declared
  as whole (`ts-engine`, "A cell's regions are one definition per relation").
  Tagging it with a `SoloRegion` would widen a union whose consumers —
  `regionName`, `hiddenSingle`, `intersect`, `set`, the forcing arms — are
  exhaustive switches that must never see a cage. So the name goes somewhere
  that is not `SoloRegion`.
- **Two diagonals are one word.** A cell on both X diagonals declares two
  regions and the sentence says "diagonal" once; the derivation dedups by name,
  not by region.
- **The `at`-less call is a union over the board**, not one cell's answer:
  `say.cleanObvious` speaks for every cell at once, which is why a cell off the
  diagonals must still yield "diagonal" on an X board.

Whatever shape it takes, a test SHALL assert the two agree for every cell of a
board carrying every optional region (X + Killer), so the guard measures the
invariant rather than a neighbor of it.

## What this does not do

- **Not the row/column family.** `share-the-latin-candidate-plan` removed the
  region phrase there structurally: a game on `runLatinCandidatePlan` cannot
  state the phrase at all. Solo cannot take that preset — its hidden singles
  name a block or a diagonal — so this is the other half, and only Solo's.
- **Not a new engine contract.** If the name wants to live on `CellRegion`,
  that is a bigger claim than one game's duplication supports; make it only if a
  second game turns up wanting it.
