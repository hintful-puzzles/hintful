## 0. Measure

- [x] 0.1 The uncapped run: failures per game, and accepted mutants per game.

  Every leaf preset of all 57 games, every one-edit mutant, loaded through
  `Midend.newGameFromId` and drawn once (2026-10-01, under heavy swap):
  **no failure in any game**. Accepted mutants per game ranged from 0
  (Clusters, Dominosa, Guess, Sixteen, Unruly, whose validators refuse every
  one-edit change) to 6,381 (Crossing), 50,586 in all.

  The power argument, which the clean result owes: the same mutants with
  every `validateDesc` replaced by one accepting everything, built with
  `newState` and drawn. 21 games threw on some mutant (Boats, Cube,
  Dominosa, Flood, Galaxies, Group, Inertia, Keen, Loopy, Magnets, Mathrax,
  Salad, Signpost, Singles, Slide, Sokoban, Solo, Subsets, Undead, Unequal,
  Untangle). The other 36 built and drew every mutant, the empty desc
  included, so for them a clean run says nothing about agreement. A third
  measurement, an accepted mutant building a state identical to the
  original's, found the validators of 26 games accepting characters their
  parsers ignore. It is not a pass/fail oracle (`00` for `0` is legitimate),
  so it went to `read-descs-through-one-cursor` as evidence for reading a
  desc once, with the list.

## 1. Fix

- [x] 1.1 Every game whose `newState` throws on a desc its `validateDesc`
      accepts: tighten `validateDesc`, with a test pinning that desc.

  None did, so there was nothing to tighten.

## 2. Guard

- [x] 2.1 The capped cross-game test, with its vacuity count and the cap's
      reach stated.

  `desc-error-games.test.ts`, "a near-miss game ID": one case per game,
  every mode on its smallest board (all presets in the slow tier), 150
  mutants per board at an even stride; a floor of 4,000 accepted mutants
  collection-wide (4,668 when written). Planting an accept-everything
  validator in Dominosa turned its case red, naming the ID; cutting the
  mutator to one mutant per desc turned the floor red.

- [x] 2.2 `docs/games/mechanics.md` § "The two scans have to agree, and
      nothing makes them" names the test.

## 3. On the way

- [x] 3.1 The preset-population helpers (`firstLeaf`, `leafPresets`,
      `presetAxes`, `axisSlice`) move from `testing/hint-games.ts` to
      `testing/presets.ts`, which reads no registry; `difficulty-contract`'s
      private copies of three of them go.
- [x] 3.2 One `REGISTERED_GAMES` list and one `REGISTERED_GAME_COUNT`, in
      `testing/enrollment.ts`, in place of `PARAMS_GAMES` and two counts. Two
      assertions comparing the list's length to the count are deleted; both
      were sized by the same registry walk and could not fail.
