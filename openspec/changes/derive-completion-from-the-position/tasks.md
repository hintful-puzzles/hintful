## 0. Measure and decide

- [ ] 0.1 Re-take the four populations (proposal § "Task 0") by shape, and
      check the falsifier.
- [ ] 0.2 Ask the owner the open decision (proposal § "Decision for the
      owner"), with the census's count of games whose behavior it changes.

## 1. The engine derives the history

- [ ] 1.1 The midend caches `status` per history entry and derives the latch,
      the first-solved move and the solver-used move; refusals, the timer and
      the end-of-game dialog read them (`midend.test.ts`).
- [ ] 1.2 The win flash's trigger is the engine's; a game supplies a duration,
      and a flash per outcome where it has more than one.

## 2. Games migrate

- [ ] 2.1 One game end to end first (Fifteen: its sorted start is the case the
      shape exists for), then the rest: `status` from the board; `completed`,
      `cheated`, solve-move special cases and flash conditions removed.
- [ ] 2.2 A guard derives the migrated population from the state types and
      holds `status` to the position (a rebuilt state of the same position
      answers the same); prove it fails on a planted latch.

## 3. The words and the contract

- [ ] 3.1 The status bar's completion words become the engine's;
      `ALREADY_SOLVED` leaves `HintRefusal`.
- [ ] 3.2 Mines' hint (proposal § "Hints to pull in").
- [ ] 3.3 Spec deltas: replace "One completion vocabulary across games";
      `docs/games/mechanics.md`, `rendering.md` (the flash) and the engine
      catalog's `flash.ts` and `completion-status.ts` entries.
