# Design: a board beyond the Latin square

Read 2026-11-01 at `e8805ac4`. Line numbers are as of then.

## The shape today

A compiled technique reads `Marks` (`engine/describe-runtime.ts`) and a
`GridSpace`. Two classes implement `Marks`, both over upstream's candidate
cube: `LatinSolver` (`engine/latin.ts`) and Solo's `SolverUsage`
(`solo/solver.ts`). Each owns its own:

- **place propagation**: `LatinSolver.place` runs the library's `placed`
  (rows and columns only); Solo's `place` strikes row, column, box and
  diagonals by hand and records nothing.
- **pairing**: `compiledRung`/`uncluedRung` take a `LatinSolver`; seven
  tables repeat the five `latin.* → LATIN_RUNGS[…]` rows; Solo pairs through
  its private `fire`.
- **runner**: `latinRung` groups the ladder by tier, one `DeductionTechnique`
  a tier, capped by one `maxdiff`; Solo's `ladder()` makes one a technique,
  capped and graded per scale, with `from` and `until`, and brings its
  working cages up to date before each killer technique.

## Decisions

**One store, owned by the engine.** `engine/ladder-runtime.ts` holds
`CellMarks`, a candidate bitmask and a value per cell over a `GridSpace`, with
the recorder, the step budget and the firing group. It implements `Marks`,
makes a compiled firing's facts (`applyFacts`), and on each placement runs
the ladder's `on: place` techniques, recording their strikes as `dup`.
`LatinSolver` and Solo's solver extend it and keep only what no description
states: the forcing chain and the recursion, which are a Search, and Solo's
killer working cages. The cube goes, but for `writeCube`, which writes it
for the two generators that read it (Unequal's, Salad's); a test reads
`has(c, n)`.

*Why a class and not a plain record*: the store is what a compiled technique
is handed (`b: Marks`), and the solvers that keep a Search extend it, so the
search reads the same marks the ladder does with no copy between.

**The runner is Solo's, generalized.** `ladderTechniques(store, ladder,
caps, grades)` makes one `DeductionTechnique` a ladder entry, in the
description's order, keeping an entry only where its scale's cap reaches its
tier and its `from`, and not its `until`; a firing raises its scale's grade.
The Latin games' ladders are listed in tier order (checked 2026-11-01, every
compiled module), so one technique an entry fires exactly as one a tier did;
the forcing chain is appended last at the recursive tier, where the per-tier
runner ran it after the tier's techniques.

**The library is paired by the engine.** A game's pairing table is a
`Record` over its own ids only (`OwnId<LadderId>` excludes `latin.*`), and
`describedLadder(module.ladder, own, dealt)` takes the library's from
`LIBRARY_RUNGS`. A technique the description adds and the game does not pair
is still a type error.

**`placed` over every unit.** The library's `placed` binds the units holding
the placed cell (`u in units where c in cells(u)`), so Solo's boxes and
diagonals and Seismic's areas are struck by it. The strikes land in another
order than the column-then-row of today; the hint walk reads a placement's
cull off `reach`, not the recording (`availableFirings`), so the order of
`dup` records reaches no step, which the unchanged traces bear out.

**The space is declared by the description, and built from what the module
exports.** A compiled module exports `units`, the description's in its order,
and the engine's `describedSpace(units, w, h, parts)` builds the `GridSpace`,
cached per partition as `sudokuSpace` was. A unit list without `rows` and
`cols` makes them plain lines (Unruly, whose list is empty).

**Seismic's areas are a dealt partition, not units.** The soundness checker
builds a partition among the units only from `blocks(a, b)`, so areas as units
would go unchecked, as Solo's Jigsaw does; and an area's rule is its own (1 to
its size, not every value). Its own on-place technique, `cull`, strikes a
placed number from its area and its reach. The keep-apart rule's mode is a
size the board deals (`mode`), since a ruleset may replace only `space` and
the compiler reads every variation at once.

**A domain is a cell's where it reads `c`.** Seismic's answer domain is
`range(1, |cells(area(c))|)`: the module exports `domainOf`, the store seeds
each cell from it, the checker bounds each cell's answer and marks by it, and
`domain` alone is refused in a technique. Solo's `c` is a size, so a domain
reads a cell only where no size is named `c`.

**Solo's working cages stay Solo's, as a hook the runner calls.** They are
brought up to date before each killer technique, and the strikes that makes
reach every later technique; stating them as `placed` over the cages would
move those strikes to the placement and what a hint shows between. The
runner's `before(entry)` hook, which only Solo passes, keeps them as they
were (Solo's trace unchanged).

**A described game's hint records from the compiled ladder.** Seismic records
into `runCandidatePlan`'s `record`, as every candidate game, and leads with its
placements, since its one strike is Normal's. Unruly, which has no notes,
walks the firings with the engine's `ladderWalk`: each compiled rung also lists
every firing it could make (`Rung.firings`), and the walk takes the one that
continues from its last steps, never one harder than the ladder's next. The
hand-written plans' `singleFirings` and `SweepOffers` leave both games.

**The checker grows a region where a world has no answer.** With areas of
three on a 4×4, no Tectonic board has an answer; such a world is checked with
regions one cell larger (`regionCells`), which costs Seismic about 30 s a
technique where every world at four cost Keen its heap.

## What the comparison measures

For Unruly and Seismic, on every preset and three seeds each, as
`trace-latin.test.ts` writes them: the board each deal gives and each hint
step's rung, move and words, before and after; on a corpus of 400 boards
(`tiers-described.test.ts`), each board's verdict at every cap; and on the
fixtures, whether each board still solves at its tier. `report.md` says what
moved.
