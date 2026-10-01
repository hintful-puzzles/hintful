## 0. Measure and decide

- [x] 0.1 Re-take the four populations (proposal § "Task 0") by shape, and
      check the falsifier (design.md § "Task 0": it does not fire).
- [x] 0.2 Ask the owner the open decision, with the census's count of games
      whose behavior it changes (proposal § "Decided": solved now, everywhere,
      the timer included).

## 1. The engine derives the history

- [x] 1.1 The midend caches `status` per position; refusals, the timer and the
      end-of-game dialog read the board's status now, and the timer latch
      (`timerStopped`, in the midend and the save) is gone (`midend.test.ts`).
- [x] 1.2 The win flash's trigger is the engine's (`solvedFlash` for the
      duration); `flashLength` stays for flashes the status does not show.

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
