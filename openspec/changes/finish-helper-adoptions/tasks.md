## 1. Params

- [ ] 1.1 For the 24 holdouts, record why each hand-writes its codec; widen
      `paramsCodec` where several share a missing shape.
- [ ] 1.2 Migrate; the params-stability snapshots and upstream descs stay
      unchanged (diff the snapshot files, not only the suite's result).
- [ ] 1.3 Derive `validateParams` bounds from `paramConfig` where they
      only restate it.

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
