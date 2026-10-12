# Tasks

## 1. Read and decide

- [ ] 1.1 Read the seven divisions in the proposal's table and Galaxies', and
      look for an eighth: any generator that builds a `Dsf` or a region
      label per cell. For each, what the game's rule is and what is only
      the walk.
- [ ] 1.2 Before changing a generator, measure what it deals today: for
      each game, time and success at every preset, and the spread of region
      sizes over a few hundred boards. This is what a move is judged
      against.
- [ ] 1.3 `design.md`: the module's interface in the two shapes, what a
      game passes, how Star Battle's rule (no region over its number of
      stars, exactly as many regions as the grid is wide) is said in it,
      and for each game whether it moves or stays, with the reason.

## 2. Build

- [ ] 2.1 The module, with tests of its own on hand-made rules: every cell
      in one region, every region connected, the rule never broken, and a
      rule that cannot be met reported and not looped on.
- [ ] 2.2 Move each game the design names, one at a time, against 1.2's
      measurements. Delete a frozen fixture a move leaves holding nothing.
- [ ] 2.3 Run each moved game in the browser and look at a dozen boards:
      regions a player would call worse are a failure whatever the tests say.

## 3. Close

- [ ] 3.1 The `engine-helpers` delta, re-read against the code; the catalog
      entry; the one way stated in `solver-and-generator.md`.
- [ ] 3.2 Gate, commit, archive, push.
