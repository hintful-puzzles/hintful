## 0. Measure

- [ ] 0.1 Sort every game's `newState` (proposal § "Task 0"), count the
      callers of `validateDesc`/`newState` outside the midend by reference,
      and check the falsifier.

## 1. If it holds

- [ ] 1.1 `Game.parseDesc` in `engine/game.ts`; the midend derives the
      verdict and builds state 0 from one parse.
- [ ] 1.2 Port every game, deleting its `validateDesc`.
- [ ] 1.3 `docs/games/mechanics.md` § "Read a desc once" and the engine
      catalog's `desc-reader.ts` entry say the engine owns the pair.

## 1'. If it does not

- [ ] 1'.1 The no-go, with its counts, in `desc-error.ts`'s header beside
      `DescParse`, and the change archived as a finding.
