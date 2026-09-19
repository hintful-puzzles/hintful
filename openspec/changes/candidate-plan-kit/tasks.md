# candidate-plan-kit — tasks

Read `docs/games/hints.md` § "Continue from the last step" and § "Candidate-
elimination games", then each of the six games' `buildSteps`. The proposal's
list was noticed, not measured: confirm each idiom against the code first.

## 1. Survey

- [x] 1.1 For each of the six games, write down how its `emitPlacement`, its rungs
      and its continuation tracking differ from the others, and say for each
      difference whether a game would legitimately want it (keep as a hook) or not
      (fold into the engine). — `design.md` § 1.

## 2. The kit, one piece at a time

- [x] 2.1 A candidate carries its step; the frontier reads `area ∪ targets` off it.
      — a firing is legs, the walk builds the steps and reads them.
- [x] 2.2 One engine placement emitter; the six games use it.
- [x] 2.3 The driver owns journey continuation. — by emitting a firing whole;
      `lastStrikeGroup` is gone from all three games.
- [x] 2.4 The standard rungs by default, with a game's own rungs placed in order.
- [x] 2.5 Measure every plan before and after (plan dump, `planContinuity`) and
      explain what moved. — `design.md` § 3.

## 3. Close

- [x] 3.1 Spec deltas ("A shared candidate-elimination hint-plan abstraction"
      replaced, "A candidate hint plan continues…" modified); `docs/games/hints.md`
      and the engine catalog updated.
- [ ] 3.2 Run the app on two games before archiving.
