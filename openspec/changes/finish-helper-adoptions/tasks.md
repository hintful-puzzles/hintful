## 1. Params

- [x] 1.1 For the 24 holdouts, record why each hand-writes its codec; widen
      `paramsCodec` where several share a missing shape.
      2026-11-20: the reasons were already recorded. `engine-params`, "A
      params encoding the grammar does not fit stays hand-written", sorted
      them in `declare-params-in-one-place` (its tasks.md § 4 names each
      game's reason) and declined a one-game option for Ascent and Subsets.
      Twenty still escape the grammar. No shape is shared by several of them
      and missing from it: a tail in any order is a spec'd behavior of
      seven games, not a gap. `params-codec.ts`'s header now names every
      escape category.
- [x] 1.2 Migrate; the params-stability snapshots and upstream descs stay
      unchanged (diff the snapshot files, not only the suite's result).
      Four fit: Untangle (`size`), Keen (`size`, `choice`, `flag`), and
      Unequal and Adjacent through `edgeClueParams`, which now declares both
      games' fields and codec, with Adjacent's upstream `a` as an
      `unusedLetter`. Snapshot file unchanged; the guard was seen to fail on
      a planted Keen defect. An old-against-new differential of 3,469
      strings (presets, truncated, with junk) differed on 12, none an
      encoder writes: a string with no leading number now reads as size 0
      and is refused by the bounds, as upstream's `atoi` does, where it used
      to open the default board; and Adjacent's `5a1`, which the old
      splice read as order 51, is refused.
- [x] 1.3 Derive `validateParams` bounds from `paramConfig` where they
      only restate it. `paramsError` already checks the bounds before
      `validateParams`, so a restatement was dead: Path's and Wordtrail's
      are removed, and Same Game's color minimum moves into its bounds
      (delta in `specs/samegame`). Sticks', Light Up's and Separate's hold
      only when generating, which bounds cannot say, so they stay
      (`docs/mechanics.md` already says so).

## 2. Mistakes and solve

- [ ] 2.1 Migrate answer-comparing `findMistakes`, `clearMistakes` and
      `revealOne` onto `entryMistakes`, `clearEntries` and `revealEntry`.
      A game whose mistakes are not answer comparisons keeps its own.
- [ ] 2.2 Migrate `solve` onto `solveFromAnswer` where it only replays the
      answer; default the one-line `solveAtCap`.

## 3. Tests and input

- [ ] 3.1 Move the 8 hand-rolled differentials onto `describeDescDifferential`.
- [ ] 3.2 Sort the 34 `interpretTargetVerbs` holdouts by input shape;
      migrate those of the target-and-verb shape, and run each in the app
      with mouse, touch and keyboard.

## 4. Finish

- [ ] 4.1 Guides describe only the helper. Run `npm run test:hint-sweeps`;
      commit, push, archive.
