## 0. Measure

- [x] 0.1 Sort every game's `newState` (proposal § "Task 0"), count the
      callers of `validateDesc`/`newState` outside the midend by reference,
      and check the falsifier. (`design.md` § "Task 0, measured": the typed
      shape trips it, the derived shape does not.)

## 1. The engine owns the verdict

- [x] 1.1 `descValue` throws a `DescRejection`; `loadDesc` and `validateDesc`
      in `engine/desc-error.ts` derive the verdict from `Game.newState`;
      `Game.validateDesc` leaves the contract.
- [x] 1.2 The midend builds state 0 from the load that judged the desc, in
      `newGameFromId` and `loadGame`; `loadGame` refuses a save whose desc no
      longer loads (`midend.test.ts`, seen red against a fake that accepts the
      stale desc).
- [x] 1.3 Delete every game's `validateDesc` and the fakes'; repoint tests to
      the engine's `validateDesc(game, …)`. Loopy's generator keeps its own
      cheap self-check through `descVerdict(parseDesc(…))`.
- [x] 1.4 `docs/games/mechanics.md` § "Read a desc once", the engine catalog's
      `desc-error.ts` entry, and the spec delta say the engine owns the pair.
