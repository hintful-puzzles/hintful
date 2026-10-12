# Tasks

## 1. Read and decide

- [x] 1.1 Read the seven divisions in the proposal's table and Galaxies', and
      look for an eighth: any generator that builds a `Dsf` or a region
      label per cell. For each, what the game's rule is and what is only
      the walk. No eighth; the table is in `design.md`.
- [x] 1.2 Before changing a generator, measure what it deals today. For the
      three that move, every preset at twelve seeds, 432 boards, recorded
      as descriptions and compared after the move: none differs. The three
      that stay were not measured, since nothing of theirs changed.
- [x] 1.3 `design.md`: the module's interface, what a game passes, how Star
      Battle's rule is said in it, and for each game whether it moves or
      stays, with the reason. Three walks, not two, and a fourth for a merge
      toward a count, which Star Battle's rule turned out to need.

## 2. Build

- [x] 2.1 The module, with tests of its own on hand-made rules: every cell
      in one region, every region connected, the rule never broken, and a
      rule that cannot be met reported and not looped on. Each test was seen
      to fail on a planted defect.
- [x] 2.2 Move each game the design names: Rome, Map and Seismic, with their
      boards unchanged. No fixture is left holding nothing, so none is
      deleted.
- [x] 2.3 Look at a dozen boards of each moved game in the browser. Not
      done, and not needed: no description changed, so the regions on screen
      are the ones dealt before (`design.md` § "Measured, for the three that
      moved").

## 3. Close

- [x] 3.1 The `engine-helpers` delta, re-read against the code; the catalog
      entry; the one way stated in `solver-and-generator.md` § "A division
      into regions is the engine's", and named on the route in
      `new-game.md`.
- [x] 3.2 Gate, commit, archive, push.
