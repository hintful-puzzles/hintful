# candidate-plan-kit — tasks

Read `docs/games/hints.md` § "Continue from the last step" and § "Candidate-
elimination games", then each of the six games' `buildSteps`. The proposal's
list was noticed, not measured: confirm each idiom against the code first.

## 1. Survey

- [ ] 1.1 For each of the six games, write down how its `emitPlacement`, its rungs
      and its continuation tracking differ from the others, and say for each
      difference whether a game would legitimately want it (keep as a hook) or not
      (fold into the engine).

## 2. The kit, one piece at a time, each behavior-preserving

- [ ] 2.1 A candidate carries its step; the frontier reads `area ∪ targets` off it.
- [ ] 2.2 One engine placement emitter; the six games use it.
- [ ] 2.3 The driver owns journey continuation.
- [ ] 2.4 The standard rungs by default, with a game's own rungs placed in order.

## 3. Close

- [ ] 3.1 Spec delta modifying "A shared candidate-elimination hint-plan
      abstraction"; `docs/games/hints.md` and the engine catalog updated.
- [ ] 3.2 Run the app on two games before archiving.
