# assert-deduction-runs-out-only-on-unreasonable — tasks

## 1. Before building

- [ ] 1.1 Find what the player sees when `hint()` throws through the worker.
- [ ] 1.2 Take the population of `DEDUCTION_EXHAUSTED` call sites by reference
      and check each is deduction-complete below `Unreasonable`.
- [ ] 1.3 Check whether any game's annotation mistake can end in exhaustion.

## 2. Build

- [ ] 2.1 Extract `permitsSearch` into an engine helper; point
      `hint-resume.test.ts` at it.
- [ ] 2.2 Throw from `Midend`'s hint path on `DEDUCTION_EXHAUSTED` outside an
      `Unreasonable` tier, with the game id and tier in the message.
- [ ] 2.3 Pin the owner's board under an Easy-pinned full id; prove red.
- [ ] 2.4 Spec delta on `ts-engine` for the hint-refusal requirement.
- [ ] 2.5 Run the app on the pinned board and confirm what the player sees.
